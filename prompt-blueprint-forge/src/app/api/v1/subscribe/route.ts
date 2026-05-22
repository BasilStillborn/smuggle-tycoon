import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/data";
import { SUBSCRIPTION_PLANS } from "@/lib/types";
import type { SubscriptionPlan } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "Missing required fields: userId, plan" },
        { status: 400 }
      );
    }

    const validPlans = SUBSCRIPTION_PLANS.map((p) => p.id);
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${validPlans.join(", ")}` },
        { status: 400 }
      );
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "subscriptions.json");

    let subscriptions: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      subscriptions = JSON.parse(raw);
    } catch {
      subscriptions = [];
    }

    const existing = subscriptions.findIndex((s) => s.userId === userId);
    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    const subscription = {
      id: existing >= 0 ? subscriptions[existing].id : `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      plan: plan as SubscriptionPlan,
      status: "active",
      startDate: existing >= 0 ? subscriptions[existing].startDate : now.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
      autoRenew: true,
    };

    if (existing >= 0) {
      subscriptions[existing] = { ...subscriptions[existing], ...subscription };
    } else {
      subscriptions.push(subscription);
    }

    fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: `Subscribed to ${plan} plan successfully.`,
      subscription,
    }, { status: 200 });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "subscriptions.json");

    let subscriptions: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      subscriptions = JSON.parse(raw);
    } catch {
      subscriptions = [];
    }

    const sub = subscriptions.find((s) => s.userId === userId) || null;

    return NextResponse.json({ subscription: sub });
  } catch (error) {
    console.error("Fetch subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "subscriptions.json");

    let subscriptions: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      subscriptions = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "No subscription found." },
        { status: 404 }
      );
    }

    const idx = subscriptions.findIndex((s) => s.userId === userId);
    if (idx === -1) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 }
      );
    }

    subscriptions[idx] = {
      ...subscriptions[idx],
      status: "canceled",
      canceledAt: new Date().toISOString(),
      autoRenew: false,
    };

    fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Subscription canceled. Access continues until the end of the billing period.",
      subscription: subscriptions[idx],
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
