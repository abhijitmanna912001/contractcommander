import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

// Defaults to Claude Sonnet 5 — our production choice, and a safer fallback
// than Opus if ANTHROPIC_MODEL is ever unset. Override via env if needed.
export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
