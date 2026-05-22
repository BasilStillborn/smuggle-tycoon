import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "The Ultimate Local Business Reputation Audit Checklist",
  description:
    "A 30-point PDF checklist to audit and improve your Google Business Profile, reviews, and online reputation. Instant download.",
};

export default function ChecklistPage() {
  return (
    <div className="max-w-3xl mx-auto container-padding py-8">
      <Breadcrumbs crumbs={[{ label: "Checklist" }]} />

      <article className="mt-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            The Local Business Reputation Audit Checklist
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            30-point audit. 15 minutes. Know exactly where your reputation stands and what to fix first.
          </p>
        </div>

        <div className="rounded-xl border-2 border-brand-200 bg-white p-8 shadow-md mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What&apos;s Inside</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-0.5">✓</span>
              <span>Google Business Profile completeness audit (13 checkpoints)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-0.5">✓</span>
              <span>Review platform coverage — are you on the right directories?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-0.5">✓</span>
              <span>Review request workflow — do you have an automated system?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-0.5">✓</span>
              <span>Competitor reputation comparison matrix</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-0.5">✓</span>
              <span>Priority action plan — what to fix this week vs this month</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-600 font-bold mt-0.5">✓</span>
              <span>Printable PDF — take it to your team meeting</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border-2 border-accent-400 bg-gradient-to-b from-accent-50 to-white p-8 shadow-md text-center mb-10">
          <p className="text-sm text-gray-500 mb-2">Instant digital download</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">£27</p>
          <p className="text-sm text-gray-500 mb-6">One-time payment · Lifetime access</p>
          <a
            href="https://buy.stripe.com/YOUR_STRIPE_LINK"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-brand-600 px-10 py-4 text-lg font-bold text-white hover:bg-brand-700 transition-colors shadow-lg"
          >
            Buy Now — Instant Download →
          </a>
          <p className="text-xs text-gray-400 mt-3">30-day money-back guarantee · No questions asked</p>
        </div>

        <div className="text-sm text-gray-500 space-y-2">
          <h3 className="font-semibold text-gray-900">Frequently Asked Questions</h3>
          <div>
            <p className="font-medium text-gray-900">How do I get the PDF after purchase?</p>
            <p>Immediately after payment you&apos;ll be redirected to a download page. We&apos;ll also email you a copy.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Is this suitable for multi-location businesses?</p>
            <p>Yes — the checklist includes a separate column for each location so you can audit them side by side.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Can I get a refund?</p>
            <p>Absolutely. If the checklist doesn&apos;t help, email affiliates@localflowhub.com within 30 days for a full refund.</p>
          </div>
        </div>
      </article>
    </div>
  );
}
