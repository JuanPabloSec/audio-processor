/**
 * Task management service
 */

import { apiClient } from './api';
import { Task } from '../types/task';

export const taskService = {
  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<Task> {
    const { data } = await apiClient.get<Task>(`/api/tasks/${taskId}`);
    return data;
  },

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${taskId}`);
  },
};
