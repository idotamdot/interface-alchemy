"use client";

import { useEffect, useRef, useState } from "react";
import { useFileSystem } from "@/lib/contexts/file-system-context";
import {
  createImportMap,
  createPreviewHTML,
} from "@/lib/transform/jsx-transformer";
import { AlertCircle, Sparkles } from "lucide-react";

export function PreviewFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { getAllFiles, refreshTrigger } = useFileSystem();
  const [error, setError] = useState<string | null>(null);
  const [entryPoint, setEntryPoint] = useState<string>("/App.jsx");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const updatePreview = () => {
      try {
        const files = getAllFiles();

        if (files.size > 0 && error) {
          setError(null);
        }

        let foundEntryPoint = entryPoint;
        const possibleEntries = [
          "/App.jsx",
          "/App.tsx",
          "/index.jsx",
          "/index.tsx",
          "/src/App.jsx",
          "/src/App.tsx",
        ];

        if (!files.has(entryPoint)) {
          const found = possibleEntries.find((path) => files.has(path));
          if (found) {
            foundEntryPoint = found;
            setEntryPoint(found);
          } else if (files.size > 0) {
            const firstJSX = Array.from(files.keys()).find(
              (path) => path.endsWith(".jsx") || path.endsWith(".tsx")
            );
            if (firstJSX) {
              foundEntryPoint = firstJSX;
              setEntryPoint(firstJSX);
            }
          }
        }

        if (files.size === 0) {
          setError(isFirstLoad ? "firstLoad" : "No files to preview");
          return;
        }

        if (isFirstLoad) {
          setIsFirstLoad(false);
        }

        if (!foundEntryPoint || !files.has(foundEntryPoint)) {
          setError(
            "No React component found. Create an App.jsx or index.jsx file to get started."
          );
          return;
        }

        const { importMap, styles, errors } = createImportMap(files);
        const previewHTML = createPreviewHTML(foundEntryPoint, importMap, styles, errors);

        if (iframeRef.current) {
          const iframe = iframeRef.current;
          iframe.setAttribute(
            "sandbox",
            "allow-scripts allow-same-origin allow-forms"
          );
          iframe.srcdoc = previewHTML;
          setError(null);
        }
      } catch (err) {
        console.error("Preview error:", err);
        setError(err instanceof Error ? err.message : "Unknown preview error");
      }
    };

    updatePreview();
  }, [refreshTrigger, getAllFiles, entryPoint, error, isFirstLoad]);

  if (error) {
    if (error === "firstLoad") {
      return (
        <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#241109] p-8 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,196,48,0.13),transparent_26%),radial-gradient(circle_at_64%_60%,rgba(255,133,55,0.08),transparent_25%)]" />
          <div className="relative max-w-md text-center">
            <div className="relative mx-auto mb-7 h-20 w-20">
              <div className="absolute inset-[-18px] rounded-full border border-orange-100/[0.05]" />
              <div className="absolute inset-[-8px] rotate-12 rounded-[1.8rem] border border-pink-100/[0.06]" />
              <div className="living-edge absolute inset-0 rounded-[1.6rem] bg-white/[0.04] p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[calc(1.6rem-1px)] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_32%_32%,rgba(255,91,157,0.28),transparent_48%),radial-gradient(circle_at_76%_76%,rgba(255,133,55,0.2),transparent_44%),#08080d]">
                  <Sparkles className="h-7 w-7 text-white drop-shadow-[0_0_16px_rgba(255,133,55,0.4)]" aria-hidden="true" />
                </div>
              </div>
            </div>
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-orange-100/52">
              Empty stage
            </p>
            <h3 className="mt-3 text-[1.65rem] font-semibold leading-tight tracking-[-0.045em] text-white">
              Your visual language will appear here.
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/80">
              Give the composition chamber a feeling and a purpose. Screen Seer will resolve the first live surface on this stage.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center bg-[#08080d] p-8 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-300/20 bg-white/[0.04]">
            <AlertCircle className="h-7 w-7 text-[#ff6978]" aria-hidden="true" />
          </div>
          <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-[#ff6978]/75">
            Preview interrupted
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
            The potion could not resolve yet.
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/80">{error}</p>
          <p className="mt-2 text-xs text-white/80">
            Your work is safe. Refine the visual direction or repair the entry point.
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className="h-full w-full border-0 bg-white"
      title="Generated interface preview"
    />
  );
}

