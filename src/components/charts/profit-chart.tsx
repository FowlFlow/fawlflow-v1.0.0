"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "@/lib/i18n/client";

export type ProfitPoint = {
  key: string;
  label: string;
  profit: number;
};

export function ProfitChart({ data }: { data: ProfitPoint[] }) {
  const t = useTranslations();
  const values = data.map((d) => d.profit);
  const maxValue = Math.max(0, ...values);
  const minValue = Math.min(0, ...values);
  const yMax = maxValue > 0 ? Math.ceil(maxValue * 1.15) : 10;
  const yMin = minValue < 0 ? Math.floor(minValue * 1.15) : 0;

  return (
    <ResponsiveContainer width="100%" height={240}>
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
          domain={[yMin, yMax]}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={40}
          tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : v)}
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
          dataKey="profit"
          name={t("feed.reports.profitNavLabel")}
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        >
          {data.map((d) => (
            <Cell
              key={d.key}
              fill={d.profit < 0 ? "var(--color-destructive)" : "var(--color-chart-1)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
