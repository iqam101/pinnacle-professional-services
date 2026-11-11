import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getSeoSettings, updateSeoSettings } from "@/lib/db";
import type { SeoSettings } from "@/types/cms";

export async function GET() {
  return NextResponse.json({ seo: getSeoSettings() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<SeoSettings>;
    const updated = updateSeoSettings(body);

    revalidatePath("/", "layout");
    revalidatePath("/services");
    revalidatePath("/about");
    revalidatePath("/blog");
    revalidatePath("/contact");
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");

    return NextResponse.json({ seo: updated });
  } catch {
    return NextResponse.json(
      { error: "Unable to update SEO settings." },
      { status: 500 }
    );
  }
}
