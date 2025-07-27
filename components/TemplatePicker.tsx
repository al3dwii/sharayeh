'use client';
import { useState } from "react";

interface Template { id: string; name: string; preview: string; }
const TEMPLATES: Template[] = [
  { id: "investor_pitch_ar", name: "Investor Pitch", preview: "/previews/investor.png" },
];

export function TemplatePicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`border p-2 ${selected === t.id ? "border-blue-500" : "border-gray-300"}`}
        >
          <img src={t.preview} alt={t.name} className="h-20 w-full object-cover mb-1" />
          <div className="text-sm">{t.name}</div>
        </button>
      ))}
    </div>
  );
}
