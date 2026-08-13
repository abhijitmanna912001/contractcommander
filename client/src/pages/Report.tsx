import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CategorySummary } from "../components/CategorySummary";
import { FindingCard } from "../components/FindingCard";
import { RiskScoreBadge } from "../components/RiskScoreBadge";
import { ApiError, getContractReport } from "../lib/api";
import { GROUP_ORDER, getScoreTier, groupFindings } from "../lib/risk";
import type { ContractReport } from "../lib/types";
import "./Report.css";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; report: ContractReport };

interface NavigationState {
  analysisFailed?: boolean;
  analysisError?: string;
}

export function Report() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigationState = (location.state as NavigationState | null) ?? {};
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // The server deletes a contract's data right after its report is served
  // (one-shot, no persistent storage — see the backend route). That makes a
  // second real request for the same id a guaranteed 404, so this guards
  // against React StrictMode's dev-only double effect invocation firing a
  // second GET that would otherwise "lose" the real report to it.
  //
  // Deliberately not the usual per-invocation `let cancelled` + cleanup
  // pattern: StrictMode runs that cleanup synchronously right after the
  // first invocation starts the fetch (before it can possibly have
  // resolved), which would mark the *only* real request's own eventual
  // response as stale and silently drop it — leaving the page stuck on
  // "Loading report…" forever. Checking the ref instead of a closed-over
  // boolean means only a genuine navigation to a different id invalidates
  // an in-flight response.
  const fetchedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) {
      setState({ status: "error", message: "No contract ID was provided." });
      return;
    }

    if (fetchedIdRef.current === id) return;
    fetchedIdRef.current = id;

    setState({ status: "loading" });

    getContractReport(id)
      .then((report) => {
        if (fetchedIdRef.current === id) setState({ status: "loaded", report });
      })
      .catch((err: unknown) => {
        if (fetchedIdRef.current !== id) return;
        const message =
          err instanceof ApiError
            ? err.status === 404
              ? "This report has already been viewed and was automatically deleted for privacy. Upload again to get a new analysis."
              : err.message
            : "Something went wrong while loading this report.";
        setState({ status: "error", message });
      });
  }, [id]);

  return (
    <main className="page report">
      <Link to="/" className="report__back">
        ← Analyze another contract
      </Link>

      {state.status === "loading" && (
        <div className="report__status" role="status">
          <span className="report__spinner" aria-hidden="true" />
          <p>Loading report…</p>
        </div>
      )}

      {state.status === "error" && (
        <div className="report__status report__status--error" role="alert">
          <p>{state.message}</p>
        </div>
      )}

      {state.status === "loaded" && (
        <ReportContent report={state.report} navigationState={navigationState} />
      )}
    </main>
  );
}

function ReportContent({
  report,
  navigationState,
}: {
  report: ContractReport;
  navigationState: NavigationState;
}) {
  const tier = getScoreTier(report.riskScore);
  const grouped = groupFindings(report.findings);

  return (
    <>
      <div className="report__privacy-note">
        <span aria-hidden="true">🔒</span>
        <p>
          This report is shown once. Your contract has not been saved, and this data will not be
          accessible again.
        </p>
      </div>

      {navigationState.analysisFailed && (
        <div className="report__banner" role="alert">
          <p>
            Analysis didn&rsquo;t fully complete for this contract
            {navigationState.analysisError ? `: ${navigationState.analysisError}` : "."} The
            report below may be incomplete.
          </p>
        </div>
      )}

      <section className="report-hero">
        <RiskScoreBadge score={report.riskScore} />
        <div className="report-hero__text">
          <span className="report-hero__eyebrow">Overall Risk Score</span>
          <h1 className={`report-hero__tier report-hero__tier--${tier.tier}`}>{tier.label}</h1>
          <p className="report-hero__description">{tier.description}</p>
        </div>
      </section>

      <CategorySummary counts={report.categoryCounts} />

      <div className="report-findings">
        {report.findings.length === 0 && (
          <p className="report-findings__empty">No risk findings were recorded for this contract.</p>
        )}

        {GROUP_ORDER.map((group) => {
          const findings = grouped.get(group) ?? [];
          if (findings.length === 0) return null;

          return (
            <section key={group} className="findings-group">
              <h2 className="findings-group__title">
                {group} <span className="findings-group__count">({findings.length})</span>
              </h2>
              <div className="findings-group__grid">
                {findings.map((finding) => (
                  <FindingCard key={finding.id} finding={finding} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
