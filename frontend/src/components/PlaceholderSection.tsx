import { PLACEHOLDER_MESSAGES, UI_LABELS, FEATURE_FLAGS } from "../config/constants";

const PLACEHOLDER_ITEMS = [
  { key: "HISTORICAL_TRENDS", messageKey: "HISTORICAL_TRENDS" as keyof typeof PLACEHOLDER_MESSAGES },
  { key: "EVENT_IMPACT", messageKey: "EVENT_IMPACT" as keyof typeof PLACEHOLDER_MESSAGES },
  { key: "SENSOR_FEEDS", messageKey: "SENSOR_FEEDS" as keyof typeof PLACEHOLDER_MESSAGES },
  { key: "INCIDENT_CORRELATION", messageKey: "INCIDENT_CORRELATION" as keyof typeof PLACEHOLDER_MESSAGES },
] as const;

export function PlaceholderSection() {
  if (!FEATURE_FLAGS.SHOW_PLACEHOLDERS) return null;

  return (
    <div className="placeholder-section card">
      <h3>{UI_LABELS.PLACEHOLDER_TITLE}</h3>
      <div className="placeholder-list">
        {PLACEHOLDER_ITEMS.map((item) => (
          <div key={item.key} className="placeholder-item">
            <p className="placeholder-message">{PLACEHOLDER_MESSAGES[item.messageKey]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
