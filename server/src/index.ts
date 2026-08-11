import cors from "cors";
import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`ContractCommander server listening on port ${PORT}`);
});
