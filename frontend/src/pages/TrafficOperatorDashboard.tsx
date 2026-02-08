import { motion } from "framer-motion";
import { AlertBanner } from "../components/AlertBanner";
import { AnalyticsPanel } from "../components/AnalyticsPanel";
import { RouteCard } from "../components/RouteCard";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { UI_LABELS, FEATURE_FLAGS } from "../config/constants";

export interface TrafficOperatorDashboardProps {
  routes: Record<string, unknown>[];
  prediction: Record<string, unknown>;
  congestionLevel?: string;
  riskScore?: number;
  peakHourFlag?: boolean;
  weatherImpactNote?: string;
  travelDay?: string;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 18 } },
};

export function TrafficOperatorDashboard({
  routes,
  prediction,
  congestionLevel,
  riskScore,
  peakHourFlag,
  weatherImpactNote: _weatherImpactNote,
}: TrafficOperatorDashboardProps) {
  const recommended = routes[0] as Record<string, unknown> | undefined;

  return (
    <motion.div
      className="dashboard-view operator-dashboard"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {FEATURE_FLAGS.SHOW_ANALYTICS && (
        <motion.div variants={fadeUp}>
          <AnalyticsPanel prediction={prediction} mode="planner" />
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <AlertBanner riskScore={riskScore} risk={recommended?.risk as string | undefined} />
      </motion.div>

      <motion.div className="congestion-summary card" variants={fadeUp}>
        <h3>{UI_LABELS.CONGESTION_LEVEL}</h3>
        <div className="congestion-summary-content">
          {congestionLevel != null && <StatusBadge level={congestionLevel} />}
          {riskScore != null && (
            <MetricCard label={UI_LABELS.RISK_SCORE} value={`${riskScore}%`} />
          )}
        </div>
      </motion.div>

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

      {peakHourFlag && (
        <motion.div variants={fadeUp}>
          <MetricCard label={UI_LABELS.PEAK_HOUR} value="Yes" accentColor="var(--status-medium)" />
        </motion.div>
      )}
    </motion.div>
  );
}
