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

from config.constants import WEATHER_SEVERITY_MAP


def encode_weather(weather: str) -> float:
    """
    Convert the weather string into a numeric severity value.

    Uses WEATHER_SEVERITY_MAP from config; falls back to .pkl encoder
    for unexpected values if available.
    """
    if weather in WEATHER_SEVERITY_MAP:
        return float(WEATHER_SEVERITY_MAP[weather])

    try:
        encoder = _load_weather_encoder()
        encoded = encoder.transform([weather])
        value = float(np.array(encoded).flat[0])
        return value
    except Exception:
        pass

    raise HTTPException(
        status_code=400,
        detail=f"Unknown weather value: '{weather}'. "
               f"Expected one of: {list(WEATHER_SEVERITY_MAP.keys())}",
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