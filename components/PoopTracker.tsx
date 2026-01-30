"use client";

import { PoopCarousel, type PoopId } from "@/components/PoopCarousel";
import { logPoop } from "@/lib/poop";
import { useCallback, useState } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export function PoopTracker() {
  const [logging, setLogging] = useState(false);
  const [logOk, setLogOk] = useState<boolean | null>(null);
  const [selectedPoop, setSelectedPoop] = useState<PoopId>(4);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const handlePoopChange = useCallback((poop: PoopId) => {
    setSelectedPoop(poop);
  }, []);

  const handleLog = useCallback(async () => {
    setLogging(true);
    setLogOk(null);
    const { error } = await logPoop(selectedPoop, notes.trim() || null);
    setLogging(false);
    setLogOk(!error);
    if (error) console.error("Log poop failed:", error);
  }, [selectedPoop, notes]);

  return (
    <div className="flex flex-col flex-1 min-h-full min-w-full w-full max-w-[430px] mx-auto px-6 pt-4 pb-6 shrink-0 h-[676px]">
      <header className="grid grid-cols-3 items-center gap-2 mb-8">
        <button
          type="button"
          className="w-12 h-12 rounded-full soft-pill flex items-center justify-center text-trakoo-text focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 place-self-start"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="soft-pill inline-flex items-center justify-center gap-1.5 px-3 py-1.5 place-self-center whitespace-nowrap">
          <span className="text-xs font-medium text-trakoo-text">{getGreeting()}</span>
          <span aria-hidden className="text-xs">☀️</span>
        </div>
        <div className="place-self-end" />
      </header>

      <section className="w-full text-center mb-12">
        <h1 className="text-[32px] leading-[1.2] font-bold text-[#1a1a1a] tracking-tight max-w-md mx-auto mb-3">
          What was your poop like today?
        </h1>
        <p className="text-[12px] leading-relaxed text-[#8b8b8b] max-w-sm mx-auto">
        Understanding your stool type can reveal insights about your gut health.
        </p>
      </section>

      <section className="flex-1 flex flex-col justify-center py-4 pb-6 overflow-visible">
        <PoopCarousel selectedPoop={selectedPoop} onChange={handlePoopChange} />
      </section>

      <div className="mt-2 flex flex-col items-center gap-2 w-full max-w-[320px] mx-auto">
        <button
          type="button"
          onClick={() => setShowNotes((v) => !v)}
          className="text-sm text-trakoo-text/80 hover:text-trakoo-text focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 rounded"
          aria-expanded={showNotes}
        >
          + notes
        </button>
        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add optional notes…"
            rows={3}
            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-trakoo-text placeholder:text-trakoo-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 resize-y min-h-[72px]"
          />
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleLog}
          disabled={logging}
          className="soft-pill px-8 py-3 font-semibold text-trakoo-text text-base disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 flex items-center justify-center gap-2"
        >
          <span aria-hidden>💩</span>
          {logging ? "Logging…" : "Save poop"}
        </button>
        {logOk === true && <p className="text-sm text-trakoo-muted">Poop saved</p>}
        {logOk === false && <p className="text-sm text-red-500">Couldn&apos;t log. Try again.</p>}
      </div>

    </div>
  );
}
