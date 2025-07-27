"use client";

import { useState } from "react";
import { useApiToken } from "@/lib/auth-client";

type PlanChoice = "starter" | "business" | "pro_edu";

async function createCheckout(plan: PlanChoice, token: string | null): Promise<string> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
  const res = await fetch(`${apiBase}/api/v1/billing/checkout/${plan}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error("checkout failed");
  const json = await res.json();
  return json.checkout_url;
}

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const getToken = useApiToken();

  async function go(plan: PlanChoice) {
    setLoading(true);
    const token = await getToken();
    const url = await createCheckout(plan, token);
    window.location.href = url;
  }

  return (
    <main>
      <h1>Upgrade Your Plan</h1>
      <ul>
        <li>
          <button disabled={loading} onClick={() => go("starter")}>
            Starter – $9/mo
          </button>
        </li>
        <li>
          <button disabled={loading} onClick={() => go("business")}>
            Business – $29/mo
          </button>
        </li>
        <li>
          <button disabled={loading} onClick={() => go("pro_edu")}>
            Pro Edu – $49/mo
          </button>
        </li>
      </ul>
    </main>
  );
}
