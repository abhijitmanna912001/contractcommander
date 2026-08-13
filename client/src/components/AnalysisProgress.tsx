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

interface AnalysisProgressProps {
  fileName: string;
}

export function AnalysisProgress({ fileName }: AnalysisProgressProps) {
  const activeIndex = useSimulatedProgress(STAGES.length);
  const progressPercent = ((activeIndex + 1) / STAGES.length) * 100;

  return (
    <div className="analysis-progress" role="status">
      <p className="analysis-progress__title">Analyzing {fileName}</p>
      <p className="analysis-progress__subtitle">
        Five specialist agents are reviewing your contract clause by clause, coordinated by a
        commander agent and cross-checked by a critic. This usually takes 30 to 60 seconds.
      </p>

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
