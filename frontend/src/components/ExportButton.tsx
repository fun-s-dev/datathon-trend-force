import { useState } from "react";
import { UI_LABELS, EXPORT_CONFIG } from "../config/constants";

interface ExportButtonProps {
  data: Record<string, unknown>;
}

function toCSV(data: Record<string, unknown>): string {
  const routes = Array.isArray(data.routes) ? data.routes : [];
  if (routes.length === 0) return JSON.stringify(data, null, 2);

  const headers = ["rank", "name", "distance_km", "base_time_min", "predicted_delay_min", "predicted_time_min", "risk", "congestionLevel"];
  const rows = routes.map((r: Record<string, unknown>) =>
    headers.map((h) => {
      const v = r[h] ?? r[h.replace(/_/g, "")];
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function ExportButton({ data }: ExportButtonProps) {
  const [format, setFormat] = useState<"json" | "csv">("json");

  if (!EXPORT_CONFIG.ENABLED) return null;

  const handleExport = () => {
    const content =
      format === "json"
        ? JSON.stringify(data, null, 2)
        : toCSV(data);
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prediction-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-controls">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as "json" | "csv")}
        className="export-select"
      >
        <option value="json">{UI_LABELS.EXPORT_JSON}</option>
        <option value="csv">{UI_LABELS.EXPORT_CSV}</option>
      </select>
      <button type="button" className="export-btn predict-btn" onClick={handleExport}>
        {UI_LABELS.EXPORT}
      </button>
    </div>
  );
}
