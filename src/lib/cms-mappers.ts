import { DEFAULT_SEO_SETTINGS } from "@/lib/seed-data";
import type {
  BannerSlot,
  BlogPost,
  BlogStatus,
  InquiryItem,
  MediaItem,
  SeoSettings,
} from "@/types/cms";

export function mapBlogRow(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category),
    excerpt: String(row.excerpt),
    content: String(row.content),
    coverImage: String(row.cover_image),
    coverAlt: String(row.cover_alt),
    author: String(row.author),
    readTime: String(row.read_time),
    status: (row.status === "draft" ? "draft" : "published") as BlogStatus,
    featured: Number(row.featured) === 1,
    seoTitle: String(row.seo_title || ""),
    seoDescription: String(row.seo_description || ""),
    seoKeywords: String(row.seo_keywords || ""),
    ogImage: String(row.og_image || ""),
    canonicalUrl: String(row.canonical_url || ""),
    publishedAt: String(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapBannerRow(row: Record<string, unknown>): BannerSlot {
  const key = String(row.key);
  const rawEnabled = row.enabled;
  const enabled =
    rawEnabled === undefined || rawEnabled === null
      ? key !== "popup_banner"
      : Number(rawEnabled) === 1;

  return {
    key,
    label: String(row.label),
    sectionGroup: row.section_group as BannerSlot["sectionGroup"],
    pageLocation: String(row.page_location),
    imageUrl: String(row.image_url),
    defaultImageUrl: String(row.default_image_url),
    altText: String(row.alt_text),
    badgeText: String(row.badge_text || ""),
    headline: String(row.headline || ""),
    subheadline: String(row.subheadline || ""),
    ctaLabel: String(row.cta_label || ""),
    ctaHref: String(row.cta_href || ""),
    enabled,
    updatedAt: String(row.updated_at),
  };
}

export function mapMediaRow(row: Record<string, unknown>): MediaItem {
  return {
    id: String(row.id),
    filename: String(row.filename),
    url: String(row.url),
    originalName: String(row.original_name),
    mimeType: String(row.mime_type),
    sizeBytes: Number(row.size_bytes),
    altText: String(row.alt_text || ""),
    createdAt: String(row.created_at),
  };
}

export function mapInquiryRow(row: Record<string, unknown>): InquiryItem {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone),
    companyName: String(row.company_name || ""),
    service: String(row.service),
    message: String(row.message),
    status: (row.status === "contacted" || row.status === "resolved"
      ? row.status
      : "new") as InquiryItem["status"],
    createdAt: String(row.created_at),
  };
}

export function normalizeSeoSettings(rawValue?: string | null): SeoSettings {
  if (!rawValue) return DEFAULT_SEO_SETTINGS;
  try {
    const parsed = JSON.parse(rawValue) as Partial<SeoSettings>;
    return {
      ...DEFAULT_SEO_SETTINGS,
      ...parsed,
      pageOverrides: {
        ...DEFAULT_SEO_SETTINGS.pageOverrides,
        ...(parsed.pageOverrides || {}),
      },
    };
  } catch {
    return DEFAULT_SEO_SETTINGS;
  }
}
