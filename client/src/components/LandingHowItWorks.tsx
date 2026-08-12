import { CATEGORY_LABELS, RISK_CATEGORIES, type RiskCategory } from "../lib/types";
import { useRevealOnScroll } from "../lib/useRevealOnScroll";
import "./LandingHowItWorks.css";

const SPECIALIST_ICONS: Record<RiskCategory, string> = {
  liability: "⚖️",
  ip: "💡",
  termination: "🚪",
  data_privacy: "🔒",
  dispute: "🔨",
};

interface Stage {
  icon: string;
  label: string;
  description: string;
}

const COMMANDER_STAGE: Stage = {
  icon: "🧭",
  label: "Commander",
  description: "Reads every clause and tags what's at stake.",
};

const CRITIC_STAGE: Stage = {
  icon: "🔍",
  label: "Critic",
  description: "Cross-checks every finding and flags disagreements.",
};

const SCORE_STAGE: Stage = {
  icon: "🎯",
  label: "Risk Score",
  description: "One score, grouped findings, clear next steps.",
};

export function LandingHowItWorks() {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="landing__section landing__section--alt how-it-works">
      <div className="landing__container">
        <div className="landing__prose">
          <span className="section-eyebrow">The Pipeline</span>
          <h2 className="section-heading">One contract, five expert reviews, one verdict.</h2>
          <p className="section-lede">
            Every clause moves through a structured pipeline of specialist AI agents before a
            single finding reaches you.
          </p>
        </div>

        <div ref={ref} className={`pipeline reveal ${isVisible ? "is-visible" : ""}`}>
          <PipelineStage stage={COMMANDER_STAGE} />
          <PipelineConnector />

          <div className="pipeline__stage pipeline__stage--specialists">
            <ul className="specialists">
              {RISK_CATEGORIES.map((category) => (
                <li key={category} className="specialists__item">
                  <span className="specialists__icon" aria-hidden="true">
                    {SPECIALIST_ICONS[category]}
                  </span>
                  <span className="specialists__label">{CATEGORY_LABELS[category]}</span>
                </li>
              ))}
            </ul>
            <span className="pipeline__stage-label">5 Specialists</span>
            <p className="pipeline__stage-description">Each reviews only its own area of expertise.</p>
          </div>

          <PipelineConnector />
          <PipelineStage stage={CRITIC_STAGE} />
          <PipelineConnector />
          <PipelineStage stage={SCORE_STAGE} />
        </div>
      </div>
    </section>
  );
}

function PipelineStage({ stage }: { stage: Stage }) {
  return (
    <div className="pipeline__stage">
      <span className="pipeline__stage-icon" aria-hidden="true">
        {stage.icon}
      </span>
      <span className="pipeline__stage-label">{stage.label}</span>
      <p className="pipeline__stage-description">{stage.description}</p>
    </div>
  );
}

function PipelineConnector() {
  return (
    <div className="pipeline__connector" aria-hidden="true">
      <span>→</span>
    </div>
  );
}
