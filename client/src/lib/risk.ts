import type { Finding, RiskGroup } from "./types";

export type ScoreTier = "low" | "medium" | "high";

export interface ScoreTierInfo {
  tier: ScoreTier;
  label: string;
  description: string;
}

/** score > 75 => low risk, 50-75 => moderate, < 50 => high. */
export function getScoreTier(score: number): ScoreTierInfo {
  if (score > 75) {
    return {
      tier: "low",
      label: "Low Risk",
      description: "This contract looks reasonably balanced. Skim the findings below before signing.",
    };
  }
  if (score >= 50) {
    return {
      tier: "medium",
      label: "Moderate Risk",
      description: "Several clauses are worth a closer look before you sign.",
    };
  }
  return {
    tier: "high",
    label: "High Risk",
    description: "This contract carries significant risk exposure. Review carefully before proceeding.",
  };
}

export const GROUP_ORDER: RiskGroup[] = ["🔴 High Risk", "🟠 Review", "🟢 Low Concern"];

export function groupFindings(findings: Finding[]): Map<RiskGroup, Finding[]> {
  const grouped = new Map<RiskGroup, Finding[]>();
  for (const finding of findings) {
    const bucket = grouped.get(finding.group);
    if (bucket) {
      bucket.push(finding);
    } else {
      grouped.set(finding.group, [finding]);
    }
  }
  return grouped;
}
