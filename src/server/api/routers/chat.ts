import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { processChatMessages } from "@/lib/chat";
import { observable } from "@trpc/server/observable";
import {
  chatInputSchema,
  type ChatMessage,
  type PropertyInvestmentData,
} from "@/types";

export const chatRouter = createTRPCRouter({
  /**
   * Procédure pour traiter les messages de chat avec streaming et extraction de contexte
   *
   * Étapes:
   * 1. Extrait le contexte JSON des messages via GPT-5
   * 2. Stream la réponse en utilisant le contexte
   * 3. Envoie le contexte JSON à la fin
   */
  processMessages: publicProcedure
    .input(chatInputSchema)
    .subscription(async ({ input }) => {
      return observable<
        | { type: "context"; data: PropertyInvestmentData }
        | { type: "chunk"; data: string }
        | { type: "done" }
      >((emit) => {
        // Fonction async pour gérer le streaming
        const streamMessages = async () => {
          try {
            const messages: ChatMessage[] = input.messages.map((msg) => ({
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
            }));

            // Process les messages avec le contexte précédent
            const previousContext = input.previousContext ?? null;

            for await (const result of processChatMessages(
              previousContext,
              messages,
            )) {
              emit.next(result);
            }

            // Signal de fin
            emit.next({ type: "done" });
            emit.complete();
          } catch (error) {
            emit.error(
              error instanceof Error ? error : new Error("Unknown error"),
            );
          }
        };

        void streamMessages();

        // Cleanup function
        return () => {
          // Rien à nettoyer pour l'instant
        };
      });
    }),
});
