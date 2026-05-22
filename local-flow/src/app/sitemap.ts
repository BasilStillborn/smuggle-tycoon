import { MetadataRoute } from "next";
import { getAllTools, getAllCategories, getAllGuides } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://localflowhub.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/checklist`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/setup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/setup/domain`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/legal/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/affiliate-disclosure`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolPages: MetadataRoute.Sitemap = getAllTools().map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = getAllCategories().map((cat) => ({
    url: `${baseUrl}/tools?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const guidePages: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...toolPages, ...categoryPages, ...guidePages];
}
