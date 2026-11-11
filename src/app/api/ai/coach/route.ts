import { NextResponse } from "next/server";
import { executeCoachActionWithGemini, CoachAction } from "@/lib/ai/resume-coach";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      selectedText,
      sectionName,
      targetRole,
      jobDescription,
      fullResume,
      userInstructions,
    } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required for AI Resume Coach." },
        { status: 400 }
      );
    }

    const result = await executeCoachActionWithGemini({
      action: action as CoachAction,
      selectedText,
      sectionName,
      targetRole,
      jobDescription,
      fullResume,
      userInstructions,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("AI Coach error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error executing AI Coach action",
      },
      { status: 500 }
    );
  }
}
