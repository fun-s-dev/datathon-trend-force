# Urban Traffic Congestion Prediction System
## Complete Setup & Run Guide

---

## 🎯 System Overview

**Frontend**: React + TypeScript + Vite  
**Backend**: Python + FastAPI (port 8000)  
**Geocoding**: Nominatim (OpenStreetMap) — FREE, no API key  
**Routing**: OSRM (Open Source Routing Machine) — FREE, no API key  
**ML Models**: Pre-trained scikit-learn models (joblib)

---

## ⚙️ Prerequisites

- **Python 3.10+** installed
- **Node.js 16+** and npm installed
- Internet connection (for Nominatim & OSRM API calls)

---

## 📦 Step 1: Install Backend Dependencies

```powershell
# Navigate to backend directory
cd backend

# Install Python packages
pip install -r requirements.txt
```

**Packages installed:**
- fastapi, uvicorn (API server)
- scikit-learn, xgboost, joblib (ML)
- requests (HTTP calls)
- pydantic, python-dotenv (config)
- numpy (numerical operations)

---

## 🤖 Step 2: Generate ML Models

The system needs two `.pkl` files in `backend/models/`:
- `traffic_ranking_model.pkl` — predicts traffic delay
- `weather_encoder.pkl` — encodes weather strings to severity

Run the generation script:

```powershell
# Still in backend/ directory
python generate_models.py
```

**Expected output:**
```
[OK] Weather encoder saved → ...\models\weather_encoder.pkl
[OK] Traffic model saved  → ...\models\traffic_ranking_model.pkl

Done. You can now start the backend with:
  uvicorn main:app --reload
```

**⚠️ IMPORTANT**: Replace these with your real trained models for production.

---

## 🚀 Step 3: Start the Backend Server

```powershell
# Still in backend/ directory
uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test the backend:**
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs

**Keep this terminal running!**

---

## 🎨 Step 4: Start the Frontend Server

Open a **NEW terminal window**:

```powershell
# Navigate to frontend directory
cd C:\Users\Anjali Sinha\Desktop\datathon-trend-force\frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Frontend will open at:** http://localhost:5173

---

## ✅ Step 5: Test the System

1. **Open browser:** http://localhost:5173
2. **Fill the form:**
   - Source: `Mumbai Andheri`
   - Destination: `Mumbai Bandra`
   - Travel Day: `Monday`
   - Time of Travel: `6:00 PM`
   - Weather: `Clear`
3. **Click "Predict"**
4. **Expected result:**
   - 1-3 alternative routes displayed
   - Distance, base time, predicted delay shown
   - Risk label (High/Low)
   - Route 1 marked as "Recommended"
   - Confidence score displayed

---

## 🔍 Troubleshooting

### Backend Issues

**Error: "Module not found"**
```powershell
cd backend
pip install -r requirements.txt
```

**Error: "Traffic model not found"**
```powershell
cd backend
python generate_models.py
```

**Port 8000 already in use:**
```powershell
# Find and kill the process
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force

# Or use a different port
uvicorn main:app --reload --port 8001
# (Then update frontend api.js BASE_URL to http://localhost:8001)
```

### Frontend Issues

**Error: "npm: command not found"**
- Install Node.js from https://nodejs.org/

**Port 5173 already in use:**
- The Vite server will automatically try port 5174, 5175, etc.

**"API not configured" error:**
- Check `frontend/src/services/api.js`:
  ```javascript
  export const BASE_URL = "http://localhost:8000";
  export const PREDICTION_API = "/predict-route";
  ```

### API Call Failures

**"Could not geocode 'XYZ'"**
- Nominatim requires valid place names
- Try: "New York, USA" instead of just "NYC"
- Add more context to ambiguous locations

**"No routes found"**
- OSRM might not have coverage for remote areas
- Try major cities: Mumbai, Delhi, Bangalore, New York, London

**"Geocoding request failed"**
- Check internet connection
- Nominatim rate limit: max 1 request/second
- Wait a few seconds and retry

---

## 📊 API Contract

### POST /predict-route

**Request:**
```json
{
  "source": "Andheri East, Mumbai",
  "destination": "Bandra Kurla Complex, Mumbai",
  "travel_day": "monday",
  "travel_time": "18:00",
  "weather": "Rain"
}
```

**Response:**
```json
{
  "routes": [
    {
      "rank": 1,
      "route": "Western Express Highway",
      "name": "Western Express Highway",
      "distance": 8.5,
      "distance_km": 8.5,
      "duration_min": 22.5,
      "baseTime": 22.5,
      "predicted_time": 35.7,
      "predicted_delay": 13.2,
      "predictedDelay": 13.2,
      "risk": "Low",
      "isRecommended": true,
      "confidence": 0.92,
      "geometry": [[19.1136, 72.8697], ...]
    }
  ],
  "confidence": "High"
}
```

---

## 🛠️ Development Workflow

### Modify Backend Logic

1. Edit files in `backend/services/` or `backend/api/`
2. FastAPI auto-reloads (if `--reload` flag is used)
3. Test at http://localhost:8000/docs

### Modify Frontend UI

1. Edit files in `frontend/src/`
2. Vite auto-reloads in browser
3. Changes reflect immediately

### Update ML Models

1. Train your models elsewhere
2. Save as `.pkl` using joblib:
   ```python
   import joblib
   joblib.dump(model, "traffic_ranking_model.pkl")
   joblib.dump(encoder, "weather_encoder.pkl")
   ```
3. Copy to `backend/models/`
4. Restart backend server

---

## 🎯 Quick Start (All Commands)

```powershell
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python generate_models.py
uvicorn main:app --reload

# Terminal 2 - Frontend (new window)
cd frontend
npm install
npm run dev

# Browser
# Go to http://localhost:5173
```

---

## 📝 Notes

- **No API keys required** — fully open-source stack
- **Models are synthetic** — replace `generate_models.py` output with real trained models
- **CORS enabled** — backend accepts requests from any origin (tighten in production)
- **Rate limits**: Nominatim has usage policies (1 req/sec). For production, self-host or use commercial alternatives.

---

## 🔒 Production Checklist

Before deploying:

- [ ] Replace synthetic models with production-trained models
- [ ] Tighten CORS to specific frontend domain
- [ ] Add authentication/API keys
- [ ] Set up proper logging
- [ ] Use environment-specific configs
- [ ] Self-host Nominatim + OSRM for reliability
- [ ] Add caching layer (Redis)
- [ ] Implement rate limiting
- [ ] Add monitoring (health checks, metrics)
- [ ] Use HTTPS for both frontend & backend

---

**System Ready! 🚀**
