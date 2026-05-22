"use client";

import type { Tool } from "@/lib/content";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
};

export default function ToolCard({ tool, onSelect }: { tool: Tool; onSelect: (tool: Tool) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool)}
      className="group block w-full text-left rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-brand-600 capitalize">
              {tool.category.replace("-", " ")}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                difficultyColors[tool.difficulty] || "bg-gray-100 text-gray-800"
              }`}
            >
              {tool.difficulty}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
            {tool.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{tool.tagline}</p>
        </div>
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg">
          {tool.name.charAt(0)}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span>★ {tool.rating}</span>
        <span>{tool.pricing}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tool.best_for.slice(0, 3).map((b) => (
          <span
            key={b}
            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
          >
            {b}
          </span>
        ))}
      </div>
    </button>
  );
}
