import { NextResponse } from "next/server";
import { validateGitHubUrl } from "@/lib/import/url-validator";
import { fetchGitHubProfile } from "@/lib/import/github-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, username, targetRole, jobDescription } = body;

    let targetUsername = username;

    if (!targetUsername && url) {
      const validation = validateGitHubUrl(url);
      if (!validation.isValid || !validation.username) {
        return NextResponse.json(
          { success: false, error: validation.error || "Invalid GitHub URL" },
          { status: 400 }
        );
      }
      targetUsername = validation.username;
    }

    if (!targetUsername) {
      return NextResponse.json(
        { success: false, error: "GitHub URL or username is required" },
        { status: 400 }
      );
    }

    const result = await fetchGitHubProfile(targetUsername, targetRole, jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error fetching GitHub profile" },
      { status: 500 }
    );
  }
}
