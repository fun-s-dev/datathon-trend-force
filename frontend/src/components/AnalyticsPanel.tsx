import {
  derivePlannerSummary,
  deriveNavigationSummary,
  PlannerSummary,
  NavigationSummary,
} from "../analytics/deriveFromPrediction";
import { UI_LABELS, ANALYTICS_TABLE_COLUMNS } from "../config/constants";

interface AnalyticsPanelProps {
  prediction: Record<string, unknown>;
  mode: "planner" | "navigation";
}

function RunLevelBlock({ run }: { run: PlannerSummary["run"] }) {
  if (run.total_routes === 0) return null;

  return (
    <div className="analytics-run card">
      <h4>{UI_LABELS.ANALYTICS_SUMMARY}</h4>
      <div className="analytics-run-grid">
        <div className="analytics-item">
          <span className="analytics-label">{UI_LABELS.TOTAL_ROUTES}</span>
          <span className="analytics-value">{run.total_routes}</span>
        </div>
        <div className="analytics-item">
          <span className="analytics-label">{UI_LABELS.AVERAGE_DELAY}</span>
          <span className="analytics-value">{run.average_delay} mins</span>
        </div>
        <div className="analytics-item">
          <span className="analytics-label">{UI_LABELS.DELAY_VARIANCE}</span>
          <span className="analytics-value">{run.delay_variance}</span>
        </div>
        <div className="analytics-item">
          <span className="analytics-label">{UI_LABELS.RISK_SPREAD}</span>
          <span className="analytics-value">{run.risk_spread_across_routes}</span>
        </div>
      </div>
    </div>
  );
}

function WhyRecommendedBlock({
  summaries,
  mode,
}: {
  summaries: PlannerSummary["summaries"];
  mode: "planner" | "navigation";
}) {
  const hasContent =
    (summaries.why_recommended && summaries.why_recommended.length > 0) ||
    (mode === "planner" &&
      summaries.time_saved_vs_alternatives &&
      summaries.time_saved_vs_alternatives.length > 0) ||
    (summaries.congestion_consistency && summaries.congestion_consistency.length > 0);
  if (!hasContent) return null;

  return (
    <div className="analytics-why-recommended card">
      <h4>{UI_LABELS.WHY_RECOMMENDED}</h4>
      {summaries.why_recommended && <p className="analytics-summary-text">{summaries.why_recommended}</p>}
      {mode === "planner" && summaries.time_saved_vs_alternatives && (
        <p className="analytics-summary-text">{summaries.time_saved_vs_alternatives}</p>
      )}
      {summaries.congestion_consistency && (
        <p className="analytics-summary-text">{summaries.congestion_consistency}</p>
      )}
    </div>
  );
}

function FlattenedTable({ rows }: { rows: PlannerSummary["flattened_table"] }) {
  if (!rows.length) return null;

  return (
    <div className="analytics-table card">
      <h4>{UI_LABELS.PLANNER_ANALYTICS}</h4>
      <div className="table-scroll">
        <table className="route-table">
          <thead>
            <tr>
              {ANALYTICS_TABLE_COLUMNS.map((col) => (
                <th key={col.key}>{UI_LABELS[col.labelKey] ?? col.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.route_id ?? i}>
                {ANALYTICS_TABLE_COLUMNS.map((col) => {
                  const val = row[col.key];
                  if (col.key === "delay_percentage") return <td key={col.key}>{val}%</td>;
                  if (col.key === "efficiency_km_per_min") return <td key={col.key}>{val}</td>;
                  if (col.key === "time_saved_vs_best_route")
                    return <td key={col.key}>{val} mins</td>;
                  if (col.key === "base_time_min" || col.key === "predicted_delay_min" || col.key === "predicted_time_min")
                    return <td key={col.key}>{val} mins</td>;
                  if (col.key === "distance_km") return <td key={col.key}>{val} km</td>;
                  return <td key={col.key}>{String(val ?? "—")}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NavigationBlock({ nav }: { nav: NavigationSummary }) {
  if (!nav.recommended_route) return null;

  return (
    <div className="analytics-nav card">
      <h4>{UI_LABELS.NAVIGATION_ANALYTICS}</h4>
      <div className="analytics-nav-content">
        {nav.time_saved_message && (
          <p className="analytics-summary-text">{nav.time_saved_message}</p>
        )}
        {nav.alternatives_count > 0 && (
          <p className="analytics-summary-text">
            {nav.alternatives_count} {UI_LABELS.ALTERNATIVES_AVAILABLE}
          </p>
        )}
      </div>
    </div>
  );
}

export function AnalyticsPanel({ prediction, mode }: AnalyticsPanelProps) {
  const planner = derivePlannerSummary(prediction);
  const nav = deriveNavigationSummary(prediction);

  if (mode === "planner") {
    return (
      <div className="analytics-panel">
        <RunLevelBlock run={planner.run} />
        <WhyRecommendedBlock summaries={planner.summaries} mode="planner" />
        <FlattenedTable rows={planner.flattened_table} />
      </div>
    );
  }

  return (
    <div className="analytics-panel">
      <NavigationBlock nav={nav} />
      <WhyRecommendedBlock summaries={planner.summaries} mode="navigation" />
    </div>
  );
}
