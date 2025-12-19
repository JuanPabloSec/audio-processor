/**
 * TypeScript interfaces for task management
 */

export type TaskStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Task {
  task_id: string;
  status: TaskStatus;
  progress: number; // 0.0 to 1.0
  message?: string;
  result?: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at: string;
}
