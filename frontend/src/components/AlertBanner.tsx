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
    <div className="alert-banner card alert-high">
      <span className="alert-banner-message">{UI_LABELS.ALERT_HIGH_RISK}</span>
    </div>
  );
}
