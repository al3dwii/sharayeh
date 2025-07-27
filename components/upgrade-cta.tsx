"use client";

import { useRouter } from "next/navigation";

type Props = {
  requiredPlan: string;
  reason?: string;
};

export function UpgradeCTA({ requiredPlan, reason }: Props) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/upgrade?recommended=${requiredPlan}&reason=${reason ?? ""}`)}
      style={{ marginTop: "0.5rem", padding: "0.4rem 0.8rem", border: "1px solid #999" }}
    >
      Upgrade to {requiredPlan}
    </button>
  );
}
