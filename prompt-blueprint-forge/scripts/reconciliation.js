/**
 * Payout Reconciliation Script
 *
 * Compares the internal transaction log against the seller-payouts.json
 * and identifies discrepancies. Run daily/weekly as a cron job.
 *
 * Usage: node scripts/reconciliation.js
 * Via cron: 0 6 * * 1 node /path/to/scripts/reconciliation.js
 *
 * What it checks:
 *   1. Every successful transaction has a corresponding payout record
 *   2. Every payout record matches its source transaction's amounts
 *   3. No orphaned payouts (payouts without matching transactions)
 *   4. Platform fees are correctly calculated (20%)
 *   5. No duplicate payouts for the same transaction
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const EXPECTED_COMMISSION = 0.2;

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function reconcile() {
  console.log("\n═══════════════════════════════════════════");
  console.log("  PROMPTFORGE — Payout Reconciliation");
  console.log(`  ${new Date().toISOString()}`);
  console.log("═══════════════════════════════════════════\n");

  const transactions = loadJSON("transactions.json");
  const payouts = loadJSON("seller-payouts.json");
  const purchases = loadJSON("purchases.json");

  const issues = [];
  const summary = {
    totalTransactions: transactions.length,
    totalPayouts: payouts.length,
    totalPurchases: purchases.length,
    successfulTxns: 0,
    matchedPayouts: 0,
    orphanPayouts: 0,
    missingPayouts: 0,
    amountDiscrepancies: 0,
    commissionErrors: 0,
    duplicatePayouts: 0,
  };

  // ============================================================
  // CHECK 1: Every successful transaction needs a payout
  // ============================================================
  const successfulTxns = transactions.filter((t) => t.status === "success");
  summary.successfulTxns = successfulTxns.length;

  for (const txn of successfulTxns) {
    const matchingPayouts = payouts.filter(
      (p) => p.purchaseId === txn.purchaseId && p.blueprintId === txn.blueprintId
    );

    if (matchingPayouts.length === 0) {
      issues.push({
        severity: "CRITICAL",
        message: `Missing payout for transaction ${txn.transactionId} (Purchase: ${txn.purchaseId}, Blueprint: ${txn.blueprintId})`,
        transaction: txn.transactionId,
      });
      summary.missingPayouts++;
    } else if (matchingPayouts.length > 1) {
      issues.push({
        severity: "WARN",
        message: `Duplicate payouts (${matchingPayouts.length}) for transaction ${txn.transactionId}`,
        transaction: txn.transactionId,
      });
      summary.duplicatePayouts++;
    } else {
      summary.matchedPayouts++;
    }
  }

  // ============================================================
  // CHECK 2: Payout amounts match transaction amounts
  // ============================================================
  for (const payout of payouts) {
    const txn = transactions.find(
      (t) => t.purchaseId === payout.purchaseId && t.blueprintId === payout.blueprintId
    );

    if (!txn) {
      issues.push({
        severity: "WARN",
        message: `Orphan payout ${payout.payoutId} — no matching transaction found`,
        payoutId: payout.payoutId,
      });
      summary.orphanPayouts++;
      continue;
    }

    // Check amounts
    if (Math.abs(payout.amountEarned - txn.amountPaid) > 0.01) {
      issues.push({
        severity: "ERROR",
        message: `Amount mismatch for payout ${payout.payoutId}: payout.amountEarned=${formatCurrency(payout.amountEarned)} vs txn.amountPaid=${formatCurrency(txn.amountPaid)}`,
        payoutId: payout.payoutId,
      });
      summary.amountDiscrepancies++;
    }

    if (Math.abs(payout.platformFee - txn.platformFeeAmount) > 0.01) {
      issues.push({
        severity: "ERROR",
        message: `Fee mismatch for payout ${payout.payoutId}: payout.platformFee=${formatCurrency(payout.platformFee)} vs txn.platformFeeAmount=${formatCurrency(txn.platformFeeAmount)}`,
        payoutId: payout.payoutId,
      });
      summary.amountDiscrepancies++;
    }
  }

  // ============================================================
  // CHECK 3: Commission rate compliance
  // ============================================================
  for (const txn of successfulTxns) {
    const expectedFee = Math.round(txn.amountPaid * EXPECTED_COMMISSION * 100) / 100;
    if (Math.abs(txn.platformFeeAmount - expectedFee) > 0.01) {
      issues.push({
        severity: "ERROR",
        message: `Commission error for txn ${txn.transactionId}: expected ${formatCurrency(expectedFee)}, got ${formatCurrency(txn.platformFeeAmount)} (${(txn.platformFeeAmount / txn.amountPaid * 100).toFixed(1)}% vs expected 20%)`,
        transaction: txn.transactionId,
      });
      summary.commissionErrors++;
    }
  }

  // ============================================================
  // CHECK 4: Purchase records match transactions
  // ============================================================
  for (const purchase of purchases) {
    const txn = transactions.find((t) => t.transactionId === purchase.transactionId);
    if (!txn) {
      issues.push({
        severity: "CRITICAL",
        message: `Purchase ${purchase.id} references non-existent transaction ${purchase.transactionId}`,
        purchaseId: purchase.id,
      });
    } else {
      if (Math.abs(purchase.amount - txn.amountPaid) > 0.01) {
        issues.push({
          severity: "ERROR",
          message: `Purchase ${purchase.id} amount mismatch: purchase=${formatCurrency(purchase.amount)} vs txn=${formatCurrency(txn.amountPaid)}`,
          purchaseId: purchase.id,
        });
      }
      if (Math.abs(purchase.platformFee - txn.platformFeeAmount) > 0.01) {
        issues.push({
          severity: "ERROR",
          message: `Purchase ${purchase.id} fee mismatch: purchase=${formatCurrency(purchase.platformFee)} vs txn=${formatCurrency(txn.platformFeeAmount)}`,
          purchaseId: purchase.id,
        });
      }
    }
  }

  // ============================================================
  // PRINT RESULTS
  // ============================================================
  console.log("📊 SUMMARY");
  console.log("───────────────────────────────────────────────");
  console.log(`  Transactions (total):     ${summary.totalTransactions}`);
  console.log(`  Transactions (success):   ${summary.successfulTxns}`);
  console.log(`  Payouts (total):          ${summary.totalPayouts}`);
  console.log(`  Purchases (total):        ${summary.totalPurchases}`);
  console.log(`  Matched Payouts:          ${summary.matchedPayouts}`);
  console.log("");

  console.log("⚠️  ISSUES FOUND");
  console.log("───────────────────────────────────────────────");
  if (issues.length === 0) {
    console.log("  ✅ No issues found — all records are consistent.\n");
  } else {
    console.log(`  Total issues: ${issues.length}`);
    console.log(`    CRITICAL: ${issues.filter((i) => i.severity === "CRITICAL").length}`);
    console.log(`    ERROR:    ${issues.filter((i) => i.severity === "ERROR").length}`);
    console.log(`    WARN:     ${issues.filter((i) => i.severity === "WARN").length}`);
    console.log("");

    // Print details
    for (const issue of issues) {
      const icon = issue.severity === "CRITICAL" ? "🔴" : issue.severity === "ERROR" ? "🟡" : "🟠";
      console.log(`  ${icon} [${issue.severity}] ${issue.message}`);
    }
    console.log("");
  }

  console.log("📋 RECONCILIATION MATRIX");
  console.log("───────────────────────────────────────────────");
  console.log(`  Missing Payouts:          ${summary.missingPayouts > 0 ? "❌ " + summary.missingPayouts : "✅ None"}`);
  console.log(`  Orphan Payouts:           ${summary.orphanPayouts > 0 ? "❌ " + summary.orphanPayouts : "✅ None"}`);
  console.log(`  Amount Discrepancies:     ${summary.amountDiscrepancies > 0 ? "❌ " + summary.amountDiscrepancies : "✅ None"}`);
  console.log(`  Commission Errors:        ${summary.commissionErrors > 0 ? "❌ " + summary.commissionErrors : "✅ None"}`);
  console.log(`  Duplicate Payouts:        ${summary.duplicatePayouts > 0 ? "❌ " + summary.duplicatePayouts : "✅ None"}`);
  console.log("");

  // Generate log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    result: issues.length === 0 ? "PASS" : "FAIL",
    summary,
    issuesCount: issues.length,
    criticalCount: issues.filter((i) => i.severity === "CRITICAL").length,
  };

  const logPath = path.join(DATA_DIR, "system-log.json");
  let systemLog = [];
  try {
    systemLog = JSON.parse(fs.readFileSync(logPath, "utf-8"));
  } catch {
    systemLog = [];
  }
  systemLog.push({
    level: issues.length === 0 ? "INFO" : "ERROR",
    source: "reconciliation",
    message: `Reconciliation ${issues.length === 0 ? "passed" : "failed with " + issues.length + " issues"}`,
    data: logEntry,
    timestamp: new Date().toISOString(),
  });
  fs.writeFileSync(logPath, JSON.stringify(systemLog, null, 2), "utf-8");

  console.log("✅ Reconciliation logged to system-log.json");
  console.log("═══════════════════════════════════════════\n");

  return issues.length === 0;
}

// Run
const exitCode = reconcile() ? 0 : 1;
process.exit(exitCode);
