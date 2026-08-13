import { motion, useReducedMotion } from "motion/react";
import "./HeroPipelineAnimation.css";

interface PipelineNode {
  key: string;
  icon: string;
  label: string;
}

const NODES: PipelineNode[] = [
  { key: "contract", icon: "📄", label: "Contract" },
  { key: "commander", icon: "🧭", label: "Commander" },
  { key: "liability", icon: "⚖️", label: "Liability" },
  { key: "ip", icon: "💡", label: "IP" },
  { key: "termination", icon: "🚪", label: "Termination" },
  { key: "data_privacy", icon: "🔒", label: "Data / Privacy" },
  { key: "dispute", icon: "🔨", label: "Dispute" },
  { key: "critic", icon: "🔍", label: "Critic" },
  { key: "verdict", icon: "🎯", label: "Verdict" },
];

// One full pass through the pipeline, in seconds. Each node gets a brief
// pulse timed to when the traveling highlight reaches it, then the whole
// sequence pauses before looping.
const LOOP_DURATION = 9;
const PULSE_DURATION = 1.1;
const STAGGER = (LOOP_DURATION - PULSE_DURATION) / (NODES.length - 1);

// Purely decorative ambient illustration — the real pipeline explanation
// (with full labels) lives in the "How It Works" section below, which is
// what screen readers and reduced-motion users rely on for this content.
export function HeroPipelineAnimation() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="hero-pipeline" aria-hidden="true">
      <div className="hero-pipeline__track">
        <div className="hero-pipeline__line" />

        {!shouldReduceMotion && (
          <motion.div
            className="hero-pipeline__pulse"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: LOOP_DURATION, repeat: Infinity, ease: "linear" }}
          />
        )}

        {NODES.map((node, index) => (
          <div key={node.key} className="hero-pipeline__node">
            <motion.span
              className="hero-pipeline__dot"
              animate={
                shouldReduceMotion ? undefined : { scale: [1, 1.28, 1], opacity: [0.55, 1, 0.55] }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: PULSE_DURATION,
                      repeat: Infinity,
                      repeatDelay: LOOP_DURATION - PULSE_DURATION,
                      delay: index * STAGGER,
                      ease: "easeInOut",
                    }
              }
            >
              {node.icon}
            </motion.span>
            <span className="hero-pipeline__label">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
