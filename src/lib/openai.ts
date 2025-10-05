import OpenAI from "openai";
import { env } from "@/env";
import type { ChatMessage } from "@/types";


let openaiClient: OpenAI | null = null;
let openaiAudioClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            baseURL: env.OPENAI_API_BASE_URL,
            apiKey: env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
}

export function getOpenAIAudioClient(): OpenAI {
    if (!openaiAudioClient) {
        openaiAudioClient = new OpenAI({
            baseURL: env.OPENAI_API_AUDIO_BASE_URL,
            apiKey: env.OPENAI_API_AUDIO_KEY,
        });
    }
    return openaiAudioClient;
}

/**
 * Appelle LLM avec un prompt et des messages
 */
export async function callLLM({
    messages,
    model = env.MODEL_NAME,
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
    });

    return completion.choices[0]?.message?.content ?? "";
}

/**
 * Appelle LLM en mode streaming
 */
export async function* callLLMStream({
    messages,
    model = env.MODEL_NAME,
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
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            yield content;
        }
    }
}

/**
 * Transcrit un fichier audio en texte avec Whisper
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
    const client = getOpenAIAudioClient();

    const transcription = await client.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3-turbo",
    });

    return transcription.text;
}
