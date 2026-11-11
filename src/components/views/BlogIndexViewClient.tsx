"use client";

import { useCmsLive } from "@/components/CmsLiveProvider";
import { BlogListClient } from "@/components/BlogListClient";
import type { BlogPost } from "@/types/cms";

export function BlogIndexViewClient({
  initialPosts,
}: {
  initialPosts: BlogPost[];
}) {
  const { blogs, loaded } = useCmsLive();
  const activePosts = loaded ? blogs : initialPosts;

  return <BlogListClient posts={activePosts} />;
}
