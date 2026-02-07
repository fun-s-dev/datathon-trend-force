"""
generate_models.py
==================
Run ONCE to create placeholder .pkl artefacts for demo / development.
Replace these with your real trained models for production.

Usage:
    cd backend
    python generate_models.py
"""

import os
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingRegressor


# ── Output directory ─────────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)


# ── 1. Weather Encoder ──────────────────────────────────────────────────────
# A minimal encoder that maps weather strings → severity floats.
# The backend calls encoder.transform([weather_string]).

class WeatherSeverityEncoder:
    """Ordinal encoder mapping weather labels to severity scores (1-5)."""

    def __init__(self):
        self.mapping = {
            "Clear": 1,
            "Fog": 2,
            "Rain": 3,
            "Snow": 4,
            "Extreme": 5,
        }

    def transform(self, values):
        """Accept a list of weather strings, return list of severity ints."""
        result = []
        for v in values:
            if v not in self.mapping:
                raise ValueError(f"Unknown weather value: '{v}'")
            result.append(self.mapping[v])
        return result


encoder = WeatherSeverityEncoder()
encoder_path = os.path.join(MODEL_DIR, "weather_encoder.pkl")
joblib.dump(encoder, encoder_path)
print(f"[OK] Weather encoder saved → {encoder_path}")


# ── 2. Traffic Ranking Model ────────────────────────────────────────────────
# Feature order (9 features):
#   distance_km, base_duration_min, hour_sin, hour_cos,
#   is_weekend, weather_severity, default_density, default_lanes, default_signals
#
# Target: delay_minutes (non-negative)

rng = np.random.RandomState(42)
n_samples = 2000

distance_km = rng.uniform(2, 50, n_samples)
base_duration = rng.uniform(5, 90, n_samples)
hour = rng.randint(0, 24, n_samples)
hour_sin = np.sin(2 * np.pi * hour / 24)
hour_cos = np.cos(2 * np.pi * hour / 24)
is_weekend = rng.choice([0, 1], n_samples, p=[5 / 7, 2 / 7])
weather_sev = rng.choice([1, 2, 3, 4, 5], n_samples)
density = np.full(n_samples, 50.0)
lanes = np.full(n_samples, 3)
signals = np.full(n_samples, 5)

X = np.column_stack([
    distance_km, base_duration, hour_sin, hour_cos,
    is_weekend, weather_sev, density, lanes, signals,
])

# Synthetic delay target: influenced by distance, weather, and peak hours
peak_factor = np.where((hour >= 8) & (hour <= 10) | (hour >= 17) & (hour <= 20), 1.5, 1.0)
y = (
    0.15 * distance_km
    + 0.05 * base_duration
    + 2.0 * weather_sev
    + 3.0 * peak_factor
    - 1.5 * is_weekend
    + rng.normal(0, 2, n_samples)
)
y = np.maximum(y, 0)  # no negative delay

model = GradientBoostingRegressor(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.1,
    random_state=42,
)
model.fit(X, y)

model_path = os.path.join(MODEL_DIR, "traffic_ranking_model.pkl")
joblib.dump(model, model_path)
print(f"[OK] Traffic model saved  → {model_path}")
print("\nDone. You can now start the backend with:")
print("  uvicorn main:app --reload")
