"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { PropertyInvestmentData } from "@/types";

interface PropertyInvestmentContextType {
  data: PropertyInvestmentData | null;
  updateData: (data: PropertyInvestmentData) => void;
  clearData: () => void;
}

const PropertyInvestmentContext = createContext<PropertyInvestmentContextType | undefined>(undefined);

export function PropertyInvestmentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PropertyInvestmentData | null>(null);

  const updateData = (newData: PropertyInvestmentData) => {
    setData(newData);
  };

  const clearData = () => {
    setData(null);
  };

  return (
    <PropertyInvestmentContext.Provider
      value={{
        data,
        updateData,
        clearData,
      }}
    >
      {children}
    </PropertyInvestmentContext.Provider>
  );
}

export function usePropertyInvestment() {
  const context = useContext(PropertyInvestmentContext);
  if (context === undefined) {
    throw new Error("usePropertyInvestment must be used within a PropertyInvestmentProvider");
  }
  return context;
}
