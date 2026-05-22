import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, retrieveAccount, stripeConfig } from "@/lib/stripe";
import { getUsers } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    const event = await constructWebhookEvent(body, signature);

    if ("error" in event) {
      console.error("Stripe webhook signature verification failed:", event.error);
      return NextResponse.json({ error: event.error }, { status: 400 });
    }

    const { type, data } = event;
    const object = data.object as Record<string, any> || {};

    switch (type) {
      case "account.updated": {
        const accountId = object.id;
        if (!accountId) break;

        const accountInfo = await retrieveAccount(accountId);
        const fs = await import("fs");
        const path = await import("path");
        const usersPath = path.join(process.cwd(), "data", "users.json");

        let users: any[] = [];
        try {
          users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
        } catch {
          break;
        }

        const updatedUsers = users.map((u) => {
          if (u.stripeConnectId === accountId) {
            return { ...u, stripeAccountStatus: accountInfo.status };
          }
          return u;
        });

        fs.writeFileSync(usersPath, JSON.stringify(updatedUsers, null, 2), "utf-8");
        break;
      }

      case "payment_intent.succeeded": {
        const fs = await import("fs");
        const path = await import("path");
        const logPath = path.join(process.cwd(), "data", "system-log.json");
        let logs: any[] = [];
        try {
          logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
        } catch { /* */ }
        logs.push({
          level: "INFO",
          source: "stripe-webhook",
          message: `PaymentIntent succeeded: ${object.id}`,
          data: { paymentIntentId: object.id, amount: object.amount, status: object.status },
          timestamp: new Date().toISOString(),
        });
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), "utf-8");
        break;
      }

      case "payment_intent.payment_failed": {
        const fs = await import("fs");
        const path = await import("path");
        const logPath = path.join(process.cwd(), "data", "system-log.json");
        let logs: any[] = [];
        try {
          logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
        } catch { /* */ }
        logs.push({
          level: "ERROR",
          source: "stripe-webhook",
          message: `PaymentIntent failed: ${object.id}`,
          data: { paymentIntentId: object.id, error: object.last_payment_error, status: object.status },
          timestamp: new Date().toISOString(),
        });
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), "utf-8");
        break;
      }

      case "payout.paid": {
        const fs = await import("fs");
        const path = await import("path");
        const logPath = path.join(process.cwd(), "data", "system-log.json");
        let logs: any[] = [];
        try {
          logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
        } catch { /* */ }
        logs.push({
          level: "INFO",
          source: "stripe-webhook",
          message: `Payout completed: ${object.id}`,
          data: { payoutId: object.id, amount: object.amount, status: object.status },
          timestamp: new Date().toISOString(),
        });
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), "utf-8");
        break;
      }

      case "payout.failed": {
        const fs = await import("fs");
        const path = await import("path");
        const logPath = path.join(process.cwd(), "data", "system-log.json");
        let logs: any[] = [];
        try {
          logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
        } catch { /* */ }
        logs.push({
          level: "ERROR",
          source: "stripe-webhook",
          message: `Payout failed: ${object.id}`,
          data: { payoutId: object.id, amount: object.amount, failureMessage: object.failure_message },
          timestamp: new Date().toISOString(),
        });
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), "utf-8");
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true, type });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
