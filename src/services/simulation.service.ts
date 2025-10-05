import type { PropertyInvestmentData, SimulationResults, YearlySimulationData } from "@/types";

// Taux d'imposition par défaut (TMI moyen)
const DEFAULT_TAX_RATE = 0.30; // 30% (TMI + prélèvements sociaux)

/**
 * Service pour les calculs de simulation LMNP
 */
export class SimulationService {
  /**
   * Calcule le revenu annuel en tenant compte du taux d'occupation
   */
  private calculateAnnualRevenue(
    monthlyRent: number,
    occupancyRate: number = 1,
    rentIncreaseRate: number = 0,
    year: number
  ): number {
    const baseRevenue = monthlyRent * 12 * occupancyRate;
    return baseRevenue * Math.pow(1 + rentIncreaseRate, year - 1);
  }

  /**
   * Calcule les charges annuelles totales
   */
  private calculateTotalAnnualCharges(data: PropertyInvestmentData): number {
    let total = 0;
    
    for (const [, amount] of data.expenses.annualExpenses) {
      total += amount;
    }
    
    for (const [, amount] of data.expenses.monthlyExpenses) {
      total += amount * 12;
    }
    
    return total;
  }

  /**
   * Calcule l'amortissement annuel
   */
  private calculateAnnualDepreciation(data: PropertyInvestmentData): number {
    if (!data.purchasePrice) return 0;
    
    // Amortissement du bien : 3% du prix d'achat
    const propertyDepreciation = data.purchasePrice * 0.03;
    
    // Amortissement des travaux sur 10 ans
    const renovationDepreciation = (data.expenses.renovationCosts ?? 0) / 10;
    
    // Amortissement des meubles sur 7 ans
    const furnitureDepreciation = (data.expenses.furnitureValue ?? 0) / 7;
    
    return propertyDepreciation + renovationDepreciation + furnitureDepreciation;
  }

  /**
   * Calcule les intérêts d'emprunt pour une année donnée
   */
  private calculateLoanInterest(
    loanAmount: number,
    loanRate: number,
    loanDuration: number,
    year: number
  ): number {
    if (!loanAmount || year > loanDuration) return 0;
    
    const monthlyRate = loanRate / 12;
    const numberOfPayments = loanDuration * 12;
    const monthlyPayment = 
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const monthsElapsed = (year - 1) * 12;
    let remainingCapital = loanAmount;
    
    for (let i = 0; i < monthsElapsed; i++) {
      const interest = remainingCapital * monthlyRate;
      const principal = monthlyPayment - interest;
      remainingCapital -= principal;
    }
    
    let yearlyInterest = 0;
    for (let i = 0; i < 12; i++) {
      const interest = remainingCapital * monthlyRate;
      yearlyInterest += interest;
      const principal = monthlyPayment - interest;
      remainingCapital -= principal;
    }
    
    return yearlyInterest;
  }

  /**
   * Calcule la mensualité de prêt
   */
  private calculateMonthlyLoanPayment(
    loanAmount: number,
    loanRate: number,
    loanDuration: number
  ): number {
    if (!loanAmount) return 0;
    
    const monthlyRate = loanRate / 12;
    const numberOfPayments = loanDuration * 12;
    
    return (
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  }

  /**
   * Simule l'investissement LMNP sur la durée de détention
   */
  simulate(data: PropertyInvestmentData): SimulationResults | null {
    if (!data.purchasePrice || !data.monthlyRent) {
      return null;
    }
    
    const projectionDuration = data.projectionDuration ?? 10;
    const occupancyRate = data.occupancyRate ?? 1;
    const rentIncreaseRate = (data.rentIncreaseRate ?? 0) / 100;
    
    const annualCharges = this.calculateTotalAnnualCharges(data);
    const annualDepreciation = this.calculateAnnualDepreciation(data);
    
    const loanAmount = data.loanAmount ?? 0;
    const loanRate = data.loanRate ?? (data.loanDuration === 15 ? 0.035 : 0.039);
    const loanDuration = data.loanDuration ?? 20;
    
    const monthlyLoanPayment = this.calculateMonthlyLoanPayment(loanAmount, loanRate, loanDuration);
    const annualLoanPayment = monthlyLoanPayment * 12;
    
    const initialInvestment = (data.downPayment ?? 0) + 
                              (data.expenses.renovationCosts ?? 0) +
                              (data.expenses.furnitureValue ?? 0);
    
    const yearlyData: YearlySimulationData[] = [];
    let microBicCumulativeCashflow = -initialInvestment;
    let reelCumulativeCashflow = -initialInvestment;
    let cumulativeTaxSavings = 0;
    
    for (let year = 1; year <= projectionDuration; year++) {
      const revenue = this.calculateAnnualRevenue(
        data.monthlyRent,
        occupancyRate,
        rentIncreaseRate,
        year
      );
      
      // === MICRO-BIC ===
      const microBicTaxableIncome = revenue * 0.5;
      const microBicTax = microBicTaxableIncome * DEFAULT_TAX_RATE;
      const microBicLoanInterest = this.calculateLoanInterest(loanAmount, loanRate, loanDuration, year);
      const microBicNetIncome = revenue - annualCharges - microBicTax - microBicLoanInterest;
      microBicCumulativeCashflow += microBicNetIncome;
      const microBicROI = (microBicCumulativeCashflow / initialInvestment) * 100;
      
      // === RÉEL ===
      const loanInterest = this.calculateLoanInterest(loanAmount, loanRate, loanDuration, year);
      const reelTaxableIncome = Math.max(
        0,
        revenue - annualCharges - loanInterest - annualDepreciation
      );
      const reelTax = reelTaxableIncome * DEFAULT_TAX_RATE;
      const reelNetIncome = revenue - annualCharges - reelTax - loanInterest;
      reelCumulativeCashflow += reelNetIncome;
      const reelROI = (reelCumulativeCashflow / initialInvestment) * 100;
      
      // === COMPARAISON ===
      const taxSavings = microBicTax - reelTax;
      cumulativeTaxSavings += taxSavings;
      
      yearlyData.push({
        year,
        microBicRevenue: revenue,
        microBicTaxableIncome,
        microBicTax,
        microBicNetIncome,
        microBicCumulativeCashflow,
        microBicROI,
        reelRevenue: revenue,
        reelTaxableIncome,
        reelTax,
        reelNetIncome,
        reelCumulativeCashflow,
        reelROI,
        annualCharges,
        loanInterest,
        annualDepreciation,
        taxSavings,
        cumulativeTaxSavings,
      });
    }
    
    const totalMicroBicTax = yearlyData.reduce((sum, d) => sum + d.microBicTax, 0);
    const totalReelTax = yearlyData.reduce((sum, d) => sum + d.reelTax, 0);
    
    return {
      yearlyData,
      totalMicroBicTax,
      totalReelTax,
      totalTaxSavings: cumulativeTaxSavings,
      microBicFinalROI: yearlyData[yearlyData.length - 1]?.microBicROI ?? 0,
      reelFinalROI: yearlyData[yearlyData.length - 1]?.reelROI ?? 0,
    };
  }

  /**
   * Formate un nombre en euros
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/\u00A0/g, ' ').replace(/\u202f/g, ' ');
  }

  /**
   * Formate un pourcentage
   */
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100).replace(/\u00A0/g, ' ').replace(/\u202f/g, ' ');
  }
}

export const simulationService = new SimulationService();

