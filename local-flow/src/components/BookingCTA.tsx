export default function BookingCTA() {
  return (
    <div className="my-12 rounded-xl border-2 border-brand-200 bg-white p-6 sm:p-10 shadow-md text-center">
      <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📞</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        Need Help Implementing This?
      </h2>
      <p className="text-gray-600 max-w-lg mx-auto mb-6 text-base sm:text-lg">
        Not sure which tools fit your business or how to set them up? Book a 30-minute strategy call — I&apos;ll walk you through exactly what to use and how to connect everything.
      </p>
      <a
        href="https://calendly.com/YOUR_USERNAME/strategy-call"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-lg bg-brand-600 px-8 py-4 text-base font-bold text-white hover:bg-brand-700 transition-colors shadow-md hover:shadow-lg"
      >
        Book a Strategy Call →
      </a>
      <p className="text-xs text-gray-400 mt-4">
        30 min · £97 · Money-back guarantee
      </p>
    </div>
  );
}
