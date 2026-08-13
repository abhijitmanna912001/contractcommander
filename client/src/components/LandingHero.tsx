import type { MouseEvent } from "react";
import "./LandingHero.css";

function scrollToUpload(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingHero() {
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

        <a href="#upload-section" className="hero__cta" onClick={scrollToUpload}>
          Try it on your contract
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
