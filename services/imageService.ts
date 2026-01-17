
import { GoogleGenAI, Type } from "@google/genai";
import { ImageAnalysisResult } from "../types.ts";

export async function analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
  const apiKey = (window as any).process?.env?.API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  // 1. Fetch the image and convert to base64
  let base64Data: string;
  let mimeType: string;

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    mimeType = blob.type;
    
    base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch image:", error);
    throw new Error("Unable to fetch image. Please ensure the URL is valid and allows cross-origin requests (CORS).");
  }

  // 2. Call Gemini for analysis
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Analyze this image and determine if it contains human teeth, a smile, or anything closely related to dental anatomy. Return the result in JSON format.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "The description of the image content.",
            },
            is_teeth: {
              type: Type.BOOLEAN,
              description: "Whether the image is about teeth or smile or anything related to teeth.",
            },
            confidence_score: {
              type: Type.NUMBER,
              description: "Confidence score between 0 and 1.",
            },
          },
          required: ["description", "is_teeth", "confidence_score"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI model.");

    const parsedResult = JSON.parse(resultText);
    return {
      ...parsedResult,
      imageUrl,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw error;
  }
}
