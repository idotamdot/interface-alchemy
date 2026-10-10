"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Sparkles, User, WandSparkles } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onSuggestionSelect?: (text: string) => void;
}

const STARTER_PROMPTS = [
  {
    label: "Luminous",
    text: "Create a luminous biotech dashboard with calm precision",
  },
  {
    label: "Ceremonial",
    text: "Design an occult editorial archive with ceremonial motion",
  },
  {
    label: "Tactile",
    text: "Build a playful learning app that feels tactile and alive",
  },
  {
    label: "Cinematic",
    text: "Shape a cinematic booking interface with dramatic restraint",
  },
] as const;

export function MessageList({
  messages,
  isLoading,
  onSuggestionSelect,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-5 pb-8 pt-14 text-center">
        <div className="relative mb-7">
          <div className="absolute -inset-6 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute -inset-3 rounded-full border border-orange-100/[0.05]" />
          <div className="absolute -inset-1.5 rotate-6 rounded-[1.75rem] border border-pink-100/[0.06]" />
          <div className="living-edge relative rounded-[1.65rem] bg-white/[0.05] p-[1px]">
            <div className="relative flex h-[4.8rem] w-[4.8rem] items-center justify-center overflow-hidden rounded-[calc(1.65rem-1px)] bg-[#2c160d]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.16),transparent_23%),radial-gradient(circle_at_32%_32%,rgba(255,91,157,0.34),transparent_46%),radial-gradient(circle_at_78%_78%,rgba(255,133,55,0.24),transparent_42%)]" />
              <WandSparkles className="relative h-7 w-7 text-white drop-shadow-[0_0_18px_rgba(232,121,249,0.45)]" aria-hidden="true" />
            </div>
          </div>
        </div>

        <p className="alchemy-kicker">Start with a feeling</p>
        <h2 className="mt-3 max-w-[31rem] text-balance text-[1.8rem] font-semibold leading-[1.08] tracking-[-0.05em] text-white sm:text-[2.15rem]">
          Turn atmosphere into an interface.
        </h2>
        <p className="mt-3 max-w-[30rem] text-pretty text-sm leading-6 text-white/42">
          Describe the purpose, the mood, the energy, the material. Screen Seer will turn that intent into a live visual language.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["purpose", "atmosphere", "material", "motion"].map((item) => (
            <span
              key={item}
              className="alchemy-rune rounded-full px-2.5 py-1 font-mono text-sm uppercase tracking-[0.2em] text-white/80"
            >
              {item}
            </span>
          ))}
        </div>

        {onSuggestionSelect && (
          <div className="mt-8 grid w-full max-w-[35rem] gap-2.5 sm:grid-cols-2">
            {STARTER_PROMPTS.map(({ label, text }) => (
              <button
                key={text}
                type="button"
                onClick={() => onSuggestionSelect(text)}
                className="group relative overflow-hidden rounded-[1.15rem] border border-white/[0.08] bg-white/[0.025] p-3.5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-orange-100/15 hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200/50"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,133,55,0.06),transparent_42%)] opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative mb-2 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.21em] text-amber-100/42 group-hover:text-orange-100/65">
                  <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                  {label}
                </span>
                <span className="relative block text-[13px] leading-5 text-white/58 transition-colors group-hover:text-white/82">
                  {text}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {messages.map((message) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="living-edge rounded-xl bg-white/[0.05] p-[1px]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[calc(0.75rem-1px)] bg-[#09090e]">
                    <Bot className="h-4 w-4 text-pink-100" aria-hidden="true" />
                  </div>
                </div>
              </div>
            )}

            <div
              className={cn(
                "flex max-w-[86%] flex-col gap-2",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-[1.15rem] px-4 py-3 text-sm leading-6 shadow-[0_16px_42px_rgba(0,0,0,0.18)]",
                  message.role === "user"
                    ? "border border-amber-200/15 bg-[linear-gradient(135deg,rgba(124,58,237,0.72),rgba(255,91,157,0.48))] text-white"
                    : "border border-white/[0.08] bg-white/[0.04] text-white/84 backdrop-blur-xl"
                )}
              >
                {message.parts ? (
                  <>
                    {message.parts.map((part, partIndex) => {
                      switch (part.type) {
                        case "text":
                          return message.role === "user" ? (
                            <span key={partIndex} className="whitespace-pre-wrap">
                              {part.text}
                            </span>
                          ) : (
                            <MarkdownRenderer
                              key={partIndex}
                              content={part.text}
                              className="prose-sm prose-invert"
                            />
                          );
                        case "reasoning":
                          return (
                            <div
                              key={partIndex}
                              className="mt-3 rounded-xl border border-white/[0.08] bg-black/20 p-3"
                            >
                              <span className="mb-1 block font-mono text-sm uppercase tracking-[0.18em] text-orange-100/55">
                                Design reasoning
                              </span>
                              <span className="text-sm text-white/62">
                                {part.reasoning}
                              </span>
                            </div>
                          );
                        case "tool-invocation": {
                          const tool = part.toolInvocation;
                          const isComplete = tool.state === "result" && tool.result;
                          return (
                            <div
                              key={partIndex}
                              className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/25 px-3 py-1.5 font-mono text-sm text-white/58"
                            >
                              {isComplete ? (
                                <div className="h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(217,255,114,0.7)]" />
                              ) : (
                                <Loader2 className="h-3 w-3 animate-spin text-orange-300" />
                              )}
                              <span>{tool.toolName}</span>
                            </div>
                          );
                        }
                        case "source":
                          return (
                            <div key={partIndex} className="mt-2 text-xs text-white/38">
                              Source: {JSON.stringify(part.source)}
                            </div>
                          );
                        case "step-start":
                          return partIndex > 0 ? (
                            <hr key={partIndex} className="my-3 border-white/[0.08]" />
                          ) : null;
                        default:
                          return null;
                      }
                    })}
                    {isLoading &&
                      message.role === "assistant" &&
                      messages.indexOf(message) === messages.length - 1 && (
                        <div className="mt-3 flex items-center gap-2 text-orange-100/55">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="font-mono text-sm uppercase tracking-[0.16em]">
                            Resolving the potion
                          </span>
                        </div>
                      )}
                  </>
                ) : message.content ? (
                  message.role === "user" ? (
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  ) : (
                    <MarkdownRenderer
                      content={message.content}
                      className="prose-sm prose-invert"
                    />
                  )
                ) : isLoading &&
                  message.role === "assistant" &&
                  messages.indexOf(message) === messages.length - 1 ? (
                  <div className="flex items-center gap-2 text-orange-100/55">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="font-mono text-sm uppercase tracking-[0.16em]">
                      Resolving the potion
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] shadow-[0_0_24px_rgba(255,255,255,0.05)]">
                  <User className="h-4 w-4 text-white/80" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

