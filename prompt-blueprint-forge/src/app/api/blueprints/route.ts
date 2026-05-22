import { NextResponse } from "next/server";
import { getBlueprints, getBlueprintById, searchBlueprints } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const q = searchParams.get("q");

  if (id) {
    const blueprint = getBlueprintById(id);
    if (!blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }
    return NextResponse.json(blueprint);
  }

  if (q) {
    return NextResponse.json(searchBlueprints(q));
  }

  return NextResponse.json(getBlueprints());
}
