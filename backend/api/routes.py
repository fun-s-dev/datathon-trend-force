"""
API route handlers for the traffic prediction endpoint.
Uses Photon (geocoding) + OSRM (routing) — fully free, no API keys.
"""

from fastapi import APIRouter, HTTPException
from api.schemas import PredictionRequest, PredictionResponse, RouteResult
from services.geocoding_service import geocode
from services.routing_service import fetch_routes
from services.feature_engineering import build_features
from services.ml_service import encode_weather, predict_delay

router = APIRouter()


# ── Risk & confidence thresholds ─────────────────────────────────────────────
_HIGH_WEATHER_THRESHOLD: float = 3.0   # Rain (3), Snow (4), Extreme (5) → High
_HIGH_DELAY_THRESHOLD: float = 15.0    # minutes


def _compute_risk(predicted_delay: float, weather_severity: float) -> str:
    """Assign 'High' or 'Low' risk based on delay and weather severity."""
    if predicted_delay >= _HIGH_DELAY_THRESHOLD or weather_severity >= _HIGH_WEATHER_THRESHOLD:
        return "High"
    return "Low"


def _compute_overall_confidence(num_routes: int, weather_severity: float) -> str:
    """
    Heuristic overall confidence label.
    Multiple routes + calm weather  → High
    Fewer routes or moderate weather → Medium
    Single route or extreme weather  → Low
    """
    if num_routes >= 3 and weather_severity <= 1:
        return "High"
    if num_routes >= 2 and weather_severity <= 3:
        return "Medium"
    return "Low"


def _normalise_confidence(delays: list[float]) -> list[float]:
    """
    Produce a per-route confidence score (0-1).
    Lower predicted delay → higher confidence.
    """
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
        6. Rank routes, assign risk labels, return top 3
    """

    # ── 1. Geocode addresses ─────────────────────────────────────────────
    src_lat, src_lon = geocode(payload.source)
    dst_lat, dst_lon = geocode(payload.destination)

    # ── 2. Fetch alternative routes from OSRM ────────────────────────────
    routes_raw = fetch_routes(src_lat, src_lon, dst_lat, dst_lon, max_routes=3)
    if not routes_raw:
        raise HTTPException(status_code=400, detail="No routes found")

    # ── 3. Encode weather ────────────────────────────────────────────────
    weather_severity = encode_weather(payload.weather)

    # ── 4. Build feature matrix ──────────────────────────────────────────
    features = build_features(
        routes=routes_raw,
        travel_time=payload.travel_time,
        travel_day=payload.travel_day,
        weather_severity=weather_severity,
    )

    # ── 5. Predict delay for each route ──────────────────────────────────
    delays = predict_delay(features)

    # ── 6. Combine, rank, build response ─────────────────────────────────
    combined = []
    for route_info, delay in zip(routes_raw, delays):
        base = route_info["base_duration_min"]
        final_time = round(base + delay, 2)
        combined.append({
            "route_name": route_info["route_name"],
            "distance_km": route_info["distance_km"],
            "base_duration_min": base,
            "predicted_delay": delay,
            "final_time": final_time,
            "risk": _compute_risk(delay, weather_severity),
            "geometry": route_info["geometry"],
        })

    # Sort ascending by final_time (best route first)
    combined.sort(key=lambda r: r["final_time"])

    # Per-route normalised confidence scores
    sorted_delays = [r["predicted_delay"] for r in combined]
    conf_scores = _normalise_confidence(sorted_delays)

    route_results: list[RouteResult] = []
    for rank, (item, conf) in enumerate(zip(combined, conf_scores), start=1):
        route_results.append(
            RouteResult(
                rank=rank,
                route=item["route_name"],
                name=item["route_name"],
                distance=item["distance_km"],
                distance_km=item["distance_km"],
                duration_min=item["base_duration_min"],
                baseTime=item["base_duration_min"],
                predicted_time=item["final_time"],
                predicted_delay=item["predicted_delay"],
                predictedDelay=item["predicted_delay"],
                risk=item["risk"],
                isRecommended=(rank == 1),
                confidence=conf,
                geometry=item["geometry"],
            )
        )

    overall_confidence = _compute_overall_confidence(
        len(route_results), weather_severity,
    )

    return PredictionResponse(routes=route_results, confidence=overall_confidence)
