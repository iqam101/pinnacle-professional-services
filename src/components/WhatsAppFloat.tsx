"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/constants";

export function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href={BRAND.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Pinnacle Professional Services on WhatsApp +94 77 302 8033"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] text-white px-4 py-3.5 sm:px-5 shadow-[0_10px_28px_rgba(37,211,102,0.4)] hover:bg-[#1EBE5B] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    >
      <MessageCircle className="h-6 w-6 shrink-0 fill-white/15" />
      <span className="hidden sm:inline font-display text-sm font-bold tracking-tight">
        WhatsApp Us
      </span>
    </a>
  );
}
