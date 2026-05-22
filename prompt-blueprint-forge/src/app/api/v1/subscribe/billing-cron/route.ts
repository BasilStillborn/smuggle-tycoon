/**
 * GET /api/v1/subscribe/billing-cron
 *
 * Billing cycle checker — simulates a cron job that processes
 * subscription renewals. Checks every subscription's nextBillingDate
 * against the current date and flags overdue subscriptions.
 *
 * In production, this would be called by a scheduled job (cron, AWS EventBridge, etc.)
 * and would integrate with Stripe's billing system for actual payment attempts.
 *
 * Run manually: curl http://localhost:3000/api/v1/subscribe/billing-cron
 * Or via cron: 0 0 * * * curl http://localhost:3000/api/v1/subscribe/billing-cron
 */

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "data", "subscriptions.json");

    let subscriptions: any[] = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      subscriptions = JSON.parse(raw);
    } catch {
      return NextResponse.json({ message: "No subscriptions found.", processed: 0, statusChanges: [] });
    }

    const now = new Date();
    const statusChanges: { userId: string; from: string; to: string; reason: string }[] = [];

    for (let i = 0; i < subscriptions.length; i++) {
      const sub = subscriptions[i];
      const nextBilling = new Date(sub.nextBillingDate);

      // Skip non-active subscriptions
      if (sub.status !== "active") continue;

      // If next billing date has passed, flag as past_due
      if (nextBilling < now) {
        statusChanges.push({
          userId: sub.userId,
          from: sub.status,
          to: "past_due",
          reason: `Billing date ${sub.nextBillingDate} has passed without payment confirmation.`,
        });
        subscriptions[i].status = "past_due";
        subscriptions[i].lastBillingAttempt = now.toISOString();
        subscriptions[i].billingFailures = (sub.billingFailures || 0) + 1;
      }
    }

    // Check for subscriptions that have been past_due for too long (>30 days)
    const staleSubs = subscriptions.filter((s) => s.status === "past_due");
    for (let i = 0; i < subscriptions.length; i++) {
      const sub = subscriptions[i];
      if (sub.status === "past_due" && sub.lastBillingAttempt) {
        const lastAttempt = new Date(sub.lastBillingAttempt);
        const daysSince = Math.floor((now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= 30) {
          statusChanges.push({
            userId: sub.userId,
            from: sub.status,
            to: "expired",
            reason: `Subscription expired after ${daysSince} days in past_due status.`,
          });
          subscriptions[i].status = "expired";
          subscriptions[i].expiredAt = now.toISOString();
        }
      }
    }

    // Attempt to rebill past_due subscriptions (simulated — 30% success rate)
    const rebilled: string[] = [];
    for (let i = 0; i < subscriptions.length; i++) {
      const sub = subscriptions[i];
      if (sub.status === "past_due" && (sub.billingFailures || 0) < 3) {
        const success = Math.random() < 0.3; // Simulated 30% recovery rate
        if (success) {
          const nextBilling = new Date(now);
          nextBilling.setMonth(nextBilling.getMonth() + 1);
          subscriptions[i].status = "active";
          subscriptions[i].nextBillingDate = nextBilling.toISOString();
          subscriptions[i].lastSuccessfulRebill = now.toISOString();
          subscriptions[i].billingFailures = 0;
          rebilled.push(sub.userId);
          statusChanges.push({
            userId: sub.userId,
            from: "past_due",
            to: "active",
            reason: "Rebill attempt succeeded. Subscription reactivated.",
          });
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2), "utf-8");

    return NextResponse.json({
      message: "Billing cycle check complete.",
      checked: subscriptions.length,
      active: subscriptions.filter((s) => s.status === "active").length,
      pastDue: subscriptions.filter((s) => s.status === "past_due").length,
      expired: subscriptions.filter((s) => s.status === "expired").length,
      rebilled: rebilled.length,
      statusChanges,
    });
  } catch (error) {
    console.error("Billing cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
