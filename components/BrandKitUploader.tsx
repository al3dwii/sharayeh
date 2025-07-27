"use client";
import { useState } from "react";

export function BrandKitUploader({ token }: { token: string }) {
  const [logo, setLogo] = useState<File | null>(null);
  const [colors, setColors] = useState<string[]>(["#2563EB", "#FACC15"]);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    colors.forEach((c) => fd.append("colors", c));
    if (logo) fd.append("logo", logo);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"}/api/v1/brand-kit`, {
      method: "POST",
      body: fd,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setStatus("Saved!");
    else setStatus("Error saving brand kit");
  }

  return (
    <form onSubmit={submit}>
      <h3>Upload Brand Kit</h3>
      <input type="file" accept="image/png,image/jpeg" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} />
      <div>
        {colors.map((c, i) => (
          <input
            key={i}
            type="color"
            value={c}
            onChange={(e) => {
              const nc = [...colors];
              nc[i] = e.target.value;
              setColors(nc);
            }}
          />
        ))}
      </div>
      <button type="submit">Save</button>
      {status && <span>{status}</span>}
    </form>
  );
}
