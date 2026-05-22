import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/data";

const ADMIN_EMAIL = "admin@promptforge.com";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json(
        { error: "adminId is required" },
        { status: 400 }
      );
    }

    const admin = getUserById(adminId);
    if (!admin || admin.role !== "admin" || admin.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized. Only platform admins can access this." },
        { status: 403 }
      );
    }

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "pending-blueprints.json");

    let pending: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      pending = JSON.parse(raw);
    } catch {
      pending = [];
    }

    return NextResponse.json({ blueprints: pending });
  } catch (error) {
    console.error("Fetch pending blueprints error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
