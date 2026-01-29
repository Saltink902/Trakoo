"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ILLNESS_TYPES, type IllnessTypeId } from "@/lib/illness";

type Props = {
  selected: IllnessTypeId[];
  onChange: (ids: IllnessTypeId[]) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  showNotes: boolean;
  onToggleNotes: () => void;
};

const ICON_SIZE = 80;
const FALLBACK_EMOJI: Record<IllnessTypeId, string> = {
  sick: "🤧",
  fever: "🤒",
  headache: "🤕",
  stomach_bug: "🐛",
  ulcer: "🫀",
  advil: "💊",
};

export function IllnessChecklist({
  selected,
  onChange,
  notes,
  onNotesChange,
  showNotes,
  onToggleNotes,
}: Props) {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const toggle = useCallback(
    (id: IllnessTypeId) => {
      if (selected.includes(id)) {
        onChange(selected.filter((x) => x !== id));
      } else {
        onChange([...selected, id]);
      }
    },
    [selected, onChange]
  );

  const handleError = useCallback((src: string) => {
    setFailedUrls((prev) => new Set(prev).add(src));
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mx-auto">
        {ILLNESS_TYPES.map((t) => {
          const isSelected = selected.includes(t.id);
          const useFallback = failedUrls.has(t.icon);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 bg-transparent transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-trakoo-text/30 rounded-full"
              aria-pressed={isSelected}
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-transparent ${
                  isSelected ? "ring-2 ring-trakoo-text/40" : ""
                }`}
              >
                {useFallback ? (
                  <span className="text-4xl" aria-hidden>
                    {FALLBACK_EMOJI[t.id]}
                  </span>
                ) : (
                  <Image
                    src={t.icon}
                    alt=""
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    className="w-full h-full object-contain"
                    unoptimized
                    priority
                    onError={() => handleError(t.icon)}
                  />
                )}
              </div>
              <span className="text-xs font-medium text-trakoo-text text-center leading-tight">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2 w-full max-w-[320px] mx-auto">
        <button
          type="button"
          onClick={onToggleNotes}
          className="text-sm text-trakoo-text/80 hover:text-trakoo-text focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 rounded"
          aria-expanded={showNotes}
        >
          + notes
        </button>
        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add optional notes…"
            rows={3}
            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-trakoo-text placeholder:text-trakoo-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 resize-y min-h-[72px]"
          />
        )}
      </div>
    </div>
  );
}
