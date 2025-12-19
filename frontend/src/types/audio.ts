/**
 * TypeScript interfaces for audio data
 */

export interface AudioFile {
  file_id: string;
  filename: string;
  duration?: number;
  sample_rate?: number;
  channels?: number;
  file_size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface AudioMetadata {
  genre: string;
  subgenres: string[];
  mood: string;
  energy_level: string;
  instruments: string[];
  vocals: string;
  tempo_estimate: string;
  key_signature: string;
  time_signature: string;
  description: string;
}
