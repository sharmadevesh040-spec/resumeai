import { NextResponse } from "next/server";
import { improveSummary } from "@/lib/ai/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await improveSummary(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI improve-summary API error:", error);
    return NextResponse.json({ error: "Failed to improve summary" }, { status: 500 });
  }
}
