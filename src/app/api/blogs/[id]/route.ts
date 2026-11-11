import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { deleteBlog, getBlogById, upsertBlog } from "@/lib/db";
import type { BlogStatus } from "@/types/cms";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const existing = getBlogById(id);
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const body = (await request.json()) as {
      slug?: string;
      title?: string;
      category?: string;
      excerpt?: string;
      content?: string;
      coverImage?: string;
      coverAlt?: string;
      author?: string;
      readTime?: string;
      status?: BlogStatus;
      featured?: boolean;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      ogImage?: string;
      canonicalUrl?: string;
      publishedAt?: string;
    };

    const updated = upsertBlog({
      id,
      slug: body.slug ?? existing.slug,
      title: body.title ?? existing.title,
      category: body.category ?? existing.category,
      excerpt: body.excerpt ?? existing.excerpt,
      content: body.content ?? existing.content,
      coverImage: body.coverImage ?? existing.coverImage,
      coverAlt: body.coverAlt ?? existing.coverAlt,
      author: body.author ?? existing.author,
      readTime: body.readTime ?? existing.readTime,
      status: body.status ?? existing.status,
      featured: body.featured ?? existing.featured,
      seoTitle: body.seoTitle ?? existing.seoTitle,
      seoDescription: body.seoDescription ?? existing.seoDescription,
      seoKeywords: body.seoKeywords ?? existing.seoKeywords,
      ogImage: body.ogImage ?? existing.ogImage,
      canonicalUrl: body.canonicalUrl ?? existing.canonicalUrl,
      publishedAt: body.publishedAt ?? existing.publishedAt,
    });

    revalidatePath("/", "layout");
    revalidatePath("/blog");
    revalidatePath(`/blog/${existing.slug}`);
    revalidatePath(`/blog/${updated.slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ blog: updated });
  } catch {
    return NextResponse.json(
      { error: "Unable to update blog post." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = getBlogById(id);
  const removed = deleteBlog(id);
  if (!removed) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }

  revalidatePath("/", "layout");
  revalidatePath("/blog");
  if (existing) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true });
}
