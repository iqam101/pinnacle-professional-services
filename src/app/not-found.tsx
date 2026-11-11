"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Home, MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { BlogPostViewClient } from "@/components/views/BlogPostViewClient";

const emptySubscribe = () => () => {};

export default function NotFoundPage() {
  const checked = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const pathname = useSyncExternalStore(
    emptySubscribe,
    () => window.location.pathname,
    () => ""
  );

  const match = pathname.match(/^\/blog\/([^/?#]+)\/?$/);
  const blogSlug =
    match && match[1] && match[1] !== "post"
      ? decodeURIComponent(match[1])
      : null;

  if (!checked) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center bg-white px-4">
        <div className="h-8 w-8 rounded-full border-2 border-[#A41C21] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (blogSlug) {
    return <BlogPostViewClient slugProp={blogSlug} />;
  }

  return (
    <div className="bg-[#FAF8F5] py-20 px-4">
      <div className="container-fluid max-w-2xl rounded-3xl border border-[#E6DFD3] bg-white p-8 sm:p-12 text-center shadow-sm space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF2F2] text-[#A41C21]">
          <Compass className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A41C21]">
            404 Page Not Found
          </p>
          <h1 className="font-display text-3xl font-extrabold text-[#181B20]">
            We Could Not Locate That Page
          </h1>
          <p className="text-sm sm:text-base text-[#646B76] leading-relaxed">
            The link may have moved or been updated. Explore our services or
            speak directly with our advisory desk in Colombo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-6 py-3 text-sm font-bold text-white hover:bg-[#821318] transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E6DFD3] bg-white px-6 py-3 text-sm font-bold text-[#181B20] hover:border-[#A41C21]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>View All Services</span>
          </Link>
          <a
            href={BRAND.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-[#1EBE5B] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>
    </div>
  );
}
