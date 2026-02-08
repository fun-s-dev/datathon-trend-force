"""
Geocoding service — Photon (OpenStreetMap-based, komoot).
FREE, no API key required. Config from settings — no hard-coded URLs.
"""

from typing import Tuple
import requests
from fastapi import HTTPException

from config.settings import PHOTON_URL, PHOTON_TIMEOUT_SEC

_HEADERS = {
    "User-Agent": "Urban-Traffic-Congestion-Intelligence/1.0 (college-project)"
}

def geocode(place_name: str) -> Tuple[float, float]:
    """
    Convert a human-readable address string to (latitude, longitude)
    using the Photon geocoding API (komoot / OpenStreetMap).
    """
    params = {
        "q": place_name,
        "limit": 1,
    }

    try:
        resp = requests.get(
            PHOTON_URL.rstrip("/"),
            params=params,
            headers=_HEADERS,
            timeout=PHOTON_TIMEOUT_SEC,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Photon geocoding request failed: {exc}",
        )

    data = resp.json()
    features = data.get("features", [])

    if not features:
        raise HTTPException(
            status_code=400,
            detail=f"Could not geocode '{place_name}'. No results from Photon.",
        )

    # Photon returns GeoJSON: [lon, lat]
    lon, lat = features[0]["geometry"]["coordinates"]
    return float(lat), float(lon)
