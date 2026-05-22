"use client";

export default function CTABanner() {
  return (
    <div className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-800 p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">
          Download The Ultimate Starter Checklist
        </h2>
        <p className="text-brand-100 mb-6">
          7 automated workflows you can set up this weekend. Free PDF — no spam, ever.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            placeholder="Enter your best email..."
            className="flex-1 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white hover:bg-accent-600 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent-300"
          >
            Send It →
          </button>
        </form>
        <p className="text-xs text-brand-200 mt-3">
          Join 2,000+ local business owners automating their workflow.
        </p>
      </div>
    </div>
  );
}
