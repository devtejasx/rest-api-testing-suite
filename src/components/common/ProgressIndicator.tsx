import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  indicatorClassName?: string;
  className?: string;
}

/** Labelled progress bar with an optional percentage read-out. */
export function ProgressIndicator({
  value,
  label,
  showValue = true,
  indicatorClassName,
  className,
}: ProgressIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-semibold tabular-nums">{Math.round(clamped)}%</span>
          )}
        </div>
      )}
      <Progress value={clamped} indicatorClassName={indicatorClassName} />
    </div>
  );
}
