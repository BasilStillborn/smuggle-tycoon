import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - Prompt Blueprint Forge",
  description: "Terms and conditions governing the use of the Prompt Blueprint Forge marketplace.",
};

export default function TosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-8">
        <Link href="/" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">&larr; Back to Home</Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-(--muted) mb-8">Last updated: May 14, 2026</p>

      <div className="prose prose-sm prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-(--muted) leading-relaxed">
            By accessing or using Prompt Blueprint Forge ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you must not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Definitions</h2>
          <ul className="list-disc pl-5 text-(--muted) space-y-1">
            <li><strong>Blueprint</strong>: A structured AI prompt chain or workflow submitted to the marketplace.</li>
            <li><strong>Buyer</strong>: A user who purchases a license to use a Blueprint.</li>
            <li><strong>Creator/Seller</strong>: A user who submits and sells Blueprints on the Platform.</li>
            <li><strong>Platform Commission</strong>: The 20% fee retained by PromptForge on each sale.</li>
            <li><strong>Pending Review</strong>: The status of a newly submitted Blueprint awaiting admin approval.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Ownership and Intellectual Property</h2>
          <h3 className="text-lg font-medium mb-2">3.1 Blueprint Content Ownership</h3>
          <p className="text-(--muted) leading-relaxed">
            The Creator retains full ownership of the prompt text, chain-of-thought logic, and workflow structure they submit. By listing a Blueprint on the Platform, the Creator grants PromptForge a non-exclusive, worldwide, royalty-free license to display, market, and distribute the Blueprint through the marketplace.
          </p>
          <h3 className="text-lg font-medium mb-2 mt-4">3.2 Buyer License</h3>
          <p className="text-(--muted) leading-relaxed">
            Upon purchase, the Buyer receives a non-exclusive, non-transferable, perpetual license to use the Blueprint for personal or commercial purposes. The Buyer may NOT resell, redistribute, or sublicense the Blueprint or its derivatives on any competing marketplace.
          </p>
          <h3 className="text-lg font-medium mb-2 mt-4">3.3 Platform Ownership</h3>
          <p className="text-(--muted) leading-relaxed">
            PromptForge retains all rights to the platform software, branding, analytics data, and aggregated marketplace statistics. Individual user data is governed by our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Creator Obligations</h2>
          <ul className="list-disc pl-5 text-(--muted) space-y-1">
            <li>All submitted Blueprints must be original work or properly licensed for resale.</li>
            <li>Blueprints must not contain malicious code, data theft instructions, or content violating applicable laws.</li>
            <li>Creators must accurately describe their Blueprint&apos;s capabilities, limitations, and compatible models.</li>
            <li>Creators may not game the rating system through fake accounts or coordinated reviews.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Buyer Obligations</h2>
          <ul className="list-disc pl-5 text-(--muted) space-y-1">
            <li>Buyers must not reverse-engineer Blueprints for the purpose of reproducing them on other platforms.</li>
            <li>Buyers must not use purchased Blueprints to train competing AI models or prompt marketplaces.</li>
            <li>Buyers are responsible for ensuring their use of any Blueprint complies with the terms of their AI model provider.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Platform Commission and Payouts</h2>
          <p className="text-(--muted) leading-relaxed">
            PromptForge retains a 20% commission on all sales. The remaining 80% is credited to the Creator&apos;s account as a pending payout. Payouts are processed on a monthly basis for balances exceeding $10.00. PromptForge reserves the right to adjust the commission rate with 30 days advance notice to Creators.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Prohibited Activities</h2>
          <ul className="list-disc pl-5 text-(--muted) space-y-1">
            <li>Manipulating search rankings through keyword stuffing or misleading tags.</li>
            <li>Submitting AI-generated content that violates third-party copyrights.</li>
            <li>Using the platform for money laundering, fraud, or any illegal activity.</li>
            <li>Harassing other users, including creators, buyers, or administrators.</li>
            <li>Attempting to bypass the platform to transact directly with buyers/sellers.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
          <p className="text-(--muted) leading-relaxed">
            PromptForge reserves the right to suspend or terminate accounts that violate these terms. Upon termination, pending payouts will be processed for legitimate sales up to the date of termination. Buyers retain access to Blueprints purchased prior to account termination.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
          <p className="text-(--muted) leading-relaxed">
            PromptForge provides the platform &quot;as is&quot; without warranties of merchantability or fitness for a particular purpose. In no event shall PromptForge be liable for indirect, incidental, or consequential damages arising from the use of the platform or any Blueprint purchased through it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Dispute Resolution</h2>
          <p className="text-(--muted) leading-relaxed">
            Disputes between buyers and creators should first be resolved through the platform&apos;s internal resolution system. If unresolved, disputes may be submitted to binding arbitration in accordance with the laws of the State of Delaware.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
          <p className="text-(--muted) leading-relaxed">
            PromptForge may update these terms at any time. Material changes will be communicated via email and platform notification. Continued use after changes constitutes acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  );
}
