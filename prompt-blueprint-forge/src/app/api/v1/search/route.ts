import { NextRequest, NextResponse } from "next/server";
import {
  getApprovedBlueprints,
  getCategoryById,
} from "@/lib/data";
import type { Blueprint } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const tags = searchParams.get("tags") || "";
    const model = searchParams.get("model") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    let results: (Blueprint & { categoryName?: string })[] = getApprovedBlueprints();

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (bp) =>
          bp.title.toLowerCase().includes(q) ||
          bp.description.toLowerCase().includes(q) ||
          bp.longDescription.toLowerCase().includes(q) ||
          bp.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (category) {
      results = results.filter((bp) => bp.categoryId === category);
    }

    if (difficulty) {
      results = results.filter((bp) => bp.difficulty === difficulty);
    }

    if (minPrice) {
      results = results.filter((bp) => bp.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      results = results.filter((bp) => bp.price <= parseFloat(maxPrice));
    }

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
      results = results.filter((bp) =>
        tagList.some((t) => bp.tags.map((bt) => bt.toLowerCase()).includes(t))
      );
    }

    if (model) {
      results = results.filter((bp) =>
        bp.compatibleModels.some((m) => m.toLowerCase().includes(model.toLowerCase()))
      );
    }

    const allTags = [...new Set(results.flatMap((bp) => bp.tags))].sort();
    const allModels = [...new Set(results.flatMap((bp) => bp.compatibleModels))].sort();
    const priceRange = results.length > 0
      ? {
          min: Math.min(...results.map((bp) => bp.price)),
          max: Math.max(...results.map((bp) => bp.price)),
        }
      : { min: 0, max: 0 };

    switch (sort) {
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        results.sort((a, b) => b.sales - a.sales);
        break;
      case "price-low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        results.sort((a, b) => b.price - a.price);
        break;
      default:
        results.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    const totalCount = results.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const pagedResults = results.slice(offset, offset + limit);

    const enrichedResults = pagedResults.map((bp) => ({
      ...bp,
      categoryName: getCategoryById(bp.categoryId)?.name || "",
    }));

    return NextResponse.json({
      results: enrichedResults,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      facets: {
        tags: allTags,
        models: allModels,
        priceRange,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
