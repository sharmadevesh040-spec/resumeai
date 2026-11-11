import { NextResponse } from "next/server";
import { parseLinkedInPdfBuffer } from "@/lib/import/linkedin-service";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const vanity = formData.get("vanity") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files exported from LinkedIn are supported" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await parseLinkedInPdfBuffer(buffer, vanity || undefined);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.warning || "Failed to parse LinkedIn PDF" },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error processing LinkedIn PDF" },
      { status: 500 }
    );
  }
}
