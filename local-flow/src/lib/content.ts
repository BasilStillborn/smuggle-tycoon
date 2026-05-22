import toolsData from "@/data/tools.json";
import categoriesData from "@/data/categories.json";
import guidesData from "@/data/guides.json";

export type Tool = (typeof toolsData)[number];
export type Category = (typeof categoriesData)[number];
export type Guide = (typeof guidesData)[number];

export function getAllTools(): Tool[] {
  return toolsData as Tool[];
}

export function getAllCategories(): Category[] {
  return categoriesData as Category[];
}

export function getAllGuides(): Guide[] {
  return guidesData as Guide[];
}

export function getToolBySlug(slug: string): Tool | undefined {
  return (toolsData as Tool[]).find((t) => t.slug === slug);
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return (guidesData as Guide[]).find((g) => g.slug === slug);
}

export function getToolsByCategory(categoryId: string): Tool[] {
  return (toolsData as Tool[]).filter((t) => t.category === categoryId);
}

export function getToolsByDifficulty(difficulty: string): Tool[] {
  return (toolsData as Tool[]).filter((t) => t.difficulty === difficulty);
}

export function getCategoryById(id: string): Category | undefined {
  return (categoriesData as Category[]).find((c) => c.id === id);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase();
  return (toolsData as Tool[]).filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.best_for.some((b) => b.toLowerCase().includes(q))
  );
}

export function getRelatedTools(toolIds: string[]): Tool[] {
  return (toolsData as Tool[]).filter((t) => toolIds.includes(t.id));
}

export function getAllDifficulties(): string[] {
  return [...new Set((toolsData as Tool[]).map((t) => t.difficulty))];
}

export function getCategoryCount(categoryId: string): number {
  return (toolsData as Tool[]).filter((t) => t.category === categoryId).length;
}
