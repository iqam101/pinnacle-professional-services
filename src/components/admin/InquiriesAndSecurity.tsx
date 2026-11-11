"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, MessageCircle } from "lucide-react";
import type { InquiryItem } from "@/types/cms";

export function InquiriesAndSecurity({
  inquiries,
  setInquiries,
  mode,
}: {
  inquiries: InquiryItem[];
  setInquiries: React.Dispatch<React.SetStateAction<InquiryItem[]>>;
  mode: "inquiries" | "security";
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function updateStatus(id: string, status: InquiryItem["status"]) {
    const res = await fetch("/api/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setPwErr(data.error || "Unable to change password.");
        return;
      }
      setPwMsg("Admin password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setSavingPw(false);
    }
  }

  if (mode === "security") {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#181B20]">
            Account Security
          </h2>
          <p className="text-sm text-[#646B76]">
            Change your Admin Portal password anytime. Use at least 8
            characters.
          </p>
        </div>

        <form
          onSubmit={handlePasswordUpdate}
          className="rounded-2xl border border-[#E6DFD3] bg-white p-6 space-y-4"
        >
          {pwErr && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {pwErr}
            </div>
          )}
          {pwMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              <span>{pwMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-[#DFD7C8] px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4F5560] mb-1">
              New Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-[#DFD7C8] px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={savingPw}
            className="inline-flex items-center gap-2 rounded-xl bg-[#A41C21] px-5 py-3 text-sm font-bold text-white hover:bg-[#821318] cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            <span>{savingPw ? "Updating..." : "Update Password"}</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-[#181B20]">
          Client Consultation Inquiries
        </h2>
        <p className="text-sm text-[#646B76]">
          Leads submitted via the Contact page inquiry form.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-[#E6DFD3] bg-white p-10 text-center space-y-1">
          <p className="font-display text-lg font-bold text-[#181B20]">
            No inquiries received yet
          </p>
          <p className="text-sm text-[#646B76]">
            Submissions from the public /contact form appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {inquiries.map((inq) => {
            const digits = inq.phone.replace(/\D/g, "");
            const waPhone = digits.startsWith("0")
              ? `94${digits.slice(1)}`
              : digits;
            return (
              <div
                key={inq.id}
                className="rounded-2xl border border-[#E6DFD3] bg-white p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-lg font-bold text-[#181B20]">
                      {inq.name}{" "}
                      {inq.companyName && (
                        <span className="text-sm font-normal text-[#646B76]">
                          ({inq.companyName})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#646B76]">
                      {inq.service} | {inq.phone} | {inq.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inq.status}
                      onChange={(e) =>
                        updateStatus(
                          inq.id,
                          e.target.value as InquiryItem["status"]
                        )
                      }
                      className="rounded-xl border border-[#DFD7C8] bg-[#FAF8F5] px-3 py-1.5 text-xs font-bold text-[#181B20]"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    {waPhone && (
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Reply</span>
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[#3D424B] bg-[#FAF8F5] rounded-xl p-3.5 border border-[#EFE9DD]">
                  {inq.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
