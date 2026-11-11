import { NextResponse } from "next/server";
import {
  getBannerMap,
  getBanners,
  getPublishedBlogs,
  getSeoSettings,
} from "@/lib/db";

export async function GET() {
  const banners = getBanners();
  const bannerMap = getBannerMap();
  const seo = getSeoSettings();
  const blogs = getPublishedBlogs();

  return NextResponse.json(
    { banners, bannerMap, seo, blogs },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
