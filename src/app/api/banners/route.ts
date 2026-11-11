import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getBanners, updateBanner } from "@/lib/db";
import { DEFAULT_BANNERS } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json({ banners: getBanners() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      key?: string;
      resetToDefault?: boolean;
      imageUrl?: string;
      altText?: string;
      badgeText?: string;
      headline?: string;
      subheadline?: string;
      ctaLabel?: string;
      ctaHref?: string;
    };

    if (!body.key) {
      return NextResponse.json(
        { error: "Banner key is required." },
        { status: 400 }
      );
    }

    if (body.resetToDefault) {
      const def = DEFAULT_BANNERS.find((b) => b.key === body.key);
      if (!def) {
        return NextResponse.json(
          { error: "Banner slot not found." },
          { status: 404 }
        );
      }
      const restored = updateBanner(body.key, {
        imageUrl: def.defaultImageUrl,
        altText: def.altText,
        badgeText: def.badgeText,
        headline: def.headline,
        subheadline: def.subheadline,
        ctaLabel: def.ctaLabel,
        ctaHref: def.ctaHref,
      });
      revalidatePath("/", "layout");
      revalidatePath("/services");
      revalidatePath("/about");
      return NextResponse.json({ banner: restored });
    }

    const updated = updateBanner(body.key, {
      imageUrl: body.imageUrl,
      altText: body.altText,
      badgeText: body.badgeText,
      headline: body.headline,
      subheadline: body.subheadline,
      ctaLabel: body.ctaLabel,
      ctaHref: body.ctaHref,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Banner slot not found." },
        { status: 404 }
      );
    }

    revalidatePath("/", "layout");
    revalidatePath("/services");
    revalidatePath("/about");

    return NextResponse.json({ banner: updated });
  } catch {
    return NextResponse.json(
      { error: "Unable to update banner." },
      { status: 500 }
    );
  }
}
