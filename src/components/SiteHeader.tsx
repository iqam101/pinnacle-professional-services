"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Facebook,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { resolveMediaWithBase } from "@/lib/cms-client";
import { SERVICES } from "@/lib/services-data";
import { useCmsLive } from "@/components/CmsLiveProvider";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

interface SiteHeaderProps {
  logoUrl: string;
  defaultLogoUrl: string;
  logoAlt: string;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services", hasDropdown: true },
  {
    href: "/services/company-registration",
    label: "Company Registration",
  },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  logoUrl,
  defaultLogoUrl,
  logoAlt,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { banners, seo, apiBase } = useCmsLive();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const liveLogo = banners["brand_logo"];
  const activeLogoRaw = liveLogo?.imageUrl || logoUrl;
  const activeLogoAlt = liveLogo?.altText || logoAlt;
  const activeLogoUrl = resolveMediaWithBase(activeLogoRaw, apiBase);
  const isCustomLogo = Boolean(
    activeLogoRaw && activeLogoRaw !== defaultLogoUrl
  );
  const displayAddress = seo.address || BRAND.shortAddress;
  const displayPhone = seo.phone || BRAND.phoneDisplay;
  const displayEmail = seo.email || BRAND.email;
  const displayFacebook = seo.facebookUrl || BRAND.facebookUrl;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E6DFD3] shadow-[0_2px_16px_rgba(24,27,32,0.04)]">
      {/* Top Utility Bar */}
      <div className="hidden md:block bg-[#181B20] text-[#E8E4DC] text-xs">
        <div className="container-fluid flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
          <div className="flex items-center gap-3 min-w-0 max-w-full">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D79A27]" />
              <span className="truncate">{displayAddress}</span>
            </span>
            <span className="hidden lg:inline-block text-[#8D95A2]">|</span>
            <span className="hidden lg:inline-block text-[#C9C3B8] shrink-0">
              Mon to Sat Business Hours
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <a
              href={BRAND.phoneHref}
              className="inline-flex items-center gap-1.5 font-medium text-white hover:text-[#E8B84B] transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-[#D79A27]" />
              <span>{displayPhone}</span>
            </a>
            <a
              href={`mailto:${displayEmail}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-[#E8E4DC] hover:text-[#E8B84B] transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-[#D79A27]" />
              <span>{displayEmail}</span>
            </a>
            <a
              href={displayFacebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinnacle Professional Services Facebook Page"
              className="inline-flex items-center gap-1 text-[#E8E4DC] hover:text-[#E8B84B] transition-colors"
            >
              <Facebook className="h-3.5 w-3.5 text-[#D79A27]" />
              <span className="hidden md:inline">Facebook</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container-fluid flex h-[68px] sm:h-[74px] items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 min-w-0 group focus:outline-none"
          aria-label={BRAND.legalName}
        >
          {isCustomLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeLogoUrl}
              alt={activeLogoAlt}
              className="h-10 sm:h-12 w-auto max-w-[180px] sm:max-w-[200px] object-contain"
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brand/pinnacle-mark.png"
                alt={activeLogoAlt}
                width={44}
                height={44}
                className="h-9 w-9 sm:h-11 sm:w-11 shrink-0 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div className="flex flex-col leading-none min-w-0">
                <span className="font-display text-base sm:text-xl font-extrabold tracking-[0.1em] sm:tracking-[0.14em] text-[#A41C21] truncate">
                  PINNACLE
                </span>
                <span className="text-[9px] sm:text-[11px] font-semibold tracking-[0.09em] sm:tracking-[0.16em] text-[#181B20] mt-0.5 truncate">
                  PROFESSIONAL SERVICES
                </span>
                <span className="hidden sm:block text-[9px] font-medium tracking-[0.2em] text-[#B57B15] mt-0.5 uppercase">
                  Your Business. Our Priority.
                </span>
              </div>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-1"
        >
          {NAV_LINKS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            if (item.hasDropdown) {
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      active
                        ? "text-[#A41C21] bg-[#FDF2F2]"
                        : "text-[#272B33] hover:text-[#A41C21] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </Link>

                  <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 absolute left-0 top-full pt-2 w-80 z-50">
                    <div className="rounded-2xl bg-white border border-[#E6DFD3] shadow-xl p-2">
                      {SERVICES.map((srv) => (
                        <Link
                          key={srv.slug}
                          href={`/services/${srv.slug}`}
                          className="block rounded-xl px-3.5 py-2.5 hover:bg-[#FAF8F5] transition-colors"
                        >
                          <div className="text-sm font-semibold text-[#181B20] hover:text-[#A41C21]">
                            {srv.shortTitle}
                          </div>
                          <div className="text-xs text-[#646B76] line-clamp-1 mt-0.5">
                            {srv.startingNote}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  active
                    ? "text-[#A41C21] bg-[#FDF2F2]"
                    : "text-[#272B33] hover:text-[#A41C21] hover:bg-[#FAF8F5]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <a
            href={BRAND.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#D79A27] bg-[#FDF8EC] px-3.5 py-2.5 text-sm font-semibold text-[#8E5D09] hover:bg-[#D79A27] hover:text-white transition-colors"
          >
            <WhatsAppIcon variant="brand" className="h-4 w-4 shrink-0" />
            <span>WhatsApp</span>
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-[#A41C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#821318] transition-colors"
          >
            Free Consultation
          </Link>
        </div>

        {/* Mobile Quick Actions + Toggle */}
        <div className="flex lg:hidden items-center gap-1.5 shrink-0">
          <a
            href={BRAND.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Pinnacle Professional Services"
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#25D366] text-white shadow-sm"
          >
            <WhatsAppIcon variant="mono" className="h-5 w-5 shrink-0" />
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#E6DFD3] bg-[#FAF8F5] text-[#181B20]"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E6DFD3] bg-white max-h-[calc(100vh-110px)] overflow-y-auto">
          <nav
            aria-label="Mobile Navigation"
            className="container-fluid py-4 space-y-1.5"
          >
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                pathname === "/"
                  ? "bg-[#FDF2F2] text-[#A41C21]"
                  : "text-[#181B20]"
              }`}
            >
              Home
            </Link>

            <div>
              <button
                type="button"
                onClick={() => setServicesOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-[#181B20]"
              >
                <span>Services</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    servicesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {servicesOpen && (
                <div className="pl-4 pr-2 pb-2 space-y-1">
                  <Link
                    href="/services"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-[#A41C21] bg-[#FDF2F2]"
                  >
                    View All Services
                  </Link>
                  {SERVICES.map((srv) => (
                    <Link
                      key={srv.slug}
                      href={`/services/${srv.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm font-medium text-[#3D424B] hover:bg-[#FAF8F5]"
                    >
                      {srv.shortTitle}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/services/company-registration"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                pathname === "/services/company-registration"
                  ? "bg-[#FDF2F2] text-[#A41C21]"
                  : "text-[#181B20]"
              }`}
            >
              Company Registration
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                pathname.startsWith("/blog")
                  ? "bg-[#FDF2F2] text-[#A41C21]"
                  : "text-[#181B20]"
              }`}
            >
              Blog & Insights
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                pathname === "/about"
                  ? "bg-[#FDF2F2] text-[#A41C21]"
                  : "text-[#181B20]"
              }`}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                pathname === "/contact"
                  ? "bg-[#FDF2F2] text-[#A41C21]"
                  : "text-[#181B20]"
              }`}
            >
              Contact Us
            </Link>

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-[#E6DFD3]">
              <a
                href={BRAND.phoneHref}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E6DFD3] bg-[#FAF8F5] py-3 px-4 text-sm font-semibold text-[#181B20]"
              >
                <Phone className="h-4 w-4 text-[#A41C21]" />
                <span>Call {BRAND.phoneDisplay}</span>
              </a>
              <a
                href={BRAND.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] py-3 px-4 text-sm font-semibold text-white"
              >
                <WhatsAppIcon variant="mono" className="h-4 w-4 shrink-0" />
                <span>WhatsApp Consultation</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
