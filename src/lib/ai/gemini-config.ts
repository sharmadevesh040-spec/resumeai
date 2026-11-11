/**
 * Centralized Gemini Configuration & Usage Tracking
 * Exclusively manages Google Gemini API configuration, model selection, timeouts, and rate limits.
 */

export interface GeminiConfig {
  apiKey: string;
  defaultModel: string;
  complexModel: string;
  maxRetries: number;
  timeoutMs: number;
  isConfigured: boolean;
}

export interface TokenUsageRecord {
  model: string;
  promptTokens?: number;
  candidateTokens?: number;
  totalTokens?: number;
  durationMs: number;
  operation: string;
  timestamp: string;
}

// In-memory telemetry log for current server session (retained without sensitive PII)
const sessionUsageHistory: TokenUsageRecord[] = [];

/**
 * Retrieves the current centralized Gemini configuration.
 * Validates that credentials exist only on the server.
 */
export function getGeminiConfig(): GeminiConfig {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY VIOLATION: Gemini configuration and API keys must never be accessed on the client-side.");
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
  const defaultModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const complexModel = process.env.GEMINI_COMPLEX_MODEL?.trim() || "gemini-2.5-flash";
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || 30000;
  const maxRetries = Number(process.env.GEMINI_MAX_RETRIES) || 3;

  return {
    apiKey,
    defaultModel,
    complexModel,
    maxRetries,
    timeoutMs,
    isConfigured: Boolean(apiKey && apiKey.length > 5),
  };
}

/**
 * Checks whether the Gemini API key has been configured.
 */
export function isGeminiConfigured(): boolean {
  try {
    return getGeminiConfig().isConfigured;
  } catch {
    return false;
  }
}

/**
 * Returns the optimal model for a specific task category:
 * - Complex: End-to-end full resume generation, cross-source synthesis, deep document understanding
 * - Standard: Summaries, bullet improvements, ATS checks, skills categorization, grammar
 */
export function getModelForTask(taskType: "complex" | "standard" | "fast" = "standard"): string {
  const config = getGeminiConfig();
  if (taskType === "complex") {
    return config.complexModel || config.defaultModel;
  }
  return config.defaultModel;
}

/**
 * Records token usage and performance metrics for auditing and cost control.
 */
export function recordGeminiUsage(record: Omit<TokenUsageRecord, "timestamp">): void {
  const fullRecord: TokenUsageRecord = {
    ...record,
    timestamp: new Date().toISOString(),
  };
  sessionUsageHistory.push(fullRecord);
  // Keep rolling window of last 200 operations
  if (sessionUsageHistory.length > 200) {
    sessionUsageHistory.shift();
  }
}

export function getGeminiUsageLog(): readonly TokenUsageRecord[] {
  return [...sessionUsageHistory];
}

/**
 * Returns aggregated usage metrics for the active session.
 */
export function getGeminiTelemetry() {
  const totalCalls = sessionUsageHistory.length;
  const totalTokens = sessionUsageHistory.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0);
  const avgDurationMs = totalCalls > 0
    ? Math.round(sessionUsageHistory.reduce((acc, curr) => acc + curr.durationMs, 0) / totalCalls)
    : 0;

  return {
    totalCalls,
    totalTokens,
    avgDurationMs,
    lastOperation: sessionUsageHistory[sessionUsageHistory.length - 1] || null,
  };
}
