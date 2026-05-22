import { Hero } from "@/components/Hero";
import { StatsSection } from "@/components/StatsSection";
import { FeaturedBlueprints } from "@/components/FeaturedBlueprints";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQSection } from "@/components/FAQSection";
import { CategoryCard } from "@/components/CategoryCard";
import { getCategories } from "@/lib/data";

export default function HomePage() {
  const categories = getCategories();

  return (
    <>
      <Hero />
      <StatsSection />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Browse by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-(--muted) text-sm">
              Find exactly what you need from our curated categories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <div key={cat.id} className={`animate-slide-up stagger-${i + 1}`}>
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedBlueprints />
      <HowItWorks />
      <TestimonialsSection />

      <section className="py-16 sm:py-20 bg-gradient-to-b from-indigo-500/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Share Your <span className="gradient-text">Blueprints</span>?
          </h2>
          <p className="text-(--muted) mb-8 max-w-xl mx-auto">
            Join hundreds of creators earning revenue from their prompt engineering expertise.
            List your blueprint in minutes and reach thousands of AI practitioners.
          </p>
          <a
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.97]"
          >
            Start Selling
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </a>
        </div>
      </section>

      <FAQSection />
    </>
  );
}
