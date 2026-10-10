"use client";

import { useEffect, useRef } from "react";
import { Activity, Orbit, Sparkles } from "lucide-react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/contexts/chat-context";

export function ChatInterface() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, status, append } =
    useChat();

  const isSubmitted = status === "submitted";
  const isStreaming = status === "streaming";
  const isSynthesizing = isSubmitted || isStreaming;

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = messages.length > 0 ? scrollContainer.scrollHeight : 0;
      }
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(255,196,48,0.12),transparent_36%)]">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
            <Orbit className="h-3.5 w-3.5 text-amber-300" />
            The Conductor
          </div>
          <p className="mt-1 text-sm text-white/70">What are we creating?</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-orange-300/15 bg-orange-300/5 px-3 py-1.5 text-sm font-medium uppercase tracking-[0.16em] text-orange-100/70">
          <Activity className="h-3 w-3" />
          Intent online
        </div>
      </div>

      {isSynthesizing && (
        <div className="border-b border-white/8 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-orange-400/10 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <div className="absolute inset-1 animate-ping rounded-full border border-pink-300/25" />
              <Sparkles className="relative h-4 w-4 text-pink-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {isSubmitted
                  ? "Interpreting product intent"
                  : "Composing the interface"}
              </p>
              <p className="text-xs text-white/80">
                {isSubmitted
                  ? "Reading purpose, atmosphere, and structure."
                  : "Files and visual language are resolving in real time."}
              </p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-hidden">
        <div className="min-h-full pr-2">
          <MessageList
            messages={messages}
            isLoading={isStreaming}
            onSuggestionSelect={(text) =>
              append({ role: "user", content: text })
            }
          />
        </div>
      </ScrollArea>

      <div className="flex-shrink-0">
        <MessageInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isSynthesizing}
        />
      </div>
    </div>
  );
}

