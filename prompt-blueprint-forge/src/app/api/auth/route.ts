import { NextResponse } from "next/server";
import { getUsers } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const users = getUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
