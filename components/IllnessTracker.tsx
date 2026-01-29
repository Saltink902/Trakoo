"use client";

import { IllnessChecklist } from "@/components/IllnessChecklist";
import { IllnessCalendar } from "@/components/IllnessCalendar";
import { DayDetailsModal } from "@/components/DayDetailsModal";
import { logIllness, getIllnessEntries } from "@/lib/illness";
import { getDayData, type DayData } from "@/lib/dayData";
import type { IllnessTypeId } from "@/lib/illness";
import { ensureSession } from "@/lib/auth";
import { useCallback, useEffect, useState } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export function IllnessTracker() {
  const [logging, setLogging] = useState(false);
  const [logOk, setLogOk] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<IllnessTypeId[]>([]);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [illnessData, setIllnessData] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    ensureSession();
  }, []);

  const fetchIllnessData = useCallback(async () => {
    const { data, error } = await getIllnessEntries(currentYear);
    if (!error && data) {
      const map: Record<string, string[]> = {};
      data.forEach((entry) => {
        if (entry.logged_at && entry.illness_types?.length) {
          const d = new Date(entry.logged_at);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const date = `${y}-${m}-${day}`;
          if (!map[date]) map[date] = [];
          entry.illness_types.forEach((id) => {
            if (!map[date].includes(id)) map[date].push(id);
          });
        }
      });
      setIllnessData(map);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchIllnessData();
  }, [fetchIllnessData]);

  useEffect(() => {
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") fetchIllnessData();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", fetchIllnessData);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", fetchIllnessData);
    };
  }, [fetchIllnessData]);

  const handleLog = useCallback(async () => {
    setLogging(true);
    setLogOk(null);
    const { error } = await logIllness(selected, notes.trim() || null);
    setLogging(false);
    setLogOk(!error);
    if (error) console.error("Log illness failed:", error);
    else fetchIllnessData();
  }, [selected, notes, fetchIllnessData]);

  const handleDayClick = useCallback(async (date: string) => {
    setSelectedDate(date);
    setLoadingDay(true);
    const { data, error } = await getDayData(date);
    setLoadingDay(false);
    if (!error && data) setDayData(data);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDate(null);
    setDayData(null);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-full min-w-full w-full max-w-[430px] mx-auto px-6 pt-4 pb-6 shrink-0">
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

      <section className="w-full text-center mb-8">
        <div className="text-[20px] mb-2 min-h-[1.5em]" aria-hidden="true" />
        <h1 className="text-[32px] leading-[1.2] font-bold text-[#1a1a1a] tracking-tight max-w-md mx-auto mb-3">
          What are you experiencing today?
        </h1>
        <p className="text-[12px] leading-relaxed text-[#8b8b8b] max-w-sm mx-auto">
          Track all symptoms and add notes for more details.
        </p>
      </section>

      <section className="flex-1 flex flex-col justify-center py-2 pb-4 overflow-visible">
        <IllnessChecklist
          selected={selected}
          onChange={setSelected}
          notes={notes}
          onNotesChange={setNotes}
          showNotes={showNotes}
          onToggleNotes={() => setShowNotes((v) => !v)}
        />
      </section>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleLog}
          disabled={logging}
          className="soft-pill px-8 py-3 font-semibold text-trakoo-text text-base disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
        >
          {logging ? "Logging…" : "Log illness"}
        </button>
        {logOk === true && <p className="text-sm text-trakoo-muted">Illness saved</p>}
        {logOk === false && <p className="text-sm text-red-500">Couldn&apos;t log. Try again.</p>}
      </div>

      <section className="mt-12">
        <IllnessCalendar
          year={currentYear}
          illnessData={illnessData}
          onDayClick={handleDayClick}
        />
      </section>

      <p className="mt-auto pt-6 text-center text-sm text-trakoo-muted">
        ← Swipe right for poop tracker
      </p>

      {selectedDate && dayData && !loadingDay && (
        <DayDetailsModal
          date={selectedDate}
          moodId={dayData.mood?.mood}
          poopType={dayData.poop?.type ?? undefined}
          notes={dayData.mood?.notes ?? dayData.poop?.notes ?? dayData.illness?.notes ?? undefined}
          illnessTypes={dayData.illness?.illness_types}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
