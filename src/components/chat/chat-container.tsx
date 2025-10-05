"use client";

import { useChatStore } from "@/stores";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { MessageSuggestions } from "./message-suggestions";

export function ChatContainer() {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto px-4">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>
      </div>
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="py-4 max-w-4xl mx-auto px-4">
          {messages.length === 0 && <MessageSuggestions />}
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
