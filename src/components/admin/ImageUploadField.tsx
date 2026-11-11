"use client";

import { useState } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { cmsApiUrl, resolveCmsMediaUrl } from "@/lib/cms-client";
import type { MediaItem } from "@/types/cms";

const BUILTIN_IMAGES = [
  {
    label: "Hero Office Banner",
    url: "/images/banners/hero-office-colombo.webp",
  },
  {
    label: "Advisory Team Banner",
    url: "/images/banners/about-team-advisory.webp",
  },
  {
    label: "Accounting Desk Ledger",
    url: "/images/banners/services-desk-ledger.webp",
  },
  {
    label: "Company Registration Flyer",
    url: "/images/brand/company-registration-flyer.jpg",
  },
  {
    label: "Pinnacle Full Logo",
    url: "/images/brand/pinnacle-logo-transparent.png",
  },
];

export function ImageUploadField({
  label,
  value,
  onChange,
  mediaItems,
  onMediaAdded,
}: {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  mediaItems: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(cmsApiUrl("/api/media"), {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = (await res.json()) as { item?: MediaItem; error?: string };
      if (!res.ok || !data.item) {
        setUploadError(data.error || "Upload failed");
        return;
      }
      onMediaAdded(data.item);
      onChange(data.item.url);
    } catch {
      setUploadError("Network error during upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560]">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/... or https://..."
          className="flex-1 rounded-xl border border-[#DFD7C8] bg-white px-3.5 py-2.5 text-sm text-[#181B20] focus:border-[#A41C21] focus:outline-none"
        />

        <label className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#181B20] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#A41C21] transition-colors cursor-pointer shrink-0">
          <Upload className="h-3.5 w-3.5" />
          <span>{uploading ? "Uploading..." : "Upload Image"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-3.5 py-2.5 text-xs font-bold text-[#181B20] hover:border-[#D79A27] cursor-pointer shrink-0"
        >
          <ImageIcon className="h-3.5 w-3.5 text-[#D79A27]" />
          <span>Library</span>
        </button>
      </div>

      {uploadError && (
        <p className="text-xs text-red-700 font-medium">{uploadError}</p>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-[#E6DFD3] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-3">
              <h3 className="font-display text-lg font-bold text-[#181B20]">
                Select Image From Library
              </h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#FAF8F5]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mediaItems.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#A41C21]">
                  Uploaded Media
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mediaItems.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onChange(m.url);
                        setPickerOpen(false);
                      }}
                      className={`group text-left rounded-xl border overflow-hidden transition-all cursor-pointer ${
                        value === m.url
                          ? "border-[#A41C21] ring-2 ring-[#A41C21]/30"
                          : "border-[#E6DFD3] hover:border-[#D79A27]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveCmsMediaUrl(m.url)}
                        alt={m.altText || m.originalName}
                        className="h-24 w-full object-cover bg-[#FAF8F5]"
                      />
                      <div className="p-2 text-[11px] font-medium text-[#181B20] truncate">
                        {m.originalName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#B57B15]">
                Built-In Brand & Banner Assets
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BUILTIN_IMAGES.map((b) => (
                  <button
                    key={b.url}
                    type="button"
                    onClick={() => {
                      onChange(b.url);
                      setPickerOpen(false);
                    }}
                    className={`text-left rounded-xl border overflow-hidden transition-all cursor-pointer ${
                      value === b.url
                        ? "border-[#A41C21] ring-2 ring-[#A41C21]/30"
                        : "border-[#E6DFD3] hover:border-[#D79A27]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.url}
                      alt={b.label}
                      className="h-24 w-full object-cover bg-[#FAF8F5]"
                    />
                    <div className="p-2 text-xs font-semibold text-[#181B20]">
                      {b.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
