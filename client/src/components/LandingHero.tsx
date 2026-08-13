import { motion, useReducedMotion } from "motion/react";
import type { MouseEvent } from "react";
import { HeroPipelineAnimation } from "./HeroPipelineAnimation";
import "./LandingHero.css";

const ACCENT_DEEP = "#b8942b"; // mirrors --accent-deep
const CTA_HOVER_SHADOW = "0 12px 28px -8px rgba(212, 175, 55, 0.35)"; // mirrors --shadow-accent

function scrollToUpload(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="landing__section hero">
      <div className="landing__container hero__container">
        <div className="brand hero__wordmark">
          <span className="brand__mark" aria-hidden="true">
            ⚖️
          </span>
          ContractCommander
        </div>

        <span className="section-eyebrow">AI-Powered Contract Review</span>

        <h1 className="hero__headline">Know what you're signing, before you sign it.</h1>

        <p className="hero__subhead">
          ContractCommander runs every clause through five specialist AI reviewers, covering
          liability, IP, termination, data privacy, and dispute. A critic agent then cross-checks
          their work. You get one clear risk score, not forty pages of ambiguity.
        </p>

        <motion.a
          href="#upload-section"
          className="hero__cta"
          onClick={scrollToUpload}
          whileHover={{
            y: shouldReduceMotion ? 0 : -3,
            backgroundColor: ACCENT_DEEP,
            boxShadow: CTA_HOVER_SHADOW,
          }}
          whileTap={{ scale: 0.98, y: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          Try it on your contract
          <span aria-hidden="true">↓</span>
        </motion.a>

        <HeroPipelineAnimation />
      </div>
    </section>
  );
}
