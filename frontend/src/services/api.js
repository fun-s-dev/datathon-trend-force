/**
 * API integration - Urban Traffic Congestion Forecasting
 * No hardcoded data. UI renders ONLY from backend responses.
 */

export const BASE_URL = "";
export const PREDICTION_API = "";
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
export async function fetchPrediction(source, destination, timeOfTravel) {
  const url = buildUrl(PREDICTION_API);
  if (!url) {
    throw new Error("API not configured");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, destination, timeOfTravel }),
  });
  if (!res.ok) {
    throw new Error(res.statusText || "Prediction request failed");
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
