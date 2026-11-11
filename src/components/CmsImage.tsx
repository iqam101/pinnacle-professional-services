import Image from "next/image";

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
 * Renders local static assets with Next.js Image optimization and safely handles
 * runtime API uploads (/api/media/...) or admin-provided external image URLs.
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
  const safeSrc = src?.trim() || "/images/banners/hero-office-colombo.webp";
  const isDynamicOrExternal =
    safeSrc.startsWith("/api/") ||
    safeSrc.startsWith("http://") ||
    safeSrc.startsWith("https://") ||
    safeSrc.startsWith("data:");

  if (isDynamicOrExternal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={
          fill
            ? `absolute inset-0 h-full w-full ${className}`
            : className
        }
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={safeSrc}
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
      src={safeSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
