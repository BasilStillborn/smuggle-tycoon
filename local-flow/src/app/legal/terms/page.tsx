import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "LocalFlow terms of service — rules and guidelines for using our website.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto container-padding py-8">
      <Breadcrumbs crumbs={[{ label: "Terms of Service" }]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using LocalFlow, you agree to be bound by these Terms of Service. If you do not agree
            with any part of these terms, you must not use our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. Use of Service</h2>
          <p>You agree to use LocalFlow only for lawful purposes and in a way that does not infringe the rights of others.</p>
          <p>You must not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use our content for commercial resale without permission</li>
            <li>Attempt to gain unauthorised access to our systems</li>
            <li>Use automated bots to scrape or copy our content</li>
            <li>Misrepresent your affiliation with any tool or product we review</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. Affiliate Disclosure</h2>
          <p>
            LocalFlow participates in affiliate marketing programmes. We may earn commissions on purchases made
            through links on our site. This does not affect the price you pay or our editorial independence.
            See our full{" "}
            <a href="/legal/affiliate-disclosure" className="text-brand-600 hover:text-brand-700">Affiliate Disclosure</a>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Intellectual Property</h2>
          <p>
            All content on LocalFlow — including text, graphics, logos, and tool reviews — is our intellectual
            property unless otherwise stated. You may not reproduce, distribute, or create derivative works
            without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Limitation of Liability</h2>
          <p>
            LocalFlow provides information and tool recommendations for educational purposes. We make no
            guarantees about the accuracy, completeness, or suitability of any information on this site.
            We are not liable for any losses or damages arising from your use of third-party tools or services
            recommended on our site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Third-Party Links</h2>
          <p>
            Our website contains affiliate links to third-party websites. We are not responsible for the content,
            privacy policies, or practices of any third-party sites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon
            posting. Your continued use of the site after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">8. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of England and Wales.
            Any disputes relating to these terms shall be subject to the exclusive jurisdiction of the courts
            of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">9. Contact</h2>
          <p>
            For questions about these Terms of Service, contact us at{" "}
            <a href="mailto:legal@localflowhub.com" className="text-brand-600 hover:text-brand-700">legal@localflowhub.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
