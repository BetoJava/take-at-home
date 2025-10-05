import { z } from "zod";

/**
 * Schema de validation pour les messages de chat
 */
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

/**
 * Schema de validation pour les dépenses d'investissement
 */
export const investmentExpensesSchema = z.object({
  /** Liste des charges annuelles au format [("Nom de la charge", montant)] */
  annualExpenses: z.array(z.tuple([z.string(), z.number()])),
  /** Liste des charges mensuelles au format [("Nom de la charge", montant)] */
  monthlyExpenses: z.array(z.tuple([z.string(), z.number()])),
  /** Coût de travaux (si donné, sinon null) */
  renovationCosts: z.number().nullable().optional(),
  /** Valeur des meubles (si donné, sinon null) */
  furnitureValue: z.number().nullable().optional(),
});

/**
 * Schema de validation pour les données d'investissement locatif LMNP
 */
export const propertyInvestmentDataSchema = z.object({
  // Property
  /** Prix d'achat du bien */
  purchasePrice: z.number().nullable(),

  // Loan
  /** Montant de l'emprunt (si emprunt), si payé cash : 0 */
  loanAmount: z.number().nullable().optional(),
  /** Taux d'intérêt de l'emprunt (si pas donné, 0.035 si 15 ans, 0.039 si 20 ans) */
  loanRate: z.number().nullable().optional(),
  /** Durée de l'emprunt en années */
  loanDuration: z.number().nullable().nullable().optional(),
  /** Apport initial (si donné, sinon null) */
  downPayment: z.number().nullable().optional(),

  // Income & Expenses
  /** Loyer mensuel */
  monthlyRent: z.number().nullable(),
  /** Taux d'occupation (si donné, sinon 1.0) */
  occupancyRate: z.number().nullable().optional(),
  /** Structure des dépenses et charges */
  expenses: investmentExpensesSchema,

  // Projection
  /** Durée de projection en années */
  projectionDuration: z.number().nullable().optional(),
  /** Taux d'augmentation du loyer en pourcentage */
  rentIncreaseRate: z.number().nullable().optional(),
});

/**
 * Schema d'entrée pour la procédure de chat
 */
export const chatInputSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  previousContext: propertyInvestmentDataSchema.nullable().optional(),
});


// Types inférés à partir des schémas Zod
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type InvestmentExpenses = z.infer<typeof investmentExpensesSchema>;
export type PropertyInvestmentData = z.infer<typeof propertyInvestmentDataSchema>;
export type ChatInput = z.infer<typeof chatInputSchema>;
