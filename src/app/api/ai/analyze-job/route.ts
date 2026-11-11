import { NextResponse } from "next/server";
import { analyzeJobDescription } from "@/lib/ai/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 });
    }
    const result = await analyzeJobDescription({
      jobDescription: body.jobDescription,
      currentSkills: body.currentSkills || [],
      targetRole: body.targetRole,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI analyze-job API error:", error);
    return NextResponse.json({ error: "Failed to analyze job description" }, { status: 500 });
  }
}
