"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type EggTrendPoint = {
  date: string;
  label: string;
  collected: number;
  sold: number;
};

export function EggTrendChart({ data }: { data: EggTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.2} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          interval="preserveStartEnd"
        />
        <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            fontSize: 12,
            background: "var(--color-popover)",
            color: "var(--color-popover-foreground)",
            border: "1px solid var(--color-border)",
          }}
        />
        <Line
          type="monotone"
          dataKey="collected"
          name="Collected"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="sold"
          name="Sold"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
