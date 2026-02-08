import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPrediction } from "../services/api";
import { LoaderSkeleton } from "../components/LoaderSkeleton";
import { ErrorState } from "../components/ErrorState";
import { NavigationDashboard } from "./NavigationDashboard";
import { CityPlannerDashboard } from "./CityPlannerDashboard";
import { TrafficOperatorDashboard } from "./TrafficOperatorDashboard";
import { DASHBOARD_CONFIG, UI_LABELS } from "../config/constants";
import { BASE_URL, PREDICTION_API } from "../services/api";

type ViewState = "idle" | "loading" | "success" | "empty" | "error";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;


export function Dashboard() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [prediction, setPrediction] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [travelDay, setTravelDay] = useState("");
  const [travelHour, setTravelHour] = useState("");
  const [travelPeriod, setTravelPeriod] = useState("");
  const [weather, setWeather] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeView, setActiveView] = useState<(typeof DASHBOARD_CONFIG.ENABLED_VIEWS)[number]>(
    DASHBOARD_CONFIG.DEFAULT_VIEW
  );

  const isApiConfigured = Boolean(BASE_URL && PREDICTION_API);

  const handleSubmit = async () => {
    if (!isApiConfigured) {
      setState("error");
      setError(UI_LABELS.API_NOT_CONFIGURED);
      return;
    }

    setState("loading");
    setError(null);
    setPrediction(null);

    try {
      let hour24 = parseInt(travelHour, 10) || 0;
      if (travelPeriod === "pm" && hour24 !== 12) hour24 += 12;
      if (travelPeriod === "am" && hour24 === 12) hour24 = 0;
      const travelTime = `${String(hour24).padStart(2, "0")}:00`;

      const options = urgencyLevel ? { urgency_level: urgencyLevel } : undefined;
      const data = await fetchPrediction(source, destination, travelDay, travelTime, weather, options);
      setPrediction(data);

      const routes = Array.isArray(data?.routes) ? data.routes : [];
      const hasMetrics =
        data?.congestionLevel ?? data?.riskScore ?? data?.weatherImpactNote;
      if (routes.length === 0 && !hasMetrics) {
        setState("empty");
      } else {
        setState("success");
      }
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : UI_LABELS.PREDICTION_FAILED);
    }
  };

  const routes: Record<string, unknown>[] =
    prediction?.routes && Array.isArray(prediction.routes) ? prediction.routes : [];
  const congestionLevel = prediction?.congestionLevel as string | undefined;
  const riskScore = prediction?.riskScore as number | undefined;
  const peakHourFlag = prediction?.peakHourFlag as boolean | undefined;
  const weatherImpactNote = prediction?.weatherImpactNote as string | undefined;

  return (
    <div className="page dashboard">
      <section className="section-input card input-section-scrollable">
        <h2>Route Prediction</h2>
        <div className="input-grid">
          <div className="input-group">
            <label>{UI_LABELS.SOURCE}</label>
            <input
              type="text"
              placeholder={UI_LABELS.PLACEHOLDER_SOURCE}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={state === "loading"}
            />
          </div>
          <div className="input-group">
            <label>{UI_LABELS.DESTINATION}</label>
            <input
              type="text"
              placeholder={UI_LABELS.PLACEHOLDER_DESTINATION}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={state === "loading"}
            />
          </div>
          <div className="input-row-inline">
            <div className="time-selector">
              <label>{UI_LABELS.TRAVEL_DAY}</label>
              <select
                value={travelDay}
                onChange={(e) => setTravelDay(e.target.value)}
                disabled={state === "loading"}
              >
                <option value="">{UI_LABELS.PLACEHOLDER_DAY}</option>
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="time-selector">
              <label>{UI_LABELS.TRAVEL_TIME}</label>
              <div className="time-row">
                <select
                  value={travelHour}
                  onChange={(e) => setTravelHour(e.target.value)}
                  disabled={state === "loading"}
                >
                  <option value="">{UI_LABELS.PLACEHOLDER_HOUR}</option>
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
                  <option value="">{UI_LABELS.PLACEHOLDER_AMPM}</option>
                  <option value="am">AM</option>
                  <option value="pm">PM</option>
                </select>
              </div>
            </div>
            <div className="time-selector">
              <label>{UI_LABELS.WEATHER}</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                disabled={state === "loading"}
              >
                <option value="">{UI_LABELS.PLACEHOLDER_WEATHER}</option>
                <option value="Clear">Clear</option>
                <option value="Fog">Fog</option>
                <option value="Rain">Rain</option>
                <option value="Snow">Snow</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
          </div>

          <div className="advanced-toggle">
            <button
              type="button"
              className="advanced-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "−" : "+"} {UI_LABELS.ADVANCED_OPTIONS}
            </button>
          </div>
          {showAdvanced && (
            <div className="advanced-section">
              <div className="input-group">
                <label>{UI_LABELS.URGENCY_LEVEL}</label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                  disabled={state === "loading"}
                >
                  <option value="">{UI_LABELS.PLACEHOLDER_URGENCY_DEFAULT}</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          )}
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
            <p className="idle-message">{UI_LABELS.IDLE_MESSAGE}</p>
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
            <p className="empty-message">{UI_LABELS.EMPTY_MESSAGE}</p>
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
            <div className="dashboard-selector">
              {DASHBOARD_CONFIG.ENABLED_VIEWS.map((view) => (
                <button
                  key={view}
                  type="button"
                  className={`dashboard-tab ${activeView === view ? "active" : ""}`}
                  onClick={() => setActiveView(view)}
                >
                  {DASHBOARD_CONFIG.VIEW_LABELS[view] ?? view}
                </button>
              ))}
            </div>

            {activeView === "navigation" && (
              <NavigationDashboard
                routes={routes}
                prediction={prediction ?? {}}
                congestionLevel={congestionLevel}
                riskScore={riskScore}
                peakHourFlag={peakHourFlag}
                weatherImpactNote={weatherImpactNote}
              />
            )}
            {activeView === "planner" && (
              <CityPlannerDashboard
                routes={routes}
                prediction={prediction ?? {}}
                congestionLevel={congestionLevel}
                riskScore={riskScore}
                peakHourFlag={peakHourFlag}
                weatherImpactNote={weatherImpactNote}
                travelDay={travelDay}
              />
            )}
            {activeView === "operator" && (
              <TrafficOperatorDashboard
                routes={routes}
                prediction={prediction ?? {}}
                congestionLevel={congestionLevel}
                riskScore={riskScore}
                peakHourFlag={peakHourFlag}
                weatherImpactNote={weatherImpactNote}
                travelDay={travelDay}
              />
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <nav className="page-nav">
        <Link to="/report-incident" className="nav-link">
          Report Incident
        </Link>
      </nav>
    </div>
  );
}
