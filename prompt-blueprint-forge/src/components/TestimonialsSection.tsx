const testimonials = [
  {
    quote: "Prompt Blueprint Forge completely changed how I approach AI prompt engineering. The structured blueprints save me hours of trial and error.",
    name: "David Kim",
    role: "AI Engineer",
    avatar: "DK",
    rating: 5,
  },
  {
    quote: "I've earned over $3,000 selling my prompt chains. The platform handles everything — payments, payouts, and customer support.",
    name: "Jessica Liu",
    role: "Prompt Architect",
    avatar: "JL",
    rating: 5,
  },
  {
    quote: "The quality of blueprints here is outstanding. Every purchase has been worth it. My team's productivity has doubled.",
    name: "Marcus Thompson",
    role: "Tech Lead at DataFlow",
    avatar: "MT",
    rating: 5,
  },
  {
    quote: "As a beginner, I was intimidated by prompt engineering. The blueprints here made it accessible. Now I'm creating my own!",
    name: "Aisha Patel",
    role: "Product Manager",
    avatar: "AP",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Trusted by <span className="gradient-text">Thousands</span> of Creators & Buyers
          </h2>
          <p className="text-(--muted) text-sm max-w-xl mx-auto">
            Join a thriving community of AI practitioners using Prompt Blueprint Forge
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-(--border) bg-(--card) hover:border-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-(--muted) mb-4 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-(--muted)">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
