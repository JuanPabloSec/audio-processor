/**
 * File upload component with drag & drop
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon } from 'lucide-react';
import { AudioFile } from '../../types/audio';
import './FileUpload.css';

interface FileUploadProps {
  onUploadComplete: (file: AudioFile) => void;
  isUploading: boolean;
  progress: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  isUploading,
  progress,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && onUploadComplete) {
        // The parent component will handle the upload via the hook
        const file = acceptedFiles[0];
        // Pass file to parent for upload
        onUploadComplete(file as any); // Will be handled by parent
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        'audio/mpeg': ['.mp3'],
      },
      maxSize: 100 * 1024 * 1024, // 100MB
      multiple: false,
      disabled: isUploading,
    });

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'drag-active' : ''} ${
          isUploading ? 'uploading' : ''
        }`}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="upload-progress">
            <FileIcon size={48} className="file-icon" />
            <p className="upload-text">Uploading...</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="progress-text">{progress}%</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <Upload size={48} className="upload-icon" />
            {isDragActive ? (
              <p className="upload-text">Drop your MP3 file here...</p>
            ) : (
              <>
                <p className="upload-text">
                  Drag & drop an MP3 file here, or click to select
                </p>
                <p className="upload-subtext">Maximum file size: 100MB</p>
              </>
            )}
          </div>
        )}
      </div>

      {acceptedFiles.length > 0 && !isUploading && (
        <div className="selected-file">
          <FileIcon size={20} />
          <span>{acceptedFiles[0].name}</span>
        </div>
      )}
    </div>
  );
};
