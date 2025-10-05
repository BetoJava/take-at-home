"use client";

import { useState, useRef } from "react";
import { useChatStore, usePropertyStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks";
import { transcriptionService } from "@/services";
import { toast } from "sonner";

export function ChatInput() {
  const sendMessage = useChatStore((state) => state.sendMessage);
  const isLoading = useChatStore((state) => state.isLoading);
  const propertyData = usePropertyStore((state) => state.data);
  const updatePropertyData = usePropertyStore((state) => state.updateData);
  
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { recordingState, startRecording, stopRecording, recordingTime } = useAudioRecorder();
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // Vider l'input immédiatement
    const messageContent = input.trim();
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Envoyer le message
    await sendMessage(messageContent, propertyData, updatePropertyData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  const handleAudioRecording = async () => {
    if (recordingState === "idle") {
      try {
        await startRecording();
        toast.info("Enregistrement en cours... (max 1 minute)");
      } catch (error) {
        console.error("Erreur lors du démarrage de l'enregistrement:", error);
        toast.error("Impossible d'accéder au microphone");
      }
    } else if (recordingState === "recording") {
      try {
        setIsTranscribing(true);
        const audioFile = await stopRecording();

        if (!audioFile) {
          toast.error("Erreur lors de l'arrêt de l'enregistrement");
          setIsTranscribing(false);
          return;
        }

        // Utiliser le service de transcription
        const text = await transcriptionService.transcribe(audioFile);

        // Ajouter la transcription à la suite du texte existant
        setInput(prevInput => {
          const separator = prevInput.trim() ? " " : "";
          return prevInput + separator + text;
        });
        toast.success("Audio transcrit avec succès");

        // Focus sur le textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
          adjustTextareaHeight();
        }
      } catch (error) {
        console.error("Erreur lors de la transcription:", error);
        toast.error("Erreur lors de la transcription de l'audio");
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 ">
      {/* Zone de saisie */}
      <div className="relative flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre message..."
            className={cn(
              "min-h-[44px] resize-none pr-12",
              "focus-visible:ring-1 focus-visible:ring-ring"
            )}
            style={{ height: "44px" }}
          />
          
          {/* Boutons d'actions */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Bouton d'enregistrement audio */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                recordingState === "recording" && "text-red-500 hover:text-red-600"
              )}
              onClick={handleAudioRecording}
              disabled={isTranscribing || isLoading}
              title={
                recordingState === "recording"
                  ? `Arrêter l'enregistrement (${recordingTime}s)`
                  : "Enregistrer un message vocal"
              }
            >
              {recordingState === "recording" ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Bouton d'envoi */}
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isLoading || recordingState === "recording" || isTranscribing}
          className="h-11 w-11 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
