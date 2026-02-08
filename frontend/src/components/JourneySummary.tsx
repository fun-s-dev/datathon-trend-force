import { UI_LABELS, toStatusVariant } from "../config/constants";

export interface JourneySummaryProps {
  routeName?: string;
  totalTime?: number;
  delay?: number;
  distance?: number;
  risk?: string;
}

export function JourneySummary({
  routeName,
  totalTime,
  delay,
  distance,
  risk,
}: JourneySummaryProps) {
  if (routeName == null && totalTime == null && delay == null) return null;

  return (
    <div className="journey-summary card">
      <h3>{UI_LABELS.JOURNEY_SUMMARY}</h3>
      <div className="journey-summary-grid">
        {routeName != null && (
          <div className="journey-summary-item">
            <span className="journey-label">{UI_LABELS.RECOMMENDED_ROUTE}</span>
            <span className="journey-value">{routeName}</span>
          </div>
        )}
        {totalTime != null && (
          <div className="journey-summary-item">
            <span className="journey-label">{UI_LABELS.TOTAL_DURATION}</span>
            <span className="journey-value">{totalTime} mins</span>
          </div>
        )}
        {delay != null && (
          <div className="journey-summary-item">
            <span className="journey-label">{UI_LABELS.EXPECTED_DELAY}</span>
            <span className="journey-value">{delay} mins</span>
          </div>
        )}
        {distance != null && (
          <div className="journey-summary-item">
            <span className="journey-label">{UI_LABELS.DISTANCE}</span>
            <span className="journey-value">{distance} km</span>
          </div>
        )}
        {risk != null && (
          <div className="journey-summary-item">
            <span className="journey-label">{UI_LABELS.RISK}</span>
            <span className={`status-badge status-${toStatusVariant(risk)}`}>{risk}</span>
          </div>
        )}
      </div>
    </div>
  );
}
