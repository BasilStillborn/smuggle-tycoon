import { NextResponse } from "next/server";
import { createTransfer, stripeConfig } from "@/lib/stripe";
import { getUsers } from "@/lib/data";

export async function POST() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const cwd = process.cwd();

    const payoutsPath = path.join(cwd, "data", "seller-payouts.json");
    const transactionsPath = path.join(cwd, "data", "transactions.json");
    const transfersPath = path.join(cwd, "data", "transfers.json");

    let payouts: any[] = [];
    try {
      payouts = JSON.parse(fs.readFileSync(payoutsPath, "utf-8"));
    } catch {
      return NextResponse.json({ message: "No payouts found.", processed: 0 });
    }

    const pendingPayouts = payouts.filter((p: any) => p.status === "pending_payout");
    if (pendingPayouts.length === 0) {
      return NextResponse.json({ message: "No pending payouts to process.", processed: 0 });
    }

    const users = getUsers();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const results: { payoutId: string; sellerId: string; success: boolean; transferId?: string; error?: string }[] = [];

    for (const payout of pendingPayouts) {
      const seller = userMap.get(payout.sellerId);

      if (!seller || !seller.stripeConnectId) {
        results.push({
          payoutId: payout.payoutId,
          sellerId: payout.sellerId,
          success: false,
          error: "Seller has no Stripe Connect account",
        });
        continue;
      }

      const transferResult = await createTransfer({
        amount: payout.netAmount,
        currency: "usd",
        destinationAccountId: seller.stripeConnectId,
        transferGroup: `payout_${payout.payoutId}`,
        metadata: {
          payoutId: payout.payoutId,
          sellerId: payout.sellerId,
          blueprintId: payout.blueprintId || "",
          platform: "prompt-blueprint-forge",
        },
      });

      if (transferResult.success) {
        payout.status = "paid_out";
        payout.transferId = transferResult.transferId;
        payout.paidOutAt = new Date().toISOString();
        results.push({
          payoutId: payout.payoutId,
          sellerId: payout.sellerId,
          success: true,
          transferId: transferResult.transferId,
        });
      } else {
        results.push({
          payoutId: payout.payoutId,
          sellerId: payout.sellerId,
          success: false,
          error: transferResult.error || "Transfer failed",
        });
      }
    }

    fs.writeFileSync(payoutsPath, JSON.stringify(payouts, null, 2), "utf-8");

    let transfers: any[] = [];
    try {
      transfers = JSON.parse(fs.readFileSync(transfersPath, "utf-8"));
    } catch {
      transfers = [];
    }

    const now = new Date().toISOString();
    for (const r of results) {
      if (r.success) {
        transfers.push({
          transferId: r.transferId,
          payoutId: r.payoutId,
          sellerId: r.sellerId,
          timestamp: now,
          status: "completed",
        });
      }
    }
    fs.writeFileSync(transfersPath, JSON.stringify(transfers, null, 2), "utf-8");

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Processed ${results.length} payout(s)`,
      processed: results.length,
      succeeded,
      failed,
      details: results,
    });
  } catch (error) {
    console.error("Connect payouts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
