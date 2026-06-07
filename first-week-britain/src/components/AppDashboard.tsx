import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ArrivalProfile } from '../data/arrivals';
import { getAirport, getChecklist, getCity, getCountry, getTripType } from '../data/arrivals';
import {
  baiduTranslateGuide,
  bilingualPhrases,
  chinaPaymentGuide,
  chineseAirportNotes,
  isChineseVisitor,
  recommendedApps,
} from '../data/chineseVisitor';
import { getGuideCards, getOfficialLinks, phraseCards, type GuideCard } from '../data/guides';
import { trackEvent } from '../lib/analytics';
import CategoryTile from './CategoryTile';
import InfoWindow from './InfoWindow';
import Waitlist from './Waitlist';

type WindowId = 'arrival' | 'airport' | 'transport' | 'payments' | 'translation' | 'emergency' | 'phrases' | 'apps' | 'official' | 'waitlist';

type Tile = {
  id: WindowId;
  title: string;
  summary: string;
  subtitle: string;
  icon: string;
  accent: string;
  segment: 'all' | 'chinese';
};

type AppDashboardProps = {
  profile: ArrivalProfile;
  hasGenerated: boolean;
};

const tiles: Tile[] = [
  {
    id: 'arrival',
    title: 'Arrival',
    summary: 'First hour, first evening, first 3 days.',
    subtitle: 'Your generated first-week action board.',
    icon: '01',
    accent: 'bg-britain-ink text-white',
    segment: 'all',
  },
  {
    id: 'airport',
    title: 'Airport Transfer',
    summary: 'Heathrow/Gatwick routes and taxi warnings.',
    subtitle: 'Pick a route by budget, luggage, time, and final area.',
    icon: 'AIR',
    accent: 'bg-britain-mist text-britain-navy',
    segment: 'all',
  },
  {
    id: 'transport',
    title: 'Transport',
    summary: 'Tube, rail, buses, tapping rules, disruption.',
    subtitle: 'The London transport rules worth learning once.',
    icon: 'TFL',
    accent: 'bg-britain-blue text-white',
    segment: 'all',
  },
  {
    id: 'payments',
    title: 'Payments',
    summary: 'Contactless, cards, backup cash, TfL rules.',
    subtitle: 'Avoid card problems at gates and checkouts.',
    icon: '£',
    accent: 'bg-britain-green text-white',
    segment: 'all',
  },
  {
    id: 'translation',
    title: 'Translation',
    summary: 'Baidu Translate setup and offline English pack.',
    subtitle: 'Chinese visitor translation setup before leaving Wi-Fi.',
    icon: '文',
    accent: 'bg-britain-red text-white',
    segment: 'chinese',
  },
  {
    id: 'emergency',
    title: 'Emergency',
    summary: '999, NHS 111, pharmacies, insurance, embassy.',
    subtitle: 'Know the right help route before you are stressed.',
    icon: '999',
    accent: 'bg-britain-red text-white',
    segment: 'all',
  },
  {
    id: 'phrases',
    title: 'Phrases',
    summary: 'Copyable sentences for taxi, hotel, pharmacy.',
    subtitle: 'Short sentences you can show or copy quickly.',
    icon: 'Aa',
    accent: 'bg-britain-gold text-britain-ink',
    segment: 'all',
  },
  {
    id: 'apps',
    title: 'Recommended Apps',
    summary: 'Maps, transport, translation, rail, ride-hailing.',
    subtitle: 'Install and test these before the first stressful moment.',
    icon: 'APP',
    accent: 'bg-britain-ink text-white',
    segment: 'all',
  },
  {
    id: 'official',
    title: 'Official Links',
    summary: 'GOV.UK, TfL, NHS, National Rail, Met Office.',
    subtitle: 'Trusted sources, explained in practical terms.',
    icon: 'UK',
    accent: 'bg-britain-mist text-britain-navy',
    segment: 'all',
  },
  {
    id: 'waitlist',
    title: 'Join Waitlist',
    summary: 'Tell us which arrival version to build next.',
    subtitle: 'Join the validation list and tag your arrival context.',
    icon: '@',
    accent: 'bg-britain-red text-white',
    segment: 'all',
  },
];

function copyWithFallback(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function MiniCard({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <article className="rounded-3xl border border-britain-ink/10 bg-white p-4 shadow-sm">
      {eyebrow && <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">{eyebrow}</p>}
      <h3 className="mt-1 text-lg font-black leading-tight text-britain-ink">{title}</h3>
      <div className="mt-3 text-sm font-bold leading-6 text-britain-ink/70">{children}</div>
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3 rounded-2xl bg-britain-cream p-3">
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-britain-green" />
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

function ActionLink({ href, label, eventName, params }: { href: string; label: string; eventName: string; params: Record<string, string | boolean> }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent(eventName, params)}
      className="focus-ring inline-flex w-full justify-center rounded-full bg-britain-ink px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-britain-navy sm:w-auto"
    >
      {label}
    </a>
  );
}

function GuideSummary({ guide }: { guide?: GuideCard }) {
  if (!guide) {
    return null;
  }

  return (
    <MiniCard title={guide.title} eyebrow={guide.eyebrow}>
      <p className="mb-3">{guide.summary}</p>
      <BulletList items={guide.steps} />
    </MiniCard>
  );
}

function AppDashboard({ profile, hasGenerated }: AppDashboardProps) {
  const [activeWindow, setActiveWindow] = useState<WindowId | null>(null);
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const country = getCountry(profile);
  const airport = getAirport(profile);
  const city = getCity(profile);
  const tripType = getTripType(profile);
  const checklist = getChecklist(profile);
  const guideCards = getGuideCards(profile);
  const officialLinks = getOfficialLinks(profile.airport);
  const chineseMode = isChineseVisitor(profile.country);
  const visibleTiles = tiles.filter((tile) => tile.segment === 'all' || chineseMode);
  const activeTile = activeWindow ? tiles.find((tile) => tile.id === activeWindow) : null;
  const airportChineseGuide = chineseAirportNotes[profile.airport];
  const paymentGuide = guideCards.find((guide) => guide.id === 'payments');
  const transferGuide = guideCards.find((guide) => guide.id === 'airport-transfer');
  const transportGuide = guideCards.find((guide) => guide.id === 'transport');
  const emergencyGuide = guideCards.find((guide) => guide.id === 'health');
  const mobileDataGuide = guideCards.find((guide) => guide.id === 'mobile-data');

  useEffect(() => {
    trackEvent('dashboard_viewed', {
      country: profile.country,
      airport: profile.airport,
      trip_type: profile.tripType,
      visitor_segment: chineseMode ? 'chinese' : 'general',
      generated: hasGenerated,
    });
  }, [chineseMode, hasGenerated, profile.airport, profile.country, profile.tripType]);

  function openWindow(id: WindowId) {
    setActiveWindow(id);
    trackEvent('category_tile_opened', {
      window_id: id,
      country: profile.country,
      visitor_segment: chineseMode ? 'chinese' : 'general',
    });
  }

  function closeWindow() {
    if (activeWindow) {
      trackEvent('category_tile_closed', { window_id: activeWindow });
    }
    setActiveWindow(null);
  }

  async function copyPhrase(id: string, text: string) {
    await copyWithFallback(text);
    setCopiedPhrase(id);
    trackEvent('phrase_copied', { phrase_id: id, visitor_segment: chineseMode ? 'chinese' : 'general' });
    window.setTimeout(() => setCopiedPhrase((current) => (current === id ? null : current)), 1800);
  }

  function renderWindowContent() {
    switch (activeWindow) {
      case 'arrival':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {checklist.map((section, index) => (
              <MiniCard key={section.title} title={section.title} eyebrow={`${index + 1}. ${section.timeframe}`}>
                <p className="mb-3 text-britain-ink/60">{section.intent}</p>
                <BulletList items={section.items} />
              </MiniCard>
            ))}
          </div>
        );
      case 'airport':
        return (
          <div className="space-y-4">
            <MiniCard title={`${airport.label} to ${city.label}`} eyebrow="Route options">
              <p className="mb-3">{airport.terminalTip}</p>
              <BulletList items={airport.primaryRoutes} />
            </MiniCard>
            {chineseMode && (
              <MiniCard title={airportChineseGuide.title} eyebrow="中文提示">
                <p className="mb-3 text-britain-ink/60">{airportChineseGuide.subtitle}</p>
                <BulletList items={airportChineseGuide.points} />
              </MiniCard>
            )}
            <GuideSummary guide={transferGuide} />
          </div>
        );
      case 'transport':
        return (
          <div className="space-y-4">
            <GuideSummary guide={transportGuide} />
            <MiniCard title="Fast rules" eyebrow="London basics">
              <BulletList items={[
                'Use the same card or phone when tapping in and out on Tube and rail journeys.',
                'For buses, usually tap only when boarding.',
                'Stand on the right on escalators and keep bags close on busy platforms.',
                'Check disruption before late-night journeys or airport transfers.',
              ]} />
            </MiniCard>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ActionLink href="https://tfl.gov.uk/plan-a-journey/" label="TfL journey planner" eventName="window_action_clicked" params={{ window_id: 'transport', action: 'tfl' }} />
              <ActionLink href="https://citymapper.com/london" label="Citymapper London" eventName="window_action_clicked" params={{ window_id: 'transport', action: 'citymapper' }} />
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-4">
            <GuideSummary guide={paymentGuide} />
            {chineseMode && (
              <MiniCard title={chinaPaymentGuide.title} eyebrow="中国游客重点">
                <p className="mb-3 text-britain-ink/60">{chinaPaymentGuide.subtitle}</p>
                <BulletList items={chinaPaymentGuide.points} />
              </MiniCard>
            )}
            <ActionLink href="https://tfl.gov.uk/fares/contactless-and-oyster-account" label="TfL contactless guidance" eventName="window_action_clicked" params={{ window_id: 'payments', action: 'tfl_contactless' }} />
          </div>
        );
      case 'translation':
        return (
          <div className="space-y-4">
            <MiniCard title={baiduTranslateGuide.title} eyebrow="百度翻译设置">
              <p className="mb-3 text-britain-ink/60">{baiduTranslateGuide.subtitle}</p>
              <BulletList items={baiduTranslateGuide.points} />
            </MiniCard>
            <ActionLink href="https://fanyi.baidu.com/" label="Open Baidu Translate" eventName="baidu_translate_clicked" params={{ visitor_segment: 'chinese', location: 'dashboard_window' }} />
          </div>
        );
      case 'emergency':
        return (
          <div className="space-y-4">
            <GuideSummary guide={emergencyGuide} />
            <MiniCard title="Numbers to save" eyebrow="Safety">
              <BulletList items={[
                'Call 999 for police, fire, ambulance, danger, serious injury, or crime in progress.',
                'Use NHS 111 for urgent medical advice when it is not life-threatening.',
                'Ask a pharmacy for minor illness, medicine advice, and common symptoms.',
                'Use your travel insurance for private care, claims, or medical support lines.',
              ]} />
            </MiniCard>
            <ActionLink href="https://111.nhs.uk/" label="NHS 111 online" eventName="window_action_clicked" params={{ window_id: 'emergency', action: 'nhs_111' }} />
          </div>
        );
      case 'phrases':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {(chineseMode ? bilingualPhrases : phraseCards.map((phrase) => ({
              id: phrase.situation,
              situation: phrase.situation,
              chineseSituation: phrase.situation,
              english: phrase.sayThis,
              chineseMeaning: phrase.means,
              tip: 'Copy this sentence or show it to staff.',
            }))).map((phrase) => (
              <MiniCard key={phrase.id} title={phrase.chineseSituation} eyebrow={phrase.situation}>
                <p className="text-base font-black leading-7 text-britain-ink">"{phrase.english}"</p>
                <p className="mt-3">{phrase.chineseMeaning}</p>
                <p className="mt-3 rounded-2xl bg-britain-cream p-3 text-xs leading-5 text-britain-ink/58">{phrase.tip}</p>
                <button
                  type="button"
                  onClick={() => copyPhrase(phrase.id, phrase.english)}
                  className="focus-ring mt-4 w-full rounded-full bg-britain-ink px-4 py-3 text-sm font-black text-white transition hover:bg-britain-navy"
                >
                  {copiedPhrase === phrase.id ? 'Copied' : 'Copy phrase'}
                </button>
              </MiniCard>
            ))}
          </div>
        );
      case 'apps':
        return (
          <div className="space-y-4">
            <GuideSummary guide={mobileDataGuide} />
            <div className="grid gap-4 sm:grid-cols-2">
              {recommendedApps.map((app) => (
                <MiniCard key={app.id} title={app.chineseName ? `${app.chineseName} / ${app.name}` : app.name} eyebrow={app.category}>
                  <p>{app.description}</p>
                  {app.caution && <p className="mt-3 rounded-2xl bg-britain-cream p-3 text-xs leading-5 text-britain-ink/58">{app.caution}</p>}
                  {app.href && (
                    <div className="mt-4">
                      <ActionLink href={app.href} label="Open" eventName="recommended_app_clicked" params={{ app_id: app.id, visitor_segment: chineseMode ? 'chinese' : 'general' }} />
                    </div>
                  )}
                </MiniCard>
              ))}
            </div>
          </div>
        );
      case 'official':
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            {officialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('official_link_clicked', { label: link.label, tag: link.tag, airport: profile.airport })}
                className="focus-ring rounded-3xl border border-britain-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">{link.tag}</p>
                <h3 className="mt-2 text-lg font-black text-britain-ink">{link.label}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-britain-ink/62">{link.description}</p>
                <p className="mt-4 text-sm font-black text-britain-red">Open source</p>
              </a>
            ))}
          </div>
        );
      case 'waitlist':
        return <Waitlist profile={profile} variant="panel" />;
      default:
        return null;
    }
  }

  return (
    <section id="dashboard" className="bg-britain-cream px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] bg-britain-ink p-5 text-white shadow-card sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-britain-gold">Compact app dashboard</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-black tracking-tight sm:text-5xl">Choose a window.</h2>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/68 sm:text-base sm:leading-7">
                {hasGenerated ? 'Your checklist is ready.' : 'Sample dashboard shown before generation.'} Open only the category you need, then close it and move on.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 text-sm font-bold leading-6 text-white/75">
              {country.label} · {airport.label} · {city.label} · {tripType.label} · {profile.tripLengthDays} days
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {visibleTiles.map((tile) => (
            <CategoryTile
              key={tile.id}
              title={tile.title}
              summary={tile.summary}
              icon={tile.icon}
              accent={tile.accent}
              onClick={() => openWindow(tile.id)}
            />
          ))}
        </div>
      </div>

      {activeTile && (
        <InfoWindow title={activeTile.title} subtitle={activeTile.subtitle} onClose={closeWindow}>
          {renderWindowContent()}
        </InfoWindow>
      )}
    </section>
  );
}

export default AppDashboard;
