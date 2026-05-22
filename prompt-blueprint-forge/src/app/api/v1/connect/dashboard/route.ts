import { NextRequest, NextResponse } from "next/server";
import { getDashboardLink, retrieveAccount } from "@/lib/stripe";
import { getUserById } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeConnectId) {
      return NextResponse.json({ error: "User has no Stripe Connect account. Complete onboarding first." }, { status: 400 });
    }

    const [dashboardLink, accountInfo] = await Promise.all([
      getDashboardLink(user.stripeConnectId),
      retrieveAccount(user.stripeConnectId),
    ]);

    return NextResponse.json({
      dashboardUrl: dashboardLink,
      accountId: user.stripeConnectId,
      accountStatus: accountInfo.status,
      chargesEnabled: accountInfo.chargesEnabled,
      payoutsEnabled: accountInfo.payoutsEnabled,
      detailsSubmitted: accountInfo.detailsSubmitted,
    });
  } catch (error) {
    console.error("Connect dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
