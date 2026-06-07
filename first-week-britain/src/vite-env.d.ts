/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WAITLIST_ENDPOINT?: string;
  readonly VITE_WAITLIST_PROVIDER?: 'formspree' | 'custom';
  readonly VITE_ANALYTICS_PROVIDER?: 'ga4' | 'none';
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_ANALYTICS_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
