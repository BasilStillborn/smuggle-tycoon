"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolCard from "@/components/ToolCard";
import ToolModal from "@/components/ToolModal";
import SidebarFilter from "@/components/SidebarFilter";
import type { Tool } from "@/lib/content";
import { getAllTools, getAllCategories, getAllDifficulties, getToolsByCategory, getToolsByDifficulty } from "@/lib/content";

function ToolsContent() {
  const searchParams = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const allTools = useMemo(() => getAllTools(), []);
  const categories = useMemo(() => getAllCategories(), []);
  const difficulties = useMemo(() => getAllDifficulties(), []);

  const selectedCategorySlug = searchParams.get("category");
  const selectedDifficulty = searchParams.get("difficulty");

  const selectedCategoryId = selectedCategorySlug
    ? categories.find((c) => c.slug === selectedCategorySlug)?.id || null
    : null;

  let filteredTools = allTools;
  if (selectedCategoryId) {
    filteredTools = getToolsByCategory(selectedCategoryId);
  }
  if (selectedDifficulty) {
    filteredTools = filteredTools.filter((t) => t.difficulty === selectedDifficulty);
  }

  const categoryName = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)?.name
    : null;

  const crumbs = [
    ...(categoryName
      ? [{ label: "All Tools", href: "/tools" }]
      : []),
    ...(categoryName ? [{ label: categoryName }] : [{ label: "All Tools" }]),
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto container-padding py-8">
        <Breadcrumbs crumbs={crumbs} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <SidebarFilter
                categories={categories}
                difficulties={difficulties}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {categoryName || "All Automation Tools"}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No tools match your filters. Try a different category.</p>
                <Link href="/tools" className="text-brand-600 font-medium hover:text-brand-700 mt-2 inline-block">
                  Clear filters →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} onSelect={setSelectedTool} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTool && (
        <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
    </>
  );
}

export default function ToolsPage() {
  return (
    <Suspense>
      <ToolsContent />
    </Suspense>
  );
}
