import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center - Prompt Blueprint Forge",
  description: "Frequently asked questions and guides about using the Prompt Blueprint Forge marketplace.",
};

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create an account?",
        a: 'Click "Sign In" in the top-right corner and select "Create Account." You can register with your email address. Once registered, you can immediately browse the marketplace and purchase blueprints.',
      },
      {
        q: "What is a Blueprint?",
        a: 'A Blueprint is a structured AI prompt chain — a multi-step workflow designed to accomplish a specific task with an AI model. Unlike simple single prompts, Blueprints include chain-of-thought logic, variable templates, and output formatting instructions.',
      },
      {
        q: "How do I become a seller?",
        a: 'During registration, select "Creator" as your account type. Existing buyers can upgrade by contacting support. Creators can submit Blueprints through the "Create" page, which sends them to admin review before listing.',
      },
    ],
  },
  {
    category: "Buying",
    questions: [
      {
        q: "How do I purchase a Blueprint?",
        a: 'Browse the marketplace, add Blueprints to your cart, and proceed to checkout. Our checkout page shows a full fee breakdown including the 20% platform commission. Enter your payment details and confirm — access is granted immediately upon success.',
      },
      {
        q: "What payment methods are accepted?",
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express). Our payment processing is handled through a secure PCI-DSS compliant gateway.',
      },
      {
        q: "Can I get a refund?",
        a: 'Due to the digital nature of Blueprints, all sales are final. Exceptions may be made for Blueprints that are materially different from their description. See our <a href="/legal/refund" class="text-indigo-400 hover:underline">Refund Policy</a> for details.',
      },
      {
        q: "How do I access my purchased Blueprints?",
        a: 'Purchased Blueprints appear in your Dashboard under "Purchase History." Click any purchase to view the full Blueprint details, including the complete prompt chain and instructions.',
      },
    ],
  },
  {
    category: "Selling",
    questions: [
      {
        q: "How does the commission work?",
        a: 'PromptForge retains a 20% commission on each sale. When a Blueprint sells for $29.99, the platform fee is $6.00 and the creator receives $23.99. This is clearly displayed to buyers during checkout and to sellers in their payout records.',
      },
      {
        q: "What counts as a Blueprint?",
        a: 'A valid Blueprint must include a structured prompt chain (2+ steps), clear instructions for variables and customization, and documentation of compatible AI models. Single prompts without structure, or collections of unrelated prompts, will be rejected during review.',
      },
      {
        q: "How long does review take?",
        a: 'Most submissions are reviewed within 24-48 hours. You will receive a notification when your Blueprint is approved or rejected. If rejected, the review notes will explain why and how to improve.',
      },
      {
        q: "How do I appeal a rejected prompt?",
        a: 'If your Blueprint is rejected, review the admin notes in your Pending Submissions. Address the issues, resubmit, and it will enter the review queue again. For disputes about the review decision, contact <a href="mailto:appeals@promptforge.com" class="text-indigo-400 hover:underline">appeals@promptforge.com</a>.',
      },
      {
        q: "When do I get paid?",
        a: 'Payouts are processed monthly for balances exceeding $10.00. Your Dashboard shows pending payouts and estimated payout dates under the Listings tab.',
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "Which AI models are compatible?",
        a: 'Blueprints specify compatible models in their listing. Common models include GPT-4, Claude 3, Gemini Pro, and Llama 3. Check the "Model Compatibility" section on each Blueprint\'s detail page for the full list.',
      },
      {
        q: "Can I use Blueprints with any AI platform?",
        a: 'Most Blueprints are model-agnostic and can be adapted to different platforms. However, some may use model-specific features. Always check the compatible models listed before purchasing.',
      },
      {
        q: "What happens if the site goes down during checkout?",
        a: 'Our checkout system uses idempotency keys to prevent duplicate charges. If a transaction fails due to a network issue, your card will not be charged. You can safely retry the purchase.',
      },
    ],
  },
  {
    category: "Account & Billing",
    questions: [
      {
        q: "How do I change my account type?",
        a: 'Contact <a href="mailto:support@promptforge.com" class="text-indigo-400 hover:underline">support@promptforge.com</a> to request an account type change. Buyers can upgrade to creators after verifying their eligibility.',
      },
      {
        q: "How do I delete my account?",
        a: 'Go to your Dashboard and visit Account Settings. You can request account deletion there. Note that transaction records are retained for legal compliance even after account deletion.',
      },
      {
        q: "What subscription plans are available?",
        a: 'We offer three plans: Basic ($9.99/mo), Pro ($19.99/mo), and Enterprise ($49.99/mo). All plans can be managed from your Dashboard under the Subscription tab.',
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-8">
        <Link href="/" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">&larr; Back to Home</Link>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-(--muted) text-sm">Everything you need to know about using Prompt Blueprint Forge.</p>
      </div>

      <div className="space-y-10">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-(--border)">{section.category}</h2>
            <div className="space-y-4">
              {section.questions.map((faq, i) => (
                <details
                  key={i}
                  className="group p-4 rounded-xl border border-(--border) bg-(--card) open:border-indigo-500/30 open:bg-indigo-500/[0.02] transition-all"
                >
                  <summary className="flex items-center justify-between cursor-pointer text-sm font-medium list-none">
                    <span>{faq.q}</span>
                    <svg
                      className="w-4 h-4 text-(--muted) group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <p
                    className="mt-3 text-sm text-(--muted) leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: faq.a }}
                  />
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl border border-(--border) bg-(--card) text-center">
        <h3 className="font-semibold mb-1">Still have questions?</h3>
        <p className="text-sm text-(--muted) mb-4">Our support team is here to help.</p>
        <a
          href="mailto:support@promptforge.com"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
