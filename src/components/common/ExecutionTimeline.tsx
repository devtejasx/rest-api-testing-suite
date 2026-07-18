import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  MinusCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/format";
import type { PipelineStepStatus } from "@/types";

export interface TimelineStep {
  id: string;
  name: string;
  status: PipelineStepStatus;
  durationMs?: number;
  meta?: string;
}

interface ExecutionTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const STEP_STYLE: Record<
  PipelineStepStatus,
  { icon: typeof CheckCircle2; color: string; line: string }
> = {
  success: { icon: CheckCircle2, color: "text-emerald-400", line: "bg-emerald-500/40" },
  failed: { icon: XCircle, color: "text-rose-400", line: "bg-rose-500/40" },
  running: { icon: Loader2, color: "text-blue-400", line: "bg-blue-500/40" },
  pending: { icon: CircleDashed, color: "text-slate-500", line: "bg-border" },
  skipped: { icon: MinusCircle, color: "text-slate-500", line: "bg-border" },
};

/**
 * Vertical execution timeline used for CI/CD pipelines and run steps.
 * Renders a connected list of steps with status icons and durations.
 */
export function ExecutionTimeline({ steps, className }: ExecutionTimelineProps) {
  return (
    <ol className={cn("relative space-y-1", className)}>
      {steps.map((step, i) => {
        const style = STEP_STYLE[step.status];
        const Icon = style.icon;
        const isLast = i === steps.length - 1;
        return (
          <li key={step.id} className="relative flex gap-4 pb-4">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[11px] top-7 h-[calc(100%-1rem)] w-0.5 rounded-full",
                  style.line,
                )}
                aria-hidden
              />
            )}
            <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon
                className={cn(
                  "h-5 w-5",
                  style.color,
                  step.status === "running" && "animate-spin",
                )}
              />
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium leading-tight">{step.name}</p>
                {step.meta && (
                  <p className="text-xs text-muted-foreground">{step.meta}</p>
                )}
              </div>
              {step.durationMs !== undefined && step.durationMs > 0 && (
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDuration(step.durationMs)}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
