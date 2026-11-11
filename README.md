# Pinnacle Professional Services Private Limited

Official web platform and integrated CMS Admin Portal for **Pinnacle Professional Services Private Limited** (No 15, Samagi Mawatha, Kawdana Road, Dehiwala, Colombo, Sri Lanka).

## Architecture Modes

This repository supports both **Split Free Hosting (Hostinger Static + Cloudflare Workers + D1)** and **Unified Node Hosting**:

1. **Split Deployment (Zero VPS Cost)**:
   - **Hostinger Shared Hosting (`dist-hostinger/` and `dist-hostinger.zip`)**: Serves the fast static public website under your domain or subdomain. Client-side live sync fetches updated blogs, banners, entry pop-up announcements, SEO overrides, and uploaded media directly from your Cloudflare Worker via `/cms-config.js`.
   - **Cloudflare Workers Free Tier (`worker/index.ts` + `dist-cloudflare/`)**: Hosts the `/admin` CMS Portal, API endpoints (`/api/*`), chunked binary image uploads, and serverless **Cloudflare D1** SQL database on a free `*.workers.dev` URL (no VPS or credit card required).
2. **Unified Node Mode (`npm run dev` / `npm run build` / `npm run start`)**:
   - Runs both public website and `/admin` CMS from one Node.js server backed by built-in `node:sqlite` (`data/pinnacle.db`).

## Features
- **Public Corporate Website**:
  - Home page with dynamic Hero Banner, Rs. 32,000 All-Inclusive Company Registration showcase, 6 core service pillars, About section, 4-step workflow, Knowledge Hub blogs, FAQs, and consultation CTA.
  - Individual SEO-friendly service pages (`/services`, `/services/[slug]`).
  - Blog Hub (`/blog`, `/blog/[slug]`, and dynamic `/blog/post/` Apache rewrite shell for newly added CMS posts on static hosting).
  - Promotional **Visitor Entry Pop-up Banner** controlled from Admin Portal (`Banners & Images -> Pop-up Banner`).
  - Interactive Contact & Consultation Form (`/contact`) synced with CMS inquiries, Dehiwala map embed, and sticky WhatsApp action button (`+94 77 302 8033`).
- **Admin CMS Portal (`/admin`)**:
  - Protected by PBKDF2-SHA256 password hashing and HMAC-SHA256 signed HttpOnly session cookies (`/admin/login`).
  - **Blog Manager**: Create, edit, publish/draft, feature, or delete blog posts with Markdown preview, uploaded cover images, per-post SEO fields, and automatic em-dash cleanup.
  - **Banners, Logo & Entry Pop-up**: Upload replacement images, edit headlines/CTAs, and toggle the entry pop-up modal.
  - **SEO Settings**: Configure global meta tags, page overrides, verification tags, GA4 ID, and LocalBusiness Schema.org JSON-LD.
  - **Media Library & Client Inquiries**: Upload JPG, PNG, WebP, GIF, or SVG images (stored in Cloudflare D1 chunks or optional R2 bucket, or `data/uploads/` locally) and track leads.

## Split Deployment Setup

### Part 1: Deploy Admin Backend on Cloudflare Workers (Free Tier)
1. In the Cloudflare Dashboard, open **Workers & Pages -> Create -> Import a repository** and select your GitHub repository.
2. Cloudflare reads `wrangler.jsonc` automatically:
   - **Build command**: `npm run build:cloudflare`
   - **Deploy command**: `npx wrangler deploy`
3. Open **Storage & Databases -> D1 SQL Database -> Create** (e.g. `pinnacle-cms-db`), then attach it in your Worker under **Settings -> Bindings -> Add -> D1 database** with variable name **`DB`**. (Alternatively run `npx wrangler d1 create pinnacle-cms-db` locally and add `"database_id"` in `wrangler.jsonc`.)
4. Under **Settings -> Variables and Secrets**, optionally set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `CORS_ORIGINS`, and `PUBLIC_SITE_URL`.
5. Redeploy if you just attached the D1 binding, then open `https://<your-worker>.workers.dev/admin/login` to confirm D1 readiness and sign in.

### Part 2: Upload Static Frontend to Hostinger Shared Hosting
1. Run:
   ```bash
   npm run build:hostinger
   ```
   Or set `PINNACLE_API_URL=https://<your-worker>.workers.dev` before running `npm run build:hostinger` to bake the backend URL automatically.
2. Upload and extract `dist-hostinger.zip` into your Hostinger domain or subdomain folder (`public_html` or subdomain root, including `.htaccess`).
3. Edit `cms-config.js` in Hostinger File Manager and set:
   ```js
   window.__PINNACLE_CONFIG__ = {
     apiBaseUrl: "https://<your-worker>.workers.dev",
     adminPortalUrl: "https://<your-worker>.workers.dev/admin/login",
   };
   ```

## Local Development

1. Install dependencies & run development server:
   ```bash
   npm install
   npm run dev
   ```
2. Build and verify split outputs locally:
   ```bash
   npm run build:hostinger
   npm run build:cloudflare
   ```

## Default Admin Login
- **URL**: `/admin`
- **Username**: `admin` (or `ADMIN_USERNAME`)
- **Password**: `Pinnacle@2026` (or `ADMIN_PASSWORD`; change anytime inside the **Security** tab of `/admin`)
