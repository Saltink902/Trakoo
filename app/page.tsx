"use client";

import { SwipeablePages } from "@/components/SwipeablePages";
import { ensureSession } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function Home() {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    ensureSession()
      .then(() => setSessionReady(true))
      .catch((e) => {
        console.error("[ensureSession]", e);
        setSessionReady(true);
      });
  }, []);

  if (!sessionReady) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-dashboard-gradient flex items-center justify-center">
        <p className="text-trakoo-muted">Loading…</p>
      </div>
    );
  }

  return <SwipeablePages />;
}
