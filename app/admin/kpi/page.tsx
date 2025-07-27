'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface KpiDailyRow {
  dt: string;
  uploads: number;
  upgrades: number;
}

interface KpiSummary {
  uploads: number;
  upgrades: number;
  data_jobs: number;
  scorm_jobs: number;
}

export default function AdminKpiPage() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<KpiDailyRow[] | null>(null);
  const [summary, setSummary] = useState<KpiSummary | null>(null);

  /* --------------------------------------------------------------- *
   *  1) Get token in CSR only (avoids localStorage at module scope)
   * --------------------------------------------------------------- */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('__session'));
    }
  }, []);

  /* --------------------------------------------------------------- *
   *  2) Fetch KPI data once token is available
   * --------------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      const hdrs = { Authorization: `Bearer ${token}` };
      const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

      const [daily, sum] = await Promise.all([
        fetch(`${apiBase}/api/v1/admin/kpi/daily`, { headers: hdrs }).then((r) => r.json()),
        fetch(`${apiBase}/api/v1/admin/kpi/summary`, { headers: hdrs }).then((r) => r.json()),
      ]);

      setData(daily);
      setSummary(sum);
    }
    fetchData();
  }, [token]);

  if (!data || !summary) return <p className="p-8">Loading…</p>;

  const chartData = {
    labels: data.map((d) => d.dt.slice(0, 10)),
    datasets: [
      { label: 'Uploads',  data: data.map((d) => d.uploads)  },
      { label: 'Upgrades', data: data.map((d) => d.upgrades) },
    ],
  };

  return (
    <main className="container mx-auto py-12 space-y-10">
      <h1 className="text-3xl font-bold">Admin KPI Dashboard</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Uploads"   value={summary.uploads}   />
        <SummaryCard label="Upgrades"  value={summary.upgrades}  />
        <SummaryCard label="Data Jobs" value={summary.data_jobs} />
        <SummaryCard label="SCORM Jobs" value={summary.scorm_jobs} />
      </section>

      <Line data={chartData} />
    </main>
  );
}

/* ------------------------------------------------------------------ *
 *  Small stat card
 * ------------------------------------------------------------------ */
function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border p-4 text-center">
      <h3 className="text-sm text-muted-foreground">{label}</h3>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

// "use client";
// import { Line } from "react-chartjs-2";
// import { useEffect, useState } from "react";
// import {
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Chart as ChartJS,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// export default function AdminKpiPage() {
//   const [data, setData] = useState<any[] | null>(null);
//   const [summary, setSummary] = useState<any | null>(null);
//   const token = localStorage.getItem("__session"); // Clerk sets this; adapt if different

//   useEffect(() => {
//     async function fetchData() {
//       const hdrs = { Authorization: `Bearer ${token}` };
//       const daily = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"}/api/v1/admin/kpi/daily`,
//         { headers: hdrs }
//       ).then((r) => r.json());
//       setData(daily);

//       const sum = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"}/api/v1/admin/kpi/summary`,
//         { headers: hdrs }
//       ).then((r) => r.json());
//       setSummary(sum);
//     }
//     fetchData();
//   }, [token]);

//   if (!data || !summary) return <p>Loading…</p>;

//   const chart = {
//     labels: data.map((d) => d.dt.slice(0, 10)),
//     datasets: [
//       { label: "Uploads", data: data.map((d) => d.uploads) },
//       { label: "Upgrades", data: data.map((d) => d.upgrades) },
//     ],
//   };

//   return (
//     <main>
//       <h1>Admin KPI Dashboard</h1>
//       <section style={{ display: "flex", gap: "1rem" }}>
//         <SummaryCard label="Uploads" value={summary.uploads} />
//         <SummaryCard label="Upgrades" value={summary.upgrades} />
//         <SummaryCard label="Data Jobs" value={summary.data_jobs} />
//         <SummaryCard label="SCORM Jobs" value={summary.scorm_jobs} />
//       </section>
//       <Line data={chart} />
//     </main>
//   );
// }

// function SummaryCard({ label, value }: { label: string; value: number }) {
//   return (
//     <div style={{ padding: "1rem", border: "1px solid #ccc", minWidth: "120px" }}>
//       <h3>{label}</h3>
//       <p style={{ fontSize: "1.5rem", margin: 0 }}>{value}</p>
//     </div>
//   );
// }
