
import { Settings, Language } from './types.ts';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'fr-FR', name: 'French' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
];

export const DEFAULT_SETTINGS: Settings = {
  language: SUPPORTED_LANGUAGES[0],
  min: 1,
  max: 100,
};