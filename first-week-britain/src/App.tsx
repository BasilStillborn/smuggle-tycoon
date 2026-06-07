import { useEffect, useRef, useState } from 'react';
import AppDashboard from './components/AppDashboard';
import ArrivalForm from './components/ArrivalForm';
import Hero from './components/Hero';
import { defaultProfile, getAirport, getCity, getCountry, getTripType, type ArrivalProfile } from './data/arrivals';
import { isChineseVisitor } from './data/chineseVisitor';
import { initAnalytics, trackEvent } from './lib/analytics';

function App() {
  const [draftProfile, setDraftProfile] = useState<ArrivalProfile>(defaultProfile);
  const [activeProfile, setActiveProfile] = useState<ArrivalProfile>(defaultProfile);
  const [hasGenerated, setHasGenerated] = useState(false);
  const dashboardRef = useRef<HTMLElement | null>(null);
  const country = getCountry(draftProfile);
  const airport = getAirport(draftProfile);
  const city = getCity(draftProfile);
  const tripType = getTripType(draftProfile);
  const activeChineseMode = isChineseVisitor(activeProfile.country);
  const trackedChineseModeKey = useRef('');

  useEffect(() => {
    initAnalytics();
  }, []);

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

  function scrollToForm() {
    document.getElementById('arrival-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleGenerate(profile: ArrivalProfile) {
    setActiveProfile(profile);
    setHasGenerated(true);
    trackEvent('checklist_generated', {
      country: profile.country,
      airport: profile.airport,
      city: profile.city,
      trip_type: profile.tripType,
      language: profile.language,
      trip_length_days: profile.tripLengthDays,
      visitor_segment: profile.country === 'china' ? 'chinese' : 'general',
    });
    window.setTimeout(() => {
      dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-britain-cream text-britain-ink">
      <Hero onStart={scrollToForm} />

      <section id="arrival-form" className="paper-texture relative py-12 sm:py-16 lg:py-24">
        <div className="absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-britain-ink/15 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <ArrivalForm value={draftProfile} onChange={setDraftProfile} onSubmit={handleGenerate} />

          <aside className="rounded-[1.5rem] border border-britain-ink/10 bg-britain-paper p-5 shadow-card sm:rounded-[2rem] sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-red">Why this shape</p>
            <h2 className="mt-2 font-serif text-2xl font-black tracking-tight text-britain-ink sm:text-3xl">SinoGuide-style category, UK visitor focus.</h2>
            <p className="mt-4 text-base font-semibold leading-7 text-britain-ink/65">
              The product is not another travel blog. It is a guided setup layer for the first week: data, payment, airport transfer, transport, health, etiquette, and official sources.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                ['Country signal', country.note],
                ['Airport signal', airport.note],
                ['City signal', city.note],
                ['Trip signal', tripType.note],
              ].map(([label, note]) => (
                <div key={label} className="rounded-3xl bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-ink/45">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-britain-ink/72">{note}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section ref={dashboardRef} id="dashboard-app">
        <AppDashboard profile={activeProfile} hasGenerated={hasGenerated} />
      </section>

      <footer className="bg-britain-ink px-5 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-bold text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>First Week in Britain MVP. Independent guide, not an official UK government service.</p>
          <p>Next: form endpoint, ad tests, Chinese traffic, more UK cities.</p>
        </div>
      </footer>
    </main>
  );
}

export default App;
