import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { PlaceholderSection } from "../components/PlaceholderSection";
import { UI_LABELS, FEATURE_FLAGS, WEEKEND_DAYS } from "../config/constants";

export interface CityPlannerDashboardProps {
  routes: Record<string, unknown>[];
  prediction: Record<string, unknown>;
  congestionLevel?: string;
  riskScore?: number;
  peakHourFlag?: boolean;
  weatherImpactNote?: string;
  travelDay?: string;
}

export function CityPlannerDashboard({
  prediction,
  congestionLevel,
  riskScore,
  peakHourFlag,
  weatherImpactNote,
  travelDay,
}: CityPlannerDashboardProps) {
  const isWeekend =
    travelDay != null && WEEKEND_DAYS.includes(String(travelDay).toLowerCase());
  const dayType = isWeekend ? "Weekend" : "Weekday";

  return (
    <div className="dashboard-view planner-dashboard">
      {FEATURE_FLAGS.SHOW_ANALYTICS && (
        <AnalyticsPanel prediction={prediction} mode="planner" />
      )}

      <div className="context-row card">
        <h3>{UI_LABELS.CONTEXT}</h3>
        <div className="context-items">
          <MetricCard label={UI_LABELS.WEEKEND_WEEKDAY} value={dayType} />
          {peakHourFlag && (
            <MetricCard
              label={UI_LABELS.PEAK_HOUR}
              value="Yes"
              subtitle={UI_LABELS.PEAK_HOUR_CONTEXT}
            />
          )}
          {weatherImpactNote != null && (
            <div className="metric-card-inline">
              <span className="metric-label">{UI_LABELS.WEATHER_IMPACT}</span>
              <span className="metric-value-small">{weatherImpactNote}</span>
            </div>
          )}
        </div>
      </div>

      <div className="metrics-grid">
        {congestionLevel != null && (
          <div className="card metric-card-inline">
            <span className="metric-label">{UI_LABELS.CONGESTION_LEVEL}</span>
            <StatusBadge level={congestionLevel} />
          </div>
        )}
        {riskScore != null && (
          <MetricCard label={UI_LABELS.RISK_SCORE} value={`${riskScore}%`} />
        )}
      </div>

      <PlaceholderSection />
    </div>
  );
}
