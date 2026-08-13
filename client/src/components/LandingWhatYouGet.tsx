import { FindingCard } from "./FindingCard";
import { useRevealOnScroll } from "../lib/useRevealOnScroll";
import type { Finding } from "../lib/types";
import "./LandingWhatYouGet.css";

const EXAMPLE_FINDING: Finding = {
  id: "example",
  clauseId: null,
  agent: "liability",
  category: "liability",
  riskLevel: "high",
  summary: "Liability is uncapped for breaches of confidentiality, exposing you to unlimited damages.",
  evidenceQuote: "liability shall be unlimited for any breach of confidentiality obligations",
  suggestion: "Negotiate a liability cap, even a high one, rather than leaving it unlimited.",
  flaggedInconsistent: false,
  criticNote: null,
  group: "🔴 High Risk",
};

export function LandingWhatYouGet() {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="landing__section what-you-get">
      <div className="landing__container">
        <div ref={ref} className={`what-you-get__grid reveal ${isVisible ? "is-visible" : ""}`}>
          <div className="landing__prose">
            <span className="section-eyebrow">The Output</span>
            <h2 className="section-heading">See exactly what's risky, and what to do about it.</h2>
            <p className="section-lede">
              Every finding cites the exact clause, explains the risk in plain English, and
              suggests a fix you can bring to the negotiating table.
            </p>
          </div>

          <div className="what-you-get__preview">
            <span className="what-you-get__preview-label">Example finding from a real review</span>
            <FindingCard finding={EXAMPLE_FINDING} />
          </div>
        </div>
      </div>
    </section>
  );
}
