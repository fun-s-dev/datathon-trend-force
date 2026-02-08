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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 18 } },
};

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
    <motion.div
      className="dashboard-view navigation-dashboard"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {FEATURE_FLAGS.SHOW_ANALYTICS && (
        <motion.div variants={fadeUp}>
          <AnalyticsPanel prediction={prediction} mode="navigation" />
        </motion.div>
      )}
      {FEATURE_FLAGS.SHOW_JOURNEY_SUMMARY && rec != null && (
        <motion.div variants={fadeUp}>
          <JourneySummary
            routeName={rec.name}
            totalTime={rec.predicted_time_min}
            delay={rec.predicted_delay_min}
            distance={rec.distance_km}
            risk={rec.risk}
          />
        </motion.div>
      )}

      {routes.length > 0 && (
        showMap ? (
          <motion.div key="map" className="map-section card" variants={fadeUp}>
            <h3>{UI_LABELS.MAP}</h3>
            <RouteMap routes={routes} recommendedIndex={0} />
          </motion.div>
        ) : isSingleRoute ? (
          <motion.div key="map-fallback" className="map-section card" variants={fadeUp}>
            <h3>{UI_LABELS.MAP}</h3>
            <p className="map-fallback">{MAP_NO_GEOMETRY_MESSAGE}</p>
          </motion.div>
        ) : (
          <motion.div key="alternatives" className="alternatives-section card" variants={fadeUp}>
            <h3>{UI_LABELS.ROUTE_ALTERNATIVES}</h3>
            <p className="alternatives-message">{MAP_MULTI_ROUTE_ALTERNATIVES_MESSAGE}</p>
          </motion.div>
        )
      )}

      {routes.length > 0 && (
        <motion.div className="routes-section" variants={fadeUp}>
          <h3>{UI_LABELS.ROUTES}</h3>
          <div className="route-cards">
            {routes.map((route: Record<string, unknown>, i: number) => (
              <RouteCard key={String(route?.rank ?? route?.id ?? i)} route={route} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div className="metrics-grid" variants={fadeUp}>
        {congestionLevel != null && (
          <motion.div
            className="card metric-card-inline"
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
          >
            <span className="metric-label">{UI_LABELS.CONGESTION_LEVEL}</span>
            <StatusBadge level={congestionLevel} />
          </motion.div>
        )}
        {riskScore != null && (
          <MetricCard label={UI_LABELS.RISK_SCORE} value={`${riskScore}%`} />
        )}
        {peakHourFlag && (
          <MetricCard
            label={UI_LABELS.PEAK_HOUR}
            value="Yes"
            accentColor="var(--status-medium)"
          />
        )}
        {weatherImpactNote != null && (
          <motion.div
            className="card metric-card-inline weather-impact"
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
          >
            <span className="metric-label">{UI_LABELS.WEATHER_IMPACT}</span>
            <span className="metric-value-small">{weatherImpactNote}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
