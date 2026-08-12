import "./DisclaimerBanner.css";

export function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner" role="note">
      <span className="disclaimer-banner__icon" aria-hidden="true">
        ⚖️
      </span>
      <p className="disclaimer-banner__text">
        This tool provides informational analysis, not legal advice. Consult a qualified attorney
        before making contract decisions.
      </p>
    </div>
  );
}
