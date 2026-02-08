"""
API route handlers for the traffic prediction endpoint.
Uses Photon (geocoding) + OSRM (routing) — fully free, no API keys.
All thresholds and labels from config.constants — no hard-coding.
"""

from fastapi import APIRouter, HTTPException
from api.schemas import PredictionRequest, PredictionResponse, RouteResult, IncidentRequest, IncidentResponse
from services.geocoding_service import geocode
from services.routing_service import fetch_routes
from services.feature_engineering import build_features
from services.ml_service import encode_weather, predict_delay
from config.constants import (
    MAX_ROUTES,
    HIGH_DELAY_THRESHOLD_MIN,
    HIGH_WEATHER_SEVERITY_THRESHOLD,
    RISK_LOW,
    RISK_HIGH,
    CONFIDENCE_LABELS,
    CONFIDENCE_HIGH_MIN_ROUTES,
    CONFIDENCE_HIGH_MAX_WEATHER,
    CONFIDENCE_MEDIUM_MIN_ROUTES,
    CONFIDENCE_MEDIUM_MAX_WEATHER,
    CONGESTION_LIGHT,
    CONGESTION_MODERATE,
    CONGESTION_HEAVY,
    CONGESTION_LIGHT_MAX_DELAY,
    CONGESTION_MODERATE_MAX_DELAY,
    PEAK_HOUR_START,
    PEAK_HOUR_END,
    PEAK_HOUR_EVENING_START,
    PEAK_HOUR_EVENING_END,
    WEATHER_IMPACT_TEMPLATES,
)

router = APIRouter()


def _parse_hour(travel_time: str) -> int:
    """Extract hour (0-23) from 'HH:MM' string."""
    parts = travel_time.strip().split(":")
    return int(parts[0]) if parts else 0


def _compute_risk(predicted_delay: float, weather_severity: float) -> str:
    """Assign risk label from config thresholds."""
    if predicted_delay >= HIGH_DELAY_THRESHOLD_MIN or weather_severity >= HIGH_WEATHER_SEVERITY_THRESHOLD:
        return RISK_HIGH
    return RISK_LOW


def _compute_congestion_level(delay: float) -> str:
    """Assign congestion from config thresholds."""
    if delay < CONGESTION_LIGHT_MAX_DELAY:
        return CONGESTION_LIGHT
    if delay < CONGESTION_MODERATE_MAX_DELAY:
        return CONGESTION_MODERATE
    return CONGESTION_HEAVY


def _compute_risk_score(predicted_delay: float, weather_severity: float) -> float:
    """0-100 risk score — higher delay and weather → higher score."""
    delay_component = min(100.0, (predicted_delay / HIGH_DELAY_THRESHOLD_MIN) * 50.0)
    weather_component = min(50.0, (weather_severity / HIGH_WEATHER_SEVERITY_THRESHOLD) * 50.0)
    return round(min(100.0, delay_component + weather_component), 1)


def _is_peak_hour(hour: int) -> bool:
    """Whether hour falls within peak windows from config."""
    morning = PEAK_HOUR_START <= hour < PEAK_HOUR_END
    evening = PEAK_HOUR_EVENING_START <= hour < PEAK_HOUR_EVENING_END
    return morning or evening


def _get_weather_impact_note(weather_severity: float) -> str:
    """Weather impact note from config templates."""
    idx = int(min(4, max(0, weather_severity)))
    return WEATHER_IMPACT_TEMPLATES.get(idx, WEATHER_IMPACT_TEMPLATES.get(0, ""))


def _compute_overall_confidence(num_routes: int, weather_severity: float) -> str:
    """Overall confidence label from config rules."""
    if num_routes >= CONFIDENCE_HIGH_MIN_ROUTES and weather_severity <= CONFIDENCE_HIGH_MAX_WEATHER:
        return CONFIDENCE_LABELS[2]
    if num_routes >= CONFIDENCE_MEDIUM_MIN_ROUTES and weather_severity <= CONFIDENCE_MEDIUM_MAX_WEATHER:
        return CONFIDENCE_LABELS[1]
    return CONFIDENCE_LABELS[0]


def _normalise_confidence(delays: list[float]) -> list[float]:
    """Per-route confidence 0–1: lower delay → higher confidence."""
    if not delays:
        return []
    max_delay = max(delays) if max(delays) > 0 else 1.0
    return [round(1.0 - (d / max_delay), 4) for d in delays]


@router.post("/predict-route", response_model=PredictionResponse)
async def predict_route(payload: PredictionRequest):
    """
    Main prediction endpoint.

    Pipeline:
        1. Geocode source & destination via Photon
        2. Fetch alternative routes via OSRM
        3. Encode weather using pre-trained encoder
        4. Build feature matrix matching training schema
        5. Run ML inference for predicted delay
        6. Rank routes, assign risk labels, return top routes with derived fields
    """
    src_lat, src_lon = geocode(payload.source)
    dst_lat, dst_lon = geocode(payload.destination)

    routes_raw = fetch_routes(src_lat, src_lon, dst_lat, dst_lon, max_routes=MAX_ROUTES)
    if not routes_raw:
        raise HTTPException(status_code=400, detail="No routes found")

    weather_severity = encode_weather(payload.weather)

    features = build_features(
        routes=routes_raw,
        travel_time=payload.travel_time,
        travel_day=payload.travel_day,
        weather_severity=weather_severity,
        vehicle_type=payload.vehicle_type,
        urgency_level=payload.urgency_level,
        preferred_route_type=payload.preferred_route_type,
    )

    delays = predict_delay(features)

    combined = []
    for route_info, delay in zip(routes_raw, delays):
        base = route_info["base_duration_min"]
        final_time = round(base + delay, 2)
        risk = _compute_risk(delay, weather_severity)
        combined.append({
            "route_name": route_info["route_name"],
            "distance_km": route_info["distance_km"],
            "base_duration_min": base,
            "predicted_delay": delay,
            "final_time": final_time,
            "risk": risk,
            "geometry": route_info["geometry"],
        })

    combined.sort(key=lambda r: r["final_time"])
    sorted_delays = [r["predicted_delay"] for r in combined]
    conf_scores = _normalise_confidence(sorted_delays)

    hour = _parse_hour(payload.travel_time)
    peak_hour_flag = _is_peak_hour(hour)
    weather_note = _get_weather_impact_note(weather_severity)

    route_results: list[RouteResult] = []
    for rank, (item, conf) in enumerate(zip(combined, conf_scores), start=1):
        delay_val = item["predicted_delay"]
        base_val = item["base_duration_min"]
        final_val = item["final_time"]

        route_results.append(
            RouteResult(
                rank=rank,
                route=item["route_name"],
                name=item["route_name"],
                distance=item["distance_km"],
                distance_km=item["distance_km"],
                duration_min=base_val,
                baseTime=base_val,
                base_time_min=base_val,
                predicted_time=final_val,
                predicted_time_min=final_val,
                predicted_delay=delay_val,
                predictedDelay=delay_val,
                predicted_delay_min=delay_val,
                risk=item["risk"],
                isRecommended=(rank == 1),
                confidence=conf,
                geometry=item["geometry"],
                congestionLevel=_compute_congestion_level(delay_val),
                riskScore=_compute_risk_score(delay_val, weather_severity),
                peakHourFlag=peak_hour_flag,
                weatherImpactNote=weather_note,
            )
        )

    overall_confidence = _compute_overall_confidence(len(route_results), weather_severity)

    avg_risk = sum(r.riskScore or 0 for r in route_results) / len(route_results) if route_results else 0.0
    top_congestion = route_results[0].congestionLevel if route_results else None

    return PredictionResponse(
        routes=route_results,
        confidence=overall_confidence,
        congestionLevel=top_congestion,
        riskScore=round(avg_risk, 1),
        peakHourFlag=peak_hour_flag,
        weatherImpactNote=weather_note,
    )


@router.post("/report-incident", response_model=IncidentResponse)
async def report_incident(payload: IncidentRequest):
    """Accept an incident report from the frontend."""
    print(
        f"[INCIDENT] location={payload.location} type={payload.type} "
        f"severity={payload.severity} desc={payload.description!r}"
    )
    return IncidentResponse(
        status="ok",
        message=f"Incident at '{payload.location}' recorded successfully.",
    )
