import { cn } from "@/lib/utils";
import { STATUS_CONFIG, HEALTH_CONFIG } from "@/utils/constants";
import type { RunStatus, HealthStatus } from "@/types";

interface StatusBadgeProps {
  status: RunStatus | HealthStatus;
  /** Which config table to use. Defaults to run-status. */
  variant?: "run" | "health";
  /** Pulse the dot (useful for running/degraded states). */
  pulse?: boolean;
  className?: string;
}

/**
 * A pill badge with a colored status dot. Central place that maps a status
 * enum to its label + color so every page stays consistent.
 */
export function StatusBadge({
  status,
  variant = "run",
  pulse,
  className,
}: StatusBadgeProps) {
  const config =
    variant === "health"
      ? HEALTH_CONFIG[status as HealthStatus]
      : STATUS_CONFIG[status as RunStatus];

  if (!config) return null;

  const shouldPulse =
    pulse ?? (status === "running" || status === "degraded");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {shouldPulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              config.dot,
            )}
          />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", config.dot)} />
      </span>
      {config.label}
    </span>
  );
}
