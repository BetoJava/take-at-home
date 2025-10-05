import { callLLM } from "./openai";
import { FIX_JSON_PROMPT } from "./prompts/fix-json";
import type { ChatMessage } from "@/types";

/**
 * Extrait un bloc JSON d'un texte qui contient ```json...```
 */
export function extractJsonBlock(text: string): string {
  // Cherche un bloc JSON entre ```json et ```
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonBlockRegex);

  if (!match?.[1]) {
    throw new Error("No JSON block found in text");
  }

  return match[1].trim();
}

/**
 * Parse le JSON et lance une erreur si invalide
 */
export function parseJson<T = unknown>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Extrait et parse un bloc JSON avec retry via GPT-5-mini si échec
 */
export async function extractAndParseJson<T = unknown>(
  text: string,
  maxRetries = 2,
): Promise<T> {
  let currentText = text;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Tente d'extraire le bloc JSON
      const jsonString = extractJsonBlock(currentText);

      // Tente de parser le JSON
      return parseJson<T>(jsonString);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si c'est le dernier essai, on lance l'erreur
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to extract valid JSON after ${maxRetries + 1} attempts: ${lastError.message}`,
        );
      }

      // Sinon, on demande à GPT-5-mini de corriger le JSON
      console.log(
        `Attempt ${attempt + 1} failed, asking GPT-5-mini to fix JSON...`,
      );

      const fixPrompt = FIX_JSON_PROMPT(currentText);
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: fixPrompt,
        },
      ];

      currentText = await callLLM({
        messages,
        model: "gpt-5-mini",
        temperature: 0.3, // Basse température pour plus de précision
      });
    }
  }

  // Ne devrait jamais arriver ici grâce à la logique ci-dessus
  throw lastError ?? new Error("Unknown error in extractAndParseJson");
}
