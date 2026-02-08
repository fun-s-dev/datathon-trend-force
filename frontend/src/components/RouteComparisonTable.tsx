import { UI_LABELS, TABLE_COLUMNS } from "../config/constants";
import { StatusBadge } from "./StatusBadge";
import { toStatusVariant } from "../config/constants";

export interface RouteRow {
  rank?: number;
  name?: string;
  route?: string;
  distance_km?: number;
  distance?: number;
  base_time_min?: number;
  baseTime?: number;
  duration_min?: number;
  predicted_delay_min?: number;
  predictedDelay?: number;
  predicted_time_min?: number;
  predicted_time?: number;
  risk?: string;
  congestionLevel?: string;
  riskScore?: number;
  [key: string]: unknown;
}

interface RouteComparisonTableProps {
  routes: RouteRow[];
}

function getRouteValue(route: RouteRow, key: string): string | number | null {
  const val = route[key];
  if (val === undefined || val === null) return null;
  if (key === "predicted_delay_min" && route.predictedDelay != null)
    return route.predictedDelay as number;
  if (key === "predicted_time_min" && route.predicted_time != null)
    return route.predicted_time as number;
  if (key === "base_time_min" && (route.baseTime != null || route.duration_min != null)) {
    const b = route.baseTime ?? route.duration_min;
    return typeof b === "number" ? b : null;
  }
  if (key === "distance_km" && route.distance != null)
    return typeof route.distance === "number" ? route.distance : null;
  if (key === "name" && route.route != null) return String(route.route);
  return typeof val === "string" || typeof val === "number" ? val : null;
}

function formatValue(val: string | number | null, key: string): string {
  if (val == null) return "—";
  if (key === "distance_km" || key === "distance") return `${val} km`;
  if (key === "base_time_min" || key === "predicted_delay_min" || key === "predicted_time_min")
    return `${val} mins`;
  if (key === "risk" || key === "congestionLevel") return String(val);
  return String(val);
}

export function RouteComparisonTable({ routes }: RouteComparisonTableProps) {
  if (!routes.length) return null;

  return (
    <div className="comparison-table card">
      <h3>{UI_LABELS.COMPARISON_TABLE}</h3>
      <div className="table-scroll">
        <table className="route-table">
          <thead>
            <tr>
              {TABLE_COLUMNS.map((col) => (
                <th key={col.key}>{UI_LABELS[col.labelKey] ?? col.labelKey}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map((route, i) => (
              <tr key={route.rank ?? i}>
                {TABLE_COLUMNS.map((col) => {
                  const val = getRouteValue(route, col.key);
                  if (col.key === "risk" && val != null) {
                    return (
                      <td key={col.key}>
                        <StatusBadge level={String(val)} />
                      </td>
                    );
                  }
                  if (col.key === "congestionLevel" && val != null) {
                    return (
                      <td key={col.key}>
                        <span className={`status-badge status-${toStatusVariant(String(val))}`}>
                          {val}
                        </span>
                      </td>
                    );
                  }
                  return <td key={col.key}>{formatValue(val, col.key)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
