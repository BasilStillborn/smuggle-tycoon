// Prompt Blueprint Forge — Proprietary software. Copyright (c) 2026 Aaron Johnson. All rights reserved.
// See LICENSE file for full terms.

import Stripe from "stripe";
import type { StripeAccountStatus } from "./types";

const secretKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export const stripe = secretKey ? new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" }) : null;

export const stripeConfig = {
  sandboxMode: !secretKey,
  currency: "usd" as const,
  connectClientId: process.env.STRIPE_CLIENT_ID || "",
  webhookSecret,
};

export async function createConnectAccount(
  email: string,
  name: string,
  userId: string
): Promise<{
  accountId: string;
  status: StripeAccountStatus;
  onboardingUrl: string | null;
}> {
  if (!stripe || stripeConfig.sandboxMode) {
    return {
      accountId: `acct_mock_${Date.now()}`,
      status: "onboarding",
      onboardingUrl: `https://dashboard.stripe.com/test/connect/express/onboarding/mock_${Date.now()}`,
    };
  }

  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email,
    business_type: "individual",
    business_profile: { name, product_description: "AI prompt blueprint creator on Prompt Blueprint Forge" },
    metadata: { userId, platform: "prompt-blueprint-forge" },
    capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
  });

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${origin}/dashboard?stripe_refresh=true`,
    return_url: `${origin}/dashboard?stripe_success=true`,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    status: "onboarding",
    onboardingUrl: accountLink.url,
  };
}

export async function getDashboardLink(accountId: string): Promise<string | null> {
  if (!stripe || stripeConfig.sandboxMode) {
    return `https://dashboard.stripe.com/test/express/mock_${accountId}`;
  }

  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

export async function retrieveAccount(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: StripeAccountStatus;
}> {
  if (!stripe || stripeConfig.sandboxMode) {
    return { chargesEnabled: true, payoutsEnabled: true, detailsSubmitted: true, status: "active" };
  }

  const account = await stripe.accounts.retrieve(accountId);

  let status: StripeAccountStatus = "pending";
  if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
    status = "active";
  } else if (account.details_submitted) {
    status = "pending";
  } else {
    status = "onboarding";
  }

  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    status,
  };
}

export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  stripeAccountId: string;
  platformFee: number;
  metadata: Record<string, string>;
}): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  transferGroup?: string;
}> {
  if (!stripe || stripeConfig.sandboxMode) {
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
      paymentIntentId: `pi_mock_${Date.now()}`,
      amount: Math.round(params.amount * 100),
    };
  }

  const transferGroup = `tg_${Date.now()}`;
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: Math.round(params.amount * 100),
      currency: params.currency,
      metadata: { ...params.metadata, transfer_group: transferGroup },
      application_fee_amount: Math.round(params.platformFee * 100),
      automatic_payment_methods: { enabled: true },
      transfer_data: { destination: params.stripeAccountId },
      transfer_group: transferGroup,
    },
    { stripeAccount: params.stripeAccountId }
  );

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    transferGroup,
  };
}

export async function confirmPaymentIntent(
  paymentIntentId: string,
  stripeAccountId?: string
): Promise<{ status: string; error?: string }> {
  if (!stripe || stripeConfig.sandboxMode) {
    return { status: "succeeded" };
  }

  const paymentIntent = await (stripeAccountId
    ? stripe.paymentIntents.retrieve(paymentIntentId, {}, { stripeAccount: stripeAccountId })
    : stripe.paymentIntents.retrieve(paymentIntentId));

  return { status: paymentIntent.status };
}

export async function createTransfer(params: {
  amount: number;
  currency: string;
  destinationAccountId: string;
  transferGroup: string;
  metadata: Record<string, string>;
}): Promise<{ transferId: string; success: boolean; error?: string }> {
  if (!stripe || stripeConfig.sandboxMode) {
    return { transferId: `tr_mock_${Date.now()}`, success: true };
  }

  const transfer = await stripe.transfers.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency,
    destination: params.destinationAccountId,
    transfer_group: params.transferGroup,
    metadata: params.metadata,
  });

  return { transferId: transfer.id, success: true };
}

export async function processRefund(
  paymentIntentId: string,
  amount?: number
): Promise<{ success: boolean; error?: string }> {
  if (!stripe || stripeConfig.sandboxMode) {
    return { success: true };
  }

  try {
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Refund failed" };
  }
}

export async function constructWebhookEvent(
  payload: string,
  signature: string
): Promise<{ type: string; data: Record<string, unknown> } | { error: string }> {
  if (!stripe || stripeConfig.sandboxMode || !webhookSecret) {
    const parsed = JSON.parse(payload);
    return { type: parsed.type || "mock.event", data: parsed.data || parsed };
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return { type: event.type, data: event.data as unknown as Record<string, unknown> };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Webhook signature verification failed" };
  }
}
