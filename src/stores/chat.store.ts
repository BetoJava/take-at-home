import { create } from "zustand";
import type { Message, PropertyInvestmentData } from "@/types";
import { chatService } from "@/services";

interface ChatStore {
  // State
  messages: Message[];
  isLoading: boolean;
  currentStreamingMessageId?: string;

  // Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, content: string) => void;
  startStreaming: (id: string) => void;
  stopStreaming: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  sendMessage: (content: string, propertyData: PropertyInvestmentData | null, onContextUpdate: (data: PropertyInvestmentData) => void) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  currentStreamingMessageId: undefined,

  // Actions
  addMessage: (message) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
    };
    
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
    
    return id;
  },

  updateMessage: (id, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    }));
  },

  startStreaming: (id) => {
    set((state) => ({
      currentStreamingMessageId: id,
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, isStreaming: true } : msg
      ),
    }));
  },

  stopStreaming: (id) => {
    set((state) => ({
      currentStreamingMessageId: undefined,
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, isStreaming: false } : msg
      ),
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  clearMessages: () => {
    set({
      messages: [],
      currentStreamingMessageId: undefined,
    });
  },

  sendMessage: async (content, propertyData, onContextUpdate) => {
    const { addMessage, updateMessage, startStreaming, stopStreaming, setLoading, messages } = get();

    // Ajouter le message utilisateur
    addMessage({
      role: "user",
      content,
    });

    // Créer le message assistant en streaming
    const assistantMessageId = addMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    });

    startStreaming(assistantMessageId);
    setLoading(true);

    try {
      // Préparer l'historique de la conversation
      const chatMessages = [...messages, { role: "user" as const, content }].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let accumulatedContent = "";

      // Appel au service de chat
      const stream = await chatService.sendMessage(chatMessages, propertyData);
      
      // Parser le stream
      for await (const result of chatService.parseStream(stream)) {
        if (result.type === "context") {
          // Mise à jour du contexte d'investissement
          onContextUpdate(result.data);
        } else if (result.type === "chunk") {
          // Mise à jour du message avec le nouveau chunk
          accumulatedContent += result.data;
          updateMessage(assistantMessageId, accumulatedContent);
        } else if (result.type === "done") {
          // Fin du streaming
          stopStreaming(assistantMessageId);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      updateMessage(
        assistantMessageId,
        "Désolé, une erreur s'est produite lors de la communication avec l'IA."
      );
      stopStreaming(assistantMessageId);
      setLoading(false);
    }
  },
}));

