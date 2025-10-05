"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/simulation";
import type { SimulationResults } from "@/lib/simulation";

interface ComparisonTableProps {
  simulation: SimulationResults;
}

export function ComparisonTable({ simulation }: ComparisonTableProps) {
  const firstYear = simulation.yearlyData[0];
  if (!firstYear) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison des régimes fiscaux</CardTitle>
        <CardDescription>
          Première année d'exploitation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left text-sm font-medium text-muted-foreground"></th>
                <th className="py-2 px-4 text-right text-sm font-medium text-muted-foreground">
                  Micro-BIC
                </th>
                <th className="py-2 px-4 text-right text-sm font-medium text-muted-foreground">
                  Réel
                </th>
                <th className="py-2 px-4 text-right text-sm font-medium text-green-600">
                  Différence
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 text-sm font-medium">Revenus locatifs</td>
                <td className="py-3 px-4 text-sm text-right">
                  {formatCurrency(firstYear.microBicRevenue)}
                </td>
                <td className="py-3 px-4 text-sm text-right">
                  {formatCurrency(firstYear.reelRevenue)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-muted-foreground">-</td>
              </tr>

              <tr className="border-b">
                <td className="py-3 px-4 text-sm font-medium">Revenu imposable</td>
                <td className="py-3 px-4 text-sm text-right">
                  {formatCurrency(firstYear.microBicTaxableIncome)}
                </td>
                <td className="py-3 px-4 text-sm text-right">
                  {formatCurrency(firstYear.reelTaxableIncome)}
                </td>
                <td className="py-3 px-4 text-sm text-right text-green-600">
                  {formatCurrency(firstYear.microBicTaxableIncome - firstYear.reelTaxableIncome)}
                </td>
              </tr>

              <tr className="bg-muted/50">
                <td className="py-3 px-4 text-sm font-semibold">Impôt estimé</td>
                <td className="py-3 px-4 text-sm text-right font-semibold">
                  {formatCurrency(firstYear.microBicTax)}
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold">
                  {formatCurrency(firstYear.reelTax)}
                </td>
                <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                  {formatCurrency(firstYear.taxSavings)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              💡 Le régime Réel vous ferait économiser{" "}
              <span className="font-bold">{formatCurrency(firstYear.taxSavings)}</span> d'impôts
              la première année
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
              📊 Calcul du revenu imposable (Réel)
            </p>
            <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
              <div className="flex justify-between">
                <span>Revenus locatifs</span>
                <span className="font-medium">{formatCurrency(firstYear.reelRevenue)}</span>
              </div>
              {firstYear.annualCharges > 0 && (
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>− Charges</span>
                  <span className="font-medium">−{formatCurrency(firstYear.annualCharges)}</span>
                </div>
              )}
              {firstYear.loanInterest > 0 && (
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>− Intérêts d'emprunt</span>
                  <span className="font-medium">−{formatCurrency(firstYear.loanInterest)}</span>
                </div>
              )}
              {firstYear.annualDepreciation > 0 && (
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>− Amortissement</span>
                  <span className="font-medium">−{formatCurrency(firstYear.annualDepreciation)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-blue-300 dark:border-blue-700 flex justify-between font-bold">
                <span>= Revenu imposable</span>
                <span>{formatCurrency(firstYear.reelTaxableIncome)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
