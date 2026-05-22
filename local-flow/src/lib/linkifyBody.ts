import type { Tool } from "./content";

const MATCH_OVERRIDES: Record<string, string[]> = {
  "HubSpot CRM": ["HubSpot"],
  "Make (Integromat)": ["Integromat"],
};

function getPatterns(name: string): string[] {
  if (MATCH_OVERRIDES[name]) return MATCH_OVERRIDES[name];
  const first = name.split(/[\s(]/)[0];
  if (first && first !== name) return [name, first];
  return [name];
}

export function linkifyBody(html: string, tools: Tool[]): string {
  if (tools.length === 0) return html;

  const segments = html.split(/(<[^>]*>)/);

  return segments
    .map((segment, i) => {
      if (i % 2 === 1) return segment;

      let text = segment;
      for (const tool of tools) {
        const patterns = getPatterns(tool.name);
        let replaced = false;

        for (const pattern of patterns) {
          if (replaced) break;
          const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(`\\b${escaped}\\b`, "gi");

          text = text.replace(regex, (match) => {
            if (replaced) return match;
            replaced = true;
            return `<a href="${tool.affiliate_url}" target="_blank" rel="noopener noreferrer" class="text-brand-600 font-semibold underline hover:text-brand-700 decoration-brand-300">${match}</a>`;
          });
        }
      }
      return text;
    })
    .join("");
}
