/**
 * Smart AI Travel Planner 3.0
 * Server-Side Gemini API Client
 *
 * Adheres strictly to gemini-api skill:
 * - Uses `@google/genai` with `GoogleGenAI`
 * - Sets 'User-Agent': 'aistudio-build' header
 * - Uses `gemini-3.8-flash` as the core reasoning model
 * - Handles API key from process.env.GEMINI_API_KEY
 * - Safe error handling with fallbacks
 */

import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiClient;
}

export async function generateGeminiText(prompt: string, systemInstruction?: string): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 4000)
    );

    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          temperature: 0.7,
        },
      }),
      timeoutPromise,
    ]);

    return response.text || null;
  } catch (err) {
    console.warn('[Gemini Service] API call failed or timed out, falling back to curated intelligence:', (err as any)?.message || err);
    return null;
  }
}
