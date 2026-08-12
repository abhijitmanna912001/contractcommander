import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

// Defaults to Claude Opus 5; override via env if a different model is preferred.
export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
