export const BASE_URL: string;
export const PREDICTION_API: string;
export const INCIDENT_API: string;

export function fetchPrediction(
  source: string,
  destination: string,
  timeOfTravel: string
): Promise<Record<string, unknown>>;

export function reportIncident(data: {
  location: string;
  type: string;
  severity: string;
  description?: string;
}): Promise<Response>;
