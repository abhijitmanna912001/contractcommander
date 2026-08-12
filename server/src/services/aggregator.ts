import { RISK_CATEGORIES, type RiskCategory, type RiskLevel } from "../agents/types";

export type RiskGroup = "🔴 High Risk" | "🟠 Review" | "🟢 Low Concern";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computeRiskScore(riskLevels: RiskLevel[]): number {
  const high = riskLevels.filter((level) => level === "high").length;
  const medium = riskLevels.filter((level) => level === "medium").length;
  const low = riskLevels.filter((level) => level === "low").length;

  return clamp(100 - 10 * high - 4 * medium - 1 * low, 0, 100);
}

export function groupForRiskLevel(level: RiskLevel): RiskGroup {
  switch (level) {
    case "high":
      return "🔴 High Risk";
    case "medium":
      return "🟠 Review";
    case "low":
      return "🟢 Low Concern";
  }
}

export interface AggregatableFinding {
  riskLevel: RiskLevel;
  category: RiskCategory;
}

export interface RiskReport<T extends AggregatableFinding> {
  riskScore: number;
  categoryCounts: Record<RiskCategory, number>;
  findings: (T & { group: RiskGroup })[];
}

/** Plain-code aggregation over already-persisted findings — no LLM call. */
export function buildRiskReport<T extends AggregatableFinding>(findings: T[]): RiskReport<T> {
  const riskScore = computeRiskScore(findings.map((finding) => finding.riskLevel));

  const categoryCounts = RISK_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = 0;
      return acc;
    },
    {} as Record<RiskCategory, number>
  );

  for (const finding of findings) {
    categoryCounts[finding.category] += 1;
  }

  const findingsWithGroup = findings.map((finding) => ({
    ...finding,
    group: groupForRiskLevel(finding.riskLevel),
  }));

  return { riskScore, categoryCounts, findings: findingsWithGroup };
}
