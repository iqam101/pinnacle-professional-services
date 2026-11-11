import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  getAllBlogs,
  getBanners,
  getSeoSettings,
  listInquiries,
  listMedia,
} from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      username: session.username,
      blogs: getAllBlogs(),
      banners: getBanners(),
      seo: getSeoSettings(),
      media: listMedia(),
      inquiries: listInquiries(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
