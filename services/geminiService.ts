
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
        // A detailed prompt to ensure the model returns only the translated number.
        const prompt = `Convert the number ${number} into words in ${language}. Only return the number in words. For example, if the number is 42 and the language is French, you should only return "quarante-deux". Do not add any other text, punctuation, or explanation.`;

        const response = await genAI.models.generateContent({
            model: model,
            contents: prompt
        });
        
        const text = response.text?.trim();

        if (!text) {
            console.error("Full API Response on translation failure:", JSON.stringify(response, null, 2));
            throw new Error("Failed to translate number: Gemini API returned an empty response.");
        }
        
        // Remove potential markdown or quotes from the model's response.
        return text.replace(/[`"']/g, '');

    } catch (error) {
        console.error(`Error translating number ${number} to ${language}:`, error);
        throw error;
    }
}
