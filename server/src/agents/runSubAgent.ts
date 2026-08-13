import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, DEFAULT_MODEL, withOverloadRetry } from "../services/llmClient";
import { buildContractContextMessage } from "./promptHelpers";
import { SubAgentOutputSchema, type ClauseInput, type RiskCategory, type SubAgentOutput } from "./types";

export async function runSubAgent(
  category: RiskCategory,
  systemPrompt: string,
  contractText: string,
  relevantClauses: ClauseInput[]
): Promise<SubAgentOutput> {
  if (relevantClauses.length === 0) {
    return { agent: category, findings: [] };
  }

  const response = await withOverloadRetry(() =>
    anthropic.messages.parse({
      model: DEFAULT_MODEL,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: buildContractContextMessage(contractText, relevantClauses) }],
      output_config: {
        format: zodOutputFormat(SubAgentOutputSchema),
        effort: "medium",
      },
    })
  );

  if (!response.parsed_output) {
    throw new Error(`${category} agent returned unparseable output`);
  }

  return response.parsed_output;
}
