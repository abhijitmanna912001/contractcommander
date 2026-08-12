-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileUrl" TEXT,
    "rawText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clause" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "heading" TEXT,
    "text" TEXT NOT NULL,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskFinding" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "clauseId" TEXT,
    "agent" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "evidenceQuote" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "flaggedInconsistent" BOOLEAN NOT NULL DEFAULT false,
    "criticNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskFinding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Clause" ADD CONSTRAINT "Clause_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFinding" ADD CONSTRAINT "RiskFinding_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFinding" ADD CONSTRAINT "RiskFinding_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "Clause"("id") ON DELETE SET NULL ON UPDATE CASCADE;
