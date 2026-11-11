"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ServiceFaq } from "@/types/cms";

export function HomeFaq({ items }: { items: ServiceFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.question}
            className={`rounded-2xl border transition-colors ${
              isOpen
                ? "border-[#D79A27] bg-[#FDFBF7]"
                : "border-[#E6DFD3] bg-white hover:border-[#D79A27]/60"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left"
            >
              <span className="font-display text-base sm:text-lg font-semibold text-[#181B20]">
                {item.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#A41C21] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-sm sm:text-base text-[#3D424B] leading-relaxed border-t border-[#EFE9DD]/70 mt-0 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
