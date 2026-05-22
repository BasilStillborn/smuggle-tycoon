import type { Tool } from "@/lib/content";

export default function ToolShowcaseHub({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;

  const toolCount = tools.length;

  return (
    <div className="my-12 rounded-xl border-2 border-brand-200 bg-white p-6 sm:p-10 shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Tool Options for This Solution
        </h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-base sm:text-lg">
          Each tool below has a free plan or trial. Click to see if it fits your workflow.
        </p>
      </div>

      <div className="space-y-4">
        {tools.map((tool, index) => (
          <div
            key={tool.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6"
          >
            <div className="flex-1 min-w-0 mb-4 sm:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-600 text-white text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <h3 className="text-lg font-bold text-gray-900">{tool.name}</h3>
                <span className="text-sm text-gray-500">★ {tool.rating}</span>
              </div>
              <p className="text-sm text-gray-600 ml-9">{tool.tagline}</p>
            </div>
            <a
              href={tool.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full sm:w-auto text-center rounded-lg bg-brand-600 px-8 py-3.5 text-base font-bold text-white hover:bg-brand-700 active:bg-brand-800 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              {tool.cta_text || `Try ${tool.name}`} →
            </a>
          </div>
        ))}
      </div>

      {toolCount > 1 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          These tools work great together — most integrate directly with each other.
        </p>
      )}
    </div>
  );
}
