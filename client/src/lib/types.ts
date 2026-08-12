export const RISK_CATEGORIES = ["liability", "ip", "termination", "data_privacy", "dispute"] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  liability: "Liability",
  ip: "IP",
  termination: "Termination",
  data_privacy: "Data / Privacy",
  dispute: "Dispute",
};

export type RiskLevel = "high" | "medium" | "low";

export type RiskGroup = "🔴 High Risk" | "🟠 Review" | "🟢 Low Concern";

export interface UploadResponse {
  id: string;
  title: string;
  clauseCount: number;
  analysisStatus: "completed" | "failed";
  analysisError?: string;
}

export interface Finding {
  id: string;
  clauseId: string | null;
  agent: string;
  category: RiskCategory;
  riskLevel: RiskLevel;
  summary: string;
  evidenceQuote: string;
  suggestion: string;
  flaggedInconsistent: boolean;
  criticNote: string | null;
  group: RiskGroup;
}

export interface ContractReport {
  riskScore: number;
  categoryCounts: Record<RiskCategory, number>;
  findings: Finding[];
}

export interface ApiErrorBody {
  error: string;
}
