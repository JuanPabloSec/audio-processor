/**
 * Audio processing service
 */

import { apiClient } from './api';

export interface SeparationRequest {
  file_id: string;
  model?: 'htdemucs' | 'htdemucs_ft';
  stems?: 2 | 4;
}

export interface TransposeRequest {
  file_id: string;
  semitones: number;
}

export interface TempoRequest {
  file_id: string;
  tempo_factor: number;
}

export interface TaskStartResponse {
  task_id: string;
  message: string;
}

export const audioService = {
  /**
   * Start audio source separation
   */
  async separateSources(request: SeparationRequest): Promise<TaskStartResponse> {
    const { data } = await apiClient.post<TaskStartResponse>(
      '/api/audio/separate',
      {
        file_id: request.file_id,
        model: request.model || 'htdemucs',
        stems: request.stems || 4,
      }
    );
    return data;
  },

  /**
   * Transpose audio pitch
   */
  async transpose(request: TransposeRequest): Promise<TaskStartResponse> {
    const { data } = await apiClient.post<TaskStartResponse>(
      '/api/audio/transpose',
      request
    );
    return data;
  },

  /**
   * Change audio tempo
   */
  async changeTempo(request: TempoRequest): Promise<TaskStartResponse> {
    const { data } = await apiClient.post<TaskStartResponse>(
      '/api/audio/tempo',
      request
    );
    return data;
  },

  /**
   * Get download URL for processed file
   */
  getProcessedUrl(fileId: string): string {
    return `${apiClient.defaults.baseURL}/api/audio/download/${fileId}`;
  },
};
