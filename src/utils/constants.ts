import type { HttpMethod, RunStatus, HealthStatus } from "@/types";

/** Tailwind class fragments for HTTP method badges. */
export const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  POST: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  PUT: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  PATCH: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  DELETE: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  HEAD: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  OPTIONS: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

/** Human-facing labels + colors for run statuses. */
export const STATUS_CONFIG: Record<
  RunStatus,
  { label: string; className: string; dot: string }
> = {
  passed: {
    label: "Passed",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  failed: {
    label: "Failed",
    className: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    dot: "bg-rose-400",
  },
  running: {
    label: "Running",
    className: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-400",
  },
  queued: {
    label: "Queued",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
  },
  skipped: {
    label: "Skipped",
    className: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    dot: "bg-slate-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    dot: "bg-zinc-400",
  },
};

/** Health status config used by Docker + status cards. */
export const HEALTH_CONFIG: Record<
  HealthStatus,
  { label: string; className: string; dot: string }
> = {
  healthy: {
    label: "Healthy",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  degraded: {
    label: "Degraded",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
  },
  down: {
    label: "Down",
    className: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    dot: "bg-rose-400",
  },
  unknown: {
    label: "Unknown",
    className: "text-slate-400 bg-slate-500/10 border-slate-500/20",
    dot: "bg-slate-400",
  },
};

/** Recharts-friendly palette aligned with the design system. */
export const CHART_COLORS = {
  emerald: "#10b981",
  blue: "#3b82f6",
  rose: "#f43f5e",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  slate: "#64748b",
  grid: "#1e293b",
};
