import { useState } from 'react';
import type { ArrivalProfile } from '../data/arrivals';
import { getAirport, getCity, getCountry, getTripType } from '../data/arrivals';
import { isChineseVisitor } from '../data/chineseVisitor';
import { appConfig, hasWaitlistEndpoint } from '../lib/config';
import { trackEvent } from '../lib/analytics';

type WaitlistProps = {
  profile: ArrivalProfile;
  variant?: 'section' | 'panel';
};

function Waitlist({ profile, variant = 'section' }: WaitlistProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'submitting' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const country = getCountry(profile);
  const airport = getAirport(profile);
  const city = getCity(profile);
  const tripType = getTripType(profile);
  const chineseModeEnabled = isChineseVisitor(profile.country);
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
      setMessage('Enter a valid email address.');
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
      setMessage('Saved in demo mode. Add VITE_WAITLIST_ENDPOINT to send real signups.');
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
      setMessage('You are on the list. We will use your arrival context to shape the next version.');
      setEmail('');
      trackSuccessfulSignup(appConfig.waitlistProvider);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('The signup could not be sent. Check the endpoint or try again later.');
      trackEvent('waitlist_submit_error', { reason: 'request_failed', provider: appConfig.waitlistProvider, visitor_segment: visitorSegment });
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] bg-white p-5 text-britain-ink shadow-card sm:rounded-[2rem] sm:p-8">
      <div className="rounded-3xl bg-britain-cream p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">Current interest tag</p>
        <p className="mt-2 text-sm font-bold leading-6 text-britain-ink/70">
          {tripType.label} from {country.label}, arriving at {airport.label}{chineseModeEnabled ? ' · Chinese visitor segment' : ''}
        </p>
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-black">Email for early access</span>
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
        {status === 'submitting' ? 'Sending...' : 'Join the validation list'}
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
          <p className="text-sm font-black uppercase tracking-[0.18em] text-white/70">Validation layer</p>
          <h2 className="mt-2 font-serif text-3xl font-black tracking-tight sm:text-5xl">Use the waitlist as the first demand test.</h2>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/78 sm:text-lg sm:leading-8">
            This form posts to your configured endpoint when `VITE_WAITLIST_ENDPOINT` is set. Without one, it stays in safe demo mode for local testing.
          </p>
        </div>

        {form}
      </div>
    </section>
  );
}

export default Waitlist;
