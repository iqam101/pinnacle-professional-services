import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageCircle,
  User,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { getBlogBySlug, getPublishedBlogs, getSeoSettings } from "@/lib/db";
import { CmsImage } from "@/components/CmsImage";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownContent } from "@/components/MarkdownContent";

export const revalidate = 60;

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
      images: ogImg ? [{ url: ogImg, alt: post.coverAlt || post.title }] : undefined,
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

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage.startsWith("http")
      ? post.coverImage
      : `${baseUrl}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: seo.businessName,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/brand/pinnacle-logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <JsonLd data={blogSchema} />

      <article className="bg-white">
        <header className="bg-[#FAF8F5] border-b border-[#E6DFD3] py-12 sm:py-16">
          <div className="container-fluid max-w-4xl space-y-5">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#646B76] hover:text-[#A41C21]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Articles</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#A41C21]">
              <span className="rounded-full bg-[#FDF2F2] border border-[#A41C21]/20 px-3 py-1">
                {post.category}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#181B20] leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-[#3D424B] leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs sm:text-sm text-[#646B76]">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#D79A27]" />
                <span>{post.author}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#D79A27]" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#D79A27]" />
                <span>{post.readTime}</span>
              </span>
            </div>
          </div>
        </header>

        <div className="container-fluid max-w-4xl py-10 sm:py-14 space-y-10">
          <div className="relative rounded-3xl overflow-hidden border border-[#E6DFD3] aspect-[16/9] bg-[#F3EFE7] shadow-md">
            <CmsImage
              src={post.coverImage}
              alt={post.coverAlt || post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>

          <MarkdownContent content={post.content} />

          {/* Article CTA Card */}
          <div className="rounded-3xl bg-[#181B20] text-white p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-[#E8B84B]">
                Need Tailored Guidance?
              </div>
              <h2 className="font-display text-2xl font-bold">
                Speak With {BRAND.shortName} Today
              </h2>
              <p className="text-sm text-[#D9D5CD]">
                Whether you need company registration (Rs. 32,000), monthly
                bookkeeping, VAT & TIN setup, or HR payroll, our Colombo desk is
                ready to help.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={BRAND.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#1EBE5B]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Us</span>
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-[#A41C21] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#821318]"
              >
                Contact Desk
              </Link>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-[#FAF8F5] border-t border-[#E6DFD3] py-14">
          <div className="container-fluid space-y-6">
            <h2 className="font-display text-2xl font-extrabold text-[#181B20]">
              More From Our Knowledge Hub
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="rounded-2xl border border-[#E6DFD3] bg-white p-5 space-y-2 hover:border-[#D79A27] transition-colors"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-[#A41C21]">
                    {r.category}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#181B20] line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#646B76] line-clamp-2">
                    {r.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
