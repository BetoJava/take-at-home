import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export const chatInputSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  previousContext: z.any().nullable().optional(),
});

// Types inférés
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatInput = z.infer<typeof chatInputSchema>;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentStreamingMessageId?: string;
}

export type RecordingState = "idle" | "recording" | "processing";

