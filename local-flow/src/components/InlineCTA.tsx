import type { Tool } from "@/lib/content";

export default function InlineCTA({ tool, label }: { tool: Tool; label?: string }) {
  return (
    <div className="my-8 rounded-lg border-2 border-brand-200 bg-brand-50 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            Ready to save time? Try {tool.name}.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Start free — no credit card required.
          </p>
        </div>
        <a
          href={tool.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
        >
          {label || tool.cta_text}
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
