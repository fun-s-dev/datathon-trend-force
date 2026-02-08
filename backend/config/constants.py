"""
Central constants and configuration for prediction logic.
All thresholds, labels, and mappings live here — no hard-coding in routes or services.
"""

from typing import Dict, List, Optional

# ── Risk thresholds ───────────────────────────────────────────────────────────
# High risk if predicted_delay >= threshold OR weather_severity >= threshold
HIGH_DELAY_THRESHOLD_MIN: float = 15.0
HIGH_WEATHER_SEVERITY_THRESHOLD: float = 3.0

# ── Risk labels ───────────────────────────────────────────────────────────────
RISK_LOW: str = "Low"
RISK_HIGH: str = "High"

# ── Overall confidence heuristics ─────────────────────────────────────────────
# (num_routes, weather_severity) → confidence label
CONFIDENCE_LABELS: List[str] = ["Low", "Medium", "High"]

# Rules: (min_num_routes, max_weather_severity) → confidence
# Evaluated in order; first match wins.
CONFIDENCE_HIGH_MIN_ROUTES: int = 3
CONFIDENCE_HIGH_MAX_WEATHER: float = 1.0
CONFIDENCE_MEDIUM_MIN_ROUTES: int = 2
CONFIDENCE_MEDIUM_MAX_WEATHER: float = 3.0

# ── Congestion level thresholds (delay-based) ──────────────────────────────────
# Light: delay < light_max
# Moderate: light_max <= delay < moderate_max
# Heavy: delay >= moderate_max
CONGESTION_LIGHT_MAX_DELAY: float = 5.0
CONGESTION_MODERATE_MAX_DELAY: float = 15.0

CONGESTION_LIGHT: str = "Light"
CONGESTION_MODERATE: str = "Moderate"
CONGESTION_HEAVY: str = "Heavy"

# ── Peak hour definition (24h format) ──────────────────────────────────────────
PEAK_HOUR_START: int = 7
PEAK_HOUR_END: int = 9
PEAK_HOUR_EVENING_START: int = 17
PEAK_HOUR_EVENING_END: int = 19

# ── Weather impact notes (severity → template) ────────────────────────────────
# Indexed by weather_severity (int): 0=Clear, 1=Extreme, 2=Fog, 3=Rain, 4=Snow
WEATHER_IMPACT_TEMPLATES: Dict[int, str] = {
    0: "Clear conditions — minimal impact expected.",
    1: "Extreme weather — significant delays likely.",
    2: "Fog — reduced visibility may slow traffic.",
    3: "Rain — moderate delays expected.",
    4: "Snow — major delays possible.",
}

# ── Routing ───────────────────────────────────────────────────────────────────
MAX_ROUTES: int = 3
ROUTE_NAME_FALLBACK_PREFIX: str = "Route "

# ── Weather encoding (must match training-time label encoder) ───────────────────
WEATHER_SEVERITY_MAP: Dict[str, float] = {
    "Clear": 0.0,
    "Extreme": 1.0,
    "Fog": 2.0,
    "Rain": 3.0,
    "Snow": 4.0,
}

# ── Optional request defaults (when user does not provide) ─────────────────────
DEFAULT_VEHICLE_TYPE: Optional[str] = None
DEFAULT_URGENCY_LEVEL: Optional[str] = None
DEFAULT_PREFERRED_ROUTE_TYPE: Optional[str] = None
