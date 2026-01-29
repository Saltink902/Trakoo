"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const ITEM_SIZE = 92;
const GAP = 20;
const STEP = ITEM_SIZE + GAP;
const DRAG_THRESHOLD = 20;

export type MoodId = 1 | 2 | 3 | 4 | 5;

export type Mood = {
  id: MoodId;
  label: string;
  icon: string;
  bg: string; // Tailwind bg class e.g. "bg-[#e8a0a0]"
};

export const MOODS: Mood[] = [
  { id: 1, label: "Sad", icon: "/moods/sad.png", bg: "bg-[#a8c5e8]" },
  { id: 2, label: "Stressed", icon: "/moods/stressed.png", bg: "bg-[#c4a8e8]" },
  { id: 3, label: "Meh", icon: "/moods/meh.png", bg: "bg-[#a8e0b8]" },
  { id: 4, label: "Happy", icon: "/moods/happy.png", bg: "bg-[#e5d4a8]" },
  { id: 5, label: "Excited", icon: "/moods/excited.png", bg: "bg-[#e8a8c4]" },
];

type Props = {
  selectedMood: MoodId;
  onChange: (mood: MoodId) => void;
};

export function MoodCarousel({ selectedMood, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const initialIndex = Math.max(0, Math.min(MOODS.length - 1, selectedMood - 1));
  const [scroll, setScroll] = useState(initialIndex * STEP);
  const [dragStart, setDragStart] = useState<{ x: number; scroll: number } | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const didDragRef = useRef(false);
  const indexRef = useRef(initialIndex);
  const tapTargetIndexRef = useRef<number | null>(null);

  const maxScroll = (MOODS.length - 1) * STEP;
  const effectiveScroll = scroll + dragDelta;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const updateWidth = () => {
      const width = el.offsetWidth;
      setContainerWidth(width);
      setScroll(indexRef.current * STEP);
    };
    
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    updateWidth();
    
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const idx = selectedMood - 1;
    if (idx !== indexRef.current) {
      indexRef.current = idx;
      setScroll(idx * STEP);
    }
  }, [selectedMood]);

  const snapToNearest = useCallback(() => {
    const idx = Math.round(effectiveScroll / STEP);
    const clamped = Math.max(0, Math.min(MOODS.length - 1, idx));
    const target = clamped * STEP;
    setScroll(target);
    setDragDelta(0);
    setDragStart(null);
    const previousIndex = indexRef.current;
    indexRef.current = clamped;
    if (clamped !== previousIndex) {
      onChange((clamped + 1) as MoodId);
    }
  }, [effectiveScroll, onChange]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const el = containerRef.current;
      if (el) el.setPointerCapture(e.pointerId);
      setDragStart({ x: e.clientX, scroll });
      setDragDelta(0);
      didDragRef.current = false;
      const target = e.target as HTMLElement;
      const button = target.closest("[data-mood-index]");
      tapTargetIndexRef.current = button ? parseInt(button.getAttribute("data-mood-index") ?? "-1", 10) : null;
    },
    [scroll]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart) return;
      const dx = e.clientX - dragStart.x;
      if (Math.abs(dx) > DRAG_THRESHOLD) didDragRef.current = true;
      
      const raw = dragStart.scroll - dx;
      
      let effectiveRaw = raw;
      if (raw < 0) {
        effectiveRaw = raw * 0.3;
      } else if (raw > maxScroll) {
        effectiveRaw = maxScroll + (raw - maxScroll) * 0.3;
      }
      
      setDragDelta(effectiveRaw - dragStart.scroll);
    },
    [dragStart, maxScroll]
  );

  const onPointerUp = useCallback(() => {
    if (!dragStart) return;
    if (didDragRef.current) {
      snapToNearest();
    } else {
      const tappedIndex = tapTargetIndexRef.current;
      if (tappedIndex != null && tappedIndex >= 0 && tappedIndex < MOODS.length) {
        const idx = tappedIndex;
        const target = idx * STEP;
        setScroll(target);
        indexRef.current = idx;
        onChange((idx + 1) as MoodId);
      }
      setDragStart(null);
      setDragDelta(0);
    }
    didDragRef.current = false;
    tapTargetIndexRef.current = null;
  }, [dragStart, snapToNearest, onChange]);

  const onPointerCancel = useCallback(() => {
    if (dragStart) {
      snapToNearest();
    }
    didDragRef.current = false;
  }, [dragStart, snapToNearest]);

  const onItemClick = useCallback(
    (i: number) => {
      if (didDragRef.current) return;
      const target = i * STEP;
      setScroll(target);
      indexRef.current = i;
      onChange((i + 1) as MoodId);
    },
    [onChange]
  );

  const translateX = -effectiveScroll;
  const currentIndex = Math.max(0, Math.min(MOODS.length - 1, Math.round(effectiveScroll / STEP)));

  if (containerWidth === 0) {
    return (
      <div className="w-full flex flex-col items-center">
        <div ref={containerRef} className="w-full" style={{ height: ITEM_SIZE * 1.4 }} />
      </div>
    );
  }

  /* Center scale 1.4 * 72 = ~101px; need room so nothing clips */
  const carouselContentHeight = Math.ceil(ITEM_SIZE * 1.5);
  const carouselPaddingBlock = 20;
  const carouselLeftOffset = -2; // fine-tuned horizontal centering
  const carouselTopOffset = -16; // fine-tuned vertical positioning (top: 4px)

  return (
    <div className="w-full flex flex-col items-center overflow-visible">
      <div
        ref={containerRef}
        className="w-full select-none touch-none overflow-x-hidden overflow-y-visible relative"
        style={{ 
          touchAction: "none",
          minHeight: carouselContentHeight + carouselPaddingBlock * 2,
          paddingTop: carouselPaddingBlock,
          paddingBottom: carouselPaddingBlock + 16,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          className="flex flex-row items-center absolute"
          style={{
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: dragStart ? "none" : "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
            left: containerWidth / 2 - ITEM_SIZE / 2 + carouselLeftOffset,
            gap: GAP,
            height: carouselContentHeight,
            top: carouselPaddingBlock + carouselTopOffset,
          }}
        >
          {MOODS.map((m, i) => {
            // Calculate position of this emoji's center
            const itemCenterX = i * STEP + ITEM_SIZE / 2;
            // Distance from viewport center (which is at scroll position)
            const dist = (itemCenterX - effectiveScroll) / STEP;
            
            const absDist = Math.abs(dist);
            
            const scale = absDist < 0.5 
              ? 1.4 - absDist * 0.4
              : Math.max(0.7, 1 - (absDist - 0.5) * 0.3);
            
            const opacity = absDist < 0.5
              ? 1 - absDist * 0.2
              : Math.max(0.5, 0.9 - (absDist - 0.5) * 0.3);
            
            return (
              <button
                key={m.id}
                type="button"
                data-mood-index={i}
                className="flex-shrink-0 rounded-full bg-transparent flex items-center justify-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{
                  width: ITEM_SIZE,
                  height: ITEM_SIZE,
                  transform: `scale(${scale})`,
                  opacity: opacity,
                  transition: dragStart ? "none" : "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onClick={() => onItemClick(i)}
              >
                <Image
                  src={m.icon}
                  alt={m.label}
                  width={ITEM_SIZE}
                  height={ITEM_SIZE}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2">
        <span className="text-trakoo-text font-medium text-base">
          {MOODS[currentIndex]?.label ?? MOODS[0].label}
        </span>
      </div>
    </div>
  );
}
