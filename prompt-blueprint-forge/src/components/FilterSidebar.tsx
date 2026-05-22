"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { Category } from "@/lib/types";
import { getApprovedBlueprints } from "@/lib/data";

export function FilterSidebar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const activeDifficulty = searchParams.get("difficulty") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const activeTags = (searchParams.get("tags") || "").split(",").filter(Boolean);
  const activeModel = searchParams.get("model") || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";

  const [localMinPrice, setLocalMinPrice] = useState(activeMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(activeMaxPrice);

  const allBlueprints = useMemo(() => getApprovedBlueprints(), []);

  const availableTags = useMemo(() => {
    let filtered = allBlueprints;
    if (activeCategory) filtered = filtered.filter((bp) => bp.categoryId === activeCategory);
    if (activeDifficulty) filtered = filtered.filter((bp) => bp.difficulty === activeDifficulty);
    if (activeModel) filtered = filtered.filter((bp) => bp.compatibleModels.some((m) => m.toLowerCase().includes(activeModel.toLowerCase())));
    const tagSet = new Set<string>();
    filtered.forEach((bp) => bp.tags.forEach((t) => tagSet.add(t)));
    return [...tagSet].sort();
  }, [allBlueprints, activeCategory, activeDifficulty, activeModel]);

  const availableModels = useMemo(() => {
    let filtered = allBlueprints;
    if (activeCategory) filtered = filtered.filter((bp) => bp.categoryId === activeCategory);
    if (activeDifficulty) filtered = filtered.filter((bp) => bp.difficulty === activeDifficulty);
    const modelSet = new Set<string>();
    filtered.forEach((bp) => bp.compatibleModels.forEach((m) => modelSet.add(m)));
    return [...modelSet].sort();
  }, [allBlueprints, activeCategory, activeDifficulty]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/marketplace?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleTag = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = (params.get("tags") || "").split(",").filter(Boolean);
      const idx = current.indexOf(tag);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(tag);
      }
      if (current.length > 0) {
        params.set("tags", current.join(","));
      } else {
        params.delete("tags");
      }
      params.delete("page");
      router.push(`/marketplace?${params.toString()}`);
    },
    [router, searchParams]
  );

  const applyPriceFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (localMinPrice) params.set("minPrice", localMinPrice);
    else params.delete("minPrice");
    if (localMaxPrice) params.set("maxPrice", localMaxPrice);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`/marketplace?${params.toString()}`);
  }, [router, searchParams, localMinPrice, localMaxPrice]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("category", "")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !activeCategory
                ? "bg-indigo-500/10 text-indigo-400 font-medium"
                : "text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover)"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter("category", cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === cat.id
                  ? "bg-indigo-500/10 text-indigo-400 font-medium"
                  : "text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover)"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Difficulty</h3>
        <div className="space-y-1">
          {["beginner", "intermediate", "advanced"].map((d) => (
            <button
              key={d}
              onClick={() => updateFilter("difficulty", activeDifficulty === d ? "" : d)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                activeDifficulty === d
                  ? "bg-indigo-500/10 text-indigo-400 font-medium"
                  : "text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover)"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <span className="text-(--muted) text-xs">to</span>
          <input
            type="number"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <button
          onClick={applyPriceFilter}
          className="mt-2 w-full py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
        >
          Apply Price Filter
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Tags</h3>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
          {availableTags.length === 0 ? (
            <p className="text-xs text-(--muted)">No tags available</p>
          ) : (
            availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  activeTags.includes(tag)
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "bg-(--card-hover) text-(--muted) border border-(--border) hover:border-indigo-500/30"
                }`}
              >
                {tag}
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Model Compatibility</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("model", "")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !activeModel
                ? "bg-indigo-500/10 text-indigo-400 font-medium"
                : "text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover)"
            }`}
          >
            All Models
          </button>
          {availableModels.map((m) => (
            <button
              key={m}
              onClick={() => updateFilter("model", activeModel === m ? "" : m)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeModel === m
                  ? "bg-indigo-500/10 text-indigo-400 font-medium"
                  : "text-(--muted) hover:text-(--foreground) hover:bg-(--card-hover)"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Sort By</h3>
        <select
          value={activeSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--background) text-sm text-(--foreground) focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
