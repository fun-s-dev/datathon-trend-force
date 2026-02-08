/**
 * UI constants and labels — config-driven, no hard-coded strings in components.
 * Values align with backend response fields.
 */

export const MAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const MAP_ROUTE_COLOR_RECOMMENDED = "#334155";
export const MAP_ROUTE_COLOR_ALTERNATE = "#94a3b8";
export const MAP_ROUTE_WEIGHT_RECOMMENDED = 5;
export const MAP_ROUTE_WEIGHT_ALTERNATE = 3;

export const MAP_NO_GEOMETRY_MESSAGE =
  "Route map is unavailable. Routes are ranked by distance and predicted delay — use the route cards below to compare options.";

export const MAP_MULTI_ROUTE_ALTERNATIVES_MESSAGE =
  "Multiple route options are available. Routes are ranked by distance and predicted delay. Compare the route cards below to choose the best option for your trip.";

export const DASHBOARD_CONFIG = {
  ENABLED_VIEWS: ["navigation", "planner", "operator"] as const,
  DEFAULT_VIEW: "navigation" as const,
  VIEW_LABELS: {
    navigation: "Navigation",
    planner: "City Planner",
    operator: "Traffic Operator",
  } as Record<string, string>,
};

export type DashboardView = (typeof DASHBOARD_CONFIG.ENABLED_VIEWS)[number];

export const FEATURE_FLAGS = {
  SHOW_JOURNEY_SUMMARY: true,
  SHOW_COMPARISON_TABLE: true,
  SHOW_EXPORT: true,
  SHOW_ALERTS: true,
  SHOW_RANKING_EXPLANATION: true,
  SHOW_PLACEHOLDERS: true,
  SHOW_ANALYTICS: true,
};

export const ALERT_THRESHOLDS = {
  RISK_SCORE_ALERT: 70,
};

export const EXPLANATION_TEMPLATES = {
  RANKING_WHY: "Route {route_name} is recommended with total time {total_time} mins (base {base} + delay {delay}).",
  DELAY_BREAKDOWN: "{base} + {delay} = {total} mins",
  PEAK_HOUR_NOTE: "Travel during peak hours — expect higher congestion.",
  WEEKEND_NOTE: "Weekend travel — patterns may differ from weekdays.",
  WEEKDAY_NOTE: "Weekday travel.",
};

export const SUMMARY_TEMPLATES = {
  WHY_RECOMMENDED: "Route {route_name} is recommended with total time {total_time} mins (base {base} + delay {delay}).",
  TIME_SAVED_VS_ALTERNATIVES: "Up to {max_saved} mins can be saved vs alternatives. Best route: {best_route}.",
  CONGESTION_CONSISTENCY: "Congestion across routes is {indicator}.",
  RUN_SUMMARY_TOTAL: "{count} route(s) available.",
  RUN_SUMMARY_FASTEST: "Fastest: {name}.",
  RUN_SUMMARY_SAFEST: "Safest: {name}.",
  RUN_SUMMARY_AVG_DELAY: "Average delay: {value} mins.",
  ROUTE_INSIGHT: "• {name}: {distance} km, {total} mins total (base {base} + delay {delay}), {risk} risk, {congestion} congestion.",
  ROUTE_INSIGHT_TIME_SAVED: "• {name}: saves {saved} mins vs slowest alternative.",
  ROUTE_INSIGHT_EFFICIENCY: "• {name}: {efficiency} km/min.",
};

export const DATA_NOT_AVAILABLE = "Data not available.";

export const CONGESTION_ORDER = ["light", "moderate", "heavy"];
export const RISK_ORDER = ["low", "high"];

export const PLACEHOLDER_MESSAGES = {
  HISTORICAL_TRENDS: "Historical congestion trends will appear here when sufficient data is available.",
  EVENT_IMPACT: "Event-based congestion impact will appear when event data is integrated.",
  SENSOR_FEEDS: "Real-time sensor data integration is planned for future releases.",
  INCIDENT_CORRELATION: "Incident correlation with predictions will appear when incident data is linked.",
};

export const TABLE_COLUMNS = [
  { key: "rank", labelKey: "ROUTE_RANK" },
  { key: "name", labelKey: "ROUTE_NAME" },
  { key: "distance_km", labelKey: "DISTANCE" },
  { key: "base_time_min", labelKey: "BASE_TIME" },
  { key: "predicted_delay_min", labelKey: "PREDICTED_DELAY" },
  { key: "predicted_time_min", labelKey: "TOTAL_TIME" },
  { key: "risk", labelKey: "RISK" },
  { key: "congestionLevel", labelKey: "CONGESTION" },
] as const;

export const ANALYTICS_TABLE_COLUMNS = [
  { key: "rank", labelKey: "ROUTE_RANK" },
  { key: "name", labelKey: "ROUTE_NAME" },
  { key: "distance_km", labelKey: "DISTANCE" },
  { key: "base_time_min", labelKey: "BASE_TIME" },
  { key: "predicted_delay_min", labelKey: "PREDICTED_DELAY" },
  { key: "predicted_time_min", labelKey: "TOTAL_TIME" },
  { key: "delay_percentage", labelKey: "DELAY_PERCENTAGE" },
  { key: "time_saved_vs_best_route", labelKey: "TIME_SAVED" },
  { key: "efficiency_km_per_min", labelKey: "EFFICIENCY" },
  { key: "relative_risk_rank", labelKey: "RELATIVE_RISK_RANK" },
  { key: "relative_congestion_rank", labelKey: "RELATIVE_CONGESTION_RANK" },
  { key: "risk", labelKey: "RISK" },
  { key: "congestionLevel", labelKey: "CONGESTION" },
] as const;

export const EXPORT_CONFIG = {
  ENABLED: true,
  FORMATS: ["json", "csv"] as const,
};

export const UI_LABELS = {
  ROUTE_RANK: "Rank",
  ROUTE_NAME: "Route",
  RANK_LABEL: "Rank #",
  RECOMMENDED_RANK: "Recommended / Rank #",
  DISTANCE: "Distance",
  BASE_TIME: "Base time",
  PREDICTED_DELAY: "Predicted delay",
  TOTAL_TIME: "Total travel time",
  RISK: "Risk",
  CONGESTION: "Congestion",
  RECOMMENDED: "Recommended",
  ROUTES: "Routes",
  ROUTE_ALTERNATIVES: "Route alternatives",
  METRICS: "Metrics",
  CONGESTION_LEVEL: "Congestion level",
  RISK_SCORE: "Risk score",
  PEAK_HOUR: "Peak hour",
  MAP: "Map",
  WEATHER_IMPACT: "Weather impact",
  ADVANCED_OPTIONS: "Advanced options",
  URGENCY_LEVEL: "Urgency level",
  SOURCE: "Source location",
  DESTINATION: "Destination location",
  TRAVEL_DAY: "Travel day",
  TRAVEL_TIME: "Time of travel",
  WEATHER: "Weather condition",
  JOURNEY_SUMMARY: "Journey summary",
  RECOMMENDED_ROUTE: "Recommended route",
  TOTAL_DURATION: "Total duration",
  EXPECTED_DELAY: "Expected delay",
  COMPARISON_TABLE: "Route comparison",
  EXPORT: "Export",
  EXPORT_JSON: "Export JSON",
  EXPORT_CSV: "Export CSV",
  WHY_RECOMMENDED: "Why this route is recommended",
  CONTEXT: "Context",
  PEAK_HOUR_CONTEXT: "Peak hour",
  WEEKEND_WEEKDAY: "Day type",
  ALERT_HIGH_RISK: "High congestion risk — expect delays.",
  PLACEHOLDER_TITLE: "Coming soon",
  ALTERNATIVES_AVAILABLE: "alternative route(s) available.",
  API_NOT_CONFIGURED: "API not configured. Set BASE_URL and PREDICTION_API in services/api.js",
  PREDICTION_FAILED: "Prediction failed",
  PLACEHOLDER_SOURCE: "Enter source location",
  PLACEHOLDER_DESTINATION: "Enter destination location",
  PLACEHOLDER_DAY: "Select a day",
  PLACEHOLDER_HOUR: "Hour",
  PLACEHOLDER_AMPM: "AM/PM",
  PLACEHOLDER_WEATHER: "Select weather",
  PLACEHOLDER_URGENCY_DEFAULT: "Default",
  IDLE_MESSAGE: "Enter route details and click Predict",
  EMPTY_MESSAGE: "No routes found",
  DELAY_PERCENTAGE: "Delay %",
  TIME_SAVED: "Time saved vs best",
  EFFICIENCY: "Efficiency (km/min)",
  RELATIVE_RISK_RANK: "Risk rank",
  RELATIVE_CONGESTION_RANK: "Congestion rank",
  TOTAL_ROUTES: "Total routes",
  FASTEST_ROUTE: "Fastest route",
  SAFEST_ROUTE: "Safest route",
  AVERAGE_DELAY: "Average delay",
  DELAY_VARIANCE: "Delay variance",
  RISK_SPREAD: "Risk spread",
  CONGESTION_CONSISTENCY: "Congestion consistency",
  ANALYTICS_SUMMARY: "Analytics summary",
  INSIGHTS: "Insights",
  PLANNER_ANALYTICS: "Planner analytics",
  NAVIGATION_ANALYTICS: "Navigation summary",
} as const;

export const STATUS_VARIANTS = ["low", "medium", "high", "default"] as const;
export const CONGESTION_VARIANTS = ["light", "moderate", "heavy"] as const;

export const WEEKEND_DAYS = ["saturday", "sunday"];

export function toStatusVariant(value: string | null | undefined): string {
  if (value == null || value === "") return "default";
  const n = String(value).toLowerCase();
  if (n === "low" || n === "light") return "low";
  if (n === "medium" || n === "moderate") return "medium";
  if (n === "high" || n === "heavy") return "high";
  return "default";
}

export function interpolateTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
  }
  return result;
}
