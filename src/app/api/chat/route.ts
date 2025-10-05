import { type NextRequest } from "next/server";
import { processChatMessages } from "@/lib/chat";
import { chatInputSchema, type ChatMessage } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = chatInputSchema.parse(body);

    const messages: ChatMessage[] = input.messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    const previousContext = input.previousContext ?? null;

    // Créer un stream encodé
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const result of processChatMessages(previousContext, messages)) {
            // Envoyer chaque résultat comme une ligne JSON
            const chunk = JSON.stringify(result) + "\n";
            controller.enqueue(encoder.encode(chunk));
          }

          // Signal de fin
          const doneChunk = JSON.stringify({ type: "done" }) + "\n";
          controller.enqueue(encoder.encode(doneChunk));
          controller.close();
        } catch (error) {
          console.error("Erreur lors du streaming:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Erreur lors du traitement:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
