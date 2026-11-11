import { NextResponse } from "next/server";
import { calculateResumeATSScore } from "@/lib/ai/engine";
import { ResumeData } from "@/types/resume";

export async function POST(req: Request) {
  try {
    const { resume } = (await req.json()) as { resume: ResumeData };
    if (!resume) {
      return NextResponse.json({ error: "Resume object is required" }, { status: 400 });
    }
    const scoreBreakdown = await calculateResumeATSScore(resume);
    return NextResponse.json({ atsAnalysis: scoreBreakdown });
  } catch (error) {
    console.error("AI ats-score API error:", error);
    return NextResponse.json({ error: "Failed to calculate ATS score" }, { status: 500 });
  }
}
