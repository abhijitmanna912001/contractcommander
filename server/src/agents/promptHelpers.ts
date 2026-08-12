import type { ClauseInput } from "./types";

export function formatClausesForPrompt(clauses: ClauseInput[]): string {
  return clauses
    .map(
      (clause) =>
        `Clause ID: ${clause.id}\nHeading: ${clause.heading ?? "(none)"}\nText: ${clause.text}`
    )
    .join("\n\n---\n\n");
}

export const SUB_AGENT_OUTPUT_INSTRUCTIONS = `
Only produce findings for clauses in the "CLAUSES TAGGED FOR YOUR REVIEW" list — use the full
contract text solely as context for understanding those clauses. For each finding:
- "clauseId" must exactly match one of the provided Clause IDs.
- "riskLevel" is "high", "medium", or "low".
- "evidenceQuote" must be an exact quote (15 words or fewer) copied verbatim from that clause's text.
- "summary" explains the risk in one or two sentences.
- "suggestion" is a concrete redline or negotiation point that would reduce the risk.
A clause with no meaningful risk in your category can be omitted from "findings" entirely.`.trim();

export function buildContractContextMessage(
  contractText: string,
  clauses: ClauseInput[],
  clauseListLabel = "CLAUSES TAGGED FOR YOUR REVIEW"
): string {
  return [
    "FULL CONTRACT TEXT:",
    contractText,
    "",
    `${clauseListLabel}:`,
    formatClausesForPrompt(clauses),
  ].join("\n");
}
