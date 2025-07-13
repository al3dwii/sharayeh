// src/components/landing/FeatureCard.tsx
//-----------------------------------------------------
// FINAL state after the 10-day sprint
//-----------------------------------------------------
"use client";

import { LucideIcon } from "lucide-react";

interface Props {
  Icon: LucideIcon;
  title: string;
  desc: string;
  /** Render RTL-friendly shadows & text-align */
  rtl?: boolean;
}

/**
 * Generic marketing card used in FeatureSectionAr.
 * Accepts any Lucide icon.  Hover shadow only on desktop.
 */
export default function FeatureCard({ Icon, title, desc, rtl }: Props) {
  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
                 transition-shadow hover:shadow-md"
    >
      <div className="shrink-0 rounded-full border p-3">
        <Icon className="size-5" aria-hidden />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
