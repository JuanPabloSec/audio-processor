/**
 * Custom hook for polling task status
 */

import { useEffect, useState, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { Task } from '../types/task'
  ;import toast from 'react-hot-toast';

interface UseTaskPollingOptions {
  pollInterval?: number;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export const useTaskPolling = (
  taskId: string | null,
  options: UseTaskPollingOptions = {}
) => {
  const {
    pollInterval = 1000,
    onComplete,
    onError,
    enabled = true,
  } = options;

  const [task, setTask] = useState<Task | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollTask = useCallback(async () => {
    if (!taskId || !enabled) return;

    try {
      const data = await taskService.getTaskStatus(taskId);
      setTask(data);

      // Check if task is complete
      if (data.status === 'completed') {
        setIsPolling(false);
        onComplete?.(data.result);
        toast.success('Processing completed!');
      } else if (data.status === 'failed') {
        setIsPolling(false);
        const errorMsg = data.error || 'Processing failed';
        onError?.(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error polling task:', error);
      setIsPolling(false);
      const errorMsg = error.response?.data?.detail || 'Failed to get task status';
      onError?.(errorMsg);
      toast.error(errorMsg);
    }
  }, [taskId, enabled, onComplete, onError]);

  useEffect(() => {
    if (!taskId || !enabled) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    // Initial poll
    pollTask();

    // Set up polling interval
    const interval = setInterval(() => {
      pollTask();
    }, pollInterval);

    return () => {
      clearInterval(interval);
    };
  }, [taskId, enabled, pollInterval, pollTask]);

  const cancelTask = async () => {
    if (!taskId) return;

    try {
      await taskService.cancelTask(taskId);
      setIsPolling(false);
      toast.success('Task cancelled');
    } catch (error) {
      console.error('Error cancelling task:', error);
      toast.error('Failed to cancel task');
    }
  };

  return {
    task,
    isPolling,
    status: task?.status || 'pending',
    progress: task?.progress || 0,
    message: task?.message,
    result: task?.result,
    error: task?.error,
    cancelTask,
  };
};

