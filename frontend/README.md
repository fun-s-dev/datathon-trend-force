# Urban Traffic Congestion Intelligence — Frontend

Production-ready React frontend for an Urban Traffic Congestion Forecasting System. **No mock data.** UI renders exclusively from backend API responses.

## Setup

1. Configure API in `src/services/api.js`:

```js
export const BASE_URL = "http://localhost:5000";  // your backend URL
export const PREDICTION_API = "/predict";         // prediction endpoint
export const INCIDENT_API = "/report-incident";   // incident endpoint
```

2. Run:

```bash
npm install
npm run dev
```

## Pages

- **Dashboard** (`/`) — Route prediction: source, destination, time of travel. Calls prediction API and renders results. States: idle, loading, success, empty (model not trained), error (with retry).
- **Report Incident** (`/report-incident`) — Incident form. Submits to INCIDENT_API. Success/failure feedback only; backend handles prediction impact.

## Design

- Background: #f5ebe0 (Soft Sand)
- Surface cards: #d5bdaf
- Text: black
- Status: muted green (low), amber (medium), red (high)

## Structure

```
src/
  components/  RouteCard, MetricCard, StatusBadge, LoaderSkeleton, ErrorState, Header
  pages/       Dashboard, IncidentReport
  services/    api.js (placeholders only)
  hooks/
```
