export function getEnv(key: string, label: string): string | null {
  const value = process.env[key];
  if (!value || value === "" || value.startsWith("YOUR_")) {
    console.warn(`[LocalFlow] ${label} is not configured. Set ${key} in .env.local`);
    return null;
  }
  return value;
}

export function isConfigured(key: string): boolean {
  const value = process.env[key];
  return !!value && value !== "" && !value.startsWith("YOUR_");
}

export const ENV_KEYS = {
  GA_ID: "NEXT_PUBLIC_GA_ID",
  MAILCHIMP_API_KEY: "MAILCHIMP_API_KEY",
  MAILCHIMP_LIST_ID: "MAILCHIMP_LIST_ID",
  GOOGLE_SHEETS_API_KEY: "GOOGLE_SHEETS_API_KEY",
  SITE_URL: "NEXT_PUBLIC_SITE_URL",
} as const;
