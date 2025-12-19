/**
 * Progress tracker component for background tasks
 */

import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTaskPolling } from '../../hooks/useTaskPolling';
import './ProgressTracker.css';

interface ProgressTrackerProps {
  taskId: string | null;
  taskType: string;
  onComplete: (result: any) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  taskId,
  taskType,
  onComplete,
}) => {
  const { status, progress, message, error, cancelTask } = useTaskPolling(
    taskId,
    {
      onComplete: (result) => onComplete(result),
    }
  );

  if (!taskId) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Loader2 size={32} className="spinner" />;
      case 'completed':
        return <CheckCircle size={32} className="success-icon" />;
      case 'failed':
        return <XCircle size={32} className="error-icon" />;
      case 'cancelled':
        return <AlertCircle size={32} className="warning-icon" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Task queued...';
      case 'processing':
        return message || 'Processing...';
      case 'completed':
        return 'Processing completed!';
      case 'failed':
        return error || 'Processing failed';
      case 'cancelled':
        return 'Task cancelled';
      default:
        return '';
    }
  };

  const getTaskTypeLabel = () => {
    switch (taskType) {
      case 'separation':
        return 'Source Separation';
      case 'transpose':
        return 'Pitch Transposition';
      case 'tempo':
        return 'Tempo Change';
      default:
        return 'Processing';
    }
  };

  return (
    <div className={`progress-tracker ${status}`}>
      <div className="tracker-header">
        <div className="tracker-icon">{getStatusIcon()}</div>
        <div className="tracker-text">
          <h4 className="tracker-title">{getTaskTypeLabel()}</h4>
          <p className="tracker-message">{getStatusText()}</p>
        </div>
      </div>

      {(status === 'pending' || status === 'processing') && (
        <>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="progress-info">
            <span className="progress-percent">
              {Math.round(progress * 100)}%
            </span>
            <button
              onClick={cancelTask}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {status === 'failed' && error && (
        <div className="error-details">
          <p className="error-text">{error}</p>
        </div>
      )}
    </div>
  );
};
