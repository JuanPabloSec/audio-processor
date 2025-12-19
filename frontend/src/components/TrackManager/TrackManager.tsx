/**
 * Track manager component for displaying separated stems
 */

import { useState } from 'react';
import { Download, Music2 } from 'lucide-react';
import { AudioPlayer } from '../AudioPlayer/AudioPlayer';
import { audioService } from '../../services/audioService';
import './TrackManager.css';

interface Track {
  name: string;
  fileId: string;
  icon: string;
  color: string;
}

interface TrackManagerProps {
  separatedTracks: Record<string, string>;
}

export const TrackManager: React.FC<TrackManagerProps> = ({
  separatedTracks,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  // Define track metadata
  const trackMetadata: Record<string, { icon: string; color: string }> = {
    vocals: { icon: '🎤', color: '#ef4444' },
    drums: { icon: '🥁', color: '#f59e0b' },
    bass: { icon: '🎸', color: '#10b981' },
    other: { icon: '🎹', color: '#3b82f6' },
  };

  // Convert separated tracks to Track objects
  const tracks: Track[] = Object.entries(separatedTracks).map(
    ([name, fileId]) => ({
      name,
      fileId,
      icon: trackMetadata[name]?.icon || '🎵',
      color: trackMetadata[name]?.color || '#6b7280',
    })
  );

  const handleDownload = (fileId: string, trackName: string) => {
    const url = audioService.getProcessedUrl(fileId);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trackName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className="track-manager">
      <h3 className="manager-title">Separated Tracks</h3>

      <div className="tracks-grid">
        {tracks.map((track) => (
          <div
            key={track.name}
            className={`track-card ${selectedTrack === track.fileId ? 'selected' : ''}`}
            style={{ borderColor: track.color }}
          >
            <div className="track-header">
              <div className="track-info">
                <span className="track-icon">{track.icon}</span>
                <div>
                  <h4 className="track-name">
                    {track.name.charAt(0).toUpperCase() + track.name.slice(1)}
                  </h4>
                  <p className="track-id">{track.fileId}</p>
                </div>
              </div>
            </div>

            <div className="track-actions">
              <button
                onClick={() => setSelectedTrack(track.fileId)}
                className="action-btn play-btn"
                style={{ backgroundColor: track.color }}
              >
                <Music2 size={16} />
                Play
              </button>
              <button
                onClick={() => handleDownload(track.fileId, track.name)}
                className="action-btn download-btn"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedTrack && (
        <div className="player-container">
          <AudioPlayer
            audioUrl={audioService.getProcessedUrl(selectedTrack)}
            trackName={
              tracks.find((t) => t.fileId === selectedTrack)?.name || 'Track'
            }
          />
        </div>
      )}
    </div>
  );
};
