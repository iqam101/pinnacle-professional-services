"use client";

import { usePathname } from "next/navigation";
import { ArrowUpRight, Globe, Sparkles } from "lucide-react";

const ZENTHOZ_URL = "https://www.zenthoz.com/";

export function ZenthozBanner() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <section
      aria-label="Business Website & Digital Marketing Partner"
      className="bg-gradient-to-b from-[#FAF8F5] to-[#F3EEF9] border-t border-[#E6DFD3] py-10 sm:py-12"
    >
      <div className="container-fluid">
        <a
          href={ZENTHOZ_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-3xl border border-[#A75BFF]/35 bg-gradient-to-br from-[#17151C] via-[#4C178B] to-[#7F2AE8] px-6 py-7 sm:px-9 sm:py-8 lg:px-12 shadow-[0_22px_50px_-14px_rgba(90,24,158,0.42)] hover:-translate-y-1 hover:border-[#C084FC]/70 hover:shadow-[0_28px_66px_-12px_rgba(139,48,240,0.52)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A75BFF]/50"
        >
          {/* Ambient Purple UI Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-[#A75BFF]/30 blur-3xl transition-transform duration-500 group-hover:scale-110"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-[#E0338C]/20 blur-3xl transition-transform duration-500 group-hover:scale-110"
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 max-w-2xl">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-[#E9D5FF] shadow-inner">
                <Globe className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C084FC]/40 bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E9D5FF]">
                  <Sparkles className="h-3.5 w-3.5 text-[#FFD54D]" />
                  <span>Website & Digital Marketing by Zenthoz</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Does your business have a website yet?
                </h2>

                <p className="text-sm sm:text-base text-[#E9D5FF]/90 leading-relaxed">
                  Contact us to get a quote for a business website crafted for
                  growth, search visibility, and modern conversion.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
              <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-[#5A189E] shadow-[0_12px_30px_rgba(23,21,28,0.28)] group-hover:bg-[#F5EDFF] transition-colors">
                <span>Get a Quote at zenthoz.com</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
