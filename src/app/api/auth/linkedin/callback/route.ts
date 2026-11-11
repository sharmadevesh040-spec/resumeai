import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeLinkedInAuthCode,
  fetchLinkedInUserInfo,
  LINKEDIN_COOKIE_STATE,
  LINKEDIN_COOKIE_TOKEN,
  LINKEDIN_COOKIE_PROFILE,
} from "@/lib/auth/linkedin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const cookieStore = cookies();
  const savedState = cookieStore.get(LINKEDIN_COOKIE_STATE)?.value;

  // Clear the state cookie after retrieval
  cookieStore.delete(LINKEDIN_COOKIE_STATE);

  let returnTo = "/create";
  let targetVanity = "";

  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      if (decoded.returnTo) returnTo = decoded.returnTo;
      if (decoded.vanity) targetVanity = decoded.vanity;
    } catch {
      // Keep default returnTo
    }
  }

  // Handle errors from LinkedIn authorization
  if (error) {
    const errorMsg = errorDescription || error;
    return NextResponse.redirect(
      new URL(`${returnTo}?error=${encodeURIComponent(`LinkedIn authorization cancelled: ${errorMsg}`)}`, req.url)
    );
  }

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=${encodeURIComponent("LinkedIn OAuth validation failed (invalid state or expired session)")}`, req.url)
    );
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenData = await exchangeLinkedInAuthCode(code);

    // 2. Fetch authenticated user profile using official OpenID endpoint
    const userInfo = await fetchLinkedInUserInfo(tokenData.access_token);

    // 3. Store the access token securely in an HTTP-only cookie
    cookieStore.set(LINKEDIN_COOKIE_TOKEN, tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in || 60 * 60 * 24 * 60, // ~60 days or returned expiry
      path: "/",
    });

    // 4. Store the basic profile in a cookie for fast frontend retrieval
    const profileSummary = {
      sub: userInfo.sub,
      name: userInfo.name || `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim(),
      email: userInfo.email,
      picture: userInfo.picture,
      vanityName: targetVanity || undefined,
      connectedAt: new Date().toISOString(),
    };

    cookieStore.set(LINKEDIN_COOKIE_PROFILE, JSON.stringify(profileSummary), {
      httpOnly: false, // Accessible to client for displaying connection status
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in || 60 * 60 * 24 * 60,
      path: "/",
    });

    return NextResponse.redirect(
      new URL(`${returnTo}?linkedin_connected=true${targetVanity ? `&linkedin_vanity=${encodeURIComponent(targetVanity)}` : ""}`, req.url)
    );
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown LinkedIn OAuth exchange error";
    return NextResponse.redirect(
      new URL(`${returnTo}?error=${encodeURIComponent(errorMsg)}`, req.url)
    );
  }
}
