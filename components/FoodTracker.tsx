"use client";

import Image from "next/image";
import { ensureSession } from "@/lib/auth";
import { saveFood, getFoodByDate } from "@/lib/food";
import { useCallback, useEffect, useState } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function FoodTracker() {
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState<boolean | null>(null);
  const [updated, setUpdated] = useState(false);
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [snack, setSnack] = useState("");
  const [dinner, setDinner] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureSession();
  }, []);

  const loadToday = useCallback(async () => {
    const today = todayDateString();
    setLoading(true);
    const { data, error } = await getFoodByDate(today);
    setLoading(false);
    if (!error && data) {
      setBreakfast(data.breakfast ?? "");
      setLunch(data.lunch ?? "");
      setSnack(data.snack ?? "");
      setDinner(data.dinner ?? "");
    }
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveOk(null);
    const { error, updated: wasUpdated } = await saveFood(
      breakfast.trim() || null,
      lunch.trim() || null,
      snack.trim() || null,
      dinner.trim() || null
    );
    setSaving(false);
    setSaveOk(!error);
    setUpdated(!!wasUpdated);
    if (error) console.error("Save food failed:", error);
  }, [breakfast, lunch, snack, dinner]);

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
        <h1 className="text-[32px] leading-[1.2] font-bold text-[#1a1a1a] tracking-tight max-w-md mx-auto mb-3">
          What did you eat today?
        </h1>
        <p className="text-[12px] leading-relaxed text-[#8b8b8b] max-w-sm mx-auto">
          Fuel your body, track your bites.
        </p>
        <div className="flex justify-center mb-3">
          <Image src="/food.png" alt="" width={120} height={120} className="h-[120px] w-[120px] object-contain" aria-hidden />
        </div>
      </section>

      <section className="flex-1 flex flex-col gap-4 py-2 pb-4 overflow-visible rotate-[360deg]">
        {loading ? (
          <p className="text-sm text-trakoo-muted">Loading…</p>
        ) : (
          <>
            <div>
              <label htmlFor="food-breakfast" className="block text-sm font-medium text-trakoo-text mb-1">
                Breakfast
              </label>
              <textarea
                id="food-breakfast"
                value={breakfast}
                onChange={(e) => setBreakfast(e.target.value)}
                placeholder="What did you have for breakfast?"
                rows={2}
                className="w-full soft-card px-3 py-2 text-sm text-trakoo-text placeholder:text-trakoo-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 resize-y min-h-[60px]"
              />
            </div>
            <div>
              <label htmlFor="food-lunch" className="block text-sm font-medium text-trakoo-text mb-1">
                Lunch
              </label>
              <textarea
                id="food-lunch"
                value={lunch}
                onChange={(e) => setLunch(e.target.value)}
                placeholder="What did you have for lunch?"
                rows={2}
                className="w-full soft-card px-3 py-2 text-sm text-trakoo-text placeholder:text-trakoo-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 resize-y min-h-[60px]"
              />
            </div>
            <div>
              <label htmlFor="food-snack" className="block text-sm font-medium text-trakoo-text mb-1">
                Snacks
              </label>
              <textarea
                id="food-snack"
                value={snack}
                onChange={(e) => setSnack(e.target.value)}
                placeholder="What did you have for snacks?"
                rows={2}
                className="w-full soft-card px-3 py-2 text-sm text-trakoo-text placeholder:text-trakoo-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 resize-y min-h-[60px]"
              />
            </div>
            <div>
              <label htmlFor="food-dinner" className="block text-sm font-medium text-trakoo-text mb-1">
                Dinner
              </label>
              <textarea
                id="food-dinner"
                value={dinner}
                onChange={(e) => setDinner(e.target.value)}
                placeholder="What did you have for dinner?"
                rows={2}
                className="w-full soft-card px-3 py-2 text-sm text-trakoo-text placeholder:text-trakoo-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 resize-y min-h-[60px]"
              />
            </div>
          </>
        )}
      </section>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="soft-pill px-8 py-3 font-semibold text-trakoo-text text-base disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
        >
          {saving ? "Saving…" : "Save meals"}
        </button>
        {saveOk === true && (
          <p className="text-sm text-trakoo-muted">
            {updated ? "Meals updated" : "Meals saved"}
          </p>
        )}
        {saveOk === false && (
          <p className="text-sm text-red-500">Couldn&apos;t save. Try again.</p>
        )}
      </div>

    </div>
  );
}
