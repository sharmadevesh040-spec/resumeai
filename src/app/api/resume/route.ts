import { NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sampleResumeData } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // In guest / demo mode, return the rich sample resume so user can test right away
      return NextResponse.json({
        resumes: [
          {
            id: sampleResumeData.id,
            title: sampleResumeData.title,
            targetRole: sampleResumeData.targetJob.targetRole,
            templateId: sampleResumeData.style.templateId,
            atsScore: sampleResumeData.atsAnalysis?.overallScore || 94,
            updatedAt: new Date().toISOString(),
            contentJson: JSON.stringify(sampleResumeData),
          },
        ],
      });
    }

    const resumes = await db.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    if (resumes.length === 0) {
      // Seed an initial resume for the new user so they have sample data ready to explore
      const initial = await db.resume.create({
        data: {
          userId: user.id,
          title: `${user.name || "My"} Professional Resume`,
          targetRole: sampleResumeData.targetJob.targetRole,
          templateId: "ats-professional",
          atsScore: 94,
          contentJson: JSON.stringify({
            ...sampleResumeData,
            id: undefined,
            personal: {
              ...sampleResumeData.personal,
              fullName: user.name || sampleResumeData.personal.fullName,
              email: user.email,
            },
          }),
        },
      });
      return NextResponse.json({ resumes: [initial] });
    }

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("Fetch resumes error:", error);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const resumeData = body.resume || body;

    const title = resumeData.title || `${resumeData.personal?.fullName || "Untitled"} Resume`;
    const targetRole = resumeData.targetJob?.targetRole || "Software Developer";
    const templateId = resumeData.style?.templateId || "ats-professional";
    const atsScore = resumeData.atsAnalysis?.overallScore || 90;

    let savedResumeId = "local-" + Date.now();

    if (user) {
      const created = await db.resume.create({
        data: {
          userId: user.id,
          title,
          targetRole,
          templateId,
          atsScore,
          contentJson: JSON.stringify(resumeData),
          styleSettings: JSON.stringify(resumeData.style || {}),
        },
      });

      // Also create version 1 in history
      await db.resumeVersion.create({
        data: {
          resumeId: created.id,
          versionNumber: 1,
          title: "Initial Generated Draft",
          contentJson: JSON.stringify(resumeData),
        },
      });

      savedResumeId = created.id;
    }

    return NextResponse.json({
      success: true,
      resumeId: savedResumeId,
      resume: { ...resumeData, id: savedResumeId },
    });
  } catch (error) {
    console.error("Create resume error:", error);
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
