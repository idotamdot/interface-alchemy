"use client";
import { useState } from "react";
import { z } from "zod";
import { portfolioEntrySchema, type PortfolioEntry } from "@/lib/portfolio-contract";
import { directionSchema, type SeerResult } from "@/lib/seer-contract";
const button = "min-h-11 rounded-full border border-lime-200/40 bg-lime-200/10 px-4 text-base text-lime-100 disabled:opacity-50";
const communitySchema = z.object({ entries: z.array(z.object({ id: z.string(), final: directionSchema })).max(60) });
export function DesignPortfolio({ result, onChoose }: { result?: SeerResult; onChoose: (result: SeerResult) => void }) {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [community, setCommunity] = useState<z.infer<typeof communitySchema>["entries"]>([]);
  const [mode, setMode] = useState<"closed" | "private" | "community">("closed");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState<Record<string, boolean>>({});
  const request = async (body?: unknown, collection?: string) => {
    const response = await fetch(`/api/portfolio${collection === "community" ? "?collection=community" : ""}`, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The portfolio could not complete this request.");
    return data;
  };
  const load = async (collection: "private" | "community") => {
    setMode(collection); setBusy(true); setMessage("");
    try {
      const data = await request(undefined, collection);
      if (collection === "community") setCommunity(communitySchema.parse(data).entries);
      else setEntries(z.object({ entries: z.array(portfolioEntrySchema).max(100) }).parse(data).entries);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load designs."); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!result) return;
    setBusy(true); setMessage("");
    try { await request({ action: "save", result }); setMessage("Saved privately to your portfolio."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save design."); }
    finally { setBusy(false); }
  };
  const share = async (entry: PortfolioEntry, action: "donate" | "withdraw") => {
    setBusy(true); setMessage("");
    try {
      await request({ action, id: entry.id, ...(action === "donate" ? { consent: consent[entry.id] === true } : {}) });
      setEntries(current => current.map(item => item.id === entry.id ? { ...item, visibility: action === "donate" ? "community" : "private" } : item));
      setConsent(current => ({ ...current, [entry.id]: false }));
      setMessage(action === "donate" ? "Donated to the community. Your private copy is retained." : "Removed from community browsing. Existing copies may still be used.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update sharing."); }
    finally { setBusy(false); }
  };
  return <section aria-label="Design portfolio" className="mt-3 space-y-2 text-base text-white/90">
    <div className="flex flex-wrap gap-2">
      {result ? <><button type="button" className={button} disabled={busy} onClick={save}>Save to portfolio</button></> : <><button type="button" className={button} disabled={busy} onClick={() => load("private")}>My portfolio</button><button type="button" className={button} disabled={busy} onClick={() => load("community")}>Community portfolio</button></>}
      {mode !== "closed" && <button type="button" className={button} onClick={() => setMode("closed")}>Close portfolio</button>}
    </div>
    <p role="status">{busy ? "Opening your collection…" : message}</p>
    {mode === "private" && !busy && !message && entries.length === 0 && <p>Your portfolio is empty. Save a Seer direction to keep it for later.</p>}
    {mode === "community" && !busy && community.length === 0 && <p>No donated directions yet.</p>}
    {mode === "private" && entries.map(entry => <article key={entry.id} className="rounded-xl border border-white/25 p-3">
      <h4 className="text-lg font-semibold">{entry.result.final.name}</h4><p>{entry.result.final.direction}</p>
      <div className="mt-2 flex flex-wrap gap-2"><button type="button" className={button} disabled={busy} onClick={() => onChoose(entry.result)}>Use direction</button></div>
      {entry.visibility === "community" ? <button type="button" className={`${button} mt-2`} disabled={busy} onClick={() => share(entry, "withdraw")}>Withdraw donation</button> : <>
        <label className="mt-3 flex min-h-11 items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={consent[entry.id] === true} onChange={event => setConsent(current => ({ ...current, [entry.id]: event.target.checked }))} />I reviewed the direction above and have permission to share it and allow anyone to reuse and adapt it. Only the direction and palette become public; my brief and AI review stay private.</label>
        <button type="button" className={`${button} mt-2`} disabled={busy || !consent[entry.id]} onClick={() => share(entry, "donate")}>Donate to community</button>
      </>}
    </article>)}
    {mode === "community" && community.map(entry => <article key={entry.id} className="rounded-xl border border-white/25 p-3"><h4 className="text-lg font-semibold">{entry.final.name}</h4><p>{entry.final.direction}</p><button type="button" className={`${button} mt-2`} onClick={() => onChoose({ proposal: entry.final, critique: "Reused from the community portfolio; the original private review is not shared.", final: entry.final })}>Use community direction</button></article>)}
  </section>;
}
