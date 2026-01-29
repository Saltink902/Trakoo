"use client";

import { MoodCarousel, type MoodId } from "@/components/MoodCarousel";
import { YearCalendar } from "@/components/YearCalendar";
import { DayDetailsModal } from "@/components/DayDetailsModal";
import { saveMood, getMoodEntries } from "@/lib/mood";
import { getDayData, type DayData } from "@/lib/dayData";
import { useCallback, useEffect, useState } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export function MoodDashboard() {
  const [selectedMood, setSelectedMood] = useState<MoodId>(3);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState<boolean | null>(null);
  const [moodData, setMoodData] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [dayError, setDayError] = useState<unknown>(null);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const currentYear = new Date().getFullYear();

  const fetchMoodData = useCallback(async () => {
    const { data, error } = await getMoodEntries(currentYear);
    if (error) {
      if (process.env.NODE_ENV === "development") console.error("[MoodDashboard] getMoodEntries error:", error);
      return;
    }
    if (data) {
      const moodMap: Record<string, number> = {};
      data.forEach((entry) => {
        if (entry.created_at) {
          const d = new Date(entry.created_at);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const date = `${y}-${m}-${day}`;
          if (!moodMap[date]) moodMap[date] = entry.mood;
        }
      });
      setMoodData(moodMap);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  useEffect(() => {
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") fetchMoodData();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", fetchMoodData);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", fetchMoodData);
    };
  }, [fetchMoodData]);

  const persistMood = useCallback(async (mood: MoodId) => {
    setSaving(true);
    setSaveOk(null);
    const { error } = await saveMood(mood, notes.trim() || null);
    setSaving(false);
    setSaveOk(!error);
    if (error) {
      console.error("Save mood failed:", error);
    } else {
      fetchMoodData();
    }
  }, [fetchMoodData, notes]);

  const handleMoodChange = useCallback((mood: MoodId) => {
    setSelectedMood(mood);
  }, []);

  const handleSaveClick = useCallback(() => {
    persistMood(selectedMood);
  }, [selectedMood, persistMood]);

  const handleDayClick = useCallback(async (date: string) => {
    setSelectedDate(date);
    setDayError(null);
    setDayData(null);
    setLoadingDay(true);
    const { data, error } = await getDayData(date);
    setLoadingDay(false);
    if (error) {
      setDayError(error);
      if (process.env.NODE_ENV === "development") console.error("[MoodDashboard] getDayData error:", error);
      return;
    }
    setDayData(data ?? null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDate(null);
    setDayData(null);
    setDayError(null);
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
        <div className="soft-pill inline-flex items-center justify-center gap-1.5 px-3 py-1.5 place-self-center">
          <span className="text-xs font-medium text-trakoo-text">{getGreeting()}</span>
          <span aria-hidden className="text-xs">☀️</span>
        </div>
        <div className="place-self-end" />
      </header>

      <section className="w-full text-center mb-12">
        <p className="text-[20px] text-black mb-2 font-normal">
          Hello Sally,
        </p>
        <h1 className="text-[32px] leading-[1.2] font-bold text-[#1a1a1a] tracking-tight max-w-md mx-auto mb-3">
          How are you really feeling today?
        </h1>
        <p className="text-[15px] leading-relaxed text-[#8b8b8b] max-w-sm mx-auto">
          Take a moment to reflect on your emotions and assess your mood today.
        </p>
      </section>

      <section className="flex-1 flex flex-col justify-center py-4 pb-6 overflow-visible">
        <MoodCarousel selectedMood={selectedMood} onChange={handleMoodChange} />
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
          onClick={handleSaveClick}
          disabled={saving}
          className="soft-pill px-8 py-3 font-semibold text-trakoo-text text-base disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
        >
          {saving ? "Saving…" : "Save mood"}
        </button>
        {saveOk === true && <p className="text-sm text-trakoo-muted">Mood saved</p>}
        {saveOk === false && <p className="text-sm text-red-500">Couldn&apos;t save. Try again.</p>}
      </div>

      {/* Year Calendar */}
      <section className="mt-12">
        <YearCalendar 
          year={currentYear} 
          moodData={moodData}
          onDayClick={handleDayClick}
        />
      </section>

      <p className="mt-auto pt-6 text-center text-sm text-trakoo-muted">
        Swipe left for poop tracker →
      </p>

      {/* Day Details Modal */}
      {selectedDate && !loadingDay && !!(dayData || dayError) && (
        !!dayError ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}>
            <div
              className="w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl px-6 py-6"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-center text-red-500 mb-4">Couldn&apos;t load day data. You may need to sign in.</p>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full soft-pill px-6 py-3 font-semibold text-trakoo-text text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
              >
                Close
              </button>
            </div>
          </div>
        ) : dayData ? (
          <DayDetailsModal
            date={selectedDate}
            moodId={dayData.mood?.mood}
            poopType={dayData.poop?.type ?? undefined}
            illnessTypes={dayData.illness?.illness_types}
            notes={dayData.mood?.notes ?? dayData.poop?.notes ?? dayData.illness?.notes ?? undefined}
            onClose={handleCloseModal}
          />
        ) : null
      )}
    </div>
  );
}
