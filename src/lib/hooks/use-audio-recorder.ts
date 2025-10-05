import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "processing";

interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<File | null>;
  recordingTime: number;
}

const MAX_RECORDING_TIME = 60000; // 60 secondes en ms

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Mono
          sampleRate: 20000, // Max 20kHz
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingState("recording");
      startTimeRef.current = Date.now();
      setRecordingTime(0);

      // Timer pour afficher le temps d'enregistrement
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setRecordingTime(Math.floor(elapsed / 1000));
      }, 1000);

      // Arrêt automatique après 1 minute
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_TIME);

    } catch (error) {
      console.error("Erreur lors du démarrage de l'enregistrement:", error);
      setRecordingState("idle");
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<File | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state !== "recording") {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });

        // Créer un fichier à partir du blob
        const extension = mediaRecorder.mimeType.includes("webm") ? "webm" : "mp4";
        const audioFile = new File(
          [audioBlob],
          `recording.${extension}`,
          { type: mediaRecorder.mimeType }
        );

        // Nettoyer les ressources
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        audioChunksRef.current = [];

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }

        setRecordingState("idle");
        setRecordingTime(0);

        resolve(audioFile);
      };

      mediaRecorder.stop();
    });
  }, []);

  return {
    recordingState,
    startRecording,
    stopRecording,
    recordingTime,
  };
}

