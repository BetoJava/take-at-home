import { callLLM, callLLMStream } from "./openai";
import { extractAndParseJson } from "./json-extractor";
import { EXTRACT_JSON_PROMPT } from "./prompts/extract-json";
import { CHAT_RESPONSE_PROMPT } from "./prompts/chat-response";
import type { ChatMessage, PropertyInvestmentData } from "@/types";

/**
 * Étape 1: Extrait le contexte JSON à partir des messages
 */
export async function extractContextFromMessages(
    previousContext: PropertyInvestmentData | null,
    messages: ChatMessage[],
): Promise<PropertyInvestmentData> {
    // Prépare le prompt avec les messages de l'utilisateur
    const systemMessage: ChatMessage = {
        role: "system",
        content: EXTRACT_JSON_PROMPT(
            previousContext ? JSON.stringify(previousContext, null, 2) : "",
            JSON.stringify(messages, null, 2)
        ),
    };

    const allMessages: ChatMessage[] = [systemMessage, ...messages];

    // Appelle GPT-5 pour extraire le contexte
    const response = await callLLM({
        messages: allMessages,
        model: "gpt-5",
        temperature: 0.5,
    });

    // Extrait et parse le JSON avec retry
    const context = await extractAndParseJson<PropertyInvestmentData>(response);

    return context;
}

/**
 * Étape 2: Génère une réponse en streaming basée sur le contexte
 */
export async function* generateStreamingResponse(
    messages: ChatMessage[],
    context: PropertyInvestmentData,
): AsyncGenerator<string, PropertyInvestmentData, unknown> {
    // Prépare le prompt système avec le contexte JSON
    const systemPrompt = CHAT_RESPONSE_PROMPT(
        context ? JSON.stringify(context, null, 2) : "",
        JSON.stringify(messages, null, 2),
    );

    const systemMessage: ChatMessage = {
        role: "system",
        content: systemPrompt,
    };

    const allMessages: ChatMessage[] = [systemMessage, ...messages];

    // Stream la réponse
    const streamGenerator = callLLMStream({
        messages: allMessages,
        model: "gpt-5",
        temperature: 0.7,
    });

    // Yield chaque chunk du stream
    for await (const chunk of streamGenerator) {
        yield chunk;
    }

    // Une fois le streaming terminé, retourne le contexte
    return context;
}

/**
 * Fonction principale qui combine les deux étapes
 */
export async function* processChatMessages(
    previousContext: PropertyInvestmentData | null,
    messages: ChatMessage[],
): AsyncGenerator<
    { type: "context"; data: PropertyInvestmentData } | { type: "chunk"; data: string },
    void,
    unknown
> {
    // Étape 1: Extraire le contexte JSON
    const context = await extractContextFromMessages(previousContext, messages);

    // Envoie le contexte extrait
    yield { type: "context", data: context };

    // Étape 2: Stream la réponse
    const streamGenerator = generateStreamingResponse(messages, context);

    for await (const chunk of streamGenerator) {
        yield { type: "chunk", data: chunk };
    }
}
