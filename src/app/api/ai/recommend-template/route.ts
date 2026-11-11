import { NextResponse } from "next/server";
import { recommendTemplate } from "@/lib/ai/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = recommendTemplate({
      targetRole: body.targetRole || "Software Developer",
      experienceLevel: body.experienceLevel || "Student",
      industry: body.industry,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI recommend-template error:", error);
    return NextResponse.json({ error: "Failed to recommend template" }, { status: 500 });
  }
}
