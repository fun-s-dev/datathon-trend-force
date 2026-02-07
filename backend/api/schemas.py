"""
Pydantic schemas for request validation and response serialisation.
"""

from typing import List, Literal
from pydantic import BaseModel, Field


# ── Request ──────────────────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    """Payload the frontend sends to POST /predict-route."""
    source: str = Field(..., min_length=1, description="Origin place name")
    destination: str = Field(..., min_length=1, description="Destination place name")
    travel_day: str = Field(
        ...,
        min_length=1,
        description="Day of travel, e.g. 'monday'",
    )
    travel_time: str = Field(
        ...,
        min_length=1,
        description="Time of travel in HH:MM 24-hr format, e.g. '18:30'",
    )
    weather: Literal["Clear", "Fog", "Rain", "Snow", "Extreme"] = Field(
        ...,
        description="Weather condition",
    )


# ── Response ─────────────────────────────────────────────────────────────────

class RouteResult(BaseModel):
    """Single route in the prediction response."""
    rank: int
    route: str                          # route name / summary string
    name: str                           # alias used by frontend RouteCard
    distance: float                     # km  (frontend RouteCard reads this)
    distance_km: float                  # km  (spec requirement)
    duration_min: float                 # base duration in minutes (spec)
    baseTime: float                     # base travel time (frontend RouteCard)
    predicted_time: float               # base + predicted delay (minutes)
    predicted_delay: float              # raw model delay (spec)
    predictedDelay: float               # alias for frontend RouteCard
    risk: str                           # "High" or "Low"
    isRecommended: bool                 # True for rank-1 route
    confidence: float                   # per-route normalised confidence
    geometry: List[List[float]]         # [[lat, lng], …] from OSRM


class PredictionResponse(BaseModel):
    """Full JSON response returned by POST /predict-route."""
    routes: List[RouteResult]
    confidence: str                     # "Low", "Medium", or "High"
