import { NextResponse } from "next/server";
import { searchTools } from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const results = searchTools(query);
  return NextResponse.json(
    results.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      tagline: t.tagline,
      category: t.category,
      difficulty: t.difficulty,
      rating: t.rating,
    }))
  );
}
