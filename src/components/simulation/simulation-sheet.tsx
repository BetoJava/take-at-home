"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { usePropertyStore } from "@/stores";
import { simulationService } from "@/services";
import { SimulationChart } from "./simulation-chart";
import { ComparisonTable } from "./comparison-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

export function SimulationPanel() {
  const data = usePropertyStore((state) => state.data);
  const [projectionDuration, setProjectionDuration] = useState(10);

  // Calculer la simulation avec la durée personnalisée
  const simulation = data
    ? simulationService.simulate({
      ...data,
      projectionDuration,
    })
    : null;

  const hasMinimalData = data?.purchasePrice && data?.monthlyRent;

  return (
    <div className="flex h-full flex-col border-l bg-muted/30">
      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Inputs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Définition de votre projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="projection-duration"> <Clock className="size-4" /> Durée de détention</Label>

                </div>
                <Slider
                  id="projection-duration"
                  min={5}
                  max={25}
                  step={1}
                  value={[projectionDuration]}
                  onValueChange={(values) => setProjectionDuration(values[0] ?? 10)}
                  className="w-full"
                />
                <div className="w-full text-center text-sm font-medium text-muted-foreground">
                  {projectionDuration} ans
                </div>
              </div>

              {data && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Prix d'achat</p>
                    <p className="text-lg font-semibold">
                      {data.purchasePrice ? simulationService.formatCurrency(data.purchasePrice) : "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loyer mensuel</p>
                    <p className="text-lg font-semibold">
                      {data.monthlyRent ? simulationService.formatCurrency(data.monthlyRent) : "Non renseigné"}
                    </p>
                  </div>
                  {data.loanAmount && typeof data.loanAmount === 'number' && data.loanAmount > 0 ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Montant emprunté</p>
                        <p className="text-lg font-semibold">{simulationService.formatCurrency(data.loanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Durée de l'emprunt</p>
                        <p className="text-lg font-semibold">{data.loanDuration ?? 20} ans</p>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status: Waiting for data or showing results */}
          {!hasMinimalData ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p className="mb-2">En attente des informations...</p>
                  <p className="text-sm">
                    Décrivez votre projet dans le chat pour voir la simulation
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : simulation ? (
            <>
              {/* Comparison Table */}
              <ComparisonTable simulation={simulation} />

              {/* Tax Evolution Chart */}
              <SimulationChart simulation={simulation} />
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
