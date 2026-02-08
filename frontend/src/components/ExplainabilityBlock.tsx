import { UI_LABELS, EXPLANATION_TEMPLATES, WEEKEND_DAYS, interpolateTemplate } from "../config/constants";

export interface ExplainabilityBlockProps {
  routeName?: string;
  totalTime?: number;
  base?: number;
  delay?: number;
  peakHourFlag?: boolean;
  travelDay?: string;
  weatherImpactNote?: string;
}

export function ExplainabilityBlock({
  routeName,
  totalTime,
  base,
  delay,
  peakHourFlag,
  travelDay,
  weatherImpactNote,
}: ExplainabilityBlockProps) {
  const rankingText =
    routeName != null && totalTime != null && base != null && delay != null
      ? interpolateTemplate(EXPLANATION_TEMPLATES.RANKING_WHY, {
          route_name: routeName,
          total_time: totalTime,
          base,
          delay,
        })
      : null;

  const isWeekend =
    travelDay != null && WEEKEND_DAYS.includes(String(travelDay).toLowerCase());
  const dayNote = isWeekend
    ? EXPLANATION_TEMPLATES.WEEKEND_NOTE
    : EXPLANATION_TEMPLATES.WEEKDAY_NOTE;

  return (
    <div className="explainability-block card">
      <h3>{UI_LABELS.WHY_RECOMMENDED}</h3>
      <div className="explainability-content">
        {rankingText != null && <p className="explainability-text">{rankingText}</p>}
        <div className="explainability-context">
          <span className="explainability-label">{UI_LABELS.CONTEXT}</span>
          {peakHourFlag && (
            <span className="explainability-note">{EXPLANATION_TEMPLATES.PEAK_HOUR_NOTE}</span>
          )}
          <span className="explainability-note">{dayNote}</span>
          {weatherImpactNote != null && weatherImpactNote !== "" && (
            <span className="explainability-note">{weatherImpactNote}</span>
          )}
        </div>
      </div>
    </div>
  );
}
