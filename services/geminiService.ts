
/**
 * Translates a number into its word representation in a given language using the browser's Intl API.
 * @param number The number to translate.
 * @param languageCode The BCP 47 language tag (e.g., "fr-FR").
 * @returns The number written out in words.
 */
export function translateNumberToWords(number: number, languageCode: string): string {
    try {
        return new Intl.NumberFormat(languageCode, { style: 'spellout' }).format(number);
    } catch (error) {
        console.error(`Error translating number ${number} to ${languageCode}:`, error);
        // Fallback for unsupported languages or other errors
        return number.toString();
    }
}
