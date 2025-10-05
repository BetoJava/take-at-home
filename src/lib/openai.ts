import OpenAI from "openai";
import { env } from "@/env";
import type { ChatMessage } from "@/types";

/**
 * Client OpenAI singleton
 */
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      baseURL: env.OPENAI_API_BASE_URL,
      apiKey: env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Appelle LLM avec un prompt et des messages
 */
export async function callLLM({
  messages,
  model = "gpt-5",
  temperature = 0.7,
}: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}): Promise<string> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature,
  });

  return completion.choices[0]?.message?.content ?? "";
}

/**
 * Appelle LLM en mode streaming
 */
export async function* callLLMStream({
  messages,
  model = "gpt-5",
  temperature = 0.7,
}: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}): AsyncGenerator<string, void, unknown> {
  const client = getOpenAIClient();

  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
