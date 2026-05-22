import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprintId, userId, rating, comment } = body;

    if (!blueprintId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: blueprintId, rating" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "feedback-log.json");

    let feedback: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      feedback = JSON.parse(raw);
    } catch {
      feedback = [];
    }

    const entry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      blueprintId,
      userId: userId || "anonymous",
      rating,
      comment: comment || "",
      createdAt: new Date().toISOString(),
    };

    feedback.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(feedback, null, 2), "utf-8");

    return NextResponse.json({ success: true, feedback: entry }, { status: 201 });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blueprintId = searchParams.get("blueprintId");

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "feedback-log.json");

    let feedback: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      feedback = JSON.parse(raw);
    } catch {
      feedback = [];
    }

    if (blueprintId) {
      feedback = feedback.filter((f) => f.blueprintId === blueprintId);
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Fetch feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
