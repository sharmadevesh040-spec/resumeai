import { NextResponse } from "next/server";
import { getStoredLinkedInAccount, getLinkedInOAuthConfig, generateLinkedInAuthUrl } from "@/lib/auth/linkedin";

export async function GET(req: Request) {
  try {
    const status = getStoredLinkedInAccount();
    const config = getLinkedInOAuthConfig();

    let authUrl: string | undefined;
    if (config.isConfigured) {
      const { searchParams } = new URL(req.url);
      const returnTo = searchParams.get("returnTo") || "/create";
      const vanity = searchParams.get("vanity") || "";
      authUrl = generateLinkedInAuthUrl(returnTo, vanity).url;
    }

    return NextResponse.json({
      isConnected: status.isConnected,
      user: status.user || null,
      missingCredentials: !config.isConfigured,
      authUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { isConnected: false, error: "Failed to determine LinkedIn connection status" },
      { status: 500 }
    );
  }
}
