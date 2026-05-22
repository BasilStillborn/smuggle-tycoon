# Failure Scenario Testing Guide

This document outlines every deliberate failure scenario to test
before going live. Each test validates that the system gracefully
handles the failure, logs appropriately, and maintains data integrity.

## Prerequisites

- Server running on http://localhost:3000
- Reset data files to known state before each test
- Monitor `data/system-log.json` after each test

---

## 1. Payment Decline (Card Ending 0000)

**Trigger:** Submit checkout with card ending `0000`.
**Expected Behavior:**
- API returns 402 with descriptive error message
- NO transactions written to `transactions.json`
- NO payouts created in `seller-payouts.json`
- NO purchases recorded in `purchases.json`
- Product sales counters NOT incremented
- System log contains WARN-level entry

**Checklist:**
- [ ] 402 status returned
- [ ] Error message: "Payment declined by issuer"
- [ ] No transaction records created
- [ ] No payout records created
- [ ] Sales count unchanged

---

## 2. Lost Card (Card Ending 9999)

**Trigger:** Submit checkout with card ending `9999`.
**Expected Behavior:**
- API returns 402 with descriptive error
- Same rollback behavior as 0000

**Checklist:**
- [ ] 402 status returned
- [ ] Error message: "Card reported as lost"
- [ ] No data written to any file

---

## 3. Duplicate Idempotency Key

**Trigger:** Send the exact same checkout request twice.
**Expected Behavior:**
- First request succeeds (200)
- Second request returns 409 Conflict
- Second request does NOT create duplicate records
- System log contains WARN-level entry for duplicate

**Checklist:**
- [ ] First request: 200, success
- [ ] Second request: 409
- [ ] Only one transaction in `transactions.json`
- [ ] Only one purchase in `purchases.json`
- [ ] Sales incremented only once

---

## 4. Invalid Buyer ID

**Trigger:** Submit checkout with non-existent `buyerId`.
**Expected Behavior:**
- API returns 404
- No data written to any file

**Checklist:**
- [ ] 404 returned
- [ ] Error mentions "buyer account not found"
- [ ] No data files modified

---

## 5. Empty Cart

**Trigger:** Submit checkout with empty `cartItems` array.
**Expected Behavior:**
- API returns 400
- Error mentions "at least one item"

**Checklist:**
- [ ] 400 returned
- [ ] No data files modified

---

## 6. Unapproved Blueprint

**Trigger:** Attempt to purchase a non-approved blueprint.
**Expected Behavior:**
- API returns 403
- Error mentions "not yet approved for sale"

**Checklist:**
- [ ] 403 returned
- [ ] No data files modified

---

## 7. Short Idempotency Key

**Trigger:** Submit with `idempotencyKey` shorter than 8 chars.
**Expected Behavior:**
- API returns 400
- Error mentions "min 8 chars"

**Checklist:**
- [ ] 400 returned
- [ ] No data files modified

---

## 8. Missing Required Fields

**Trigger:** Submit checkout missing `buyerId` or `cartItems`.
**Expected Behavior:**
- API returns 400
- Error mentions missing field

**Checklist:**
- [ ] 400 returned
- [ ] No data files modified

---

## 9. Invalid JSON Body

**Trigger:** Send malformed JSON in request body.
**Expected Behavior:**
- API returns 500
- System log contains ERROR-level entry with exception details

**Checklist:**
- [ ] 500 returned
- [ ] System log has error entry
- [ ] All data files in valid JSON state (no corruption)

---

## 10. Concurrent Same-Blueprint Purchase

**Trigger:** Send 5 concurrent requests all purchasing the same blueprint
for the same buyer.
**Expected Behavior:**
- All requests with unique idempotency keys should succeed
- Sales count increments exactly 5 times
- Each with its own transaction and purchase record

**Checklist:**
- [ ] All 5 return 200
- [ ] Sales count increased by 5
- [ ] 5 purchase records created
- [ ] No duplicate transaction IDs

---

## 11. Unauthorized Admin Access

**Trigger:** Non-admin user calls `/api/v1/review-prompt` or
`/api/v1/pending-blueprints`.
**Expected Behavior:**
- API returns 403
- Error mentions "Unauthorized" or "Admin only"

**Checklist:**
- [ ] 403 returned
- [ ] No changes to pending-blueprints.json

---

## 12. File System Read/Write Failure

**Trigger (simulated):** Make data directory read-only, then attempt checkout.
**Expected Behavior:**
- API returns 500
- Existing data files unchanged (rollback on failure)
- System log contains CRITICAL entry

**Checklist:**
- [ ] 500 returned
- [ ] Transactions.json unchanged
- [ ] System log has error entry

---

## Summary: Pre-Launch Gate

Before going live, ALL 12 scenarios above must pass.
Run them sequentially and check off each checklist item.

Gatekeeper: ______________   Date: ______________
