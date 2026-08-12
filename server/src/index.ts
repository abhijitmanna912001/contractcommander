import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { contractsRouter } from "./routes/contracts";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/contracts", contractsRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`ContractCommander server listening on port ${PORT}`);
});
