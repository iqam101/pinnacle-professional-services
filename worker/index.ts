import { CMS_SCHEMA_STATEMENTS } from "../src/lib/cms-schema";
import {
  mapBannerRow,
  mapBlogRow,
  mapInquiryRow,
  mapMediaRow,
  normalizeSeoSettings,
} from "../src/lib/cms-mappers";
import {
  estimateReadTime,
  sanitizeNoEmDash,
  slugify,
} from "../src/lib/constants";
import {
  DEFAULT_BANNERS,
  DEFAULT_BLOGS,
  DEFAULT_SEO_SETTINGS,
} from "../src/lib/seed-data";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createWebSessionToken,
  hashPasswordPbkdf2,
  randomHex,
  verifyPasswordPbkdf2,
  verifyWebSessionToken,
} from "../src/lib/web-crypto";
import type {
  BannerSlot,
  BlogPost,
  BlogStatus,
  InquiryItem,
  MediaItem,
  SeoSettings,
} from "../src/types/cms";

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
}

interface R2ObjectBody {
  body: ReadableStream<Uint8Array>;
  httpMetadata?: { contentType?: string };
}

interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
}

interface AssetsFetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface Env {
  DB?: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  ASSETS: AssetsFetcher;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  SESSION_SECRET?: string;
  CORS_ORIGINS?: string;
  PUBLIC_SITE_URL?: string;
}

const D1_MAX_MEDIA_BYTES = 3_500_000; // 3.5 MB when storing chunked BLOBs inside D1 (no R2 card needed)
const R2_MAX_MEDIA_BYTES = 6 * 1024 * 1024;
const D1_CHUNK_BYTES = 256_000; // 250 KB chunks well within D1 2 MB row ceiling

const ALLOWED_IMAGE_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

let initPromise: Promise<void> | null = null;

function resolvePublicCorsHeaders(request: Request, env: Env): HeadersInit {
  const configured = (env.CORS_ORIGINS || "*").trim();
  const origin = request.headers.get("Origin");
  let allowOrigin = "*";

  if (configured !== "*") {
    const allowedList = configured
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (origin && allowedList.includes(origin)) {
      allowOrigin = origin;
    } else if (allowedList.length > 0) {
      allowOrigin = allowedList[0];
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...(allowOrigin !== "*" ? { Vary: "Origin" } : {}),
  };
}

function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: HeadersInit = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function getCookieValue(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  const parts = header.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
}

function buildSessionCookieHeader(
  token: string,
  maxAge: number,
  isHttps: boolean
): string {
  const attrs = [
    `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isHttps) {
    attrs.push("Secure");
  }
  return attrs.join("; ");
}

function isHttpsRequest(request: Request): boolean {
  return (
    request.url.startsWith("https://") ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

async function ensureD1ColumnExists(
  db: D1Database,
  table: string,
  column: string,
  alterSql: string
) {
  const info = await db.prepare(`PRAGMA table_info(${table})`).all<{ name?: string }>();
  const exists = (info.results || []).some((row) => row.name === column);
  if (!exists) {
    await db.prepare(alterSql).run();
  }
}

async function initD1Database(db: D1Database, env: Env): Promise<void> {
  await db.batch(CMS_SCHEMA_STATEMENTS.map((sql) => db.prepare(sql)));
  await ensureD1ColumnExists(
    db,
    "banners",
    "enabled",
    "ALTER TABLE banners ADD COLUMN enabled INTEGER NOT NULL DEFAULT 1"
  );
  await ensureD1ColumnExists(
    db,
    "media",
    "storage_type",
    "ALTER TABLE media ADD COLUMN storage_type TEXT NOT NULL DEFAULT 'd1'"
  );

  const now = new Date().toISOString();

  const bannerBatch = DEFAULT_BANNERS.map((banner) =>
    db
      .prepare(
        `
      INSERT OR IGNORE INTO banners (
        key, label, section_group, page_location, image_url, default_image_url,
        alt_text, badge_text, headline, subheadline, cta_label, cta_href, enabled, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .bind(
        banner.key,
        banner.label,
        banner.sectionGroup,
        banner.pageLocation,
        banner.imageUrl,
        banner.defaultImageUrl,
        banner.altText,
        banner.badgeText,
        banner.headline,
        banner.subheadline,
        banner.ctaLabel,
        banner.ctaHref,
        banner.enabled ? 1 : 0,
        banner.updatedAt
      )
  );
  await db.batch(bannerBatch);

  await db
    .prepare(
      "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('seo', ?, ?)"
    )
    .bind(JSON.stringify(DEFAULT_SEO_SETTINGS), now)
    .run();

  const blogsSeeded = await db
    .prepare("SELECT value FROM settings WHERE key = 'blogs_seeded' LIMIT 1")
    .first<{ value?: string }>();

  if (!blogsSeeded) {
    const existingBlogs = await db
      .prepare("SELECT COUNT(*) as count FROM blogs")
      .first<{ count?: number }>();
    if ((existingBlogs?.count ?? 0) === 0) {
      const blogStatements = DEFAULT_BLOGS.map((post) =>
        db
          .prepare(
            `
          INSERT OR IGNORE INTO blogs (
            id, slug, title, category, excerpt, content, cover_image, cover_alt,
            author, read_time, status, featured, seo_title, seo_description,
            seo_keywords, og_image, canonical_url, published_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
          )
          .bind(
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
          )
      );
      await db.batch(blogStatements);
    }
    await db
      .prepare(
        "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('blogs_seeded', '1', ?)"
      )
      .bind(now)
      .run();
  }

  const existingAdmin = await db
    .prepare("SELECT value FROM settings WHERE key = 'admin_auth' LIMIT 1")
    .first<{ value?: string }>();

  if (!existingAdmin) {
    const defaultUser = (env.ADMIN_USERNAME || "admin").trim() || "admin";
    const defaultPass = env.ADMIN_PASSWORD || "Pinnacle@2026";
    const passwordHash = await hashPasswordPbkdf2(defaultPass);
    await db
      .prepare(
        "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('admin_auth', ?, ?)"
      )
      .bind(
        JSON.stringify({ username: defaultUser, passwordHash }),
        now
      )
      .run();
  }

  if (!env.ADMIN_SESSION_SECRET && !env.SESSION_SECRET) {
    await db
      .prepare(
        "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('session_secret', ?, ?)"
      )
      .bind(randomHex(32), now)
      .run();
  }

  const migratedLiveUrl = await db
    .prepare(
      "SELECT value FROM settings WHERE key = 'live_site_url_migrated_v1' LIMIT 1"
    )
    .first<{ value?: string }>();
  if (!migratedLiveUrl) {
    const seoRow = await db
      .prepare("SELECT value FROM settings WHERE key = 'seo' LIMIT 1")
      .first<{ value?: string }>();
    if (seoRow?.value) {
      const currentSeo = normalizeSeoSettings(seoRow.value);
      if (currentSeo.canonicalBaseUrl === "https://pinnacleprofessionalservices.lk") {
        await db
          .prepare(
            "UPDATE settings SET value = ?, updated_at = ? WHERE key = 'seo'"
          )
          .bind(
            JSON.stringify({
              ...currentSeo,
              canonicalBaseUrl: DEFAULT_SEO_SETTINGS.canonicalBaseUrl,
            }),
            now
          )
          .run();
      }
    }
    await db
      .prepare(
        "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('live_site_url_migrated_v1', '1', ?)"
      )
      .bind(now)
      .run();
  }
}

async function ensureDbReady(env: Env): Promise<D1Database> {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding (DB) is not configured. Bind a D1 database to DB in Workers Settings -> Bindings."
    );
  }
  const db = env.DB;
  if (!initPromise) {
    initPromise = initD1Database(db, env).catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
  return db;
}

async function getSessionSecret(db: D1Database, env: Env): Promise<string> {
  const fromEnv = (env.ADMIN_SESSION_SECRET || env.SESSION_SECRET || "").trim();
  if (fromEnv) return fromEnv;

  const row = await db
    .prepare("SELECT value FROM settings WHERE key = 'session_secret' LIMIT 1")
    .first<{ value?: string }>();
  if (row?.value) return row.value;

  const generated = randomHex(32);
  await db
    .prepare(
      "INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('session_secret', ?, ?)"
    )
    .bind(generated, new Date().toISOString())
    .run();

  const saved = await db
    .prepare("SELECT value FROM settings WHERE key = 'session_secret' LIMIT 1")
    .first<{ value?: string }>();
  return saved?.value || generated;
}

async function requireAdminSession(
  request: Request,
  db: D1Database,
  env: Env
): Promise<{ username: string } | null> {
  const token = getCookieValue(request, ADMIN_SESSION_COOKIE_NAME);
  if (!token) return null;
  const secret = await getSessionSecret(db, env);
  return verifyWebSessionToken(token, secret);
}

async function getAdminCredentials(
  db: D1Database,
  env: Env
): Promise<{ username: string; passwordHash: string } | null> {
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = 'admin_auth' LIMIT 1")
    .first<{ value?: string }>();
  if (row?.value) {
    try {
      const parsed = JSON.parse(row.value) as {
        username?: string;
        passwordHash?: string;
      };
      if (parsed.username && parsed.passwordHash) {
        return { username: parsed.username, passwordHash: parsed.passwordHash };
      }
    } catch {
      // Fall through to env fallback
    }
  }
  const username = (env.ADMIN_USERNAME || "admin").trim() || "admin";
  const passwordHash = await hashPasswordPbkdf2(
    env.ADMIN_PASSWORD || "Pinnacle@2026"
  );
  return { username, passwordHash };
}

async function getSeoFromD1(db: D1Database, env?: Env): Promise<SeoSettings> {
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = 'seo' LIMIT 1")
    .first<{ value?: string }>();
  const seo = normalizeSeoSettings(row?.value);
  const envPublicUrl = (env?.PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  if (envPublicUrl) {
    return {
      ...seo,
      canonicalBaseUrl: envPublicUrl,
    };
  }
  return seo;
}

async function getBannersFromD1(db: D1Database): Promise<BannerSlot[]> {
  const { results } = await db
    .prepare("SELECT * FROM banners ORDER BY rowid ASC")
    .all<Record<string, unknown>>();
  return (results || []).map((row) => mapBannerRow(row));
}

async function getPublishedBlogsFromD1(db: D1Database): Promise<BlogPost[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM blogs WHERE status = 'published' ORDER BY featured DESC, published_at DESC"
    )
    .all<Record<string, unknown>>();
  return (results || []).map((row) => mapBlogRow(row));
}

async function getAllBlogsFromD1(db: D1Database): Promise<BlogPost[]> {
  const { results } = await db
    .prepare("SELECT * FROM blogs ORDER BY updated_at DESC")
    .all<Record<string, unknown>>();
  return (results || []).map((row) => mapBlogRow(row));
}

async function getBlogBySlugFromD1(
  db: D1Database,
  slug: string
): Promise<BlogPost | null> {
  const row = await db
    .prepare("SELECT * FROM blogs WHERE slug = ? LIMIT 1")
    .bind(slug)
    .first<Record<string, unknown>>();
  return row ? mapBlogRow(row) : null;
}

async function getBlogByIdFromD1(
  db: D1Database,
  id: string
): Promise<BlogPost | null> {
  const row = await db
    .prepare("SELECT * FROM blogs WHERE id = ? LIMIT 1")
    .bind(id)
    .first<Record<string, unknown>>();
  return row ? mapBlogRow(row) : null;
}

async function listMediaFromD1(db: D1Database): Promise<MediaItem[]> {
  const { results } = await db
    .prepare("SELECT * FROM media ORDER BY created_at DESC")
    .all<Record<string, unknown>>();
  return (results || []).map((row) => mapMediaRow(row));
}

async function listInquiriesFromD1(db: D1Database): Promise<InquiryItem[]> {
  const { results } = await db
    .prepare("SELECT * FROM inquiries ORDER BY created_at DESC")
    .all<Record<string, unknown>>();
  return (results || []).map((row) => mapInquiryRow(row));
}

function toUint8Array(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (Array.isArray(value)) {
    return new Uint8Array(value.map((n) => Number(n)));
  }
  return new Uint8Array(0);
}

async function renderLandingHtml(env: Env): Promise<Response> {
  let publicSiteUrl = (env.PUBLIC_SITE_URL || "").trim();
  let dbReady = Boolean(env.DB);
  if (env.DB) {
    try {
      const db = await ensureDbReady(env);
      const seo = await getSeoFromD1(db);
      if (!publicSiteUrl && seo.canonicalBaseUrl) {
        publicSiteUrl = seo.canonicalBaseUrl;
      }
      dbReady = true;
    } catch {
      dbReady = false;
    }
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Pinnacle Admin CMS Backend</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: #FAF8F5; color: #181B20; min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .card { max-width: 520px; width: 100%; background: #FFFFFF; border: 1px solid #E6DFD3; border-radius: 20px; padding: 32px; box-shadow: 0 18px 45px rgba(24,27,32,0.08); }
    .badge { display: inline-block; background: #FDF2F2; color: #A41C21; border: 1px solid rgba(164,28,33,0.2); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 12px; border-radius: 999px; margin-bottom: 14px; }
    h1 { margin: 0 0 10px; font-size: 24px; line-height: 1.25; }
    p { margin: 0 0 20px; color: #4F5560; font-size: 14px; line-height: 1.6; }
    .status { font-size: 13px; padding: 10px 14px; border-radius: 12px; background: ${dbReady ? "#ECFDF5" : "#FFFBEB"}; color: ${dbReady ? "#065F46" : "#92400E"}; border: 1px solid ${dbReady ? "#A7F3D0" : "#FDE68A"}; margin-bottom: 22px; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    a.btn { text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 18px; border-radius: 12px; display: inline-flex; align-items: center; }
    a.primary { background: #A41C21; color: #FFFFFF; }
    a.secondary { background: #FFFFFF; color: #181B20; border: 1px solid #DFD7C8; }
  </style>
</head>
<body>
  <main class="card">
    <div class="badge">Cloudflare Workers + D1 CMS</div>
    <h1>Pinnacle Professional Services Admin Portal</h1>
    <p>This Cloudflare Worker powers your Admin CMS, D1 database, image uploads, blogs, banners, SEO settings, and visitor entry pop-up for your Hostinger static frontend.</p>
    <div class="status">${dbReady ? "Database Status: Cloudflare D1 connected and ready." : "Database Status: Bind a D1 database to variable name DB in Worker Settings."}</div>
    <div class="actions">
      <a class="btn primary" href="/admin/login">Open Admin Portal</a>
      ${publicSiteUrl && publicSiteUrl.startsWith("http") ? `<a class="btn secondary" href="${publicSiteUrl.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">Open Public Website</a>` : ""}
    </div>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}

async function handleApi(
  request: Request,
  url: URL,
  env: Env
): Promise<Response> {
  const cors = resolvePublicCorsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const pathname = url.pathname;

  if (pathname === "/api/health" && request.method === "GET") {
    try {
      const db = await ensureDbReady(env);
      const seo = await getSeoFromD1(db);
      return jsonResponse(
        {
          ok: true,
          mode: "cloudflare-worker",
          dbReady: true,
          storage: env.MEDIA_BUCKET ? "r2" : "d1",
          siteUrl: (env.PUBLIC_SITE_URL || seo.canonicalBaseUrl || "").trim(),
        },
        200,
        cors
      );
    } catch (err) {
      return jsonResponse(
        {
          ok: false,
          mode: "cloudflare-worker",
          dbReady: false,
          error: err instanceof Error ? err.message : "Database unavailable.",
        },
        503,
        cors
      );
    }
  }

  let db: D1Database;
  try {
    db = await ensureDbReady(env);
  } catch (err) {
    return jsonResponse(
      {
        error:
          err instanceof Error
            ? err.message
            : "Cloudflare D1 database is not bound to DB.",
      },
      503,
      cors
    );
  }

  // Public bootstrap (Hostinger frontend sync)
  if (pathname === "/api/public/bootstrap" && request.method === "GET") {
    const [banners, seo, blogs] = await Promise.all([
      getBannersFromD1(db),
      getSeoFromD1(db, env),
      getPublishedBlogsFromD1(db),
    ]);
    const bannerMap: Record<string, BannerSlot> = {};
    for (const banner of banners) {
      bannerMap[banner.key] = banner;
    }
    return jsonResponse({ banners, bannerMap, seo, blogs }, 200, cors);
  }

  // Admin bootstrap
  if (pathname === "/api/admin/bootstrap" && request.method === "GET") {
    const session = await requireAdminSession(request, db, env);
    if (!session) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const [blogs, banners, seo, media, inquiries] = await Promise.all([
      getAllBlogsFromD1(db),
      getBannersFromD1(db),
      getSeoFromD1(db, env),
      listMediaFromD1(db),
      listInquiriesFromD1(db),
    ]);
    return jsonResponse({
      username: session.username,
      blogs,
      banners,
      seo,
      media,
      inquiries,
    });
  }

  // Auth: login
  if (pathname === "/api/auth/login" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        username?: string;
        password?: string;
      };
      const username = (body.username || "").trim();
      const password = body.password || "";
      if (!username || !password) {
        return jsonResponse(
          { error: "Username and password are required." },
          400
        );
      }

      const creds = await getAdminCredentials(db, env);
      if (
        !creds ||
        creds.username !== username ||
        !(await verifyPasswordPbkdf2(password, creds.passwordHash))
      ) {
        return jsonResponse({ error: "Invalid username or password." }, 401);
      }

      const secret = await getSessionSecret(db, env);
      const token = await createWebSessionToken(username, secret);
      const cookie = buildSessionCookieHeader(
        token,
        ADMIN_SESSION_MAX_AGE_SECONDS,
        isHttpsRequest(request)
      );
      return jsonResponse({ ok: true, username }, 200, {
        "Set-Cookie": cookie,
      });
    } catch {
      return jsonResponse(
        { error: "Unable to process sign-in request." },
        500
      );
    }
  }

  // Auth: logout
  if (pathname === "/api/auth/logout" && request.method === "POST") {
    const cookie = buildSessionCookieHeader("", 0, isHttpsRequest(request));
    return jsonResponse({ ok: true }, 200, { "Set-Cookie": cookie });
  }

  // Auth: update password
  if (pathname === "/api/auth/password" && request.method === "POST") {
    const session = await requireAdminSession(request, db, env);
    if (!session) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    try {
      const body = (await request.json()) as {
        currentPassword?: string;
        newPassword?: string;
      };
      const currentPassword = body.currentPassword || "";
      const newPassword = body.newPassword || "";
      const creds = await getAdminCredentials(db, env);
      if (
        !creds ||
        creds.username !== session.username ||
        !(await verifyPasswordPbkdf2(currentPassword, creds.passwordHash))
      ) {
        return jsonResponse(
          { error: "Current password is incorrect." },
          400
        );
      }
      if (newPassword.length < 8) {
        return jsonResponse(
          { error: "New password must be at least 8 characters long." },
          400
        );
      }

      const nextHash = await hashPasswordPbkdf2(newPassword);
      const now = new Date().toISOString();
      await db
        .prepare(
          `
          INSERT INTO settings (key, value, updated_at) VALUES ('admin_auth', ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `
        )
        .bind(
          JSON.stringify({ username: session.username, passwordHash: nextHash }),
          now
        )
        .run();

      return jsonResponse({ ok: true });
    } catch {
      return jsonResponse({ error: "Failed to update password." }, 500);
    }
  }

  // Blogs collection
  if (pathname === "/api/blogs") {
    if (request.method === "GET") {
      const session = await requireAdminSession(request, db, env);
      const slug = url.searchParams.get("slug")?.trim();
      if (slug) {
        const post = await getBlogBySlugFromD1(db, slug);
        if (!post || (post.status !== "published" && !session)) {
          return jsonResponse({ error: "Blog post not found." }, 404, cors);
        }
        return jsonResponse({ blog: post }, 200, cors);
      }
      const blogs = session
        ? await getAllBlogsFromD1(db)
        : await getPublishedBlogsFromD1(db);
      return jsonResponse({ blogs }, 200, cors);
    }

    if (request.method === "POST") {
      const session = await requireAdminSession(request, db, env);
      if (!session) {
        return jsonResponse({ error: "Unauthorized" }, 401);
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
          return jsonResponse(
            { error: "Blog title and content are required." },
            400
          );
        }

        const now = new Date().toISOString();
        const id = body.id || globalThis.crypto.randomUUID();
        const cleanTitle = sanitizeNoEmDash(body.title.trim());
        const cleanContent = sanitizeNoEmDash(body.content.trim());
        const rawExcerpt =
          body.excerpt?.trim() ||
          cleanContent.replace(/[#*\-`>]/g, "").slice(0, 160).trim();
        const cleanExcerpt = sanitizeNoEmDash(rawExcerpt);

        const baseSlug = slugify(body.slug || cleanTitle) || `post-${id.slice(0, 6)}`;
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (true) {
          const conflict = await db
            .prepare("SELECT id FROM blogs WHERE slug = ? LIMIT 1")
            .bind(uniqueSlug)
            .first<{ id?: string }>();
          if (!conflict || conflict.id === id) break;
          uniqueSlug = `${baseSlug}-${counter++}`;
        }

        const readTime = body.readTime || estimateReadTime(cleanContent);
        const status: BlogStatus =
          body.status === "draft" ? "draft" : "published";
        const featured = body.featured ? 1 : 0;
        const coverImage =
          body.coverImage?.trim() || "/images/banners/services-desk-ledger.webp";
        const coverAlt = sanitizeNoEmDash(body.coverAlt?.trim() || cleanTitle);
        const author = body.author?.trim() || "Pinnacle Editorial Team";
        const publishedAt = body.publishedAt || now;

        await db
          .prepare(
            `
            INSERT INTO blogs (
              id, slug, title, category, excerpt, content, cover_image, cover_alt,
              author, read_time, status, featured, seo_title, seo_description,
              seo_keywords, og_image, canonical_url, published_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
          )
          .bind(
            id,
            uniqueSlug,
            cleanTitle,
            body.category || "Business Advisory",
            cleanExcerpt,
            cleanContent,
            coverImage,
            coverAlt,
            author,
            readTime,
            status,
            featured,
            sanitizeNoEmDash(body.seoTitle?.trim() || ""),
            sanitizeNoEmDash(body.seoDescription?.trim() || ""),
            body.seoKeywords?.trim() || "",
            body.ogImage?.trim() || "",
            body.canonicalUrl?.trim() || "",
            publishedAt,
            now,
            now
          )
          .run();

        const saved = await getBlogByIdFromD1(db, id);
        return jsonResponse({ blog: saved }, 201);
      } catch {
        return jsonResponse({ error: "Unable to create blog post." }, 500);
      }
    }
  }

  // Individual blog item (/api/blogs/:id)
  if (pathname.startsWith("/api/blogs/")) {
    const id = decodeURIComponent(pathname.slice("/api/blogs/".length));
    if (!id || id.includes("/")) {
      return jsonResponse({ error: "Invalid blog id" }, 400);
    }

    const session = await requireAdminSession(request, db, env);
    if (!session) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    if (request.method === "PUT") {
      try {
        const existing = await getBlogByIdFromD1(db, id);
        if (!existing) {
          return jsonResponse({ error: "Blog not found" }, 404);
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

        const now = new Date().toISOString();
        const cleanTitle = sanitizeNoEmDash(
          (body.title ?? existing.title).trim()
        );
        const cleanContent = sanitizeNoEmDash(
          (body.content ?? existing.content).trim()
        );
        const cleanExcerpt = sanitizeNoEmDash(
          (body.excerpt ?? existing.excerpt).trim()
        );
        const baseSlug =
          slugify(body.slug ?? existing.slug ?? cleanTitle) ||
          `post-${id.slice(0, 6)}`;
        let uniqueSlug = baseSlug;
        let counter = 1;
        while (true) {
          const conflict = await db
            .prepare("SELECT id FROM blogs WHERE slug = ? LIMIT 1")
            .bind(uniqueSlug)
            .first<{ id?: string }>();
          if (!conflict || conflict.id === id) break;
          uniqueSlug = `${baseSlug}-${counter++}`;
        }

        const status: BlogStatus =
          (body.status ?? existing.status) === "draft" ? "draft" : "published";
        const featured = (body.featured ?? existing.featured) ? 1 : 0;

        await db
          .prepare(
            `
            UPDATE blogs SET
              slug = ?, title = ?, category = ?, excerpt = ?, content = ?,
              cover_image = ?, cover_alt = ?, author = ?, read_time = ?,
              status = ?, featured = ?, seo_title = ?, seo_description = ?,
              seo_keywords = ?, og_image = ?, canonical_url = ?, published_at = ?,
              updated_at = ?
            WHERE id = ?
          `
          )
          .bind(
            uniqueSlug,
            cleanTitle,
            body.category ?? existing.category,
            cleanExcerpt,
            cleanContent,
            (body.coverImage ?? existing.coverImage).trim(),
            sanitizeNoEmDash((body.coverAlt ?? existing.coverAlt).trim()),
            (body.author ?? existing.author).trim(),
            body.readTime || estimateReadTime(cleanContent),
            status,
            featured,
            sanitizeNoEmDash((body.seoTitle ?? existing.seoTitle).trim()),
            sanitizeNoEmDash(
              (body.seoDescription ?? existing.seoDescription).trim()
            ),
            (body.seoKeywords ?? existing.seoKeywords).trim(),
            (body.ogImage ?? existing.ogImage).trim(),
            (body.canonicalUrl ?? existing.canonicalUrl).trim(),
            body.publishedAt ?? existing.publishedAt,
            now,
            id
          )
          .run();

        const updated = await getBlogByIdFromD1(db, id);
        return jsonResponse({ blog: updated });
      } catch {
        return jsonResponse({ error: "Unable to update blog post." }, 500);
      }
    }

    if (request.method === "DELETE") {
      const existing = await getBlogByIdFromD1(db, id);
      if (!existing) {
        return jsonResponse({ error: "Blog not found" }, 404);
      }
      await db.prepare("DELETE FROM blogs WHERE id = ?").bind(id).run();
      return jsonResponse({ ok: true });
    }
  }

  // Banners
  if (pathname === "/api/banners") {
    if (request.method === "GET") {
      const banners = await getBannersFromD1(db);
      return jsonResponse({ banners }, 200, cors);
    }

    if (request.method === "PUT") {
      const session = await requireAdminSession(request, db, env);
      if (!session) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      try {
        const body = (await request.json()) as {
          key?: string;
          resetToDefault?: boolean;
          imageUrl?: string;
          altText?: string;
          badgeText?: string;
          headline?: string;
          subheadline?: string;
          ctaLabel?: string;
          ctaHref?: string;
          enabled?: boolean;
        };

        if (!body.key) {
          return jsonResponse({ error: "Banner key is required." }, 400);
        }

        const existingRow = await db
          .prepare("SELECT * FROM banners WHERE key = ? LIMIT 1")
          .bind(body.key)
          .first<Record<string, unknown>>();
        if (!existingRow) {
          return jsonResponse({ error: "Banner slot not found." }, 404);
        }
        const current = mapBannerRow(existingRow);
        const now = new Date().toISOString();

        if (body.resetToDefault) {
          const def = DEFAULT_BANNERS.find((b) => b.key === body.key);
          if (!def) {
            return jsonResponse({ error: "Banner slot not found." }, 404);
          }
          await db
            .prepare(
              `
              UPDATE banners SET
                image_url = ?, alt_text = ?, badge_text = ?, headline = ?,
                subheadline = ?, cta_label = ?, cta_href = ?, enabled = ?, updated_at = ?
              WHERE key = ?
            `
            )
            .bind(
              def.defaultImageUrl,
              def.altText,
              def.badgeText,
              def.headline,
              def.subheadline,
              def.ctaLabel,
              def.ctaHref,
              def.enabled ? 1 : 0,
              now,
              body.key
            )
            .run();
        } else {
          await db
            .prepare(
              `
              UPDATE banners SET
                image_url = ?, alt_text = ?, badge_text = ?, headline = ?,
                subheadline = ?, cta_label = ?, cta_href = ?, enabled = ?, updated_at = ?
              WHERE key = ?
            `
            )
            .bind(
              body.imageUrl ?? current.imageUrl,
              sanitizeNoEmDash(body.altText ?? current.altText),
              sanitizeNoEmDash(body.badgeText ?? current.badgeText),
              sanitizeNoEmDash(body.headline ?? current.headline),
              sanitizeNoEmDash(body.subheadline ?? current.subheadline),
              sanitizeNoEmDash(body.ctaLabel ?? current.ctaLabel),
              body.ctaHref ?? current.ctaHref,
              (body.enabled ?? current.enabled) ? 1 : 0,
              now,
              body.key
            )
            .run();
        }

        const updatedRow = await db
          .prepare("SELECT * FROM banners WHERE key = ? LIMIT 1")
          .bind(body.key)
          .first<Record<string, unknown>>();
        return jsonResponse({
          banner: updatedRow ? mapBannerRow(updatedRow) : null,
        });
      } catch {
        return jsonResponse({ error: "Unable to update banner." }, 500);
      }
    }
  }

  // SEO
  if (pathname === "/api/seo") {
    if (request.method === "GET") {
      const seo = await getSeoFromD1(db, env);
      return jsonResponse({ seo }, 200, cors);
    }

    if (request.method === "PUT") {
      const session = await requireAdminSession(request, db, env);
      if (!session) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      try {
        const patch = (await request.json()) as Partial<SeoSettings>;
        const current = await getSeoFromD1(db);
        const now = new Date().toISOString();

        const rawOverrides = {
          ...current.pageOverrides,
          ...(patch.pageOverrides || {}),
        };
        const cleanOverrides: SeoSettings["pageOverrides"] = {};
        for (const [k, v] of Object.entries(rawOverrides)) {
          cleanOverrides[k] = {
            title: sanitizeNoEmDash(v?.title || ""),
            description: sanitizeNoEmDash(v?.description || ""),
            keywords: sanitizeNoEmDash(v?.keywords || ""),
            ogImage: (v?.ogImage || "").trim(),
          };
        }

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
          businessName: sanitizeNoEmDash(
            patch.businessName ?? current.businessName
          ),
          tagline: sanitizeNoEmDash(patch.tagline ?? current.tagline),
          address: sanitizeNoEmDash(patch.address ?? current.address),
          pageOverrides: cleanOverrides,
          updatedAt: now,
        };

        await db
          .prepare(
            `
            INSERT INTO settings (key, value, updated_at) VALUES ('seo', ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
          `
          )
          .bind(JSON.stringify(merged), now)
          .run();

        return jsonResponse({ seo: merged });
      } catch {
        return jsonResponse({ error: "Unable to update SEO settings." }, 500);
      }
    }
  }

  // Media collection (/api/media)
  if (pathname === "/api/media") {
    if (request.method === "GET") {
      const session = await requireAdminSession(request, db, env);
      if (!session) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      const media = await listMediaFromD1(db);
      return jsonResponse({ media });
    }

    if (request.method === "POST") {
      const session = await requireAdminSession(request, db, env);
      if (!session) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const altText = String(formData.get("altText") || "").trim();

        if (!(file instanceof File)) {
          return jsonResponse({ error: "No image file provided." }, 400);
        }

        const extFromMime = ALLOWED_IMAGE_MIME[file.type.toLowerCase()];
        if (!extFromMime) {
          return jsonResponse(
            {
              error:
                "Unsupported file type. Please upload JPG, PNG, WebP, GIF, or SVG.",
            },
            400
          );
        }

        const maxBytes = env.MEDIA_BUCKET
          ? R2_MAX_MEDIA_BYTES
          : D1_MAX_MEDIA_BYTES;
        if (file.size > maxBytes) {
          return jsonResponse(
            {
              error: env.MEDIA_BUCKET
                ? "File exceeds 6 MB maximum upload limit."
                : "File exceeds 3.5 MB Cloudflare D1 image limit. Compress the image slightly before uploading.",
            },
            413
          );
        }

        const safeBase = file.name
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40);
        const filename = `${safeBase || "upload"}-${globalThis.crypto
          .randomUUID()
          .slice(0, 8)}${extFromMime}`;
        const urlPath = `/api/media/${filename}`;
        const id = globalThis.crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const bytes = new Uint8Array(await file.arrayBuffer());
        const storageType = env.MEDIA_BUCKET ? "r2" : "d1";

        if (env.MEDIA_BUCKET) {
          await env.MEDIA_BUCKET.put(filename, bytes, {
            httpMetadata: { contentType: file.type },
          });
        } else {
          const chunkStatements: D1PreparedStatement[] = [];
          for (
            let offset = 0, chunkIdx = 0;
            offset < bytes.length;
            offset += D1_CHUNK_BYTES, chunkIdx++
          ) {
            const slice = bytes.slice(offset, offset + D1_CHUNK_BYTES);
            chunkStatements.push(
              db
                .prepare(
                  "INSERT INTO media_chunks (media_id, chunk_index, data) VALUES (?, ?, ?)"
                )
                .bind(id, chunkIdx, slice)
            );
          }
          if (chunkStatements.length > 0) {
            await db.batch(chunkStatements);
          }
        }

        await db
          .prepare(
            `
            INSERT INTO media (id, filename, url, original_name, mime_type, size_bytes, alt_text, storage_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
          )
          .bind(
            id,
            filename,
            urlPath,
            file.name,
            file.type,
            file.size,
            altText || safeBase.replace(/-/g, " "),
            storageType,
            createdAt
          )
          .run();

        const item: MediaItem = {
          id,
          filename,
          url: urlPath,
          originalName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          altText: altText || safeBase.replace(/-/g, " "),
          createdAt,
        };
        return jsonResponse({ item }, 201);
      } catch {
        return jsonResponse({ error: "Failed to store uploaded file." }, 500);
      }
    }
  }

  // Individual media asset (/api/media/:filenameOrId)
  if (pathname.startsWith("/api/media/")) {
    const param = decodeURIComponent(pathname.slice("/api/media/".length));
    const safeName = param.split("/").pop() || "";
    if (!safeName || safeName !== param || safeName.includes("..")) {
      return new Response("Not Found", { status: 404, headers: cors });
    }

    if (request.method === "GET") {
      const row = await db
        .prepare(
          "SELECT * FROM media WHERE filename = ? OR id = ? LIMIT 1"
        )
        .bind(safeName, safeName)
        .first<Record<string, unknown>>();

      if (!row) {
        return new Response("Not Found", { status: 404, headers: cors });
      }

      const extIndex = safeName.lastIndexOf(".");
      const ext = extIndex >= 0 ? safeName.slice(extIndex).toLowerCase() : "";
      const contentType =
        String(row.mime_type || "") ||
        MIME_BY_EXT[ext] ||
        "application/octet-stream";

      const headers: Record<string, string> = {
        ...Object.fromEntries(new Headers(cors).entries()),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      };
      if (ext === ".svg" || contentType === "image/svg+xml") {
        headers["Content-Security-Policy"] =
          "default-src 'none'; style-src 'unsafe-inline'; sandbox";
      }

      if (String(row.storage_type) === "r2" && env.MEDIA_BUCKET) {
        const obj = await env.MEDIA_BUCKET.get(String(row.filename));
        if (!obj) {
          return new Response("Not Found", { status: 404, headers: cors });
        }
        return new Response(obj.body, { status: 200, headers });
      }

      const chunksResult = await db
        .prepare(
          "SELECT data FROM media_chunks WHERE media_id = ? ORDER BY chunk_index ASC"
        )
        .bind(String(row.id))
        .all<{ data: unknown }>();

      const chunks = (chunksResult.results || []).map((c) =>
        toUint8Array(c.data)
      );
      if (chunks.length === 0) {
        return new Response("Not Found", { status: 404, headers: cors });
      }

      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      const merged = new Uint8Array(new ArrayBuffer(totalLength));
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }

      return new Response(merged.buffer as ArrayBuffer, {
        status: 200,
        headers,
      });
    }

    if (request.method === "DELETE") {
      const session = await requireAdminSession(request, db, env);
      if (!session) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      const row = await db
        .prepare("SELECT * FROM media WHERE id = ? OR filename = ? LIMIT 1")
        .bind(safeName, safeName)
        .first<Record<string, unknown>>();
      if (!row) {
        return jsonResponse({ error: "Media not found" }, 404);
      }

      if (String(row.storage_type) === "r2" && env.MEDIA_BUCKET) {
        await env.MEDIA_BUCKET.delete(String(row.filename));
      } else {
        await db
          .prepare("DELETE FROM media_chunks WHERE media_id = ?")
          .bind(String(row.id))
          .run();
      }
      await db
        .prepare("DELETE FROM media WHERE id = ?")
        .bind(String(row.id))
        .run();

      return jsonResponse({ ok: true });
    }
  }

  // Inquiries
  if (pathname === "/api/inquiries") {
    if (request.method === "GET") {
      const session = await requireAdminSession(request, db, env);
      if (!session) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      const inquiries = await listInquiriesFromD1(db);
      return jsonResponse({ inquiries });
    }

    if (request.method === "POST") {
      try {
        const body = (await request.json()) as {
          name?: string;
          email?: string;
          phone?: string;
          companyName?: string;
          service?: string;
          message?: string;
        };
        const name = (body.name || "").trim();
        const email = (body.email || "").trim();
        const phone = (body.phone || "").trim();
        const service = (body.service || "General Inquiry").trim();
        const message = (body.message || "").trim();

        if (!name || !phone || !message) {
          return jsonResponse(
            { error: "Name, phone number, and message are required." },
            400,
            cors
          );
        }

        const id = globalThis.crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const item: InquiryItem = {
          id,
          name: sanitizeNoEmDash(name),
          email: email || "Not provided",
          phone,
          companyName: sanitizeNoEmDash((body.companyName || "").trim()),
          service: sanitizeNoEmDash(service),
          message: sanitizeNoEmDash(message),
          status: "new",
          createdAt,
        };

        await db
          .prepare(
            `
            INSERT INTO inquiries (id, name, email, phone, company_name, service, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
          )
          .bind(
            item.id,
            item.name,
            item.email,
            item.phone,
            item.companyName,
            item.service,
            item.message,
            item.status,
            item.createdAt
          )
          .run();

        return jsonResponse({ inquiry: item }, 201, cors);
      } catch {
        return jsonResponse({ error: "Unable to submit inquiry." }, 500, cors);
      }
    }

    if (request.method === "PATCH") {
      const session = await requireAdminSession(request, db, env);
      if (!session) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      try {
        const body = (await request.json()) as {
          id?: string;
          status?: InquiryItem["status"];
        };
        if (!body.id || !body.status) {
          return jsonResponse(
            { error: "Inquiry id and status are required." },
            400
          );
        }
        const result = await db
          .prepare("UPDATE inquiries SET status = ? WHERE id = ?")
          .bind(body.status, body.id)
          .run();
        if ((result.meta?.changes ?? 0) === 0) {
          return jsonResponse({ error: "Inquiry not found" }, 404);
        }
        return jsonResponse({ ok: true });
      } catch {
        return jsonResponse(
          { error: "Unable to update inquiry status." },
          500
        );
      }
    }
  }

  return jsonResponse({ error: "API route not found." }, 404, cors);
}

const workerHandler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, url, env);
    }

    if (
      url.pathname === "/" &&
      (request.method === "GET" || request.method === "HEAD")
    ) {
      const landing = await renderLandingHtml(env);
      if (request.method === "HEAD") {
        return new Response(null, {
          status: landing.status,
          statusText: landing.statusText,
          headers: landing.headers,
        });
      }
      return landing;
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    if (!url.pathname.startsWith("/_next/static/")) {
      headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};

export default workerHandler;
