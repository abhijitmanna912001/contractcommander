import { CATEGORY_LABELS, RISK_CATEGORIES, type RiskCategory } from "../lib/types";
import "./CategorySummary.css";

interface CategorySummaryProps {
  counts: Record<RiskCategory, number>;
}

export function CategorySummary({ counts }: CategorySummaryProps) {
  return (
    <div className="category-summary">
      {RISK_CATEGORIES.map((category) => (
        <div key={category} className="category-summary__item">
          <span className="category-summary__count">{counts[category] ?? 0}</span>
          <span className="category-summary__label">{CATEGORY_LABELS[category]}</span>
        </div>
      ))}
    </div>
  );
}
