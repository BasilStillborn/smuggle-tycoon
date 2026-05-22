export default function TrustBar() {
  const testimonials = [
    { text: "Saved 6 hours a week on social media", name: "— Sarah, Florist" },
    { text: "Finally understand how to automate follow-ups", name: "— Mike, Realtor" },
    { text: "My clients book themselves now, no back-and-forth", name: "— Jenna, Coach" },
  ];

  return (
    <div className="border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 justify-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Trusted by
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-brand-600">200+</span>
            <span className="text-sm text-gray-600">local businesses</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-yellow-400">★★★★★</span>
            <span className="text-sm text-gray-600">4.8 avg. rating</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {testimonials.map((t, i) => (
            <div key={i} className="text-center text-sm text-gray-600 italic">
              &ldquo;{t.text}&rdquo;
              <span className="block not-italic text-gray-500 mt-0.5">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
