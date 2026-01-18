
import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAi = () => {
    if (!ai) {
        // The API key is injected via Vite's `define` config as process.env.API_KEY
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            throw new Error("API_KEY environment variable is not set.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

/**
 * Generates speech for a given text (number) in a specific language using Gemini TTS.
 * @param text The pre-translated text to speak (e.g., "quarante-deux").
 * @param voice The specific voice to use.
 * @param language The name of the language (e.g., "Japanese", "French"), for logging.
 */
export async function generateSpeech(text: string, voice: string, language: string): Promise<string> {
  try {
    const genAI = getAi();
    
    // By providing a clear, instructional context like "Say the number:", we reduce the
    // ambiguity of sending isolated words in various languages. This helps prevent the
    // model's safety filters from being incorrectly triggered, which is a common
    // cause of failure for non-English content.
    const prompt = `Say the number: ${text}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    // Find the audio part robustly, as it may not be the first part in the array.
    const audioPart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData && part.inlineData.data);
    const base64Audio = audioPart?.inlineData?.data;

    if (base64Audio) {
      return base64Audio;
    } else {
      // Check if there was text returned instead of audio and throw a more specific error.
      const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
      if (textPart) {
        throw new Error(`Model returned text instead of audio: ${textPart}`);
      }
      // Log the full response for better debugging if no audio or text is found.
      console.error("Full API Response on failure:", JSON.stringify(response, null, 2));
      throw new Error("No audio data received from API. Check console for full response.");
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    // Re-throwing the error so it can be caught by the UI
    throw error;
  }
}