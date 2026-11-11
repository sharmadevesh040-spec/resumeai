import { NextResponse } from "next/server";
import { signUpWithEmail } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await signUpWithEmail(email, password, name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
