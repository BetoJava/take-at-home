/**
 * Point d'entrée centralisé pour tous les types de l'application
 */

// Types Chat
export type {
  ChatMessage,
  ChatInput,
  Message,
  ChatState,
  RecordingState,
} from "./chat.types";

export {
  chatMessageSchema,
  chatInputSchema,
} from "./chat.types";

// Types Simulation
export type {
  InvestmentExpenses,
  PropertyInvestmentData,
  YearlySimulationData,
  SimulationResults,
} from "./simulation.types";

export {
  investmentExpensesSchema,
  propertyInvestmentDataSchema,
} from "./simulation.types";

// Types API
export type {
  StreamResponse,
  TranscriptionResponse,
  LLMCallOptions,
} from "./api.types";
