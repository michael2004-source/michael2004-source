
import { Settings, Language } from './types.ts';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'fr-FR', name: 'French', voice: 'Charon' },
];

export const DEFAULT_SETTINGS: Settings = {
  language: SUPPORTED_LANGUAGES[0],
  min: 1,
  max: 100,
};