/*
 * POST /api/v1/create-prompt
 *
 * Creates a new blueprint submission and sets it to "pending_review" status.
 * The blueprint will NOT be visible in the marketplace until an admin
 * approves it via the review-prompt endpoint.
 *
 * Expected request body:
 * {
 *   title: string,
 *   description: string,
 *   longDescription: string,
 *   price: number,
 *   categoryId: string,
 *   authorId: string,          // Must match a valid user in the system
 *   difficulty: "beginner"|"intermediate"|"advanced",
 *   tags: string[],             // Array of tag strings
 *   steps: number,
 *   tokens: number,
 *   compatibleModels: string[], // e.g. ["GPT-4", "Claude 3"]
 *   includes: string[]         // e.g. ["Prompt chain", "Variables guide"]
 * }
 *
 * Workflow:
 * 1. Validates required fields and user authentication
 * 2. Generates a unique blueprint ID
 * 3. Creates a PendingBlueprint record with submissionStatus="pending_review"
 * 4. Persists to data/pending-blueprints.json
 * 5. Returns success with the new pending blueprint ID
 *
 * Note: This endpoint does NOT auto-approve. Admin must use
 * POST /api/v1/review-prompt to approve or reject.
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/data";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      longDescription,
      price,
      categoryId,
      authorId,
      difficulty,
      tags,
      steps,
      tokens,
      compatibleModels,
      includes,
    } = body;

    // --- Validation ---
    if (!title || !description || !longDescription || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, longDescription, price" },
        { status: 400 }
      );
    }

    if (!authorId) {
      return NextResponse.json(
        { error: "Missing required field: authorId" },
        { status: 400 }
      );
    }

    const author = getUserById(authorId);
    if (!author) {
      return NextResponse.json(
        { error: "Author not found. Invalid authorId." },
        { status: 404 }
      );
    }

    if (author.role === "buyer") {
      return NextResponse.json(
        { error: "Buyers cannot create blueprint listings. A creator account is required." },
        { status: 403 }
      );
    }

    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // --- Generate a unique ID (combining UUID with timestamp for sortability) ---
    const id = `bp_pending_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString().split("T")[0];

    const pendingBlueprint = {
      id,
      title,
      description,
      longDescription,
      price,
      categoryId,
      authorId,
      difficulty: difficulty || "beginner",
      tags: tags || [],
      createdAt: now,
      image: "/blueprints/default-pending.svg",
      steps: steps || 3,
      tokens: tokens || 1000,
      compatibleModels: compatibleModels || [],
      includes: includes || [],
      submissionStatus: "pending_review" as const,
      reviewNotes: "",
      platformCommissionRate: 0.2,
    };

    // --- Persist to pending-blueprints.json ---
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "pending-blueprints.json");

    let existing: unknown[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }

    existing.push(pendingBlueprint);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf-8");

    // --- Success response ---
    return NextResponse.json(
      {
        success: true,
        message:
          "Blueprint submitted successfully. It is now pending admin review and will not appear in the marketplace until approved.",
        blueprintId: id,
        submissionStatus: "pending_review",
        reviewNotes:
          "Your blueprint has been queued for review. An administrator will review it shortly.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create prompt error:", error);
    return NextResponse.json(
      { error: "Internal server error processing blueprint submission" },
      { status: 500 }
    );
  }
}
