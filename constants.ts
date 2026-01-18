
import { Settings, Language } from './types.ts';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English', voice: 'Zephyr' },
  { code: 'es-ES', name: 'Spanish', voice: 'Puck' },
  { code: 'fr-FR', name: 'French', voice: 'Charon' },
  { code: 'de-DE', name: 'German', voice: 'Kore' },
  { code: 'ja-JP', name: 'Japanese', voice: 'Fenrir' },
  { code: 'it-IT', name: 'Italian', voice: 'Puck' }, // Using available voices
  { code: 'pt-BR', name: 'Portuguese', voice: 'Puck' } // Using available voices
];

export const DEFAULT_SETTINGS: Settings = {
  language: SUPPORTED_LANGUAGES[0],
  min: 1,
  max: 100,
};
