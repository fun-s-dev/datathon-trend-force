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
# Overridable via env for different training environments
DEFAULT_DENSITY: float = float(os.getenv("DEFAULT_DENSITY", "50.0"))
DEFAULT_LANES: int = int(os.getenv("DEFAULT_LANES", "3"))
DEFAULT_SIGNALS: int = int(os.getenv("DEFAULT_SIGNALS", "5"))

# OSRM routing (overridable via env)
OSRM_BASE_URL: str = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")
OSRM_TIMEOUT_SEC: int = int(os.getenv("OSRM_TIMEOUT_SEC", "15"))

# Photon geocoding (overridable via env)
PHOTON_URL: str = os.getenv("PHOTON_URL", "https://photon.komoot.io/api/")
PHOTON_TIMEOUT_SEC: int = int(os.getenv("PHOTON_TIMEOUT_SEC", "10"))
