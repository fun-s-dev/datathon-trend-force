"""
Pydantic schemas for request validation and response serialisation.
"""

from typing import List, Literal, Optional
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
    # Optional inputs — defaults applied in config; feature engineering uses when present
    vehicle_type: Optional[str] = Field(None, description="Vehicle type (e.g. car, truck)")
    urgency_level: Optional[str] = Field(None, description="Urgency: low, normal, high")
    preferred_route_type: Optional[str] = Field(None, description="Preferred route type (e.g. fastest, shortest)")


# ── Response ─────────────────────────────────────────────────────────────────

class RouteResult(BaseModel):
    """Single route in the prediction response — standardised fields."""
    rank: int
    route: str
    name: str
    distance: float
    distance_km: float
    duration_min: float
    baseTime: float
    base_time_min: float                 # spec-aligned alias
    predicted_time: float
    predicted_time_min: float            # spec-aligned alias
    predicted_delay: float
    predictedDelay: float
    predicted_delay_min: float           # spec-aligned alias
    risk: str
    isRecommended: bool
    confidence: float
    geometry: List[List[float]]
    # Optional derived fields — computed from config thresholds
    congestionLevel: Optional[str] = None
    riskScore: Optional[float] = None
    peakHourFlag: Optional[bool] = None
    weatherImpactNote: Optional[str] = None


class PredictionResponse(BaseModel):
    """Full JSON response returned by POST /predict-route."""
    routes: List[RouteResult]
    confidence: str
    # Optional aggregated fields — derived from config
    congestionLevel: Optional[str] = None
    riskScore: Optional[float] = None
    peakHourFlag: Optional[bool] = None
    weatherImpactNote: Optional[str] = None


# ── Incident ──────────────────────────────────────────────────────────────────

class IncidentRequest(BaseModel):
    """Payload the frontend sends to POST /report-incident."""
    location: str = Field(..., min_length=1, description="Incident location")
    type: str = Field(..., min_length=1, description="Incident type")
    severity: str = Field(..., min_length=1, description="Severity level")
    description: str = Field("", description="Optional description")


class IncidentResponse(BaseModel):
    """Response for POST /report-incident."""
    status: str
    message: str
