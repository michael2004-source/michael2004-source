
import { GoogleGenAI, Modality } from "@google/genai";

export async function generateSpokenNumber(
  number: number,
  languageName: string,
  voiceName: string = 'Kore'
): Promise<string> {
  // Always use a fresh instance to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  /**
   * The gemini-2.5-flash-preview-tts model is highly sensitive to prompts.
   * If the prompt looks like a question or an instruction that 'needs' an answer, 
   * it might return text. We use the recommended 'Say [Style]: [Content]' format.
   */
  const prompt = `Say clearly: ${number} in ${languageName}`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ 
        parts: [{ 
          text: prompt 
        }] 
      }],
      config: {
        // System instruction is supported in config to guide model behavior
        systemInstruction: "You are a specialized text-to-speech engine. Your only output is the spoken audio of the requested text. Never output text characters or descriptions.",
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    // Extracting audio from candidates
    const parts = response.candidates?.[0]?.content?.parts;
    const audioPart = parts?.find(p => p.inlineData);
    const textPart = parts?.find(p => p.text);

    if (audioPart?.inlineData?.data) {
      return audioPart.inlineData.data;
    }

    if (textPart?.text) {
      throw new Error(`Model returned text instead of audio: "${textPart.text.substring(0, 50)}..."`);
    }

    throw new Error("The model did not return audio data. Try a simpler number or a different language.");
  } catch (error: any) {
    console.error("Gemini TTS API Error:", error);
    throw error;
  }
}
