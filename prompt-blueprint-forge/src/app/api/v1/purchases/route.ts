import { NextRequest, NextResponse } from "next/server";
import { getPurchasesByUser, getBlueprintById, getUserById } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const purchases = getPurchasesByUser(userId);
    const purchasesWithDetails = purchases.map((p) => {
      const blueprint = getBlueprintById(p.blueprintId);
      return {
        ...p,
        blueprintTitle: blueprint?.title || "Unknown",
        blueprintImage: blueprint?.image || "",
      };
    });

    return NextResponse.json({ purchases: purchasesWithDetails });
  } catch (error) {
    console.error("Fetch purchases error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
