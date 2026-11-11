"use client";

import { useState } from "react";
import { CheckCircle2, Globe, Save, Search } from "lucide-react";
import { cmsApiUrl } from "@/lib/cms-client";
import type { MediaItem, SeoSettings } from "@/types/cms";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const PAGE_KEYS = [
  { key: "home", label: "Home Page (/)" },
  { key: "services", label: "Services Page (/services)" },
  { key: "about", label: "About Us Page (/about)" },
  { key: "blog", label: "Blog Index (/blog)" },
  { key: "contact", label: "Contact Page (/contact)" },
];

export function SeoManager({
  seo,
  setSeo,
  mediaItems,
  onMediaAdded,
}: {
  seo: SeoSettings;
  setSeo: React.Dispatch<React.SetStateAction<SeoSettings>>;
  mediaItems: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [activePageKey, setActivePageKey] = useState("home");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch(cmsApiUrl("/api/seo"), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seo),
      });
      const data = (await res.json()) as { seo?: SeoSettings; error?: string };
      if (!res.ok || !data.seo) {
        setSavedMsg(data.error || "Unable to save SEO settings.");
        return;
      }
      setSeo(data.seo);
      setSavedMsg(
        "SEO metadata, sitemap settings, and Schema.org JSON-LD updated across the live site."
      );
    } finally {
      setSaving(false);
    }
  }

  const currentOverride = seo.pageOverrides[activePageKey] || {
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
  };

  function updatePageOverride(
    field: "title" | "description" | "keywords" | "ogImage",
    value: string
  ) {
    setSeo((prev) => ({
      ...prev,
      pageOverrides: {
        ...prev.pageOverrides,
        [activePageKey]: {
          ...currentOverride,
          [field]: value,
        },
      },
    }));
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#181B20]">
            Global SEO, Social Open Graph & Schema Settings
          </h2>
          <p className="text-sm text-[#646B76]">
            Control sitewide meta tags, page titles, robots indexing, Google
            verification, and LocalBusiness structured data.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#821318] disabled:opacity-60 cursor-pointer shrink-0"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving SEO..." : "Save SEO Settings"}</span>
        </button>
      </div>

      {savedMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Live SERP Preview */}
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B57B15]">
          <Search className="h-4 w-4" />
          <span>Live Google Search Preview (Home Page)</span>
        </div>
        <div className="rounded-xl border border-[#EFE9DD] bg-[#FAF8F5] p-5 space-y-1 max-w-2xl">
          <div className="text-xs text-[#006621]">
            {seo.canonicalBaseUrl || "https://pinnacleprofessionalservices.lk"}
          </div>
          <div className="text-lg font-medium text-[#1A0DAB] leading-snug">
            {seo.pageOverrides.home?.title || seo.siteTitle}
          </div>
          <div className="text-sm text-[#4D5156] line-clamp-2">
            {seo.pageOverrides.home?.description || seo.defaultDescription}
          </div>
        </div>
      </div>

      {/* Global Meta & Indexing */}
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-6 space-y-5">
        <div className="flex items-center gap-2 font-display text-lg font-bold text-[#181B20]">
          <Globe className="h-5 w-5 text-[#A41C21]" />
          <span>Global Meta Tags & Search Engine Controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Default Site Title
            </label>
            <input
              type="text"
              value={seo.siteTitle}
              onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Title Template (use %s for page name)
            </label>
            <input
              type="text"
              value={seo.titleTemplate}
              onChange={(e) =>
                setSeo({ ...seo, titleTemplate: e.target.value })
              }
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
            <label>Default Meta Description</label>
            <span>{seo.defaultDescription.length}/160</span>
          </div>
          <textarea
            rows={2}
            value={seo.defaultDescription}
            onChange={(e) =>
              setSeo({ ...seo, defaultDescription: e.target.value })
            }
            className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
            Default SEO Keywords (comma separated)
          </label>
          <textarea
            rows={2}
            value={seo.defaultKeywords}
            onChange={(e) =>
              setSeo({ ...seo, defaultKeywords: e.target.value })
            }
            className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Canonical Base URL (Domain)
            </label>
            <input
              type="url"
              value={seo.canonicalBaseUrl}
              onChange={(e) =>
                setSeo({ ...seo, canonicalBaseUrl: e.target.value })
              }
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Google Site Verification Code
            </label>
            <input
              type="text"
              value={seo.googleVerification}
              onChange={(e) =>
                setSeo({ ...seo, googleVerification: e.target.value })
              }
              placeholder="Optional Google Search Console token"
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Google Analytics (GA4 Measurement ID)
            </label>
            <input
              type="text"
              value={seo.gaMeasurementId}
              onChange={(e) =>
                setSeo({ ...seo, gaMeasurementId: e.target.value })
              }
              placeholder="e.g. G-XXXXXXXXXX"
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
        </div>

        <ImageUploadField
          label="Default Open Graph (Social Share) Image"
          value={seo.ogDefaultImage}
          onChange={(url) => setSeo({ ...seo, ogDefaultImage: url })}
          mediaItems={mediaItems}
          onMediaAdded={onMediaAdded}
        />

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#181B20] cursor-pointer">
            <input
              type="checkbox"
              checked={seo.robotsIndex}
              onChange={(e) =>
                setSeo({ ...seo, robotsIndex: e.target.checked })
              }
              className="h-4 w-4 accent-[#A41C21]"
            />
            <span>Allow Search Engines to Index Site (robots: index)</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#181B20] cursor-pointer">
            <input
              type="checkbox"
              checked={seo.robotsFollow}
              onChange={(e) =>
                setSeo({ ...seo, robotsFollow: e.target.checked })
              }
              className="h-4 w-4 accent-[#A41C21]"
            />
            <span>Allow Search Engines to Follow Links (robots: follow)</span>
          </label>
        </div>
      </div>

      {/* Per-Page SEO Overrides */}
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-[#181B20]">
              Per-Page SEO Overrides
            </h3>
            <p className="text-xs text-[#646B76]">
              Customize title, description, and keywords for each main route.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PAGE_KEYS.map((pk) => (
              <button
                key={pk.key}
                type="button"
                onClick={() => setActivePageKey(pk.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer ${
                  activePageKey === pk.key
                    ? "bg-[#A41C21] text-white"
                    : "bg-[#FAF8F5] border border-[#E6DFD3] text-[#3D424B]"
                }`}
              >
                {pk.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Page Title ({activePageKey})
            </label>
            <input
              type="text"
              value={currentOverride.title}
              onChange={(e) => updatePageOverride("title", e.target.value)}
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              <label>Page Meta Description</label>
              <span>{currentOverride.description.length}/160</span>
            </div>
            <textarea
              rows={2}
              value={currentOverride.description}
              onChange={(e) =>
                updatePageOverride("description", e.target.value)
              }
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Page Keywords
            </label>
            <input
              type="text"
              value={currentOverride.keywords}
              onChange={(e) => updatePageOverride("keywords", e.target.value)}
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
        </div>
      </div>

      {/* Schema.org LocalBusiness Info */}
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-[#181B20]">
          Schema.org LocalBusiness & Footer Contact Metadata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Legal Business Name
            </label>
            <input
              type="text"
              value={seo.businessName}
              onChange={(e) =>
                setSeo({ ...seo, businessName: e.target.value })
              }
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={seo.email}
              onChange={(e) => setSeo({ ...seo, email: e.target.value })}
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={seo.phone}
              onChange={(e) => setSeo({ ...seo, phone: e.target.value })}
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Office Address
            </label>
            <input
              type="text"
              value={seo.address}
              onChange={(e) => setSeo({ ...seo, address: e.target.value })}
              className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
