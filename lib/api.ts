// import { UpgradeError } from "./apiTypes"; // or inline type if not separated

export type UploadResp = {
  job_id?: string;
  status?: string;
  plan?: string;
  // upgrade?: UpgradeError;
};

export async function apiUploadDocAuthed(
  file: File,
  categoryId: string | undefined,
  token: string | null,
): Promise<UploadResp> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
  const fd = new FormData();
  fd.append("file", file);
  if (categoryId) fd.append("category_id", categoryId);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${apiBase}/api/v1/jobs/doc-to-deck`, {
    method: "POST",
    headers,
    body: fd,
  });

  // if (res.status === 402) {
  //   const err = await res.json();
  //   return { upgrade: err.detail };
  // }
  if (!res.ok) {
    throw new Error(`upload failed: ${res.status}`);
  }
  return res.json();
}
