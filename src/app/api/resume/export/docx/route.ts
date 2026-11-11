import { NextResponse } from "next/server";
import { generateResumeDocx } from "@/lib/docx/generator";
import { ResumeData } from "@/types/resume";

export async function POST(req: Request) {
  try {
    const { resume } = (await req.json()) as { resume: ResumeData };
    if (!resume || !resume.personal) {
      return NextResponse.json({ error: "Invalid resume payload" }, { status: 400 });
    }

    const docxBuffer = await generateResumeDocx(resume);
    const fileName = `${(resume.personal.fullName || "Resume").replace(/[^a-zA-Z0-9_-]/g, "_")}_Resume.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("DOCX export error:", error);
    return NextResponse.json({ error: "Failed to generate DOCX document" }, { status: 500 });
  }
}
