"use client";

import { MonthCalendar } from "@/components/MonthCalendar";
import { PeriodYearCalendar } from "@/components/PeriodYearCalendar";
import { CycleInsights } from "@/components/CycleInsights";
import { DayDetailsModal } from "@/components/DayDetailsModal";
import {
  togglePeriodDay,
  getPeriodDatesArray,
  getPeriodEntries,
} from "@/lib/period";
import { calculateCycleStats } from "@/lib/cycleUtils";
import { getDayData, type DayData } from "@/lib/dayData";
import { ensureSession } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export function PeriodTracker() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [savedDates, setSavedDates] = useState<string[]>([]);
  const [yearPeriodData, setYearPeriodData] = useState<Record<string, boolean>>({});
  const [periodDatesForInsights, setPeriodDatesForInsights] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState<boolean | null>(null);

  const hasUnsavedChanges =
    selectedDates.length !== savedDates.length ||
    selectedDates.some((d) => !savedDates.includes(d)) ||
    savedDates.some((d) => !selectedDates.includes(d));

  useEffect(() => {
    ensureSession();
  }, []);

  const fetchMonthDates = useCallback(async (year: number, month: number) => {
    const { data } = await getPeriodDatesArray(year, month);
    const list = data ?? [];
    setSelectedDates(list);
    setSavedDates(list);
  }, []);

  const fetchYearData = useCallback(async (year: number) => {
    const { data } = await getPeriodEntries(year);
    const map: Record<string, boolean> = {};
    (data ?? []).forEach((e) => {
      map[e.period_date] = true;
    });
    setYearPeriodData(map);
  }, []);

  const fetchAllPeriodDates = useCallback(async () => {
    const { data } = await getPeriodEntries();
    setPeriodDatesForInsights((data ?? []).map((e) => e.period_date));
  }, []);

  useEffect(() => {
    fetchMonthDates(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchMonthDates]);

  useEffect(() => {
    fetchYearData(now.getFullYear());
  }, [fetchYearData]);

  useEffect(() => {
    fetchAllPeriodDates();
  }, [fetchAllPeriodDates]);

  useEffect(() => {
    const refresh = () => {
      fetchMonthDates(currentYear, currentMonth);
      fetchYearData(now.getFullYear());
      fetchAllPeriodDates();
    };
    const onVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [currentYear, currentMonth, fetchMonthDates, fetchYearData, fetchAllPeriodDates]);

  const handleDateToggle = useCallback((date: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return Array.from(next);
    });
    setSaveOk(null);
  }, []);

  const handleSavePeriod = useCallback(async () => {
    const toAdd = selectedDates.filter((d) => !savedDates.includes(d));
    const toRemove = savedDates.filter((d) => !selectedDates.includes(d));
    if (toAdd.length === 0 && toRemove.length === 0) return;
    setSaving(true);
    setSaveOk(null);
    let ok = true;
    for (const date of toAdd) {
      const { error } = await togglePeriodDay(date);
      if (error) {
        console.error("Add period day failed:", error);
        ok = false;
      }
    }
    for (const date of toRemove) {
      const { error } = await togglePeriodDay(date);
      if (error) {
        console.error("Remove period day failed:", error);
        ok = false;
      }
    }
    setSaving(false);
    setSaveOk(ok);
    if (ok) {
      setSavedDates(selectedDates);
      setYearPeriodData((prev) => {
        const next = { ...prev };
        toAdd.forEach((d) => (next[d] = true));
        toRemove.forEach((d) => (next[d] = false));
        return next;
      });
      fetchAllPeriodDates();
    }
  }, [selectedDates, savedDates, fetchAllPeriodDates]);

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  }, []);

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

  const cycleStats = useMemo(
    () => calculateCycleStats(periodDatesForInsights),
    [periodDatesForInsights]
  );

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

      <section className="w-full text-center mb-6">
        <h1 className="text-[32px] leading-[1.2] font-bold text-[#1a1a1a] tracking-tight max-w-md mx-auto mb-3">
          Is it that time of the month?
        </h1>
        <p className="text-[12px] leading-relaxed text-[#8b8b8b] max-w-sm mx-auto">
          Tap the days when you had your period this month.
        </p>
      </section>

      <section className="flex-1 flex flex-col py-2 pb-4 overflow-visible">
        <MonthCalendar
          selectedDates={selectedDates}
          onDateToggle={handleDateToggle}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthChange={handleMonthChange}
        />
        <section className="mt-6">
          <CycleInsights stats={cycleStats} />
        </section>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleSavePeriod}
            disabled={saving || !hasUnsavedChanges}
            className="soft-pill px-8 py-3 font-semibold text-trakoo-text text-base disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
          >
            {saving ? "Saving…" : "Save period"}
          </button>
          {saveOk === true && <p className="text-sm text-trakoo-muted">Period saved</p>}
          {saveOk === false && (
            <p className="text-sm text-red-500">Couldn&apos;t save. Try again.</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <PeriodYearCalendar
          year={now.getFullYear()}
          periodData={yearPeriodData}
          onDayClick={handleDayClick}
        />
      </section>

      {selectedDate && dayData && !loadingDay && (
        <DayDetailsModal
          date={selectedDate}
          moodId={dayData.mood?.mood}
          poopType={dayData.poop?.type ?? undefined}
          illnessTypes={dayData.illness?.illness_types}
          food={dayData.food ?? undefined}
          hasPeriod={dayData.hasPeriod}
          notes={
            dayData.mood?.notes ??
            dayData.poop?.notes ??
            dayData.illness?.notes ??
            undefined
          }
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
