"""
Application settings — loaded from .env via python-dotenv.
Never hard-code secrets here.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env at the backend root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# No API keys required — Photon + OSRM are free services

# Paths to pre-trained artefacts (relative to backend/)
MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
TRAFFIC_MODEL_PATH: str = os.path.join(MODEL_DIR, "traffic_ranking_model.pkl")
WEATHER_ENCODER_PATH: str = os.path.join(MODEL_DIR, "weather_encoder.pkl")

# Default constants used during training (must match training-time values)
DEFAULT_DENSITY: float = 50.0
DEFAULT_LANES: int = 3
DEFAULT_SIGNALS: int = 5
