import { CATEGORY_LABELS, RISK_CATEGORIES, type RiskCategory } from "../lib/types";
import { useSimulatedProgress } from "../lib/useSimulatedProgress";
import "./AnalysisProgress.css";

const SPECIALIST_ICONS: Record<RiskCategory, string> = {
  liability: "⚖️",
  ip: "💡",
  termination: "🚪",
  data_privacy: "🔒",
  dispute: "🔨",
};

interface ProgressStage {
  key: string;
  icon: string;
  label: string;
}

const STAGES: ProgressStage[] = [
  { key: "commander", icon: "🧭", label: "Commander" },
  ...RISK_CATEGORIES.map((category) => ({
    key: category,
    icon: SPECIALIST_ICONS[category],
    label: CATEGORY_LABELS[category],
  })),
  { key: "critic", icon: "🔍", label: "Critic" },
];

// Keyed by stage, shown one at a time as the simulated progress advances —
// reinforces which agent is "active" with more specific language than a
// single static sentence for the whole 30-60s wait.
const ACTIVITY_MESSAGES: Record<string, string> = {
  commander: "Reading every clause and tagging what's at stake…",
  liability: "Reviewing liability clauses…",
  ip: "Checking IP ownership language…",
  termination: "Comparing termination terms…",
  data_privacy: "Auditing data privacy obligations…",
  dispute: "Evaluating dispute resolution terms…",
  critic: "Cross-validating findings across every agent…",
};

interface AnalysisProgressProps {
  fileName: string;
}

export function AnalysisProgress({ fileName }: AnalysisProgressProps) {
  const activeIndex = useSimulatedProgress(STAGES.length);
  const progressPercent = ((activeIndex + 1) / STAGES.length) * 100;
  const activeStage = STAGES[activeIndex];

  return (
    <div className="analysis-progress" role="status">
      <p className="analysis-progress__title">Analyzing {fileName}</p>
      <p className="analysis-progress__subtitle">{ACTIVITY_MESSAGES[activeStage.key]}</p>

      <div className="analysis-progress__bar" aria-hidden="true">
        <div className="analysis-progress__bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <ol className="analysis-progress__stages" aria-hidden="true">
        {STAGES.map((stage, index) => {
          const status = index < activeIndex ? "done" : index === activeIndex ? "active" : "pending";
          return (
            <li key={stage.key} className={`analysis-progress__stage analysis-progress__stage--${status}`}>
              <span className="analysis-progress__stage-icon">{status === "done" ? "✓" : stage.icon}</span>
              <span className="analysis-progress__stage-label">{stage.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
