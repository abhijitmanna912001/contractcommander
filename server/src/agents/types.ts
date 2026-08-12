import { z } from "zod";

export const RISK_CATEGORIES = [
  "liability",
  "ip",
  "termination",
  "data_privacy",
  "dispute",
] as const;

export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const RiskCategorySchema = z.enum(RISK_CATEGORIES);
export const RiskLevelSchema = z.enum(["high", "medium", "low"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export interface ClauseInput {
  id: string;
  heading: string | null;
  text: string;
}

export const CommanderOutputSchema = z.object({
  taggedClauses: z.array(
    z.object({
      clauseId: z.string(),
      categories: z.array(RiskCategorySchema),
    })
  ),
});
export type CommanderOutput = z.infer<typeof CommanderOutputSchema>;

export const SubAgentFindingSchema = z.object({
  clauseId: z.string(),
  riskLevel: RiskLevelSchema,
  summary: z.string(),
  evidenceQuote: z.string(),
  suggestion: z.string(),
});
export type SubAgentFinding = z.infer<typeof SubAgentFindingSchema>;

export const SubAgentOutputSchema = z.object({
  agent: RiskCategorySchema,
  findings: z.array(SubAgentFindingSchema),
});
export type SubAgentOutput = z.infer<typeof SubAgentOutputSchema>;

export const CriticFindingSchema = z.object({
  clauseId: z.string(),
  category: RiskCategorySchema,
  riskLevel: RiskLevelSchema,
  summary: z.string(),
  evidenceQuote: z.string(),
  suggestion: z.string(),
  flaggedInconsistent: z.boolean(),
  criticNote: z.string().nullable(),
});
export type CriticFinding = z.infer<typeof CriticFindingSchema>;

export const CriticOutputSchema = z.object({
  findings: z.array(CriticFindingSchema),
});
export type CriticOutput = z.infer<typeof CriticOutputSchema>;
