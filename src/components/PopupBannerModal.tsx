"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { resolveMediaWithBase } from "@/lib/cms-client";
import { useCmsLive } from "@/components/CmsLiveProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const STORAGE_KEY = "pinnacle_popup_dismissed_at";
const emptySubscribe = () => () => {};

export function PopupBannerModal() {
  const pathname = usePathname();
  const { banners, loaded, apiBase } = useCmsLive();
  const popup = banners["popup_banner"];
  const [delayElapsed, setDelayElapsed] = useState(false);
  const [dismissedAtState, setDismissedAtState] = useState<string>("");

  const storedDismissedAt = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return sessionStorage.getItem(STORAGE_KEY) || "";
      } catch {
        return "";
      }
    },
    () => ""
  );

  useEffect(() => {
    if (pathname.startsWith("/admin") || !popup || !popup.enabled) {
      return;
    }
    const timer = window.setTimeout(
      () => {
        setDelayElapsed(true);
      },
      loaded ? 450 : 950
    );

    return () => window.clearTimeout(timer);
  }, [pathname, popup, loaded]);

  const effectiveDismissedAt = dismissedAtState || storedDismissedAt;
  const visible =
    delayElapsed &&
    !pathname.startsWith("/admin") &&
    Boolean(popup?.enabled) &&
    !(effectiveDismissedAt && effectiveDismissedAt === popup?.updatedAt);

  useEffect(() => {
    if (!visible) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        dismiss();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function dismiss() {
    setDelayElapsed(false);
    if (popup?.updatedAt) {
      setDismissedAtState(popup.updatedAt);
      try {
        sessionStorage.setItem(STORAGE_KEY, popup.updatedAt);
      } catch {
        // Ignore storage write failures
      }
    }
  }

  if (!visible || !popup || !popup.enabled || pathname.startsWith("/admin")) {
    return null;
  }

  const resolvedImg = resolveMediaWithBase(
    popup.imageUrl || "/images/brand/company-registration-flyer.jpg",
    apiBase
  );
  const href = popup.ctaHref || "/contact";
  const isExternalHref = /^https?:\/\//i.test(href);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pinnacle-popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white border border-[#E6DFD3] shadow-2xl grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#A41C21] via-[#D79A27] to-[#A41C21] md:col-span-12" />

        <button
          type="button"
          onClick={dismiss}
          aria-label="Close announcement banner"
          className="absolute top-3.5 right-3.5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#181B20] border border-[#E6DFD3] shadow-sm hover:bg-[#A41C21] hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {resolvedImg && (
          <div className="md:col-span-5 relative bg-[#F3EFE7] min-h-[200px] md:min-h-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedImg}
              alt={popup.altText || popup.headline}
              className="h-full w-full object-cover object-top"
            />
          </div>
        )}

        <div
          className={`${resolvedImg ? "md:col-span-7" : "md:col-span-12"} p-6 sm:p-8 flex flex-col justify-between space-y-5`}
        >
          <div className="space-y-3 pr-6">
            {popup.badgeText && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F2] border border-[#A41C21]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#A41C21]">
                <Sparkles className="h-3.5 w-3.5 text-[#D79A27]" />
                <span>{popup.badgeText}</span>
              </div>
            )}

            <h2
              id="pinnacle-popup-title"
              className="font-display text-2xl sm:text-3xl font-extrabold text-[#181B20] leading-tight"
            >
              {popup.headline || "Special Corporate Advisory Offer"}
            </h2>

            {popup.subheadline && (
              <p className="text-sm text-[#3D424B] leading-relaxed">
                {popup.subheadline}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            {popup.ctaLabel &&
              (isExternalHref ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3 text-sm font-bold text-white hover:bg-[#821318] transition-colors"
                >
                  <span>{popup.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={href}
                  onClick={dismiss}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3 text-sm font-bold text-white hover:bg-[#821318] transition-colors"
                >
                  <span>{popup.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}

            <a
              href={BRAND.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#25D366] bg-[#25D366]/10 px-4 py-3 text-sm font-bold text-[#146C34] hover:bg-[#25D366] hover:text-white transition-colors"
            >
              <WhatsAppIcon variant="mono" className="h-4 w-4 shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
