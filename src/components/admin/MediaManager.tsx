"use client";

import { useState } from "react";
import { Check, Copy, Trash2, Upload } from "lucide-react";
import type { MediaItem } from "@/types/cms";

export function MediaManager({
  mediaItems,
  setMediaItems,
}: {
  mediaItems: MediaItem[];
  setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/media", { method: "POST", body: fd });
        const data = (await res.json()) as { item?: MediaItem; error?: string };
        if (!res.ok || !data.item) {
          setError(data.error || `Failed uploading ${file.name}`);
        } else {
          setMediaItems((prev) => [data.item!, ...prev]);
        }
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!window.confirm(`Delete ${item.originalName}?`)) return;
    const res = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
    }
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#181B20]">
            Media Library
          </h2>
          <p className="text-sm text-[#646B76]">
            Upload photos, flyers, and banners (JPG, PNG, WebP, SVG up to 6 MB)
            to use anywhere on the website.
          </p>
        </div>

        <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#821318] transition-colors cursor-pointer">
          <Upload className="h-4 w-4" />
          <span>{uploading ? "Uploading..." : "Upload Image(s)"}</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {mediaItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DFD7C8] bg-white p-12 text-center space-y-2">
          <p className="font-display text-lg font-bold text-[#181B20]">
            No custom images uploaded yet
          </p>
          <p className="text-sm text-[#646B76]">
            Use the Upload button above or upload directly inside any Banner
            Slot or Blog Editor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#E6DFD3] bg-white overflow-hidden shadow-xs flex flex-col"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.altText || item.originalName}
                className="h-44 w-full object-cover bg-[#FAF8F5]"
              />
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-sm font-bold text-[#181B20] truncate">
                    {item.originalName}
                  </div>
                  <div className="text-xs text-[#646B76]">
                    {Math.round(item.sizeBytes / 1024)} KB
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[#EFE9DD]">
                  <button
                    type="button"
                    onClick={() => copyUrl(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#DFD7C8] bg-[#FAF8F5] py-1.5 text-xs font-bold text-[#181B20] hover:border-[#D79A27] cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    aria-label={`Delete ${item.originalName}`}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
