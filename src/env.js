import { z } from "zod";
import 'dotenv/config';


const envSchema = z.object({
    OPENAI_API_BASE_URL: z.string().min(1).default("https://api.openai.com/v1"),
    OPENAI_API_AUDIO_BASE_URL: z.string().min(1).default("https://api.openai.com/v1"),
    OPENAI_API_EXTRACT_BASE_URL: z.string().min(1).default("https://api.openai.com/v1"),
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_API_AUDIO_KEY: z.string().min(1),
    MODEL_NAME: z.string().optional().default("gpt-4o"),
    EXTRACT_MODEL_NAME: z.string().optional().default("gpt-4o"),
});

export const env = envSchema.parse(process.env);