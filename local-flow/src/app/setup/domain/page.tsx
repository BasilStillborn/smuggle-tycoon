"use client";

import type { Metadata } from "next";
import { useState, useCallback } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

const PROVIDERS: Record<string, { name: string; docs: string }> = {
  vercel: { name: "Vercel", docs: "https://vercel.com/docs/concepts/projects/domains" },
};

export default function DomainSetupPage() {
  const [domain, setDomain] = useState("");
  const [provider, setProvider] = useState("vercel");

  const handleDomainChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ""));
  }, []);

  const records = domain
    ? [
        {
          type: "A",
          name: "@",
          value: "76.76.21.21",
          ttl: "Auto",
          purpose: "Root domain → hosting IP",
        },
        {
          type: "CNAME",
          name: "www",
          value: "cname.vercel-dns.com",
          ttl: "Auto",
          purpose: "www subdomain → hosting",
        },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto container-padding py-8">
      <Breadcrumbs
        crumbs={[
          { label: "Setup", href: "/setup" },
          { label: "Domain Configuration" },
        ]}
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Domain Configuration</h1>
      <p className="text-gray-600 mb-8">
        Enter your domain and select your registrar to generate DNS setup instructions.
      </p>

      <div className="space-y-8">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. Enter Your Domain</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={domain}
              onChange={handleDomainChange}
              placeholder="yourlocalbusiness.com"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {Object.entries(PROVIDERS).map(([key, p]) => (
                <option key={key} value={key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {domain && (
          <>
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                2. DNS Records — Add These to {PROVIDERS[provider].name}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Copy and paste these records into your {PROVIDERS[provider].name} DNS settings.
              </p>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Value</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">TTL</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 hidden sm:table-cell">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((r, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 font-mono">
                            {r.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-900">{r.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-900 break-all">{r.value}</td>
                        <td className="px-4 py-3 text-gray-600">{r.ttl}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs hidden sm:table-cell">{r.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const text = records
                      .map((r) => `${r.type}\t${r.name}\t${r.value}\t${r.ttl}`)
                      .join("\n");
                    navigator.clipboard.writeText(text);
                  }}
                  className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  Copy DNS Records
                </button>
                <a
                  href={PROVIDERS[provider].docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {PROVIDERS[provider].name} DNS Guide →
                </a>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                3. Environment Variable
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Add this to your <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> file:
              </p>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-x-auto">
{`NEXT_PUBLIC_SITE_URL=https://${domain}`}
              </pre>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
