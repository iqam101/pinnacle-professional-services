import type { RuntimeCmsConfig } from "@/types/cms";

declare global {
  interface Window {
    __PINNACLE_CONFIG__?: RuntimeCmsConfig;
  }
}

function cleanBaseUrl(value?: string): string {
  const trimmed = (value || "").trim().replace(/\/+$/, "");
  if (!trimmed || trimmed.includes("YOUR_SUBDOMAIN")) {
    return "";
  }
  return trimmed;
}

/**
 * Returns the configured remote Cloudflare Worker API base URL when running
 * on a split static host (such as Hostinger shared hosting), or empty string
 * when running unified/same-origin (localhost or directly on Cloudflare).
 */
export function getCmsApiBase(): string {
  if (typeof window !== "undefined") {
    const runtimeUrl = cleanBaseUrl(window.__PINNACLE_CONFIG__?.apiBaseUrl);
    if (runtimeUrl) return runtimeUrl;
  }
  return cleanBaseUrl(process.env.NEXT_PUBLIC_CMS_API_URL);
}

/**
 * Builds an API endpoint URL against the active CMS backend.
 */
export function cmsApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getCmsApiBase();
  return base ? `${base}${normalized}` : normalized;
}

export function resolveMediaWithBase(src: string, apiBase: string): string {
  const trimmed = (src || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/api/")) {
    const clean = cleanBaseUrl(apiBase);
    return clean ? `${clean}${trimmed}` : trimmed;
  }
  return trimmed;
}

/**
 * Resolves media URLs uploaded via the Admin Portal (/api/media/...) so static
 * Hostinger pages load images directly from the Cloudflare backend.
 */
export function resolveCmsMediaUrl(src: string): string {
  return resolveMediaWithBase(src, getCmsApiBase());
}

/**
 * Returns the Admin Portal URL (Cloudflare Workers URL when split, /admin locally).
 */
export function getAdminPortalHref(): { href: string; external: boolean } {
  if (typeof window !== "undefined") {
    const explicit = cleanBaseUrl(window.__PINNACLE_CONFIG__?.adminPortalUrl);
    if (explicit) {
      return { href: explicit, external: /^https?:\/\//i.test(explicit) };
    }
    const base = getCmsApiBase();
    if (base && window.location.origin !== base) {
      return { href: `${base}/admin/`, external: true };
    }
  }
  const buildApi = cleanBaseUrl(process.env.NEXT_PUBLIC_CMS_API_URL);
  if (buildApi) {
    return { href: `${buildApi}/admin/`, external: true };
  }
  return { href: "/admin", external: false };
}
