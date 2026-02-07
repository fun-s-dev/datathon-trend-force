import { motion } from "framer-motion";

export interface RouteData {
  id?: string | number;
  name?: string;
  distance?: number;
  baseTime?: number;
  predictedDelay?: number;
  estimatedDelay?: number;
  isRecommended?: boolean;
  [key: string]: unknown;
}

interface RouteCardProps {
  route: RouteData;
}

export function RouteCard({ route }: RouteCardProps) {
  const name = route?.name ?? "Route";
  const distance = route?.distance;
  const baseTime = route?.baseTime;
  const delay = route?.predictedDelay ?? route?.estimatedDelay;
  const recommended = Boolean(route?.isRecommended);

  return (
    <motion.article
      className={`route-card ${recommended ? "recommended" : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {recommended && <span className="recommended-badge">Recommended</span>}
      <div className="route-header">
        <span className="route-name">{name}</span>
      </div>
      <div className="route-metrics">
        {distance != null && (
          <div className="metric">
            <span className="metric-label">Distance</span>
            <span className="metric-value">{distance} km</span>
          </div>
        )}
        {baseTime != null && (
          <div className="metric">
            <span className="metric-label">Base time</span>
            <span className="metric-value">{baseTime} mins</span>
          </div>
        )}
        {delay != null && (
          <div className="metric">
            <span className="metric-label">Predicted delay</span>
            <span className="metric-value accent">{delay} mins</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}
