/**
 * Main application component
 */

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Music } from 'lucide-react';
import { FileUpload } from './components/FileUpload/FileUpload';
import { AudioPlayer } from './components/AudioPlayer/AudioPlayer';
import { ProcessingControls } from './components/ProcessingControls/ProcessingControls';
import { ProgressTracker } from './components/ProgressTracker/ProgressTracker';
import { TrackManager } from './components/TrackManager/TrackManager';
import { useAudioUpload } from './hooks/useAudioUpload';
import { AudioFile } from './types/audio';
import { uploadService } from './services/uploadService';
import './App.css';

function App() {
  const { uploadFile, isUploading, progress } = useAudioUpload();
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<string>('');
  const [separatedTracks, setSeparatedTracks] = useState<Record<string, string>>({});

  const handleFileSelected = async (file: File) => {
    const result = await uploadFile(file);
    if (result) {
      setCurrentFile(result);
      setSeparatedTracks({});
      setCurrentTaskId(null);
    }
  };

  const handleProcessingStart = (taskId: string, type: string) => {
    setCurrentTaskId(taskId);
    setTaskType(type);
  };

  const handleProcessingComplete = (result: any) => {
    if (taskType === 'separation' && result) {
      setSeparatedTracks(result);
    }
    setCurrentTaskId(null);
  };

  return (
    <div className="app">
      <Toaster position="top-right" />

      <header className="app-header">
        <div className="header-content">
          <Music size={32} className="logo-icon" />
          <h1 className="app-title">Audio Processor</h1>
          <p className="app-subtitle">
            Upload, Separate, Transpose & Modify Your Music
          </p>
        </div>
      </header>

      <main className="app-main">
        <section className="upload-section">
          <FileUpload
            onUploadComplete={handleFileSelected as any}
            isUploading={isUploading}
            progress={progress}
          />
        </section>

        {currentFile && (
          <>
            <section className="player-section">
              <AudioPlayer
                audioUrl={uploadService.getDownloadUrl(currentFile.file_id)}
                trackName={currentFile.filename}
              />

              <div className="file-info">
                <h3>File Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">
                      {currentFile.duration
                        ? `${currentFile.duration.toFixed(2)}s`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Sample Rate:</span>
                    <span className="info-value">
                      {currentFile.sample_rate
                        ? `${currentFile.sample_rate} Hz`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Channels:</span>
                    <span className="info-value">
                      {currentFile.channels || 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">File Size:</span>
                    <span className="info-value">
                      {(currentFile.file_size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <ProcessingControls
              fileId={currentFile.file_id}
              onProcessingStart={handleProcessingStart}
              disabled={!!currentTaskId}
            />

            {currentTaskId && (
              <ProgressTracker
                taskId={currentTaskId}
                taskType={taskType}
                onComplete={handleProcessingComplete}
              />
            )}

            {Object.keys(separatedTracks).length > 0 && (
              <TrackManager separatedTracks={separatedTracks} />
            )}
          </>
        )}

        {!currentFile && !isUploading && (
          <div className="welcome-message">
            <Music size={64} className="welcome-icon" />
            <h2>Welcome to Audio Processor</h2>
            <p>Upload an MP3 file to get started</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🎵</span>
                <span>Separate vocals from instruments</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎹</span>
                <span>Transpose pitch (-12 to +12 semitones)</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⏱️</span>
                <span>Change tempo (0.5x to 2.0x speed)</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <span>AI-powered music analysis</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Audio Processor v1.0 - Powered by Demucs, Rubberband & Google AI</p>
      </footer>
    </div>
  );
}

export default App;
