import { useState } from "react";
import { Link } from "react-router-dom";
import { reportIncident, BASE_URL, INCIDENT_API } from "../services/api";

const INCIDENT_TYPES = ["Accident", "Road Work", "Event", "Weather", "Other"];
const SEVERITY_OPTIONS = ["Low", "Medium", "High"];

type SubmitState = "idle" | "loading" | "success" | "error";

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
      <section className="card incident-form-section">
        <h2>Report Incident</h2>
        <form onSubmit={handleSubmit} className="incident-form">
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={state === "loading"}
              required
            />
          </div>
          <div className="form-group">
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
          </div>
          <div className="form-group">
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
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={state === "loading"}
              rows={3}
            />
          </div>

          {state === "success" && (
            <p className="form-success">Incident reported successfully. Backend will update predictions.</p>
          )}
          {state === "error" && error && (
            <p className="form-error">{error}</p>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={state === "loading"}
          >
            {state === "loading" ? "Submitting…" : "Submit"}
          </button>
        </form>
      </section>

      <nav className="page-nav">
        <Link to="/" className="nav-link">← Back to Dashboard</Link>
      </nav>
    </div>
  );
}
