import { prisma } from "./prismaClient";
import { buildRiskReport, type RiskReport } from "./aggregator";
import type { ClauseInput, CriticFinding, RiskCategory, RiskLevel } from "../agents/types";
import type { ExtractedClause } from "./textExtraction";

export interface NewContractInput {
  title: string;
  fileName: string;
  mimeType: string;
  rawText: string;
  clauses: ExtractedClause[];
}

export async function createContractWithClauses(input: NewContractInput) {
  const contract = await prisma.contract.create({
    data: {
      title: input.title,
      fileName: input.fileName,
      mimeType: input.mimeType,
      rawText: input.rawText,
      clauses: {
        create: input.clauses.map((clause) => ({
          index: clause.index,
          heading: clause.heading,
          text: clause.text,
        })),
      },
    },
    include: { clauses: { orderBy: { index: "asc" } } },
  });

  return contract;
}

export function toClauseInputs(clauses: { id: string; heading: string | null; text: string }[]): ClauseInput[] {
  return clauses.map((clause) => ({ id: clause.id, heading: clause.heading, text: clause.text }));
}

export async function persistClauseCategories(
  taggedClauses: { clauseId: string; categories: RiskCategory[] }[]
): Promise<void> {
  await Promise.all(
    taggedClauses.map((tagged) =>
      prisma.clause.update({
        where: { id: tagged.clauseId },
        data: { categories: tagged.categories },
      })
    )
  );
}

export async function persistFindings(
  contractId: string,
  findings: CriticFinding[],
  knownClauseIds: Set<string>
): Promise<void> {
  if (findings.length === 0) return;

  await prisma.riskFinding.createMany({
    data: findings.map((finding) => ({
      contractId,
      clauseId: knownClauseIds.has(finding.clauseId) ? finding.clauseId : null,
      agent: finding.category,
      category: finding.category,
      riskLevel: finding.riskLevel,
      summary: finding.summary,
      evidenceQuote: finding.evidenceQuote,
      suggestion: finding.suggestion,
      flaggedInconsistent: finding.flaggedInconsistent,
      criticNote: finding.criticNote,
    })),
  });
}

interface PersistedFinding {
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
}

export async function buildContractReport(contractId: string): Promise<RiskReport<PersistedFinding> | null> {
  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract) return null;

  const findings = await prisma.riskFinding.findMany({
    where: { contractId },
    orderBy: { createdAt: "asc" },
  });

  const typedFindings: PersistedFinding[] = findings.map((finding) => ({
    id: finding.id,
    clauseId: finding.clauseId,
    agent: finding.agent,
    category: finding.category as RiskCategory,
    riskLevel: finding.riskLevel as RiskLevel,
    summary: finding.summary,
    evidenceQuote: finding.evidenceQuote,
    suggestion: finding.suggestion,
    flaggedInconsistent: finding.flaggedInconsistent,
    criticNote: finding.criticNote,
  }));

  return buildRiskReport(typedFindings);
}

// Deletes a Contract and all its Clause/RiskFinding rows. Foreign keys are
// ON DELETE RESTRICT (see the init migration), so children must be removed
// before the parent row — done here in one transaction so a failure partway
// through can't leave orphaned rows behind.
export async function deleteContractCascade(contractId: string): Promise<void> {
  await prisma.$transaction([
    prisma.riskFinding.deleteMany({ where: { contractId } }),
    prisma.clause.deleteMany({ where: { contractId } }),
    prisma.contract.delete({ where: { id: contractId } }),
  ]);
}
