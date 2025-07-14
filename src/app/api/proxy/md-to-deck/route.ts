import { NextRequest, NextResponse } from "next/server"; 

const GW = process.env.NEXT_PUBLIC_GATEWAY_URL!; 
export async function POST(req: NextRequest) { 
    const body = await req.json(); 
    const r = await fetch(`${GW}/ai/pdf-to-deck`, 
        { method: "POST", headers: { "content-type": "application/json" }, 
        body: JSON.stringify(body), }); 
    return new NextResponse(r.body, { status: r.status }); }