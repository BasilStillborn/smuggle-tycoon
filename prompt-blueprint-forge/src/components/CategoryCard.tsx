import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/marketplace?category=${category.id}`}
      className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-(--border) bg-(--card) hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5 glow-card"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
        {category.icon}
      </div>
      <span className="font-medium text-sm text-(--foreground)">{category.name}</span>
      <span className="text-xs text-(--muted)">{category.count} blueprints</span>
    </Link>
  );
}
