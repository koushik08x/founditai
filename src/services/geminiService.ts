import { GoogleGenAI } from '@google/genai';
import { ItemReport } from '../types';

const STORAGE_KEY = 'foundit_gemini_api_key';

export const getGeminiApiKey = (): string => {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (localKey && localKey.trim().length > 10) {
    return localKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (envKey && envKey !== 'your-gemini-api-key' && envKey.length > 10) {
    return envKey;
  }
  return '';
};

export const setGeminiApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    if (!key || key.trim() === '') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  }
};

export const clearGeminiApiKey = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const isGeminiConfigured = (): boolean => {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 10);
};

export interface GeminiSemanticResult {
  semanticScore: number; // 0 - 100
  aiExplanation: string;
  identifiedSimilarities: string[];
  identifiedDifferences: string[];
}

/**
 * Perform semantic analysis using Google Gemini 2.5 Flash
 */
export async function analyzeMatchWithGemini(
  lost: ItemReport,
  found: ItemReport,
  overrideApiKey?: string
): Promise<GeminiSemanticResult | null> {
  const key = overrideApiKey || getGeminiApiKey();
  if (!key || key.length < 10) {
    return null; // Gracefully fallback to deterministic rule-based engine
  }

  let client: GoogleGenAI;
  try {
    client = new GoogleGenAI({ apiKey: key });
  } catch (err) {
    console.warn('Failed to initialize Google GenAI client:', err);
    return null;
  }

  try {
    const prompt = `
You are the AI engine for FoundIt AI, a campus lost-and-found system.
Evaluate the semantic likelihood that these two reports describe the EXACT SAME lost and found item.

LOST REPORT:
- Name: ${lost.item_name}
- Category: ${lost.category}
- Description: ${lost.description}
- Color: ${lost.color || 'Not specified'}
- Distinguishing Details: ${lost.distinguishing_details || 'None'}

FOUND REPORT:
- Name: ${found.item_name}
- Category: ${found.category}
- Description: ${found.description}
- Color: ${found.color || 'Not specified'}
- Distinguishing Details: ${found.distinguishing_details || 'None'}

Return ONLY a valid JSON object with the following schema:
{
  "semanticScore": number (0 to 100 representing probability of being the same item),
  "aiExplanation": string (1-2 sentences summarizing the semantic comparison),
  "identifiedSimilarities": string[] (up to 3 key shared details),
  "identifiedDifferences": string[] (up to 3 contradictions or distinct differences)
}
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;

    const parsed: GeminiSemanticResult = JSON.parse(text);
    return {
      semanticScore: Math.min(100, Math.max(0, parsed.semanticScore || 0)),
      aiExplanation: parsed.aiExplanation || 'Analyzed with Google Gemini 2.5 Flash',
      identifiedSimilarities: parsed.identifiedSimilarities || [],
      identifiedDifferences: parsed.identifiedDifferences || []
    };
  } catch (err) {
    console.warn('Google Gemini API request failed, falling back to rule-based engine:', err);
    return null;
  }
}
