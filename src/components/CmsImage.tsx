"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { getCmsApiBase, resolveMediaWithBase } from "@/lib/cms-client";

const emptySubscribe = () => () => {};

interface CmsImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

/**
 * Renders local static assets cleanly and automatically resolves /api/media/...
 * URLs to the configured Cloudflare backend when running as a split static site.
 */
export function CmsImage({
  src,
  alt,
  className = "",
  fill = false,
  width = 1200,
  height = 800,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: CmsImageProps) {
  const apiBase = useSyncExternalStore(
    emptySubscribe,
    () => getCmsApiBase(),
    () => ""
  );
  const rawSrc = src?.trim() || "/images/banners/hero-office-colombo.webp";
  const resolvedSrc = resolveMediaWithBase(rawSrc, apiBase);
  const isDynamicOrExternal =
    rawSrc.startsWith("/api/") ||
    resolvedSrc.startsWith("/api/") ||
    resolvedSrc.startsWith("http://") ||
    resolvedSrc.startsWith("https://") ||
    resolvedSrc.startsWith("data:");

  if (isDynamicOrExternal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={
          fill ? `absolute inset-0 h-full w-full ${className}` : className
        }
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
