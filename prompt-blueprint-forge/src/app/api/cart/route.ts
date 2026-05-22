import { NextResponse } from "next/server";
import { getBlueprintById } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blueprintIds } = body;

    if (!Array.isArray(blueprintIds)) {
      return NextResponse.json({ error: "blueprintIds must be an array" }, { status: 400 });
    }

    const items = blueprintIds
      .map((id: string) => getBlueprintById(id))
      .filter(Boolean);

    const total = items.reduce((sum, item) => sum + item!.price, 0);

    return NextResponse.json({ items, total });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
