"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SalesPurchasesPoint = {
  date: string;
  label: string;
  sales: number;
  purchases: number;
};

export function SalesPurchasesChart({ data }: { data: SalesPurchasesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.2} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={36}
          tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
        />
        <Tooltip
          formatter={(value) => `Rs. ${Number(value).toLocaleString()}`}
          contentStyle={{
            borderRadius: 8,
            fontSize: 12,
            background: "var(--color-popover)",
            color: "var(--color-popover-foreground)",
            border: "1px solid var(--color-border)",
          }}
        />
        <Bar
          dataKey="sales"
          name="Sales"
          fill="var(--color-chart-1)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="purchases"
          name="Purchases"
          fill="var(--color-chart-3)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
