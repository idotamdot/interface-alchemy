"use client";
import { useStudioAutosave } from "@/lib/use-studio-autosave";

import { useEffect, useRef, useState } from "react";
import { Activity, Orbit, Sparkles, Shuffle } from "lucide-react";
import { MessageList } from "./MessageList";
import { ScreenStylePreview } from "./ScreenStylePreview";
import { ColorSpiral } from "./ColorSpiral";
import { DesignPortfolio } from "./DesignPortfolio";
import { MessageInput } from "./MessageInput";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from "zod";
import { checkPalette, directionPrompt, seerResultSchema, type SeerResult } from "@/lib/seer-contract";
import { useChat } from "@/lib/contexts/chat-context";

export function ChatInterface({ openRequest = 0, motionPaused = false }: { openRequest?: number; motionPaused?: boolean }) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspace, setWorkspace] = useState<"directions" | number>("directions");
  const [explorations, setExplorations] = useState<Record<number, { seed: number; position: number }>>({});
  useEffect(() => { if (openRequest > 0) { setWorkspace("directions"); setWorkspaceOpen(true); } }, [openRequest]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { messages, input, setInput, handleInputChange, handleSubmit, status, append } =
    useChat();

  const [styleBrief, setStyleBrief] = useState(() => input.split("\n\nVisual direction:")[0]);
  const briefSeeded = useRef(Boolean(input));

  const [seerResults, setSeerResults] = useState<SeerResult[]>([]);
  const [seerLoading, setSeerLoading] = useState(false);
  const [seerError, setSeerError] = useState("");
  const [seerCount, setSeerCount] = useState(3);
  const [seerSource, setSeerSource] = useState("description");
  const [selectedDirection, setSelectedDirection] = useState("");
  const saveMessage = useStudioAutosave("design-directions", {styleBrief,seerResults,seerCount,seerSource,selectedDirection,explorations}, value => {if(value.styleBrief !== undefined){briefSeeded.current=true;setStyleBrief(value.styleBrief);}setSeerResults(value.seerResults);setSeerCount(value.seerCount);setSeerSource(value.seerSource);setSelectedDirection(value.selectedDirection);setExplorations(value.explorations);});
  useEffect(() => { if (!briefSeeded.current && input && /^(Workspace restored|Saved to)/.test(saveMessage)) { briefSeeded.current = true; setStyleBrief(input.split("\n\nVisual direction:")[0]); } }, [input, saveMessage]);
  const seerRequest = useRef<AbortController | null>(null);
  useEffect(() => () => seerRequest.current?.abort(), []);
  const askSeer = async () => {
    if (seerLoading) return;
    const controller = new AbortController();
    seerRequest.current = controller;
    setSeerLoading(true);
    setSeerError("");
    try {
      const base = styleBrief;
      const response = await fetch("/api/seer", { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief: seerSource === "pick" ? "" : base, count: seerCount }) });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "The Seer could not finish. Your draft is intact.");
      const parsed = z.object({ results: z.array(seerResultSchema).min(1).max(3) }).parse(data);
      setSeerResults(parsed.results);
      setExplorations({});
      setSelectedDirection("");
    } catch (error) {
      if (!controller.signal.aborted) setSeerError(error instanceof Error ? error.message : "The Seer could not finish. Your draft is intact.");
    } finally { if (!controller.signal.aborted) setSeerLoading(false); }
  };
  const chooseDirection = (result: SeerResult) => {
    const base = styleBrief;
    const output = `${base ? base + "\n\n" : "Design an interface.\n\n"}${directionPrompt(result)}`;
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
          <p className="mt-1 text-sm text-white/70">What should your screens look like?</p>
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
                  ? "Reading your visual direction"
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
        <Dialog open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
          <DialogTrigger asChild><button type="button" onClick={() => setWorkspace("directions")} className="m-4 min-h-12 rounded-full border border-lime-200/40 bg-lime-200/10 px-5 text-lg text-lime-100">Open design workspace</button></DialogTrigger>
          <DialogContent data-motion={motionPaused ? "paused" : "playing"} showCloseButton={false} className="inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-0 bg-[#241109] p-5 text-white sm:max-w-none sm:p-10">
            <header className="mx-auto mb-8 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4">
              <div><DialogTitle className="text-3xl sm:text-5xl">{workspace === "directions" ? "Find your design direction" : "Explore your color story"}</DialogTitle><DialogDescription className="mt-3 text-lg text-white/90">Create a visual style for your wireframes: colors, type, cards, textures and effects. Your draft stays here when you return.</DialogDescription></div>
              <DialogClose className="min-h-12 rounded-full border border-white/40 px-5 text-lg">Back to studio</DialogClose>
            </header>
            <div className="mx-auto w-full max-w-6xl">
            {workspace !== "directions" && <button type="button" onClick={() => setWorkspace("directions")} className="mb-6 min-h-12 rounded-full border border-white/40 px-5 text-lg">Back to directions</button>}
            <div hidden={workspace !== "directions"} aria-busy={seerLoading}>
              <p id="style-brief-help" className="mb-5 max-w-3xl text-lg leading-8 text-white/90">Start with a blank style canvas. Describe the appearance you want your wireframes to use. Try “dark chocolate background, amber glow, pink glass cards, bold readable type and gentle fades.”</p>
              <label className="mb-6 block text-lg font-semibold">Describe your visual style<textarea aria-describedby="style-brief-help" placeholder="Colors, mood, fonts, card shapes, textures and motion…" value={styleBrief} onChange={event => {briefSeeded.current=true;setStyleBrief(event.target.value);}} className="mt-3 min-h-36 w-full rounded-2xl border border-white/30 bg-white/10 p-5 text-lg leading-8 text-white" /></label>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-white/90">Starting point
              <select aria-label="Seer inspiration" value={seerSource} onChange={event => setSeerSource(event.target.value)} disabled={seerLoading || isSynthesizing} className="ml-2 min-h-11 rounded-lg bg-[#241109] px-2 text-white">
                <option value="description">Use my style description</option><option value="pick">Surprise me with a Seer pick</option>
              </select>
            </label>
            <label className="text-sm text-white/90">Designs to compare
              <select aria-label="Number of directions" value={seerCount} onChange={event => setSeerCount(Number(event.target.value))} disabled={seerLoading || isSynthesizing} className="ml-2 min-h-11 rounded-lg bg-[#241109] px-2 text-white">
                {[1, 2, 3].map(count => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <button type="button" onClick={askSeer} disabled={seerLoading || isSynthesizing || (seerSource === "description" && !styleBrief.trim())} className="flex min-h-12 items-center gap-2 rounded-full border border-lime-200/40 bg-lime-200 px-6 text-lg font-semibold text-[#241109] transition hover:bg-lime-100 disabled:opacity-50">
              <Shuffle className="h-4 w-4" aria-hidden="true" /> {seerLoading ? "Creating your style options…" : seerSource === "description" ? "Design my idea" : "Let the Seer surprise me"}
            </button>
          </div>
          <p role="status" className="mt-2 text-sm leading-6 text-white/90">{seerLoading ? "Proposing ideas, gathering a second opinion, and checking final palette contrast. Your draft stays intact." : selectedDirection ? `${selectedDirection} selected. Your original description stays unchanged.` : "Create up to three visual styles, then choose your favorite. Two AIs review each idea and check palette contrast."}</p>
          {seerError && <p role="alert" className="mt-2 text-base text-pink-100">{seerError}</p>}
          <p role="status" className="mt-3 text-base text-white/90">{saveMessage}</p>
          <DesignPortfolio onChoose={chooseDirection} />
          <div className="grid gap-6 2xl:grid-cols-2">
            {seerResults.map((result, index) => <article key={index} className="mt-3 rounded-3xl border border-white/30 bg-[linear-gradient(135deg,rgba(255,196,48,.14),rgba(255,91,157,.12),rgba(255,133,55,.14))] p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white">{index + 1}. {result.final.name}</h3>
              <details className="mt-3 text-base leading-7 text-white/90"><summary className="min-h-12 cursor-pointer py-3">About this style</summary><p>{result.final.direction}</p></details>
<button type="button" onClick={() => chooseDirection(result)} disabled={seerLoading || isSynthesizing} aria-label={`Choose this style: ${result.final.name}`} aria-pressed={selectedDirection === result.final.name} className="mt-4 min-h-12 w-full rounded-full border-2 border-lime-200 bg-lime-200 px-5 text-lg font-semibold text-[#241109] disabled:opacity-50">{selectedDirection === result.final.name ? "Selected" : "Choose this style"}<span className="sr-only">: {result.final.name}</span></button>
              <ScreenStylePreview direction={result.final} />
              <p className="mt-2 text-sm leading-6 text-white/90">{checkPalette(result.final.palette).map(check => `${check.pair}: ${check.ratio.toFixed(2)}:1`).join(" · ")}</p>
              {result.contrastCorrections?.length ? <p className="mt-2 text-sm text-lime-100">Contrast checks corrected {result.contrastCorrections.join(", ")} while preserving the chosen background and accent.</p> : null}
              <details className="mt-2 text-base leading-6 text-white/90"><summary className="min-h-11 cursor-pointer py-2">Idea, opinion & final choice</summary><p>OpenAI’s idea: {result.proposal.name}. {result.proposal.rationale}</p><p className="mt-2">Gemini’s opinion: {result.critique}</p><p className="mt-2">OpenAI’s final choice: {result.final.rationale}</p><p className="mt-2">These checks cover the solid palette pairs. The generated screen still needs a rendered accessibility review.</p></details>
              
              <button type="button" onClick={() => setWorkspace(index)} className="mt-3 min-h-12 rounded-full border border-pink-200/40 px-5 text-lg">Explore color spiral</button>
              <DesignPortfolio result={result} onChoose={chooseDirection} />
            </article>)}
          </div>
            </div>
            {seerResults.map((result, index) => <div key={index} hidden={workspace !== index}><ColorSpiral expanded exploration={explorations[index]} onExplore={value => setExplorations(current => ({ ...current, [index]: value }))} result={result} onChoose={chooseDirection} /></div>)}
            </div>
          </DialogContent>
        </Dialog>
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

