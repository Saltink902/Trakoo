"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function iPhoneFrame({ children }: Props) {
  return (
    <div className="hidden lg:flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-8">
      <div className="relative">
        {/* iPhone frame */}
        <div className="relative w-[375px] h-[812px] bg-black rounded-[3rem] p-2 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-[1.5rem] z-10" />
          
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
            {/* Status bar area */}
            <div className="absolute top-0 left-0 right-0 h-[44px] bg-transparent z-20 flex items-center justify-between px-6 pt-2 pointer-events-none">
              <span className="text-black text-xs font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 6h20M2 12h20M2 18h20" stroke="currentColor" strokeWidth="2" />
                </svg>
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <div className="w-6 h-3 border border-black rounded-sm">
                  <div className="w-4 h-1.5 bg-black rounded-sm m-0.5" />
                </div>
              </div>
            </div>
            
            {/* Content - full height */}
            <div className="w-full h-full overflow-hidden">
              {children}
            </div>
            
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-black/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
