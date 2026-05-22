const steps = [
  {
    step: "1",
    title: "Browse & Discover",
    desc: "Explore our curated marketplace of premium AI prompt chains. Filter by category, difficulty, or price to find exactly what you need.",
    icon: "🔍",
  },
  {
    step: "2",
    title: "Purchase & Download",
    desc: "Secure checkout with instant access. Every blueprint includes detailed documentation, example outputs, and ready-to-use prompt chains.",
    icon: "📥",
  },
  {
    step: "3",
    title: "Implement & Iterate",
    desc: "Copy, customize, and deploy in your workflow. Each blueprint is battle-tested by our community of prompt engineers.",
    icon: "⚡",
  },
  {
    step: "4",
    title: "Earn as a Creator",
    desc: "Share your expertise. List your own blueprints, earn 80% of every sale, and build your reputation in the community.",
    icon: "💰",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-(--muted) text-sm max-w-xl mx-auto">
            From discovery to deployment — get started in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="relative text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{s.icon}</span>
              </div>
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                {s.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-(--muted) leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
