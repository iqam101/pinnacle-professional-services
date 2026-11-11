import type { Metadata } from "next";
import { BlogPostViewClient } from "@/components/views/BlogPostViewClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Insights & Compliance Guide | Pinnacle Professional Services",
  description:
    "Read the latest corporate secretarial, tax, VAT, TIN, bookkeeping, and HR compliance articles from Pinnacle Professional Services Private Limited.",
};

export default function DynamicBlogPostShellPage() {
  return <BlogPostViewClient />;
}
