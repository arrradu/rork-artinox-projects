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
  Image,
  Linking,
  Platform,
  ActionSheetIOS,
  ActivityIndicator,
} from 'react-native';
import { 
  FileText, 
  Plus, 
  X, 
  FileImage, 
  FileSpreadsheet, 
  FileCode, 
  Archive, 
  File as FileIcon,
  MoreVertical,
  ExternalLink,
  Upload,
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useFilesByProjectId, useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { FileTag, ProjFile } from '@/types';
import { filesApi } from '@/api/filesApi';

interface FilesTabProps {
  projectId: string;
  contractId?: string;
}

interface SelectedFileInfo {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
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

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function getFileIcon(mimeType?: string, filename?: string) {
  if (mimeType?.startsWith('image/')) {
    return FileImage;
  }
  if (mimeType === 'application/pdf') {
    return FileText;
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return FileText;
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'
  ) {
    return FileSpreadsheet;
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimeType === 'application/vnd.ms-powerpoint'
  ) {
    return FileCode;
  }
  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') {
    return Archive;
  }
  
  const ext = filename ? getFileExtension(filename) : '';
  if (['dwg', 'dxf', 'dwf'].includes(ext)) {
    return FileCode;
  }
  
  return FileIcon;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Acum';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}z`;
  
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

export default function FilesTab({ projectId, contractId }: FilesTabProps) {
  const files = useFilesByProjectId(projectId);
  const { createFile, deleteFile, currentUser } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjFile | null>(null);
  const [selectedFileInfo, setSelectedFileInfo] = useState<SelectedFileInfo | null>(null);
  const [name, setName] = useState('');
  const [tag, setTag] = useState<FileTag>('altul');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickFile = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            setSelectedFileInfo({
              uri: URL.createObjectURL(file),
              name: file.name,
              mimeType: file.type || 'application/octet-stream',
              size: file.size,
            });
            setName(file.name);
          }
        };
        input.click();
      } else {
        Alert.alert(
          'Alege tip fișier',
          'Ce tip de fișier dorești să încarci?',
          [
            {
              text: 'Document',
              onPress: async () => {
                const result = await DocumentPicker.getDocumentAsync({
                  type: '*/*',
                  copyToCacheDirectory: true,
                });
                
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  const asset = result.assets[0];
                  setSelectedFileInfo({
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType || 'application/octet-stream',
                    size: asset.size || 0,
                  });
                  setName(asset.name);
                }
              },
            },
            {
              text: 'Imagine',
              onPress: async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: 'images',
                  allowsEditing: false,
                  quality: 1,
                });
                
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  const asset = result.assets[0];
                  const fileName = asset.uri.split('/').pop() || 'image.jpg';
                  setSelectedFileInfo({
                    uri: asset.uri,
                    name: fileName,
                    mimeType: asset.mimeType || 'image/jpeg',
                    size: asset.fileSize || 0,
                  });
                  setName(fileName);
                }
              },
            },
            {
              text: 'Anulează',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Eroare', 'Nu s-a putut selecta fișierul');
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFileInfo) {
      Alert.alert('Eroare', 'Te rog selectează un fișier');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Eroare', 'Numele fișierului este obligatoriu');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      console.log('[FilesTab] Starting file upload', {
        name: name.trim(),
        mimeType: selectedFileInfo.mimeType,
        size: selectedFileInfo.size,
      });

      setUploadProgress(20);
      const { uploadUrl, fileUrl } = await filesApi.getPresignedUpload(
        projectId,
        name.trim(),
        selectedFileInfo.mimeType
      );

      console.log('[FilesTab] Got presigned URL', { uploadUrl, fileUrl });

      setUploadProgress(40);
      
      if (Platform.OS === 'web') {
        const response = await fetch(selectedFileInfo.uri);
        const blob = await response.blob();
        await filesApi.uploadFile(uploadUrl, blob);
      } else {
        const response = await fetch(selectedFileInfo.uri);
        const blob = await response.blob();
        await filesApi.uploadFile(uploadUrl, blob);
      }

      console.log('[FilesTab] File uploaded to storage');

      setUploadProgress(70);
      await filesApi.notifyUploaded({
        project_id: projectId,
        contract_id: contractId,
        name: name.trim(),
        url: fileUrl,
        mime_type: selectedFileInfo.mimeType,
        size_bytes: selectedFileInfo.size,
        tag,
        uploader_id: currentUser.id,
      });

      console.log('[FilesTab] Server notified');

      setUploadProgress(90);
      await createFile({
        project_id: projectId,
        contract_id: contractId,
        name: name.trim(),
        url: fileUrl,
        tag,
        size: selectedFileInfo.size,
        mime_type: selectedFileInfo.mimeType,
        uploader: currentUser.name,
      });

      console.log('[FilesTab] File record created in database');

      setUploadProgress(100);
      setName('');
      setSelectedFileInfo(null);
      setTag('altul');
      setModalVisible(false);
      
      Alert.alert('Succes', 'Fișierul a fost încărcat cu succes');
    } catch (error) {
      console.error('[FilesTab] Error uploading file:', error);
      Alert.alert('Eroare', 'Nu s-a putut încărca fișierul. Te rog încearcă din nou.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFilePress = async (file: ProjFile) => {
    console.log('File pressed:', file.name, file.mime_type);

    if (file.mime_type?.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewModalVisible(true);
      return;
    }

    if (file.mime_type === 'application/pdf') {
      try {
        await WebBrowser.openBrowserAsync(file.url);
      } catch (error) {
        console.error('Error opening PDF:', error);
        Alert.alert('Eroare', 'Nu s-a putut deschide fișierul PDF');
      }
      return;
    }

    if (
      file.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mime_type === 'application/msword' ||
      file.mime_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mime_type === 'application/vnd.ms-excel' ||
      file.mime_type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.mime_type === 'application/vnd.ms-powerpoint'
    ) {
      try {
        const supported = await Linking.canOpenURL(file.url);
        if (supported) {
          await Linking.openURL(file.url);
        } else {
          Alert.alert(
            'Deschide fișier',
            'Doriți să deschideți acest fișier în browser?',
            [
              { text: 'Anulează', style: 'cancel' },
              { text: 'Deschide', onPress: () => WebBrowser.openBrowserAsync(file.url) },
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
      file.name,
      'Alegeți o acțiune',
      [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Deschide în browser', onPress: () => WebBrowser.openBrowserAsync(file.url) },
      ]
    );
  };

  const handleFileMenu = (file: ProjFile) => {
    const canDelete = currentUser.role === 'admin';
    
    if (Platform.OS === 'ios') {
      const options = ['Anulează', 'Distribuie', 'Deschide'];
      if (canDelete) options.push('Șterge');
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: canDelete ? options.length - 1 : undefined,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Alert.alert('Distribuie', 'Funcționalitate în dezvoltare');
          } else if (buttonIndex === 2) {
            handleFilePress(file);
          } else if (buttonIndex === 3 && canDelete) {
            handleDeleteFile(file);
          }
        }
      );
    } else {
      const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
        { text: 'Anulează', style: 'cancel' },
        { text: 'Distribuie', onPress: () => Alert.alert('Distribuie', 'Funcționalitate în dezvoltare') },
        { text: 'Deschide', onPress: () => handleFilePress(file) },
      ];
      
      if (canDelete) {
        buttons.push({ text: 'Șterge', onPress: () => handleDeleteFile(file), style: 'destructive' });
      }
      
      Alert.alert(file.name, 'Alegeți o acțiune', buttons);
    }
  };

  const handleDeleteFile = (file: ProjFile) => {
    Alert.alert(
      'Șterge fișier',
      `Sigur doriți să ștergeți "${file.name}"?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFile(file.id);
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Eroare', 'Nu s-a putut șterge fișierul');
            }
          },
        },
      ]
    );
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
                <TouchableOpacity
                  style={styles.filePickerButton}
                  onPress={handlePickFile}
                  disabled={loading}
                >
                  <Upload size={24} color={colors.primary} />
                  <Text style={styles.filePickerButtonText}>
                    {selectedFileInfo ? 'Schimbă fișierul' : 'Alege fișier'}
                  </Text>
                </TouchableOpacity>

                {selectedFileInfo && (
                  <View style={styles.selectedFileInfo}>
                    <View style={styles.selectedFileRow}>
                      <Text style={styles.selectedFileLabel}>Fișier:</Text>
                      <Text style={styles.selectedFileValue} numberOfLines={1}>
                        {selectedFileInfo.name}
                      </Text>
                    </View>
                    <View style={styles.selectedFileRow}>
                      <Text style={styles.selectedFileLabel}>Dimensiune:</Text>
                      <Text style={styles.selectedFileValue}>
                        {formatFileSize(selectedFileInfo.size)}
                      </Text>
                    </View>
                    <View style={styles.selectedFileRow}>
                      <Text style={styles.selectedFileLabel}>Tip:</Text>
                      <Text style={styles.selectedFileValue} numberOfLines={1}>
                        {selectedFileInfo.mimeType}
                      </Text>
                    </View>
                  </View>
                )}

                <Text style={styles.label}>Nume fișier *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="ex: Contract semnat.pdf"
                  placeholderTextColor={colors.textSecondary}
                  editable={!loading}
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
              </ScrollView>

              <View style={styles.modalFooter}>
                {loading && uploadProgress > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${uploadProgress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{uploadProgress}%</Text>
                  </View>
                )}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedFileInfo(null);
                      setName('');
                      setTag('altul');
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.buttonSecondaryText}>Anulează</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
                    onPress={handleUploadFile}
                    disabled={loading || !selectedFileInfo}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonPrimaryText}>Încarcă</Text>
                    )}
                  </TouchableOpacity>
                </View>
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

      <ScrollView style={styles.filesList} showsVerticalScrollIndicator={false}>
        {files.map((file) => {
          const IconComponent = getFileIcon(file.mime_type, file.name);
          const ext = getFileExtension(file.name);
          
          return (
            <TouchableOpacity
              key={file.id}
              style={styles.fileCard}
              onPress={() => handleFilePress(file)}
              activeOpacity={0.7}
            >
              <View style={styles.fileCardContent}>
                <View style={styles.fileIconContainer}>
                  {file.mime_type?.startsWith('image/') ? (
                    <Image
                      source={{ uri: file.url }}
                      style={styles.fileThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.fileIconWrapper}>
                      <IconComponent size={32} color={colors.primary} />
                    </View>
                  )}
                </View>

                <View style={styles.fileInfo}>
                  <View style={styles.fileHeader}>
                    <Text style={styles.fileName} numberOfLines={2}>
                      {file.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => handleFileMenu(file)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MoreVertical size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.fileMetaRow}>
                    <Text style={styles.fileExtension}>{ext.toUpperCase()}</Text>
                    <Text style={styles.fileSeparator}>•</Text>
                    <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                    <View
                      style={[
                        styles.fileTagSmall,
                        { backgroundColor: FILE_TAG_COLORS[file.tag] },
                      ]}
                    >
                      <Text style={styles.fileTagSmallText}>
                        {FILE_TAG_LABELS[file.tag]}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.fileUploader}>
                    Încărcat de {file.uploader || 'Necunoscut'} • {formatDate(file.created_at)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handlePickFile}
                disabled={loading}
              >
                <Upload size={24} color={colors.primary} />
                <Text style={styles.filePickerButtonText}>
                  {selectedFileInfo ? 'Schimbă fișierul' : 'Alege fișier'}
                </Text>
              </TouchableOpacity>

              {selectedFileInfo && (
                <View style={styles.selectedFileInfo}>
                  <View style={styles.selectedFileRow}>
                    <Text style={styles.selectedFileLabel}>Fișier:</Text>
                    <Text style={styles.selectedFileValue} numberOfLines={1}>
                      {selectedFileInfo.name}
                    </Text>
                  </View>
                  <View style={styles.selectedFileRow}>
                    <Text style={styles.selectedFileLabel}>Dimensiune:</Text>
                    <Text style={styles.selectedFileValue}>
                      {formatFileSize(selectedFileInfo.size)}
                    </Text>
                  </View>
                  <View style={styles.selectedFileRow}>
                    <Text style={styles.selectedFileLabel}>Tip:</Text>
                    <Text style={styles.selectedFileValue} numberOfLines={1}>
                      {selectedFileInfo.mimeType}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.label}>Nume fișier *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="ex: Contract semnat.pdf"
                placeholderTextColor={colors.textSecondary}
                editable={!loading}
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
            </ScrollView>

            <View style={styles.modalFooter}>
              {loading && uploadProgress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${uploadProgress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{uploadProgress}%</Text>
                </View>
              )}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedFileInfo(null);
                    setName('');
                    setTag('altul');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.buttonSecondaryText}>Anulează</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
                  onPress={handleUploadFile}
                  disabled={loading || !selectedFileInfo}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonPrimaryText}>Încarcă</Text>
                  )}
                </TouchableOpacity>
              </View>
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
              {selectedFile?.name}
            </Text>
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={() => {
                  if (selectedFile) {
                    WebBrowser.openBrowserAsync(selectedFile.url);
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
          
          {selectedFile && (
            <ScrollView
              style={styles.previewContent}
              contentContainerStyle={styles.previewContentContainer}
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              <Image
                source={{ uri: selectedFile.url }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </ScrollView>
          )}
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
    flex: 1,
  },
  fileCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fileCardContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  fileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  fileThumbnail: {
    width: '100%',
    height: '100%',
  },
  fileIconWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    gap: 4,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 20,
  },
  menuButton: {
    padding: 4,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  fileExtension: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
  },
  fileSeparator: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fileSize: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fileTagSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fileTagSmallText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  fileUploader: {
    fontSize: 12,
    color: colors.textSecondary,
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
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed' as const,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filePickerButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  selectedFileInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  selectedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedFileLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    width: 100,
  },
  selectedFileValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
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
