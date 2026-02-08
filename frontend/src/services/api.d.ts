export const BASE_URL: "http://localhost:8000";
export const PREDICTION_API: "/predict-route";
export const INCIDENT_API: "/report-incident";

export interface FetchPredictionOptions {
  vehicle_type?: string;
  urgency_level?: string;
  preferred_route_type?: string;
}

export function fetchPrediction(
  source: string,
  destination: string,
  travelDay: string,
  travelTime: string,
  weather: string,
  options?: FetchPredictionOptions
): Promise<Record<string, unknown>>;

export function reportIncident(data: {
  location: string;
  type: string;
  severity: string;
  description?: string;
}): Promise<Response>;
