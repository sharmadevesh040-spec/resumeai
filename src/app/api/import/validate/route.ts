import { NextResponse } from "next/server";
import { validateGitHubUrl, validateLinkedInUrl } from "@/lib/import/url-validator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { githubUrl, linkedinUrl } = body;

    const githubValidation = githubUrl ? validateGitHubUrl(githubUrl) : null;
    const linkedinValidation = linkedinUrl ? validateLinkedInUrl(linkedinUrl) : null;

    const hasAtLeastOne =
      (githubValidation && githubValidation.isValid) ||
      (linkedinValidation && linkedinValidation.isValid);

    return NextResponse.json({
      success: true,
      hasAtLeastOne,
      github: githubValidation,
      linkedin: linkedinValidation,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
