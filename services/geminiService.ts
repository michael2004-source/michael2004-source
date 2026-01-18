
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
const getAi = () => {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API_KEY environment variable is not set.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

/**
 * Translates a number into its word representation in a given language.
 * @param number The number to translate.
 * @param language The target language name (e.g., "French").
 * @returns A promise that resolves to the number in words.
 */
export async function translateNumberToWords(number: number, language: string): Promise<string> {
    try {
        const genAI = getAi();
        const model = 'gemini-3-flash-preview';
        
        // Using a system instruction provides a stronger context for the model,
        // making it more reliable at following the language and formatting constraints.
        const systemInstruction = `You are a number-to-word translator. You will be given a number and you must respond with the number written out in ${language}. You must only return the words for the number and nothing else. No punctuation, no explanations. For example, if you are asked for 42 in French, your response should be exactly "quarante-deux".`;
        
        const prompt = `${number}`;

        const response = await genAI.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        const text = response.text?.trim();

        if (!text) {
            console.error("Full API Response on translation failure:", JSON.stringify(response, null, 2));
            throw new Error("Failed to translate number: Gemini API returned an empty response.");
        }
        
        // Remove potential markdown or quotes and normalize to lowercase.
        return text.replace(/[`"']/g, '').toLowerCase();

    } catch (error) {
        console.error(`Error translating number ${number} to ${language}:`, error);
        throw error;
    }
}