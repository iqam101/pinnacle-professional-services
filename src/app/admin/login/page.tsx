"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ExternalLink, Lock, LogIn } from "lucide-react";
import { cmsApiUrl } from "@/lib/cms-client";

const emptySubscribe = () => () => {};

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [error, setError] = useState("");
  const [dbWarning, setDbWarning] = useState("");
  const [publicSiteUrl, setPublicSiteUrl] = useState("");
  const isCloudflareTarget = process.env.NEXT_PUBLIC_BUILD_TARGET === "cloudflare";

  useEffect(() => {
    let cancelled = false;
    fetch(cmsApiUrl("/api/health"), { cache: "no-store" })
      .then(async (res) => {
        const raw = await res.text();
        let data: {
          dbReady?: boolean;
          mode?: string;
          siteUrl?: string;
          error?: string;
        } = {};
        try {
          data = JSON.parse(raw);
        } catch {
          // Non-JSON response handled cleanly below
        }
        if (cancelled) return;
        if (!res.ok || data.dbReady === false) {
          setDbWarning(
            data.error ||
              (res.ok
                ? "Cloudflare D1 database binding (DB) is not ready yet. Attach a D1 database bound as DB in Cloudflare Workers Settings -> Bindings."
                : `CMS health check failed (HTTP ${res.status}). Ensure the Cloudflare Worker backend is deployed.`)
          );
        }
        if (data.mode === "cloudflare-worker" && data.siteUrl) {
          setPublicSiteUrl(data.siteUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDbWarning(
            "Unable to reach CMS API health check. Ensure the Cloudflare Worker backend is deployed."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hydrated || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(cmsApiUrl("/api/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = JSON.parse(raw);
      } catch {
        // Non-JSON error response handled cleanly below
      }
      if (!res.ok) {
        setError(
          data.error ||
            (res.status >= 500
              ? `Server error while signing in (HTTP ${res.status}). Please retry.`
              : "Invalid credentials.")
        );
        return;
      }
      router.push("/admin/");
    } catch {
      setError("Network error while signing in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/pinnacle-logo-transparent.png"
            alt="Pinnacle Professional Services Private Limited"
            className="h-24 w-auto mx-auto object-contain"
          />
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F2] border border-[#A41C21]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#A41C21]">
            <Lock className="h-3.5 w-3.5" />
            <span>Admin CMS Portal</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white border border-[#E6DFD3] shadow-xl p-7 sm:p-8 space-y-5"
        >
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-extrabold text-[#181B20]">
              Sign In to Manage Website
            </h1>
            <p className="text-sm text-[#646B76]">
              Manage blogs, website banners, images, SEO settings, and client
              inquiries.
            </p>
          </div>

          {dbWarning && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <span>{dbWarning}</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-username"
              className="block text-sm font-semibold text-[#181B20] mb-1.5"
            >
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-[#DFD7C8] bg-white px-4 py-3 text-sm text-[#181B20] focus:border-[#A41C21] focus:outline-none focus:ring-2 focus:ring-[#A41C21]/15"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-semibold text-[#181B20] mb-1.5"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-xl border border-[#DFD7C8] bg-white px-4 py-3 text-sm text-[#181B20] focus:border-[#A41C21] focus:outline-none focus:ring-2 focus:ring-[#A41C21]/15"
            />
          </div>

          <button
            type="submit"
            disabled={!hydrated || loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#821318] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>
              {!hydrated
                ? "Connecting to Admin Portal..."
                : loading
                  ? "Signing In..."
                  : "Sign In to Admin Portal"}
            </span>
          </button>
        </form>

        <div className="text-center">
          {publicSiteUrl || isCloudflareTarget ? (
            <a
              href={publicSiteUrl || "https://pinnacleprofessionalservices.zenthoz.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#646B76] hover:text-[#A41C21]"
            >
              <span>Open Live Hostinger Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#646B76] hover:text-[#A41C21]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Public Website</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
