import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Accent color for the icon chip. */
  accent?: "emerald" | "blue" | "rose" | "amber" | "violet" | "slate";
  /** Optional delta, e.g. "+12.5%". Positive/negative inferred from sign. */
  delta?: string;
  hint?: string;
  /** Optional custom node rendered in place of the value (e.g. a badge). */
  valueSlot?: React.ReactNode;
  index?: number;
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400",
  blue: "bg-blue-500/10 text-blue-400",
  rose: "bg-rose-500/10 text-rose-400",
  amber: "bg-amber-500/10 text-amber-400",
  violet: "bg-violet-500/10 text-violet-400",
  slate: "bg-slate-500/10 text-slate-300",
};

/** A single KPI tile: label, value, icon and optional trend delta. */
export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "emerald",
  delta,
  hint,
  valueSlot,
  index = 0,
}: StatCardProps) {
  const isNegative = delta?.trim().startsWith("-");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
    >
      <Card className="group relative overflow-hidden p-5 transition-colors hover:border-border/80">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {valueSlot ?? (
              <p className="text-2xl font-bold tracking-tight tabular-nums">
                {value}
              </p>
            )}
            {(delta || hint) && (
              <div className="flex items-center gap-1.5 text-xs">
                {delta && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-medium",
                      isNegative ? "text-rose-400" : "text-emerald-400",
                    )}
                  >
                    {isNegative ? (
                      <ArrowDownRight className="h-3 w-3" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3" />
                    )}
                    {delta.replace(/^[+-]/, "")}
                  </span>
                )}
                {hint && <span className="text-muted-foreground">{hint}</span>}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              ACCENTS[accent],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
