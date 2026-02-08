import { motion } from "framer-motion";
import { RouteCard } from "../components/RouteCard";
import { JourneySummary } from "../components/JourneySummary";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { deriveNavigationSummary } from "../analytics/deriveFromPrediction";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { RouteMap } from "../components/RouteMap";
import {
  UI_LABELS,
  MAP_NO_GEOMETRY_MESSAGE,
  MAP_MULTI_ROUTE_ALTERNATIVES_MESSAGE,
  FEATURE_FLAGS,
} from "../config/constants";

export interface NavigationDashboardProps {
  routes: Record<string, unknown>[];
  prediction: Record<string, unknown>;
  congestionLevel?: string;
  riskScore?: number;
  peakHourFlag?: boolean;
  weatherImpactNote?: string;
}

export function NavigationDashboard({
  routes,
  prediction,
  congestionLevel,
  riskScore,
  peakHourFlag,
  weatherImpactNote,
}: NavigationDashboardProps) {
  const routeCount = routes.length;
  const isSingleRoute = routeCount === 1;
  const hasValidGeometry =
    isSingleRoute &&
    routes.some((r) => {
      const g = (r as Record<string, unknown>).geometry;
      return Array.isArray(g) && g.length > 0 && Array.isArray(g[0]) && g[0].length >= 2;
    });
  const showMap = isSingleRoute && hasValidGeometry;

  const navSummary = deriveNavigationSummary(prediction);
  const rec = navSummary.recommended_route;

  return (
    <div className="dashboard-view navigation-dashboard">
      {FEATURE_FLAGS.SHOW_ANALYTICS && (
        <AnalyticsPanel prediction={prediction} mode="navigation" />
      )}
      {FEATURE_FLAGS.SHOW_JOURNEY_SUMMARY && rec != null && (
        <JourneySummary
          routeName={rec.name}
          totalTime={rec.predicted_time_min}
          delay={rec.predicted_delay_min}
          distance={rec.distance_km}
          risk={rec.risk}
        />
      )}

      {routes.length > 0 && (
        showMap ? (
          <motion.div key="map" className="map-section card">
            <h3>{UI_LABELS.MAP}</h3>
            <RouteMap routes={routes} recommendedIndex={0} />
          </motion.div>
        ) : isSingleRoute ? (
          <motion.div key="map-fallback" className="map-section card">
            <h3>{UI_LABELS.MAP}</h3>
            <p className="map-fallback">{MAP_NO_GEOMETRY_MESSAGE}</p>
          </motion.div>
        ) : (
          <motion.div key="alternatives" className="alternatives-section card">
            <h3>{UI_LABELS.ROUTE_ALTERNATIVES}</h3>
            <p className="alternatives-message">{MAP_MULTI_ROUTE_ALTERNATIVES_MESSAGE}</p>
          </motion.div>
        )
      )}

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
        {peakHourFlag && (
          <MetricCard
            label={UI_LABELS.PEAK_HOUR}
            value="Yes"
          />
        )}
        {weatherImpactNote != null && (
          <div className="card metric-card-inline weather-impact">
            <span className="metric-label">{UI_LABELS.WEATHER_IMPACT}</span>
            <span className="metric-value-small">{weatherImpactNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}
