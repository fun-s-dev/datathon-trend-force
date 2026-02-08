import {
  derivePlannerSummary,
  deriveNavigationSummary,
  deriveRouteInsightBullets,
  deriveRunSummaryBullets,
  PlannerSummary,
  NavigationSummary,
} from "../analytics/deriveFromPrediction";
import { UI_LABELS, ANALYTICS_TABLE_COLUMNS, DATA_NOT_AVAILABLE } from "../config/constants";

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
          <span className="analytics-label">{UI_LABELS.FASTEST_ROUTE}</span>
          <span className="analytics-value">{run.fastest_route_name || run.fastest_route_id}</span>
        </div>
        <div className="analytics-item">
          <span className="analytics-label">{UI_LABELS.SAFEST_ROUTE}</span>
          <span className="analytics-value">{run.safest_route_name || run.safest_route_id}</span>
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
        <div className="analytics-item">
          <span className="analytics-label">{UI_LABELS.CONGESTION_CONSISTENCY}</span>
          <span className="analytics-value">{run.congestion_consistency_indicator || DATA_NOT_AVAILABLE}</span>
        </div>
      </div>
    </div>
  );
}

function InsightsBulletBlock({
  run,
  routes,
}: {
  run: PlannerSummary["run"];
  routes: PlannerSummary["routes"];
}) {
  const runBullets = deriveRunSummaryBullets(run);
  const routeBullets = deriveRouteInsightBullets(routes);
  const hasContent = runBullets.length > 0 || routeBullets.length > 0;
  if (!hasContent) return null;

  return (
    <div className="insights-bullets card">
      <h4>{UI_LABELS.WHY_RECOMMENDED}</h4>
      <ul className="insights-list">
        {runBullets.map((text, i) => (
          <li key={`run-${i}`}>{text}</li>
        ))}
        {routeBullets.map((text, i) => (
          <li key={`route-${i}`}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

function SummariesBlock({ summaries }: { summaries: PlannerSummary["summaries"] }) {
  return (
    <div className="analytics-summaries card">
      <h4>{UI_LABELS.WHY_RECOMMENDED}</h4>
      {summaries.why_recommended && <p className="analytics-summary-text">{summaries.why_recommended}</p>}
      {summaries.time_saved_vs_alternatives && (
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
        <InsightsBulletBlock run={planner.run} routes={planner.routes} />
        <SummariesBlock summaries={planner.summaries} />
        <FlattenedTable rows={planner.flattened_table} />
      </div>
    );
  }

  return (
    <div className="analytics-panel">
      <NavigationBlock nav={nav} />
      <InsightsBulletBlock run={planner.run} routes={planner.routes} />
      <SummariesBlock summaries={planner.summaries} />
    </div>
  );
}
