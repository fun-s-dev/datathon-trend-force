/**
 * API integration - Urban Traffic Congestion Forecasting
 * No hardcoded data. UI renders ONLY from backend responses.
 */

export const BASE_URL = "http://localhost:8000";
export const PREDICTION_API = "/predict-route";
export const INCIDENT_API = "";

function buildUrl(endpoint) {
  const base = String(BASE_URL || "").replace(/\/$/, "");
  const path = String(endpoint || "").trim();
  if (!base || !path) return null;
  const sep = path.startsWith("/") ? "" : "/";
  return `${base}${sep}${path}`;
}

/**
 * Fetch prediction from ML model via backend.
 * Returns response or throws. No fallback values.
 */
export async function fetchPrediction(source, destination, travelDay, travelTime, weather) {
  const url = buildUrl(PREDICTION_API);
  if (!url) {
    throw new Error("API not configured");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source,
      destination,
      travel_day: travelDay,
      travel_time: travelTime,
      weather,
    }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.detail || res.statusText || "Prediction request failed");
  }
  const data = await res.json();
  return data;
}

/**
 * Report incident to backend.
 * Returns success or throws.
 */
export async function reportIncident(data) {
  const url = buildUrl(INCIDENT_API);
  if (!url) {
    throw new Error("API not configured");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(res.statusText || "Incident report failed");
  }
  return res;
}
