import type { PropertyInvestmentData } from "./simulation.types";

export type StreamResponse =
  | { type: "context"; data: PropertyInvestmentData }
  | { type: "chunk"; data: string }
  | { type: "done" };

export interface TranscriptionResponse {
  text: string;
}

export interface LLMCallOptions {
  messages: Array<{ role: string; content: string }>;
  model: string;
  temperature: number;
}

