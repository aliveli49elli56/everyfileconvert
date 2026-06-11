"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  adUnit: string;
  height: number;
  width: number;
  className?: string;
}

export default function AdSlot({
  adUnit,
  height,
  width,
  className = "",
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (isProduction && adRef.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
          {}
        );
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [isProduction]);

  if (isProduction) {
    return (
      <ins
        ref={adRef}
        className={`adsbygoogle ${className}`}
        style={{
          display: "inline-block",
          width: `${width}px`,
          height: `${height}px`,
        }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adUnit}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className="text-center p-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Ad Placeholder
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {width}x{height}
        </p>
        <p className="text-[10px] text-slate-300 mt-1">
          {adUnit}
        </p>
      </div>
    </div>
  );
}
