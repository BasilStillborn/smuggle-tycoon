import Link from "next/link";
import TrustBar from "@/components/TrustBar";
import CTABanner from "@/components/CTABanner";
import HeroButtons from "@/components/HeroButtons";
import { getAllCategories, getAllTools } from "@/lib/content";

export default function HomePage() {
  const categories = getAllCategories();
  const popularTools = getAllTools().slice(0, 6);

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-6xl mx-auto container-padding py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Stop Wasting Time on
            <span className="text-brand-600"> Manual Marketing</span>.
            <br />
            Automate in 10 Minutes.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Step-by-step automation guides built for busy local business owners.
            No technical skills required. Save 10+ hours a week.
          </p>
          <HeroButtons />
        </div>
      </section>

      <TrustBar />

      <section className="max-w-6xl mx-auto container-padding py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Browse by Category
        </h2>
        <p className="text-gray-600 mb-8">
          Find the right automation tools for your specific business needs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/tools?category=${cat.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-brand-200 transition-all"
            >
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
              <p className="text-xs text-brand-600 mt-2 font-medium">
                {cat.count} tools →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto container-padding py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Most Popular Tools
          </h2>
          <p className="text-gray-600 mb-8">
            Start with the tools local business owners love most.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md hover:border-brand-200 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold">
                    {tool.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {tool.name}
                    </h3>
                    <span className="text-xs text-gray-500 capitalize">
                      {tool.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{tool.tagline}</p>
                <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                  <span>★ {tool.rating}</span>
                  <span>{tool.pricing}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/tools"
              className="inline-flex items-center text-brand-600 font-semibold hover:text-brand-700"
            >
              View All 20 Tools →
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto container-padding py-16">
        <CTABanner />
      </section>
    </>
  );
}
