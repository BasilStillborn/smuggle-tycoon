import { createPaymentIntent as connectCreatePaymentIntent, confirmPaymentIntent as connectConfirmPaymentIntent, processRefund, stripeConfig } from "./stripe";

export { stripeConfig };

export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>
): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  error?: string;
}> {
  const result = await connectCreatePaymentIntent({
    amount,
    currency: "usd",
    stripeAccountId: metadata.stripeAccountId || "",
    platformFee: Number(metadata.platformFee || "0"),
    metadata,
  });
  return result;
}

export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<{ status: string; error?: string }> {
  return connectConfirmPaymentIntent(paymentIntentId);
}

export async function refundPayment(
  paymentIntentId: string,
  amount?: number
): Promise<{ success: boolean; error?: string }> {
  return processRefund(paymentIntentId, amount);
}
