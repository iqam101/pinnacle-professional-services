"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { BlogPost, BlogStatus, MediaItem } from "@/types/cms";
import { sanitizeNoEmDash, slugify } from "@/lib/constants";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { MarkdownContent } from "@/components/MarkdownContent";

interface BlogDraft {
  id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  author: string;
  status: BlogStatus;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  canonicalUrl: string;
}

const CATEGORIES = [
  "Company Registration",
  "Bookkeeping & Accountancy",
  "Tax, VAT & TIN",
  "Secretarial Services",
  "HR & Payroll",
  "Business Advisory",
  "Web, POS & Marketing",
];

function emptyDraft(): BlogDraft {
  return {
    title: "",
    slug: "",
    category: "Company Registration",
    excerpt: "",
    content: "",
    coverImage: "/images/banners/services-desk-ledger.jpg",
    coverAlt: "",
    author: "Pinnacle Advisory Team",
    status: "published",
    featured: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    ogImage: "",
    canonicalUrl: "",
  };
}

function toDraft(post: BlogPost): BlogDraft {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    coverAlt: post.coverAlt,
    author: post.author,
    status: post.status,
    featured: post.featured,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoKeywords: post.seoKeywords,
    ogImage: post.ogImage,
    canonicalUrl: post.canonicalUrl,
  };
}

export function BlogManager({
  blogs,
  setBlogs,
  mediaItems,
  onMediaAdded,
}: {
  blogs: BlogPost[];
  setBlogs: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  mediaItems: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
}) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BlogDraft | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  function insertSnippet(snippet: string) {
    if (!editing) return;
    setEditing({
      ...editing,
      content: `${editing.content}${editing.content.endsWith("\n") || !editing.content ? "" : "\n"}${snippet}`,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setFeedback("");

    try {
      const payload = {
        ...editing,
        title: sanitizeNoEmDash(editing.title),
        excerpt: sanitizeNoEmDash(editing.excerpt),
        content: sanitizeNoEmDash(editing.content),
        seoTitle: sanitizeNoEmDash(editing.seoTitle),
        seoDescription: sanitizeNoEmDash(editing.seoDescription),
      };

      const isUpdate = Boolean(editing.id);
      const url = isUpdate ? `/api/blogs/${editing.id}` : "/api/blogs";
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { blog?: BlogPost; error?: string };
      if (!res.ok || !data.blog) {
        setFeedback(data.error || "Unable to save blog post.");
        return;
      }

      if (isUpdate) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === data.blog!.id ? data.blog! : b))
        );
      } else {
        setBlogs((prev) => [data.blog!, ...prev]);
      }

      setEditing(null);
      setPreviewMode(false);
      setFeedback("Blog post saved and published cache refreshed.");
    } catch {
      setFeedback("Network error while saving blog post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this blog post permanently?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setFeedback("Blog post deleted.");
      }
    } catch {
      setFeedback("Unable to delete blog post.");
    }
  }

  if (editing) {
    const hasEmDash =
      editing.title.includes("\u2014") ||
      editing.excerpt.includes("\u2014") ||
      editing.content.includes("\u2014");

    return (
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DFD3] pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#181B20]">
              {editing.id ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            <p className="text-xs text-[#646B76]">
              Changes update the live website immediately upon saving.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPreviewMode((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD7C8] bg-white px-4 py-2 text-xs font-bold text-[#181B20] hover:border-[#D79A27] cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{previewMode ? "Back to Editor" : "Preview Content"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setPreviewMode(false);
              }}
              className="rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-4 py-2 text-xs font-bold text-[#4F5560] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#A41C21] px-5 py-2 text-xs font-bold text-white hover:bg-[#821318] disabled:opacity-60 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Blog Post"}
            </button>
          </div>
        </div>

        {hasEmDash && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <span>
              Notice: Em dash character detected. It will be automatically
              converted to clean punctuation when saved.
            </span>
            <button
              type="button"
              onClick={() =>
                setEditing({
                  ...editing,
                  title: sanitizeNoEmDash(editing.title),
                  excerpt: sanitizeNoEmDash(editing.excerpt),
                  content: sanitizeNoEmDash(editing.content),
                })
              }
              className="font-bold underline shrink-0 cursor-pointer"
            >
              Clean Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={editing.title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    setEditing({
                      ...editing,
                      title: nextTitle,
                      slug: editing.id ? editing.slug : slugify(nextTitle),
                    });
                  }}
                  placeholder="e.g. Complete Guide to VAT Registration in Sri Lanka"
                  className="w-full rounded-xl border border-[#DFD7C8] px-4 py-2.5 text-sm font-semibold text-[#181B20] focus:border-[#A41C21] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: slugify(e.target.value) })
                    }
                    placeholder="auto-generated-from-title"
                    className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20] focus:border-[#A41C21] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1.5">
                    Category
                  </label>
                  <select
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20] focus:border-[#A41C21] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1.5">
                  Short Summary / Excerpt *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editing.excerpt}
                  onChange={(e) =>
                    setEditing({ ...editing, excerpt: e.target.value })
                  }
                  placeholder="2-sentence overview shown on the blog index and home page..."
                  className="w-full rounded-xl border border-[#DFD7C8] px-4 py-2.5 text-sm text-[#181B20] focus:border-[#A41C21] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560]">
                    Article Body (Markdown) *
                  </label>
                  {!previewMode && (
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "H2", snippet: "## Section Heading\n" },
                        { label: "H3", snippet: "### Subheading\n" },
                        { label: "Bold", snippet: "**Important Term** " },
                        { label: "List", snippet: "- Bullet item\n" },
                        { label: "Quote", snippet: "> Key takeaway note\n" },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => insertSnippet(btn.snippet)}
                          className="rounded-lg border border-[#E6DFD3] bg-[#FAF8F5] px-2.5 py-1 text-[11px] font-bold text-[#181B20] hover:border-[#A41C21] cursor-pointer"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {previewMode ? (
                  <div className="min-h-[320px] rounded-xl border border-[#E6DFD3] bg-[#FAF8F5] p-6">
                    <MarkdownContent content={editing.content} />
                  </div>
                ) : (
                  <textarea
                    rows={14}
                    required
                    value={editing.content}
                    onChange={(e) =>
                      setEditing({ ...editing, content: e.target.value })
                    }
                    placeholder="Write your article using ## headings and - bullet points..."
                    className="w-full rounded-xl border border-[#DFD7C8] px-4 py-3 text-sm font-mono text-[#181B20] leading-relaxed focus:border-[#A41C21] focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Per-Blog SEO Settings */}
            <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#181B20]">
                <Sparkles className="h-4 w-4 text-[#D79A27]" />
                <span>Article SEO Settings & Search Preview</span>
              </div>

              <div className="rounded-xl border border-[#EFE9DD] bg-[#FAF8F5] p-4 space-y-1">
                <div className="text-xs text-[#006621]">
                  pinnacleprofessionalservices.lk/blog/
                  {editing.slug || "article-slug"}
                </div>
                <div className="text-base font-medium text-[#1A0DAB] truncate">
                  {editing.seoTitle || editing.title || "Article Title Preview"}
                </div>
                <div className="text-xs text-[#4D5156] line-clamp-2">
                  {editing.seoDescription ||
                    editing.excerpt ||
                    "Article meta description preview shown on Google search results."}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={editing.seoTitle}
                    onChange={(e) =>
                      setEditing({ ...editing, seoTitle: e.target.value })
                    }
                    placeholder="Defaults to article title if left blank"
                    className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
                    <label>SEO Meta Description</label>
                    <span>
                      {(editing.seoDescription || editing.excerpt).length}/160
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={editing.seoDescription}
                    onChange={(e) =>
                      setEditing({ ...editing, seoDescription: e.target.value })
                    }
                    placeholder="Defaults to excerpt if left blank"
                    className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
                    Focus Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editing.seoKeywords}
                    onChange={(e) =>
                      setEditing({ ...editing, seoKeywords: e.target.value })
                    }
                    placeholder="e.g. VAT registration Sri Lanka, TIN IRD Colombo"
                    className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 space-y-4">
              <h3 className="font-display text-base font-bold text-[#181B20]">
                Publishing & Media
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1.5">
                  Publication Status
                </label>
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as BlogStatus,
                    })
                  }
                  className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm font-semibold text-[#181B20]"
                >
                  <option value="published">Published (Visible on Site)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 text-sm font-medium text-[#181B20] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) =>
                    setEditing({ ...editing, featured: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#A41C21]"
                />
                <span>Feature on Home Page</span>
              </label>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={editing.author}
                  onChange={(e) =>
                    setEditing({ ...editing, author: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
                />
              </div>

              <ImageUploadField
                label="Featured Cover Image"
                value={editing.coverImage}
                onChange={(url) =>
                  setEditing({
                    ...editing,
                    coverImage: url,
                    ogImage: editing.ogImage || url,
                  })
                }
                mediaItems={mediaItems}
                onMediaAdded={onMediaAdded}
              />

              {editing.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editing.coverImage}
                  alt={editing.coverAlt || "Cover preview"}
                  className="h-40 w-full rounded-xl object-cover border border-[#E6DFD3]"
                />
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1.5">
                  Cover Image Alt Text (SEO)
                </label>
                <input
                  type="text"
                  value={editing.coverAlt}
                  onChange={(e) =>
                    setEditing({ ...editing, coverAlt: e.target.value })
                  }
                  placeholder="Describe the cover photo for accessibility & SEO"
                  className="w-full rounded-xl border border-[#DFD7C8] px-3.5 py-2.5 text-sm text-[#181B20]"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#181B20]">
            Blog Articles & Knowledge Hub
          </h2>
          <p className="text-sm text-[#646B76]">
            Create, edit, publish, or optimize SEO for your blog posts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFeedback("");
            setEditing(emptyDraft());
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#821318] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Blog Post</span>
        </button>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646B76]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts by title or category..."
          className="w-full rounded-xl border border-[#DFD7C8] bg-white pl-10 pr-4 py-2.5 text-sm text-[#181B20]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-[#E6DFD3] bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#D79A27] transition-colors"
          >
            <div className="flex items-start gap-4 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.coverAlt || post.title}
                className="h-20 w-28 shrink-0 rounded-xl object-cover border border-[#E6DFD3]"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-bold uppercase ${
                      post.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {post.status}
                  </span>
                  <span className="font-semibold text-[#A41C21]">
                    {post.category}
                  </span>
                  <span className="text-[#646B76]">{post.readTime}</span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#181B20] truncate">
                  {post.title}
                </h3>
                <p className="text-xs text-[#646B76] line-clamp-1">
                  /blog/{post.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setEditing(toDraft(post))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-3.5 py-2 text-xs font-bold text-[#181B20] hover:border-[#A41C21] cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
