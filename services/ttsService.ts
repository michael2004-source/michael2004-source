
export interface TTSOptions {
  text: string;
  lang: string;
  rate: number;
  voiceName?: string;
}

/**
 * Gets the list of available system voices.
 * Note: SpeechSynthesis.getVoices() is populated asynchronously in many browsers.
 */
export function getSystemVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices();
}

/**
 * Utility to wait for voices to be loaded if they aren't available yet.
 */
export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
      window.speechSynthesis.onvoiceschanged = null;
    };
  });
}

/**
 * Speaks the provided text using the browser's native TTS engine.
 */
export function speakLocally({ text, lang, rate, voiceName }: TTSOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error("SpeechSynthesis Error:", event);
      // Silence errors if it's just 'interrupted' as it usually happens on rapid clicks
      if ((event as any).error === 'interrupted') {
        resolve();
      } else {
        reject(new Error("Local TTS failed. Your browser might not support this language or voice."));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}
