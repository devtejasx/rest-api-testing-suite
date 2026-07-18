import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS } from "@/utils/constants";
import type { ResponseTimePoint } from "@/types";

interface ResponseTimeLineProps {
  data: ResponseTimePoint[];
  height?: number;
}

/** Area/line chart of average response time with a p95 overlay. */
export function ResponseTimeLine({ data, height = 240 }: ResponseTimeLineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="rt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.blue} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="p95" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.violet} stopOpacity={0.15} />
            <stop offset="100%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="timestamp"
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
          width={44}
          tickFormatter={(v) => `${v}ms`}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="p95"
          name="p95"
          stroke={CHART_COLORS.violet}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="url(#p95)"
        />
        <Area
          type="monotone"
          dataKey="responseTime"
          name="Avg"
          stroke={CHART_COLORS.blue}
          strokeWidth={2.5}
          fill="url(#rt)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
