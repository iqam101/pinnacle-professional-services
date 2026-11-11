import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { getBannerMap, getPublishedBlogs, getSeoSettings } from "@/lib/db";
import { DEFAULT_SEO_SETTINGS } from "@/lib/seed-data";
import { BRAND } from "@/lib/constants";
import { CmsLiveProvider } from "@/components/CmsLiveProvider";
import { PopupBannerModal } from "@/components/PopupBannerModal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ZenthozBanner } from "@/components/ZenthozBanner";
import { JsonLd, buildLocalBusinessSchema } from "@/components/JsonLd";

const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const plusJakarta = localFont({
  src: "../fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#A41C21",
};

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.BUILD_TARGET === "cloudflare") {
    return {
      title: {
        default: "Pinnacle Admin CMS Portal",
        template: "%s | Pinnacle Admin CMS",
      },
      description:
        "Administration portal for Pinnacle Professional Services Private Limited.",
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
    };
  }

  const seo = getSeoSettings();
  const baseUrl =
    seo.canonicalBaseUrl?.trim() || "https://pinnacleprofessionalservices.zenthoz.com";
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(baseUrl);
  } catch {
    metadataBase = new URL("https://pinnacleprofessionalservices.zenthoz.com");
  }

  return {
    metadataBase,
    title: {
      default: seo.siteTitle,
      template: seo.titleTemplate || "%s | Pinnacle Professional Services",
    },
    description: seo.defaultDescription,
    keywords: seo.defaultKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    authors: [{ name: seo.businessName }],
    creator: seo.businessName,
    publisher: seo.businessName,
    robots: {
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
      googleBot: {
        index: seo.robotsIndex,
        follow: seo.robotsFollow,
      },
    },
    verification: seo.googleVerification
      ? { google: seo.googleVerification }
      : undefined,
    openGraph: {
      type: "website",
      locale: "en_LK",
      siteName: seo.businessName,
      title: seo.siteTitle,
      description: seo.defaultDescription,
      images: [
        {
          url: seo.ogDefaultImage || "/images/banners/hero-office-colombo.jpg",
          width: 1376,
          height: 768,
          alt: seo.businessName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.siteTitle,
      description: seo.defaultDescription,
      creator: seo.twitterHandle || undefined,
      images: [seo.ogDefaultImage || "/images/banners/hero-office-colombo.jpg"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isCloudflareAdminBuild = process.env.BUILD_TARGET === "cloudflare";
  if (isCloudflareAdminBuild) {
    void DEFAULT_SEO_SETTINGS;
    return (
      <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
        <head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script src="/cms-config.js" />
        </head>
        <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#181B20] antialiased selection:bg-[#A41C21] selection:text-white">
          <main className="flex-1">{children}</main>
        </body>
      </html>
    );
  }

  const banners = getBannerMap();
  const seo = getSeoSettings();
  const blogs = getPublishedBlogs();
  const brandLogo = banners["brand_logo"];
  const logoUrl = brandLogo?.imageUrl || "/images/brand/pinnacle-logo-transparent.png";
  const defaultLogoUrl =
    brandLogo?.defaultImageUrl || "/images/brand/pinnacle-logo-transparent.png";
  const logoAlt = brandLogo?.altText || BRAND.legalName;
  const gaId =
    seo.gaMeasurementId && /^G-[A-Z0-9]+$/i.test(seo.gaMeasurementId.trim())
      ? seo.gaMeasurementId.trim()
      : null;

  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/cms-config.js" />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#181B20] antialiased selection:bg-[#A41C21] selection:text-white">
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
        <JsonLd data={buildLocalBusinessSchema(seo)} />
        <CmsLiveProvider
          initialBanners={banners}
          initialSeo={seo}
          initialBlogs={blogs}
        >
          <SiteHeader
            logoUrl={logoUrl}
            defaultLogoUrl={defaultLogoUrl}
            logoAlt={logoAlt}
          />
          <main className="flex-1">{children}</main>
          <ZenthozBanner />
          <SiteFooter logoUrl={logoUrl} logoAlt={logoAlt} seo={seo} />
          <PopupBannerModal />
          <WhatsAppFloat />
        </CmsLiveProvider>
      </body>
    </html>
  );
}
