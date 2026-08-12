import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadZone } from "../components/UploadZone";
import { ApiError, uploadContract } from "../lib/api";
import "./Home.css";

type Status = "idle" | "uploading" | "error";

export function Home() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setStatus("uploading");
    setErrorMessage(null);
    setFileName(file.name);

    try {
      const result = await uploadContract(file);
      navigate(`/report/${result.id}`, {
        state:
          result.analysisStatus === "failed"
            ? { analysisFailed: true, analysisError: result.analysisError }
            : undefined,
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError ? err.message : "Something went wrong while uploading your contract."
      );
    }
  }

  return (
    <main className="page home">
      <div className="home__intro">
        <span className="home__eyebrow">Contract Risk Analysis</span>
        <h1>ContractCommander</h1>
        <p className="home__tagline">
          Upload a contract and get a structured risk report — liability, IP, termination, data
          privacy, and dispute exposure, reviewed clause by clause.
        </p>
      </div>

      <UploadZone onFileSelected={handleFileSelected} disabled={status === "uploading"} />

      {status === "uploading" && (
        <div className="home__status home__status--loading" role="status">
          <span className="home__spinner" aria-hidden="true" />
          <div>
            <p className="home__status-title">Analyzing {fileName}…</p>
            <p className="home__status-subtitle">
              This can take 30–60 seconds — five specialist agents are reviewing your contract
              clause by clause.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="home__status home__status--error" role="alert">
          <p className="home__status-title">Upload failed</p>
          <p className="home__status-subtitle">{errorMessage}</p>
        </div>
      )}
    </main>
  );
}
