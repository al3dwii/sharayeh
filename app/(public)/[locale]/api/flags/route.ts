import { NextResponse } from "next/server";

export async function GET() {
  // M0 hardcoded
  return NextResponse.json({
    deck: { enabled: true, plan_min: "free" },
    data_charts: { enabled: false, plan_min: "business" },
    scorm: { enabled: false, plan_min: "pro_edu" },
    quiz: { enabled: false, plan_min: "pro_edu" },
    video: { enabled: false, plan_min: "business" },
    branching: { enabled: false, plan_min: "enterprise" },
  });
}
