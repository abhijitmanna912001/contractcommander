import path from "path";
import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { runContractAnalysis } from "../agents";
import {
  buildContractReport,
  createContractWithClauses,
  persistClauseCategories,
  persistFindings,
  toClauseInputs,
} from "../services/contractService";
import { extractText, splitIntoClauses } from "../services/textExtraction";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

export const contractsRouter = Router();

contractsRouter.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded. Attach a file under the 'file' field." });
        return;
      }

      let rawText: string;
      try {
        rawText = await extractText(file.buffer, file.mimetype, file.originalname);
      } catch {
        res.status(400).json({ error: "Failed to extract text from the uploaded file." });
        return;
      }

      if (!rawText.trim()) {
        res.status(400).json({ error: "The uploaded file contains no extractable text." });
        return;
      }

      const extractedClauses = splitIntoClauses(rawText);
      if (extractedClauses.length === 0) {
        res.status(400).json({ error: "Could not split the document into clauses." });
        return;
      }

      const title = path.parse(file.originalname).name || "Untitled Contract";

      const contract = await createContractWithClauses({
        title,
        fileName: file.originalname,
        mimeType: file.mimetype,
        rawText,
        clauses: extractedClauses,
      });

      const clauseInputs = toClauseInputs(contract.clauses);
      const knownClauseIds = new Set(contract.clauses.map((clause) => clause.id));

      let analysisStatus: "completed" | "failed" = "completed";
      let analysisError: string | undefined;

      try {
        const { taggedClauses, findings } = await runContractAnalysis(rawText, clauseInputs);
        await persistClauseCategories(taggedClauses);
        await persistFindings(contract.id, findings, knownClauseIds);
      } catch (err) {
        analysisStatus = "failed";
        analysisError = err instanceof Error ? err.message : "Unknown error during analysis.";
        console.error(`Contract analysis failed for contract ${contract.id}:`, err);
      }

      res.status(201).json({
        id: contract.id,
        title: contract.title,
        clauseCount: contract.clauses.length,
        analysisStatus,
        ...(analysisError ? { analysisError } : {}),
      });
    } catch (err) {
      next(err);
    }
  }
);

contractsRouter.get("/:id/report", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await buildContractReport(req.params.id);
    if (!report) {
      res.status(404).json({ error: "Contract not found." });
      return;
    }
    res.json(report);
  } catch (err) {
    next(err);
  }
});
