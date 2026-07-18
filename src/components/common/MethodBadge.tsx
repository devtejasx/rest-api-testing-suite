import { cn } from "@/lib/utils";
import { METHOD_STYLES } from "@/utils/constants";
import type { HttpMethod } from "@/types";

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

/** Monospace HTTP-method chip, colored per method (Postman-style). */
export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[3.5rem] justify-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide",
        METHOD_STYLES[method],
        className,
      )}
    >
      {method}
    </span>
  );
}
