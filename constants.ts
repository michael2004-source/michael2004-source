
import { Language, PlaybackSpeed } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文 (简体)' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português' },
];

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1.0, 1.5, 2.0];

export const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

export const DEFAULT_MIN = 1;
export const DEFAULT_MAX = 100;
