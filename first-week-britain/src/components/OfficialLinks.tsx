import type { ArrivalProfile } from '../data/arrivals';
import { getAirport, getCity } from '../data/arrivals';
import { getOfficialLinks } from '../data/guides';
import { trackEvent } from '../lib/analytics';

type OfficialLinksProps = {
  profile: ArrivalProfile;
};

function OfficialLinks({ profile }: OfficialLinksProps) {
  const airport = getAirport(profile);
  const city = getCity(profile);
  const links = getOfficialLinks(profile.airport);

  return (
    <section id="official" className="paper-texture py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="rounded-[1.5rem] border border-britain-ink/10 bg-britain-paper p-5 shadow-soft sm:rounded-[2rem] sm:p-6 lg:sticky lg:top-6">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-red">Source-backed</p>
            <h2 className="mt-2 font-serif text-3xl font-black tracking-tight text-britain-ink sm:text-4xl">Official links, simplified.</h2>
            <p className="mt-4 text-base font-semibold leading-7 text-britain-ink/65">
              The app should not pretend to be the government, TfL, NHS, or an airport. It should translate trusted sources into clear visitor actions.
            </p>
            <div className="mt-6 rounded-3xl bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-ink/45">Current scope</p>
              <p className="mt-2 font-black text-britain-ink">{airport.label} to {city.label}</p>
              <p className="mt-1 text-sm font-bold leading-6 text-britain-ink/60">London-first content, with a structure ready for Manchester, Edinburgh, Birmingham, Oxford, and Cambridge.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('official_link_clicked', { label: link.label, tag: link.tag, airport: profile.airport })}
                className="focus-ring group rounded-[1.5rem] border border-britain-ink/10 bg-white p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-card sm:p-5"
                data-track={`official-${link.tag.toLowerCase()}`}
              >
                <div className="mb-5 inline-flex rounded-full bg-britain-mist px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-britain-navy">
                  {link.tag}
                </div>
                <h3 className="text-xl font-black leading-tight text-britain-ink group-hover:text-britain-red">{link.label}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-britain-ink/62">{link.description}</p>
                <p className="mt-5 text-sm font-black text-britain-red">Open source</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OfficialLinks;
