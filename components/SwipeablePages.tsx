"use client";

import { MoodDashboard } from "@/components/MoodDashboard";
import { PoopTracker } from "@/components/PoopTracker";
import { IllnessTracker } from "@/components/IllnessTracker";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGES = ["Mood", "Poop", "Illness"] as const;

export function SwipeablePages() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActive = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const x = el.scrollLeft;
    const i = Math.round(x / w);
    setActiveIndex(Math.max(0, Math.min(PAGES.length - 1, i)));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateActive();
    const onScroll = () => updateActive();
    const ro = new ResizeObserver(updateActive);
    ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [updateActive]);

  const goTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.offsetWidth, behavior: "smooth" });
  }, []);

  return (
    <main className="min-h-screen min-h-[100dvh] lg:min-h-full bg-dashboard-gradient flex flex-col overflow-hidden">
      <div
        ref={scrollRef}
        className="pages-scroll flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory w-full"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div
          className="flex flex-1 min-w-full w-full h-full snap-start shrink-0 overflow-y-auto"
          style={{ scrollSnapAlign: "start" }}
        >
          <MoodDashboard />
        </div>
        <div
          className="flex flex-1 min-w-full w-full h-full snap-start shrink-0 overflow-y-auto"
          style={{ scrollSnapAlign: "start" }}
        >
          <PoopTracker />
        </div>
        <div
          className="flex flex-1 min-w-full w-full h-full snap-start shrink-0 overflow-y-auto"
          style={{ scrollSnapAlign: "start" }}
        >
          <IllnessTracker />
        </div>
      </div>

      <div className="shrink-0 py-4 flex justify-center items-center gap-2" aria-label="Page">
        {PAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-trakoo-text/30 ${
              i === activeIndex ? "bg-[#b8a8c0]" : "bg-[#d4c8d8]/70"
            }`}
            aria-label={`Page ${i + 1}: ${PAGES[i]}`}
            aria-current={i === activeIndex ? "true" : undefined}
          />
        ))}
      </div>
    </main>
  );
}
