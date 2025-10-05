"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SimulationResults } from "@/lib/simulation";
import { formatCurrency } from "@/lib/simulation";

interface SimulationChartProps {
  simulation: SimulationResults;
}

export function SimulationChart({ simulation }: SimulationChartProps) {
  // Calculer les impôts cumulatifs
  let cumulativeMicroBicTax = 0;
  let cumulativeReelTax = 0;

  const chartData = simulation.yearlyData.map((year) => {
    cumulativeMicroBicTax += year.microBicTax;
    cumulativeReelTax += year.reelTax;

    return {
      year: `Année ${year.year}`,
      microBicTax: cumulativeMicroBicTax,
      reelTax: cumulativeReelTax,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des impôts cumulés</CardTitle>
        <CardDescription>
          La comparaison de ce que vous payeriez d'impôts cumulés sur la durée de détention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="year"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <Line
              type="monotone"
              dataKey="microBicTax"
              stroke="var(--chart-1)"
              strokeWidth={2}
              name="Micro-BIC"
              dot={{ fill: "var(--chart-1)", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="reelTax"
              stroke="var(--chart-2)"
              strokeWidth={2}
              name="Réel"
              dot={{ fill: "var(--chart-2)", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            💡 Sur {simulation.yearlyData.length} {simulation.yearlyData.length > 1 ? "années" : "année"} de détention, le passage au Réel permettrait d'économiser{" "}
            <span className="font-bold">{formatCurrency(simulation.totalTaxSavings)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
