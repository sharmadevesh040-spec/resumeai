import { NextResponse } from "next/server";
import { generateResumePdf } from "@/lib/pdf/generator";
import { ResumeData } from "@/types/resume";

export async function POST(req: Request) {
  try {
    const { resume } = (await req.json()) as { resume: ResumeData };
    if (!resume || !resume.personal) {
      return NextResponse.json({ error: "Invalid resume payload" }, { status: 400 });
    }

    const pdfBuffer = await generateResumePdf(resume);
    const fileName = `${(resume.personal.fullName || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_")}_Resume.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Failed to generate PDF document" }, { status: 500 });
  }
}
