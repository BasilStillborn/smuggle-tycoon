import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolShowcaseHub from "@/components/ToolShowcaseHub";
import CTABanner from "@/components/CTABanner";
import { getGuideBySlug, getAllGuides, getRelatedTools } from "@/lib/content";
import { linkifyBody } from "@/lib/linkifyBody";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.meta.description,
    keywords: guide.meta.keywords?.join(", "),
  };
}

export default function GuideDetailPage({ params }: Props) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  const relatedTools = getRelatedTools(guide.related_tools);

  return (
    <div className="max-w-3xl mx-auto container-padding py-8">
      <Breadcrumbs
        crumbs={[
          { label: "Guides", href: "/guides" },
          { label: guide.title },
        ]}
      />

      <article>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 capitalize">
            {guide.category}
          </span>
          <span>{guide.read_time}</span>
          <span>{guide.difficulty}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">{guide.title}</h1>

        {"body" in guide && guide.body ? (
          <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: linkifyBody(guide.body, relatedTools) }} />
        ) : (
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed">{guide.meta.description}</p>

            <h2>Why This Matters</h2>
            <p>
              If you&apos;re a local business owner, your time is literally money. Every hour you spend on manual
              admin is an hour you could be serving clients, growing your business, or — let&apos;s be honest —
              taking a break. This guide walks you through a specific automation workflow that will save you
              hours every week.
            </p>

            <h2>What You&apos;ll Need</h2>
            <p>The following tools are used in this workflow. Each one has a free plan or free trial:</p>

            <h2>Step-by-Step Workflow</h2>
            <p>
              [CLIENT ACTION REQUIRED: Replace this section with your unique workflow steps.
              Describe exactly how to set up the automation, including screenshots and specific settings.]
            </p>

            <h3>Step 1: Set up your account</h3>
            <p>
              Sign up for the tools listed above. Most offer free plans, so you can test before committing.
            </p>

            <h3>Step 2: Connect the tools</h3>
            <p>
              Follow the integration steps to connect your tools. This usually involves copying an API key
              from one tool and pasting it into another.
            </p>

            <h3>Step 3: Test the workflow</h3>
            <p>
              Run a test to make sure everything works. For example, submit a test form and check that the
              data appears in your CRM or spreadsheet correctly.
            </p>

            <h3>Step 4: Go live</h3>
            <p>
              Once you&apos;ve confirmed the workflow works, switch it on for real clients. Monitor it for
              the first few days, then enjoy the time savings.
            </p>
          </div>
        )}

        {relatedTools.length > 0 && <ToolShowcaseHub tools={relatedTools} />}

        {/* Ad slot */}
        <div className="my-8 min-h-[90px] flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
          Ad Slot — Google AdSense
        </div>

        {/* Bottom lead magnet */}
        <div className="mt-10">
          <CTABanner />
        </div>
      </article>
    </div>
  );
}
