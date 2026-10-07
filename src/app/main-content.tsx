"use client";

import { useState } from "react";
import {
  Accessibility,
  Braces,
  Code2,
  Eye,
  Layers3,
  Monitor,
  Move3d,
  ScanSearch,
  Smartphone,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileSystemProvider } from "@/lib/contexts/file-system-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { FileTree } from "@/components/editor/FileTree";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeaderActions } from "@/components/HeaderActions";
import { ChatMessage, SerializedFileSystem } from "@/lib/data-schemas";
import { cn } from "@/lib/utils";

interface MainContentProps {
  user?: {
    id: string;
    email: string;
  } | null;
  project?: {
    id: string;
    name: string;
    messages: ChatMessage[];
    data: SerializedFileSystem;
    createdAt: Date;
    updatedAt: Date;
  };
}

type WorkspaceView = "preview" | "code";
type StageMode =
  | "live"
  | "structure"
  | "responsive"
  | "motion"
  | "accessibility"
  | "diff";
type Viewport = "desktop" | "mobile";

const stageModes: Array<{
  value: StageMode;
  label: string;
  icon: typeof Eye;
}> = [
  { value: "live", label: "Live", icon: Eye },
  { value: "structure", label: "Structure", icon: Layers3 },
  { value: "responsive", label: "Responsive", icon: Move3d },
  { value: "motion", label: "Motion", icon: Braces },
  { value: "accessibility", label: "Access", icon: Accessibility },
  { value: "diff", label: "Diff", icon: ScanSearch },
];

export function MainContent({ user, project }: MainContentProps) {
  const [activeView, setActiveView] = useState<WorkspaceView>("preview");
  const [stageMode, setStageMode] = useState<StageMode>("live");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const projectName = project?.name ?? "Untitled potion";
  const viewportWidth = viewport === "desktop" ? "100%" : "390px";

  return (
    <FileSystemProvider initialData={project?.data}>
      <ChatProvider projectId={project?.id} initialMessages={project?.messages}>
        <main className="alchemy-atmosphere relative h-screen w-screen overflow-hidden text-[#fbfbff]">
          <div className="alchemy-grid pointer-events-none absolute inset-0 opacity-70" />
          <div className="alchemy-stardust pointer-events-none absolute inset-0" />
          <div className="alchemy-veil pointer-events-none absolute inset-0" />
          <div className="alchemy-orb absolute -left-40 -top-20 h-[30rem] w-[30rem] bg-violet-600/[0.30]" />
          <div className="alchemy-orb absolute -right-48 top-[12%] h-[34rem] w-[34rem] bg-cyan-300/[0.20] [animation-delay:1.5s]" />
          <div className="alchemy-orb absolute bottom-[-13rem] left-[40%] h-[28rem] w-[28rem] bg-fuchsia-500/[0.18] [animation-delay:3s]" />

          <div className="relative z-10 flex h-full flex-col p-2.5 sm:p-4">
            <header className="alchemy-shell-bar mb-2.5 flex min-h-[4.35rem] items-center justify-between rounded-[1.4rem] px-3.5 sm:mb-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="alchemy-gem flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem]">
                  <WandSparkles className="h-5 w-5 text-white" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h1 className="alchemy-wordmark truncate text-[1.05rem] font-semibold tracking-[-0.045em] sm:text-[1.25rem]">
                      Interface Alchemy
                    </h1>
                    <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.22em] text-white/45 md:inline">
                      visual language engine
                    </span>
                  </div>
                  <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] text-white/40 sm:text-xs">
                    <span className="truncate">{projectName}</span>
                    <span className="hidden h-1 w-1 rounded-full bg-white/25 sm:inline" />
                    <span className="hidden text-white/28 sm:inline">
                      feeling → form → live interface
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-lime-300/15 bg-lime-300/[0.045] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-lime-100/70 lg:flex">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(199,255,74,0.85)]" />
                  </span>
                  synthesis online
                </div>
                <HeaderActions user={user} projectId={project?.id} />
              </div>
            </header>

            <section className="min-h-0 flex-1">
              <ResizablePanelGroup direction="horizontal" className="h-full gap-2.5 sm:gap-3.5">
                <ResizablePanel defaultSize={35} minSize={27} maxSize={48}>
                  <section className="alchemy-panel relative flex h-full flex-col overflow-hidden rounded-[1.45rem]">
                    <div className="alchemy-spectral-line absolute inset-x-8 top-0 h-px opacity-80" />
                    <div className="pointer-events-none absolute left-7 top-5 z-20 flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/32 backdrop-blur-xl">
                      <Sparkles className="h-2.5 w-2.5 text-fuchsia-200/70" aria-hidden="true" />
                      composition chamber
                    </div>
                    <div className="min-h-0 flex-1 pt-8">
                      <ChatInterface />
                    </div>
                  </section>
                </ResizablePanel>

                <ResizableHandle className="group relative w-1 bg-transparent after:absolute after:inset-y-10 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-white/[0.07] hover:after:bg-cyan-200/45" />

                <ResizablePanel defaultSize={65}>
                  <section className="alchemy-panel relative flex h-full flex-col overflow-hidden rounded-[1.45rem]">
                    <div className="alchemy-spectral-line absolute inset-x-10 top-0 h-px opacity-70" />

                    <div className="flex min-h-[4.2rem] shrink-0 items-center justify-between gap-4 border-b border-white/[0.07] px-4 sm:px-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="alchemy-kicker">The Stage</p>
                          <span className="rounded-full border border-cyan-200/10 bg-cyan-200/[0.04] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-cyan-100/45">
                            live material
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-white/36 sm:text-sm">
                          Watch the visual language become real.
                        </p>
                      </div>

                      <Tabs
                        value={activeView}
                        onValueChange={(value) => setActiveView(value as WorkspaceView)}
                      >
                        <TabsList className="h-10 rounded-xl border border-white/[0.08] bg-black/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <TabsTrigger
                            value="preview"
                            className="gap-2 rounded-lg px-3 text-[11px] text-white/40 data-[state=active]:border-white/10 data-[state=active]:bg-white/[0.08] data-[state=active]:text-cyan-50 data-[state=active]:shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            Stage
                          </TabsTrigger>
                          <TabsTrigger
                            value="code"
                            className="gap-2 rounded-lg px-3 text-[11px] text-white/40 data-[state=active]:border-white/10 data-[state=active]:bg-white/[0.08] data-[state=active]:text-violet-50 data-[state=active]:shadow-[0_0_24px_rgba(139,92,246,0.1)]"
                          >
                            <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Matter
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div className="relative min-h-0 flex-1 overflow-hidden bg-[#050507]/70">
                      {activeView === "preview" ? (
                        <div className="flex h-full flex-col p-2.5 sm:p-3.5">
                          <div className="mb-2.5 flex shrink-0 items-center justify-between gap-3 rounded-[1rem] border border-white/[0.07] bg-white/[0.025] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                            <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
                              {stageModes.map(({ value, label, icon: Icon }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setStageMode(value)}
                                  aria-pressed={stageMode === value}
                                  className={cn(
                                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] transition-all duration-200",
                                    stageMode === value
                                      ? "border-cyan-100/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(139,92,246,0.08))] text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.06)]"
                                      : "border-transparent text-white/32 hover:border-white/[0.05] hover:bg-white/[0.035] hover:text-white/65"
                                  )}
                                >
                                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span className="hidden xl:inline">{label}</span>
                                </button>
                              ))}
                            </div>

                            <div className="flex shrink-0 items-center rounded-lg border border-white/[0.07] bg-black/25 p-1">
                              <button
                                type="button"
                                onClick={() => setViewport("desktop")}
                                aria-label="Desktop viewport"
                                aria-pressed={viewport === "desktop"}
                                className={cn(
                                  "flex h-7 w-8 items-center justify-center rounded-md transition",
                                  viewport === "desktop"
                                    ? "bg-white/[0.09] text-white shadow-[0_0_16px_rgba(255,255,255,0.04)]"
                                    : "text-white/28 hover:text-white/65"
                                )}
                              >
                                <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setViewport("mobile")}
                                aria-label="Mobile viewport"
                                aria-pressed={viewport === "mobile"}
                                className={cn(
                                  "flex h-7 w-8 items-center justify-center rounded-md transition",
                                  viewport === "mobile"
                                    ? "bg-white/[0.09] text-white shadow-[0_0_16px_rgba(255,255,255,0.04)]"
                                    : "text-white/28 hover:text-white/65"
                                )}
                              >
                                <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          <div className="alchemy-stage-surface relative min-h-0 flex-1 overflow-hidden rounded-[1.15rem] p-3 sm:p-5">
                            <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:30px_30px]" />
                            <div className="pointer-events-none absolute left-6 top-6 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />
                            <div className="pointer-events-none absolute bottom-5 right-8 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl" />

                            <div
                              className={cn(
                                "relative mx-auto h-full transition-[width,transform,filter] duration-500 ease-out",
                                stageMode === "structure" && "ring-1 ring-cyan-200/25",
                                stageMode === "motion" && "scale-[0.992]",
                                stageMode === "accessibility" && "grayscale-[0.22] contrast-125",
                                stageMode === "diff" && "opacity-90 shadow-[18px_18px_0_rgba(217,70,239,0.08)]"
                              )}
                              style={{ width: viewportWidth }}
                            >
                              <div className="alchemy-stage-frame h-full overflow-hidden rounded-[1rem]">
                                <div className="h-full overflow-hidden rounded-[calc(1rem-1px)] bg-white">
                                  <PreviewFrame />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 flex shrink-0 items-center justify-between px-1 font-mono text-[9px] uppercase tracking-[0.17em] text-white/26">
                            <span>{stageMode} lens</span>
                            <span>
                              {viewport === "desktop" ? "fluid canvas" : "390px responsive"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <ResizablePanelGroup direction="horizontal" className="h-full">
                          <ResizablePanel defaultSize={28} minSize={20} maxSize={46}>
                            <div className="h-full border-r border-white/[0.07] bg-black/20">
                              <div className="border-b border-white/[0.07] px-4 py-3.5">
                                <p className="alchemy-kicker">The Matter</p>
                                <p className="mt-1 text-[11px] text-white/30">Files behind the potion</p>
                              </div>
                              <div className="h-[calc(100%-62px)]">
                                <FileTree />
                              </div>
                            </div>
                          </ResizablePanel>

                          <ResizableHandle className="w-px bg-white/[0.07] hover:bg-violet-300/50" />

                          <ResizablePanel defaultSize={72}>
                            <div className="h-full bg-[#07070b]">
                              <CodeEditor />
                            </div>
                          </ResizablePanel>
                        </ResizablePanelGroup>
                      )}
                    </div>
                  </section>
                </ResizablePanel>
              </ResizablePanelGroup>
            </section>
          </div>
        </main>
      </ChatProvider>
    </FileSystemProvider>
  );
}
