import Anthropic, { APIError } from "@anthropic-ai/sdk";

// maxRetries: 0 — the SDK's built-in retry also covers 408/409/5xx broadly,
// which is wider than we want. withOverloadRetry below handles retrying
// explicitly, scoped to just 429 and 529.
export const anthropic = new Anthropic({ maxRetries: 0 });

// Defaults to Claude Sonnet 5 — our production choice, and a safer fallback
// than Opus if ANTHROPIC_MODEL is ever unset. Override via env if needed.
export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

const RETRYABLE_STATUS_CODES = new Set([429, 529]); // rate limited, overloaded
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  return error instanceof APIError && error.status !== undefined && RETRYABLE_STATUS_CODES.has(error.status);
}

// Retries an Anthropic API call up to MAX_RETRIES times with exponential
// backoff (1s, then 2s), but only when it fails with 429 (rate limited) or
// 529 (overloaded) — both are transient and often resolve within seconds.
// Anything else (400 bad request, 401 auth, etc.) is a real error retrying
// won't fix, so it's rethrown immediately without delay.
export async function withOverloadRetry<T>(call: () => Promise<T>): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await call();
    } catch (error) {
      if (attempt >= MAX_RETRIES || !isRetryableError(error)) {
        throw error;
      }
      attempt += 1;
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }
}
