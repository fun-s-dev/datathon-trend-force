import { interpolateTemplate } from "../config/constants";
import { SUMMARY_TEMPLATES, CONGESTION_ORDER } from "../config/constants";

export interface RouteInput {
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
  isRecommended?: boolean;
  [key: string]: unknown;
}

export interface DerivedRouteAnalytics {
  rank: number;
  route_id: string;
  name: string;
  distance_km: number;
  base_time_min: number;
  predicted_delay_min: number;
  predicted_time_min: number;
  risk: string;
  congestionLevel: string;
  riskScore: number;
  delay_percentage: number;
  time_saved_vs_best_route: number;
  efficiency_km_per_min: number;
  relative_risk_rank: number;
  relative_congestion_rank: number;
}

export interface RunLevelAnalytics {
  total_routes: number;
  fastest_route_id: string;
  fastest_route_name: string;
  safest_route_id: string;
  safest_route_name: string;
  average_delay: number;
  delay_variance: number;
  risk_spread_across_routes: number;
  congestion_consistency_indicator: string;
}

export interface HumanReadableSummaries {
  why_recommended: string;
  time_saved_vs_alternatives: string;
  congestion_consistency: string;
}

export interface FlattenedComparisonRow {
  [key: string]: string | number;
}

export interface PlannerSummary {
  run: RunLevelAnalytics;
  routes: DerivedRouteAnalytics[];
  summaries: HumanReadableSummaries;
  flattened_table: FlattenedComparisonRow[];
}

export interface NavigationSummary {
  recommended_route: DerivedRouteAnalytics | null;
  time_saved_message: string;
  alternatives_count: number;
}

function getNum(r: RouteInput, key: string): number {
  const v = r[key] ?? r[key.replace(/_/g, "").replace(/min/g, "Min")];
  return typeof v === "number" ? v : 0;
}

function getStr(r: RouteInput, key: string): string {
  const v = r[key];
  return v != null ? String(v) : "";
}

export function deriveRouteAnalytics(routes: RouteInput[]): DerivedRouteAnalytics[] {
  if (!routes.length) return [];

  const bestTime = Math.min(
    ...routes.map((r) =>
      getNum(r, "predicted_time_min") || getNum(r, "predicted_time") || 0
    )
  );
  const riskRanked = [...routes]
    .sort((a, b) => (getNum(a, "riskScore") ?? 0) - (getNum(b, "riskScore") ?? 0))
    .map((r, i) => ({ route: r, rank: i + 1 }));
  const congestionRanked = [...routes].sort(
    (a, b) =>
      CONGESTION_ORDER.indexOf(getStr(a, "congestionLevel").toLowerCase()) -
      CONGESTION_ORDER.indexOf(getStr(b, "congestionLevel").toLowerCase())
  );

  return routes.map((r, idx) => {
    const dist = getNum(r, "distance_km") || getNum(r, "distance") || 0;
    const base = getNum(r, "base_time_min") || getNum(r, "baseTime") || getNum(r, "duration_min") || 0;
    const delay = getNum(r, "predicted_delay_min") || getNum(r, "predictedDelay") || 0;
    const total = getNum(r, "predicted_time_min") || getNum(r, "predicted_time") || base + delay;
    const rs = getNum(r, "riskScore") ?? 0;
    const delayPct = base > 0 ? (delay / base) * 100 : 0;
    const timeSaved = total - bestTime;
    const efficiency = total > 0 ? dist / total : 0;
    const riskRank = riskRanked.find((x) => x.route === r)?.rank ?? idx + 1;
    const congRank =
      congestionRanked.findIndex((x) => x === r) + 1 || idx + 1;

    return {
      rank: r.rank ?? idx + 1,
      route_id: `route_${r.rank ?? idx + 1}`,
      name: getStr(r, "name") || getStr(r, "route") || `Route ${idx + 1}`,
      distance_km: dist,
      base_time_min: base,
      predicted_delay_min: delay,
      predicted_time_min: total,
      risk: getStr(r, "risk") || "Unknown",
      congestionLevel: getStr(r, "congestionLevel") || "Unknown",
      riskScore: rs,
      delay_percentage: Math.round(delayPct * 100) / 100,
      time_saved_vs_best_route: Math.round(timeSaved * 100) / 100,
      efficiency_km_per_min: Math.round(efficiency * 1000) / 1000,
      relative_risk_rank: riskRank,
      relative_congestion_rank: congRank,
    };
  });
}

export function deriveRunLevelAnalytics(
  routes: RouteInput[],
  derived: DerivedRouteAnalytics[]
): RunLevelAnalytics {
  if (!routes.length) {
    return {
      total_routes: 0,
      fastest_route_id: "",
      fastest_route_name: "",
      safest_route_id: "",
      safest_route_name: "",
      average_delay: 0,
      delay_variance: 0,
      risk_spread_across_routes: 0,
      congestion_consistency_indicator: "",
    };
  }

  const delays = derived.map((d) => d.predicted_delay_min);
  const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
  const variance =
    delays.length > 1
      ? delays.reduce((s, d) => s + (d - avgDelay) ** 2, 0) / delays.length
      : 0;
  const riskScores = derived.map((d) => d.riskScore);
  const riskSpread =
    riskScores.length > 1
      ? Math.max(...riskScores) - Math.min(...riskScores)
      : 0;
  const congestionLevels = derived.map((d) => d.congestionLevel.toLowerCase());
  const uniqueCongestion = new Set(congestionLevels).size;
  const consistency =
    uniqueCongestion === 1 ? "consistent" : uniqueCongestion === routes.length ? "varied" : "mixed";

  const fastest = derived.reduce((best, d) =>
    d.predicted_time_min < best.predicted_time_min ? d : best
  );
  const safest = derived.reduce((best, d) =>
    (d.riskScore ?? 999) < (best.riskScore ?? 999) ? d : best
  );

  return {
    total_routes: routes.length,
    fastest_route_id: fastest.route_id,
    fastest_route_name: fastest.name,
    safest_route_id: safest.route_id,
    safest_route_name: safest.name,
    average_delay: Math.round(avgDelay * 100) / 100,
    delay_variance: Math.round(variance * 100) / 100,
    risk_spread_across_routes: Math.round(riskSpread * 100) / 100,
    congestion_consistency_indicator: consistency,
  };
}

export function deriveHumanReadableSummaries(
  derived: DerivedRouteAnalytics[],
  run: RunLevelAnalytics
): HumanReadableSummaries {
  const rec = derived.find((d) => d.rank === 1);
  const others = derived.filter((d) => d.rank > 1);
  const maxSaved = others.length
    ? Math.max(...others.map((d) => d.time_saved_vs_best_route))
    : 0;

  const whyRec = rec
    ? interpolateTemplate(SUMMARY_TEMPLATES.WHY_RECOMMENDED, {
        route_name: rec.name,
        total_time: rec.predicted_time_min,
        base: rec.base_time_min,
        delay: rec.predicted_delay_min,
      })
    : "";

  const timeSaved = interpolateTemplate(SUMMARY_TEMPLATES.TIME_SAVED_VS_ALTERNATIVES, {
    max_saved: maxSaved,
    best_route: rec?.name ?? "",
  });

  const congConsist = interpolateTemplate(SUMMARY_TEMPLATES.CONGESTION_CONSISTENCY, {
    indicator: run.congestion_consistency_indicator,
  });

  return {
    why_recommended: whyRec,
    time_saved_vs_alternatives: timeSaved,
    congestion_consistency: congConsist,
  };
}

export function flattenComparisonTable(derived: DerivedRouteAnalytics[]): FlattenedComparisonRow[] {
  return derived.map((d) => ({
    rank: d.rank,
    route_id: d.route_id,
    name: d.name,
    distance_km: d.distance_km,
    base_time_min: d.base_time_min,
    predicted_delay_min: d.predicted_delay_min,
    predicted_time_min: d.predicted_time_min,
    risk: d.risk,
    congestionLevel: d.congestionLevel,
    riskScore: d.riskScore,
    delay_percentage: d.delay_percentage,
    time_saved_vs_best_route: d.time_saved_vs_best_route,
    efficiency_km_per_min: d.efficiency_km_per_min,
    relative_risk_rank: d.relative_risk_rank,
    relative_congestion_rank: d.relative_congestion_rank,
  }));
}

export function deriveRouteInsightBullets(derived: DerivedRouteAnalytics[]): string[] {
  return derived.map((d) =>
    interpolateTemplate(SUMMARY_TEMPLATES.ROUTE_INSIGHT, {
      name: d.name,
      distance: d.distance_km,
      total: d.predicted_time_min,
      base: d.base_time_min,
      delay: d.predicted_delay_min,
      risk: d.risk,
      congestion: d.congestionLevel,
    })
  );
}

export function deriveRunSummaryBullets(run: RunLevelAnalytics): string[] {
  const bullets: string[] = [];
  if (run.total_routes > 0) {
    bullets.push(
      interpolateTemplate(SUMMARY_TEMPLATES.RUN_SUMMARY_TOTAL, { count: run.total_routes })
    );
    if (run.fastest_route_name) {
      bullets.push(
        interpolateTemplate(SUMMARY_TEMPLATES.RUN_SUMMARY_FASTEST, { name: run.fastest_route_name })
      );
    }
    if (run.safest_route_name) {
      bullets.push(
        interpolateTemplate(SUMMARY_TEMPLATES.RUN_SUMMARY_SAFEST, { name: run.safest_route_name })
      );
    }
    bullets.push(
      interpolateTemplate(SUMMARY_TEMPLATES.RUN_SUMMARY_AVG_DELAY, { value: run.average_delay })
    );
  }
  return bullets;
}

export function derivePlannerSummary(prediction: Record<string, unknown>): PlannerSummary {
  const routes = (Array.isArray(prediction.routes) ? prediction.routes : []) as RouteInput[];
  const derived = deriveRouteAnalytics(routes);
  const run = deriveRunLevelAnalytics(routes, derived);
  const summaries = deriveHumanReadableSummaries(derived, run);
  const flattened_table = flattenComparisonTable(derived);

  return { run, routes: derived, summaries, flattened_table };
}

export function deriveNavigationSummary(prediction: Record<string, unknown>): NavigationSummary {
  const routes = (Array.isArray(prediction.routes) ? prediction.routes : []) as RouteInput[];
  const derived = deriveRouteAnalytics(routes);
  const rec = derived.find((d) => d.rank === 1) ?? null;
  const others = derived.filter((d) => d.rank > 1);
  const maxSaved = others.length
    ? Math.max(...others.map((d) => d.time_saved_vs_best_route))
    : 0;

  const timeSavedMessage = rec
    ? interpolateTemplate(SUMMARY_TEMPLATES.TIME_SAVED_VS_ALTERNATIVES, {
        max_saved: maxSaved,
        best_route: rec.name,
      })
    : "";

  return {
    recommended_route: rec,
    time_saved_message: timeSavedMessage,
    alternatives_count: others.length,
  };
}
