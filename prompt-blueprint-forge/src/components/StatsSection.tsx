export function StatsSection() {
  const stats = [
    { value: "12,400+", label: "Blueprints Sold" },
    { value: "4.8", label: "Average Rating", suffix: "/5" },
    { value: "8,200+", label: "Happy Creators" },
    { value: "6", label: "Categories" },
  ];

  return (
    <section className="py-16 border-y border-(--border)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center animate-slide-up stagger-${i + 1}`}
            >
              <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                {stat.value}
                {stat.suffix && (
                  <span className="text-lg text-(--muted)">{stat.suffix}</span>
                )}
              </div>
              <div className="text-sm text-(--muted)">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
