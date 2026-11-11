export const CMS_SCHEMA_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS blogs (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    cover_alt TEXT NOT NULL,
    author TEXT NOT NULL,
    read_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    featured INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    seo_keywords TEXT NOT NULL DEFAULT '',
    og_image TEXT NOT NULL DEFAULT '',
    canonical_url TEXT NOT NULL DEFAULT '',
    published_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS banners (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    section_group TEXT NOT NULL,
    page_location TEXT NOT NULL,
    image_url TEXT NOT NULL,
    default_image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    badge_text TEXT NOT NULL DEFAULT '',
    headline TEXT NOT NULL DEFAULT '',
    subheadline TEXT NOT NULL DEFAULT '',
    cta_label TEXT NOT NULL DEFAULT '',
    cta_href TEXT NOT NULL DEFAULT '',
    enabled INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    filename TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    storage_type TEXT NOT NULL DEFAULT 'disk',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS media_chunks (
    media_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    data BLOB NOT NULL,
    PRIMARY KEY (media_id, chunk_index)
  )`,
  `CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company_name TEXT NOT NULL DEFAULT '',
    service TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  )`,
];
