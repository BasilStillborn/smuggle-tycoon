import { useEffect, useRef, useState } from 'react';
import AppDashboard from './components/AppDashboard';
import type { WindowId } from './components/AppDashboard';
import AppShell from './components/AppShell';
import ArrivalForm from './components/ArrivalForm';
import BottomNav from './components/BottomNav';
import InfoWindow from './components/InfoWindow';
import { defaultProfile, type ArrivalProfile } from './data/arrivals';
import { isChineseVisitor } from './data/chineseVisitor';
import { initAnalytics, trackEvent } from './lib/analytics';
import { loadSavedProfile, saveProfile } from './lib/profileStorage';

type AppLocale = 'en' | 'zh';

const chineseRouteDefaultProfile: ArrivalProfile = {
  ...defaultProfile,
  country: 'china',
  language: 'chinese',
  airport: 'heathrow',
  city: 'london',
  tripType: 'tourist',
};

const copy: Record<AppLocale, {
  setupTitle: string;
  setupSubtitle: string;
  setupSubmit: string;
  appWindow: string;
  closeWindow: string;
  footer: string;
  footerNext: string;
}> = {
  en: {
    setupTitle: 'Trip Setup',
    setupSubtitle: 'Save your arrival context to personalise every app window.',
    setupSubmit: 'Save trip and open arrival',
    appWindow: 'App window',
    closeWindow: 'Close window',
    footer: 'First Week in Britain MVP. Independent guide, not an official UK government service.',
    footerNext: 'Next: form endpoint, ad tests, Chinese traffic, more UK cities.',
  },
  zh: {
    setupTitle: '行程设置',
    setupSubtitle: '保存你的到达情况，用来生成每个应用窗口。',
    setupSubmit: '保存并打开到达清单',
    appWindow: '应用窗口',
    closeWindow: '关闭窗口',
    footer: '英国第一周 MVP。独立指南，不是英国政府官方网站。',
    footerNext: '下一步：表单验证、广告测试、中国流量和更多英国城市。',
  },
};

function getRouteLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return window.location.pathname.startsWith('/zh') ? 'zh' : 'en';
}

function getInitialState(locale: AppLocale) {
  const savedProfile = loadSavedProfile();
  const canUseSavedProfile = locale !== 'zh' || !savedProfile || savedProfile.country === 'china';
  const profile = canUseSavedProfile && savedProfile
    ? locale === 'zh' ? { ...savedProfile, language: 'chinese' as const } : savedProfile
    : locale === 'zh' ? chineseRouteDefaultProfile : defaultProfile;

  return {
    profile,
    hasSavedProfile: Boolean(canUseSavedProfile && savedProfile),
  };
}

function App() {
  const [routeLocale] = useState<AppLocale>(getRouteLocale);
  const [initialState] = useState(() => getInitialState(routeLocale));
  const [draftProfile, setDraftProfile] = useState<ArrivalProfile>(initialState.profile);
  const [activeProfile, setActiveProfile] = useState<ArrivalProfile>(initialState.profile);
  const [hasGenerated, setHasGenerated] = useState(initialState.hasSavedProfile);
  const [setupOpen, setSetupOpen] = useState(!initialState.hasSavedProfile);
  const [activeWindow, setActiveWindow] = useState<WindowId | null>(null);
  const dashboardRef = useRef<HTMLElement | null>(null);
  const activeChineseMode = isChineseVisitor(activeProfile.country);
  const trackedChineseModeKey = useRef('');
  const t = copy[routeLocale];

  useEffect(() => {
    document.documentElement.lang = routeLocale === 'zh' ? 'zh-CN' : 'en';
    document.title = routeLocale === 'zh' ? '英国第一周 | 中国游客到达助手' : 'First Week in Britain';
    initAnalytics();
    if (initialState.hasSavedProfile) {
      trackEvent('profile_loaded_from_storage', {
        country: initialState.profile.country,
        airport: initialState.profile.airport,
        trip_type: initialState.profile.tripType,
      });
    }
  }, [initialState.hasSavedProfile, initialState.profile.airport, initialState.profile.country, initialState.profile.tripType, routeLocale]);

  useEffect(() => {
    if (!activeChineseMode) {
      return;
    }

    const key = `${activeProfile.country}-${activeProfile.language}-${activeProfile.airport}-${activeProfile.tripType}`;
    if (trackedChineseModeKey.current === key) {
      return;
    }

    trackedChineseModeKey.current = key;
    trackEvent('chinese_mode_enabled', {
      source: 'active_profile',
      language: activeProfile.language,
      airport: activeProfile.airport,
      trip_type: activeProfile.tripType,
    });
  }, [activeChineseMode, activeProfile.airport, activeProfile.country, activeProfile.language, activeProfile.tripType]);

  function openSetup(source: string) {
    setDraftProfile(activeProfile);
    setSetupOpen(true);
    trackEvent('setup_window_opened', { source });
  }

  function closeSetup() {
    setSetupOpen(false);
  }

  function handleSaveSetup(profile: ArrivalProfile) {
    setActiveProfile(profile);
    setDraftProfile(profile);
    setHasGenerated(true);
    setSetupOpen(false);
    setActiveWindow('arrival');
    saveProfile(profile);
    trackEvent('checklist_generated', {
      country: profile.country,
      airport: profile.airport,
      city: profile.city,
      trip_type: profile.tripType,
      language: profile.language,
      trip_length_days: profile.tripLengthDays,
      visitor_segment: profile.country === 'china' ? 'chinese' : 'general',
    });
    trackEvent('setup_saved', {
      country: profile.country,
      airport: profile.airport,
      trip_type: profile.tripType,
      visitor_segment: profile.country === 'china' ? 'chinese' : 'general',
    });
    window.setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function openWindow(windowId: WindowId, source = 'dashboard') {
    setActiveWindow(windowId);
    if (source === 'bottom_nav') {
      trackEvent('bottom_nav_clicked', { target: windowId });
    }
  }

  function goHome() {
    setActiveWindow(null);
    trackEvent('bottom_nav_clicked', { target: 'home' });
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-britain-cream pb-24 text-britain-ink md:pb-0">
      <AppShell profile={activeProfile} onEditTrip={() => openSetup('app_shell')} locale={routeLocale} />

      <section ref={dashboardRef} id="dashboard-app">
        <AppDashboard
          profile={activeProfile}
          hasGenerated={hasGenerated}
          activeWindow={activeWindow}
          onOpenWindow={(windowId) => openWindow(windowId)}
          onCloseWindow={() => setActiveWindow(null)}
          locale={routeLocale}
        />
      </section>

      {setupOpen && (
        <InfoWindow title={t.setupTitle} subtitle={t.setupSubtitle} onClose={closeSetup} eyebrow={t.appWindow} closeLabel={t.closeWindow}>
          <ArrivalForm value={draftProfile} onChange={setDraftProfile} onSubmit={handleSaveSetup} submitLabel={t.setupSubmit} locale={routeLocale} />
        </InfoWindow>
      )}

      <BottomNav onHome={goHome} onSetup={() => openSetup('bottom_nav')} onOpenWindow={(windowId) => openWindow(windowId, 'bottom_nav')} locale={routeLocale} />

      <footer className="bg-britain-ink px-5 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-bold text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footer}</p>
          <p>{t.footerNext}</p>
        </div>
      </footer>
    </main>
  );
}

export default App;
