import type { SeoSettings } from "@/types/cms";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function buildLocalBusinessSchema(seo: SeoSettings) {
  const baseUrl = seo.canonicalBaseUrl.replace(/\/+$/, "");
  const logoUrl = `${baseUrl}/images/brand/pinnacle-logo.png`;
  const imageUrl = seo.ogDefaultImage.startsWith("http")
    ? seo.ogDefaultImage
    : `${baseUrl}${seo.ogDefaultImage}`;

  return {
    "@context": "https://schema.org",
    "@type": ["AccountingService", "ProfessionalService", "LocalBusiness"],
    name: seo.businessName,
    slogan: seo.tagline,
    description: seo.defaultDescription,
    url: baseUrl,
    logo: logoUrl,
    image: imageUrl,
    telephone: seo.phone,
    email: seo.email,
    priceRange: seo.priceRange || "Rs. 32,000+",
    address: {
      "@type": "PostalAddress",
      streetAddress: "No 15, Samagi Mawatha, Kawdana Road, Dehiwala",
      addressLocality: "Colombo",
      addressRegion: "Western Province",
      addressCountry: "LK",
    },
    areaServed: [
      { "@type": "City", name: "Colombo" },
      { "@type": "City", name: "Dehiwala-Mount Lavinia" },
      { "@type": "Country", name: "Sri Lanka" },
    ],
    sameAs: [seo.facebookUrl].filter(Boolean),
    openingHours: ["Mo-Fr 08:30-17:30", "Sa 09:00-13:30"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Corporate, Accounting, Tax, and HR Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Private Limited Company Registration Package",
            description:
              "Company name approval, Articles of Association, Form 1/12/19, Certified Form 1, Register BO 01 & BO 05, Bank Resolutions, Director Seal, and Tax Advice.",
          },
          price: "32000",
          priceCurrency: "LKR",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bookkeeping, Accountancy, Tax, VAT & TIN Services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Corporate Secretarial & HR Payroll Services",
          },
        },
      ],
    },
  };
}
