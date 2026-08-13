import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnalysisProgress } from "./AnalysisProgress";
import { UploadZone } from "./UploadZone";
import { ApiError, uploadContract } from "../lib/api";
import "./LandingUploadSection.css";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

type Status = "idle" | "uploading" | "error";

export function LandingUploadSection() {
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
    <section className="landing__section landing__section--alt upload-section" id="upload-section">
      <div className="landing__container upload-section__container">
        <div className="landing__prose upload-section__intro">
          <span className="section-eyebrow">Get Started</span>
          <h2 className="section-heading">Upload your contract.</h2>
          <p className="section-lede">PDF or plain text. Takes about a minute.</p>
        </div>

        <div className="upload-section__card">
          <UploadZone onFileSelected={handleFileSelected} disabled={status === "uploading"} />

          <AnimatePresence mode="wait">
            {status === "uploading" && fileName && (
              <motion.div key="uploading" {...fadeInUp}>
                <AnalysisProgress fileName={fileName} />
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                className="upload-section__status upload-section__status--error"
                role="alert"
                {...fadeInUp}
              >
                <p className="upload-section__status-title">Upload failed</p>
                <p className="upload-section__status-subtitle">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
