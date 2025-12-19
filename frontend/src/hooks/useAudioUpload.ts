/**
 * Custom hook for handling audio file uploads
 */

import { useState } from 'react';
import { uploadService } from '../services/uploadService';
import { AudioFile, UploadProgress } from '../types/audio';
import toast from 'react-hot-toast';

export const useAudioUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<AudioFile | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadService.upload(
        file,
        (progressInfo: UploadProgress) => {
          setProgress(progressInfo.percentage);
        }
      );

      setUploadedFile(result);
      toast.success(`File uploaded: ${result.filename}`);
      return result;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || 'Upload failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setError(null);
    setProgress(0);
  };

  return {
    uploadFile,
    isUploading,
    progress,
    uploadedFile,
    error,
    reset,
  };
};
