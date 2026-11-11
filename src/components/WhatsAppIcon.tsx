import type { SVGProps } from "react";

interface WhatsAppIconProps extends SVGProps<SVGSVGElement> {
  /**
   * "brand": solid #25D366 speech bubble with white telephone handset (great on light/neutral surfaces).
   * "mono": speech bubble outline with filled handset in currentColor (great on solid green/red surfaces).
   */
  variant?: "brand" | "mono";
}

const BUBBLE_PATH = "M4.03 16.68A9.4 9.4 0 1 1 7.3 19.84L2.7 21.1Z";
const HANDSET_PATH =
  "M9.15 7.35h1.18c.32 0 .6.2.72.5l.74 1.85c.11.27.05.59-.15.8l-.78.82c-.14.15-.18.37-.09.56.67 1.38 1.79 2.5 3.17 3.17.19.09.41.05.56-.09l.82-.78c.21-.2.53-.26.8-.15l1.85.74c.3.12.5.4.5.72v1.18c0 .93-.84 1.63-1.76 1.46-2.42-.44-4.63-1.6-6.4-3.36-1.76-1.77-2.92-3.98-3.36-6.4-.17-.92.53-1.76 1.46-1.76Z";

export function WhatsAppIcon({
  variant = "brand",
  className = "h-4 w-4 shrink-0",
  ...props
}: WhatsAppIconProps) {
  if (variant === "mono") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={className}
        {...props}
      >
        <path
          d={BUBBLE_PATH}
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path d={HANDSET_PATH} fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d={BUBBLE_PATH} fill="#25D366" />
      <path d={HANDSET_PATH} fill="#FFFFFF" />
    </svg>
  );
}
