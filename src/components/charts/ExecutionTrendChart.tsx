import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS } from "@/utils/constants";
import type { ExecutionTrendPoint } from "@/types";

interface ExecutionTrendChartProps {
  data: ExecutionTrendPoint[];
  height?: number;
}

/** Stacked bar chart of passed vs failed tests over time. */
export function ExecutionTrendChart({
  data,
  height = 240,
}: ExecutionTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          stroke={CHART_COLORS.slate}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={CHART_COLORS.slate}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar
          dataKey="passed"
          name="Passed"
          stackId="a"
          fill={CHART_COLORS.emerald}
          radius={[0, 0, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="failed"
          name="Failed"
          stackId="a"
          fill={CHART_COLORS.rose}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
