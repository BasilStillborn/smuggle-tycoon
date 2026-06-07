import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ArrivalProfile } from '../data/arrivals';
import { baiduTranslateGuide, chinaPaymentGuide, chineseAirportNotes, chineseSeoTopics } from '../data/chineseVisitor';
import { trackEvent } from '../lib/analytics';
import PhraseCopyCards from './PhraseCopyCards';
import RecommendedApps from './RecommendedApps';

type ChineseVisitorGuideProps = {
  profile: ArrivalProfile;
};

function GuideBlock({ title, subtitle, points, tone = 'light', action }: {
  title: string;
  subtitle: string;
  points: string[];
  tone?: 'light' | 'dark';
  action?: ReactNode;
}) {
  const dark = tone === 'dark';

  return (
    <article className={`rounded-[1.5rem] p-4 shadow-soft sm:rounded-[2rem] sm:p-7 ${dark ? 'bg-britain-ink text-white' : 'border border-britain-ink/10 bg-white text-britain-ink'}`}>
      <h3 className="font-serif text-2xl font-black tracking-tight sm:text-3xl">{title}</h3>
      <p className={`mt-3 text-base font-semibold leading-7 ${dark ? 'text-white/68' : 'text-britain-ink/65'}`}>{subtitle}</p>
      <div className="mt-5 space-y-3">
        {points.map((point) => (
          <div key={point} className={`flex gap-3 rounded-2xl p-3 ${dark ? 'bg-white/8' : 'bg-britain-cream'}`}>
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dark ? 'bg-britain-gold' : 'bg-britain-red'}`} />
            <p className={`text-sm font-bold leading-6 ${dark ? 'text-white/78' : 'text-britain-ink/74'}`}>{point}</p>
          </div>
        ))}
      </div>
      {action && <div className="mt-5">{action}</div>}
    </article>
  );
}

function ChineseVisitorGuide({ profile }: ChineseVisitorGuideProps) {
  const airportGuide = chineseAirportNotes[profile.airport];

  useEffect(() => {
    trackEvent('baidu_translate_card_viewed', { visitor_segment: 'chinese', airport: profile.airport, trip_type: profile.tripType });
  }, [profile.airport, profile.tripType]);

  return (
    <section className="bg-britain-cream py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-red">Chinese Visitor Mode</p>
          <h2 className="mt-2 font-serif text-3xl font-black tracking-tight text-britain-ink sm:text-5xl">中国游客伦敦初到指南</h2>
          <p className="mt-4 text-base font-semibold leading-7 text-britain-ink/68 sm:text-lg sm:leading-8">
            This section appears when the visitor is coming from China. It focuses on the real UK friction points: translation setup, contactless payment, airport transfer, emergency help, and practical English phrases.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <GuideBlock
            title={baiduTranslateGuide.title}
            subtitle={baiduTranslateGuide.subtitle}
            points={baiduTranslateGuide.points}
            tone="dark"
            action={(
              <a
                href="https://fanyi.baidu.com/"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('baidu_translate_clicked', { visitor_segment: 'chinese', location: 'chinese_visitor_guide' })}
                className="focus-ring inline-flex w-full justify-center rounded-full bg-britain-red px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-red-700 sm:w-auto"
              >
                Open Baidu Translate
              </a>
            )}
          />
          <GuideBlock
            title={chinaPaymentGuide.title}
            subtitle={chinaPaymentGuide.subtitle}
            points={chinaPaymentGuide.points}
            action={(
              <button
                type="button"
                onClick={() => trackEvent('china_payment_guide_clicked', { visitor_segment: 'chinese', trip_type: profile.tripType })}
                className="focus-ring inline-flex w-full justify-center rounded-full bg-britain-ink px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-britain-navy sm:w-auto"
              >
                Track payment-guide interest
              </button>
            )}
          />
          <GuideBlock title={airportGuide.title} subtitle={airportGuide.subtitle} points={airportGuide.points} />
        </div>

        <RecommendedApps />

        <PhraseCopyCards />

        <div className="mt-8 rounded-[1.5rem] border border-britain-ink/10 bg-white p-5 shadow-card sm:rounded-[2rem] sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-red">Chinese SEO test block</p>
          <h3 className="mt-2 font-serif text-2xl font-black tracking-tight text-britain-ink sm:text-3xl">第一次去英国伦敦旅行，需要提前准备什么？</h3>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {chineseSeoTopics.map((topic) => (
              <p key={topic} className="rounded-2xl bg-britain-cream p-4 text-sm font-bold leading-6 text-britain-ink/72">{topic}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChineseVisitorGuide;
