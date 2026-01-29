"use client";

import { ReactNode, useEffect, useState } from "react";
import { iPhoneFrame } from "@/components/iPhoneFrame";

type Props = {
  children: ReactNode;
};

const Frame = iPhoneFrame;

export function AppContainer({ children }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (isDesktop) {
    return <Frame>{children}</Frame>;
  }

  return <div className="min-h-screen">{children}</div>;
}
