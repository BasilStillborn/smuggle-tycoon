import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "users.json");

    let users: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      users = JSON.parse(raw);
    } catch {
      users = [];
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      bio: "Prompt marketplace enthusiast.",
      joinedDate: new Date().toISOString().split("T")[0],
      role: "buyer",
    };

    users.push(newUser);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
