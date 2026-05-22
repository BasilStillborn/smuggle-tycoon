import type { Metadata } from "next";
import { Suspense } from "react";
import { getApprovedBlueprints, getCategories, searchBlueprints } from "@/lib/data";
import { BlueprintCard } from "@/components/BlueprintCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse and discover premium AI prompt chains and blueprints. Filter by category, difficulty, price, and more.",
  openGraph: {
    title: "Marketplace | Prompt Blueprint Forge",
    description: "Browse and discover premium AI prompt chains and blueprints from our community of expert creators.",
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function MarketplaceContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const difficulty = typeof params.difficulty === "string" ? params.difficulty : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const tags = typeof params.tags === "string" ? params.tags : "";
  const model = typeof params.model === "string" ? params.model : "";
  const minPrice = typeof params.minPrice === "string" ? params.minPrice : "";
  const maxPrice = typeof params.maxPrice === "string" ? params.maxPrice : "";

  let blueprints = q ? searchBlueprints(q) : getApprovedBlueprints();

  if (category) {
    blueprints = blueprints.filter((bp) => bp.categoryId === category);
  }
  if (difficulty) {
    blueprints = blueprints.filter((bp) => bp.difficulty === difficulty);
  }
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
    blueprints = blueprints.filter((bp) =>
      tagList.some((t) => bp.tags.map((bt) => bt.toLowerCase()).includes(t))
    );
  }
  if (model) {
    blueprints = blueprints.filter((bp) =>
      bp.compatibleModels.some((m) => m.toLowerCase().includes(model.toLowerCase()))
    );
  }
  if (minPrice) {
    blueprints = blueprints.filter((bp) => bp.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    blueprints = blueprints.filter((bp) => bp.price <= parseFloat(maxPrice));
  }

  switch (sort) {
    case "rating":
      blueprints.sort((a, b) => b.rating - a.rating);
      break;
    case "popular":
      blueprints.sort((a, b) => b.sales - a.sales);
      break;
    case "price-low":
      blueprints.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      blueprints.sort((a, b) => b.price - a.price);
      break;
    default:
      blueprints.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  const categories = getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Marketplace
        </h1>
        <p className="text-(--muted) text-sm">
          {q
            ? `Search results for "${q}"`
            : "Discover premium AI prompt chains and blueprints"}
        </p>
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-10 rounded-xl bg-(--border) animate-pulse" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <Suspense fallback={<div className="h-64 rounded-xl bg-(--border) animate-pulse" />}>
              <FilterSidebar categories={categories} />
            </Suspense>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {blueprints.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No blueprints found</h3>
              <p className="text-sm text-(--muted)">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-(--muted) mb-4">
                Showing {blueprints.length} blueprint{blueprints.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {blueprints.map((bp) => (
                  <BlueprintCard key={bp.id} blueprint={bp} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-64 bg-(--border) rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-(--border) animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <MarketplaceContent {...props} />
    </Suspense>
  );
}
