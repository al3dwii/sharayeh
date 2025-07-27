
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApiToken } from '@/lib/auth-client';

/* ------------------------------------------------------------------ *
 *  Helper: fetch current billing info
 * ------------------------------------------------------------------ */
async function fetchBillingMe(token: string | null) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
  const res = await fetch(`${apiBase}/api/v1/billing/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { revalidate: 0 },       // never cache on the client
  });
  return res.json();
}

/* ------------------------------------------------------------------ *
 *  Inner component (wrapped in <Suspense>)
 * ------------------------------------------------------------------ */
function SuccessBody() {
  const params = useSearchParams();               // CSR hook
  const sessionId = params.get('session_id');

  const getToken = useApiToken();
  const [billing, setBilling] = useState<
    | { plan: string; plan_status?: string }
    | null
  >(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setBilling(await fetchBillingMe(token));
    })();
  }, [getToken]);

  return (
    <>
      {sessionId && <p>Session: {sessionId}</p>}
      {billing && (
        <p>
          Current Plan: {billing.plan}{' '}
          (status: {billing.plan_status ?? 'n/a'})
        </p>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Page component: wrap CSR hook in <Suspense>
 * ------------------------------------------------------------------ */
export default function BillingSuccessPage() {
  return (
    <main className="container mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-4">Payment Successful</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <SuccessBody />
      </Suspense>
      <a className="text-blue-600 underline mt-8 inline-block" href="/">
        Return Home
      </a>
    </main>
  );
}


// "use client";

// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useApiToken } from "@/lib/auth-client";

// async function fetchBillingMe(token: string | null) {
//   const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
//   const res = await fetch(`${apiBase}/api/v1/billing/me`, {
//     headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//   });
//   return res.json();
// }

// export default function BillingSuccessPage() {
//   const params = useSearchParams();
//   const sessionId = params.get("session_id");
//   const getToken = useApiToken();
//   const [billing, setBilling] = useState<any>(null);

//   useEffect(() => {
//     (async () => {
//       const token = await getToken();
//       setBilling(await fetchBillingMe(token));
//     })();
//   }, []);

//   return (
//     <main>
//       <h1>Payment Successful</h1>
//       {sessionId && <p>Session: {sessionId}</p>}
//       {billing && (
//         <p>
//           Current Plan: {billing.plan} (status: {billing.plan_status ?? "n/a"})
//         </p>
//       )}
//       <a href="/">Return Home</a>
//     </main>
//   );
// }
