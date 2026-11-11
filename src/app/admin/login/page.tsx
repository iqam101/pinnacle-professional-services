"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        return;
      }
      router.push("/admin");
      router.refresh();
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
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#821318] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? "Signing In..." : "Sign In to Admin Portal"}</span>
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#646B76] hover:text-[#A41C21]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
