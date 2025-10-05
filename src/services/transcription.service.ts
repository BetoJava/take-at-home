import type { TranscriptionResponse } from "@/types";

/**
 * Service pour gérer la transcription audio
 */
export class TranscriptionService {
  /**
   * Transcrit un fichier audio en texte
   */
  async transcribe(audioFile: File): Promise<string> {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la transcription");
    }

    const { text } = (await response.json()) as TranscriptionResponse;
    return text;
  }
}

export const transcriptionService = new TranscriptionService();

