import type { Metadata } from "next";
import {
  Clock,
  Facebook,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { BRAND } from "@/lib/constants";
import { getSeoSettings } from "@/lib/db";
import { ContactForm } from "@/components/ContactForm";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  const cSeo = seo.pageOverrides?.contact;
  const title =
    cSeo?.title || "Contact Us | Dehiwala, Colombo Office & WhatsApp Consultation";
  const description = cSeo?.description || seo.defaultDescription;

  return {
    title,
    description,
    keywords: (cSeo?.keywords || seo.defaultKeywords)
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: { canonical: "/contact" },
    openGraph: {
      title,
      description,
      url: "/contact",
      images: cSeo?.ogImage ? [{ url: cSeo.ogImage }] : undefined,
    },
  };
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const defaultService =
    service === "company-registration"
      ? "Company Registration (Rs. 32,000 Package)"
      : service || "";

  return (
    <div className="bg-white">
      <section className="bg-[#FAF8F5] border-b border-[#E6DFD3] py-14 sm:py-16">
        <div className="container-fluid max-w-3xl text-center space-y-3">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#A41C21]">
            Direct Consultation Desk
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#181B20]">
            Contact Pinnacle Professional Services
          </h1>
          <p className="text-base text-[#3D424B] leading-relaxed">
            Visit our office in Dehiwala, Colombo, call us on{" "}
            {BRAND.phoneDisplay}, or message us on WhatsApp for fast corporate,
            accounting, and tax assistance.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-fluid grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Cards & Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-[#181B20] text-white p-7 sm:p-8 space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#E8B84B]">
                  Colombo Office Details
                </div>
                <h2 className="font-display text-2xl font-bold mt-1">
                  {BRAND.legalName}
                </h2>
              </div>

              <div className="space-y-4 text-sm text-[#D9D5CD]">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-[#D79A27] mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Office Address</div>
                    <div>{BRAND.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-[#D79A27] mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Phone Hotline</div>
                    <a
                      href={BRAND.phoneHref}
                      className="text-base font-bold text-[#E8B84B] hover:underline"
                    >
                      {BRAND.phoneDisplay} ({BRAND.phoneInternational})
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-[#D79A27] mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Email Address</div>
                    <a
                      href={BRAND.emailHref}
                      className="break-all hover:text-[#E8B84B]"
                    >
                      {BRAND.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-[#D79A27] mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Office Hours</div>
                    <div>{BRAND.hours}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <a
                  href={BRAND.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#1EBE5B]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Us</span>
                </a>
                <a
                  href={BRAND.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                >
                  <Facebook className="h-4 w-4 text-[#D79A27]" />
                  <span>Facebook Page</span>
                </a>
              </div>
            </div>

            {/* Embedded Dehiwala Map */}
            <div className="rounded-3xl overflow-hidden border border-[#E6DFD3] bg-[#FAF8F5] shadow-sm">
              <iframe
                title="Pinnacle Professional Services Dehiwala Location Map"
                src="https://www.google.com/maps?q=No+15,+Samagi+Mawatha,+Kawdana+Road,+Dehiwala,+Colombo,+Sri+Lanka&output=embed"
                width="100%"
                height="280"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full border-0"
              />
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-7 rounded-3xl border border-[#E6DFD3] bg-[#FAF8F5] p-6 sm:p-9 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#A41C21]">
                Send an Inquiry
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#181B20]">
                Request a Free Consultation or Package Quote
              </h2>
              <p className="text-sm text-[#4F5560]">
                Fill out your details below and our advisory team will get back
                to you promptly with next steps and fee estimates.
              </p>
            </div>

            <ContactForm defaultService={defaultService} />
          </div>
        </div>
      </section>
    </div>
  );
}
