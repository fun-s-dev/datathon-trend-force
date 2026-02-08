import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { reportIncident, BASE_URL, INCIDENT_API } from "../services/api";

const INCIDENT_TYPES = ["Accident", "Road Work", "Event", "Weather", "Other"];
const SEVERITY_OPTIONS = ["Low", "Medium", "High"];

type SubmitState = "idle" | "loading" | "success" | "error";

const formVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 18, staggerChildren: 0.06 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

export function IncidentReport() {
  const [location, setLocation] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  const isApiConfigured = Boolean(BASE_URL && INCIDENT_API);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApiConfigured) {
      setState("error");
      setError("API not configured. Set BASE_URL and INCIDENT_API in services/api.js");
      return;
    }

    setState("loading");
    setError(null);

    try {
      await reportIncident({
        location,
        type: incidentType,
        severity,
        description,
      });
      setState("success");
      setLocation("");
      setIncidentType("");
      setSeverity("");
      setDescription("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Report failed");
    }
  };

  return (
    <div className="page incident-report">
      <motion.section
        className="card incident-form-section"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={fieldVariants}>Report Incident</motion.h2>
        <form onSubmit={handleSubmit} className="incident-form">
          <motion.div className="form-group" variants={fieldVariants}>
            <label>Location</label>
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={state === "loading"}
              required
            />
          </motion.div>
          <motion.div className="form-group" variants={fieldVariants}>
            <label>Incident type</label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              disabled={state === "loading"}
              required
            >
              <option value="">Select type</option>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </motion.div>
          <motion.div className="form-group" variants={fieldVariants}>
            <label>Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              disabled={state === "loading"}
              required
            >
              <option value="">Select severity</option>
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </motion.div>
          <motion.div className="form-group" variants={fieldVariants}>
            <label>Description (optional)</label>
            <textarea
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={state === "loading"}
              rows={3}
            />
          </motion.div>

          <AnimatePresence>
            {state === "success" && (
              <motion.p
                className="form-success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              >
                Incident reported successfully. Backend will update predictions.
              </motion.p>
            )}
            {state === "error" && error && (
              <motion.p
                className="form-error"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="submit-btn"
            disabled={state === "loading"}
            variants={fieldVariants}
            whileHover={state !== "loading" ? { scale: 1.04, boxShadow: "0 0 24px rgba(59,130,246,0.35)" } : {}}
            whileTap={state !== "loading" ? { scale: 0.96 } : {}}
          >
            {state === "loading" ? "Submitting…" : "Submit"}
          </motion.button>
        </form>
      </motion.section>

      <motion.nav
        className="page-nav"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link to="/" className="nav-link">← Back to Dashboard</Link>
      </motion.nav>
    </div>
  );
}
