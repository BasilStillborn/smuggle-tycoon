import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy - Prompt Blueprint Forge",
  description: "Prompt Blueprint Forge refund and cancellation policy for digital goods.",
};

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-8">
        <Link href="/" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">&larr; Back to Home</Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
      <p className="text-sm text-(--muted) mb-8">Last updated: May 14, 2026</p>

      <div className="prose prose-sm prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Digital Goods Policy</h2>
          <p className="text-(--muted) leading-relaxed">
            All Blueprints available on Prompt Blueprint Forge are digital goods. Due to the instant-access nature of digital products, <strong>all purchases are final sale</strong> and non-refundable once access has been granted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Exceptions</h2>
          <p className="text-(--muted) leading-relaxed">
            Refunds may be issued at the sole discretion of PromptForge in the following circumstances:
          </p>
          <ul className="list-disc pl-5 text-(--muted) space-y-1 mt-2">
            <li>The Blueprint is materially different from its description and the issue cannot be resolved through an update.</li>
            <li>The Blueprint contains technical errors that render it unusable with all listed compatible models.</li>
            <li>Duplicate purchase due to a processing error (proven by duplicate transaction records).</li>
            <li>Unauthorized transaction reported within 5 business days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Refund Request Process</h2>
          <p className="text-(--muted) leading-relaxed">
            To request a refund, contact <strong>support@promptforge.com</strong> within 14 days of purchase with your order number and detailed explanation of the issue. Refund decisions will be communicated within 5 business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Fraud Prevention</h2>
          <p className="text-(--muted) leading-relaxed">
            PromptForge monitors refund requests for abuse. Accounts that file excessive refund requests or demonstrate patterns of purchasing and requesting refunds after downloading will be flagged and may be suspended in accordance with our Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Chargebacks</h2>
          <p className="text-(--muted) leading-relaxed">
            If you dispute a purchase through your payment provider (chargeback), your account may be suspended pending resolution. Chargebacks that are determined to be fraudulent will result in permanent account termination and referral to appropriate legal authorities.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Subscription Cancellations</h2>
          <p className="text-(--muted) leading-relaxed">
            Subscription plans may be canceled at any time. Upon cancellation, you retain access to subscription benefits until the end of the current billing period. No prorated refunds are provided for mid-cycle cancellations.
          </p>
        </section>
      </div>
    </div>
  );
}
