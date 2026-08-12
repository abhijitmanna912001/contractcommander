import { CATEGORY_LABELS, type Finding } from "../lib/types";
import "./FindingCard.css";

interface FindingCardProps {
  finding: Finding;
}

export function FindingCard({ finding }: FindingCardProps) {
  return (
    <article className={`finding-card finding-card--${finding.riskLevel}`}>
      <header className="finding-card__header">
        <span className="finding-card__category">{CATEGORY_LABELS[finding.category]}</span>
        <span className={`finding-card__pill finding-card__pill--${finding.riskLevel}`}>
          {finding.riskLevel}
        </span>
      </header>

      <p className="finding-card__summary">{finding.summary}</p>

      <blockquote className="finding-card__evidence">“{finding.evidenceQuote}”</blockquote>

      <div className="finding-card__suggestion">
        <span className="finding-card__suggestion-label">Suggestion</span>
        <p>{finding.suggestion}</p>
      </div>

      {finding.flaggedInconsistent && finding.criticNote && (
        <p className="finding-card__note">
          <span aria-hidden="true">⚠</span> {finding.criticNote}
        </p>
      )}
    </article>
  );
}
