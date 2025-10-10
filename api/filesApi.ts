export interface PresignedUploadResponse {
  uploadUrl: string;
  fileUrl: string;
}

export interface NotifyUploadedPayload {
  project_id: string;
  contract_id?: string;
  name: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  tag: string;
  uploader_id: string;
}

export interface PresignedDownloadResponse {
  downloadUrl: string;
}

export const filesApi = {
  async getPresignedUpload(
    projectId: string,
    fileName: string,
    mimeType: string
  ): Promise<PresignedUploadResponse> {
    console.log('[filesApi] Getting presigned upload URL', { projectId, fileName, mimeType });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uploadUrl = `https://storage.example.com/upload/${projectId}/${timestamp}_${sanitizedFileName}`;
    const fileUrl = `https://storage.example.com/files/${projectId}/${timestamp}_${sanitizedFileName}`;
    
    return {
      uploadUrl,
      fileUrl,
    };
  },

  async uploadFile(uploadUrl: string, file: Blob | File): Promise<void> {
    console.log('[filesApi] Uploading file to presigned URL', { uploadUrl, fileSize: file.size });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[filesApi] File uploaded successfully');
  },

  async notifyUploaded(payload: NotifyUploadedPayload): Promise<void> {
    console.log('[filesApi] Notifying server about uploaded file', payload);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('[filesApi] Server notified successfully');
  },

  async getPresignedDownload(fileId: string): Promise<PresignedDownloadResponse> {
    console.log('[filesApi] Getting presigned download URL', { fileId });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const downloadUrl = `https://storage.example.com/download/${fileId}?expires=600`;
    
    return {
      downloadUrl,
    };
  },

  async deleteFile(fileId: string): Promise<void> {
    console.log('[filesApi] Deleting file from storage', { fileId });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('[filesApi] File deleted successfully');
  },
};
