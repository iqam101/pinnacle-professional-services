import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlug, getPublishedBlogs, getSeoSettings } from "@/lib/db";
import { BlogPostViewClient } from "@/components/views/BlogPostViewClient";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getPublishedBlogs().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post || post.status !== "published") return {};

  const seo = getSeoSettings();
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const ogImg = post.ogImage || post.coverImage || seo.ogDefaultImage;
  const keywords = post.seoKeywords
    ? post.seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: post.canonicalUrl || `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: ogImg
        ? [{ url: ogImg, alt: post.coverAlt || post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImg ? [ogImg] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post || post.status !== "published") {
    notFound();
  }

  const seo = getSeoSettings();
  const baseUrl = seo.canonicalBaseUrl.replace(/\/+$/, "");
  const related = getPublishedBlogs()
    .filter((b) => b.id !== post.id)
    .slice(0, 3);

  return (
    <BlogPostViewClient
      initialPost={post}
      initialRelated={related}
      initialBaseUrl={baseUrl}
      initialBusinessName={seo.businessName}
      slugProp={post.slug}
    />
  );
}
