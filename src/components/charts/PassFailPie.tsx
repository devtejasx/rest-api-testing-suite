import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS } from "@/utils/constants";
import type { PassFailDatum } from "@/types";

const COLORS: Record<PassFailDatum["name"], string> = {
  Passed: CHART_COLORS.emerald,
  Failed: CHART_COLORS.rose,
  Skipped: CHART_COLORS.slate,
};

interface PassFailPieProps {
  data: PassFailDatum[];
}

/** Donut chart of passed / failed / skipped test counts. */
export function PassFailPie({ data }: PassFailPieProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const passed = data.find((d) => d.name === "Passed")?.value ?? 0;
  const passRate = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={95}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums">{passRate}%</span>
        <span className="text-xs text-muted-foreground">Pass rate</span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-5">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[entry.name] }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-semibold tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
