import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import {
  getAllBlogs,
  getBanners,
  getSeoSettings,
  listInquiries,
  listMedia,
} from "@/lib/db";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin CMS Portal",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const blogs = getAllBlogs();
  const banners = getBanners();
  const seo = getSeoSettings();
  const media = listMedia();
  const inquiries = listInquiries();

  return (
    <AdminDashboardClient
      username={session.username}
      initialBlogs={blogs}
      initialBanners={banners}
      initialSeo={seo}
      initialMedia={media}
      initialInquiries={inquiries}
    />
  );
}
