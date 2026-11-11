import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src", "app");
const NEXT_DIR = path.join(ROOT, ".next");
const OUT_DIR = path.join(ROOT, "out");
const STASH_DIR = path.join(ROOT, ".build-stash");
const MANIFEST_PATH = path.join(STASH_DIR, "manifest.json");

const STASH_ENTRIES = {
  hostinger: ["api", "admin"],
  cloudflare: [
    "api",
    "page.tsx",
    "about",
    "services",
    "blog",
    "contact",
    "sitemap.ts",
    "robots.ts",
  ],
};

function restoreStashed() {
  if (!fs.existsSync(STASH_DIR)) return;

  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const items = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
      for (const rel of items) {
        const stashed = path.join(STASH_DIR, "items", rel);
        const dest = path.join(APP_DIR, rel);
        if (fs.existsSync(stashed) && !fs.existsSync(dest)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.renameSync(stashed, dest);
        }
      }
    } catch (err) {
      console.error("Failed restoring manifest from .build-stash:", err);
    }
  } else {
    const itemsDir = path.join(STASH_DIR, "items");
    if (fs.existsSync(itemsDir)) {
      for (const entry of fs.readdirSync(itemsDir)) {
        const stashed = path.join(itemsDir, entry);
        const dest = path.join(APP_DIR, entry);
        if (!fs.existsSync(dest)) {
          fs.renameSync(stashed, dest);
        }
      }
    }
  }

  fs.rmSync(STASH_DIR, { recursive: true, force: true });
}

function stashForTarget(target) {
  restoreStashed();
  const list = STASH_ENTRIES[target];
  const stashedList = [];
  fs.mkdirSync(path.join(STASH_DIR, "items"), { recursive: true });

  for (const rel of list) {
    const src = path.join(APP_DIR, rel);
    if (fs.existsSync(src)) {
      const dest = path.join(STASH_DIR, "items", rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(src, dest);
      stashedList.push(rel);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(stashedList, null, 2));
}

function buildHostingerHtaccess() {
  return [
    "Options -Indexes",
    "DirectoryIndex index.html",
    "ErrorDocument 404 /404.html",
    "",
    "<IfModule mod_rewrite.c>",
    "  RewriteEngine On",
    "",
    "  # Serve newly published CMS blog posts cleanly via static blog shell",
    "  RewriteCond %{REQUEST_FILENAME} !-f",
    "  RewriteCond %{REQUEST_FILENAME} !-d",
    "  RewriteRule ^blog/([^/]+)/?$ /blog/post/index.html [L]",
    "</IfModule>",
    "",
    "<IfModule mod_headers.c>",
    "  <FilesMatch \"^cms-config\\.js$\">",
    "    Header set Cache-Control \"no-cache, no-store, must-revalidate\"",
    "  </FilesMatch>",
    "  <FilesMatch \"\\.(css|js|woff2|webp|png|jpg|jpeg|svg|ico)$\">",
    "    Header set Cache-Control \"public, max-age=2592000\"",
    "  </FilesMatch>",
    "</IfModule>",
    "",
  ].join("\n");
}

function buildHostingerCmsConfig() {
  const configuredApi = (
    process.env.PINNACLE_API_URL ||
    process.env.NEXT_PUBLIC_CMS_API_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  const configuredAdmin = (
    process.env.PINNACLE_ADMIN_URL ||
    (configuredApi ? `${configuredApi}/admin/login` : "")
  )
    .trim()
    .replace(/\/+$/, "");

  return `// Runtime backend endpoint configuration for static Hostinger hosting.
// Replace the URLs below with your Cloudflare Workers URL (no trailing slash),
// for example: "https://pinnacle-admin-cms.your-subdomain.workers.dev"
window.__PINNACLE_CONFIG__ = {
  apiBaseUrl: ${JSON.stringify(configuredApi)},
  adminPortalUrl: ${JSON.stringify(configuredAdmin)},
};
`;
}

// Pure-Node cross-platform ZIP archive writer (POSIX forward slashes)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function collectFiles(dir, prefix = "") {
  const entries = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, item.name);
    const rel = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isDirectory()) {
      entries.push(...collectFiles(abs, rel));
    } else if (item.isFile()) {
      entries.push({ abs, rel: rel.replace(/\\/g, "/") });
    }
  }
  return entries;
}

function createZipFromDir(sourceDir, outZipPath) {
  const files = collectFiles(sourceDir);
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((Math.max(now.getFullYear(), 1980) - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0xf) << 5) |
    (now.getDate() & 0x1f);

  for (const file of files) {
    const raw = fs.readFileSync(file.abs);
    const compressed = zlib.deflateRawSync(raw, { level: 9 });
    const useDeflate = compressed.length < raw.length;
    const payload = useDeflate ? compressed : raw;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(raw);
    const nameBuf = Buffer.from(file.rel, "utf8");

    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(raw.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(raw.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuf.copy(centralHeader, 46);

    localChunks.push(localHeader, payload);
    centralChunks.push(centralHeader);
    offset += localHeader.length + payload.length;
  }

  const centralBuffer = Buffer.concat(centralChunks);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralBuffer.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  fs.writeFileSync(
    outZipPath,
    Buffer.concat([...localChunks, centralBuffer, eocd])
  );
}

function runNextBuild(target) {
  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const result = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      BUILD_TARGET: target,
      NEXT_PUBLIC_BUILD_TARGET: target,
    },
  });

  if (result.status !== 0) {
    throw new Error(`Next.js build failed for target "${target}" (exit ${result.status})`);
  }
}

async function main() {
  const target = process.argv[2];
  if (target !== "hostinger" && target !== "cloudflare") {
    console.error("Usage: node scripts/build-split.mjs <hostinger|cloudflare>");
    process.exit(1);
  }

  const cleanup = () => {
    restoreStashed();
  };
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });

  try {
    stashForTarget(target);
    fs.rmSync(NEXT_DIR, { recursive: true, force: true });
    fs.rmSync(OUT_DIR, { recursive: true, force: true });

    runNextBuild(target);

    if (!fs.existsSync(OUT_DIR)) {
      throw new Error(`Expected static export directory at ${OUT_DIR}, but it was not generated.`);
    }

    const destDir = path.join(ROOT, `dist-${target}`);
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.cpSync(OUT_DIR, destDir, { recursive: true });

    if (target === "hostinger") {
      fs.writeFileSync(
        path.join(destDir, ".htaccess"),
        buildHostingerHtaccess(),
        "utf8"
      );
      fs.writeFileSync(
        path.join(destDir, "cms-config.js"),
        buildHostingerCmsConfig(),
        "utf8"
      );
      const zipPath = path.join(ROOT, "dist-hostinger.zip");
      fs.rmSync(zipPath, { force: true });
      createZipFromDir(destDir, zipPath);
      console.log(`Built Hostinger static bundle: ${destDir}`);
      console.log(`Built uploadable Hostinger archive: ${zipPath}`);
    } else {
      fs.writeFileSync(
        path.join(destDir, "robots.txt"),
        "User-agent: *\nDisallow: /\n",
        "utf8"
      );
      console.log(`Built Cloudflare Admin Portal static assets: ${destDir}`);
    }
  } finally {
    restoreStashed();
    fs.rmSync(NEXT_DIR, { recursive: true, force: true });
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
}

main().catch((err) => {
  restoreStashed();
  console.error(err);
  process.exit(1);
});
