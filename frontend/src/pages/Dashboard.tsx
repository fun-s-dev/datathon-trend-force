import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPrediction, BASE_URL, PREDICTION_API } from "../services/api";
import { RouteCard } from "../components/RouteCard";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { LoaderSkeleton } from "../components/LoaderSkeleton";
import { ErrorState } from "../components/ErrorState";


type ViewState = "idle" | "loading" | "success" | "empty" | "error";

export function Dashboard() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [prediction, setPrediction] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [travelDay, setTravelDay] = useState("");
  const [travelHour, setTravelHour] = useState("");
  const [travelPeriod, setTravelPeriod] = useState("");



  const isApiConfigured = Boolean(BASE_URL && PREDICTION_API);

  const handleSubmit = async () => {
    if (!isApiConfigured) {
      setState("error");
      setError("API not configured. Set BASE_URL and PREDICTION_API in services/api.js");
      return;
    }

    setState("loading");
    setError(null);
    setPrediction(null);

    try {
      const data = await fetchPrediction(source, destination, travelDay);
      setPrediction(data);

      const routes = Array.isArray(data?.routes) ? data.routes : [];
      const hasMetrics = data?.congestionLevel ?? data?.riskScore ?? data?.confidence;
      if (routes.length === 0 && !hasMetrics) {
        setState("empty");
      } else {
        setState("success");
      }
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Prediction failed");
    }
  };

  const routes: Record<string, unknown>[] =
    prediction?.routes && Array.isArray(prediction.routes) ? prediction.routes : [];
  const congestionLevel = prediction?.congestionLevel as string | undefined;
  const riskScore = prediction?.riskScore as number | undefined;
  const confidence = prediction?.confidence as string | number | undefined;

  return (
    <div className="page dashboard">
      <section className="section-input card">
        <h2>Route Prediction</h2>
        <div className="input-row">
          <div className="input-group">
            <label>Source location</label>
            <input
              type="text"
              placeholder="Enter source location"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={state === "loading"}
            />
          </div>
          <div className="input-group">
            <label>Destination location</label>
            <input
              type="text"
              placeholder="Enter destination location"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={state === "loading"}
            />
          </div>
        </div>
        <div className="time-selector">
          <label>Travel Day</label>

          <select
            value={travelDay}
            onChange={(e) => setTravelDay(e.target.value)}
            disabled={state === "loading"}
          >
            <option value="">Select a day</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>
        <div className="time-selector">
  <label>Time of Travel</label>

  <div style={{ display: "flex", gap: "0.75rem" }}>
    <select
      value={travelHour}
      onChange={(e) => setTravelHour(e.target.value)}
      disabled={state === "loading"}
    >
      <option value="">Hour</option>
      {[...Array(12)].map((_, i) => (
        <option key={i + 1} value={i + 1}>
          {i + 1}
        </option>
      ))}
    </select>

    <select
      value={travelPeriod}
      onChange={(e) => setTravelPeriod(e.target.value)}
      disabled={state === "loading"}
    >
      <option value="">AM/PM</option>
      <option value="am">AM</option>
      <option value="pm">PM</option>
    </select>
  </div>
</div>


        <button
          type="button"
          className="predict-btn"
          onClick={handleSubmit}
          disabled={state === "loading"}
        >
          {state === "loading" ? "Predicting…" : "Predict"}
        </button>
      </section>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.section
            key="idle"
            className="section-idle card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="idle-message">Enter route details and click Predict</p>
          </motion.section>
        )}

        {state === "loading" && (
          <motion.section
            key="loading"
            className="section-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoaderSkeleton />
          </motion.section>
        )}

        {state === "empty" && (
          <motion.section
            key="empty"
            className="section-empty card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="empty-message">Model not trained yet</p>
          </motion.section>
        )}

        {state === "error" && (
          <motion.section
            key="error"
            className="section-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ErrorState message={error ?? undefined} onRetry={handleSubmit} />
          </motion.section>
        )}

        {state === "success" && (
          <motion.section
            key="success"
            className="section-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {routes.length > 0 && (
              <div className="routes-section">
                <h3>Routes</h3>
                <div className="route-cards">
                  {routes.map((route: Record<string, unknown>, i: number) => (
                    <RouteCard key={String(route?.id ?? i)} route={route} />
                  ))}
                </div>
              </div>
            )}

            <div className="metrics-grid">
              {congestionLevel && (
                <div className="card metric-card-inline">
                  <span className="metric-label">Congestion level</span>
                  <StatusBadge level={congestionLevel} />
                </div>
              )}
              <MetricCard label="Risk score" value={riskScore != null ? `${riskScore}%` : undefined} />
              <MetricCard label="Confidence" value={confidence != null ? String(confidence) : undefined} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <nav className="page-nav">
        <Link to="/report-incident" className="nav-link">Report Incident</Link>
      </nav>
    </div>
  );
}
