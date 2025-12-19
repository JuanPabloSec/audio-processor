/**
 * Upload service for handling file uploads
 */

import { apiClient } from './api';
import { AudioFile, UploadProgress } from '../types/audio';

export const uploadService = {
  /**
   * Upload an audio file
   */
  async upload(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<AudioFile> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<AudioFile>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    });

    return data;
  },

  /**
   * Get file info
   */
  async getFileInfo(fileId: string): Promise<AudioFile> {
    const { data } = await apiClient.get<AudioFile>(`/api/files/${fileId}`);
    return data;
  },

  /**
   * Get download URL for a file
   */
  getDownloadUrl(fileId: string, directory: 'upload' | 'processed' = 'upload'): string {
    return `${apiClient.defaults.baseURL}/api/files/${fileId}/download?directory=${directory}`;
  },

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`/api/files/${fileId}`);
  },
};
