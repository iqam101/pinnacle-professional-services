"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { BlogPost } from "@/types/cms";
import { CmsImage } from "@/components/CmsImage";

export function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    posts.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const catMatch =
        selectedCategory === "All" || post.category === selectedCategory;
      const qMatch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [posts, query, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#A41C21] text-white shadow-sm"
                  : "bg-[#FAF8F5] border border-[#E6DFD3] text-[#3D424B] hover:border-[#D79A27]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#646B76]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            aria-label="Search blog articles"
            className="w-full rounded-xl border border-[#DFD7C8] bg-white pl-10 pr-4 py-2.5 text-sm text-[#181B20] placeholder:text-[#8C939E] focus:border-[#A41C21] focus:outline-none"
          />
        </div>
      </div>

      {/* Article Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E6DFD3] bg-[#FAF8F5] p-10 text-center space-y-2">
          <p className="font-display text-lg font-bold text-[#181B20]">
            No matching articles found
          </p>
          <p className="text-sm text-[#646B76]">
            Try selecting a different category or clearing your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col rounded-2xl border border-[#E6DFD3] bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-[#D79A27] transition-all"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="relative h-52 w-full overflow-hidden bg-[#F3EFE7] block"
              >
                <CmsImage
                  src={post.coverImage}
                  alt={post.coverAlt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#A41C21]">
                      {post.category}
                    </span>
                    <span className="text-[#646B76]">{post.readTime}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#181B20] group-hover:text-[#A41C21] transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-sm text-[#4F5560] line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#646B76]">
                    {new Date(post.publishedAt).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#A41C21]"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
