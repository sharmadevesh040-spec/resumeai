import { NextResponse } from "next/server";
import { improveExperienceBullets } from "@/lib/ai/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await improveExperienceBullets(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI improve-bullet API error:", error);
    return NextResponse.json({ error: "Failed to improve bullet" }, { status: 500 });
  }
}
