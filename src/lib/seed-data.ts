import { BRAND } from "@/lib/constants";
import type { BannerSlot, BlogPost, SeoSettings } from "@/types/cms";

const NOW = "2026-11-11T09:00:00.000Z";

export const DEFAULT_BANNERS: BannerSlot[] = [
  {
    key: "hero_banner",
    label: "Hero Primary Banner",
    sectionGroup: "hero",
    pageLocation: "Home Page (Top Hero Showcase)",
    imageUrl: "/images/banners/hero-office-colombo.webp",
    defaultImageUrl: "/images/banners/hero-office-colombo.webp",
    altText:
      "Modern corporate advisory and accounting office in Colombo representing Pinnacle Professional Services Private Limited",
    badgeText: "Colombo Corporate & Financial Advisory",
    headline: "Your Business. Our Priority.",
    subheadline:
      "Company Registration, Bookkeeping, Accountancy, Tax, VAT & TIN, Secretarial, and HR Solutions tailored for Sri Lankan businesses.",
    ctaLabel: "Start Your Company (Rs. 32,000)",
    ctaHref: "/services/company-registration",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "popup_banner",
    label: "Site Entry Pop-up Promo Banner",
    sectionGroup: "popup",
    pageLocation: "Site-Wide Pop-up Modal (When Enabled)",
    imageUrl: "/images/brand/company-registration-flyer.jpg",
    defaultImageUrl: "/images/brand/company-registration-flyer.jpg",
    altText:
      "Pinnacle Professional Services Private Limited Special Incorporation Announcement",
    badgeText: "Special Offer",
    headline: "Start Your Pvt Ltd Company All For Rs. 32,000",
    subheadline:
      "Complete eROC incorporation with Articles of Association, Form 1, 12, 19, BO 01 & BO 05 registers, bank resolutions, and director seal.",
    ctaLabel: "Claim Package Now",
    ctaHref: "/contact?service=company-registration",
    enabled: false,
    updatedAt: NOW,
  },
  {
    key: "company_reg_banner",
    label: "Company Registration Flyer & Showcase",
    sectionGroup: "sections",
    pageLocation: "Home Page (Rs. 32,000 Package Spotlight)",
    imageUrl: "/images/brand/company-registration-flyer.jpg",
    defaultImageUrl: "/images/brand/company-registration-flyer.jpg",
    altText:
      "Pinnacle Professional Services Private Limited Company Registration Rs. 32,000 All-Inclusive Package Flyer",
    badgeText: "All-Inclusive Incorporation",
    headline: "Launch Your Pvt Ltd Company for Rs. 32,000",
    subheadline:
      "From name approval and Articles of Association to Form 1, 12, 19, BO 01 & BO 05 registers, bank resolutions, and director seal.",
    ctaLabel: "Book Incorporation via WhatsApp",
    ctaHref: "/contact?service=company-registration",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "about_banner",
    label: "About & Advisory Team Banner",
    sectionGroup: "sections",
    pageLocation: "Home Page & About Us Page",
    imageUrl: "/images/banners/about-team-advisory.webp",
    defaultImageUrl: "/images/banners/about-team-advisory.webp",
    altText:
      "Pinnacle Professional Services business consultants and accountants collaborating in Dehiwala, Colombo",
    badgeText: "Dehiwala, Colombo Advisory Firm",
    headline: "Everything You Need to Start and Scale Right",
    subheadline:
      "Combining statutory company secretarial precision with practical accounting, IRD tax strategy, and modern digital tools.",
    ctaLabel: "Meet Pinnacle Professional Services",
    ctaHref: "/about",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "services_banner",
    label: "Services Overview Header Banner",
    sectionGroup: "sections",
    pageLocation: "Services Directory & CTA Band",
    imageUrl: "/images/banners/services-desk-ledger.webp",
    defaultImageUrl: "/images/banners/services-desk-ledger.webp",
    altText:
      "Corporate financial ledger, accounting laptop, and statutory compliance portfolio",
    badgeText: "Comprehensive Corporate Solutions",
    headline: "Built for Founders, SMEs, and Growing Enterprises",
    subheadline:
      "Partner with one dedicated team in Colombo for secretarial compliance, monthly bookkeeping, VAT & TIN filings, payroll, and digital growth.",
    ctaLabel: "Request a Custom Quote",
    ctaHref: "/contact",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "cta_banner",
    label: "Consultation Call-to-Action Banner",
    sectionGroup: "sections",
    pageLocation: "Bottom Consultation Section",
    imageUrl: "/images/banners/hero-office-colombo.webp",
    defaultImageUrl: "/images/banners/hero-office-colombo.webp",
    altText: "Consultation room at Pinnacle Professional Services Private Limited",
    badgeText: "Direct Partner Access",
    headline: "Ready to Register or Streamline Your Accounts?",
    subheadline:
      "Speak directly with our Colombo advisory desk on 077 302 8033 or visit No 15, Samagi Mawatha, Kawdana Road, Dehiwala.",
    ctaLabel: "Schedule a Free Consultation",
    ctaHref: "/contact",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "brand_logo",
    label: "Website Header & Brand Logo",
    sectionGroup: "brand",
    pageLocation: "Global Header & Brand Identity",
    imageUrl: "/images/brand/pinnacle-logo-transparent.png",
    defaultImageUrl: "/images/brand/pinnacle-logo-transparent.png",
    altText: "Pinnacle Professional Services Private Limited Official Logo",
    badgeText: "Primary Logo",
    headline: BRAND.legalName,
    subheadline: BRAND.tagline,
    ctaLabel: "Home",
    ctaHref: "/",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "service_company_reg",
    label: "Service Image: Company Registration",
    sectionGroup: "services",
    pageLocation: "Services Grid & Company Registration Page",
    imageUrl: "/images/banners/hero-office-colombo.webp",
    defaultImageUrl: "/images/banners/hero-office-colombo.webp",
    altText: "Company registration and incorporation documents in Sri Lanka",
    badgeText: "Corporate Formation",
    headline: "Company Registration & Incorporation",
    subheadline: "All-inclusive Private Limited setup for Rs. 32,000.",
    ctaLabel: "Explore Service",
    ctaHref: "/services/company-registration",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "service_secretarial",
    label: "Service Image: Secretarial Services",
    sectionGroup: "services",
    pageLocation: "Services Grid & Secretarial Page",
    imageUrl: "/images/banners/about-team-advisory.webp",
    defaultImageUrl: "/images/banners/about-team-advisory.webp",
    altText: "Corporate secretarial governance and annual return compliance",
    badgeText: "Statutory Governance",
    headline: "Corporate Secretarial Services",
    subheadline: "Form 15 Annual Returns, share transfers, and board resolutions.",
    ctaLabel: "Explore Service",
    ctaHref: "/services/secretarial-services",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "service_bookkeeping",
    label: "Service Image: Bookkeeping & Accountancy",
    sectionGroup: "services",
    pageLocation: "Services Grid & Bookkeeping Page",
    imageUrl: "/images/banners/services-desk-ledger.webp",
    defaultImageUrl: "/images/banners/services-desk-ledger.webp",
    altText: "Monthly bookkeeping, ledger management, and SLFRS financial reporting",
    badgeText: "Financial Clarity",
    headline: "Bookkeeping & Accountancy",
    subheadline: "Monthly management accounts, reconciliations, and audit prep.",
    ctaLabel: "Explore Service",
    ctaHref: "/services/bookkeeping-accountancy",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "service_tax_vat",
    label: "Service Image: Tax, VAT, TIN & Auditing",
    sectionGroup: "services",
    pageLocation: "Services Grid & Tax Page",
    imageUrl: "/images/banners/services-desk-ledger.webp",
    defaultImageUrl: "/images/banners/services-desk-ledger.webp",
    altText: "Sri Lanka IRD TIN, VAT, Income Tax, and Auditing services",
    badgeText: "IRD Compliance",
    headline: "Taxation, VAT, TIN & Auditing",
    subheadline: "TIN activation, VAT returns, RAMIS filings, and audit liaison.",
    ctaLabel: "Explore Service",
    ctaHref: "/services/tax-vat-tin-auditing",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "service_hr",
    label: "Service Image: HR & Payroll Services",
    sectionGroup: "services",
    pageLocation: "Services Grid & HR Page",
    imageUrl: "/images/banners/about-team-advisory.webp",
    defaultImageUrl: "/images/banners/about-team-advisory.webp",
    altText: "Company HR services, monthly payroll, EPF, and ETF filings",
    badgeText: "People Operations",
    headline: "Company HR Services & Payroll",
    subheadline: "Payroll processing, EPF C-Forms, ETF, and employment contracts.",
    ctaLabel: "Explore Service",
    ctaHref: "/services/hr-payroll-services",
    enabled: true,
    updatedAt: NOW,
  },
  {
    key: "service_digital",
    label: "Service Image: Web, POS & Marketing",
    sectionGroup: "services",
    pageLocation: "Services Grid & Digital Solutions Page",
    imageUrl: "/images/banners/hero-office-colombo.webp",
    defaultImageUrl: "/images/banners/hero-office-colombo.webp",
    altText: "Business website development, POS systems, and social media marketing",
    badgeText: "Growth Solutions",
    headline: "Website Development, POS & Marketing",
    subheadline: "Modern websites, retail POS software, and lead campaigns.",
    ctaLabel: "Explore Service",
    ctaHref: "/services/digital-business-solutions",
    enabled: true,
    updatedAt: NOW,
  },
];

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteTitle:
    "Pinnacle Professional Services Private Limited | Company Registration, Accounting & Tax in Colombo",
  titleTemplate: "%s | Pinnacle Professional Services",
  defaultDescription:
    "Your business. Our priority. Pinnacle Professional Services Private Limited in Dehiwala, Colombo offers Company Registration (Rs. 32,000), Bookkeeping, Accountancy, Tax, VAT & TIN, Secretarial, and HR Services across Sri Lanka.",
  defaultKeywords:
    "company registration Sri Lanka, company registration Colombo, bookkeeping Dehiwala, accounting services Sri Lanka, VAT registration Sri Lanka, TIN registration IRD, secretarial services Colombo, HR payroll EPF ETF Sri Lanka, Pinnacle Professional Services",
  canonicalBaseUrl: "https://pinnacleprofessionalservices.zenthoz.com",
  ogDefaultImage: "/images/banners/hero-office-colombo.jpg",
  twitterHandle: "@pinnacleserviceslk",
  googleVerification: "",
  gaMeasurementId: "",
  robotsIndex: true,
  robotsFollow: true,
  businessName: BRAND.legalName,
  tagline: BRAND.tagline,
  phone: BRAND.phoneInternational,
  whatsapp: BRAND.whatsappDisplay,
  email: BRAND.email,
  address: BRAND.address,
  city: "Dehiwala, Colombo",
  country: "Sri Lanka",
  openingHours: "Mo-Fr 08:30-17:30, Sa 09:00-13:30",
  facebookUrl: BRAND.facebookUrl,
  priceRange: "Rs. 32,000+",
  pageOverrides: {
    home: {
      title:
        "Pinnacle Professional Services Private Limited | Company Registration, Accounting & Tax Colombo",
      description:
        "Register your Private Limited company in Sri Lanka for Rs. 32,000. Expert bookkeeping, accountancy, Tax, VAT & TIN, secretarial, and HR services in Dehiwala, Colombo.",
      keywords:
        "Pinnacle Professional Services, company registration Sri Lanka Rs 32000, Dehiwala accounting firm, Colombo secretarial service",
      ogImage: "/images/banners/hero-office-colombo.jpg",
    },
    services: {
      title: "Corporate, Accounting, Tax, HR & Digital Services",
      description:
        "Explore end-to-end business services: Private Limited Company Registration, Secretarial Filings, Bookkeeping, Tax, VAT & TIN, Payroll, Websites, POS, and Marketing.",
      keywords:
        "business services Sri Lanka, bookkeeping Colombo, tax consultant Dehiwala, HR payroll EPF ETF",
      ogImage: "/images/banners/services-desk-ledger.jpg",
    },
    about: {
      title: "About Us | Trusted Business Partners in Dehiwala, Colombo",
      description:
        "Learn how Pinnacle Professional Services Private Limited empowers Sri Lankan startups and SMEs with reliable incorporation, compliance, and financial clarity.",
      keywords:
        "about Pinnacle Professional Services, Colombo business consultants, Dehiwala accountants",
      ogImage: "/images/banners/about-team-advisory.jpg",
    },
    blog: {
      title: "Insights & Compliance Guides for Sri Lankan Businesses",
      description:
        "Practical guides on eROC company registration, IRD TIN and VAT rules, monthly SME bookkeeping, and EPF/ETF payroll compliance in Sri Lanka.",
      keywords:
        "Sri Lanka business blog, eROC incorporation guide, IRD VAT TIN guide, EPF ETF guide",
      ogImage: "/images/banners/services-desk-ledger.jpg",
    },
    contact: {
      title: "Contact Us | Dehiwala, Colombo Office & WhatsApp Consultation",
      description:
        "Visit No 15, Samagi Mawatha, Kawdana Road, Dehiwala, Colombo or call/WhatsApp +94 77 302 8033 for immediate company registration and tax assistance.",
      keywords:
        "contact Pinnacle Professional Services, 077 302 8033, Dehiwala accounting office",
      ogImage: "/images/banners/hero-office-colombo.jpg",
    },
  },
  updatedAt: NOW,
};

export const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "blog-company-registration-guide",
    slug: "complete-guide-company-registration-sri-lanka",
    title: "Complete Guide to Private Limited Company Registration in Sri Lanka",
    category: "Company Registration",
    excerpt:
      "Everything Sri Lankan founders need to know about eROC name approval, Form 1, 12, 19, Beneficial Ownership BO 01 & BO 05 registers, and opening a corporate bank account.",
    content: `Starting a business in Sri Lanka begins with choosing the right legal structure. For most growing enterprises, service firms, importers, and tech startups, incorporating a Private Limited Liability Company (Pvt Ltd) under the Companies Act No. 07 of 2007 offers clear limited liability protection, bank credibility, and seamless investor onboarding.

## Step 1: Company Name Approval via eROC
Before submitting incorporation documents, your proposed company name must be searched and reserved with the Department of the Registrar of Companies (eROC). Selecting a distinctive name avoids rejections and saves several days during launch.

## Step 2: Preparing Core Statutory Forms and Articles
Once your name is approved, the statutory incorporation pack is compiled and digitally signed:
- **Articles of Association**: Defines governance rules, director powers, and shareholder rights.
- **Form 1**: Application for registration of a company, capturing shareholding and initial capital details.
- **Form 12**: Notice of the official registered office address in Sri Lanka.
- **Form 19**: Official consent and appointment of the Company Secretary.

## Step 3: Beneficial Ownership Registers (BO 01 & BO 05)
Under current Sri Lankan corporate transparency guidelines, companies must establish and register Beneficial Ownership declarations (Register BO 01 and BO 05). Having these prepared accurately during incorporation prevents banking delays later.

## Step 4: Banking Readiness and First-Year Advisory
After the Certificate of Incorporation and Certified Form 1 are issued, banks require formal **Board Resolutions for Bank Account Opening**, specimen signature mandates, and an official **Director Seal**. At Pinnacle Professional Services Private Limited, our Rs. 32,000 All-Inclusive Incorporation Package includes all of these deliverables plus initial accountancy and taxation setup guidance so you start right from day one.

Need assistance registering your company? Call or WhatsApp us on +94 77 302 8033 or visit our Dehiwala office.`,
    coverImage: "/images/banners/hero-office-colombo.jpg",
    coverAlt: "Modern Colombo corporate office prepared for new company incorporation",
    author: "Pinnacle Corporate Advisory Team",
    readTime: "4 min read",
    status: "published",
    featured: true,
    seoTitle:
      "Complete Guide to Private Limited Company Registration in Sri Lanka (Rs. 32,000 Package)",
    seoDescription:
      "Step-by-step guide to registering a Pvt Ltd company in Sri Lanka via eROC: name approval, Form 1/12/19, BO 01 & BO 05 registers, bank resolutions, and tax setup.",
    seoKeywords:
      "company registration Sri Lanka, Pvt Ltd incorporation Colombo, Form 1 Form 12 Form 19, Register BO 01 BO 05",
    ogImage: "/images/banners/hero-office-colombo.jpg",
    canonicalUrl: "",
    publishedAt: "2026-11-05T09:00:00.000Z",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "blog-tin-vat-guide-sri-lanka",
    slug: "tin-and-vat-registration-checklist-sri-lanka",
    title: "TIN and VAT Registration in Sri Lanka: Essential Checklist for Businesses",
    category: "Tax, VAT & TIN",
    excerpt:
      "Avoid Inland Revenue penalties by understanding mandatory TIN registration, RAMIS profile activation, VAT invoicing standards, and quarterly filing deadlines.",
    content: `Tax compliance in Sri Lanka has moved firmly into digital monitoring through the Inland Revenue Department (IRD) RAMIS system. Whether you operate a newly incorporated Pvt Ltd company or an established commercial enterprise, keeping your Taxpayer Identification Number (TIN) and Value Added Tax (VAT) registrations accurate is vital.

## Why Every Business Needs an Active TIN
A TIN is mandatory for registered corporate entities and eligible businesses in Sri Lanka. Beyond statutory compliance, commercial banks, import/export portals, and corporate procurement teams routinely ask for an active TIN and Tax Clearance confirmation before onboarding vendors.

## Key Documents Needed for Business TIN & VAT Registration
Preparing clean documentation speeds up IRD approval:
- Certificate of Incorporation and Certified Form 1
- Articles of Association and Form 12 (Registered Office)
- National Identity Card (NIC) or Passport copies of Directors
- Utility bill or lease agreement confirming the business premises address
- Recent bank statements and invoice templates for VAT threshold evaluation

## Monthly Bookkeeping Powers Stress-Free VAT Filings
VAT errors rarely happen because of complex tax law alone. Most issues arise from missing supplier tax invoices, unreconciled bank receipts, or late data entry. Keeping clean monthly ledgers ensures your input VAT claims are fully supported and output VAT returns are submitted accurately before due dates.

## Work With Dedicated Tax Advisors in Dehiwala, Colombo
Pinnacle Professional Services handles TIN registration, RAMIS activation, monthly VAT reconciliations, Corporate Income Tax, SSCL, WHT, and APIT schedules under one roof. Reach out on 077 302 8033 to review your current tax status.`,
    coverImage: "/images/banners/services-desk-ledger.jpg",
    coverAlt: "Tax compliance ledger, calculator, and financial documents",
    author: "Pinnacle Taxation Desk",
    readTime: "4 min read",
    status: "published",
    featured: true,
    seoTitle:
      "TIN & VAT Registration Checklist for Businesses in Sri Lanka | Pinnacle Advisory",
    seoDescription:
      "Essential Sri Lankan IRD checklist for TIN registration, RAMIS activation, VAT invoicing compliance, and avoiding late tax penalties.",
    seoKeywords:
      "TIN registration Sri Lanka, VAT registration Colombo, IRD RAMIS tax filing, tax consultant Dehiwala",
    ogImage: "/images/banners/services-desk-ledger.jpg",
    canonicalUrl: "",
    publishedAt: "2026-10-28T09:00:00.000Z",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "blog-monthly-bookkeeping-smes",
    slug: "why-monthly-bookkeeping-saves-smes-money-and-stress",
    title: "Why Monthly Bookkeeping Saves Sri Lankan SMEs Money, Penalties, and Cash Flow Stress",
    category: "Bookkeeping & Accountancy",
    excerpt:
      "Waiting until year-end to organize receipts costs businesses more than time. Discover how monthly management accounts improve cash flow and audit readiness.",
    content: `Many business owners treat accounting as an annual chore reserved for tax season. Yet waiting twelve months to sort through bank statements, supplier bills, and POS sales reports leaves directors flying blind on profitability and vulnerable to costly compliance mistakes.

## 1. Real-Time Visibility Into Cash Flow and Margins
Monthly management accounts give you a clear Profit and Loss statement, Balance Sheet, and Debtor Aging summary every single month. You can spot overdue customer invoices early, control creeping expenses, and plan inventory purchases with confidence.

## 2. Clean Bank Reconciliations Prevent Revenue Leakage
Regular bank and petty cash reconciliations quickly detect duplicate supplier payments, unrecorded bank charges, missing customer transfers, or POS settlement discrepancies.

## 3. Smooth External Audits and Bank Financing
When applying for working capital facilities, vehicle leases, or expansion loans, Sri Lankan banks require up-to-date SLFRS/LKAS financial statements. Monthly bookkeeping keeps your schedules audit-ready all year round, eliminating expensive year-end reconstruction fees.

## Outsource Your Accounts Without Full-Time Overhead
With Pinnacle Professional Services Private Limited, SMEs across Colombo and Sri Lanka gain a dedicated bookkeeping and accountancy team at a fraction of the cost of an in-house accounts department.`,
    coverImage: "/images/banners/services-desk-ledger.webp",
    coverAlt: "Clean SME bookkeeping ledger and laptop workspace",
    author: "Pinnacle Accounting Practice",
    readTime: "3 min read",
    status: "published",
    featured: false,
    seoTitle:
      "Monthly Bookkeeping Benefits for Sri Lankan SMEs | Pinnacle Professional Services",
    seoDescription:
      "Learn how monthly bookkeeping, bank reconciliations, and management accounts protect cash flow and speed up audits for Sri Lankan SMEs.",
    seoKeywords:
      "bookkeeping Sri Lanka, monthly management accounts Colombo, SME accountant Dehiwala, SLFRS financial statements",
    ogImage: "/images/banners/services-desk-ledger.jpg",
    canonicalUrl: "",
    publishedAt: "2026-10-19T09:00:00.000Z",
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "blog-epf-etf-hr-compliance",
    slug: "employer-guide-epf-etf-payroll-compliance-sri-lanka",
    title: "Employer Guide to EPF, ETF, and Payroll Compliance in Sri Lanka",
    category: "HR & Payroll",
    excerpt:
      "Hiring staff in Sri Lanka comes with statutory EPF, ETF, APIT, and contract responsibilities. Here is how growing employers stay 100 percent compliant.",
    content: `Expanding your team is an exciting milestone for any company. Alongside onboarding talent, Sri Lankan employers have clear statutory obligations toward the Employees' Provident Fund (EPF), Employees' Trust Fund (ETF), and payroll tax deductions.

## Core Monthly Statutory Contributions
- **EPF Contributions**: Standard employer contribution of 12 percent and employee deduction of 8 percent on total gross earnings as defined by the EPF Act, remitted via C-Form schedules before the last working day of the following month.
- **ETF Contributions**: Employer contribution of 3 percent remitted monthly to the Employees' Trust Fund Board alongside half-yearly R4 returns.
- **APIT Deductions**: Advance Personal Income Tax calculated accurately on monthly employee remuneration tables where applicable.

## Written Contracts and Clear HR Documentation
Every new hire should receive a written letter of appointment specifying job title, probation period, basic salary, allowances, leave entitlements, and notice terms. Maintaining structured personnel files protects both the employer and employees if disputes or labour inspections arise.

## Confidential Outsourced Payroll in Colombo
Pinnacle Professional Services manages monthly salary sheets, individual digital payslips, EPF C-Forms, ETF returns, and customized HR handbooks so business owners can focus on leading their teams.`,
    coverImage: "/images/banners/about-team-advisory.jpg",
    coverAlt: "HR and payroll team reviewing employee compliance records",
    author: "Pinnacle HR & Payroll Desk",
    readTime: "3 min read",
    status: "published",
    featured: false,
    seoTitle:
      "Employer Guide to EPF, ETF & Payroll Compliance in Sri Lanka | Pinnacle",
    seoDescription:
      "Practical guide for Sri Lankan employers on monthly EPF C-Forms, ETF remittances, APIT payroll deductions, and HR appointment contracts.",
    seoKeywords:
      "EPF ETF payroll Sri Lanka, HR services Colombo, payroll outsourcing Dehiwala, APIT payroll Sri Lanka",
    ogImage: "/images/banners/about-team-advisory.jpg",
    canonicalUrl: "",
    publishedAt: "2026-10-08T09:00:00.000Z",
    createdAt: NOW,
    updatedAt: NOW,
  },
];
