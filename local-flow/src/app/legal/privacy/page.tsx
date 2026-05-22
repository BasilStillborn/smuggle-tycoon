import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "LocalFlow privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localflowhub.com";

  return (
    <div className="max-w-3xl mx-auto container-padding py-8">
      <Breadcrumbs crumbs={[{ label: "Privacy Policy" }]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
          <p>
            Welcome to LocalFlow (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are committed to
            protecting your personal data and your privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you visit our website at{" "}
            <a href={siteUrl} className="text-brand-600 hover:text-brand-700">{siteUrl}</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Personal Data:</strong> Name, email address, and business information you provide via our forms or email capture.</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, referral source, and device information collected via cookies and analytics tools.</li>
            <li><strong>Communication Data:</strong> Any information you provide when contacting us.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. Google Analytics</h2>
          <p>
            We use Google Analytics to understand how visitors interact with our site. Google Analytics collects
            information such as how often users visit, what pages they visit, and what other sites they used prior
            to visiting. We use the information to improve our content and user experience.
          </p>
          <p>Google Analytics collects your IP address on our behalf. Google&apos;s ability to use and share information collected by Google Analytics is restricted by the{" "}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
              Google Analytics Terms of Service
            </a>{" "}
            and the{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
              Google Privacy Policy
            </a>.
          </p>
          <p>
            You can opt out of Google Analytics by installing the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and maintain our website and services</li>
            <li>Send you the free resources you request (e.g., checklists, guides)</li>
            <li>Improve our content based on user behaviour</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our site and store certain
            information. Cookies are files with a small amount of data which may include an anonymous unique
            identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share your data with trusted third-party service providers
            who assist us in operating our website (e.g., email marketing platforms, analytics providers), subject
            to confidentiality agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">7. Your Rights</h2>
          <p>Under UK data protection law, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:privacy@localflowhub.com" className="text-brand-600 hover:text-brand-700">privacy@localflowhub.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">8. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@localflowhub.com" className="text-brand-600 hover:text-brand-700">privacy@localflowhub.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
