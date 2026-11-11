# Pinnacle Professional Services Private Limited

Official web platform and integrated CMS Admin Portal for **Pinnacle Professional Services Private Limited** (No 15, Samagi Mawatha, Kawdana Road, Dehiwala, Colombo, Sri Lanka).

## Tech Stack
- **Next.js 16 (App Router) + React 19 + TypeScript** for high-speed server rendering, ISR caching, automatic font optimization, and dynamic SEO metadata.
- **Tailwind CSS v4** styled around the official Pinnacle Crimson (`#A41C21`), Metallic Gold (`#D79A27`), Charcoal Ink (`#181B20`), and Warm Ivory (`#FAF8F5`) brand palette.
- **SQLite (`node:sqlite`)** for zero-configuration relational persistence of blogs, banners/images, SEO configuration, uploaded media, and client inquiries (`data/pinnacle.db`).

## Features
- **Public Corporate Website**:
  - Home page with dynamic Hero Banner, Rs. 32,000 All-Inclusive Company Registration showcase & checklist, 6 core service pillars, About section, 4-step workflow, Knowledge Hub blogs, FAQs, and Dehiwala consultation CTA.
  - Individual SEO-friendly service pages (`/services`, `/services/[slug]`) covering Company Registration, Corporate Secretarial Services, Bookkeeping & Accountancy, Taxation / VAT / TIN / Auditing, HR & Payroll (EPF/ETF), and Websites / POS / Social Media Marketing.
  - Filterable Blog Hub (`/blog`, `/blog/[slug]`) with Schema.org `BlogPosting` JSON-LD.
  - Interactive Contact & Consultation Form (`/contact`) with Dehiwala map embed and sticky WhatsApp action button (`+94 77 302 8033`).
  - Dynamic `/sitemap.xml` and `/robots.txt`.
- **Admin CMS Portal (`/admin`)**:
  - Protected by HMAC-SHA256 signed HttpOnly session cookies (`/admin/login`).
  - **Blog Manager**: Add, edit, publish/draft, feature, or delete blog posts with live Markdown preview, image uploads, per-post SEO fields, and automatic em-dash cleanup.
  - **Banners & Website Images**: Upload new images or replace any banner, service card image, flyer, or logo directly from the Admin Portal with instant cache revalidation.
  - **SEO Settings**: Configure global meta tags, page-specific SEO overrides, Google Search Console verification, GA4 Measurement ID, indexing directives, and LocalBusiness structured data with live SERP preview.
  - **Media Library & Client Inquiries**: Upload/manage images (`data/uploads/`) and track contact form leads.

## Getting Started

1. Copy `.env.example` to `.env.local` (optional for custom admin credentials):
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies & run development server:
   ```bash
   npm install
   npm run dev
   ```
3. Build and run in production mode:
   ```bash
   npm run build
   npm run start
   ```

## Default Admin Login
- **URL**: `/admin`
- **Username**: `admin` (or `ADMIN_USERNAME` in `.env.local`)
- **Password**: `Pinnacle@2026` (or `ADMIN_PASSWORD` in `.env.local`; change anytime inside the **Security** tab of `/admin`)
