import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateLinkedInAuthUrl, getLinkedInOAuthConfig, LINKEDIN_COOKIE_STATE } from "@/lib/auth/linkedin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const returnTo = searchParams.get("returnTo") || "/create";
    const vanity = searchParams.get("vanity") || "";
    const format = searchParams.get("format");

    const config = getLinkedInOAuthConfig();

    if (!config.isConfigured) {
      if (format === "json") {
        return NextResponse.json(
          {
            success: false,
            error: "LinkedIn OAuth credentials (LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET) are not configured in environment.",
            missingCredentials: true,
          },
          { status: 503 }
        );
      }
      return NextResponse.redirect(
        new URL(`${returnTo}?error=linkedin_credentials_missing`, req.url)
      );
    }

    const { url, state } = generateLinkedInAuthUrl(returnTo, vanity);

    // Save state in HTTP-only cookie for CSRF verification
    const cookieStore = cookies();
    cookieStore.set(LINKEDIN_COOKIE_STATE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    if (format === "json") {
      return NextResponse.json({
        success: true,
        authUrl: url,
        state,
      });
    }

    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to initiate LinkedIn OAuth" },
      { status: 500 }
    );
  }
}
