import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Prompt Blueprint Forge",
  description: "How Prompt Blueprint Forge collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-8">
        <Link href="/" className="text-sm text-(--muted) hover:text-(--foreground) transition-colors">&larr; Back to Home</Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-(--muted) mb-8">Last updated: May 14, 2026</p>

      <div className="prose prose-sm prose-gray dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <h3 className="text-lg font-medium mb-2">1.1 Account Information</h3>
          <p className="text-(--muted) leading-relaxed">
            When you create an account, we collect your name, email address, and avatar image. This information is used to identify you on the platform and to communicate with you about your account, purchases, and submissions.
          </p>
          <h3 className="text-lg font-medium mb-2 mt-4">1.2 Transaction Data</h3>
          <p className="text-(--muted) leading-relaxed">
            We record all purchases, including blueprint IDs, amounts paid, platform fees, and timestamps. This data is used for financial reconciliation, creator payouts, and analytics. Payment card details are processed through our payment gateway and are never stored on our servers.
          </p>
          <h3 className="text-lg font-medium mb-2 mt-4">1.3 Usage Data</h3>
          <p className="text-(--muted) leading-relaxed">
            We collect anonymous usage statistics including page views, search queries, and interaction patterns to improve the marketplace experience. This data is aggregated and cannot be used to identify individual users.
          </p>
          <h3 className="text-lg font-medium mb-2 mt-4">1.4 Analytics Data</h3>
          <p className="text-(--muted) leading-relaxed">
            For creators, we provide analytics on sales performance, buyer trends, and revenue metrics. This data is derived from transaction records and is only visible to the respective creator and platform administrators.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc pl-5 text-(--muted) space-y-1">
            <li>To operate, maintain, and improve the marketplace platform.</li>
            <li>To process transactions and manage creator payouts.</li>
            <li>To communicate with you about your account, purchases, and submissions.</li>
            <li>To provide analytics and insights to creators about their listings.</li>
            <li>To detect, prevent, and address fraud, abuse, or violations of our Terms of Service.</li>
            <li>To comply with legal obligations and regulatory requirements.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Sharing and Disclosure</h2>
          <p className="text-(--muted) leading-relaxed">
            We do not sell your personal data to third parties. We may share data in the following circumstances:
          </p>
          <ul className="list-disc pl-5 text-(--muted) space-y-1 mt-2">
            <li><strong>With Creators:</strong> When you purchase a Blueprint, the creator receives your purchase information (not your email or personal details) for fulfillment purposes.</li>
            <li><strong>With Service Providers:</strong> We engage trusted third parties for payment processing, analytics, and infrastructure. These providers are contractually bound to protect your data.</li>
            <li><strong>Legal Compliance:</strong> We may disclose data if required by law, court order, or governmental regulation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Retention</h2>
          <p className="text-(--muted) leading-relaxed">
            We retain your account information for as long as your account is active. Transaction records are retained for a minimum of 7 years to comply with tax and financial regulations. Analytics data is retained indefinitely in aggregated form.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
          <p className="text-(--muted) leading-relaxed">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="list-disc pl-5 text-(--muted) space-y-1 mt-2">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data (subject to legal retention requirements).</li>
            <li>Object to or restrict certain processing activities.</li>
            <li>Request a portable copy of your data.</li>
            <li>Withdraw consent at any time, where processing is based on consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
          <p className="text-(--muted) leading-relaxed">
            We implement industry-standard security measures including encryption in transit (TLS 1.3), encrypted data storage, and regular security audits. Our payment processing is PCI-DSS compliant through our third-party payment provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
          <p className="text-(--muted) leading-relaxed">
            We use essential cookies for session management and authentication. We do not use third-party tracking cookies for advertising purposes. Analytics are collected using privacy-preserving methods that do not require cross-site tracking.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
          <p className="text-(--muted) leading-relaxed">
            For privacy-related inquiries, please contact our Data Protection Officer at <strong>privacy@promptforge.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
