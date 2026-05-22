"use client";

import { useEffect, useCallback } from "react";
import type { Tool } from "@/lib/content";

export default function ToolModal({
  tool,
  onClose,
}: {
  tool: Tool;
  onClose: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-gray-800 hover:bg-white shadow-sm transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8">
          {/* HERO */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xl flex-shrink-0">
              {tool.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-brand-600 uppercase tracking-wider">
                  {tool.category.replace("-", " ")}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{tool.difficulty}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{tool.tagline}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>★ {tool.rating}</span>
                <span>{tool.pricing}</span>
              </div>
            </div>
          </div>

          {/* AFFILIATE BUTTON */}
          <a
            href={tool.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-xl bg-brand-600 px-6 py-4 text-base font-bold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 mb-6"
          >
            Yes, I trust your advice. Take me to {tool.name}.
          </a>

          {/* DESCRIPTION */}
          <div className="prose prose-sm prose-gray max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed">{tool.description}</p>
          </div>

          {/* PROS & CONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Pros</h4>
              <ul className="space-y-1.5">
                {tool.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-1.5 text-xs text-green-700">
                    <svg className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Cons</h4>
              <ul className="space-y-1.5">
                {tool.cons.map((con) => (
                  <li key={con} className="flex items-start gap-1.5 text-xs text-red-700">
                    <svg className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FEATURES */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tool.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <svg className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BEST FOR */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Best For</h4>
            <div className="flex flex-wrap gap-1.5">
              {tool.best_for.map((b) => (
                <span key={b} className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* BOTTOM AFFILIATE BUTTON */}
          <a
            href={tool.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-xl bg-brand-600 px-6 py-4 text-base font-bold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Yes, I trust your advice. Take me to {tool.name}.
          </a>
          <p className="text-xs text-gray-400 text-center mt-2">
            {tool.pricing.includes("Free") ? "Free plan available" : "Free trial available"} · Affiliate link
          </p>
        </div>
      </div>
    </div>
  );
}
