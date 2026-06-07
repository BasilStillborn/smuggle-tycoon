import { useEffect, useState } from 'react';
import type { AirportId, ArrivalProfile, CityId, CountryId, LanguageId, TripType } from '../data/arrivals';
import { airports, cities, countries, languages, tripTypes } from '../data/arrivals';
import { trackEvent } from '../lib/analytics';

type ArrivalFormProps = {
  value: ArrivalProfile;
  onChange: (nextValue: ArrivalProfile) => void;
  onSubmit: (nextValue: ArrivalProfile) => void;
  submitLabel?: string;
};

function ArrivalForm({ value, onChange, onSubmit, submitLabel = 'Generate my arrival checklist' }: ArrivalFormProps) {
  const [tripLengthDraft, setTripLengthDraft] = useState(String(value.tripLengthDays));

  useEffect(() => {
    setTripLengthDraft(String(value.tripLengthDays));
  }, [value.tripLengthDays]);

  function updateField<K extends keyof ArrivalProfile>(field: K, nextValue: ArrivalProfile[K]) {
    if (field === 'language') {
      trackEvent('language_changed', { language: String(nextValue), country: value.country });
    }

    if (field === 'country' && nextValue === 'china') {
      trackEvent('chinese_mode_enabled', { source: 'country_select' });
    }

    onChange({ ...value, [field]: nextValue });
  }

  function normaliseTripLength(nextValue = tripLengthDraft) {
    const parsed = Number(nextValue);

    if (!Number.isFinite(parsed)) {
      return 1;
    }

    return Math.min(365, Math.max(1, Math.round(parsed)));
  }

  function handleTripLengthChange(nextValue: string) {
    setTripLengthDraft(nextValue);

    if (nextValue === '') {
      return;
    }

    updateField('tripLengthDays', normaliseTripLength(nextValue));
  }

  function commitTripLength() {
    const nextTripLength = normaliseTripLength();
    setTripLengthDraft(String(nextTripLength));
    updateField('tripLengthDays', nextTripLength);
    return nextTripLength;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ ...value, tripLengthDays: commitTripLength() });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-britain-ink/10 bg-white p-5 shadow-card sm:rounded-[2rem] sm:p-8">
      <div className="mb-7">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-red">Personalise the first week</p>
        <h2 className="mt-2 font-serif text-2xl font-black tracking-tight text-britain-ink sm:text-4xl">Tell us your arrival context.</h2>
        <p className="mt-3 text-base leading-7 text-britain-ink/65">This setup powers your compact dashboard windows for arrival, payments, transport, translation, emergency help, and phrases.</p>
      </div>

      {value.country === 'china' && (
        <div className="mb-5 rounded-3xl border border-britain-red/20 bg-red-50 p-4">
          <p className="text-sm font-black text-britain-red">Chinese Visitor Mode enabled</p>
          <p className="mt-1 text-sm font-bold leading-6 text-britain-ink/65">中国游客专属内容会出现在清单下方：百度翻译设置、英国支付提醒、机场交通、推荐应用和中英双语短句。</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-black text-britain-ink">Where are you coming from?</span>
          <select
            value={value.country}
            onChange={(event) => updateField('country', event.target.value as CountryId)}
            className="focus-ring w-full rounded-2xl border border-britain-ink/15 bg-britain-paper px-4 py-4 font-bold text-britain-ink sm:py-3"
          >
            {countries.map((country) => (
              <option key={country.id} value={country.id}>{country.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-britain-ink">Language</span>
          <select
            value={value.language}
            onChange={(event) => updateField('language', event.target.value as LanguageId)}
            className="focus-ring w-full rounded-2xl border border-britain-ink/15 bg-britain-paper px-4 py-4 font-bold text-britain-ink sm:py-3"
          >
            {languages.map((language) => (
              <option key={language.id} value={language.id}>{language.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-britain-ink">Arrival airport</span>
          <select
            value={value.airport}
            onChange={(event) => updateField('airport', event.target.value as AirportId)}
            className="focus-ring w-full rounded-2xl border border-britain-ink/15 bg-britain-paper px-4 py-4 font-bold text-britain-ink sm:py-3"
          >
            {airports.map((airport) => (
              <option key={airport.id} value={airport.id}>{airport.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-britain-ink">Destination city</span>
          <select
            value={value.city}
            onChange={(event) => updateField('city', event.target.value as CityId)}
            className="focus-ring w-full rounded-2xl border border-britain-ink/15 bg-britain-paper px-4 py-4 font-bold text-britain-ink sm:py-3"
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-britain-ink">Trip type</span>
          <select
            value={value.tripType}
            onChange={(event) => updateField('tripType', event.target.value as TripType)}
            className="focus-ring w-full rounded-2xl border border-britain-ink/15 bg-britain-paper px-4 py-4 font-bold text-britain-ink sm:py-3"
          >
            {tripTypes.map((tripType) => (
              <option key={tripType.id} value={tripType.id}>{tripType.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-black text-britain-ink">Trip length</span>
          <input
            type="number"
            min={1}
            max={365}
            inputMode="numeric"
            value={tripLengthDraft}
            onBlur={commitTripLength}
            onChange={(event) => handleTripLengthChange(event.target.value)}
            className="focus-ring w-full rounded-2xl border border-britain-ink/15 bg-britain-paper px-4 py-4 font-bold text-britain-ink sm:py-3"
          />
        </label>
      </div>

      <button
        type="submit"
        className="focus-ring mt-6 w-full rounded-2xl bg-britain-ink px-5 py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-britain-navy"
        data-track="generate-checklist"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export default ArrivalForm;
