import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAllGuides, getRelatedTools } from "@/lib/content";

export const metadata: Metadata = {
  title: "Automation Guides for Local Business Owners",
  description: "Step-by-step automation guides written for busy UK local business owners. Save time, reduce stress, and grow your business.",
};

export default function GuidesPage() {
  const guides = getAllGuides();

  return (
    <div className="max-w-4xl mx-auto container-padding py-8">
      <Breadcrumbs crumbs={[{ label: "Guides" }]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Guides</h1>
      <p className="text-gray-600 mb-8">
        Step-by-step workflows to automate the boring stuff. Each guide takes less than 30 minutes to set up.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => {
          const relatedTools = getRelatedTools(guide.related_tools);
          return (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md hover:border-brand-200 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 capitalize">
                  {guide.category}
                </span>
                <span className="text-xs text-gray-400">{guide.read_time}</span>
                <span className="text-xs text-gray-400">{guide.difficulty}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {guide.title}
              </h2>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {guide.meta.description}
              </p>
              {relatedTools.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {relatedTools.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
