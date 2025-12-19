/**
 * Processing controls component
 */

import { useState } from 'react';
import { Scissors, ChevronUp, Gauge } from 'lucide-react';
import { audioService } from '../../services/audioService';
import toast from 'react-hot-toast';
import './ProcessingControls.css';

interface ProcessingControlsProps {
  fileId: string;
  onProcessingStart: (taskId: string, type: string) => void;
  disabled?: boolean;
}

export const ProcessingControls: React.FC<ProcessingControlsProps> = ({
  fileId,
  onProcessingStart,
  disabled = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pitchSemitones, setPitchSemitones] = useState(0);
  const [tempoFactor, setTempoFactor] = useState(1.0);

  const handleSeparate = async () => {
    setIsProcessing(true);
    try {
      const result = await audioService.separateSources({ file_id: fileId });
      onProcessingStart(result.task_id, 'separation');
      toast.success('Separation started!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to start separation';
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  const handleTranspose = async () => {
    if (pitchSemitones === 0) {
      toast.error('Please select a pitch shift value');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await audioService.transpose({
        file_id: fileId,
        semitones: pitchSemitones,
      });
      onProcessingStart(result.task_id, 'transpose');
      toast.success('Transposition started!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to start transposition';
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  const handleTempoChange = async () => {
    if (tempoFactor === 1.0) {
      toast.error('Please select a tempo change value');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await audioService.changeTempo({
        file_id: fileId,
        tempo_factor: tempoFactor,
      });
      onProcessingStart(result.task_id, 'tempo');
      toast.success('Tempo change started!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to start tempo change';
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="processing-controls">
      <h3 className="controls-title">Audio Processing</h3>

      <div className="controls-grid">
        {/* Source Separation */}
        <div className="control-card">
          <div className="control-header">
            <Scissors size={24} className="control-icon" />
            <h4>Source Separation</h4>
          </div>
          <p className="control-description">
            Separate vocals, drums, bass, and other instruments
          </p>
          <button
            onClick={handleSeparate}
            disabled={disabled || isProcessing}
            className="control-button primary"
          >
            Separate Stems
          </button>
        </div>

        {/* Pitch Transposition */}
        <div className="control-card">
          <div className="control-header">
            <ChevronUp size={24} className="control-icon" />
            <h4>Pitch Shift</h4>
          </div>
          <p className="control-description">
            Transpose pitch from -12 to +12 semitones
          </p>
          <div className="slider-container">
            <label className="slider-label">
              Semitones: {pitchSemitones > 0 ? '+' : ''}
              {pitchSemitones}
            </label>
            <input
              type="range"
              min="-12"
              max="12"
              value={pitchSemitones}
              onChange={(e) => setPitchSemitones(Number(e.target.value))}
              disabled={disabled}
              className="slider"
            />
          </div>
          <button
            onClick={handleTranspose}
            disabled={disabled || isProcessing || pitchSemitones === 0}
            className="control-button secondary"
          >
            Apply Transpose
          </button>
        </div>

        {/* Tempo Change */}
        <div className="control-card">
          <div className="control-header">
            <Gauge size={24} className="control-icon" />
            <h4>Tempo Change</h4>
          </div>
          <p className="control-description">
            Change speed from 0.5x to 2.0x
          </p>
          <div className="slider-container">
            <label className="slider-label">Speed: {tempoFactor.toFixed(2)}x</label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={tempoFactor}
              onChange={(e) => setTempoFactor(Number(e.target.value))}
              disabled={disabled}
              className="slider"
            />
          </div>
          <button
            onClick={handleTempoChange}
            disabled={disabled || isProcessing || tempoFactor === 1.0}
            className="control-button secondary"
          >
            Apply Tempo
          </button>
        </div>
      </div>
    </div>
  );
};

