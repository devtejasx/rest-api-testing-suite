/**
 * Formatting helpers shared across the app. Pure functions, no side effects.
 */

/** Format a millisecond duration into a human readable string. */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}m ${remaining}s`;
}

/** Format milliseconds as a response-time label. */
export function formatMs(ms: number): string {
  return `${Math.round(ms)} ms`;
}

/** Compact number formatting: 1200 -> 1.2k */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Percentage with a single decimal when needed. */
export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}%`;
}

/** Absolute date, e.g. "Jul 18, 2026, 14:32". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Short date only, e.g. "Jul 18, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Relative time, e.g. "3 min ago", "2 days ago". */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSeconds = Math.round((now - then) / 1000);

  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let duration = -diffSeconds;
  let unit: Intl.RelativeTimeFormatUnit = "second";

  for (const [amount, currentUnit] of divisions) {
    if (Math.abs(duration) < amount) {
      unit = currentUnit;
      break;
    }
    duration /= amount;
  }
  return rtf.format(Math.round(duration), unit);
}

/** Capitalize the first letter of a string. */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
