import { describe, it, expect } from "vitest";
import { simulationService } from "@/services";
import type { PropertyInvestmentData } from "@/types";

describe("SimulationService", () => {
  const mockBasicData: PropertyInvestmentData = {
    purchasePrice: 200000,
    monthlyRent: 1500, 
    loanAmount: 160000,
    loanRate: 0.035,
    loanDuration: 20,
    downPayment: 40000,
    occupancyRate: 1,
    expenses: {
      annualExpenses: [
        ["Taxe foncière", 1200],
        ["Assurance PNO", 300],
      ],
      monthlyExpenses: [
        ["Charges de copropriété", 100],
      ],
      renovationCosts: 5000,
      furnitureValue: 3000,
    },
    projectionDuration: 10,
    rentIncreaseRate: 0,
  };

  describe("simulate", () => {
    it("devrait retourner null si purchasePrice est null", () => {
      const data: PropertyInvestmentData = {
        ...mockBasicData,
        purchasePrice: null,
      };

      const result = simulationService.simulate(data);
      expect(result).toBeNull();
    });

    it("devrait retourner null si monthlyRent est null", () => {
      const data: PropertyInvestmentData = {
        ...mockBasicData,
        monthlyRent: null,
      };

      const result = simulationService.simulate(data);
      expect(result).toBeNull();
    });

    it("devrait calculer correctement une simulation de base", () => {
      const result = simulationService.simulate(mockBasicData);

      expect(result).not.toBeNull();
      expect(result?.yearlyData).toHaveLength(10);
      expect(result?.totalMicroBicTax).toBeGreaterThan(0);
      expect(result?.totalReelTax).toBeGreaterThan(0);
    });

    it("devrait avoir des économies d'impôts positives en Réel", () => {
      const result = simulationService.simulate(mockBasicData);

      expect(result).not.toBeNull();
      expect(result?.totalTaxSavings).toBeGreaterThan(0);
      expect(result?.totalMicroBicTax).toBeGreaterThan(result?.totalReelTax ?? 0);
    });

    it("devrait calculer correctement les revenus pour chaque année", () => {
      const result = simulationService.simulate(mockBasicData);

      expect(result).not.toBeNull();
      
      // Année 1
      const year1 = result?.yearlyData[0];
      expect(year1?.year).toBe(1);
      expect(year1?.microBicRevenue).toBe(18000); // 1500 * 12
      expect(year1?.reelRevenue).toBe(18000);
    });

    it("devrait calculer correctement le Micro-BIC (abattement 50%)", () => {
      const result = simulationService.simulate(mockBasicData);

      expect(result).not.toBeNull();
      
      const year1 = result?.yearlyData[0];
      const expectedTaxableIncome = 18000 * 0.5; // 9000
      const expectedTax = expectedTaxableIncome * 0.30; // 2700

      expect(year1?.microBicTaxableIncome).toBe(expectedTaxableIncome);
      expect(year1?.microBicTax).toBe(expectedTax);
    });

    it("devrait calculer correctement le régime Réel avec amortissement", () => {
      const result = simulationService.simulate(mockBasicData);

      expect(result).not.toBeNull();
      
      const year1 = result?.yearlyData[0];
      
      // Charges annuelles
      const annualCharges = 1200 + 300 + (100 * 12); // 2700
      expect(year1?.annualCharges).toBe(annualCharges);
      
      // Amortissement = 3% bien + travaux/10 + meubles/7
      const expectedDepreciation = (200000 * 0.03) + (5000 / 10) + (3000 / 7);
      expect(year1?.annualDepreciation).toBeCloseTo(expectedDepreciation, 2);
      
      // Intérêts d'emprunt
      expect(year1?.loanInterest).toBeGreaterThan(0);
    });

    it("devrait calculer le ROI cumulé correctement", () => {
      const result = simulationService.simulate(mockBasicData);

      expect(result).not.toBeNull();
      
      // L'investissement initial devrait être négatif au début
      const year1 = result?.yearlyData[0];
      expect(year1?.microBicCumulativeCashflow).toBeLessThan(0);
      expect(year1?.reelCumulativeCashflow).toBeLessThan(0);
      
      // Le ROI final devrait exister
      expect(result?.microBicFinalROI).toBeDefined();
      expect(result?.reelFinalROI).toBeDefined();
    });

    it("devrait gérer un investissement sans emprunt (cash)", () => {
      const dataWithoutLoan: PropertyInvestmentData = {
        ...mockBasicData,
        loanAmount: 0,
        downPayment: 200000,
      };

      const result = simulationService.simulate(dataWithoutLoan);

      expect(result).not.toBeNull();
      
      // Pas d'intérêts d'emprunt
      const year1 = result?.yearlyData[0];
      expect(year1?.loanInterest).toBe(0);
    });
  });
});

