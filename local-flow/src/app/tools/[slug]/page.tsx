import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ComparisonTable from "@/components/ComparisonTable";
import InlineCTA from "@/components/InlineCTA";
import CTABanner from "@/components/CTABanner";
import { getToolBySlug, getAllTools, getCategoryById } from "@/lib/content";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return {
    title: `${tool.name} Review & Setup Guide for Local Businesses`,
    description: `${tool.tagline}. Read our hands-on review, compare pricing, and get step-by-step setup instructions. Perfect for ${tool.best_for.slice(0, 2).join(" and ")}.`,
    openGraph: {
      title: `${tool.name} Review — Is It Right for Your Business?`,
      description: tool.tagline,
    },
  };
}

export default function ToolDetailPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const allTools = getAllTools();
  const competitors = allTools
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 3);
  const category = getCategoryById(tool.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tool.name,
    description: tool.tagline,
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: tool.rating,
        bestRating: "5",
      },
    },
    offers: {
      "@type": "Offer",
      price: tool.pricing,
      priceCurrency: "USD",
    },
    category: category?.name || tool.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto container-padding py-8">
        <Breadcrumbs
          crumbs={[
            { label: "All Tools", href: "/tools" },
            ...(category ? [{ label: category.name, href: `/tools?category=${category.slug}` }] : []),
            { label: tool.name },
          ]}
        />

        {/* HERO SECTION */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          <div className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-2xl flex-shrink-0">
            {tool.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-brand-600 capitalize">
                {category?.name || tool.category}
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{tool.difficulty}</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">★ {tool.rating} ({tool.review_count.toLocaleString()} reviews)</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{tool.tagline}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{tool.pricing}</span>
              <span>·</span>
              <span>Best for: {tool.best_for.join(", ")}</span>
            </div>
          </div>
        </div>

        {/* CTA #1 — PRIMARY AFFILIATE BUTTON */}
        <div className="mb-10">
          <a
            href={tool.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl bg-brand-600 px-8 py-4 text-lg font-bold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Try {tool.name} {tool.pricing.includes("Free") ? "Free" : " — Start Your Trial"}
            <svg className="ml-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <p className="text-xs text-gray-500 mt-2">
            {tool.pricing.includes("Free") ? "Free plan available" : "Free trial available"} · No credit card required · Affiliate link
          </p>
        </div>

        {/* MAIN DESCRIPTION */}
        <section className="prose prose-gray max-w-none mb-10">
          <h2>What Is {tool.name}?</h2>
          <p className="text-gray-700 leading-relaxed">{tool.description}</p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Local business owners choose {tool.name} because it solves a specific problem:
            {tool.best_for.length > 1
              ? ` whether you're a ${tool.best_for.slice(0, -1).join(", ")} or ${tool.best_for.slice(-1)}`
              : ` especially if you're a ${tool.best_for[0]}`}
            . The setup takes less than 30 minutes, and most users see results in the first week.
          </p>
        </section>

        {/* INLINE CTA #2 — IN-CONTEXT AFFILIATE */}
        <InlineCTA tool={tool} label={`Get Started with ${tool.name}`} />

        {/* PROS & CONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <h3 className="font-semibold text-green-800 mb-3">Pros</h3>
            <ul className="space-y-2">
              {tool.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-2 text-sm text-green-700">
                  <svg className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-800 mb-3">Cons</h3>
            <ul className="space-y-2">
              {tool.cons.map((con) => (
                <li key={con} className="flex items-start gap-2 text-sm text-red-700">
                  <svg className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {tool.name} vs Alternatives
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Not sure if {tool.name} is right? Here&apos;s how it stacks up against similar tools.
          </p>
          <ComparisonTable mainTool={tool} competitors={competitors} />

          {/* COMPETITOR AFFILIATE LINKS */}
          {competitors.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {competitors.map((c) => (
                <a
                  key={c.id}
                  href={c.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:border-brand-200 hover:text-brand-600 transition-colors"
                >
                  Try {c.name} →
                </a>
              ))}
            </div>
          )}
        </section>

        {/* FEATURES */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tool.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <svg className="h-5 w-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA #3 — LEAD MAGNET (BOTTOM) */}
        <section className="mb-10">
          <CTABanner />
        </section>

        {/* WHO IS THIS FOR */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Who Is {tool.name} For?</h2>
          <div className="flex flex-wrap gap-2">
            {tool.best_for.map((b) => (
              <span
                key={b}
                className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
              >
                {b}
              </span>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href={tool.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              Visit {tool.name} Website →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
