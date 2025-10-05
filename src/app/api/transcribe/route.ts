import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Aucun fichier audio fourni" },
        { status: 400 }
      );
    }

    const text = await transcribeAudio(audioFile);

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Erreur lors de la transcription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la transcription" },
      { status: 500 }
    );
  }
}

