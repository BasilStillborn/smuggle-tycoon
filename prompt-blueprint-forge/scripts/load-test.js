/**
 * Load Test: /api/v1/checkout Endpoint
 *
 * Simulates 100 concurrent checkout requests to identify race conditions,
 * file-writing concurrency issues, and bottlenecks in the JSON-based
 * transaction system.
 *
 * Usage: node scripts/load-test.js
 *
 * Prerequisites:
 *   - Server must be running on http://localhost:3000
 *   - Data files should be in a clean/reset state before running
 *   - Requires: npm install node-fetch@2 (or use native fetch in Node 18+)
 */

const BASE_URL = "http://localhost:3000";
const CONCURRENCY = 100; // Number of simultaneous requests
const BUYER_ID = "user_5"; // Demo user
const BLUEPRINT_IDS = ["bp_1", "bp_2", "bp_4"]; // Valid approved blueprints

const results = {
  success: 0,
  failed: 0,
  duplicate: 0,
  errors: [],
  durations: [],
};

function generateIdempotencyKey() {
  return `loadtest_${BUYER_ID}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function sendCheckoutRequest() {
  const start = Date.now();
  const idempotencyKey = generateIdempotencyKey();

  try {
    const res = await fetch(`${BASE_URL}/api/v1/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: [BLUEPRINT_IDS[Math.floor(Math.random() * BLUEPRINT_IDS.length)]],
        buyerId: BUYER_ID,
        idempotencyKey,
      }),
    });

    const duration = Date.now() - start;
    const data = await res.json();

    if (res.ok && data.success) {
      results.success++;
      results.durations.push(duration);
      return { status: "success", duration, idempotencyKey };
    } else if (res.status === 409) {
      results.duplicate++;
      return { status: "duplicate", duration, idempotencyKey, error: data.error };
    } else {
      results.failed++;
      results.errors.push({ idempotencyKey, status: res.status, error: data.error });
      return { status: "failed", duration, idempotencyKey, error: data.error };
    }
  } catch (err) {
    const duration = Date.now() - start;
    results.failed++;
    results.errors.push({ idempotencyKey, status: 0, error: err.message });
    return { status: "error", duration, idempotencyKey, error: err.message };
  }
}

async function runLoadTest() {
  console.log(`\n🔧 PromptForge Load Test`);
  console.log(`   Endpoint: ${BASE_URL}/api/v1/checkout`);
  console.log(`   Concurrency: ${CONCURRENCY} requests`);
  console.log(`   Buyer: ${BUYER_ID}`);
  console.log(`   Blueprints: ${BLUEPRINT_IDS.join(", ")}`);
  console.log(`   Timestamp: ${new Date().toISOString()}\n`);

  // Fire all requests concurrently
  const requests = Array.from({ length: CONCURRENCY }, () => sendCheckoutRequest());

  console.log(`🚀 Firing ${CONCURRENCY} concurrent requests...\n`);

  const responses = await Promise.all(requests);

  // Analyze results
  const successDurations = results.durations;
  const avgDuration = successDurations.length > 0
    ? successDurations.reduce((a, b) => a + b, 0) / successDurations.length
    : 0;
  const maxDuration = successDurations.length > 0 ? Math.max(...successDurations) : 0;
  const minDuration = successDurations.length > 0 ? Math.min(...successDurations) : 0;

  console.log("═".repeat(50));
  console.log("📊 RESULTS");
  console.log("═".repeat(50));
  console.log(`   ✅ Successful:         ${results.success}/${CONCURRENCY}`);
  console.log(`   ❌ Failed:             ${results.failed}/${CONCURRENCY}`);
  console.log(`   🔁 Duplicate (409):    ${results.duplicate}/${CONCURRENCY}`);
  console.log(`   ⚡ Avg Response Time:  ${avgDuration.toFixed(0)}ms`);
  console.log(`   ⚡ Min Response Time:  ${minDuration.toFixed(0)}ms`);
  console.log(`   ⚡ Max Response Time:  ${maxDuration.toFixed(0)}ms`);
  console.log("");

  if (results.errors.length > 0) {
    console.log("═".repeat(50));
    console.log("❌ ERRORS");
    console.log("═".repeat(50));
    results.errors.slice(0, 10).forEach((err) => {
      console.log(`   [${err.status}] ${err.idempotencyKey.slice(0, 30)}...`);
      console.log(`   ${err.error}`);
      console.log("");
    });
    if (results.errors.length > 10) {
      console.log(`   ... and ${results.errors.length - 10} more errors`);
      console.log("");
    }
  }

  // Check data integrity
  console.log("═".repeat(50));
  console.log("🔍 DATA INTEGRITY CHECK");
  console.log("═".repeat(50));

  try {
    const transactionsRes = await fetch(`${BASE_URL}/api/v1/purchases?userId=${BUYER_ID}`);
    const purchasesData = await transactionsRes.json();
    const purchasesCount = purchasesData.purchases?.length || 0;

    // Check for duplicate transaction IDs
    const txnIds = purchasesData.purchases?.map((p) => p.transactionId) || [];
    const uniqueTxnIds = new Set(txnIds);
    if (uniqueTxnIds.size !== txnIds.length) {
      console.log(`   ⚠️  WARNING: Found ${txnIds.length - uniqueTxnIds.size} duplicate transaction IDs!`);
    } else {
      console.log(`   ✅ No duplicate transaction IDs found.`);
    }

    console.log(`   📦 Total purchases for user: ${purchasesCount}`);
    console.log(`   🆔 Unique transaction IDs: ${uniqueTxnIds.size}`);
  } catch (err) {
    console.log(`   ⚠️  Could not verify data integrity: ${err.message}`);
  }

  console.log("\n✅ Load test complete.\n");
}

runLoadTest().catch(console.error);
