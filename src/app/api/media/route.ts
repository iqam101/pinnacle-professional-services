import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { UPLOADS_DIR, addMedia, listMedia } from "@/lib/db";

const MAX_FILE_BYTES = 6 * 1024 * 1024;
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ media: listMedia() });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const altText = String(formData.get("altText") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const extFromMime = ALLOWED_MIME[file.type.toLowerCase()];
    if (!extFromMime) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload JPG, PNG, WebP, GIF, or SVG.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 6 MB maximum upload limit." },
        { status: 400 }
      );
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const safeBase = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const filename = `${safeBase || "upload"}-${crypto.randomUUID().slice(0, 8)}${extFromMime}`;
    const dest = path.join(UPLOADS_DIR, filename);

    const bytes = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dest, bytes);

    const url = `/api/media/${filename}`;
    const item = addMedia({
      filename,
      url,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      altText: altText || safeBase.replace(/-/g, " "),
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 }
    );
  }
}
