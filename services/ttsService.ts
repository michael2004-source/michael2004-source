
import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAi = () => {
    if (!ai) {
        // FIX: Per coding guidelines, the API key must be obtained from process.env.API_KEY. This resolves the error "Property 'env' does not exist on type 'ImportMeta'".
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            // This error will be visible in the browser console if the key is missing.
            throw new Error("API_KEY environment variable is not set.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

export async function generateSpeech(text: string, voice: string): Promise<string> {
  try {
    const genAI = getAi();
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
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
      throw new Error("No audio data received from API.");
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}
