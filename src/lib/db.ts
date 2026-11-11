import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { cache } from "react";
import type { DatabaseSync as DatabaseSyncType } from "node:sqlite";
import {
  DEFAULT_BANNERS,
  DEFAULT_BLOGS,
  DEFAULT_SEO_SETTINGS,
} from "@/lib/seed-data";
import { CMS_SCHEMA_STATEMENTS } from "@/lib/cms-schema";
import {
  mapBannerRow,
  mapBlogRow,
  mapInquiryRow,
  mapMediaRow,
  normalizeSeoSettings,
} from "@/lib/cms-mappers";
import {
  estimateReadTime,
  sanitizeNoEmDash,
  slugify,
} from "@/lib/constants";
import type {
  BannerSlot,
  BlogPost,
  BlogStatus,
  InquiryItem,
  MediaItem,
  SeoSettings,
} from "@/types/cms";

const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const DB_PATH = path.join(DATA_DIR, "pinnacle.db");

const globalForDb = globalThis as unknown as {
  __pinnacleDb?: DatabaseSyncType;
  __pinnacleDbInitialized?: boolean;
};

function loadSqlite(): typeof import("node:sqlite") {
  const mod = process.getBuiltinModule?.("node:sqlite");
  if (!mod) {
    throw new Error("node:sqlite built-in module is unavailable in this Node runtime.");
  }
  return mod as typeof import("node:sqlite");
}

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function hashPassword(password: string, salt?: string): string {
  const usedSalt = salt || crypto.randomBytes(16).toString("hex");
  const derived = crypto
    .pbkdf2Sync(password, Buffer.from(usedSalt, "hex"), 100000, 32, "sha256")
    .toString("hex");
  return `pbkdf2$100000$${usedSalt}$${derived}`;
}

export function verifyPasswordHash(password: string, stored: string): boolean {
  if (stored.startsWith("pbkdf2$")) {
    const parts = stored.split("$");
    if (parts.length !== 4) return false;
    const iterations = Number(parts[1]);
    const saltHex = parts[2];
    const hashHex = parts[3];
    if (!Number.isFinite(iterations) || !saltHex || !hashHex) return false;
    const derived = crypto.pbkdf2Sync(
      password,
      Buffer.from(saltHex, "hex"),
      iterations,
      hashHex.length / 2,
      "sha256"
    );
    const storedBuf = Buffer.from(hashHex, "hex");
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  }

  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(hash, "hex");
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

function ensureColumnExists(
  db: DatabaseSyncType,
  table: string,
  column: string,
  alterSql: string
) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name?: string;
  }>;
  if (!cols.some((c) => c.name === column)) {
    db.exec(alterSql);
  }
}

function initDatabase(db: DatabaseSyncType) {
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  for (const stmt of CMS_SCHEMA_STATEMENTS) {
    db.exec(stmt);
  }

  // Upgrade older local databases seamlessly without data loss
  ensureColumnExists(
    db,
    "banners",
    "enabled",
    "ALTER TABLE banners ADD COLUMN enabled INTEGER NOT NULL DEFAULT 1;"
  );
  ensureColumnExists(
    db,
    "media",
    "storage_type",
    "ALTER TABLE media ADD COLUMN storage_type TEXT NOT NULL DEFAULT 'disk';"
  );

  // Seed banners idempotently
  const insertBanner = db.prepare(`
    INSERT OR IGNORE INTO banners (
      key, label, section_group, page_location, image_url, default_image_url,
      alt_text, badge_text, headline, subheadline, cta_label, cta_href, enabled, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const b of DEFAULT_BANNERS) {
    insertBanner.run(
      b.key,
      b.label,
      b.sectionGroup,
      b.pageLocation,
      b.imageUrl,
      b.defaultImageUrl,
      b.altText,
      b.badgeText,
      b.headline,
      b.subheadline,
      b.ctaLabel,
      b.ctaHref,
      b.enabled ? 1 : 0,
      b.updatedAt
    );
  }

  // Seed default SEO settings if missing
  const existingSeo = db
    .prepare("SELECT value FROM settings WHERE key = 'seo'")
    .get();
  if (!existingSeo) {
    db.prepare(
      "INSERT INTO settings (key, value, updated_at) VALUES ('seo', ?, ?)"
    ).run(JSON.stringify(DEFAULT_SEO_SETTINGS), DEFAULT_SEO_SETTINGS.updatedAt);
  }

  // Seed default blogs only on initial setup (prevents re-seeding after deliberate deletes)
  const seededRow = db
    .prepare("SELECT value FROM settings WHERE key = 'blogs_seeded'")
    .get();
  const blogCountRow = db
    .prepare("SELECT COUNT(*) as count FROM blogs")
    .get() as { count: number } | undefined;
  if (!seededRow && (!blogCountRow || Number(blogCountRow.count) === 0)) {
    const insertBlog = db.prepare(`
      INSERT INTO blogs (
        id, slug, title, category, excerpt, content, cover_image, cover_alt,
        author, read_time, status, featured, seo_title, seo_description,
        seo_keywords, og_image, canonical_url, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const post of DEFAULT_BLOGS) {
      insertBlog.run(
        post.id,
        post.slug,
        post.title,
        post.category,
        post.excerpt,
        post.content,
        post.coverImage,
        post.coverAlt,
        post.author,
        post.readTime,
        post.status,
        post.featured ? 1 : 0,
        post.seoTitle,
        post.seoDescription,
        post.seoKeywords,
        post.ogImage,
        post.canonicalUrl,
        post.publishedAt,
        post.createdAt,
        post.updatedAt
      );
    }
    db.prepare(
      "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('blogs_seeded', '1', ?)"
    ).run(new Date().toISOString());
  }

  // Seed initial admin password hash if not present
  const existingAdmin = db
    .prepare("SELECT value FROM settings WHERE key = 'admin_auth'")
    .get();
  if (!existingAdmin) {
    const defaultUser = process.env.ADMIN_USERNAME || "admin";
    const defaultPass = process.env.ADMIN_PASSWORD || "Pinnacle@2026";
    db.prepare(
      "INSERT INTO settings (key, value, updated_at) VALUES ('admin_auth', ?, ?)"
    ).run(
      JSON.stringify({
        username: defaultUser,
        passwordHash: hashPassword(defaultPass),
      }),
      new Date().toISOString()
    );
  }
}

export function getDb(): DatabaseSyncType {
  ensureDirectories();
  if (!globalForDb.__pinnacleDb) {
    const { DatabaseSync } = loadSqlite();
    globalForDb.__pinnacleDb = new DatabaseSync(DB_PATH);
  }
  if (!globalForDb.__pinnacleDbInitialized) {
    initDatabase(globalForDb.__pinnacleDb);
    globalForDb.__pinnacleDbInitialized = true;
  }
  return globalForDb.__pinnacleDb;
}

export const getPublishedBlogs = cache((): BlogPost[] => {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM blogs WHERE status = 'published' ORDER BY featured DESC, published_at DESC"
    )
    .all();
  return rows.map((r) => mapBlogRow(r));
});

export function getAllBlogs(): BlogPost[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM blogs ORDER BY updated_at DESC")
    .all();
  return rows.map((r) => mapBlogRow(r));
}

export const getBlogBySlug = cache((slug: string): BlogPost | null => {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM blogs WHERE slug = ? LIMIT 1")
    .get(slug);
  return row ? mapBlogRow(row) : null;
});

export function getBlogById(id: string): BlogPost | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM blogs WHERE id = ? LIMIT 1").get(id);
  return row ? mapBlogRow(row) : null;
}

export interface BlogInput {
  id?: string;
  slug?: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
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
}

export function upsertBlog(input: BlogInput): BlogPost {
  const db = getDb();
  const now = new Date().toISOString();
  const id = input.id?.trim() || `blog-${crypto.randomUUID().slice(0, 8)}`;
  const cleanTitle = sanitizeNoEmDash(input.title.trim());
  const cleanExcerpt = sanitizeNoEmDash(input.excerpt.trim());
  const cleanContent = sanitizeNoEmDash(input.content.trim());
  const baseSlug = slugify(input.slug?.trim() || cleanTitle) || id;

  // Ensure slug uniqueness when creating or updating
  let finalSlug = baseSlug;
  const conflict = db
    .prepare("SELECT id FROM blogs WHERE slug = ? AND id != ? LIMIT 1")
    .get(finalSlug, id);
  if (conflict) {
    finalSlug = `${baseSlug}-${id.slice(-4)}`;
  }

  const existing = getBlogById(id);
  const coverImage =
    input.coverImage?.trim() || "/images/banners/services-desk-ledger.jpg";
  const coverAlt = sanitizeNoEmDash(input.coverAlt?.trim() || cleanTitle);
  const author = sanitizeNoEmDash(
    input.author?.trim() || "Pinnacle Advisory Team"
  );
  const readTime = input.readTime?.trim() || estimateReadTime(cleanContent);
  const status: BlogStatus = input.status === "draft" ? "draft" : "published";
  const featured = input.featured ? 1 : 0;
  const seoTitle = sanitizeNoEmDash(input.seoTitle?.trim() || cleanTitle);
  const seoDescription = sanitizeNoEmDash(
    input.seoDescription?.trim() || cleanExcerpt
  );
  const seoKeywords = sanitizeNoEmDash(input.seoKeywords?.trim() || "");
  const ogImage = input.ogImage?.trim() || coverImage;
  const canonicalUrl = input.canonicalUrl?.trim() || "";
  const publishedAt =
    input.publishedAt?.trim() || existing?.publishedAt || now;
  const createdAt = existing?.createdAt || now;

  db.prepare(
    `
    INSERT INTO blogs (
      id, slug, title, category, excerpt, content, cover_image, cover_alt,
      author, read_time, status, featured, seo_title, seo_description,
      seo_keywords, og_image, canonical_url, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      title = excluded.title,
      category = excluded.category,
      excerpt = excluded.excerpt,
      content = excluded.content,
      cover_image = excluded.cover_image,
      cover_alt = excluded.cover_alt,
      author = excluded.author,
      read_time = excluded.read_time,
      status = excluded.status,
      featured = excluded.featured,
      seo_title = excluded.seo_title,
      seo_description = excluded.seo_description,
      seo_keywords = excluded.seo_keywords,
      og_image = excluded.og_image,
      canonical_url = excluded.canonical_url,
      published_at = excluded.published_at,
      updated_at = excluded.updated_at
  `
  ).run(
    id,
    finalSlug,
    cleanTitle,
    sanitizeNoEmDash(input.category.trim() || "Business Advisory"),
    cleanExcerpt,
    cleanContent,
    coverImage,
    coverAlt,
    author,
    readTime,
    status,
    featured,
    seoTitle,
    seoDescription,
    seoKeywords,
    ogImage,
    canonicalUrl,
    publishedAt,
    createdAt,
    now
  );

  return getBlogById(id)!;
}

export function deleteBlog(id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM blogs WHERE id = ?").run(id);
  return Number(res.changes) > 0;
}

export const getBanners = cache((): BannerSlot[] => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM banners").all();
  const order = DEFAULT_BANNERS.map((b) => b.key);
  return rows
    .map((r) => mapBannerRow(r))
    .sort((a, b) => {
      const ia = order.indexOf(a.key);
      const ib = order.indexOf(b.key);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
});

export const getBannerMap = cache((): Record<string, BannerSlot> => {
  const list = getBanners();
  const map: Record<string, BannerSlot> = {};
  for (const item of list) {
    map[item.key] = item;
  }
  return map;
});

export function updateBanner(
  key: string,
  patch: Partial<
    Pick<
      BannerSlot,
      | "imageUrl"
      | "altText"
      | "badgeText"
      | "headline"
      | "subheadline"
      | "ctaLabel"
      | "ctaHref"
      | "enabled"
    >
  >
): BannerSlot | null {
  const db = getDb();
  const existingRow = db
    .prepare("SELECT * FROM banners WHERE key = ? LIMIT 1")
    .get(key);
  if (!existingRow) return null;
  const current = mapBannerRow(existingRow);
  const now = new Date().toISOString();

  const nextImageUrl = patch.imageUrl?.trim() || current.imageUrl;
  const nextAltText = sanitizeNoEmDash(patch.altText ?? current.altText);
  const nextBadgeText = sanitizeNoEmDash(patch.badgeText ?? current.badgeText);
  const nextHeadline = sanitizeNoEmDash(patch.headline ?? current.headline);
  const nextSubheadline = sanitizeNoEmDash(
    patch.subheadline ?? current.subheadline
  );
  const nextCtaLabel = sanitizeNoEmDash(patch.ctaLabel ?? current.ctaLabel);
  const nextCtaHref = (patch.ctaHref ?? current.ctaHref).trim();
  const nextEnabled = patch.enabled !== undefined ? patch.enabled : current.enabled;

  db.prepare(
    `
    UPDATE banners SET
      image_url = ?,
      alt_text = ?,
      badge_text = ?,
      headline = ?,
      subheadline = ?,
      cta_label = ?,
      cta_href = ?,
      enabled = ?,
      updated_at = ?
    WHERE key = ?
  `
  ).run(
    nextImageUrl,
    nextAltText,
    nextBadgeText,
    nextHeadline,
    nextSubheadline,
    nextCtaLabel,
    nextCtaHref,
    nextEnabled ? 1 : 0,
    now,
    key
  );

  const updated = db
    .prepare("SELECT * FROM banners WHERE key = ? LIMIT 1")
    .get(key);
  return updated ? mapBannerRow(updated) : null;
}

export const getSeoSettings = cache((): SeoSettings => {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'seo' LIMIT 1")
    .get() as { value?: string } | undefined;
  return normalizeSeoSettings(row?.value);
});

export function updateSeoSettings(patch: Partial<SeoSettings>): SeoSettings {
  const db = getDb();
  const current = getSeoSettings();
  const now = new Date().toISOString();

  const sanitizeOverrides = (
    overrides: Record<string, SeoSettings["pageOverrides"][string]>
  ) => {
    const out: SeoSettings["pageOverrides"] = {};
    for (const [k, v] of Object.entries(overrides)) {
      out[k] = {
        title: sanitizeNoEmDash(v.title || ""),
        description: sanitizeNoEmDash(v.description || ""),
        keywords: sanitizeNoEmDash(v.keywords || ""),
        ogImage: (v.ogImage || "").trim(),
      };
    }
    return out;
  };

  const merged: SeoSettings = {
    ...current,
    ...patch,
    siteTitle: sanitizeNoEmDash(patch.siteTitle ?? current.siteTitle),
    titleTemplate: sanitizeNoEmDash(
      patch.titleTemplate ?? current.titleTemplate
    ),
    defaultDescription: sanitizeNoEmDash(
      patch.defaultDescription ?? current.defaultDescription
    ),
    defaultKeywords: sanitizeNoEmDash(
      patch.defaultKeywords ?? current.defaultKeywords
    ),
    businessName: sanitizeNoEmDash(patch.businessName ?? current.businessName),
    tagline: sanitizeNoEmDash(patch.tagline ?? current.tagline),
    address: sanitizeNoEmDash(patch.address ?? current.address),
    pageOverrides: sanitizeOverrides({
      ...current.pageOverrides,
      ...(patch.pageOverrides || {}),
    }),
    updatedAt: now,
  };

  db.prepare(
    `
    INSERT INTO settings (key, value, updated_at) VALUES ('seo', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `
  ).run(JSON.stringify(merged), now);

  return merged;
}

export function listMedia(): MediaItem[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM media ORDER BY created_at DESC")
    .all();
  return rows.map((r) => mapMediaRow(r));
}

export function addMedia(item: Omit<MediaItem, "id" | "createdAt">): MediaItem {
  const db = getDb();
  const id = `media-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  db.prepare(
    `
    INSERT INTO media (id, filename, url, original_name, mime_type, size_bytes, alt_text, storage_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'disk', ?)
  `
  ).run(
    id,
    item.filename,
    item.url,
    item.originalName,
    item.mimeType,
    item.sizeBytes,
    sanitizeNoEmDash(item.altText || ""),
    createdAt
  );
  return { id, ...item, createdAt };
}

export function deleteMedia(id: string): MediaItem | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM media WHERE id = ? LIMIT 1")
    .get(id);
  if (!row) return null;
  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  return mapMediaRow(row);
}

export function listInquiries(): InquiryItem[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM inquiries ORDER BY created_at DESC")
    .all();
  return rows.map((r) => mapInquiryRow(r));
}

export function createInquiry(
  input: Omit<InquiryItem, "id" | "status" | "createdAt">
): InquiryItem {
  const db = getDb();
  const id = `inq-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  db.prepare(
    `
    INSERT INTO inquiries (id, name, email, phone, company_name, service, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `
  ).run(
    id,
    sanitizeNoEmDash(input.name.trim()),
    input.email.trim(),
    input.phone.trim(),
    sanitizeNoEmDash(input.companyName.trim()),
    sanitizeNoEmDash(input.service.trim()),
    sanitizeNoEmDash(input.message.trim()),
    createdAt
  );
  return {
    id,
    ...input,
    status: "new",
    createdAt,
  };
}

export function updateInquiryStatus(
  id: string,
  status: InquiryItem["status"]
): boolean {
  const db = getDb();
  const res = db
    .prepare("UPDATE inquiries SET status = ? WHERE id = ?")
    .run(status, id);
  return Number(res.changes) > 0;
}

export function getAdminAuthConfig(): {
  username: string;
  passwordHash: string;
} {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'admin_auth' LIMIT 1")
    .get() as { value?: string } | undefined;
  if (!row?.value) {
    return {
      username: process.env.ADMIN_USERNAME || "admin",
      passwordHash: hashPassword(
        process.env.ADMIN_PASSWORD || "Pinnacle@2026"
      ),
    };
  }
  return JSON.parse(row.value) as { username: string; passwordHash: string };
}

export function updateAdminPassword(newPassword: string) {
  const db = getDb();
  const current = getAdminAuthConfig();
  const updated = {
    username: current.username,
    passwordHash: hashPassword(newPassword),
  };
  db.prepare(
    "UPDATE settings SET value = ?, updated_at = ? WHERE key = 'admin_auth'"
  ).run(JSON.stringify(updated), new Date().toISOString());
}
