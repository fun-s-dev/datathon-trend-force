import { motion } from "framer-motion";
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

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 18 } },
};

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
    <motion.div
      className="dashboard-view planner-dashboard"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {FEATURE_FLAGS.SHOW_ANALYTICS && (
        <motion.div variants={fadeUp}>
          <AnalyticsPanel prediction={prediction} mode="planner" />
        </motion.div>
      )}

      <motion.div className="context-row card" variants={fadeUp}>
        <h3>{UI_LABELS.CONTEXT}</h3>
        <div className="context-items">
          <MetricCard label={UI_LABELS.WEEKEND_WEEKDAY} value={dayType} />
          {peakHourFlag && (
            <MetricCard label={UI_LABELS.PEAK_HOUR} value="Yes" accentColor="var(--status-medium)" />
          )}
          {weatherImpactNote != null && (
            <motion.div
              className="metric-card-inline"
              whileHover={{ y: -2 }}
            >
              <span className="metric-label">{UI_LABELS.WEATHER_IMPACT}</span>
              <span className="metric-value-small">{weatherImpactNote}</span>
            </motion.div>
          )}
        </div>
      </motion.div>

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
      </motion.div>

      <motion.div variants={fadeUp}>
        <PlaceholderSection />
      </motion.div>
    </motion.div>
  );
}
