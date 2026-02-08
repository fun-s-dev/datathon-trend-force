import { AlertBanner } from "../components/AlertBanner";
import { ExplainabilityBlock } from "../components/ExplainabilityBlock";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { RouteCard } from "../components/RouteCard";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { UI_LABELS, FEATURE_FLAGS, EXPLANATION_TEMPLATES } from "../config/constants";

export interface TrafficOperatorDashboardProps {
  routes: Record<string, unknown>[];
  prediction: Record<string, unknown>;
  congestionLevel?: string;
  riskScore?: number;
  peakHourFlag?: boolean;
  weatherImpactNote?: string;
  travelDay?: string;
}

export function TrafficOperatorDashboard({
  routes,
  prediction,
  congestionLevel,
  riskScore,
  peakHourFlag,
  weatherImpactNote,
  travelDay,
}: TrafficOperatorDashboardProps) {
  const recommended = routes[0] as Record<string, unknown> | undefined;

  return (
    <div className="dashboard-view operator-dashboard">
      {FEATURE_FLAGS.SHOW_ANALYTICS && (
        <AnalyticsPanel prediction={prediction} mode="planner" />
      )}
      <AlertBanner riskScore={riskScore} risk={recommended?.risk as string | undefined} />

      {FEATURE_FLAGS.SHOW_RANKING_EXPLANATION && recommended != null && (
        <ExplainabilityBlock
          routeName={String(recommended.name ?? recommended.route ?? "")}
          totalTime={Number(recommended.predicted_time ?? recommended.predicted_time_min ?? 0)}
          base={Number(recommended.base_time_min ?? recommended.baseTime ?? recommended.duration_min ?? 0)}
          delay={Number(recommended.predicted_delay ?? recommended.predictedDelay ?? recommended.predicted_delay_min ?? 0)}
          peakHourFlag={peakHourFlag}
          travelDay={travelDay}
          weatherImpactNote={weatherImpactNote}
        />
      )}

      <div className="congestion-summary card">
        <h3>{UI_LABELS.CONGESTION_LEVEL}</h3>
        <div className="congestion-summary-content">
          {congestionLevel != null && <StatusBadge level={congestionLevel} />}
          {riskScore != null && (
            <MetricCard label={UI_LABELS.RISK_SCORE} value={`${riskScore}%`} />
          )}
        </div>
      </div>

      {routes.length > 0 && (
        <div className="routes-section">
          <h3>{UI_LABELS.ROUTES}</h3>
          <div className="route-cards">
            {routes.map((route: Record<string, unknown>, i: number) => (
              <RouteCard key={String(route?.rank ?? route?.id ?? i)} route={route} />
            ))}
          </div>
        </div>
      )}

      {peakHourFlag && (
        <div className="card metric-card-inline">
          <span className="metric-label">{UI_LABELS.PEAK_HOUR_CONTEXT}</span>
          <span className="metric-value-small">{EXPLANATION_TEMPLATES.PEAK_HOUR_NOTE}</span>
        </div>
      )}
    </div>
  );
}
