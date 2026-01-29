"use client";

import Image from "next/image";
import { MOODS } from "@/components/MoodCarousel";
import { POOP_TYPES } from "@/components/PoopCarousel";
import { ILLNESS_TYPES } from "@/lib/illness";

export type DayFood = {
  breakfast?: string | null;
  lunch?: string | null;
  snack?: string | null;
  dinner?: string | null;
};

type DayDetailsProps = {
  date: string; // YYYY-MM-DD
  moodId?: number;
  poopType?: number;
  illnessTypes?: string[];
  food?: DayFood | null;
  hasPeriod?: boolean;
  notes?: string;
  onClose: () => void;
};

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], { dateStyle: "long" });
}

export function DayDetailsModal({ date, moodId, poopType, illnessTypes, food, hasPeriod, notes, onClose }: DayDetailsProps) {
  const mood = MOODS.find((m) => m.id === moodId);
  const poop = POOP_TYPES.find((p) => p.id === poopType);
  const illnessLabels = (illnessTypes ?? [])
    .map((id) => ILLNESS_TYPES.find((t) => t.id === id)?.label)
    .filter(Boolean) as string[];

  const hasFood = food && (food.breakfast || food.lunch || food.snack || food.dinner);
  const hasAnyData = moodId != null || poopType != null || (illnessLabels.length > 0) || !!hasFood || !!hasPeriod || !!notes;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-trakoo-text">
            {formatDisplayDate(date)}
          </h2>
        </div>
        
        {/* Content */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {!hasAnyData ? (
            <div className="text-center py-8 text-trakoo-muted space-y-2">
              <p>No entries for this day yet.</p>
              <p className="text-sm">If you just logged something, close and tap the day again to refresh.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mood Entry */}
              {mood && (
                <div className="soft-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">😊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-trakoo-text">Mood</h3>
                      <p className="text-sm text-trakoo-muted">{mood.label}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Poop Entry */}
              {poop && (
                <div className="soft-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">💩</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-trakoo-text">Poop</h3>
                      <p className="text-sm text-trakoo-muted">{poop.label}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Illness Entry */}
              {illnessLabels.length > 0 && (
                <div className="soft-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl" aria-hidden>🤒</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-trakoo-text">Illness</h3>
                      <p className="text-sm text-trakoo-muted">
                        {illnessLabels.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Period Entry */}
              {hasPeriod && (
                <div className="soft-card p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#FF6B6B" }}
                      aria-hidden
                    />
                    <div>
                      <h3 className="font-semibold text-trakoo-text">Period</h3>
                      <p className="text-sm text-trakoo-muted">Yes</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Food Entry */}
              {hasFood && (
                <div className="soft-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <Image src="/food.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" aria-hidden />
                    </div>
                    <h3 className="font-semibold text-trakoo-text">Food</h3>
                  </div>
                  <div className="space-y-2 text-sm text-trakoo-muted">
                    {food?.breakfast && <p><span className="font-medium text-trakoo-text">Breakfast:</span> {food.breakfast}</p>}
                    {food?.lunch && <p><span className="font-medium text-trakoo-text">Lunch:</span> {food.lunch}</p>}
                    {food?.snack && <p><span className="font-medium text-trakoo-text">Snacks:</span> {food.snack}</p>}
                    {food?.dinner && <p><span className="font-medium text-trakoo-text">Dinner:</span> {food.dinner}</p>}
                  </div>
                </div>
              )}

              {/* Notes */}
              {notes && (
                <div className="soft-card p-4">
                  <h3 className="font-semibold text-trakoo-text mb-2">Notes</h3>
                  <p className="text-sm text-trakoo-muted">{notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Close Button */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full soft-pill px-6 py-3 font-semibold text-trakoo-text text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
