import { useEffect, useState } from "react";

/**
 * Advances an index from 0 up to stageCount - 1 on a fixed interval, then
 * holds at the last index rather than looping or resetting. The backend
 * only responds once the full pipeline (Commander, five specialists,
 * Critic) has completed, with no intermediate progress events, so this is
 * a simulated approximation timed to roughly span the typical analysis
 * window rather than a signal wired to real backend state.
 */
export function useSimulatedProgress(stageCount: number, stageDurationMs = 6000): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    if (stageCount <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1 < stageCount ? current + 1 : current));
    }, stageDurationMs);

    return () => clearInterval(interval);
  }, [stageCount, stageDurationMs]);

  return activeIndex;
}
