import { getFeaturedBlueprints } from "@/lib/data";
import { BlueprintCard } from "./BlueprintCard";

export function FeaturedBlueprints() {
  const blueprints = getFeaturedBlueprints();

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Featured <span className="gradient-text">Blueprints</span>
            </h2>
            <p className="text-(--muted) text-sm">
              Top-rated prompt chains from our community of creators
            </p>
          </div>
          <a
            href="/marketplace"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {blueprints.slice(0, 4).map((bp, i) => (
            <div key={bp.id} className={`animate-slide-up stagger-${i + 1}`}>
              <BlueprintCard blueprint={bp} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
