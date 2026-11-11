import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { UPLOADS_DIR, deleteMedia, listMedia } from "@/lib/db";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);
  if (!safeName || safeName !== filename || safeName.includes("..")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, safeName);
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(safeName).toLowerCase();
  const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (ext === ".svg") {
    headers["Content-Security-Policy"] =
      "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  }

  return new NextResponse(fileBuffer, { status: 200, headers });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await context.params;
  const safeName = path.basename(filename);
  const all = listMedia();
  const match = all.find((m) => m.id === safeName || m.filename === safeName);
  if (!match) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  deleteMedia(match.id);
  const diskPath = path.join(UPLOADS_DIR, path.basename(match.filename));
  if (fs.existsSync(diskPath)) {
    fs.unlinkSync(diskPath);
  }

  return NextResponse.json({ ok: true });
}
