/**
 * Audio player component with waveform visualization
 */

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Square } from 'lucide-react';
import './AudioPlayer.css';

interface AudioPlayerProps {
  audioUrl: string;
  trackName: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  trackName,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  useEffect(() => {
    if (!waveformRef.current) return;

    // Create WaveSurfer instance
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#cbd5e0',
      progressColor: '#4f46e5',
      cursorColor: '#312e81',
      barWidth: 2,
      barRadius: 3,
      height: 100,
      normalize: true,
      backend: 'WebAudio',
    });

    // Load audio
    wavesurferRef.current.load(audioUrl);

    // Event listeners
    wavesurferRef.current.on('ready', () => {
      setIsReady(true);
      const dur = wavesurferRef.current?.getDuration() || 0;
      setDuration(formatTime(dur));
    });

    wavesurferRef.current.on('play', () => {
      setIsPlaying(true);
    });

    wavesurferRef.current.on('pause', () => {
      setIsPlaying(false);
    });

    wavesurferRef.current.on('audioprocess', () => {
      const time = wavesurferRef.current?.getCurrentTime() || 0;
      setCurrentTime(formatTime(time));
    });

    wavesurferRef.current.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime('0:00');
    });

    // Cleanup
    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [audioUrl]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleStop = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop();
      setCurrentTime('0:00');
    }
  };

  return (
    <div className="audio-player">
      <div className="player-header">
        <h3 className="track-name">{trackName}</h3>
      </div>

      <div className="waveform-container" ref={waveformRef} />

      <div className="player-controls">
        <div className="control-buttons">
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="control-btn play-pause-btn"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleStop}
            disabled={!isReady}
            className="control-btn stop-btn"
            aria-label="Stop"
          >
            <Square size={20} />
          </button>
        </div>

        <div className="time-display">
          <span className="current-time">{currentTime}</span>
          <span className="time-separator">/</span>
          <span className="duration">{duration}</span>
        </div>
      </div>
    </div>
  );
};
