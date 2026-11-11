import { NextResponse } from "next/server";
import { improveProjectBullets } from "@/lib/ai/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await improveProjectBullets(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI improve-project API error:", error);
    return NextResponse.json({ error: "Failed to improve project bullets" }, { status: 500 });
  }
}
