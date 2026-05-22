export const supportedLocales = ["en", "es", "fr", "de"] as const;
export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "en";

export function detectLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return defaultLocale;
  const preferred = acceptLanguage
    .split(",")
    .map((l) => {
      const [lang, q = "1"] = l.trim().split(";q=");
      return { lang: lang.split("-")[0], q: parseFloat(q) };
    })
    .sort((a, b) => b.q - a.q);
  for (const p of preferred) {
    if ((supportedLocales as readonly string[]).includes(p.lang)) {
      return p.lang as Locale;
    }
  }
  return defaultLocale;
}
