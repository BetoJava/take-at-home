"use client";

import { useChatStore, usePropertyStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Home, Calculator, TrendingUp } from "lucide-react";

const suggestions = [
  {
    icon: Home,
    title: "Nouveau projet",
    message: "J'ai acheté un studio à 150 000€ que je loue 600€ par mois. Est-ce que le régime réel serait avantageux ?",
    description: "Simuler un investissement simple",
  },
  {
    icon: Calculator,
    title: "Avec emprunt",
    message: "J'ai un T2 acheté 200 000€ avec un prêt de 180 000€ sur 20 ans à 3,5%. Le loyer est de 800€/mois et j'ai 2000€ de charges annuelles.",
    description: "Calculer avec un financement",
  },
  {
    icon: TrendingUp,
    title: "Projet détaillé",
    message: "Bien acheté 250 000€, loyer 1000€/mois, charges de copropriété 100€/mois, taxe foncière 1500€/an, et j'ai fait 15 000€ de travaux.",
    description: "Analyse complète",
  },
];

export function MessageSuggestions() {
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isLoading = useChatStore((state) => state.isLoading);
  const propertyData = usePropertyStore((state) => state.data);
  const updatePropertyData = usePropertyStore((state) => state.updateData);

  const handleSuggestionClick = async (message: string) => {
    if (isLoading) return;
    await sendMessage(message, propertyData, updatePropertyData);
  };

  return (
    <div className="mb-4">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        Suggestions pour commencer
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="h-auto justify-start p-4 text-left"
              onClick={() => handleSuggestionClick(suggestion.message)}
              disabled={isLoading}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
