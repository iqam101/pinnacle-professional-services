import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    getDb();
    return NextResponse.json(
      { ok: true, mode: "node-local", dbReady: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        mode: "node-local",
        dbReady: false,
        error: err instanceof Error ? err.message : "Database unavailable.",
      },
      { status: 503 }
    );
  }
}
