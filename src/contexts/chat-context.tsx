"use client";

import React, { createContext, useContext, useReducer, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { usePropertyInvestment } from "@/contexts/property-investment-context";
import type { PropertyInvestmentData } from "@/types";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentStreamingMessageId?: string;
}

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; content: string } }
  | { type: "START_STREAMING"; payload: { id: string } }
  | { type: "STOP_STREAMING"; payload: { id: string } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_MESSAGES" };

const initialState: ChatState = {
  messages: [],
  isLoading: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content }
            : msg,
        ),
      };
    case "START_STREAMING":
      return {
        ...state,
        currentStreamingMessageId: action.payload.id,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, isStreaming: true } : msg,
        ),
      };
    case "STOP_STREAMING":
      return {
        ...state,
        currentStreamingMessageId: undefined,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, isStreaming: false } : msg,
        ),
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: [],
        currentStreamingMessageId: undefined,
      };
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => string;
  updateMessage: (id: string, content: string) => void;
  startStreaming: (id: string) => void;
  stopStreaming: (id: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { data: propertyData, updateData: updatePropertyData } = usePropertyInvestment();

  const addMessage = (message: Omit<Message, "id" | "timestamp">): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
    };
    dispatch({ type: "ADD_MESSAGE", payload: newMessage });
    return id;
  };

  const updateMessage = (id: string, content: string) => {
    dispatch({ type: "UPDATE_MESSAGE", payload: { id, content } });
  };

  const startStreaming = (id: string) => {
    dispatch({ type: "START_STREAMING", payload: { id } });
  };

  const stopStreaming = (id: string) => {
    dispatch({ type: "STOP_STREAMING", payload: { id } });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const clearMessages = () => {
    dispatch({ type: "CLEAR_MESSAGES" });
  };

  const sendMessage = async (content: string) => {
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
      const messages = [...state.messages, { role: "user" as const, content }].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let accumulatedContent = "";

      // Appel à l'API de streaming
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          previousContext: propertyData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Impossible de lire la réponse");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const result = JSON.parse(line) as 
              | { type: "context"; data: PropertyInvestmentData }
              | { type: "chunk"; data: string }
              | { type: "done" };

            if (result.type === "context") {
              // Mise à jour du contexte d'investissement
              updatePropertyData(result.data);
            } else if (result.type === "chunk") {
              // Mise à jour du message avec le nouveau chunk
              accumulatedContent += result.data;
              updateMessage(assistantMessageId, accumulatedContent);
            } else if (result.type === "done") {
              // Fin du streaming
              stopStreaming(assistantMessageId);
              setLoading(false);
            }
          } catch (e) {
            // Ignorer les lignes mal formatées
            console.warn("Erreur parsing chunk:", e);
          }
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
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        addMessage,
        updateMessage,
        startStreaming,
        stopStreaming,
        setLoading,
        clearMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

