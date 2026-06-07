import type { ArrivalProfile } from '../data/arrivals';
import { getAirport, getCity, getCountry, getTripType } from '../data/arrivals';

type AppLocale = 'en' | 'zh';

type AppShellProps = {
  profile: ArrivalProfile;
  onEditTrip: () => void;
  onQuickTranslate?: () => void;
  locale?: AppLocale;
};

const copy: Record<AppLocale, { eyebrow: string; title: string; edit: string; quickTranslate: string; days: string }> = {
  en: {
    eyebrow: 'Arrival assistant',
    title: 'First Week in Britain',
    edit: 'Edit trip',
    quickTranslate: 'Translate',
    days: 'days',
  },
  zh: {
    eyebrow: '中国游客英国工具箱',
    title: '刚到英国先看这个',
    edit: '修改行程',
    quickTranslate: '译成英文',
    days: '天',
  },
};

const zhProfileLabels: Record<string, Record<string, string>> = {
  country: {
    china: '中国出发',
    india: '印度出发',
    usa: '美国出发',
    eu: '欧盟/欧洲出发',
    gulf: '海湾地区出发',
    other: '其他国家出发',
  },
  airport: {
    heathrow: '希思罗 Heathrow',
    gatwick: '盖特威克 Gatwick',
  },
  city: {
    london: '伦敦',
  },
  tripType: {
    tourist: '旅游',
    student: '留学',
    business: '商务',
  },
};

function profileLabel(locale: AppLocale, group: keyof typeof zhProfileLabels, id: string, fallback: string) {
  return locale === 'zh' ? zhProfileLabels[group][id] ?? fallback : fallback;
}

function AppShell({ profile, onEditTrip, onQuickTranslate, locale = 'en' }: AppShellProps) {
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
            {profileLabel(locale, 'country', profile.country, country.label)} · {profileLabel(locale, 'airport', profile.airport, airport.label)} · {profileLabel(locale, 'city', profile.city, city.label)} · {profileLabel(locale, 'tripType', profile.tripType, tripType.label)} · {profile.tripLengthDays} {t.days}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {locale === 'zh' && onQuickTranslate && (
            <button
              type="button"
              onClick={onQuickTranslate}
              className="focus-ring whitespace-nowrap rounded-full bg-britain-red px-4 py-3 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              {t.quickTranslate}
            </button>
          )}
          <button
            type="button"
            onClick={onEditTrip}
            className="focus-ring whitespace-nowrap rounded-full bg-britain-ink px-4 py-3 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-britain-navy"
          >
            {t.edit}
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppShell;
