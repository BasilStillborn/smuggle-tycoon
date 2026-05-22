/*
 * POST /api/v1/review-prompt
 *
 * Admin-only endpoint to approve or reject a pending blueprint.
 *
 * Expected request body:
 * {
 *   blueprintId: string,            // The ID of the pending blueprint
 *   action: "approve" | "reject",   // The review decision
 *   adminId: string,                // Must have role "admin"
 *   reviewNotes: string             // Required for rejection, optional for approval
 * }
 *
 * Workflow (APPROVE):
 * 1. Validates admin credentials
 * 2. Finds the pending blueprint by ID
 * 3. Removes it from pending-blueprints.json
 * 4. Adds it to blueprints.json with submissionStatus="approved"
 * 5. Returns success response
 *
 * Workflow (REJECT):
 * 1. Validates admin credentials
 * 2. Finds the pending blueprint by ID
 * 3. Updates submissionStatus to "rejected" in pending-blueprints.json
 * 4. Stores admin's reviewNotes on the record
 * 5. Returns rejection response
 *
 * Note: Rejected blueprints remain in pending-blueprints.json with
 * status "rejected" for auditing purposes. They do NOT enter the
 * main blueprints.json catalog.
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/data";

const ADMIN_EMAIL = "admin@promptforge.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprintId, action, adminId, reviewNotes } = body;

    // --- Validate required fields ---
    if (!blueprintId || !action || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields: blueprintId, action, adminId" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Action must be either 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // --- Admin authentication ---
    const admin = getUserById(adminId);
    if (!admin || admin.role !== "admin" || admin.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized. Only platform admins can review blueprints." },
        { status: 403 }
      );
    }

    if (action === "reject" && (!reviewNotes || reviewNotes.trim() === "")) {
      return NextResponse.json(
        { error: "Review notes are required when rejecting a blueprint." },
        { status: 400 }
      );
    }

    // --- Read pending blueprints ---
    const fs = await import("fs");
    const path = await import("path");
    const pendingPath = path.join(process.cwd(), "data", "pending-blueprints.json");
    const blueprintsPath = path.join(process.cwd(), "data", "blueprints.json");

    let pending: any[] = [];
    try {
      const raw = fs.readFileSync(pendingPath, "utf-8");
      pending = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "No pending blueprints found" },
        { status: 404 }
      );
    }

    const idx = pending.findIndex((bp) => bp.id === blueprintId);
    if (idx === -1) {
      return NextResponse.json(
        { error: "Blueprint not found in pending queue" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // --- APPROVE: Move from pending to published ---
      const approved = pending[idx];
      pending.splice(idx, 1);
      fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2), "utf-8");

      let existingBlueprints: any[] = [];
      try {
        const raw = fs.readFileSync(blueprintsPath, "utf-8");
        existingBlueprints = JSON.parse(raw);
      } catch {
        existingBlueprints = [];
      }

      const newBlueprint = {
        ...approved,
        id: approved.id.replace("bp_pending_", "bp_"),
        rating: 0,
        reviewCount: 0,
        sales: 0,
        featured: false,
        updatedAt: new Date().toISOString().split("T")[0],
        submissionStatus: "approved",
        reviewNotes: reviewNotes || "Approved by admin.",
        platformCommissionRate: 0.2,
      };

      existingBlueprints.push(newBlueprint);
      fs.writeFileSync(blueprintsPath, JSON.stringify(existingBlueprints, null, 2), "utf-8");

      return NextResponse.json({
        success: true,
        message: "Blueprint approved and published to marketplace.",
        blueprintId: newBlueprint.id,
        status: "approved",
      });
    } else {
      // --- REJECT: Update status and notes, keep in pending file ---
      pending[idx] = {
        ...pending[idx],
        submissionStatus: "rejected",
        reviewNotes: reviewNotes,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2), "utf-8");

      return NextResponse.json({
        success: true,
        message: "Blueprint rejected. Seller will be notified.",
        blueprintId,
        status: "rejected",
        reviewNotes,
      });
    }
  } catch (error) {
    console.error("Review prompt error:", error);
    return NextResponse.json(
      { error: "Internal server error processing review" },
      { status: 500 }
    );
  }
}
