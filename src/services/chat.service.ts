import type { PropertyInvestmentData, StreamResponse } from "@/types";

/**
 * Service pour gérer les interactions avec l'API de chat
 */
export class ChatService {
  /**
   * Envoie un message au chat et retourne un stream de réponses
   */
  async sendMessage(
    messages: Array<{ role: string; content: string }>,
    previousContext: PropertyInvestmentData | null
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        previousContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Impossible de lire la réponse");
    }

    return response.body;
  }

  /**
   * Parse un stream de réponses
   */
  async *parseStream(
    stream: ReadableStream<Uint8Array>
  ): AsyncGenerator<StreamResponse, void, unknown> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const result = JSON.parse(line) as StreamResponse;
            yield result;
          } catch (e) {
            console.warn("Erreur parsing chunk:", e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const chatService = new ChatService();

