import { UI_LABELS, EXPLANATION_TEMPLATES, interpolateTemplate } from "../config/constants";

export interface DelayBreakdownProps {
  base?: number;
  delay?: number;
  total?: number;
}

export function DelayBreakdown({ base, delay, total }: DelayBreakdownProps) {
  const b = base ?? 0;
  const d = delay ?? 0;
  const t = total ?? b + d;
  if (b === 0 && d === 0 && t === 0) return null;

  const text = interpolateTemplate(EXPLANATION_TEMPLATES.DELAY_BREAKDOWN, {
    base: b,
    delay: d,
    total: t,
  });

  return (
    <div className="delay-breakdown">
      <span className="delay-breakdown-label">{UI_LABELS.BASE_TIME} + {UI_LABELS.PREDICTED_DELAY}</span>
      <span className="delay-breakdown-value">{text}</span>
    </div>
  );
}
