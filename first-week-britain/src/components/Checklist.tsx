import type { ArrivalProfile } from '../data/arrivals';
import { getAirport, getChecklist, getCity, getCountry, getTripType } from '../data/arrivals';

type ChecklistProps = {
  profile: ArrivalProfile;
  hasGenerated: boolean;
};

function Checklist({ profile, hasGenerated }: ChecklistProps) {
  const airport = getAirport(profile);
  const city = getCity(profile);
  const country = getCountry(profile);
  const tripType = getTripType(profile);
  const sections = getChecklist(profile);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:py-24">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-red">{hasGenerated ? 'Generated checklist' : 'Live sample checklist'}</p>
          <h2 className="mt-2 font-serif text-3xl font-black tracking-tight text-britain-ink sm:text-5xl">Your first-week command board.</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-britain-ink/65 sm:text-lg sm:leading-8">
            Built for a {tripType.label.toLowerCase()} arriving from {country.label} through {airport.label}, heading to {city.label} for {profile.tripLengthDays} days.
          </p>
        </div>
        <div className="rounded-3xl border border-britain-ink/10 bg-white px-5 py-4 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-britain-ink/45">Priority</p>
          <p className="mt-1 max-w-sm text-sm font-bold leading-6 text-britain-ink/75">{country.note}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {sections.map((section, index) => (
          <article key={section.title} className="rounded-[1.5rem] border border-britain-ink/10 bg-white p-4 shadow-soft sm:rounded-[1.75rem] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-britain-red">{section.timeframe}</p>
                <h3 className="mt-2 text-lg font-black leading-tight text-britain-ink sm:text-xl">{section.title}</h3>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-britain-ink text-sm font-black text-white">
                {index + 1}
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-britain-ink/60">{section.intent}</p>
            <div className="mt-5 space-y-3">
              {section.items.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl bg-britain-cream p-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-britain-green" />
                  <p className="text-sm font-bold leading-6 text-britain-ink/78">{item}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Checklist;
