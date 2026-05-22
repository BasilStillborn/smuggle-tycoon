import type { Tool } from "@/lib/content";

export default function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <div className="my-10">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Tools Mentioned in This Guide</h2>
      <p className="text-sm text-gray-600 mb-6">
        Each tool below has a free plan or trial. Click through to see if it fits your workflow.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm flex-shrink-0">
                {tool.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{tool.name}</h3>
                <span className="text-xs text-gray-500">★ {tool.rating}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">
              {tool.tagline}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-500">{tool.pricing}</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500 capitalize">{tool.difficulty}</span>
            </div>
            <div className="mt-auto">
              <a
                href={tool.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
              >
                Try {tool.name} →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
