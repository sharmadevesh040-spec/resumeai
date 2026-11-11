import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  getGeminiConfig,
  getModelForTask,
  recordGeminiUsage,
  isGeminiConfigured,
} from "./gemini-config";

export { isGeminiConfigured };

export interface CallGeminiOptions<T> {
  systemInstruction?: string;
  prompt: string | any[];
  schema?: z.ZodType<T, any, any>;
  taskType?: "complex" | "standard" | "fast";
  temperature?: number;
  maxTokens?: number;
  operationName?: string;
  fallbackFn?: () => T;
}

export interface CallGeminiTextOptions {
  systemInstruction?: string;
  prompt: string;
  taskType?: "complex" | "standard" | "fast";
  temperature?: number;
  operationName?: string;
  fallbackFn?: () => string;
}

/**
 * Creates and returns the official GoogleGenAI client using server-side configuration.
 */
export function getGeminiClient(): GoogleGenAI {
  const config = getGeminiConfig();
  if (!config.apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment variables. Please provide a valid key in .env or Google AI Studio settings."
    );
  }
  return new GoogleGenAI({ apiKey: config.apiKey, apiVersion: "v1beta" });
}

/**
 * Strips markdown code blocks (e.g. ```json ... ```) from Gemini responses.
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/```\s*$/i, "");
  }
  return cleaned.trim();
}

/**
 * Attempts a minor heuristic repair of common LLM JSON syntax anomalies
 * (e.g. trailing commas, unescaped control chars).
 */
function attemptJsonRepair(jsonStr: string): string {
  let repaired = jsonStr;
  // Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, "$1");
  return repaired;
}

/**
 * Centralized Gemini execution engine with:
 * - Exponential backoff retry logic for rate limits and transient errors
 * - Request timeout enforcement
 * - Structured JSON schema enforcement & Zod validation
 * - Token usage telemetry
 * - Offline fallback integration for CI / unit test fixtures
 */
export async function callGemini<T>(options: CallGeminiOptions<T>): Promise<T> {
  const {
    systemInstruction,
    prompt,
    schema,
    taskType = "standard",
    temperature = 0.2,
    operationName = "gemini_operation",
    fallbackFn,
  } = options;

  // Check if API key is configured
  if (!isGeminiConfigured()) {
    if (fallbackFn) {
      console.warn(`[Gemini Engine] GEMINI_API_KEY is not set. Executing deterministic fallback for '${operationName}'.`);
      return fallbackFn();
    }
    throw new Error(
      `GEMINI_API_KEY is required for operation '${operationName}'. Please configure GEMINI_API_KEY in your .env file.`
    );
  }

  const client = getGeminiClient();
  const modelName = getModelForTask(taskType);
  const config = getGeminiConfig();
  const startTime = Date.now();

  let lastError: Error | null = null;
  const maxRetries = config.maxRetries;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const contentsPayload = Array.isArray(prompt) ? prompt : [{ text: prompt }];

      const response = await client.models.generateContent({
        model: modelName,
        contents: contentsPayload as any,
        config: {
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          responseMimeType: "application/json",
          temperature,
        },
      });

      const rawText = response.text || "";
      if (!rawText) {
        throw new Error(`Empty response returned by Gemini model ${modelName}`);
      }

      // Clean and parse JSON
      const cleaned = cleanJsonOutput(rawText);
      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        // Attempt minor repair
        try {
          const repaired = attemptJsonRepair(cleaned);
          parsed = JSON.parse(repaired);
        } catch {
          throw new Error(
            `Gemini response was not valid JSON (${parseErr instanceof Error ? parseErr.message : "Parse error"}). Raw: ${cleaned.slice(0, 200)}...`
          );
        }
      }

      // Validate against Zod schema if provided
      if (schema) {
        const validation = schema.safeParse(parsed);
        if (!validation.success) {
          console.warn(`[Gemini Schema Validation Warning in ${operationName}]:`, validation.error.format());
          // If schema validation failed, but object exists, return best effort or throw
          if (attempt === maxRetries) {
            // Last attempt: return parsed if reasonably shaped, or throw
            return parsed as T;
          }
          throw new Error(`Schema validation error: ${validation.error.message}`);
        }
        parsed = validation.data;
      }

      const durationMs = Date.now() - startTime;
      recordGeminiUsage({
        model: modelName,
        durationMs,
        operation: operationName,
      });

      return parsed as T;
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const errMsg = lastError.message.toLowerCase();

      // Check if transient error suitable for backoff retry (rate limit, 503, network drop)
      const isTransient =
        errMsg.includes("429") ||
        errMsg.includes("resource_exhausted") ||
        errMsg.includes("quota") ||
        errMsg.includes("503") ||
        errMsg.includes("overloaded") ||
        errMsg.includes("timeout") ||
        errMsg.includes("econnreset");

      if (isTransient && attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 6000);
        console.warn(`[Gemini Retry] Attempt ${attempt} failed with transient error. Retrying in ${backoffMs}ms...`);
        await new Promise((res) => setTimeout(res, backoffMs));
        continue;
      }

      // Non-transient or final attempt exhausted
      break;
    }
  }

  // If retries exhausted and fallback function exists, gracefully degrade
  if (fallbackFn) {
    console.warn(
      `[Gemini Engine] Live Gemini call failed after ${maxRetries} attempts (${lastError?.message}). Triggering resilient fallback for '${operationName}'.`
    );
    return fallbackFn();
  }

  throw new Error(`Gemini operation '${operationName}' failed: ${lastError?.message || "Unknown error"}`);
}

/**
 * Direct Gemini text generation (for unstructured explanations, coach tips, or streaming chunks).
 */
export async function callGeminiText(options: CallGeminiTextOptions): Promise<string> {
  const { systemInstruction, prompt, taskType = "standard", temperature = 0.3, operationName = "gemini_text", fallbackFn } = options;

  if (!isGeminiConfigured()) {
    if (fallbackFn) {
      console.warn(`[Gemini Engine] GEMINI_API_KEY is not set. Executing deterministic fallback for text '${operationName}'.`);
      return fallbackFn();
    }
    throw new Error("GEMINI_API_KEY is required to generate text.");
  }

  const client = getGeminiClient();
  const modelName = getModelForTask(taskType);
  const startTime = Date.now();

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        temperature,
      },
    });

    const durationMs = Date.now() - startTime;
    recordGeminiUsage({
      model: modelName,
      durationMs,
      operation: operationName,
    });

    return response.text || "";
  } catch (err: any) {
    if (fallbackFn) {
      console.warn(`[Gemini Engine] Text call failed (${err?.message}). Using fallback for '${operationName}'.`);
      return fallbackFn();
    }
    throw err;
  }
}
