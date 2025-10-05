"use client";

import { useState } from "react";
import { ChatContainer } from "@/components/chat/chat-container";
import { SimulationPanel } from "@/components/simulation/simulation-sheet";
import { BarChart3Icon, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePropertyInvestment } from "@/contexts/property-investment-context";

export default function Home() {
  const [showSimulation, setShowSimulation] = useState(true);
  const { data } = usePropertyInvestment();
  const hasData = data?.purchasePrice && data?.monthlyRent;

  return (
    <main className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3Icon className="size-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Simulateur LMNP</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Micro-BIC vs Réel</p>
            </div>
          </div>

          {/* Toggle button for mobile/tablet */}
          <div className="flex items-center gap-2">
            {/* {hasData && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <span className="flex size-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Données disponibles
                </span>
              </div>
            )} */}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSimulation(!showSimulation)}
              className={cn(
                "gap-2 lg:hidden",
                showSimulation && "bg-primary text-primary-foreground"
              )}
            >
              {showSimulation ? (
                <>
                  <MessageSquareIcon className="size-4" />
                  Chat
                </>
              ) : (
                <>
                  <BarChart3Icon className="size-4" />
                  Simulation
                  {hasData && <span className="flex size-2 rounded-full bg-green-500 animate-pulse" />}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Layout principal : Chat + Simulation côte à côte */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Interface */}
        <div
          className={cn(
            "flex-1 overflow-hidden transition-all duration-300",
            // Sur mobile/tablet, on cache le chat quand on affiche la simulation
            showSimulation ? "hidden lg:flex" : "flex"
          )}
        >
          <ChatContainer />
        </div>

        {/* Simulation Panel */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            "lg:flex",
            // Sur mobile/tablet, contrôle de l'affichage via le bouton toggle
            showSimulation ? "flex" : "hidden"
          )}
        >
          <SimulationPanel />
        </div>
      </div>
    </main>
  );
}