import Link from "next/link";
import {
  Clock,
  Facebook,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { SERVICES } from "@/lib/services-data";
import type { SeoSettings } from "@/types/cms";

interface SiteFooterProps {
  logoUrl: string;
  logoAlt: string;
  seo: SeoSettings;
}

export function SiteFooter({ logoUrl, logoAlt, seo }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#14171C] text-[#D9D5CD] border-t border-[#262A33]">
      {/* Brand accent strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#A41C21] via-[#D79A27] to-[#A41C21]" />

      <div className="container-fluid py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-5">
            <Link
              href="/"
              className="inline-block bg-white rounded-2xl p-3.5 shadow-sm max-w-[230px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-24 w-auto object-contain mx-auto"
              />
            </Link>

            <p className="text-sm leading-relaxed text-[#B9B4AA] max-w-sm">
              {seo.businessName} is a Dehiwala, Colombo corporate secretarial,
              accounting, taxation, and business advisory firm dedicated to
              helping Sri Lankan founders start and scale with clarity.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={seo.facebookUrl || BRAND.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[#2C313B] bg-[#1C2027] px-3.5 py-2 text-xs font-semibold text-white hover:border-[#D79A27] hover:text-[#E8B84B] transition-colors"
              >
                <Facebook className="h-4 w-4 text-[#D79A27]" />
                <span>Facebook Page</span>
              </a>
              <a
                href={BRAND.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-semibold text-[#0F2918] hover:bg-[#20BD5A] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp +94 77 302 8033</span>
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[#E8B84B]">
              Core Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-[#C8C3B9] hover:text-white hover:translate-x-0.5 inline-block transition-all"
                  >
                    {service.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[#E8B84B]">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-[#C8C3B9] hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-[#C8C3B9] hover:text-white"
                >
                  All Services
                </Link>
              </li>
              <li>
                <Link
                  href="/services/company-registration"
                  className="text-[#C8C3B9] hover:text-white"
                >
                  Rs. 32,000 Incorporation
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#C8C3B9] hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[#C8C3B9] hover:text-white">
                  Insights & Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#C8C3B9] hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-[#9AA1AE] hover:text-[#E8B84B]"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Office & Direct Contact */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[#E8B84B]">
              Colombo Office
            </h3>
            <ul className="space-y-3.5 text-sm text-[#C8C3B9]">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#D79A27] mt-1" />
                <span>{seo.address || BRAND.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#D79A27]" />
                <a
                  href={BRAND.phoneHref}
                  className="font-semibold text-white hover:text-[#E8B84B]"
                >
                  {BRAND.phoneDisplay} / {BRAND.phoneInternational}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#D79A27]" />
                <a
                  href={BRAND.emailHref}
                  className="break-all hover:text-[#E8B84B]"
                >
                  {seo.email || BRAND.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 shrink-0 text-[#D79A27] mt-1" />
                <span>{BRAND.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-[#232730] bg-[#0F1216]">
        <div className="container-fluid py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8D95A2]">
          <p className="text-center sm:text-left">
            &copy; {year} {BRAND.legalName}. All rights reserved.
          </p>
          <p className="text-center sm:text-right text-[#A8A39A]">
            {BRAND.tagline} Secretarial, Accounting & Tax Advisory in Dehiwala,
            Colombo.
          </p>
        </div>
      </div>
    </footer>
  );
}
