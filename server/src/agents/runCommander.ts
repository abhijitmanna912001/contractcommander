import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, DEFAULT_MODEL } from "../services/llmClient";
import { COMMANDER_SYSTEM_PROMPT } from "./prompts/commander";
import { buildContractContextMessage } from "./promptHelpers";
import { CommanderOutputSchema, type ClauseInput, type CommanderOutput } from "./types";

export async function runCommander(
  contractText: string,
  clauses: ClauseInput[]
): Promise<CommanderOutput> {
  const response = await anthropic.messages.parse({
    model: DEFAULT_MODEL,
    max_tokens: 8000,
    system: COMMANDER_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildContractContextMessage(contractText, clauses, "ALL CLAUSES TO CLASSIFY"),
      },
    ],
    output_config: {
      format: zodOutputFormat(CommanderOutputSchema),
      effort: "medium",
    },
  });

  if (!response.parsed_output) {
    throw new Error("Commander agent returned unparseable output");
  }

  return response.parsed_output;
}
