"use client";

import { useEffect, useCallback } from "react";

export default function ChecklistModal({ onClose }: { onClose: () => void }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Download The Ultimate Starter Checklist
          </h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            7 automated workflows you can set up this weekend. Free PDF — no spam, ever.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-3"
          >
            <input
              type="text"
              required
              placeholder="Your first name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              type="email"
              required
              placeholder="Your best email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              Send Me The Checklist →
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
