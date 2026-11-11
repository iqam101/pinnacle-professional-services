import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getAllBlogs, getPublishedBlogs, upsertBlog } from "@/lib/db";
import type { BlogStatus } from "@/types/cms";

export async function GET() {
  const session = await getAdminSession();
  const posts = session ? getAllBlogs() : getPublishedBlogs();
  return NextResponse.json({ blogs: posts });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      id?: string;
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

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Blog title and content are required." },
        { status: 400 }
      );
    }

    const saved = upsertBlog({
      id: body.id,
      slug: body.slug,
      title: body.title,
      category: body.category || "Business Advisory",
      excerpt:
        body.excerpt?.trim() ||
        body.content.replace(/[#*\-`>]/g, "").slice(0, 160).trim(),
      content: body.content,
      coverImage: body.coverImage,
      coverAlt: body.coverAlt,
      author: body.author,
      readTime: body.readTime,
      status: body.status,
      featured: body.featured,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      seoKeywords: body.seoKeywords,
      ogImage: body.ogImage,
      canonicalUrl: body.canonicalUrl,
      publishedAt: body.publishedAt,
    });

    revalidatePath("/", "layout");
    revalidatePath("/blog");
    revalidatePath(`/blog/${saved.slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ blog: saved }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save blog post." },
      { status: 500 }
    );
  }
}
