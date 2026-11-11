import { NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const source = await db.resume.findUnique({ where: { id } });
    if (!source || source.userId !== user.id) {
      return NextResponse.json({ error: "Source resume not found" }, { status: 404 });
    }

    const duplicated = await db.resume.create({
      data: {
        userId: user.id,
        title: `${source.title} (Copy)`,
        targetRole: source.targetRole,
        templateId: source.templateId,
        atsScore: source.atsScore,
        contentJson: source.contentJson,
        styleSettings: source.styleSettings,
      },
    });

    await db.resumeVersion.create({
      data: {
        resumeId: duplicated.id,
        versionNumber: 1,
        title: "Duplicated from " + source.title,
        contentJson: source.contentJson,
      },
    });

    return NextResponse.json({ success: true, resume: duplicated });
  } catch (error) {
    console.error("Duplicate resume error:", error);
    return NextResponse.json({ error: "Failed to duplicate resume" }, { status: 500 });
  }
}
