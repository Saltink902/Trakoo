"use client";

import { SwipeablePages } from "@/components/SwipeablePages";
import { getSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter();
  const [guardReady, setGuardReady] = useState(false);

  useEffect(() => {
    getSession()
      .then((session) => {
        if (!session) {
          router.replace("/auth");
          return;
        }
        setGuardReady(true);
      })
      .catch((e) => {
        console.error("[auth guard]", e);
        router.replace("/auth");
      });
  }, [router]);

  if (!guardReady) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-dashboard-gradient">
        <p className="text-trakoo-muted">Loading…</p>
      </div>
    );
  }

  return <SwipeablePages />;
}
