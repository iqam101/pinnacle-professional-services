"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  PanelsTopLeft,
} from "lucide-react";
import { cmsApiUrl } from "@/lib/cms-client";
import type {
  BannerSlot,
  BlogPost,
  InquiryItem,
  MediaItem,
  SeoSettings,
} from "@/types/cms";
import { BlogManager } from "@/components/admin/BlogManager";
import { BannerManager } from "@/components/admin/BannerManager";
import { SeoManager } from "@/components/admin/SeoManager";
import { MediaManager } from "@/components/admin/MediaManager";
import { InquiriesAndSecurity } from "@/components/admin/InquiriesAndSecurity";

type AdminTab =
  | "overview"
  | "blogs"
  | "banners"
  | "seo"
  | "media"
  | "inquiries"
  | "security";

export function AdminDashboardClient({
  username,
  initialBlogs,
  initialBanners,
  initialSeo,
  initialMedia,
  initialInquiries,
}: {
  username: string;
  initialBlogs: BlogPost[];
  initialBanners: BannerSlot[];
  initialSeo: SeoSettings;
  initialMedia: MediaItem[];
  initialInquiries: InquiryItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [blogs, setBlogs] = useState(initialBlogs);
  const [banners, setBanners] = useState(initialBanners);
  const [seo, setSeo] = useState(initialSeo);
  const [mediaItems, setMediaItems] = useState(initialMedia);
  const [inquiries, setInquiries] = useState(initialInquiries);

  function handleMediaAdded(item: MediaItem) {
    setMediaItems((prev) => [item, ...prev]);
  }

  async function handleLogout() {
    await fetch(cmsApiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
    router.push("/admin/login/");
  }

  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;
  const popupSlot = banners.find((b) => b.key === "popup_banner");
  const isSplitCloudflare =
    process.env.NEXT_PUBLIC_BUILD_TARGET === "cloudflare" ||
    (typeof window !== "undefined" &&
      window.location.hostname.endsWith(".workers.dev"));
  const externalSiteHref = seo.canonicalBaseUrl?.startsWith("http")
    ? seo.canonicalBaseUrl
    : "https://pinnacleprofessionalservices.zenthoz.com";

  const tabs: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "blogs", label: `Blogs (${blogs.length})`, icon: FileText },
    { id: "banners", label: "Banners & Images", icon: PanelsTopLeft },
    { id: "seo", label: "SEO Settings", icon: Globe },
    { id: "media", label: `Media (${mediaItems.length})`, icon: ImageIcon },
    {
      id: "inquiries",
      label: `Inquiries (${newInquiriesCount > 0 ? `${newInquiriesCount} new` : inquiries.length})`,
      icon: Inbox,
    },
    { id: "security", label: "Security", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 bg-[#181B20] text-white border-b border-[#2C313B]">
        <div className="container-fluid py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brand/pinnacle-mark.png"
              alt="Pinnacle Mark"
              className="h-9 w-9 rounded-lg bg-white p-1 object-contain"
            />
            <div>
              <div className="font-display text-sm sm:text-base font-bold leading-tight">
                Pinnacle Admin Portal
              </div>
              <div className="text-[11px] text-[#B9B4AA]">
                Signed in as {username}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isSplitCloudflare ? (
              <a
                href={externalSiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#343A46] bg-[#22262E] px-3.5 py-2 text-xs font-bold text-white hover:border-[#D79A27]"
              >
                <span>View Website</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#D79A27]" />
              </a>
            ) : (
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#343A46] bg-[#22262E] px-3.5 py-2 text-xs font-bold text-white hover:border-[#D79A27]"
              >
                <span>View Website</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#D79A27]" />
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#A41C21] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#821318] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tab Bar */}
        <div className="border-t border-[#262A33] bg-[#1D2027]">
          <div className="container-fluid flex items-center gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#A41C21] text-white shadow-sm"
                      : "text-[#C8C3B9] hover:bg-[#272C36] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-fluid py-8 sm:py-10">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-[#181B20]">
                Welcome Back to Pinnacle CMS
              </h1>
              <p className="text-sm text-[#646B76] mt-1">
                Manage blog articles, update website banners and service images,
                fine-tune SEO settings, and track client consultation inquiries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  label: "Published Blog Articles",
                  value: publishedCount,
                  sub: `${blogs.length - publishedCount} drafts`,
                  action: () => setActiveTab("blogs"),
                },
                {
                  label: "Editable Image & Banner Slots",
                  value: banners.length,
                  sub: "Hero, Flyers, Services & Logo",
                  action: () => setActiveTab("banners"),
                },
                {
                  label: "SEO & Schema Configuration",
                  value: seo.robotsIndex ? "Indexed" : "NoIndex",
                  sub: "Global & 5 page overrides",
                  action: () => setActiveTab("seo"),
                },
                {
                  label: "Client Inquiries",
                  value: inquiries.length,
                  sub: `${newInquiriesCount} awaiting reply`,
                  action: () => setActiveTab("inquiries"),
                },
              ].map((stat) => (
                <button
                  key={stat.label}
                  type="button"
                  onClick={stat.action}
                  className="text-left rounded-2xl border border-[#E6DFD3] bg-white p-6 space-y-2 hover:border-[#D79A27] hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-[#646B76]">
                    {stat.label}
                  </div>
                  <div className="font-display text-3xl font-extrabold text-[#A41C21]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#646B76]">{stat.sub}</div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-[#E6DFD3] bg-white p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-[#181B20]">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("blogs")}
                  className="rounded-xl bg-[#A41C21] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#821318] cursor-pointer"
                >
                  Add / Edit Blog Posts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("banners")}
                  className="rounded-xl border border-[#D79A27] bg-[#FDF8EC] px-4 py-2.5 text-sm font-bold text-[#8E5D09] hover:bg-[#D79A27] hover:text-white cursor-pointer"
                >
                  Change Website Banners & Images
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className="rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-4 py-2.5 text-sm font-bold text-[#181B20] hover:border-[#A41C21] cursor-pointer"
                >
                  Configure SEO Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("media")}
                  className="rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-4 py-2.5 text-sm font-bold text-[#181B20] hover:border-[#A41C21] cursor-pointer"
                >
                  Upload Images to Media Library
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E6DFD3] bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#A41C21]">
                  Live Sync & Split Hosting
                </div>
                <h2 className="font-display text-lg font-bold text-[#181B20]">
                  Updates Reflect Live on Your Public Website
                </h2>
                <p className="text-sm text-[#646B76] leading-relaxed">
                  Changes saved to blogs, banners, uploaded images, SEO tags,
                  or the entry pop-up are served straight to your Hostinger
                  static frontend. Update Canonical Base URL under SEO
                  Settings whenever your live domain changes.
                </p>
                <div className="pt-1 text-xs font-mono text-[#4F5560] break-all">
                  Live Site URL: {seo.canonicalBaseUrl || "Not configured"}
                </div>
              </div>

              <div className="rounded-xl border border-[#EFE9DD] bg-[#FAF8F5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#646B76]">
                    Visitor Entry Pop-up Banner
                  </div>
                  <div className="font-display text-base font-bold text-[#181B20]">
                    {popupSlot?.enabled ? "Enabled & Showing on Entry" : "Currently Hidden"}
                  </div>
                  <div className="text-xs text-[#646B76]">
                    {popupSlot?.headline || "Configure promotional announcement popup"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("banners")}
                  className="shrink-0 rounded-xl border border-[#D79A27] bg-white px-4 py-2 text-xs font-bold text-[#8E5D09] hover:bg-[#D79A27] hover:text-white transition-colors cursor-pointer"
                >
                  Configure Pop-up
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "blogs" && (
          <BlogManager
            blogs={blogs}
            setBlogs={setBlogs}
            mediaItems={mediaItems}
            onMediaAdded={handleMediaAdded}
          />
        )}

        {activeTab === "banners" && (
          <BannerManager
            banners={banners}
            setBanners={setBanners}
            mediaItems={mediaItems}
            onMediaAdded={handleMediaAdded}
          />
        )}

        {activeTab === "seo" && (
          <SeoManager
            seo={seo}
            setSeo={setSeo}
            mediaItems={mediaItems}
            onMediaAdded={handleMediaAdded}
          />
        )}

        {activeTab === "media" && (
          <MediaManager
            mediaItems={mediaItems}
            setMediaItems={setMediaItems}
          />
        )}

        {activeTab === "inquiries" && (
          <InquiriesAndSecurity
            inquiries={inquiries}
            setInquiries={setInquiries}
            mode="inquiries"
          />
        )}

        {activeTab === "security" && (
          <InquiriesAndSecurity
            inquiries={inquiries}
            setInquiries={setInquiries}
            mode="security"
          />
        )}
      </div>
    </div>
  );
}
