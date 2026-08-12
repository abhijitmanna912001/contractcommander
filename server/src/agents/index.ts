import { runCommander } from "./runCommander";
import { runCritic, type RawFinding } from "./runCritic";
import { runSubAgent } from "./runSubAgent";
import { DATA_PRIVACY_SYSTEM_PROMPT } from "./prompts/dataPrivacy";
import { DISPUTE_SYSTEM_PROMPT } from "./prompts/dispute";
import { IP_SYSTEM_PROMPT } from "./prompts/ip";
import { LIABILITY_SYSTEM_PROMPT } from "./prompts/liability";
import { TERMINATION_SYSTEM_PROMPT } from "./prompts/termination";
import { RISK_CATEGORIES, type ClauseInput, type CriticFinding, type RiskCategory } from "./types";

const SUB_AGENT_PROMPTS: Record<RiskCategory, string> = {
  liability: LIABILITY_SYSTEM_PROMPT,
  ip: IP_SYSTEM_PROMPT,
  termination: TERMINATION_SYSTEM_PROMPT,
  data_privacy: DATA_PRIVACY_SYSTEM_PROMPT,
  dispute: DISPUTE_SYSTEM_PROMPT,
};

function clampToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ");
}

export interface ContractAnalysisResult {
  taggedClauses: { clauseId: string; categories: RiskCategory[] }[];
  findings: CriticFinding[];
}

export async function runContractAnalysis(
  contractText: string,
  clauses: ClauseInput[]
): Promise<ContractAnalysisResult> {
  const commanderOutput = await runCommander(contractText, clauses);

  const categoriesByClauseId = new Map<string, RiskCategory[]>();
  for (const tagged of commanderOutput.taggedClauses) {
    categoriesByClauseId.set(tagged.clauseId, tagged.categories);
  }

  const rawFindings: RawFinding[] = [];

  // Sub-agents run as sequential LLM calls, one risk category at a time.
  for (const category of RISK_CATEGORIES) {
    const relevantClauses = clauses.filter((clause) =>
      (categoriesByClauseId.get(clause.id) ?? []).includes(category)
    );

    const subAgentOutput = await runSubAgent(
      category,
      SUB_AGENT_PROMPTS[category],
      contractText,
      relevantClauses
    );

    for (const finding of subAgentOutput.findings) {
      rawFindings.push({ agent: subAgentOutput.agent, ...finding });
    }
  }

  const criticOutput = await runCritic(contractText, rawFindings);

  const findings = criticOutput.findings.map((finding) => ({
    ...finding,
    evidenceQuote: clampToWords(finding.evidenceQuote, 15),
  }));

  return { taggedClauses: commanderOutput.taggedClauses, findings };
}
