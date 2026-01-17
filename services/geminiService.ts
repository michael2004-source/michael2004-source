
import { GoogleGenAI, Modality } from "@google/genai";

export async function generateSpokenNumber(
  number: number,
  languageName: string,
  voiceName: string = 'Kore'
): Promise<string> {
  // Access the API key from the global shim
  const apiKey = (window as any).process?.env?.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
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
        systemInstruction: "You are a specialized text-to-speech engine. Your only output is the spoken audio of the requested text. Never output text characters or descriptions.",
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

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
