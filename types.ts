
export type PlaybackSpeed = 0.5 | 0.75 | 1.0 | 1.5 | 2.0;

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface Stats {
  attempts: number;
  correct: number;
}

export interface Feedback {
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AudioConfig {
  playbackRate: number;
  voiceName: string;
}
