import { NextRequest, NextResponse } from "next/server";
import { createConnectAccount, retrieveAccount } from "@/lib/stripe";
import { getUsers, getUserById } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const fs = await import("fs");
    const path = await import("path");
    const usersPath = path.join(process.cwd(), "data", "users.json");

    let users = getUsers();

    if (user.stripeConnectId) {
      const status = await retrieveAccount(user.stripeConnectId);
      return NextResponse.json({
        alreadyOnboarded: true,
        accountId: user.stripeConnectId,
        accountStatus: status.status,
      });
    }

    const result = await createConnectAccount(user.email, user.name, user.id);

    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, stripeConnectId: result.accountId, stripeAccountStatus: result.status } : u
    );
    fs.writeFileSync(usersPath, JSON.stringify(updatedUsers, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      accountId: result.accountId,
      onboardingUrl: result.onboardingUrl,
      accountStatus: result.status,
    });
  } catch (error) {
    console.error("Connect onboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
