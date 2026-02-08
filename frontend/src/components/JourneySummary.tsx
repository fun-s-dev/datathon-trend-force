import { motion } from "framer-motion";
import { UI_LABELS, toStatusVariant } from "../config/constants";

export interface JourneySummaryProps {
  routeName?: string;
  totalTime?: number;
  delay?: number;
  distance?: number;
  risk?: string;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

export function JourneySummary({
  routeName,
  totalTime,
  delay,
  distance,
  risk,
}: JourneySummaryProps) {
  if (routeName == null && totalTime == null && delay == null) return null;

  return (
    <motion.div
      className="journey-summary card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 18 }}
    >
      <h3>{UI_LABELS.JOURNEY_SUMMARY}</h3>
      <motion.div className="journey-summary-grid" variants={stagger} initial="hidden" animate="visible">
        {routeName != null && (
          <motion.div className="journey-summary-item" variants={item}>
            <span className="journey-label">{UI_LABELS.RECOMMENDED_ROUTE}</span>
            <span className="journey-value">{routeName}</span>
          </motion.div>
        )}
        {totalTime != null && (
          <motion.div className="journey-summary-item" variants={item}>
            <span className="journey-label">{UI_LABELS.TOTAL_DURATION}</span>
            <span className="journey-value">{totalTime} mins</span>
          </motion.div>
        )}
        {delay != null && (
          <motion.div className="journey-summary-item" variants={item}>
            <span className="journey-label">{UI_LABELS.EXPECTED_DELAY}</span>
            <span className="journey-value">{delay} mins</span>
          </motion.div>
        )}
        {distance != null && (
          <motion.div className="journey-summary-item" variants={item}>
            <span className="journey-label">{UI_LABELS.DISTANCE}</span>
            <span className="journey-value">{distance} km</span>
          </motion.div>
        )}
        {risk != null && (
          <motion.div className="journey-summary-item" variants={item}>
            <span className="journey-label">{UI_LABELS.RISK}</span>
            <span className={`status-badge status-${toStatusVariant(risk)}`}>{risk}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
