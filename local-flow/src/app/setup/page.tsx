import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Setup & Configuration",
  description: "Configure your LocalFlow site — domain, analytics, email integration, and more.",
  robots: { index: false, follow: false },
};

export default function SetupPage() {
  const integrations = [
    {
      name: "Google Analytics",
      key: "NEXT_PUBLIC_GA_ID",
      value: process.env.NEXT_PUBLIC_GA_ID || "",
      docs: "https://support.google.com/analytics/answer/9304153",
      status: process.env.NEXT_PUBLIC_GA_ID && !process.env.NEXT_PUBLIC_GA_ID.startsWith("YOUR_") ? "connected" : "disconnected",
    },
    {
      name: "Mailchimp API Key",
      key: "MAILCHIMP_API_KEY",
      value: process.env.MAILCHIMP_API_KEY || "",
      docs: "https://mailchimp.com/help/about-api-keys/",
      status: process.env.MAILCHIMP_API_KEY && !process.env.MAILCHIMP_API_KEY.startsWith("YOUR_") ? "connected" : "disconnected",
    },
    {
      name: "Mailchimp Audience ID",
      key: "MAILCHIMP_LIST_ID",
      value: process.env.MAILCHIMP_LIST_ID || "",
      docs: "https://mailchimp.com/help/find-audience-id/",
      status: process.env.MAILCHIMP_LIST_ID && !process.env.MAILCHIMP_LIST_ID.startsWith("YOUR_") ? "connected" : "disconnected",
    },
    {
      name: "Google Sheets API Key",
      key: "GOOGLE_SHEETS_API_KEY",
      value: process.env.GOOGLE_SHEETS_API_KEY || "",
      docs: "https://console.cloud.google.com/apis/credentials",
      status: process.env.GOOGLE_SHEETS_API_KEY && !process.env.GOOGLE_SHEETS_API_KEY.startsWith("YOUR_") ? "connected" : "disconnected",
    },
    {
      name: "Site URL (Canonical)",
      key: "NEXT_PUBLIC_SITE_URL",
      value: process.env.NEXT_PUBLIC_SITE_URL || "https://localflowhub.com",
      docs: "",
      status: "info",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto container-padding py-8">
      <Breadcrumbs crumbs={[{ label: "Setup & Configuration" }]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup & Configuration</h1>
      <p className="text-gray-600 mb-8">
        Configure external services and view status of all integrations.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Domain & Deployment</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-600 mb-4">
              Configure your custom domain and view DNS setup instructions.
            </p>
            <Link
              href="/setup/domain"
              className="inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Configure Domain →
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">External Integrations</h2>
          <div className="space-y-3">
            {integrations.map((int) => (
              <div
                key={int.key}
                className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{int.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {int.key}
                  </p>
                  {int.docs && (
                    <a
                      href={int.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:text-brand-700 mt-1 inline-block"
                    >
                      Get API Key →
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      int.status === "connected"
                        ? "bg-green-100 text-green-800"
                        : int.status === "info"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {int.status === "connected" ? "Connected" : int.status === "info" ? "Info" : "Disconnected"}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {int.value
                      ? int.value.substring(0, 20) + (int.value.length > 20 ? "..." : "")
                      : "Not set"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Configure</h2>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm text-gray-700 mb-3">
              Create a <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> file in the project root and add your keys:
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto font-mono">
{`# Required (no default)
NEXT_PUBLIC_SITE_URL=https://localflowhub.com

# Analytics (optional — leave empty to disable)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Email Capture (optional — leave empty to disable)
MAILCHIMP_API_KEY=your-api-key-us1
MAILCHIMP_LIST_ID=your-audience-id

# Data (optional — leave empty to disable)
GOOGLE_SHEETS_API_KEY=your-google-api-key`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
