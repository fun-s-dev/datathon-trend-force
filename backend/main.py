"""
FastAPI entry point — Urban Traffic Congestion Prediction backend.
Inference-only: no database, no retraining.
"""

import sys
import os

# Ensure the backend package root is on sys.path so absolute imports work
# regardless of the working directory used to launch uvicorn.
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="Urban Traffic Congestion Predictor",
    description="Inference-only backend — predicts route delays using pre-trained ML models.",
    version="1.0.0",
)

# ── CORS — allow the Vite dev server and any localhost origin ────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routes ──────────────────────────────────────────────────────────
app.include_router(router)


@app.get("/health")
async def health():
    """Simple liveness probe."""
    return {"status": "ok"}
