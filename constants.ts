import { Settings, Language } from './types.ts';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese' }
];

export const DEFAULT_SETTINGS: Settings = {
  language: SUPPORTED_LANGUAGES[0],
  min: 1,
  max: 100,
};