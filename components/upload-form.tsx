"use client";

import { useState } from "react";
import { TemplatePicker } from "./TemplatePicker";
import { PlanBadge } from "./PlanBadge";
import { useUserPlan } from "../context/UserContext";
import { BrandKitUploader } from "./BrandKitUploader";
import { GatingBanner } from "./GatingBanner";
// import { apiUploadDocAuthed, UpgradeError } from "../lib/api";
import { UpgradeCTA } from "./upgrade-cta";
import { useApiToken } from "../lib/auth-client";

type Props = {
  categoryId?: string;
};

export function UploadForm({ categoryId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  // const [upgrade, setUpgrade] = useState<UpgradeError | null>(null);
  const [template, setTemplate] = useState<string>("default_template_id");
  const plan = useUserPlan();
  const gatingModule = template.includes('scorm') ? 'scorm' : template.includes('video') ? 'video' : null;
  const getToken = useApiToken();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    // setUpgrade(null);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    form.append("template_id", template);
    form.append("file", file);
    const token = await getToken();
    const resp = await fetch("/api/upload", {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const json = await resp.json();
    if (json.upgrade) {
      // setUpgrade(json.upgrade);
      return;
    }
    setJobId(json.job_id ?? null);
    if (json.job_id) poll(json.job_id);
  }

  async function poll(id: string) {
    const interval = setInterval(async () => {
      const r = await fetch(`${apiBase}/api/v1/jobs/${id}`);
      const j = await r.json();
      setStatus(j);
      if (j.status === "succeeded" || j.status === "failed") {
        clearInterval(interval);
      }
    }, 2000);
  }

  // ...render identical to previous version (remove planOverride UI)...

  return (
    <> </>
    // <div className="upload-form-wrapper">
    //   <div className="mb-4">
    //     Current plan: <PlanBadge plan={plan} />
    //   </div>
    //   <form onSubmit={submit} className="upload-form">
    //     <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
    //     <label className="mt-4 block font-medium">Choose a template</label>
    //     <TemplatePicker selected={template} onSelect={setTemplate} />
    //     <button type="submit" disabled={!file}>Convert</button>
    //   </form>
    //   {upgrade && (
    //     <div style={{ border: "1px solid #f00", padding: "1rem", marginTop: "1rem" }}>
    //       <strong>Upgrade needed:</strong>
    //       {/* error messages same as before */}
    //       <UpgradeCTA requiredPlan={upgrade.required_plan ?? "starter"} reason={upgrade.error} />
    //     </div>
    //   )}
    //   {jobId && <p>Job: {jobId}</p>}
    //   {status?.status === "succeeded" && (
    //     <div>
    //       <p>
    //         Done: <a href={status.download_url}>Download PPTX</a>
    //       </p>
    //       {/* {jobId && <BrandKitUploader jobId={jobId} />} */}
    //       {gatingModule && <GatingBanner module={gatingModule as any} />}
    //     </div>
    //   )}
    //   {status?.status === "failed" && <p style={{ color: "red" }}>Error: {status.error}</p>}
    // </div>
  );
}
