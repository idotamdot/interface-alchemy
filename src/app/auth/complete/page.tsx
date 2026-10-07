"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createProject } from "@/actions/create-project";
import { getProjects } from "@/actions/get-projects";
import { clearAnonWork, getAnonWorkData } from "@/lib/anon-work-tracker";

const SESSION_ATTEMPTS = 8;
const SESSION_RETRY_MS = 500;

type AuthStatusBody = {
  authenticated?: boolean;
  diagnostic?:
    | "SESSION_COOKIE_MISSING"
    | "SESSION_COOKIE_PRESENT_BUT_INVALID";
  authCookieNames?: string[];
  error?: string;
};

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForAuthenticatedAppUser() {
  let lastStatus = 0;
  let lastDiagnostic: AuthStatusBody["diagnostic"];
  let lastCookieNames: string[] = [];

  for (let attempt = 0; attempt < SESSION_ATTEMPTS; attempt += 1) {
    const response = await fetch("/api/auth/status", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });

    lastStatus = response.status;
    const body = (await response.json().catch(() => null)) as AuthStatusBody | null;

    if (response.ok && body?.authenticated) {
      return;
    }

    lastDiagnostic = body?.diagnostic;
    lastCookieNames = body?.authCookieNames ?? [];

    if (response.status >= 500) {
      throw new Error(
        body?.error === "AUTH_STATUS_FAILED"
          ? "Interface Alchemy could not validate the Neon session. Check the deployed Neon Auth environment configuration."
          : "Interface Alchemy could not validate your secure session."
      );
    }

    if (attempt < SESSION_ATTEMPTS - 1) {
      await wait(SESSION_RETRY_MS);
    }
  }

  if (lastStatus === 401) {
    if (lastDiagnostic === "SESSION_COOKIE_MISSING") {
      throw new Error(
        "The magic link returned to Interface Alchemy, but Neon did not set a session cookie. The callback exchange is failing before Interface Alchemy can sign you in."
      );
    }

    if (lastDiagnostic === "SESSION_COOKIE_PRESENT_BUT_INVALID") {
      const cookieDetail =
        lastCookieNames.length > 0
          ? ` Detected cookie: ${lastCookieNames.join(", ")}.`
          : "";
      throw new Error(
        `Neon set an authentication cookie, but Interface Alchemy could not validate the session.${cookieDetail}`
      );
    }
  }

  throw new Error("Interface Alchemy could not complete secure entry.");
}

export default function AuthCompletePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const completeEntry = async () => {
      try {
        const authError = new URLSearchParams(window.location.search).get("error");
        if (authError) {
          throw new Error(
            authError === "INVALID_TOKEN"
              ? "This secure link has expired or was already used. Request a new magic link."
              : "The secure link could not be verified. Request a new magic link and try again."
          );
        }

        await waitForAuthenticatedAppUser();

        const anonWork = getAnonWorkData();

        if (
          anonWork &&
          (anonWork.messages.length > 0 ||
            Object.keys(anonWork.fileSystemData).length > 1)
        ) {
          const project = await createProject({
            name: `Recovered synthesis ${new Date().toLocaleDateString()}`,
            messages: anonWork.messages,
            data: anonWork.fileSystemData,
          });
          clearAnonWork();
          router.replace(`/${project.id}`);
          return;
        }

        const projects = await getProjects();
        if (projects.length > 0) {
          router.replace(`/${projects[0].id}`);
          return;
        }

        const project = await createProject({
          name: `New Design #${~~(Math.random() * 100000)}`,
          messages: [],
          data: {},
        });
        router.replace(`/${project.id}`);
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Interface Alchemy could not complete secure entry."
          );
        }
      }
    };

    void completeEntry();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050507] px-6 text-hot-white">
      <div className="alchemy-grid pointer-events-none absolute inset-0 opacity-80" />
      <div className="alchemy-orb absolute left-1/4 top-1/4 h-80 w-80 bg-plasma-violet/45" />
      <div className="alchemy-orb absolute bottom-1/4 right-1/4 h-80 w-80 bg-signal-cyan/35" />

      <section className="alchemy-glass relative z-10 w-full max-w-md rounded-3xl border-electric-orchid/50 p-8 text-center shadow-[0_0_80px_rgba(139,92,246,0.3)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-signal-cyan/70 bg-signal-cyan/10 shadow-[0_0_32px_rgba(34,211,238,0.45)]">
          <Sparkles className="h-7 w-7 animate-pulse text-signal-cyan drop-shadow-[0_0_12px_var(--signal-cyan)]" />
        </div>
        <p className="alchemy-kicker mt-6">Studio unlocked</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          Opening your private studio
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Interface Alchemy is restoring your projects and any visual work
          created before sign-in.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-solar-coral/60 bg-solar-coral/10 px-4 py-3 text-sm text-solar-coral">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}
