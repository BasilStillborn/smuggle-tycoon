"use client";

import Link from "next/link";
import type { Blueprint } from "@/lib/types";
import { getBlueprintCategory, formatPrice, formatSalesCount } from "@/lib/data";
import { RatingStars } from "./RatingStars";

export function BlueprintCard({ blueprint }: { blueprint: Blueprint }) {
  const category = getBlueprintCategory(blueprint);

  return (
    <Link
      href={`/blueprint/${blueprint.id}`}
      className="group block rounded-2xl border border-(--border) bg-(--card) overflow-hidden glow-card"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={blueprint.image}
          alt={blueprint.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {category && (
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-medium">
              {category.icon} {category.name}
            </span>
          )}
          {blueprint.featured && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/70 backdrop-blur-sm text-white text-[11px] font-medium">
              Featured
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-bold">
            {blueprint.steps} steps
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-(--foreground) group-hover:text-indigo-400 transition-colors leading-snug">
            {blueprint.title}
          </h3>
        </div>

        <p className="text-sm text-(--muted) line-clamp-2 mb-4 leading-relaxed">
          {blueprint.description}
        </p>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <RatingStars rating={blueprint.rating} />
            <span className="text-xs text-(--muted)">({blueprint.reviewCount})</span>
          </div>
          <span className="text-xs text-(--muted)">•</span>
          <span className="text-xs text-(--muted)">{formatSalesCount(blueprint.sales)} sold</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-(--border)">
          <span className="text-lg font-bold gradient-text">{formatPrice(blueprint.price)}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-md ${
            blueprint.difficulty === "beginner" ? "bg-green-500/10 text-green-400" :
            blueprint.difficulty === "intermediate" ? "bg-amber-500/10 text-amber-400" :
            "bg-red-500/10 text-red-400"
          }`}>
            {blueprint.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}
