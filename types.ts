export interface Language {
  code: string;
  name: string;
}

export interface Settings {
  language: Language;
  min: number;
  max: number;
}

export interface Stats {
  total: number;
  correct: number;
  incorrect: number;
  streak: number;
}

export type GameStatus = 'idle' | 'correct' | 'incorrect';