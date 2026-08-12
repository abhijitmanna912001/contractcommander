import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, DEFAULT_MODEL } from "../services/llmClient";
import { CRITIC_SYSTEM_PROMPT } from "./prompts/critic";
import { CriticOutputSchema, type CriticOutput, type RiskCategory, type RiskLevel } from "./types";

export interface RawFinding {
  agent: RiskCategory;
  clauseId: string;
  riskLevel: RiskLevel;
  summary: string;
  evidenceQuote: string;
  suggestion: string;
}

export async function runCritic(contractText: string, rawFindings: RawFinding[]): Promise<CriticOutput> {
  if (rawFindings.length === 0) {
    return { findings: [] };
  }

  const userMessage = [
    "FULL CONTRACT TEXT:",
    contractText,
    "",
    "RAW SUB-AGENT FINDINGS (JSON):",
    JSON.stringify(rawFindings, null, 2),
  ].join("\n");

  const response = await anthropic.messages.parse({
    model: DEFAULT_MODEL,
    max_tokens: 8000,
    system: CRITIC_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    output_config: {
      format: zodOutputFormat(CriticOutputSchema),
      effort: "medium",
    },
  });

  if (!response.parsed_output) {
    throw new Error("Critic agent returned unparseable output");
  }

  return response.parsed_output;
}
