"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import type { BannerSlot, MediaItem } from "@/types/cms";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function BannerManager({
  banners,
  setBanners,
  mediaItems,
  onMediaAdded,
}: {
  banners: BannerSlot[];
  setBanners: React.Dispatch<React.SetStateAction<BannerSlot[]>>;
  mediaItems: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
}) {
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const visibleBanners = banners.filter(
    (b) => groupFilter === "all" || b.sectionGroup === groupFilter
  );

  function updateLocal(key: string, patch: Partial<BannerSlot>) {
    setBanners((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  }

  async function saveBanner(slot: BannerSlot, resetToDefault = false) {
    setSavingKey(slot.key);
    setSavedKey(null);
    try {
      const res = await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          resetToDefault
            ? { key: slot.key, resetToDefault: true }
            : {
                key: slot.key,
                imageUrl: slot.imageUrl,
                altText: slot.altText,
                badgeText: slot.badgeText,
                headline: slot.headline,
                subheadline: slot.subheadline,
                ctaLabel: slot.ctaLabel,
                ctaHref: slot.ctaHref,
              }
        ),
      });
      const data = (await res.json()) as { banner?: BannerSlot };
      if (res.ok && data.banner) {
        setBanners((prev) =>
          prev.map((b) => (b.key === data.banner!.key ? data.banner! : b))
        );
        setSavedKey(slot.key);
      }
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#181B20]">
            Website Banners, Logos & Service Images
          </h2>
          <p className="text-sm text-[#646B76]">
            Upload new images or edit banner headlines, alt texts, and buttons
            across the live site.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Slots" },
            { id: "hero", label: "Hero" },
            { id: "sections", label: "Page Banners" },
            { id: "services", label: "Service Cards" },
            { id: "brand", label: "Brand Logo" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGroupFilter(tab.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                groupFilter === tab.id
                  ? "bg-[#A41C21] text-white"
                  : "bg-white border border-[#E6DFD3] text-[#3D424B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {visibleBanners.map((slot) => (
          <div
            key={slot.key}
            className="rounded-2xl border border-[#E6DFD3] bg-white p-5 sm:p-6 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-4 space-y-3">
              <div className="relative h-52 w-full rounded-xl overflow-hidden border border-[#E6DFD3] bg-[#FAF8F5] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slot.imageUrl}
                  alt={slot.altText}
                  className={
                    slot.sectionGroup === "brand"
                      ? "h-36 w-auto object-contain p-3"
                      : "h-full w-full object-cover"
                  }
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#A41C21]">
                  {slot.pageLocation}
                </div>
                <div className="font-display text-lg font-bold text-[#181B20]">
                  {slot.label}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <ImageUploadField
                label="Banner / Slot Image URL"
                value={slot.imageUrl}
                onChange={(url) => updateLocal(slot.key, { imageUrl: url })}
                mediaItems={mediaItems}
                onMediaAdded={onMediaAdded}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
                    Alt Text (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={slot.altText}
                    onChange={(e) =>
                      updateLocal(slot.key, { altText: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2 text-sm text-[#181B20]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
                    Badge / Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={slot.badgeText}
                    onChange={(e) =>
                      updateLocal(slot.key, { badgeText: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2 text-sm text-[#181B20]"
                  />
                </div>
              </div>

              {slot.sectionGroup !== "brand" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={slot.headline}
                        onChange={(e) =>
                          updateLocal(slot.key, { headline: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2 text-sm text-[#181B20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
                        Button Text & Link
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={slot.ctaLabel}
                          onChange={(e) =>
                            updateLocal(slot.key, { ctaLabel: e.target.value })
                          }
                          placeholder="Button label"
                          className="w-full rounded-xl border border-[#DFD7C8] px-3 py-2 text-sm text-[#181B20]"
                        />
                        <input
                          type="text"
                          value={slot.ctaHref}
                          onChange={(e) =>
                            updateLocal(slot.key, { ctaHref: e.target.value })
                          }
                          placeholder="/contact"
                          className="w-full rounded-xl border border-[#DFD7C8] px-3 py-2 text-sm text-[#181B20]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
                      Subheadline / Caption
                    </label>
                    <textarea
                      rows={2}
                      value={slot.subheadline}
                      onChange={(e) =>
                        updateLocal(slot.key, { subheadline: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2 text-sm text-[#181B20]"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EFE9DD]">
                <div className="text-xs">
                  {savedKey === slot.key && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Updated live on website</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={savingKey === slot.key}
                    onClick={() => saveBanner(slot, true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-3.5 py-2 text-xs font-bold text-[#4F5560] hover:text-[#181B20] cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restore Default</span>
                  </button>
                  <button
                    type="button"
                    disabled={savingKey === slot.key}
                    onClick={() => saveBanner(slot, false)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#A41C21] px-4 py-2 text-xs font-bold text-white hover:bg-[#821318] disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>
                      {savingKey === slot.key ? "Saving..." : "Save Banner"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
