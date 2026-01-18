
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
 * @param text The number to speak.
 * @param voice The specific voice to use.
 * @param language The name of the language (e.g., "Japanese", "French").
 */
export async function generateSpeech(text: string, voice: string, language: string): Promise<string> {
  try {
    const genAI = getAi();
    
    // We use a simple prompt and move the translation context to the systemInstruction.
    // This is more reliable for the TTS-specific model and prevents it from 
    // trying to 'explain' the translation in text, which causes the error.
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak the number ${text}` }] }],
      config: {
        systemInstruction: `You are a native ${language} speaker. Your task is to translate the provided number into ${language} and speak it clearly. Output ONLY the audio for the translated number.`,
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return base64Audio;
    } else {
      // Check if there was text returned instead of audio
      const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
      if (textPart) {
        throw new Error(`Model returned text instead of audio: ${textPart}`);
      }
      throw new Error("No audio data received from API.");
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}
