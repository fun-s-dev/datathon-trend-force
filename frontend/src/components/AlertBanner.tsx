import { motion } from "framer-motion";
import { FEATURE_FLAGS, ALERT_THRESHOLDS, UI_LABELS } from "../config/constants";

export interface AlertBannerProps {
  riskScore?: number;
  risk?: string;
}

export function AlertBanner({ riskScore, risk }: AlertBannerProps) {
  if (!FEATURE_FLAGS.SHOW_ALERTS) return null;

  const isHighRisk =
    risk === "High" || (riskScore != null && riskScore >= ALERT_THRESHOLDS.RISK_SCORE_ALERT);
  if (!isHighRisk) return null;

  return (
    <motion.div
      className="alert-banner card alert-high"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
    >
      <motion.span
        className="alert-banner-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {UI_LABELS.ALERT_HIGH_RISK}
      </motion.span>
    </motion.div>
  );
}
