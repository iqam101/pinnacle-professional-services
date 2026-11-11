import { NextResponse } from "next/server";
import { getAdminSession, validateAdminCredentials } from "@/lib/auth";
import { updateAdminPassword } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";

    if (!validateAdminCredentials(session.username, currentPassword)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    updateAdminPassword(newPassword);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update password." },
      { status: 500 }
    );
  }
}
