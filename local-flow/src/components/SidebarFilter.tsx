"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Category } from "@/lib/content";

interface SidebarFilterProps {
  categories: Category[];
  difficulties: string[];
}

export default function SidebarFilter({
  categories,
  difficulties,
}: SidebarFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category");
  const selectedDifficulty = searchParams.get("difficulty");

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      router.push(`/tools${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => setFilter("category", null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === null
                ? "bg-brand-50 text-brand-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter("category", cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{cat.name}</span>
              <span className="ml-2 text-xs text-gray-400">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Difficulty
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => setFilter("difficulty", null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedDifficulty === null
                ? "bg-brand-50 text-brand-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Levels
          </button>
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setFilter("difficulty", diff)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedDifficulty === diff
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
