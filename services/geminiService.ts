
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

/**
 * Extracts a 3-digit number from the given title using Gemini API.
 * @param apiKey The Gemini API key.
 * @param title The document title.
 * @returns The extracted 3-digit number as a string, or null if not found or error.
 */
export const extractVideoNumberFromTitle = async (apiKey: string, title: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `提供されたテキストから、連続する3桁の数字を抽出してください。もし3桁の数字が見つからない場合は、「NONE」と回答してください。テキスト： 「${title}」`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const textResponse = response.text.trim();

    if (textResponse === "NONE" || !/^\d{3}$/.test(textResponse)) {
      console.warn(`Gemini did not return a valid 3-digit number. Response: ${textResponse}`);
      return null;
    }
    return textResponse;

  } catch (error) {
    console.error("Error extracting video number from title with Gemini:", error);
    // Consider more specific error handling or re-throwing if needed
    return null;
  }
};
