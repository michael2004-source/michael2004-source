
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
      reject(new Error("Local TTS failed. Your browser might not support this language or voice."));
    };

    window.speechSynthesis.speak(utterance);
  });
}
