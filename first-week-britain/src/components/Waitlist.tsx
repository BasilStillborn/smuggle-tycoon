import { useState } from 'react';
import type { ArrivalProfile } from '../data/arrivals';
import { getAirport, getCity, getCountry, getTripType } from '../data/arrivals';
import { isChineseVisitor } from '../data/chineseVisitor';
import { appConfig, hasWaitlistEndpoint } from '../lib/config';
import { trackEvent } from '../lib/analytics';

type WaitlistProps = {
  profile: ArrivalProfile;
  variant?: 'section' | 'panel';
  locale?: 'en' | 'zh';
};

const copy = {
  en: {
    tagEyebrow: 'Current interest tag',
    segment: 'Chinese visitor segment',
    emailLabel: 'Email for early access',
    sending: 'Sending...',
    submit: 'Join the validation list',
    invalidEmail: 'Enter a valid email address.',
    demoSaved: 'Saved in demo mode. Add VITE_WAITLIST_ENDPOINT to send real signups.',
    success: 'You are on the list. We will use your arrival context to shape the next version.',
    failed: 'The signup could not be sent. Check the endpoint or try again later.',
    sectionEyebrow: 'Validation layer',
    sectionTitle: 'Use the waitlist as the first demand test.',
    sectionBody: 'This form posts to your configured endpoint when `VITE_WAITLIST_ENDPOINT` is set. Without one, it stays in safe demo mode for local testing.',
  },
  zh: {
    tagEyebrow: '你的到达场景',
    segment: '中国游客分组',
    emailLabel: '留个邮箱，下一版工具上线时通知你',
    sending: '发送中...',
    submit: '加入名单，告诉我下一版',
    invalidEmail: '请输入有效邮箱地址。',
    demoSaved: '本地演示模式已保存。设置 VITE_WAITLIST_ENDPOINT 后可发送真实报名。',
    success: '你已加入名单。我们会优先根据中国游客的真实需求做下一版。',
    failed: '报名未发送成功。请检查端点或稍后重试。',
    sectionEyebrow: '下一版验证',
    sectionTitle: '你最需要哪个英国到达工具？',
    sectionBody: '我们会看中国游客实际点击和报名，优先做最有用的工具，不做花架子。',
  },
};

const zhLabels: Record<string, Record<string, string>> = {
  country: {
    china: '中国',
    india: '印度',
    usa: '美国',
    eu: '欧盟 / 欧洲经济区',
    gulf: '海湾地区',
    other: '其他国家',
  },
  airport: {
    heathrow: '伦敦希思罗',
    gatwick: '伦敦盖特威克',
  },
  tripType: {
    tourist: '旅游',
    student: '留学',
    business: '商务',
  },
};

function label(locale: 'en' | 'zh', group: keyof typeof zhLabels, id: string, fallback: string) {
  return locale === 'zh' ? zhLabels[group][id] ?? fallback : fallback;
}

function Waitlist({ profile, variant = 'section', locale = 'en' }: WaitlistProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'submitting' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const t = copy[locale];
  const country = getCountry(profile);
  const airport = getAirport(profile);
  const city = getCity(profile);
  const tripType = getTripType(profile);
  const chineseModeEnabled = locale === 'zh' || isChineseVisitor(profile.country);
  const visitorSegment = chineseModeEnabled ? 'chinese' : 'general';

  function trackSuccessfulSignup(mode: string) {
    trackEvent('waitlist_submit_success', {
      mode,
      country: profile.country,
      airport: profile.airport,
      trip_type: profile.tripType,
      visitor_segment: visitorSegment,
      chinese_mode_enabled: chineseModeEnabled,
    });

    if (chineseModeEnabled) {
      trackEvent('chinese_waitlist_submitted', {
        mode,
        language: profile.language,
        airport: profile.airport,
        trip_type: profile.tripType,
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validEmail = /^\S+@\S+\.\S+$/.test(email);

    if (!validEmail) {
      setStatus('error');
      setMessage(t.invalidEmail);
      trackEvent('waitlist_submit_error', { reason: 'invalid_email' });
      return;
    }

    const payload = {
      email,
      source: 'first-week-britain-mvp',
      country: profile.country,
      country_label: country.label,
      airport: profile.airport,
      airport_label: airport.label,
      city: profile.city,
      city_label: city.label,
      trip_type: profile.tripType,
      trip_type_label: tripType.label,
      trip_length_days: profile.tripLengthDays,
      language: profile.language,
      visitor_segment: visitorSegment,
      chinese_mode_enabled: chineseModeEnabled,
    };

    trackEvent('waitlist_submit_attempted', {
      country: profile.country,
      airport: profile.airport,
      city: profile.city,
      trip_type: profile.tripType,
      has_endpoint: hasWaitlistEndpoint(),
      visitor_segment: visitorSegment,
      chinese_mode_enabled: chineseModeEnabled,
    });

    if (!hasWaitlistEndpoint()) {
      setStatus('success');
      setMessage(t.demoSaved);
      setEmail('');
      trackSuccessfulSignup('demo');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch(appConfig.waitlistEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Waitlist request failed with ${response.status}`);
      }

      setStatus('success');
      setMessage(t.success);
      setEmail('');
      trackSuccessfulSignup(appConfig.waitlistProvider);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage(t.failed);
      trackEvent('waitlist_submit_error', { reason: 'request_failed', provider: appConfig.waitlistProvider, visitor_segment: visitorSegment });
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] bg-white p-5 text-britain-ink shadow-card sm:rounded-[2rem] sm:p-8">
      <div className="rounded-3xl bg-britain-cream p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">{t.tagEyebrow}</p>
        <p className="mt-2 text-sm font-bold leading-6 text-britain-ink/70">
          {locale === 'zh'
            ? `${label(locale, 'tripType', profile.tripType, tripType.label)} · ${label(locale, 'country', profile.country, country.label)} · ${label(locale, 'airport', profile.airport, airport.label)}${chineseModeEnabled ? ` · ${t.segment}` : ''}`
            : `${tripType.label} from ${country.label}, arriving at ${airport.label}${chineseModeEnabled ? ` · ${t.segment}` : ''}`}
        </p>
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-black">{t.emailLabel}</span>
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setStatus('idle');
          }}
          placeholder="you@example.com"
          autoComplete="email"
          className="focus-ring w-full rounded-2xl border border-britain-ink/15 bg-white px-4 py-4 font-bold text-britain-ink sm:py-3"
        />
      </label>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="focus-ring mt-4 w-full rounded-2xl bg-britain-ink px-5 py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-britain-navy disabled:cursor-not-allowed disabled:opacity-70"
        data-track="waitlist-submit-placeholder"
      >
        {status === 'submitting' ? t.sending : t.submit}
      </button>
      {status === 'error' && (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-britain-red">{message}</p>
      )}
      {status === 'success' && (
        <p className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-britain-green">{message}</p>
      )}
    </form>
  );

  if (variant === 'panel') {
    return form;
  }

  return (
    <section className="bg-britain-red px-4 py-12 text-white sm:px-8 sm:py-16 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-white/70">{t.sectionEyebrow}</p>
          <h2 className="mt-2 font-serif text-3xl font-black tracking-tight sm:text-5xl">{t.sectionTitle}</h2>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/78 sm:text-lg sm:leading-8">
            {t.sectionBody}
          </p>
        </div>

        {form}
      </div>
    </section>
  );
}

export default Waitlist;
