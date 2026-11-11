import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LINKEDIN_COOKIE_TOKEN, LINKEDIN_COOKIE_PROFILE, LINKEDIN_COOKIE_STATE } from "@/lib/auth/linkedin";

export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete(LINKEDIN_COOKIE_TOKEN);
    cookieStore.delete(LINKEDIN_COOKIE_PROFILE);
    cookieStore.delete(LINKEDIN_COOKIE_STATE);

    return NextResponse.json({
      success: true,
      message: "LinkedIn account disconnected successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to disconnect LinkedIn account" },
      { status: 500 }
    );
  }
}
