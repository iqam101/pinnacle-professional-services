export type BlogStatus = "published" | "draft";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  author: string;
  readTime: string;
  status: BlogStatus;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  canonicalUrl: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerSlot {
  key: string;
  label: string;
  sectionGroup: "hero" | "sections" | "services" | "brand";
  pageLocation: string;
  imageUrl: string;
  altText: string;
  badgeText: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  defaultImageUrl: string;
  updatedAt: string;
}

export interface PageSeoOverride {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export interface SeoSettings {
  siteTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string;
  canonicalBaseUrl: string;
  ogDefaultImage: string;
  twitterHandle: string;
  googleVerification: string;
  gaMeasurementId: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  openingHours: string;
  facebookUrl: string;
  priceRange: string;
  pageOverrides: Record<string, PageSeoOverride>;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  createdAt: string;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  service: string;
  message: string;
  status: "new" | "contacted" | "resolved";
  createdAt: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceDefinition {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  tagline: string;
  summary: string;
  heroDescription: string;
  bannerKey: string;
  iconName:
    | "Building2"
    | "FileCheck2"
    | "Calculator"
    | "Landmark"
    | "Users"
    | "Globe";
  startingNote: string;
  highlights: string[];
  deliverables: {
    title: string;
    description: string;
  }[];
  idealFor: string[];
  faqs: ServiceFaq[];
}
