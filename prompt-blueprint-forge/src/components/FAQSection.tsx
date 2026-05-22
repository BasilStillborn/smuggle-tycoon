"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What are AI prompt blueprints?",
    a: "Prompt blueprints are structured, pre-built prompt chains designed for specific AI tasks. Think of them as templates that combine multiple prompts, parameters, and best practices into a ready-to-use package. Each blueprint includes detailed instructions, example outputs, and customization guidance.",
  },
  {
    q: "How do purchases work?",
    a: "Add blueprints to your cart, checkout securely via our payment processor, and get instant access. Your purchases live in your dashboard forever — download anytime. Every transaction includes a 20% platform fee that supports marketplace operations and creator payouts.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We offer a 30-day satisfaction guarantee on all blueprints. If a blueprint doesn't meet its described functionality, contact our support team and we'll make it right. Digital goods are non-refundable after 30 days per our refund policy.",
  },
  {
    q: "How do I become a creator?",
    a: "Sign up, submit your blueprint through our Create page, and our admin team will review it within 24-48 hours. Approved blueprints are listed in the marketplace. You earn 80% of every sale, with payouts processed monthly for balances over $10.",
  },
  {
    q: "Are there subscription plans?",
    a: "Yes! Basic ($9.99/mo) gives you marketplace access and purchases. Pro ($19.99/mo) adds early access, priority support, and creator analytics. Enterprise ($49.99/mo) includes team accounts, API access, and custom blueprint requests.",
  },
  {
    q: "How are payouts handled for creators?",
    a: "Payouts are processed monthly via Stripe Connect for balances exceeding $10. Your earnings accumulate from blueprint sales. Connect your Stripe account through your dashboard to receive payments directly to your bank account.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-(--muted) text-sm">
            Everything you need to know about Prompt Blueprint Forge
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-(--border) bg-(--card) overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-(--card-hover) transition-colors"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <svg
                  className={`w-4 h-4 text-(--muted) shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-sm text-(--muted) leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
