import { create } from "zustand";
import type { PropertyInvestmentData } from "@/types";

interface PropertyStore {
  // State
  data: PropertyInvestmentData | null;

  // Actions
  updateData: (data: PropertyInvestmentData) => void;
  clearData: () => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  // Initial state
  data: null,

  // Actions
  updateData: (newData) => {
    set({ data: newData });
  },

  clearData: () => {
    set({ data: null });
  },
}));

