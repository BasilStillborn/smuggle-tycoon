import { appConfig, hasAnalytics } from './config';

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function loadScript(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (initialized || !hasAnalytics()) {
    return;
  }

  initialized = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', appConfig.analyticsId, {
    anonymize_ip: true,
    send_page_view: true,
  });

  loadScript(`https://www.googletagmanager.com/gtag/js?id=${appConfig.analyticsId}`);
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (hasAnalytics() && window.gtag) {
    window.gtag('event', name, params);
  }

  if (appConfig.analyticsDebug) {
    console.info('[analytics]', name, params);
  }
}
