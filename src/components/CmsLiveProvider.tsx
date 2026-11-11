"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { cmsApiUrl, getCmsApiBase } from "@/lib/cms-client";
import type { BannerSlot, BlogPost, SeoSettings } from "@/types/cms";

const emptySubscribe = () => () => {};

interface CmsLiveContextValue {
  banners: Record<string, BannerSlot>;
  seo: SeoSettings;
  blogs: BlogPost[];
  loaded: boolean;
  apiBase: string;
}

const CmsLiveContext = createContext<CmsLiveContextValue | null>(null);

function resolveRouteSeoKey(pathname: string): string | null {
  if (pathname === "/") return "home";
  if (pathname === "/services" || pathname === "/services/") return "services";
  if (pathname === "/about" || pathname === "/about/") return "about";
  if (pathname === "/blog" || pathname === "/blog/") return "blog";
  if (pathname === "/contact" || pathname === "/contact/") return "contact";
  return null;
}

export function CmsLiveProvider({
  initialBanners,
  initialSeo,
  initialBlogs,
  children,
}: {
  initialBanners: Record<string, BannerSlot>;
  initialSeo: SeoSettings;
  initialBlogs: BlogPost[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [banners, setBanners] = useState(initialBanners);
  const [seo, setSeo] = useState(initialSeo);
  const [blogs, setBlogs] = useState(initialBlogs);
  const [loaded, setLoaded] = useState(false);
  const apiBase = useSyncExternalStore(
    emptySubscribe,
    () => getCmsApiBase(),
    () => ""
  );

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      return;
    }

    let cancelled = false;
    async function syncLiveCms() {
      try {
        const res = await fetch(cmsApiUrl("/api/public/bootstrap"), {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          bannerMap?: Record<string, BannerSlot>;
          seo?: SeoSettings;
          blogs?: BlogPost[];
        };
        if (cancelled) return;
        if (data.bannerMap) {
          setBanners(data.bannerMap);
        }
        if (data.seo) {
          setSeo(data.seo);
        }
        if (Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        }
        setLoaded(true);
      } catch {
        // Keep pre-rendered static content cleanly when offline
      }
    }

    syncLiveCms();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!loaded) return;
    const key = resolveRouteSeoKey(pathname);
    if (!key) return;
    const override = seo.pageOverrides?.[key];
    const nextTitle =
      key === "home"
        ? override?.title || seo.siteTitle
        : override?.title
          ? (seo.titleTemplate || "%s | Pinnacle Professional Services").replace(
              "%s",
              override.title
            )
          : "";
    if (nextTitle) {
      document.title = nextTitle;
    }
    const nextDesc = override?.description || seo.defaultDescription;
    if (nextDesc) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", nextDesc);
      }
    }
  }, [loaded, pathname, seo]);

  return (
    <CmsLiveContext.Provider value={{ banners, seo, blogs, loaded, apiBase }}>
      {children}
    </CmsLiveContext.Provider>
  );
}

export function useCmsLive(): CmsLiveContextValue {
  const ctx = useContext(CmsLiveContext);
  if (!ctx) {
    throw new Error("useCmsLive must be used inside CmsLiveProvider.");
  }
  return ctx;
}
