"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { cmsApiUrl } from "@/lib/cms-client";
import { SERVICES } from "@/lib/services-data";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const emptySubscribe = () => () => {};

function resolveServiceParam(raw?: string | null): string {
  const clean = (raw || "").trim();
  if (!clean) return "";
  if (clean === "company-registration") {
    return "Company Registration (Rs. 32,000 Package)";
  }
  return clean;
}

export function ContactForm({ defaultService = "" }: { defaultService?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const queryServiceParam = useSyncExternalStore(
    emptySubscribe,
    () => new URLSearchParams(window.location.search).get("service") || "",
    () => ""
  );
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const service =
    selectedService ||
    resolveServiceParam(queryServiceParam) ||
    resolveServiceParam(defaultService) ||
    "Company Registration (Rs. 32,000 Package)";
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(cmsApiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          companyName,
          service,
          message,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Unable to send your inquiry. Please call or WhatsApp us.");
        return;
      }
      setSubmitted(true);
      setName("");
      setPhone("");
      setEmail("");
      setCompanyName("");
      setMessage("");
    } catch {
      setError("Network error while submitting. Please contact us via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="font-display text-2xl font-bold text-[#181B20]">
          Thank You. Your Inquiry Has Been Received
        </h3>
        <p className="text-sm sm:text-base text-[#3D424B] max-w-md mx-auto">
          Our Colombo advisory team will review your request and respond shortly.
          For urgent incorporation or tax support, message us directly on WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={BRAND.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:bg-[#1EBE5B] transition-colors"
          >
            <WhatsAppIcon variant="mono" className="h-4 w-4 shrink-0" />
            <span>Chat on WhatsApp Now</span>
          </a>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center rounded-xl border border-[#E6DFD3] bg-white px-5 py-3 text-sm font-semibold text-[#181B20] hover:bg-[#FAF8F5]"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-semibold text-[#181B20] mb-1.5"
          >
            Full Name <span className="text-[#A41C21]">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-xl border border-[#DFD7C8] bg-white px-4 py-3 text-sm text-[#181B20] placeholder:text-[#8C939E] focus:border-[#A41C21] focus:outline-none focus:ring-2 focus:ring-[#A41C21]/15"
          />
        </div>
        <div>
          <label
            htmlFor="contact-phone"
            className="block text-sm font-semibold text-[#181B20] mb-1.5"
          >
            Phone / WhatsApp Number <span className="text-[#A41C21]">*</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="077 302 8033"
            className="w-full rounded-xl border border-[#DFD7C8] bg-white px-4 py-3 text-sm text-[#181B20] placeholder:text-[#8C939E] focus:border-[#A41C21] focus:outline-none focus:ring-2 focus:ring-[#A41C21]/15"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="contact-email"
            className="block text-sm font-semibold text-[#181B20] mb-1.5"
          >
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.lk"
            className="w-full rounded-xl border border-[#DFD7C8] bg-white px-4 py-3 text-sm text-[#181B20] placeholder:text-[#8C939E] focus:border-[#A41C21] focus:outline-none focus:ring-2 focus:ring-[#A41C21]/15"
          />
        </div>
        <div>
          <label
            htmlFor="contact-company"
            className="block text-sm font-semibold text-[#181B20] mb-1.5"
          >
            Company Name (or Proposed Name)
          </label>
          <input
            id="contact-company"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-xl border border-[#DFD7C8] bg-white px-4 py-3 text-sm text-[#181B20] placeholder:text-[#8C939E] focus:border-[#A41C21] focus:outline-none focus:ring-2 focus:ring-[#A41C21]/15"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-service"
          className="block text-sm font-semibold text-[#181B20] mb-1.5"
        >
          Service Required
        </label>
        <select
          id="contact-service"
          value={service}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full rounded-xl border border-[#DFD7C8] bg-white px-4 py-3 text-sm text-[#181B20] focus:border-[#A41C21] focus:outline-none focus:ring-2 focus:ring-[#A41C21]/15"
        >
          <option value="Company Registration (Rs. 32,000 Package)">
            Company Registration (Rs. 32,000 Package)
          </option>
          {SERVICES.map((srv) => (
            <option key={srv.slug} value={srv.title}>
              {srv.title}
            </option>
          ))}
          <option value="Website Development / POS / Social Media">
            Website Development / POS Systems / Social Media Marketing
          </option>
          <option value="General Advisory Consultation">
            General Advisory Consultation
          </option>
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-[#181B20] mb-1.5"
        >
          How Can We Help Your Business? <span className="text-[#A41C21]">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your company registration, bookkeeping, VAT/TIN, or HR requirements..."
          className="w-full rounded-xl border border-[#DFD7C8] bg-white px-4 py-3 text-sm text-[#181B20] placeholder:text-[#8C939E] focus:border-[#A41C21] focus:outline-none focus:ring-2 focus:ring-[#A41C21]/15"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#A41C21] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#821318] disabled:opacity-60 transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4" />
          <span>{submitting ? "Sending Request..." : "Send Consultation Request"}</span>
        </button>
        <a
          href={BRAND.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D79A27] bg-[#FDF8EC] px-5 py-3.5 text-sm font-bold text-[#8E5D09] hover:bg-[#D79A27] hover:text-white transition-colors"
        >
          <WhatsAppIcon variant="brand" className="h-4 w-4 shrink-0" />
          <span>Instant WhatsApp</span>
        </a>
      </div>
    </form>
  );
}
