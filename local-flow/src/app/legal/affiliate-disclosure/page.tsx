import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "LocalFlow affiliate disclosure — how we earn commissions from tool recommendations.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto container-padding py-8">
      <Breadcrumbs crumbs={[{ label: "Legal" }, { label: "Affiliate Disclosure" }]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Affiliate Disclosure</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">What Are Affiliate Links?</h2>
          <p>
            Some of the links on LocalFlow are affiliate links. This means that if you click on a link and make a
            purchase, we may earn a commission at no additional cost to you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Our Commitment to You</h2>
          <p>
            We only recommend tools and services that we have researched, tested, and genuinely believe will help
            local business owners automate their marketing. Our recommendations are based on merit, not on
            commission rates.
          </p>
          <p>
            <strong>We never recommend a product just for the commission.</strong> If a tool doesn&apos;t meet our
            standards, we won&apos;t list it — regardless of any affiliate relationship.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">How It Works</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>You click an affiliate link on our site</li>
            <li>You visit the tool&apos;s website and sign up or make a purchase</li>
            <li>The tool provider pays us a small commission (typically 20–30% of the referral value)</li>
            <li>You pay the same price as you would by visiting the site directly</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Transparency</h2>
          <p>
            We clearly mark affiliate links throughout the site. Look for phrases like &ldquo;Try [Tool] Free&rdquo;
            or &ldquo;Visit [Tool] Website&rdquo; — these are typically affiliate links.
          </p>
          <p>
            Our footer and tool detail pages include a notice: &ldquo;We earn from qualifying purchases via
            affiliate links.&rdquo;
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Questions?</h2>
          <p>
            If you have any questions about our affiliate relationships, please contact us at{" "}
            <a href="mailto:affiliates@localflowhub.com" className="text-brand-600 hover:text-brand-700">affiliates@localflowhub.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
