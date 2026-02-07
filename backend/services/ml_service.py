"""
ML service — load pre-trained artefacts and run inference.
Nothing is retrained or re-fitted here.
"""

import os
from typing import List

import joblib
import numpy as np
import pandas as pd
from fastapi import HTTPException

from config.settings import TRAFFIC_MODEL_PATH, WEATHER_ENCODER_PATH


# ── Lazy singletons (loaded once, reused) ────────────────────────────────────

_traffic_model = None
_weather_encoder = None


def _load_traffic_model():
    """Load the traffic ranking model from disk (once)."""
    global _traffic_model
    if _traffic_model is not None:
        return _traffic_model
    if not os.path.isfile(TRAFFIC_MODEL_PATH):
        raise HTTPException(
            status_code=500,
            detail=f"Traffic model not found at {TRAFFIC_MODEL_PATH}",
        )
    try:
        _traffic_model = joblib.load(TRAFFIC_MODEL_PATH)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load traffic model: {exc}",
        )
    return _traffic_model


def _load_weather_encoder():
    """Load the weather encoder from disk (once)."""
    global _weather_encoder
    if _weather_encoder is not None:
        return _weather_encoder
    if not os.path.isfile(WEATHER_ENCODER_PATH):
        raise HTTPException(
            status_code=500,
            detail=f"Weather encoder not found at {WEATHER_ENCODER_PATH}",
        )
    try:
        _weather_encoder = joblib.load(WEATHER_ENCODER_PATH)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load weather encoder: {exc}",
        )
    return _weather_encoder


# ── Public API ───────────────────────────────────────────────────────────────

# Deterministic weather severity mapping — matches training-time encoding.
# Used as the primary encoder to guarantee no unseen-label crashes.
_WEATHER_DICT = {"Clear": 0, "Extreme": 1, "Fog": 2, "Rain": 3, "Snow": 4}


def encode_weather(weather: str) -> float:
    """
    Convert the weather string into a numeric severity value.

    Uses a deterministic mapping that matches the training-time label encoding.
    Falls back to the .pkl encoder only if the dict lookup fails and the
    encoder file is available (belt-and-suspenders approach).
    """
    # Primary: deterministic dictionary (safe, no unseen-label crash)
    if weather in _WEATHER_DICT:
        return float(_WEATHER_DICT[weather])

    # Fallback: try the pkl encoder for any unexpected value
    try:
        encoder = _load_weather_encoder()
        encoded = encoder.transform([weather])
        value = float(np.array(encoded).flat[0])
        return value
    except Exception:
        pass

    # Last resort — unknown weather → HTTP 400
    raise HTTPException(
        status_code=400,
        detail=f"Unknown weather value: '{weather}'. "
               f"Expected one of: {list(_WEATHER_DICT.keys())}",
    )


def predict_delay(features: pd.DataFrame) -> List[float]:
    """
    Run the traffic model on the feature DataFrame and return
    predicted delay_minutes for each route.
    """
    model = _load_traffic_model()
    
    # Ensure column order matches model expectations
    if hasattr(model, 'feature_names_in_'):
        features = features[model.feature_names_in_]
    
    try:
        preds = model.predict(features)
        # Ensure non-negative delays
        preds = np.maximum(preds, 0.0)
        return [round(float(p), 2) for p in preds]
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Model prediction failed: {exc}",
        )