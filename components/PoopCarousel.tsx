"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const ITEM_SIZE = 92;
const GAP = 20;
const STEP = ITEM_SIZE + GAP;
const DRAG_THRESHOLD = 20;

export type PoopId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type PoopType = {
  id: PoopId;
  label: string;
  icon: string;
};

export const POOP_TYPES: PoopType[] = [
  { id: 0, label: "Constipation (no poop)", icon: "/poop/poop0.png" },
  { id: 1, label: "Very constipated", icon: "/poop/poop1.png" },
  { id: 2, label: "Constipated", icon: "/poop/poop2.png" },
  { id: 3, label: "Normal (hard)", icon: "/poop/poop3.png" },
  { id: 4, label: "Normal (soft)", icon: "/poop/poop4.png" },
  { id: 5, label: "Soft blobs", icon: "/poop/poop5.png" },
  { id: 6, label: "Mushy", icon: "/poop/poop6.png" },
  { id: 7, label: "Explosive", icon: "/poop/poop7.png" },
];

type Props = {
  selectedPoop: PoopId;
  onChange: (poop: PoopId) => void;
};

export function PoopCarousel({ selectedPoop, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const initialIndex = Math.max(0, Math.min(POOP_TYPES.length - 1, selectedPoop));
  const [scroll, setScroll] = useState(initialIndex * STEP);
  const [dragStart, setDragStart] = useState<{ x: number; scroll: number } | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const didDragRef = useRef(false);
  const indexRef = useRef(initialIndex);
  const tapTargetIndexRef = useRef<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const maxScroll = (POOP_TYPES.length - 1) * STEP;
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
    const idx = selectedPoop;
    if (idx !== indexRef.current) {
      indexRef.current = idx;
      setScroll(idx * STEP);
    }
  }, [selectedPoop]);

  const snapToNearest = useCallback(() => {
    const idx = Math.round(effectiveScroll / STEP);
    const clamped = Math.max(0, Math.min(POOP_TYPES.length - 1, idx));
    const target = clamped * STEP;
    setScroll(target);
    setDragDelta(0);
    setDragStart(null);
    const previousIndex = indexRef.current;
    indexRef.current = clamped;
    if (clamped !== previousIndex) {
      onChange(clamped as PoopId);
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
      const button = target.closest("[data-poop-index]");
      tapTargetIndexRef.current = button ? parseInt(button.getAttribute("data-poop-index") ?? "-1", 10) : null;
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
      if (tappedIndex != null && tappedIndex >= 0 && tappedIndex < POOP_TYPES.length) {
        const idx = tappedIndex;
        const target = idx * STEP;
        setScroll(target);
        indexRef.current = idx;
        onChange(idx as PoopId);
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
      onChange((i + 1) as PoopId);
    },
    [onChange]
  );

  const translateX = -effectiveScroll;
  const currentIndex = Math.max(0, Math.min(POOP_TYPES.length - 1, Math.round(effectiveScroll / STEP)));

  if (containerWidth === 0) {
    return (
      <div className="w-full flex flex-col items-center">
        <div ref={containerRef} className="w-full" style={{ height: ITEM_SIZE * 1.4 }} />
      </div>
    );
  }

  const carouselContentHeight = Math.ceil(ITEM_SIZE * 1.5);
  const carouselPaddingBlock = 20;
  const carouselLeftOffset = -1; // align with mood carousel horizontal centering (left: 99px)
  const carouselTopOffset = -10; // align poop labels vertically (top: 10px)

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
          {POOP_TYPES.map((p, i) => {
            const itemCenterX = i * STEP + ITEM_SIZE / 2;
            const dist = (itemCenterX - effectiveScroll) / STEP;
            const absDist = Math.abs(dist);

            const scale = absDist < 0.5 ? 1.4 - absDist * 0.4 : Math.max(0.7, 1 - (absDist - 0.5) * 0.3);
            const opacity = absDist < 0.5 ? 1 - absDist * 0.2 : Math.max(0.5, 0.9 - (absDist - 0.5) * 0.3);

            return (
              <button
                key={p.id}
                type="button"
                data-poop-index={i}
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
                {imageErrors.has(i) ? (
                  <Image
                    src="/poop/poop0.png"
                    alt={p.label}
                    width={ITEM_SIZE}
                    height={ITEM_SIZE}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                ) : (
                  <Image
                    src={p.icon}
                    alt={p.label}
                    width={ITEM_SIZE}
                    height={ITEM_SIZE}
                    className="w-full h-full object-contain"
                    unoptimized
                    onError={() => {
                      setImageErrors((prev) => new Set(prev).add(i));
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2">
        <span className="text-trakoo-text font-medium text-base">
          {POOP_TYPES[currentIndex]?.label ?? POOP_TYPES[0].label}
        </span>
      </div>
    </div>
  );
}
