"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useMemo } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface MessageInputProps {
  input: string;
  handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const ATMOSPHERE_WORDS = [
  "editorial",
  "ritualistic",
  "playful",
  "brutalist",
  "calm",
  "cinematic",
  "organic",
  "luminous",
  "minimal",
  "experimental",
] as const;

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: MessageInputProps) {
  const detectedAtmosphere = useMemo(
    () =>
      ATMOSPHERE_WORDS.filter((word) =>
        input.toLocaleLowerCase().includes(word)
      ),
    [input]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/[0.07] bg-[#241109]/72 p-3.5 backdrop-blur-2xl"
    >
      <div className="living-edge relative overflow-hidden rounded-[1.35rem] bg-white/[0.05] p-[1px] shadow-[0_20px_70px_rgba(0,0,0,0.34)]">
        <div className="relative overflow-hidden rounded-[calc(1.35rem-1px)] bg-[linear-gradient(180deg,rgba(15,15,23,.96),rgba(7,7,11,.98))] px-4 pb-3.5 pt-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_24%_0%,rgba(255,196,48,0.12),transparent_42%),radial-gradient(circle_at_78%_0%,rgba(255,133,55,0.09),transparent_40%)]" />

          <div className="relative mb-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.24em] text-amber-100/60">
              <Sparkles className="h-3 w-3 text-pink-200/80" aria-hidden="true" />
              Add to the potion
            </div>
            <span className="text-sm text-white/80">
              Enter to synthesize · Shift + Enter for depth
            </span>
          </div>

          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Tell me the feeling first. Then the purpose, material, motion, references, or anything you want the interface to become..."
            disabled={isLoading}
            className="relative min-h-[106px] max-h-[240px] w-full resize-none bg-transparent pr-14 text-base leading-7 text-white outline-none placeholder:text-white/80 disabled:cursor-wait disabled:opacity-60"
            rows={4}
            aria-label="Describe the visual direction to synthesize"
          />

          <div className="relative mt-3 flex min-h-7 flex-wrap items-center gap-2 pr-14">
            {detectedAtmosphere.length > 0 ? (
              detectedAtmosphere.map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-pink-200/15 bg-pink-300/[0.06] px-2.5 py-1 font-mono text-sm font-medium uppercase tracking-[0.17em] text-pink-100/70"
                >
                  {word}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/80">
                Mood words become part of the visual DNA.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="group absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[conic-gradient(from_220deg,#ffcf3d,#ff70aa,#ff963b,#e4ff68,#ffcf3d)] text-white shadow-[0_0_30px_rgba(255,196,48,0.24),0_8px_28px_rgba(0,0,0,0.3)] transition duration-300 hover:scale-105 hover:rotate-3 hover:shadow-[0_0_42px_rgba(255,133,55,0.25)] disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:scale-100 disabled:hover:rotate-0"
            aria-label={isLoading ? "Interface synthesis in progress" : "Synthesize interface"}
          >
            <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </form>
  );
}

