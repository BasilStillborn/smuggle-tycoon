import type { Tool } from "@/lib/content";

export default function ComparisonTable({
  mainTool,
  competitors,
}: {
  mainTool: Tool;
  competitors: Tool[];
}) {
  const allTools = [mainTool, ...competitors];
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Feature</th>
            {allTools.map((t) => (
              <th
                key={t.id}
                className={`px-4 py-3 text-left font-semibold ${
                  t.id === mainTool.id ? "text-brand-600" : "text-gray-900"
                }`}
              >
                {t.id === mainTool.id && <span className="text-xs text-brand-500 font-normal block">OUR PICK</span>}
                {t.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="px-4 py-3 text-gray-600 font-medium">Pricing</td>
            {allTools.map((t) => (
              <td key={t.id} className="px-4 py-3 text-gray-900">{t.pricing}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-3 text-gray-600 font-medium">Difficulty</td>
            {allTools.map((t) => (
              <td key={t.id} className="px-4 py-3">{t.difficulty}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-3 text-gray-600 font-medium">Rating</td>
            {allTools.map((t) => (
              <td key={t.id} className="px-4 py-3">★ {t.rating}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-3 text-gray-600 font-medium">Best For</td>
            {allTools.map((t) => (
              <td key={t.id} className="px-4 py-3">{t.best_for.slice(0, 2).join(", ")}</td>
            ))}
          </tr>
          <tr>
            <td className="px-4 py-3 text-gray-600 font-medium">Key Features</td>
            {allTools.map((t) => (
              <td key={t.id} className="px-4 py-3">
                <ul className="space-y-1">
                  {t.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
