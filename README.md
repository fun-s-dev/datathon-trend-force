# Urban Traffic Congestion Intelligence

A full-stack, ML-powered traffic prediction platform that forecasts route delays, congestion levels, and risk scores in real time — helping commuters, city planners, and traffic operators make smarter travel decisions.

---

## Problem Statement

Urban traffic congestion costs billions of hours and dollars annually. Commuters lack reliable tools that combine **real-time routing**, **weather conditions**, and **time-of-day patterns** into a single actionable prediction. Existing navigation apps show current conditions but rarely forecast delays before you leave.

This project tackles the problem by delivering **pre-trip delay predictions** powered by machine learning, giving users the ability to compare routes, assess risk, and plan smarter — all from a single dashboard.

---

## Solution Overview

The platform accepts a **source**, **destination**, **travel day**, **time**, and **weather condition** as inputs. It then:

1. **Geocodes** the locations using Photon (OpenStreetMap-based, no API key required)
2. **Fetches alternative routes** via OSRM (Open Source Routing Machine)
3. **Engineers features** — cyclic hour encoding, weekend flags, weather severity, route distance/duration
4. **Runs ML inference** using a pre-trained Gradient Boosting model to predict delay per route
5. **Ranks routes** by total predicted travel time and returns congestion levels, risk scores, peak-hour flags, and weather impact notes

The frontend presents this through **three dashboard views** tailored to different personas: Navigation (commuter), City Planner, and Traffic Operator.

---

## Key Features

- **Multi-Route Comparison** — Up to 3 alternative routes ranked by predicted total time
- **Delay Prediction** — ML-based per-route delay forecast using distance, time, day, and weather features
- **Risk Scoring** — 0–100 composite risk score combining delay severity and weather impact
- **Congestion Classification** — Light / Moderate / Heavy congestion labels per route
- **Peak Hour Detection** — Flags travel during morning (7–9 AM) and evening (5–7 PM) peak windows
- **Weather Impact Notes** — Context-aware descriptions for Clear, Fog, Rain, Snow, and Extreme conditions
- **Interactive Route Map** — Leaflet-based map rendering route geometries on OpenStreetMap tiles
- **Three Dashboard Views**:
  - **Navigation** — Commuter-focused with route cards, journey summary, and map
  - **City Planner** — Aggregated metrics, context rows, and analytics panels
  - **Traffic Operator** — Congestion summaries, risk dashboards, and alert banners
- **Animated UI** — Framer Motion spring animations, staggered transitions, and a traffic-light loading state
- **Glass Morphism Design** — Dark theme with backdrop-blur cards, blue accent glow, and futuristic dropdown styling
- **Fully Responsive** — Adapts to mobile, tablet, and desktop viewports
- **No API Keys Required** — Uses entirely free services (Photon geocoding + OSRM routing)

---

## Tech Stack

| Layer       | Technology                                                        |
|-------------|-------------------------------------------------------------------|
| **Frontend** | React 18, TypeScript, Vite, Framer Motion, React Router, Leaflet |
| **Backend**  | Python, FastAPI, Uvicorn                                         |
| **ML/Data**  | scikit-learn, XGBoost, pandas, NumPy, joblib                     |
| **Geocoding**| Photon (komoot / OpenStreetMap) — free, no key                   |
| **Routing**  | OSRM (Open Source Routing Machine) — free, no key                |
| **Styling**  | CSS custom properties, glass morphism, keyframe animations       |

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)              │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐    │
│  │Dashboard │  │Route Map │  │ Analytics / Alerts   │    │
│  │  (Form)  │  │(Leaflet) │  │ (3 Dashboard Views)  │    │
│  └────┬─────┘  └──────────┘  └─────────────────────┘    │
│       │                                                   │
│       │  POST /predict-route                              │
└───────┼───────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                       │
│                                                           │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │  Geocoding  │──▶│   Routing    │──▶│   Feature    │   │
│  │  (Photon)   │   │   (OSRM)    │   │ Engineering  │   │
│  └─────────────┘   └──────────────┘   └──────┬───────┘   │
│                                              │           │
│                                   ┌──────────▼────────┐  │
│                                   │   ML Inference    │  │
│                                   │ (Gradient Boost)  │  │
│                                   └──────────┬────────┘  │
│                                              │           │
│                              ┌───────────────▼────────┐  │
│                              │  Risk / Congestion /   │  │
│                              │  Ranking / Confidence  │  │
│                              └────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## How to Run the Project Locally

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- Internet connection (for Photon geocoding and OSRM routing calls)

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Generate placeholder ML model artefacts (run once)
python generate_models.py

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Verify with `http://localhost:8000/health`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

The UI will open at `http://localhost:5173` (default Vite port).

### 3. Usage

1. Enter a **source** and **destination** (e.g., "Mumbai" → "Pune")
2. Select **travel day**, **time**, and **weather condition**
3. Optionally expand **Advanced Options** to set urgency level
4. Click **Predict** to view ranked routes with delay forecasts, risk scores, and map

---

## Folder Structure

```
datathon-trend-force/
├── README.md
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt           # Python dependencies
│   ├── generate_models.py         # One-time model generation script
│   ├── api/
│   │   ├── routes.py              # Prediction & incident endpoints
│   │   └── schemas.py             # Pydantic request/response models
│   ├── config/
│   │   ├── constants.py           # Thresholds, labels, mappings
│   │   └── settings.py            # Env-based configuration
│   ├── models/                    # Pre-trained .pkl artefacts
│   └── services/
│       ├── geocoding_service.py   # Photon geocoding integration
│       ├── routing_service.py     # OSRM routing integration
│       ├── feature_engineering.py # Feature vector construction
│       └── ml_service.py          # Model loading & inference
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── App.tsx                # Root component with routing
│       ├── App.css                # Global styles & design system
│       ├── index.css              # CSS variables & keyframes
│       ├── config/
│       │   └── constants.ts       # UI labels, thresholds, feature flags
│       ├── pages/
│       │   ├── Dashboard.tsx      # Main prediction form & state machine
│       │   ├── NavigationDashboard.tsx
│       │   ├── CityPlannerDashboard.tsx
│       │   └── TrafficOperatorDashboard.tsx
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── RouteCard.tsx
│       │   ├── RouteMap.tsx
│       │   ├── MetricCard.tsx
│       │   ├── StatusBadge.tsx
│       │   ├── LoaderSkeleton.tsx
│       │   ├── ErrorState.tsx
│       │   ├── AlertBanner.tsx
│       │   ├── AnalyticsPanel.tsx
│       │   ├── JourneySummary.tsx
│       │   └── ...
│       └── services/
│           └── api.js             # Backend API client
```

---

## Future Enhancements

- **Real-Time Traffic Data** — Integrate live traffic feeds for dynamic delay adjustments
- **Historical Trend Analysis** — Store and visualize delay trends over time
- **User Accounts & Saved Routes** — Personalized route preferences and trip history
- **Push Notifications** — Alert users when predicted delays exceed thresholds
- **Multi-Modal Transport** — Extend predictions to public transit, cycling, and walking
- **Advanced ML Models** — Train on larger datasets with deep learning (LSTM / Transformer) for temporal patterns
- **Incident Reporting Pipeline** — Process reported incidents to dynamically adjust predictions
- **Heatmap Overlays** — Visualize congestion density across city regions on the map
- **Accessibility Improvements** — Full ARIA compliance and keyboard navigation support

---

## Conclusion

**Urban Traffic Congestion Intelligence** demonstrates how machine learning and open geospatial services can be combined into a practical, end-to-end traffic prediction platform — without requiring paid APIs or proprietary data. The multi-persona dashboard design makes the same prediction data actionable for commuters choosing a route, city planners analyzing congestion patterns, and traffic operators monitoring risk in real time.

Built for the datathon by **Team Trend Force**.
