import { NextRequest, NextResponse } from "next/server";
import { getUserById, getBlueprintById } from "@/lib/data";

const ADMIN_EMAIL = "admin@promptforge.com";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ blueprintId: string }> }
) {
  try {
    const { blueprintId } = await params;
    const body = await request.json();
    const { adminId, updates } = body;

    if (!adminId || !updates) {
      return NextResponse.json(
        { error: "Missing required fields: adminId, updates" },
        { status: 400 }
      );
    }

    const admin = getUserById(adminId);
    if (!admin || admin.role !== "admin" || admin.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized. Only platform admins can update blueprints." },
        { status: 403 }
      );
    }

    const existingBp = getBlueprintById(blueprintId);
    if (!existingBp) {
      return NextResponse.json(
        { error: "Blueprint not found." },
        { status: 404 }
      );
    }

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "blueprints.json");

    let blueprints: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      blueprints = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to read blueprints data." },
        { status: 500 }
      );
    }

    const idx = blueprints.findIndex((bp) => bp.id === blueprintId);
    if (idx === -1) {
      return NextResponse.json(
        { error: "Blueprint not found in data store." },
        { status: 404 }
      );
    }

    const allowedUpdates = [
      "featured",
      "price",
      "difficulty",
      "tags",
      "compatibleModels",
      "reviewNotes",
    ];

    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        blueprints[idx][key] = updates[key];
      }
    }

    blueprints[idx].updatedAt = new Date().toISOString().split("T")[0];
    fs.writeFileSync(filePath, JSON.stringify(blueprints, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Blueprint updated successfully.",
      blueprint: blueprints[idx],
    });
  } catch (error) {
    console.error("Admin blueprint update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
