import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { processChatMessages } from "@/lib/chat";
import { getOpenAIAudioClient } from "@/lib/openai";
import {
  chatInputSchema,
  type ChatMessage,
  type PropertyInvestmentData,
} from "@/types";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  /**
   * Procédure pour traiter les messages de chat avec streaming et extraction de contexte
   *
   * Note: Cette procédure utilise une subscription tRPC, mais pour le moment
   * le client utilise l'API route /api/chat pour une compatibilité optimale avec le streaming.
   *
   * Étapes:
   * 1. Extrait le contexte JSON des messages via un llm
   * 2. Stream la réponse en utilisant le contexte
   * 3. Envoie le contexte JSON à la fin
   */
  processMessages: publicProcedure
    .input(chatInputSchema)
    .subscription(async function* ({ input }) {
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
          yield result;
        }

        // Signal de fin
        yield { type: "done" as const };
      } catch (error) {
        throw error instanceof Error ? error : new Error("Unknown error");
      }
    }),

  /**
   * Procédure pour transcrire un fichier audio en texte
   * 
   * L'audio est envoyé en base64 pour être compatible avec tRPC
   */
  transcribe: publicProcedure
    .input(
      z.object({
        audioBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!input.audioBase64) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Aucun fichier audio fourni",
          });
        }

        // Convertir base64 en File
        const audioBuffer = Buffer.from(input.audioBase64, "base64");
        const audioFile = new File([audioBuffer], input.fileName, {
          type: input.mimeType,
        });

        // Transcrire l'audio
        const client = getOpenAIAudioClient();
        const transcription = await client.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-large-v3-turbo",
        });

        return { text: transcription.text };
      } catch (error) {
        console.error("Erreur lors de la transcription:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la transcription",
          cause: error,
        });
      }
    }),
});
