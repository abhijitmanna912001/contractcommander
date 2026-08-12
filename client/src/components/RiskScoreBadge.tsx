import { getScoreTier } from "../lib/risk";
import "./RiskScoreBadge.css";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RiskScoreBadgeProps {
  score: number;
}

export function RiskScoreBadge({ score }: RiskScoreBadgeProps) {
  const { tier } = getScoreTier(score);
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className={`risk-score risk-score--${tier}`}>
      <svg className="risk-score__ring" viewBox="0 0 120 120" width="120" height="120">
        <circle className="risk-score__track" cx="60" cy="60" r={RADIUS} />
        <circle
          className="risk-score__progress"
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="risk-score__value">
        <span className="risk-score__number">{Math.round(clamped)}</span>
        <span className="risk-score__max">/ 100</span>
      </div>
    </div>
  );
}
