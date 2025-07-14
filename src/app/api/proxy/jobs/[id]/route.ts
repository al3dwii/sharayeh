import { NextRequest, NextResponse } from "next/server";

const GW = process.env.NEXT_PUBLIC_GATEWAY_URL!;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const r = await fetch(`${GW}/jobs/${params.id}`);
  return new NextResponse(r.body, { status: r.status });
}
