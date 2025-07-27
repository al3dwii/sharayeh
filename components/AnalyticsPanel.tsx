'use client';
import useSWR from "swr";

export function AnalyticsPanel() {
  const { data } = useSWR("/api/analytics/summary", url => fetch(url).then(r=>r.json()));
  if (!data) return <p>Loading metrics…</p>;
  return (
    <div className="grid grid-cols-3 gap-4 my-6">
      <Stat label="Uploads" value={data.uploads} />
      <Stat label="Downloads" value={data.downloads} />
      <Stat label="SCORM Clicks" value={data.scormClicks} />
    </div>
  );
}

function Stat({label,value}:{label:string;value:number}) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
