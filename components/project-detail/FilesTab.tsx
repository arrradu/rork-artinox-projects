import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { FileText, Plus, X, ExternalLink } from 'lucide-react-native';
import { useFilesByProjectId, useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { FileTag } from '@/types';

interface FilesTabProps {
  projectId: string;
}

const FILE_TAG_LABELS: Record<FileTag, string> = {
  cerere: 'Cerere',
  contract: 'Contract',
  desen: 'Desen',
  poza: 'Poză',
  altul: 'Altul',
};

const FILE_TAG_COLORS: Record<FileTag, string> = {
  cerere: '#3B82F6',
  contract: '#10B981',
  desen: '#8B5CF6',
  poza: '#F59E0B',
  altul: '#6B7280',
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesTab({ projectId }: FilesTabProps) {
  const files = useFilesByProjectId(projectId);
  const { createFile } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [tag, setTag] = useState<FileTag>('altul');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddFile = async () => {
    if (!name.trim() || !url.trim()) {
      Alert.alert('Eroare', 'Numele și URL-ul sunt obligatorii');
      return;
    }

    setLoading(true);
    try {
      await createFile({
        project_id: projectId,
        name: name.trim(),
        url: url.trim(),
        tag,
        size: size ? parseInt(size, 10) : undefined,
      });
      
      setName('');
      setUrl('');
      setTag('altul');
      setSize('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating file:', error);
      Alert.alert('Eroare', 'Nu s-a putut adăuga fișierul');
    } finally {
      setLoading(false);
    }
  };

  if (files.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={FileText}
          title="Niciun fișier"
          description="Adaugă primul fișier la acest proiect"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Adaugă fișier</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adaugă fișier</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.label}>Nume fișier *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="ex: Contract semnat.pdf"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.label}>URL *</Text>
                <TextInput
                  style={styles.input}
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://example.com/file.pdf"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <Text style={styles.label}>Tag</Text>
                <View style={styles.tagContainer}>
                  {(Object.keys(FILE_TAG_LABELS) as FileTag[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.tagButton,
                        tag === t && { backgroundColor: FILE_TAG_COLORS[t] },
                      ]}
                      onPress={() => setTag(t)}
                    >
                      <Text
                        style={[
                          styles.tagButtonText,
                          tag === t && styles.tagButtonTextActive,
                        ]}
                      >
                        {FILE_TAG_LABELS[t]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Mărime (bytes, opțional)</Text>
                <TextInput
                  style={styles.input}
                  value={size}
                  onChangeText={setSize}
                  placeholder="ex: 512000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Anulează</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleAddFile}
                  disabled={loading}
                >
                  <Text style={styles.buttonPrimaryText}>
                    {loading ? 'Se adaugă...' : 'Adaugă'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.addButtonText}>Adaugă fișier</Text>
      </TouchableOpacity>

      <View style={styles.filesList}>
        {files.map((file) => (
          <View key={file.id} style={styles.fileCard}>
            <View style={styles.fileHeader}>
              <View style={styles.fileInfo}>
                <FileText size={20} color={colors.primary} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.fileTag,
                  { backgroundColor: FILE_TAG_COLORS[file.tag] },
                ]}
              >
                <Text style={styles.fileTagText}>
                  {FILE_TAG_LABELS[file.tag]}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.fileLink}
              onPress={() => Alert.alert('Link', file.url)}
            >
              <ExternalLink size={16} color={colors.primary} />
              <Text style={styles.fileLinkText} numberOfLines={1}>
                {file.url}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adaugă fișier</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Nume fișier *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="ex: Contract semnat.pdf"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>URL *</Text>
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="https://example.com/file.pdf"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />

              <Text style={styles.label}>Tag</Text>
              <View style={styles.tagContainer}>
                {(Object.keys(FILE_TAG_LABELS) as FileTag[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.tagButton,
                      tag === t && { backgroundColor: FILE_TAG_COLORS[t] },
                    ]}
                    onPress={() => setTag(t)}
                  >
                    <Text
                      style={[
                        styles.tagButtonText,
                        tag === t && styles.tagButtonTextActive,
                      ]}
                    >
                      {FILE_TAG_LABELS[t]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Mărime (bytes, opțional)</Text>
              <TextInput
                style={styles.input}
                value={size}
                onChangeText={setSize}
                placeholder="ex: 512000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonSecondaryText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleAddFile}
                disabled={loading}
              >
                <Text style={styles.buttonPrimaryText}>
                  {loading ? 'Se adaugă...' : 'Adaugă'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  filesList: {
    gap: 12,
  },
  fileCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fileTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fileTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  fileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fileLinkText: {
    fontSize: 14,
    color: colors.primary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  tagButtonTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
