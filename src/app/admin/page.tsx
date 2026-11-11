"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cmsApiUrl } from "@/lib/cms-client";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import type {
  BannerSlot,
  BlogPost,
  InquiryItem,
  MediaItem,
  SeoSettings,
} from "@/types/cms";

interface AdminBootstrapPayload {
  username: string;
  blogs: BlogPost[];
  banners: BannerSlot[];
  seo: SeoSettings;
  media: MediaItem[];
  inquiries: InquiryItem[];
}

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminBootstrapPayload | null>(null);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch(cmsApiUrl("/api/admin/bootstrap"), {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/admin/login/");
          return;
        }
        const raw = await res.text();
        let json: Partial<AdminBootstrapPayload> & { error?: string } = {};
        try {
          json = JSON.parse(raw);
        } catch {
          // Non-JSON response handled cleanly below
        }
        if (!res.ok || !json.username || !json.seo) {
          throw new Error(
            json.error || `Unable to load Admin CMS data (HTTP ${res.status}).`
          );
        }
        if (!cancelled) {
          setData(json as AdminBootstrapPayload);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Network error loading Admin CMS."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router, retryCount]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-[#E6DFD3] bg-white p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <h1 className="font-display text-xl font-bold text-[#181B20]">
            Admin Backend Unavailable
          </h1>
          <p className="text-sm text-[#646B76] leading-relaxed">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setError("");
                setRetryCount((c) => c + 1);
              }}
              className="rounded-xl bg-[#A41C21] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#821318] cursor-pointer"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => router.replace("/admin/login/")}
              className="rounded-xl border border-[#DFD7C8] bg-white px-4 py-2.5 text-sm font-bold text-[#181B20] cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 gap-3">
        <div className="h-9 w-9 rounded-full border-3 border-[#A41C21] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-[#4F5560]">
          Loading Pinnacle Admin CMS...
        </p>
      </div>
    );
  }

  return (
    <AdminDashboardClient
      username={data.username}
      initialBlogs={data.blogs}
      initialBanners={data.banners}
      initialSeo={data.seo}
      initialMedia={data.media}
      initialInquiries={data.inquiries}
    />
  );
}
