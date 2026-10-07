"use client";

import { FormEvent, useState } from "react";
import { Mail, Send, Sparkles } from "lucide-react";
import { neonAuthClient } from "@/lib/neon-auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Status = "idle" | "sending" | "sent" | "error";

export function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async () => {
    setError(null);
    setStatus("sending");

    try {
      // Managed Better Auth resolves this relative callback through the app's
      // own auth proxy. Keeping it relative avoids baking a deployment hostname
      // into the magic link and matches Neon's documented Next.js flow.
      const result = await neonAuthClient.signIn.magicLink({
        email: email.trim().toLowerCase(),
        callbackURL: "/auth/complete",
      });

      if (result.error) {
        setError(result.error.message ?? "The access link could not be sent.");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The access link could not be sent.");
      setStatus("error");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMagicLink();
  };

  if (status === "sent") {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-acid-lime/70 bg-acid-lime/10 shadow-[0_0_34px_rgba(199,255,74,0.42)]">
          <Mail className="h-7 w-7 text-acid-lime drop-shadow-[0_0_10px_var(--acid-lime)]" />
        </div>
        <div>
          <p className="alchemy-kicker text-acid-lime">Studio key sent</p>
          <h3 className="mt-2 text-xl font-semibold text-hot-white">Check your email</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Open the secure link sent to <span className="text-hot-white">{email}</span>. It will return you to Interface Alchemy already signed in.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-signal-cyan/40 bg-signal-cyan/5 text-signal-cyan hover:bg-signal-cyan/15"
            onClick={() => setStatus("idle")}
          >
            Change email
          </Button>
          <Button
            type="button"
            className="flex-1 bg-acid-lime text-[#050507] shadow-[0_0_24px_rgba(199,255,74,0.35)] hover:bg-acid-lime/90"
            onClick={sendMagicLink}
          >
            Resend link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-electric-orchid drop-shadow-[0_0_10px_var(--electric-orchid)]" />
          <p className="text-sm leading-6 text-white/65">
            No password. Interface Alchemy sends one secure access link and creates your workspace the first time you enter.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="magic-email" className="text-hot-white">Email address</Label>
        <Input
          id="magic-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={status === "sending"}
          className="h-12 rounded-xl border-white/10 bg-black/30 text-hot-white shadow-[inset_0_1px_0_rgba(255,255,255,.025)] placeholder:text-white/25 focus-visible:border-signal-cyan/60 focus-visible:ring-signal-cyan/30"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-solar-coral/60 bg-solar-coral/10 px-4 py-3 text-sm text-solar-coral shadow-[0_0_22px_rgba(255,95,109,0.16)]">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "sending"}
        className="h-12 w-full rounded-xl bg-[linear-gradient(110deg,#7c3aed,#d946ef,#67e8f9)] text-hot-white shadow-[0_0_34px_rgba(139,92,246,0.24)] hover:brightness-110"
      >
        <Send className="h-4 w-4" />
        {status === "sending" ? "Sending access link…" : "Send secure access link"}
      </Button>
    </form>
  );
}
