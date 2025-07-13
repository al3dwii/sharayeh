//-----------------------------------------------------
// Composite one-shot DOCX→PPTX endpoint (Day 7)
//-----------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import delay from "delay";

const ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sharayeh.com";

export async function POST(req: NextRequest) {
  const { fileUrl, template = "business" } = await req.json();

  if (!fileUrl) {
    return NextResponse.json({ error: "fileUrl required" }, { status: 400 });
  }

  /* 1. Upload -------------------------------------------------------- */
  const add = await fetch(`${ORIGIN}/api/add-file`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("Authorization") || ""
    },
    body: JSON.stringify({ fileUrl, template })
  }).then(r => r.json());

  const { jobId } = add;
  if (!jobId) {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }

  /* 2. Poll status --------------------------------------------------- */
  let status = "queued";
  let downloadUrl: string | null = null;
  for (let i = 0; i < 30 && status !== "ready"; i++) {
    await delay(3000);

    const poll = await fetch(
      `${ORIGIN}/api/check-file-status?jobId=${jobId}`,
      { headers: { Authorization: req.headers.get("Authorization") || "" } }
    ).then(r => r.json());

    status = poll.status;
    downloadUrl = poll.downloadUrl ?? null;

    if (status === "error") {
      return NextResponse.json({ error: "conversion failed" }, { status: 500 });
    }
  }

  if (!downloadUrl) {
    return NextResponse.json({ error: "timeout" }, { status: 504 });
  }

  /* 3. Finalize & return -------------------------------------------- */
  const finalize = await fetch(`${ORIGIN}/api/update-resulted-file`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("Authorization") || ""
    },
    body: JSON.stringify({ jobId })
  }).then(r => r.json());

  return NextResponse.json({
    downloadUrl: finalize.downloadUrl || downloadUrl,
    creditsRemaining: +req.headers.get("X-User-Credits")! || 0
  });
}
