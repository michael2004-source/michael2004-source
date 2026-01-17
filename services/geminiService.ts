
import { GoogleGenAI, Modality } from "@google/genai";

export async function generateSpokenNumber(
  number: number,
  languageName: string,
  voiceName: string = 'Kore'
): Promise<string> {
  // Always use the latest API key from environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  /**
   * For the 'gemini-2.5-flash-preview-tts' model, the prompt should be concise.
   * Using the format 'Say [style]: [content]' as recommended in documentation.
   */
  const prompt = `Say clearly in ${languageName}: ${number}`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      // CRITICAL: Explicitly structure contents as an array of parts objects
      contents: [{ 
        parts: [{ 
          text: prompt 
        }] 
      }],
      config: {
        // Must be exactly [Modality.AUDIO]
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    // Extracting audio from the specific part structure
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      // If the model returns text instead of audio, it's often a safety or prompt understanding issue
      const possibleText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      throw new Error(
        possibleText 
        ? `Model returned text instead of audio: "${possibleText}"` 
        : "The model did not return any audio data. Please try a different number or language."
      );
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS API Error:", error);
    throw error;
  }
}
