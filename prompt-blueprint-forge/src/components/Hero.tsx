import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-transparent" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            The AI Prompt Marketplace
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            <span className="gradient-text">Forge</span> the Perfect Prompt
            <br />
            <span className="text-(--foreground)">Chain by Chain</span>
          </h1>

          <p className="text-lg sm:text-xl text-(--muted) max-w-2xl mx-auto mb-10 animate-slide-up stagger-2 leading-relaxed">
            Discover, buy, and sell premium AI prompt chains and blueprints.
            From content generation to code architecture — build better AI
            interactions with structured, battle-tested prompts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.97]"
            >
              Explore Blueprints
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-(--border) hover:border-indigo-500/50 text-(--foreground) font-semibold transition-all hover:bg-(--card-hover) active:scale-[0.97]"
            >
              Start Selling
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
