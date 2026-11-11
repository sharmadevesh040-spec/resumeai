/**
 * Exclusive Google Gemini Provider
 * All AI capabilities are powered exclusively by Google Gemini via @google/genai.
 * No external LLMs (OpenAI, Claude, etc.) are allowed.
 */
import { callGemini, isGeminiConfigured } from "./gemini";
import { getGeminiConfig } from "./gemini-config";

export interface AIProvider {
  name: string;
  generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T>;
}

export class GeminiOfficialProvider implements AIProvider {
  name = "Google Gemini";

  async generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    return callGemini<T>({
      systemInstruction: systemPrompt,
      prompt: userPrompt,
      taskType: "standard",
      operationName: "gemini_provider",
    });
  }
}

/**
 * Returns the exclusive AI provider (Google Gemini).
 */
export function getAIProvider(): AIProvider {
  return new GeminiOfficialProvider();
}
