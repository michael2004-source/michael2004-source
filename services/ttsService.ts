
/**
 * Speaks a given text using the browser's Web Speech API.
 * This is wrapped in a promise to make it easier to use with async/await
 * and to handle loading states correctly.
 * @param text The text to speak.
 * @param lang The BCP 47 language tag (e.g., "fr-FR").
 * @returns A promise that resolves when speech has finished, or rejects on error.
 */
export function speak(text: string, lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
            reject(new Error("Your browser does not support the Web Speech API. Try Chrome or Firefox."));
            return;
        }

        const speakUtterance = (allVoices: SpeechSynthesisVoice[]) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;

            // --- Voice Selection Logic ---
            const baseLang = lang.split('-')[0];
            const candidateVoices = allVoices.filter(v => v.lang === lang || v.lang.startsWith(baseLang));

            // Score voices to find the best one
            const getVoiceScore = (voice: SpeechSynthesisVoice) => {
                let score = 0;
                if (voice.lang === lang) score += 4; // Exact language match is best
                if (voice.name.toLowerCase().includes('google')) score += 3; // Prefer Google voices
                if (!voice.localService) score += 2; // Prefer network voices
                if (voice.default) score += 1; // Default is a good sign
                return score;
            };

            // Find the best voice from the candidates
            if (candidateVoices.length > 0) {
                const bestVoice = candidateVoices.sort((a, b) => getVoiceScore(b) - getVoiceScore(a))[0];
                utterance.voice = bestVoice;
            }
            // If no specific voice is found, the browser will use its default for the specified lang.

            utterance.onend = () => resolve();
            utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
            
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
            window.speechSynthesis.speak(utterance);
        };
        
        // Voices may load asynchronously.
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            speakUtterance(voices);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
                speakUtterance(voices);
            };
        }
    });
}