type WaitlistProvider = 'formspree' | 'custom';
type AnalyticsProvider = 'ga4' | 'none';

function clean(value: string | undefined) {
  return value?.trim() ?? '';
}

export const appConfig = {
  waitlistEndpoint: clean(import.meta.env.VITE_WAITLIST_ENDPOINT),
  waitlistProvider: (clean(import.meta.env.VITE_WAITLIST_PROVIDER) || 'formspree') as WaitlistProvider,
  analyticsProvider: (clean(import.meta.env.VITE_ANALYTICS_PROVIDER) || 'ga4') as AnalyticsProvider,
  analyticsId: clean(import.meta.env.VITE_ANALYTICS_ID),
  analyticsDebug: import.meta.env.DEV || clean(import.meta.env.VITE_ANALYTICS_DEBUG) === 'true',
};

export function hasWaitlistEndpoint() {
  return appConfig.waitlistEndpoint.length > 0;
}

export function hasAnalytics() {
  return appConfig.analyticsProvider === 'ga4' && appConfig.analyticsId.length > 0;
}
