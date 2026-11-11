import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getSessionCookieOptions,
  validateAdminCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    const username = (body.username || "").trim();
    const password = body.password || "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(username);
    const proto = request.headers.get("x-forwarded-proto");
    const isHttps =
      proto === "https" || request.url.startsWith("https://");

    const response = NextResponse.json({ ok: true, username });
    response.cookies.set(getSessionCookieOptions(token, isHttps));
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to process sign-in request." },
      { status: 500 }
    );
  }
}
