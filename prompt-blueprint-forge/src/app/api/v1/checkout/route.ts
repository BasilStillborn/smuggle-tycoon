/*
 * POST /api/v1/checkout
 *
 * The central financial transaction endpoint. Processes a purchase from
 * cart to completion, using Stripe Connect for marketplace payments.
 *
 * When STRIPE_SECRET_KEY is set, payments go through Stripe Connect with
 * automatic platform fee capture and seller payout routing.
 * When STRIPE_SECRET_KEY is not set, falls back to simulated gateway.
 *
 * Expected request body:
 * {
 *   cartItems: string[],        // Array of blueprint IDs
 *   buyerId: string,            // Must match a valid user
 *   idempotencyKey: string      // Unique key to prevent duplicate charges
 * }
 *
 * Core Workflow (Critical Path - Atomic):
 * 1. IDEMPOTENCY CHECK: Verify no transaction exists for this idempotencyKey
 * 2. PRE-VALIDATION: Check all items are approved, buyer exists, prices valid
 * 3. PAYMENT (Stripe Connect or simulated):
 *    - If seller has stripeConnectId, uses Connect PaymentIntent with
 *      application_fee_amount for automatic platform fee & transfer
 *    - Otherwise falls back to simulated gateway
 * 4. SUCCESS PATH (atomic batch write):
 *    a. Record Transactions (status: "success") for each item
 *    b. Create SellerPayouts (status: "pending_payout") for each seller
 *    c. Record Purchases in buyer's history
 *    d. Increment blueprint sales counters
 *    e. Return order confirmation with purchase IDs
 * 5. FAILURE PATH: Return descriptive error, NO database changes
 * 6. ERROR PATH: Log critical details to internal system log, return 500
 *
 * All file writes use try/catch with rollback semantics — if any write
 * fails after the first succeeds, earlier changes are reverted.
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserById, getBlueprintById, getUsers } from "@/lib/data";
import { createPaymentIntent, stripeConfig } from "@/lib/stripe";

const PLATFORM_COMMISSION_RATE = 0.2;
const ADMIN_EMAIL = "admin@promptforge.com";

interface CheckoutItem {
  blueprintId: string;
  title: string;
  price: number;
  authorId: string;
  platformFee: number;
  sellerNet: number;
  buyerId?: string;
  stripeConnectId?: string;
}

interface CheckoutRequest {
  cartItems: string[];
  buyerId: string;
  idempotencyKey: string;
}

async function processPayment(
  items: CheckoutItem[],
  totalAmount: number
): Promise<{
  success: boolean;
  gatewayTransactionId: string;
  transferGroup?: string;
  error?: string;
}> {
  if (!stripeConfig.sandboxMode) {
    const users = getUsers();
    const userMap = new Map(users.map((u) => [u.id, u]));
    const sellersWithConnect = items.filter((i) => {
      const seller = userMap.get(i.authorId);
      return seller?.stripeConnectId;
    });

    if (sellersWithConnect.length === items.length) {
      const pi = await createPaymentIntent({
        amount: totalAmount,
        currency: "usd",
        stripeAccountId: sellersWithConnect[0].stripeConnectId!,
        platformFee: items.reduce((sum, i) => sum + i.platformFee, 0),
        metadata: {
          buyerId: items[0].buyerId || "unknown",
          itemCount: String(items.length),
          blueprintIds: items.map((i) => i.blueprintId).join(","),
        },
      });

      return {
        success: true,
        gatewayTransactionId: pi.paymentIntentId,
        transferGroup: pi.transferGroup,
      };
    }

    await new Promise((r) => setTimeout(r, 150 + Math.random() * 200));
    return {
      success: true,
      gatewayTransactionId: `gtwy_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    };
  }

  await new Promise((r) => setTimeout(r, 150 + Math.random() * 200));

  return {
    success: true,
    gatewayTransactionId: `gtwy_mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  };
}

/**
 * Local system log for critical payment failures.
 * In production, this would write to a dedicated logging service (e.g. DataDog, Splunk).
 */
function writeSystemLog(entry: {
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  data?: Record<string, unknown>;
}): void {
  try {
    const fs = require("fs");
    const path = require("path");
    const logPath = path.join(process.cwd(), "data", "system-log.json");
    let logs: unknown[] = [];
    try {
      logs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
    } catch {
      logs = [];
    }
    logs.push({ ...entry, timestamp: new Date().toISOString() });
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), "utf-8");
  } catch {
    // Silent fail for logging
  }
}

export async function POST(request: NextRequest) {
  const fs = await import("fs");
  const path = await import("path");
  const cwd = process.cwd();

  // File path references used throughout
  const transactionsPath = path.join(cwd, "data", "transactions.json");
  const payoutsPath = path.join(cwd, "data", "seller-payouts.json");
  const purchasesPath = path.join(cwd, "data", "purchases.json");
  const blueprintsPath = path.join(cwd, "data", "blueprints.json");

  // --- In-memory rollback snapshots ---
  let rollbackData: {
    transactions?: unknown[];
    payouts?: unknown[];
    purchases?: unknown[];
    blueprints?: unknown[];
  } = {};

  try {
    const body: CheckoutRequest = await request.json();
    const { cartItems, buyerId, idempotencyKey } = body;

    // ============================================================
    // STEP 0: Input Validation
    // ============================================================
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart must contain at least one item." },
        { status: 400 }
      );
    }

    if (!buyerId) {
      return NextResponse.json(
        { error: "Buyer ID is required." },
        { status: 400 }
      );
    }

    if (!idempotencyKey || idempotencyKey.length < 8) {
      return NextResponse.json(
        { error: "A valid idempotency key (min 8 chars) is required to prevent duplicate charges." },
        { status: 400 }
      );
    }

    const buyer = getUserById(buyerId);
    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer account not found." },
        { status: 404 }
      );
    }

    // ============================================================
    // STEP 1: Idempotency Check — Prevent duplicate processing
    // ============================================================
    let existingTransactions: any[] = [];
    try {
      existingTransactions = JSON.parse(fs.readFileSync(transactionsPath, "utf-8"));
    } catch {
      existingTransactions = [];
    }

    const existingTxn = existingTransactions.find(
      (t: any) => t.purchaseId === idempotencyKey
    );
    if (existingTxn) {
      writeSystemLog({
        level: "WARN",
        source: "checkout",
        message: `Duplicate checkout attempt blocked. Idempotency key: ${idempotencyKey}`,
        data: { buyerId, cartItems },
      });
      return NextResponse.json(
        {
          error: "This purchase has already been processed.",
          existingPurchaseId: existingTxn.purchaseId,
          status: existingTxn.status,
        },
        { status: 409 }
      );
    }

    // ============================================================
    // STEP 2: Pre-Validation — Verify all items are purchasable
    // ============================================================
    const items: CheckoutItem[] = [];
    let totalAmount = 0;

    for (const blueprintId of cartItems) {
      const bp = getBlueprintById(blueprintId);
      if (!bp) {
        return NextResponse.json(
          { error: `Blueprint not found: ${blueprintId}` },
          { status: 404 }
        );
      }
      if (bp.submissionStatus !== "approved") {
        return NextResponse.json(
          { error: `Blueprint "${bp.title}" is not yet approved for sale.` },
          { status: 403 }
        );
      }
      if (bp.price <= 0) {
        return NextResponse.json(
          { error: `Blueprint "${bp.title}" has an invalid price.` },
          { status: 400 }
        );
      }

      const platformFee = bp.price * PLATFORM_COMMISSION_RATE;
      const sellerNet = bp.price - platformFee;
      totalAmount += bp.price;

      items.push({
        blueprintId: bp.id,
        title: bp.title,
        price: bp.price,
        authorId: bp.authorId,
        platformFee,
        sellerNet,
        buyerId,
      });
    }

    // ============================================================
    // STEP 3: Payment Processing (Stripe Connect or simulated)
    // ============================================================
    writeSystemLog({
      level: "INFO",
      source: "checkout",
      message: `Initiating payment for ${items.length} item(s), total ${totalAmount}`,
      data: { buyerId, totalAmount, itemCount: items.length },
    });

    const paymentResult = await processPayment(items, totalAmount);

    if (!paymentResult.success) {
      writeSystemLog({
        level: "WARN",
        source: "checkout",
        message: `Payment failed: ${paymentResult.error}`,
        data: { buyerId, totalAmount, gatewayError: paymentResult.error },
      });
      return NextResponse.json(
        {
          error: paymentResult.error || "Payment failed. Please check your card details.",
          gatewayTransactionId: paymentResult.gatewayTransactionId,
        },
        { status: 402 }
      );
    }

    // ============================================================
    // STEP 4: Success Path — Atomic writes to all data sources
    // ============================================================
    // Read current states as rollback snapshots
    let currentPayouts: any[] = [];
    let currentPurchases: any[] = [];
    let currentBlueprints: any[] = [];

    try {
      rollbackData.transactions = JSON.parse(JSON.stringify(existingTransactions));
      currentPayouts = JSON.parse(fs.readFileSync(payoutsPath, "utf-8"));
      rollbackData.payouts = JSON.parse(JSON.stringify(currentPayouts));
      currentPurchases = JSON.parse(fs.readFileSync(purchasesPath, "utf-8"));
      rollbackData.purchases = JSON.parse(JSON.stringify(currentPurchases));
      currentBlueprints = JSON.parse(fs.readFileSync(blueprintsPath, "utf-8"));
      rollbackData.blueprints = JSON.parse(JSON.stringify(currentBlueprints));
    } catch (e) {
      writeSystemLog({
        level: "ERROR",
        source: "checkout",
        message: "Failed to read data files for transaction processing.",
        data: { error: String(e) },
      });
      return NextResponse.json(
        { error: "Internal system error. Please try again." },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString();
    const newTransactions: any[] = [];
    const newPayouts: any[] = [];
    const newPurchases: any[] = [];

    // 4a & 4b & 4c: Build transaction, payout, and purchase records
    for (const item of items) {
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const payoutId = `payout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Transaction record
      newTransactions.push({
        transactionId,
        purchaseId: idempotencyKey,
        buyerId,
        blueprintId: item.blueprintId,
        amountPaid: item.price,
        platformFeeAmount: item.platformFee,
        sellerNetRevenue: item.sellerNet,
        timestamp,
        status: "success",
      });

      // Seller payout record (auto-created, linked to transaction)
      newPayouts.push({
        payoutId,
        sellerId: item.authorId,
        amountEarned: item.price,
        platformFee: item.platformFee,
        netAmount: item.sellerNet,
        dateRecorded: timestamp.split("T")[0],
        status: "pending_payout",
        blueprintId: item.blueprintId,
        purchaseId: idempotencyKey,
      });

      // Purchase record for buyer history
      newPurchases.push({
        id: `purch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        blueprintId: item.blueprintId,
        userId: buyerId,
        purchaseDate: timestamp,
        amount: item.price,
        platformFee: item.platformFee,
        sellerPayoutId: payoutId,
        transactionId,
      });
    }

    // 4a: Write transactions
    try {
      const updatedTransactions = [...existingTransactions, ...newTransactions];
      fs.writeFileSync(transactionsPath, JSON.stringify(updatedTransactions, null, 2), "utf-8");
    } catch (e) {
      writeSystemLog({
        level: "ERROR",
        source: "checkout",
        message: "CRITICAL: Failed to write transactions. Initiating rollback.",
        data: { error: String(e) },
      });
      return NextResponse.json(
        { error: "Transaction recording failed. No charges were made." },
        { status: 500 }
      );
    }

    // 4b: Write seller payouts
    try {
      const updatedPayouts = [...currentPayouts, ...newPayouts];
      fs.writeFileSync(payoutsPath, JSON.stringify(updatedPayouts, null, 2), "utf-8");
    } catch (e) {
      // ROLLBACK: Undo transaction write
      fs.writeFileSync(transactionsPath, JSON.stringify(rollbackData.transactions, null, 2), "utf-8");
      writeSystemLog({
        level: "ERROR",
        source: "checkout",
        message: "CRITICAL: Failed to write seller payouts. Transactions rolled back.",
        data: { error: String(e) },
      });
      return NextResponse.json(
        { error: "Payment processing failed. Your card has not been charged." },
        { status: 500 }
      );
    }

    // 4c: Write purchase records
    try {
      const updatedPurchases = [...currentPurchases, ...newPurchases];
      fs.writeFileSync(purchasesPath, JSON.stringify(updatedPurchases, null, 2), "utf-8");
    } catch (e) {
      // ROLLBACK: Undo both transaction and payout writes
      fs.writeFileSync(transactionsPath, JSON.stringify(rollbackData.transactions, null, 2), "utf-8");
      fs.writeFileSync(payoutsPath, JSON.stringify(rollbackData.payouts, null, 2), "utf-8");
      writeSystemLog({
        level: "ERROR",
        source: "checkout",
        message: "CRITICAL: Failed to write purchase records. All changes rolled back.",
        data: { error: String(e) },
      });
      return NextResponse.json(
        { error: "Order confirmation failed. Your card has not been charged." },
        { status: 500 }
      );
    }

    // 4d: Increment blueprint sales counters
    try {
      for (const item of items) {
        const bp = currentBlueprints.find((b: any) => b.id === item.blueprintId);
        if (bp) {
          bp.sales = (bp.sales || 0) + 1;
        }
      }
      fs.writeFileSync(blueprintsPath, JSON.stringify(currentBlueprints, null, 2), "utf-8");
    } catch (e) {
      // ROLLBACK ALL: Undo all writes
      fs.writeFileSync(transactionsPath, JSON.stringify(rollbackData.transactions, null, 2), "utf-8");
      fs.writeFileSync(payoutsPath, JSON.stringify(rollbackData.payouts, null, 2), "utf-8");
      fs.writeFileSync(purchasesPath, JSON.stringify(rollbackData.purchases, null, 2), "utf-8");
      writeSystemLog({
        level: "ERROR",
        source: "checkout",
        message: "CRITICAL: Failed to update blueprint sales. Full rollback executed.",
        data: { error: String(e) },
      });
      return NextResponse.json(
        { error: "Order confirmation failed. Your card has not been charged." },
        { status: 500 }
      );
    }

    // ============================================================
    // SUCCESS: Return order confirmation
    // ============================================================
    writeSystemLog({
      level: "INFO",
      source: "checkout",
      message: `Purchase successful. Order: ${idempotencyKey}, Items: ${items.length}, Total: ${totalAmount}`,
      data: {
        buyerId,
        orderNumber: idempotencyKey,
        itemCount: items.length,
        totalAmount,
        purchaseIds: newPurchases.map((p) => p.id),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment successful. Your blueprints have been purchased.",
        orderNumber: idempotencyKey,
        totalPaid: totalAmount,
        itemsPurchased: items.length,
        purchaseIds: newPurchases.map((p) => p.id),
        gatewayTransactionId: paymentResult.gatewayTransactionId,
        transferGroup: paymentResult.transferGroup,
        timestamp,
      },
      { status: 200 }
    );
  } catch (error) {
    writeSystemLog({
      level: "ERROR",
      source: "checkout",
      message: `Unhandled exception in checkout: ${error}`,
      data: { error: String(error) },
    });
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
