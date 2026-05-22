"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🛠️</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          It looks like our address system is having trouble today!
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Our website will be live at{" "}
          <a
            href="https://localflowhub.com"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            localflowhub.com
          </a>
          . Please check back in an hour or two.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
