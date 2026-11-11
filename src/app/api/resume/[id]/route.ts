import { NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sampleResumeData } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (id === "sample" || id === sampleResumeData.id) {
      return NextResponse.json({ resume: sampleResumeData });
    }

    const user = await getCurrentUser();
    const resume = await db.resume.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 10,
        },
      },
    });

    if (!resume) {
      // Fallback to sample data if not found or local mock
      return NextResponse.json({ resume: { ...sampleResumeData, id } });
    }

    // Access control: if user is logged in, ensure ownership
    if (user && resume.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to resume" }, { status: 403 });
    }

    const parsedContent = JSON.parse(resume.contentJson);
    return NextResponse.json({
      resume: {
        ...parsedContent,
        id: resume.id,
        title: resume.title,
        updatedAt: resume.updatedAt.toISOString(),
      },
      versions: resume.versions,
    });
  } catch (error) {
    console.error("Get resume error:", error);
    return NextResponse.json({ error: "Failed to retrieve resume" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const resumeData = body.resume || body;

    const user = await getCurrentUser();
    if (user) {
      const existing = await db.resume.findUnique({ where: { id } });
      if (existing && existing.userId === user.id) {
        const updated = await db.resume.update({
          where: { id },
          data: {
            title: resumeData.title || existing.title,
            targetRole: resumeData.targetJob?.targetRole || existing.targetRole,
            templateId: resumeData.style?.templateId || existing.templateId,
            atsScore: resumeData.atsAnalysis?.overallScore || existing.atsScore,
            contentJson: JSON.stringify(resumeData),
            styleSettings: JSON.stringify(resumeData.style || {}),
          },
        });

        // Optionally create version checkpoint if requested
        if (body.saveAsVersion) {
          const versionCount = await db.resumeVersion.count({ where: { resumeId: id } });
          await db.resumeVersion.create({
            data: {
              resumeId: id,
              versionNumber: versionCount + 1,
              title: body.versionTitle || `Version ${versionCount + 1}`,
              contentJson: JSON.stringify(resumeData),
            },
          });
        }

        return NextResponse.json({ success: true, resume: { ...resumeData, id: updated.id } });
      }
    }

    return NextResponse.json({ success: true, resume: resumeData });
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const existing = await db.resume.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Resume not found or unauthorized" }, { status: 404 });
    }

    await db.resume.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
