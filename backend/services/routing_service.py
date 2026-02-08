"""
Routing service — OSRM (Open Source Routing Machine).
FREE public endpoint, no API key required.
Config from settings — no hard-coded URLs or timeouts.
"""

from typing import Any, Dict, List

import requests
from fastapi import HTTPException

from config.settings import OSRM_BASE_URL, OSRM_TIMEOUT_SEC
from config.constants import ROUTE_NAME_FALLBACK_PREFIX


def fetch_routes(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    max_routes: int = 3,
) -> List[Dict[str, Any]]:
    """
    Query the OSRM public routing API for alternative driving routes.

    Returns a list of dicts (up to *max_routes*), each containing:
        route_name       — summary string
        distance_km      — total distance in kilometres
        base_duration_min — total duration in minutes
        geometry         — list of [lat, lng] coordinate pairs

    Raises:
        HTTPException 400 — no routes found
        HTTPException 502 — OSRM service failure
    """

    base = OSRM_BASE_URL.rstrip("/")
    url = (
        f"{base}/route/v1/driving/"
        f"{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
    )
    params = {
        "alternatives": "true",
        "overview": "full",
        "geometries": "geojson",
    }

    try:
        resp = requests.get(url, params=params, timeout=OSRM_TIMEOUT_SEC)
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"OSRM routing request failed: {exc}",
        )

    data = resp.json()
    if data.get("code") != "Ok" or not data.get("routes"):
        raise HTTPException(
            status_code=400,
            detail=(
                f"No routes found between "
                f"({origin_lat},{origin_lon}) and ({dest_lat},{dest_lon}). "
                f"OSRM code: {data.get('code')}"
            ),
        )

    raw_routes = data["routes"][:max_routes]
    routes: List[Dict[str, Any]] = []

    for idx, route in enumerate(raw_routes):
        distance_m: float = route["distance"]           # metres
        duration_s: float = route["duration"]            # seconds
        # GeoJSON coordinates arrive as [[lon, lat], ...] → flip to [[lat, lon]]
        coords = route["geometry"]["coordinates"]
        geometry = [[pt[1], pt[0]] for pt in coords]

        legs = route.get("legs", [])
        summary = legs[0].get("summary", "") if legs else ""
        route_name = summary if summary else f"{ROUTE_NAME_FALLBACK_PREFIX}{idx + 1}"

        routes.append({
            "route_name": route_name,
            "distance_km": round(distance_m / 1000, 2),
            "base_duration_min": round(duration_s / 60, 2),
            "geometry": geometry,
        })

    return routes
