import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, MessageCircle, StickyNote } from 'lucide-react-native';
import { useChatMessagesByProjectId, useChatMessagesByContractId, useSalesNotesByProjectId, useSalesNotesByContractId, useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';

interface ChatTabProps {
  projectId?: string;
  contractId?: string;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'acum';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}z`;
  
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

export default function ChatTab({ projectId, contractId }: ChatTabProps) {
  const projectMessages = useChatMessagesByProjectId(projectId);
  const contractMessages = useChatMessagesByContractId(contractId);
  const messages = contractId ? contractMessages : projectMessages;
  
  const projectSalesNotes = useSalesNotesByProjectId(projectId);
  const contractSalesNotes = useSalesNotesByContractId(contractId);
  const salesNotes = contractId ? contractSalesNotes : projectSalesNotes;
  const { createChatMessage, createSalesNote, currentUser } = useApp();
  const [messageText, setMessageText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const userIsSales = true;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setLoading(true);
    try {
      await createChatMessage({
        project_id: projectId,
        author: currentUser.name,
        text: messageText.trim(),
        reply_to_id: replyToId,
      });
      
      setMessageText('');
      setReplyToId(undefined);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setLoading(true);
    try {
      await createSalesNote({
        project_id: projectId,
        author: currentUser.name,
        text: noteText.trim(),
      });
      
      setNoteText('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
  };

  const replyToMessage = messages.find(m => m.id === replyToId);

  if (messages.length === 0 && (!userIsSales || salesNotes.length === 0)) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <EmptyState
          icon={MessageCircle}
          title="Niciun mesaj"
          description="Începe conversația despre acest proiect"
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Scrie un mesaj..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={loading || !messageText.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {userIsSales && salesNotes.length > 0 && (
          <View style={styles.salesNotesSection}>
            <View style={styles.salesNotesHeader}>
              <StickyNote size={18} color={colors.warning} />
              <Text style={styles.salesNotesTitle}>Note Vânzări (privat)</Text>
            </View>
            {salesNotes.map((note) => (
              <View key={note.id} style={styles.salesNoteCard}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteAuthor}>{note.author}</Text>
                  <Text style={styles.noteTime}>{formatMessageTime(note.created_at)}</Text>
                </View>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
            ))}
            
            <View style={styles.addNoteContainer}>
              <TextInput
                style={styles.noteInput}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Adaugă notă privată..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.addNoteButton, !noteText.trim() && styles.addNoteButtonDisabled]}
                onPress={handleAddNote}
                disabled={loading || !noteText.trim()}
              >
                <Text style={styles.addNoteButtonText}>Adaugă</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.chatSection}>
          <Text style={styles.chatTitle}>Conversație proiect</Text>
          {messages.map((message) => {
            const isCurrentUser = message.author === currentUser.name;
            const replyTo = message.reply_to_id 
              ? messages.find(m => m.id === message.reply_to_id)
              : undefined;

            return (
              <View
                key={message.id}
                style={[
                  styles.messageCard,
                  isCurrentUser && styles.messageCardCurrentUser,
                ]}
              >
                {replyTo && (
                  <View style={styles.replyPreview}>
                    <Text style={styles.replyAuthor}>{replyTo.author}</Text>
                    <Text style={styles.replyText} numberOfLines={1}>
                      {replyTo.text}
                    </Text>
                  </View>
                )}
                <View style={styles.messageHeader}>
                  <Text style={styles.messageAuthor}>{message.author}</Text>
                  <Text style={styles.messageTime}>{formatMessageTime(message.created_at)}</Text>
                </View>
                <Text style={styles.messageText}>{message.text}</Text>
                {!isCurrentUser && (
                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => setReplyToId(message.id)}
                  >
                    <Text style={styles.replyButtonText}>Răspunde</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        {replyToMessage && (
          <View style={styles.replyingTo}>
            <View style={styles.replyingToContent}>
              <Text style={styles.replyingToLabel}>Răspunzi la {replyToMessage.author}</Text>
              <Text style={styles.replyingToText} numberOfLines={1}>
                {replyToMessage.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyToId(undefined)}>
              <Text style={styles.cancelReply}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Scrie un mesaj..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={loading || !messageText.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  salesNotesSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE4A3',
  },
  salesNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  salesNotesTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  salesNoteCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE4A3',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteAuthor: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  noteTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  addNoteContainer: {
    marginTop: 8,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFE4A3',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  addNoteButton: {
    backgroundColor: colors.warning,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  addNoteButtonDisabled: {
    opacity: 0.5,
  },
  addNoteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  chatSection: {
    gap: 12,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  messageCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  messageCardCurrentUser: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    alignSelf: 'flex-end',
  },
  replyPreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 8,
    paddingVertical: 6,
    marginBottom: 8,
    borderRadius: 4,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageAuthor: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  replyButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 12,
  },
  replyingTo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  replyingToContent: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 2,
  },
  replyingToText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cancelReply: {
    fontSize: 18,
    color: colors.textSecondary,
    paddingHorizontal: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
