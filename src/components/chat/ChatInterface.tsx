"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Orbit, Sparkles, Shuffle } from "lucide-react";
import { MessageList } from "./MessageList";
import { DesignPortfolio } from "./DesignPortfolio";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from "zod";
import { checkPalette, directionPrompt, seerResultSchema, type SeerResult } from "@/lib/seer-contract";
import { useChat } from "@/lib/contexts/chat-context";

export function ChatInterface() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, input, setInput, handleInputChange, handleSubmit, status, append } =
    useChat();

  const [seerResults, setSeerResults] = useState<SeerResult[]>([]);
  const [seerLoading, setSeerLoading] = useState(false);
  const [seerError, setSeerError] = useState("");
  const [seerCount, setSeerCount] = useState(3);
  const [seerSource, setSeerSource] = useState("description");
  const [selectedDirection, setSelectedDirection] = useState("");
  const seerDraft = useRef({ base: "", output: "" });
  const seerRequest = useRef<AbortController | null>(null);
  useEffect(() => () => seerRequest.current?.abort(), []);
  const askSeer = async () => {
    if (seerLoading) return;
    const controller = new AbortController();
    seerRequest.current = controller;
    setSeerLoading(true);
    setSeerError("");
    try {
      const base = input === seerDraft.current.output ? seerDraft.current.base : input;
      const response = await fetch("/api/seer", { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief: seerSource === "pick" ? "" : base, count: seerCount }) });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "The Seer could not finish. Your draft is intact.");
      const parsed = z.object({ results: z.array(seerResultSchema).min(1).max(3) }).parse(data);
      setSeerResults(parsed.results);
      setSelectedDirection("");
    } catch (error) {
      if (!controller.signal.aborted) setSeerError(error instanceof Error ? error.message : "The Seer could not finish. Your draft is intact.");
    } finally { if (!controller.signal.aborted) setSeerLoading(false); }
  };
  const chooseDirection = (result: SeerResult) => {
    const base = input === seerDraft.current.output ? seerDraft.current.base : input;
    const output = `${base ? base + "\n\n" : "Design an interface.\n\n"}${directionPrompt(result)}`;
    seerDraft.current = { base, output };
    setSelectedDirection(result.final.name);
    setInput(output);
  };

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
        <div className="max-h-[35dvh] overflow-y-auto border-t border-white/10 px-4 py-3" aria-busy={seerLoading}>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-white/90">Inspiration
              <select aria-label="Seer inspiration" value={seerSource} onChange={event => setSeerSource(event.target.value)} disabled={seerLoading || isSynthesizing} className="ml-2 min-h-11 rounded-lg bg-[#241109] px-2 text-white">
                <option value="description">My description</option><option value="pick">Seer pick</option>
              </select>
            </label>
            <label className="text-sm text-white/90">Options
              <select aria-label="Number of directions" value={seerCount} onChange={event => setSeerCount(Number(event.target.value))} disabled={seerLoading || isSynthesizing} className="ml-2 min-h-11 rounded-lg bg-[#241109] px-2 text-white">
                {[1, 2, 3].map(count => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <button type="button" onClick={askSeer} disabled={seerLoading || isSynthesizing} className="flex min-h-11 items-center gap-2 rounded-full border border-lime-200/40 bg-lime-200/10 px-4 text-base text-lime-100 transition hover:bg-lime-200/20 disabled:opacity-50">
              <Shuffle className="h-4 w-4" aria-hidden="true" /> {seerLoading ? "The Seer is considering…" : "Let the Seer choose"}
            </button>
          </div>
          <p role="status" className="mt-2 text-sm leading-6 text-white/90">{seerLoading ? "Proposing ideas, gathering a second opinion, and checking final palette contrast. Your draft stays intact." : selectedDirection ? `${selectedDirection} added to your draft. Review before synthesizing.` : "Two AIs propose, critique, and decide. Choose a direction to add to your draft."}</p>
          {seerError && <p role="alert" className="mt-2 text-base text-pink-100">{seerError}</p>}
          <DesignPortfolio onChoose={chooseDirection} />
          <div className="space-y-3">
            {seerResults.map((result, index) => <article key={index} className="mt-3 rounded-xl border border-white/25 p-3">
              <h3 className="text-lg font-semibold text-white">{index + 1}. {result.final.name}</h3>
              <p className="mt-2 text-base leading-6 text-white/90">{result.final.direction}</p>
              <div className="mt-3 rounded-lg border-2 p-3" style={{ backgroundColor: result.final.palette.background, color: result.final.palette.text, borderColor: result.final.palette.border }}>
                <p className="font-semibold">Your interface, clearly seen</p>
                <p style={{ color: result.final.palette.mutedText }}>Readable supporting text</p>
                <span className="mt-2 inline-block rounded-lg border-2 px-3 py-2" style={{ backgroundColor: result.final.palette.accent, color: result.final.palette.accentText, borderColor: result.final.palette.border }}>Example action</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/90">{checkPalette(result.final.palette).map(check => `${check.pair}: ${check.ratio.toFixed(2)}:1`).join(" · ")}</p>
              {result.contrastCorrections?.length ? <p className="mt-2 text-sm text-lime-100">Contrast checks corrected {result.contrastCorrections.join(", ")} while preserving the chosen background and accent.</p> : null}
              <details className="mt-2 text-base leading-6 text-white/90"><summary className="min-h-11 cursor-pointer py-2">Idea, opinion & final choice</summary><p>OpenAI’s idea: {result.proposal.name}. {result.proposal.rationale}</p><p className="mt-2">Gemini’s opinion: {result.critique}</p><p className="mt-2">OpenAI’s final choice: {result.final.rationale}</p><p className="mt-2">These checks cover the solid palette pairs. The generated screen still needs a rendered accessibility review.</p></details>
              <button type="button" onClick={() => chooseDirection(result)} disabled={seerLoading || isSynthesizing} aria-pressed={selectedDirection === result.final.name} className="mt-2 min-h-11 rounded-full border border-lime-200/40 bg-lime-200/10 px-4 text-base text-lime-100 disabled:opacity-50">Use {result.final.name}</button>
              <DesignPortfolio result={result} onChoose={chooseDirection} />
            </article>)}
          </div>
        </div>
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

