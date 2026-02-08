import { motion } from "framer-motion";
import { UI_LABELS, toStatusVariant } from "../config/constants";
import { StatusBadge } from "./StatusBadge";
import { DelayBreakdown } from "./DelayBreakdown";

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
}

export function RouteCard({ route }: RouteCardProps) {
  const name = route?.name ?? "Route";
  const distance = route?.distance ?? route?.distance_km;
  const baseTime = route?.baseTime ?? route?.base_time_min ?? route?.duration_min;
  const delay = route?.predictedDelay ?? route?.predicted_delay_min ?? route?.estimatedDelay;
  const totalTime = route?.predicted_time ?? route?.predicted_time_min;
  const recommended = Boolean(route?.isRecommended);
  const rank = route?.rank;
  const risk = route?.risk;
  const congestionLevel = route?.congestionLevel;

  const rankLabel =
    recommended && rank === 1
      ? `${UI_LABELS.RECOMMENDED_RANK}${rank}`
      : rank != null
        ? `${UI_LABELS.RANK_LABEL}${rank}`
        : null;

  return (
    <motion.article
      className={`route-card ${recommended ? "recommended" : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {recommended && <span className="recommended-badge">{UI_LABELS.RECOMMENDED}</span>}
      <div className="route-header">
        <span className="route-name">{name}</span>
        {rankLabel != null && <span className="route-rank">{rankLabel}</span>}
      </div>
      <div className="route-metrics">
        {distance != null && (
          <div className="metric">
            <span className="metric-label">{UI_LABELS.DISTANCE}</span>
            <span className="metric-value">{distance} km</span>
          </div>
        )}
        {baseTime != null && (
          <div className="metric">
            <span className="metric-label">{UI_LABELS.BASE_TIME}</span>
            <span className="metric-value">{baseTime} mins</span>
          </div>
        )}
        {delay != null && (
          <div className="metric">
            <span className="metric-label">{UI_LABELS.PREDICTED_DELAY}</span>
            <span className="metric-value accent">{delay} mins</span>
          </div>
        )}
        {totalTime != null && (
          <div className="metric total-time">
            <span className="metric-label">{UI_LABELS.TOTAL_TIME}</span>
            <span className="metric-value">{totalTime} mins</span>
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
          <div className="route-badges">
            {risk != null && <StatusBadge level={risk} />}
            {congestionLevel != null && (
              <span className={`status-badge status-${toStatusVariant(congestionLevel)}`}>
                {congestionLevel}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
