"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileX2,
  MessageCircle,
  User,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { cmsApiUrl } from "@/lib/cms-client";
import { CmsImage } from "@/components/CmsImage";
import { useCmsLive } from "@/components/CmsLiveProvider";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { BlogPost } from "@/types/cms";

const emptySubscribe = () => () => {};

function extractSlugFromLocation(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get("slug")?.trim();
  if (querySlug) return querySlug;
  const match = window.location.pathname.match(/^\/blog\/([^/?#]+)\/?$/);
  if (match && match[1] && match[1] !== "post") {
    return decodeURIComponent(match[1]);
  }
  return "";
}

export function BlogPostViewClient({
  initialPost = null,
  initialRelated = [],
  initialBaseUrl = "https://pinnacleprofessionalservices.lk",
  initialBusinessName = BRAND.legalName,
  slugProp,
}: {
  initialPost?: BlogPost | null;
  initialRelated?: BlogPost[];
  initialBaseUrl?: string;
  initialBusinessName?: string;
  slugProp?: string;
}) {
  const { blogs: liveBlogs, seo, loaded } = useCmsLive();
  const browserSlug = useSyncExternalStore(
    emptySubscribe,
    () => extractSlugFromLocation(),
    () => ""
  );
  const [fetchedResult, setFetchedResult] = useState<{
    slug: string;
    post: BlogPost | null;
  } | null>(null);

  const activeSlug = slugProp || browserSlug;
  const matchingLive = activeSlug
    ? liveBlogs.find((b) => b.slug === activeSlug) || null
    : null;

  useEffect(() => {
    if (!loaded || !activeSlug || matchingLive) {
      return;
    }
    let cancelled = false;
    fetch(cmsApiUrl(`/api/blogs?slug=${encodeURIComponent(activeSlug)}`), {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { blog?: BlogPost } | null) => {
        if (cancelled) return;
        setFetchedResult({
          slug: activeSlug,
          post:
            data?.blog && data.blog.status === "published" ? data.blog : null,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedResult({ slug: activeSlug, post: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loaded, activeSlug, matchingLive]);

  const fetchedForSlug =
    fetchedResult && fetchedResult.slug === activeSlug
      ? fetchedResult.post
      : null;
  const fetchingDirect =
    loaded &&
    Boolean(activeSlug) &&
    !matchingLive &&
    (!fetchedResult || fetchedResult.slug !== activeSlug);

  const post = loaded ? matchingLive || fetchedForSlug : initialPost;

  useEffect(() => {
    if (!post) return;
    document.title = post.seoTitle || post.title;
    const desc = post.seoDescription || post.excerpt;
    if (desc) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", desc);
    }
  }, [post]);

  if (!post && (!loaded || fetchingDirect || !activeSlug)) {
    return (
      <div className="bg-white py-16 sm:py-24">
        <div className="container-fluid max-w-4xl space-y-6 animate-pulse">
          <div className="h-4 w-32 rounded bg-[#F3EFE7]" />
          <div className="h-10 w-3/4 rounded-xl bg-[#F3EFE7]" />
          <div className="h-5 w-1/2 rounded bg-[#FAF8F5]" />
          <div className="aspect-[16/9] w-full rounded-3xl bg-[#F3EFE7]" />
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full rounded bg-[#FAF8F5]" />
            <div className="h-4 w-5/6 rounded bg-[#FAF8F5]" />
            <div className="h-4 w-2/3 rounded bg-[#FAF8F5]" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-white py-20 sm:py-28">
        <div className="container-fluid max-w-2xl text-center space-y-5">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDF2F2] text-[#A41C21]">
            <FileX2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#181B20]">
            Article Not Found
          </h1>
          <p className="text-base text-[#4F5560]">
            This article may have been moved or removed. Explore our latest
            Sri Lankan tax, company registration, and compliance guides below.
          </p>
          <div className="pt-2">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl bg-[#A41C21] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#821318] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Browse All Articles</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const baseUrl = (loaded ? seo.canonicalBaseUrl : initialBaseUrl).replace(
    /\/+$/,
    ""
  );
  const businessName = loaded ? seo.businessName : initialBusinessName;
  const related = (loaded ? liveBlogs : initialRelated)
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
      name: businessName,
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
