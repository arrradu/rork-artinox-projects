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
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { 
  Send, 
  MessageCircle, 
  Paperclip, 
  X, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileCode, 
  Archive, 
  File as FileIcon,
  Camera,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react-native';
import { useChatMessagesByProjectId, useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Attachment } from '@/types';

interface ChatTabProps {
  projectId: string;
}

interface AttachmentPreview {
  name: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  uri?: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.includes('word')) return FileText;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return FileCode;
  if (mimeType.includes('zip')) return Archive;
  return FileIcon;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export default function ChatTab({ projectId }: ChatTabProps) {
  const messages = useChatMessagesByProjectId(projectId);
  const { createChatMessage, currentUser } = useApp();
  const [messageText, setMessageText] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const newAttachments: AttachmentPreview[] = result.assets.map((asset: DocumentPicker.DocumentPickerAsset) => ({
        name: asset.name,
        url: asset.uri,
        uri: asset.uri,
        mime_type: asset.mimeType || 'application/octet-stream',
        size_bytes: asset.size || 0,
      }));

      if (attachments.length + newAttachments.length > 10) {
        Alert.alert('Limită depășită', 'Poți atașa maxim 10 fișiere per mesaj');
        return;
      }

      setAttachments(prev => [...prev, ...newAttachments]);
      setPickerModalVisible(false);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Eroare', 'Nu s-a putut selecta fișierul');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permisiune necesară', 'Aplicația necesită acces la cameră');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const newAttachment: AttachmentPreview = {
        name: `photo_${Date.now()}.jpg`,
        url: asset.uri,
        uri: asset.uri,
        mime_type: 'image/jpeg',
        size_bytes: asset.fileSize || 0,
      };

      if (attachments.length >= 10) {
        Alert.alert('Limită depășită', 'Poți atașa maxim 10 fișiere per mesaj');
        return;
      }

      setAttachments(prev => [...prev, newAttachment]);
      setPickerModalVisible(false);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Eroare', 'Nu s-a putut face poza');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permisiune necesară', 'Aplicația necesită acces la galerie');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10 - attachments.length,
      });

      if (result.canceled) return;

      const newAttachments: AttachmentPreview[] = result.assets.map(asset => ({
        name: asset.fileName || `image_${Date.now()}.jpg`,
        url: asset.uri,
        uri: asset.uri,
        mime_type: asset.mimeType || 'image/jpeg',
        size_bytes: asset.fileSize || 0,
      }));

      setAttachments(prev => [...prev, ...newAttachments]);
      setPickerModalVisible(false);
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Eroare', 'Nu s-a putut selecta imaginea');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async (attachment: AttachmentPreview): Promise<string> => {
    const key = attachment.name;
    
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(prev => ({ ...prev, [key]: i }));
    }
    
    return attachment.url;
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachments.length === 0) return;

    setLoading(true);
    setUploading(true);
    
    try {
      const uploadedAttachments: Omit<Attachment, 'id' | 'message_id' | 'created_at'>[] = [];
      
      for (const attachment of attachments) {
        const uploadedUrl = await simulateUpload(attachment);
        uploadedAttachments.push({
          name: attachment.name,
          url: uploadedUrl,
          mime_type: attachment.mime_type,
          size_bytes: attachment.size_bytes,
        });
      }
      
      await createChatMessage({
        project_id: projectId,
        author_id: currentUser.id,
        author_name: currentUser.name,
        text: messageText.trim() || undefined,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        reply_to_id: replyToId,
      });
      
      setMessageText('');
      setReplyToId(undefined);
      setAttachments([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Eroare', 'Nu s-a putut trimite mesajul');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleAttachmentPress = async (attachment: Attachment) => {
    console.log('Attachment pressed:', attachment.name, attachment.mime_type);

    if (attachment.mime_type.startsWith('image/')) {
      setSelectedAttachment(attachment);
      setPreviewModalVisible(true);
      return;
    }

    if (attachment.mime_type === 'application/pdf') {
      try {
        await WebBrowser.openBrowserAsync(attachment.url);
      } catch (error) {
        console.error('Error opening PDF:', error);
        Alert.alert('Eroare', 'Nu s-a putut deschide fișierul PDF');
      }
      return;
    }

    if (
      attachment.mime_type.includes('word') ||
      attachment.mime_type.includes('sheet') ||
      attachment.mime_type.includes('excel') ||
      attachment.mime_type.includes('presentation') ||
      attachment.mime_type.includes('powerpoint')
    ) {
      try {
        const supported = await Linking.canOpenURL(attachment.url);
        if (supported) {
          await Linking.openURL(attachment.url);
        } else {
          Alert.alert(
            'Deschide fișier',
            'Doriți să deschideți acest fișier în browser?',
            [
              { text: 'Anulează', style: 'cancel' },
              { text: 'Deschide', onPress: () => WebBrowser.openBrowserAsync(attachment.url) },
            ]
          );
        }
      } catch (error) {
        console.error('Error opening file:', error);
        Alert.alert('Eroare', 'Nu s-a putut deschide fișierul');
      }
      return;
    }

    Alert.alert(
      attachment.name,
      'Alegeți o acțiune',
      [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Deschide în browser', onPress: () => WebBrowser.openBrowserAsync(attachment.url) },
      ]
    );
  };

  const handleAttachmentLongPress = (attachment: Attachment) => {
    Alert.alert(
      attachment.name,
      'Alegeți o acțiune',
      [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Descarcă', onPress: () => Alert.alert('Descarcă', 'Funcționalitate în dezvoltare') },
        { text: 'Share', onPress: () => Alert.alert('Share', 'Funcționalitate în dezvoltare') },
      ]
    );
  };

  const replyToMessage = messages.find(m => m.id === replyToId);

  if (messages.length === 0) {
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
        
        {attachments.length > 0 && (
          <View style={styles.attachmentPreviewContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {attachments.map((attachment, index) => {
                const IconComponent = getFileIcon(attachment.mime_type);
                const isImage = attachment.mime_type.startsWith('image/');
                const progress = uploadProgress[attachment.name];
                
                return (
                  <View key={index} style={styles.attachmentPreviewCard}>
                    {isImage ? (
                      <Image
                        source={{ uri: attachment.uri || attachment.url }}
                        style={styles.attachmentPreviewImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.attachmentPreviewIcon}>
                        <IconComponent size={24} color={colors.primary} />
                      </View>
                    )}
                    
                    {uploading && progress !== undefined && (
                      <View style={styles.uploadProgressOverlay}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.uploadProgressText}>{progress}%</Text>
                      </View>
                    )}
                    
                    <TouchableOpacity
                      style={styles.removeAttachmentButton}
                      onPress={() => removeAttachment(index)}
                      disabled={uploading}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    <Text style={styles.attachmentPreviewName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => setPickerModalVisible(true)}
              disabled={loading || uploading}
            >
              <Paperclip size={22} color={colors.primary} />
            </TouchableOpacity>
            
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
              style={[
                styles.sendButton,
                (!messageText.trim() && attachments.length === 0) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={loading || uploading || (!messageText.trim() && attachments.length === 0)}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={pickerModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPickerModalVisible(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerModalHeader}>
                <Text style={styles.pickerModalTitle}>Atașează fișier</Text>
                <TouchableOpacity onPress={() => setPickerModalVisible(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.pickerOptions}>
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={handleTakePhoto}
                >
                  <View style={styles.pickerOptionIcon}>
                    <Camera size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.pickerOptionText}>Fă o poză</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={handlePickFromGallery}
                >
                  <View style={styles.pickerOptionIcon}>
                    <ImageIcon size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.pickerOptionText}>Alege din galerie</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={handlePickDocument}
                >
                  <View style={styles.pickerOptionIcon}>
                    <FileText size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.pickerOptionText}>Alege document</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
        <View style={styles.chatSection}>
          {messages.map((message) => {
            const isCurrentUser = message.author_name === currentUser.name;
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
                    <Text style={styles.replyAuthor}>{replyTo.author_name}</Text>
                    <Text style={styles.replyText} numberOfLines={1}>
                      {replyTo.text}
                    </Text>
                  </View>
                )}
                <View style={styles.messageHeader}>
                  <Text style={styles.messageAuthor}>{message.author_name}</Text>
                  <Text style={styles.messageTime}>{formatMessageTime(message.created_at)}</Text>
                </View>
                {message.text && <Text style={styles.messageText}>{message.text}</Text>}
                
                {message.attachments && message.attachments.length > 0 && (
                  <View style={styles.attachmentsContainer}>
                    {message.attachments.map((attachment, idx) => {
                      const IconComponent = getFileIcon(attachment.mime_type);
                      const isImage = attachment.mime_type.startsWith('image/');
                      
                      return (
                        <TouchableOpacity
                          key={`${attachment.id}-${idx}`}
                          style={styles.attachmentCard}
                          onPress={() => handleAttachmentPress(attachment)}
                          onLongPress={() => handleAttachmentLongPress(attachment)}
                          activeOpacity={0.7}
                        >
                          {isImage ? (
                            <Image
                              source={{ uri: attachment.url }}
                              style={styles.attachmentThumbnail}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.attachmentIconContainer}>
                              <IconComponent size={24} color={colors.primary} />
                            </View>
                          )}
                          <View style={styles.attachmentInfo}>
                            <Text style={styles.attachmentName} numberOfLines={1}>
                              {attachment.name}
                            </Text>
                            <Text style={styles.attachmentSize}>
                              {formatFileSize(attachment.size_bytes)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
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
              <Text style={styles.replyingToLabel}>Răspunzi la {replyToMessage.author_name}</Text>
              <Text style={styles.replyingToText} numberOfLines={1}>
                {replyToMessage.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyToId(undefined)}>
              <Text style={styles.cancelReply}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {attachments.length > 0 && (
          <View style={styles.attachmentPreviewContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {attachments.map((attachment, index) => {
                const IconComponent = getFileIcon(attachment.mime_type);
                const isImage = attachment.mime_type.startsWith('image/');
                const progress = uploadProgress[attachment.name];
                
                return (
                  <View key={index} style={styles.attachmentPreviewCard}>
                    {isImage ? (
                      <Image
                        source={{ uri: attachment.uri || attachment.url }}
                        style={styles.attachmentPreviewImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.attachmentPreviewIcon}>
                        <IconComponent size={24} color={colors.primary} />
                      </View>
                    )}
                    
                    {uploading && progress !== undefined && (
                      <View style={styles.uploadProgressOverlay}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.uploadProgressText}>{progress}%</Text>
                      </View>
                    )}
                    
                    <TouchableOpacity
                      style={styles.removeAttachmentButton}
                      onPress={() => removeAttachment(index)}
                      disabled={uploading}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    <Text style={styles.attachmentPreviewName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setPickerModalVisible(true)}
            disabled={loading || uploading}
          >
            <Paperclip size={22} color={colors.primary} />
          </TouchableOpacity>
          
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
            style={[
              styles.sendButton,
              (!messageText.trim() && attachments.length === 0) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={loading || uploading || (!messageText.trim() && attachments.length === 0)}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={pickerModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Atașează fișier</Text>
              <TouchableOpacity onPress={() => setPickerModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerOptions}>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={handleTakePhoto}
              >
                <View style={styles.pickerOptionIcon}>
                  <Camera size={28} color={colors.primary} />
                </View>
                <Text style={styles.pickerOptionText}>Fă o poză</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={handlePickFromGallery}
              >
                <View style={styles.pickerOptionIcon}>
                  <ImageIcon size={28} color={colors.primary} />
                </View>
                <Text style={styles.pickerOptionText}>Alege din galerie</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={handlePickDocument}
              >
                <View style={styles.pickerOptionIcon}>
                  <FileText size={28} color={colors.primary} />
                </View>
                <Text style={styles.pickerOptionText}>Alege document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={previewModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {selectedAttachment?.name}
            </Text>
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={() => {
                  if (selectedAttachment) {
                    WebBrowser.openBrowserAsync(selectedAttachment.url);
                  }
                }}
              >
                <ExternalLink size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={() => setPreviewModalVisible(false)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          {selectedAttachment && (
            <ScrollView
              style={styles.previewContent}
              contentContainerStyle={styles.previewContentContainer}
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              <Image
                source={{ uri: selectedAttachment.url }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </ScrollView>
          )}
        </View>
      </Modal>
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
    padding: 16,
  },
  chatSection: {
    gap: 12,
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
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  attachmentsContainer: {
    marginTop: 8,
    gap: 8,
  },
  attachmentCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 8,
    gap: 10,
    alignItems: 'center',
  },
  attachmentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  attachmentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
    gap: 2,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  attachmentSize: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  attachmentPreviewContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attachmentPreviewCard: {
    width: 80,
    marginRight: 8,
    position: 'relative' as const,
  },
  attachmentPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  attachmentPreviewIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadProgressOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  uploadProgressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  removeAttachmentButton: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentPreviewName: {
    fontSize: 11,
    color: colors.text,
    marginTop: 4,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  pickerOptions: {
    padding: 20,
    gap: 16,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    gap: 16,
  },
  pickerOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  previewTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginRight: 16,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    padding: 8,
  },
  previewContent: {
    flex: 1,
  },
  previewContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
