import type { ArrivalProfile } from '../data/arrivals';
import { getAirport, getCity, getCountry, getTripType } from '../data/arrivals';

type AppLocale = 'en' | 'zh';

type AppShellProps = {
  profile: ArrivalProfile;
  onEditTrip: () => void;
  locale?: AppLocale;
};

const copy: Record<AppLocale, { eyebrow: string; title: string; edit: string; days: string }> = {
  en: {
    eyebrow: 'Arrival assistant',
    title: 'First Week in Britain',
    edit: 'Edit trip',
    days: 'days',
  },
  zh: {
    eyebrow: '英国到达助手',
    title: '英国第一周',
    edit: '修改行程',
    days: '天',
  },
};

function AppShell({ profile, onEditTrip, locale = 'en' }: AppShellProps) {
  const country = getCountry(profile);
  const airport = getAirport(profile);
  const city = getCity(profile);
  const tripType = getTripType(profile);
  const t = copy[locale];

  return (
    <header className="sticky top-0 z-30 border-b border-britain-ink/10 bg-britain-paper/95 px-4 py-3 shadow-soft backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-britain-red">{t.eyebrow}</p>
          <h1 className="truncate font-serif text-xl font-black tracking-tight text-britain-ink sm:text-2xl">{t.title}</h1>
          <p className="mt-1 truncate text-xs font-bold text-britain-ink/58 sm:text-sm">
            {country.label} · {airport.label} · {city.label} · {tripType.label} · {profile.tripLengthDays} {t.days}
          </p>
        </div>
        <button
          type="button"
          onClick={onEditTrip}
          className="focus-ring shrink-0 rounded-full bg-britain-ink px-4 py-3 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-britain-navy"
        >
          {t.edit}
        </button>
      </div>
    </header>
  );
}

export default AppShell;
