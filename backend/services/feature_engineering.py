"""
Feature engineering — build the feature vector expected by the trained model.
All transformations MUST match what was used at training time.
"""

import math
from typing import Dict, List

import numpy as np
from config.settings import DEFAULT_DENSITY, DEFAULT_LANES, DEFAULT_SIGNALS


def _parse_hour(travel_time: str) -> int:
    """Extract the hour (0-23) from an 'HH:MM' string."""
    parts = travel_time.strip().split(":")
    return int(parts[0])


def _is_weekend(travel_day: str) -> int:
    """Return 1 if Saturday/Sunday, else 0."""
    return 1 if travel_day.strip().lower() in ("saturday", "sunday") else 0


def _cyclic_hour(hour: int):
    """Sine / cosine encoding for hour-of-day (period = 24h)."""
    hour_sin = math.sin(2 * math.pi * hour / 24)
    hour_cos = math.cos(2 * math.pi * hour / 24)
    return round(hour_sin, 6), round(hour_cos, 6)


def build_features(
    routes: List[Dict],
    travel_time: str,
    travel_day: str,
    weather_severity: float,
) -> np.ndarray:
    """
    Build the feature matrix (n_routes × 9) for model inference.

    Feature order (must match training):
        0  distance_km
        1  base_duration_min
        2  hour_sin
        3  hour_cos
        4  is_weekend
        5  weather_severity
        6  default_density
        7  default_lanes
        8  default_signals
    """
    hour = _parse_hour(travel_time)
    h_sin, h_cos = _cyclic_hour(hour)
    weekend = _is_weekend(travel_day)

    rows = []
    for r in routes:
        rows.append([
            r["distance_km"],
            r["base_duration_min"],
            h_sin,
            h_cos,
            weekend,
            weather_severity,
            DEFAULT_DENSITY,
            DEFAULT_LANES,
            DEFAULT_SIGNALS,
        ])

    return np.array(rows, dtype=np.float64)
