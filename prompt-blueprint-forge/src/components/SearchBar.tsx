"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/marketplace?${params.toString()}`);
    },
    [query, router, searchParams]
  );

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-xl">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted)"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search blueprints..."
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm text-(--foreground) placeholder:text-(--muted) focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
      />
    </form>
  );
}
