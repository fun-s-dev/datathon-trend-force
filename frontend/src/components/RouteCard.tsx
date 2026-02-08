import { motion } from "framer-motion";
import { UI_LABELS, toStatusVariant } from "../config/constants";
import { StatusBadge } from "./StatusBadge";
import { DelayBreakdown } from "./DelayBreakdown";
import { AnimatedNumber } from "./AnimatedNumber";

export interface RouteData {
  id?: string | number;
  rank?: number;
  name?: string;
  distance?: number;
  distance_km?: number;
  baseTime?: number;
  base_time_min?: number;
  duration_min?: number;
  predictedDelay?: number;
  predicted_delay_min?: number;
  estimatedDelay?: number;
  predicted_time?: number;
  predicted_time_min?: number;
  isRecommended?: boolean;
  risk?: string;
  congestionLevel?: string;
  riskScore?: number;
  [key: string]: unknown;
}

interface RouteCardProps {
  route: RouteData;
  index?: number;
}

function getRiskClass(risk?: string): string {
  if (!risk) return "";
  const r = risk.toLowerCase();
  if (r === "high") return "risk-high";
  if (r === "medium" || r === "moderate") return "risk-medium";
  return "";
}

export function RouteCard({ route, index = 0 }: RouteCardProps) {
  const name = route?.name ?? "Route";
  const distance = route?.distance ?? route?.distance_km;
  const baseTime = route?.baseTime ?? route?.base_time_min ?? route?.duration_min;
  const delay = route?.predictedDelay ?? route?.predicted_delay_min ?? route?.estimatedDelay;
  const totalTime = route?.predicted_time ?? route?.predicted_time_min;
  const recommended = Boolean(route?.isRecommended);
  const rank = route?.rank;
  const risk = route?.risk;
  const congestionLevel = route?.congestionLevel;
  const riskClass = getRiskClass(risk);

  const rankLabel =
    recommended && rank === 1
      ? `${UI_LABELS.RECOMMENDED_RANK}${rank}`
      : rank != null
        ? `${UI_LABELS.RANK_LABEL}${rank}`
        : null;

  return (
    <motion.article
      className={`route-card ${recommended ? "recommended" : ""} ${riskClass}`}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 18,
        delay: index * 0.08,
      }}
      whileHover={{
        y: -4,
        boxShadow: recommended
          ? "0 12px 40px rgba(34,197,94,0.2)"
          : "0 12px 40px rgba(0,0,0,0.3)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {recommended && (
        <motion.span
          className="recommended-badge"
          initial={{ opacity: 0, scale: 0, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: index * 0.08 + 0.2 }}
        >
          {UI_LABELS.RECOMMENDED}
        </motion.span>
      )}
      <div className="route-header">
        <span className="route-name">{name}</span>
        {rankLabel != null && <span className="route-rank">{rankLabel}</span>}
      </div>
      <div className="route-metrics">
        {distance != null && (
          <div className="metric">
            <span className="metric-label">{UI_LABELS.DISTANCE}</span>
            <span className="metric-value">
              <AnimatedNumber value={distance} /> km
            </span>
          </div>
        )}
        {baseTime != null && (
          <div className="metric">
            <span className="metric-label">{UI_LABELS.BASE_TIME}</span>
            <span className="metric-value">
              <AnimatedNumber value={baseTime} /> mins
            </span>
          </div>
        )}
        {delay != null && (
          <div className="metric">
            <span className="metric-label">{UI_LABELS.PREDICTED_DELAY}</span>
            <span className="metric-value accent">
              <AnimatedNumber value={delay} /> mins
            </span>
          </div>
        )}
        {totalTime != null && (
          <div className="metric total-time">
            <span className="metric-label">{UI_LABELS.TOTAL_TIME}</span>
            <span className="metric-value">
              <AnimatedNumber value={totalTime} /> mins
            </span>
          </div>
        )}
        {(baseTime != null || delay != null || totalTime != null) && (
          <DelayBreakdown
            base={baseTime}
            delay={delay}
            total={totalTime}
          />
        )}
        {(risk != null || congestionLevel != null) && (
          <motion.div
            className="route-badges"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.08 + 0.3 }}
          >
            {risk != null && <StatusBadge level={risk} />}
            {congestionLevel != null && (
              <span className={`status-badge status-${toStatusVariant(congestionLevel)}`}>
                {congestionLevel}
              </span>
            )}
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}
