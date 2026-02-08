import { useState } from "react";
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

/* ─── animation variants ─── */
const formVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20, staggerChildren: 0.06 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

const resultVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 70, damping: 20, delay: 0.05 },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const idleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 80, damping: 18 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

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
      {/* ─── INPUT FORM ─── */}
      <motion.section
        className="section-input card input-section-scrollable"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        layout
      >
        <motion.h2 variants={fieldVariants}>Route Prediction</motion.h2>
        <motion.div className="input-grid" variants={formVariants}>
          <motion.div className="input-group" variants={fieldVariants}>
            <label>{UI_LABELS.SOURCE}</label>
            <input
              type="text"
              placeholder={UI_LABELS.PLACEHOLDER_SOURCE}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={state === "loading"}
            />
          </motion.div>
          <motion.div className="input-group" variants={fieldVariants}>
            <label>{UI_LABELS.DESTINATION}</label>
            <input
              type="text"
              placeholder={UI_LABELS.PLACEHOLDER_DESTINATION}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={state === "loading"}
            />
          </motion.div>
          <motion.div className="input-row-inline" variants={fieldVariants}>
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
          </motion.div>

          <motion.div className="advanced-toggle" variants={fieldVariants}>
            <button
              type="button"
              className="advanced-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "−" : "+"} {UI_LABELS.ADVANCED_OPTIONS}
            </button>
          </motion.div>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                className="advanced-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          type="button"
          className="predict-btn"
          onClick={handleSubmit}
          disabled={state === "loading"}
          variants={fieldVariants}
          whileHover={state !== "loading" ? { scale: 1.05, boxShadow: "0 0 28px rgba(59,130,246,0.4)" } : {}}
          whileTap={state !== "loading" ? { scale: 0.95 } : {}}
        >
          {state === "loading" ? "Predicting…" : "Predict"}
        </motion.button>
      </motion.section>

      {/* ─── STATE SECTIONS ─── */}
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.section
            key="idle"
            className="section-idle card"
            variants={idleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="idle-placeholder">
              <div className="idle-signal">
                <div className="idle-signal-dot" />
                <div className="idle-signal-dot" />
                <div className="idle-signal-dot" />
              </div>
              <motion.p
                className="idle-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {UI_LABELS.IDLE_MESSAGE}
              </motion.p>
            </div>
          </motion.section>
        )}

        {state === "loading" && (
          <motion.section
            key="loading"
            className="section-loading"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
          >
            <LoaderSkeleton />
          </motion.section>
        )}

        {state === "empty" && (
          <motion.section
            key="empty"
            className="section-empty card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
          >
            <p className="empty-message">{UI_LABELS.EMPTY_MESSAGE}</p>
          </motion.section>
        )}

        {state === "error" && (
          <motion.section
            key="error"
            className="section-error"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <ErrorState message={error ?? undefined} onRetry={handleSubmit} />
          </motion.section>
        )}

        {state === "success" && (
          <motion.section
            key="success"
            className="section-results"
            variants={resultVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <motion.div
              className="dashboard-selector"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              {DASHBOARD_CONFIG.ENABLED_VIEWS.map((view) => (
                <motion.button
                  key={view}
                  type="button"
                  className={`dashboard-tab ${activeView === view ? "active" : ""}`}
                  onClick={() => setActiveView(view)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  layout
                >
                  {DASHBOARD_CONFIG.VIEW_LABELS[view] ?? view}
                </motion.button>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {activeView === "navigation" && (
                <motion.div
                  key="nav"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                >
                  <NavigationDashboard
                    routes={routes}
                    prediction={prediction ?? {}}
                    congestionLevel={congestionLevel}
                    riskScore={riskScore}
                    peakHourFlag={peakHourFlag}
                    weatherImpactNote={weatherImpactNote}
                  />
                </motion.div>
              )}
              {activeView === "planner" && (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                >
                  <CityPlannerDashboard
                    routes={routes}
                    prediction={prediction ?? {}}
                    congestionLevel={congestionLevel}
                    riskScore={riskScore}
                    peakHourFlag={peakHourFlag}
                    weatherImpactNote={weatherImpactNote}
                    travelDay={travelDay}
                  />
                </motion.div>
              )}
              {activeView === "operator" && (
                <motion.div
                  key="operator"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                >
                  <TrafficOperatorDashboard
                    routes={routes}
                    prediction={prediction ?? {}}
                    congestionLevel={congestionLevel}
                    riskScore={riskScore}
                    peakHourFlag={peakHourFlag}
                    weatherImpactNote={weatherImpactNote}
                    travelDay={travelDay}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
