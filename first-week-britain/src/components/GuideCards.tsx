import type { ArrivalProfile } from '../data/arrivals';
import { getGuideCards, phraseCards } from '../data/guides';
import { trackEvent } from '../lib/analytics';

type GuideCardsProps = {
  profile: ArrivalProfile;
};

function GuideCards({ profile }: GuideCardsProps) {
  const guideCards = getGuideCards(profile);

  return (
    <section id="guides" className="bg-britain-ink py-16 text-white lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-gold">Practical guide cards</p>
          <h2 className="mt-2 font-serif text-4xl font-black tracking-tight sm:text-5xl">Not a directory. A first-week operating system.</h2>
          <p className="mt-4 text-lg leading-8 text-white/70">Each card explains what to do, why it matters, and which official or partner slot should come next once the product is validated.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {guideCards.map((guide) => (
            <article key={guide.id} className="rounded-[1.75rem] border border-white/12 bg-white/[0.07] p-5 shadow-soft backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-britain-gold">{guide.eyebrow}</p>
              <h3 className="mt-2 text-2xl font-black leading-tight text-white">{guide.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-white/65">{guide.summary}</p>
              <div className="mt-5 space-y-3">
                {guide.steps.map((step) => (
                  <div key={step} className="rounded-2xl bg-white/8 p-3 text-sm font-bold leading-6 text-white/78">
                    {step}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/40">Good for</p>
              <p className="mt-1 text-sm font-bold leading-6 text-white/70">{guide.goodFor}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {guide.actions.map((action) => action.href ? (
                  <a
                    key={action.label}
                    href={action.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('guide_action_clicked', { guide_id: guide.id, action_label: action.label, action_kind: action.kind })}
                    className="focus-ring rounded-full bg-white px-4 py-2 text-sm font-black text-britain-ink transition hover:-translate-y-0.5"
                    data-track={`guide-${guide.id}-${action.kind}`}
                  >
                    {action.label}
                  </a>
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => trackEvent('guide_action_clicked', { guide_id: guide.id, action_label: action.label, action_kind: action.kind, placeholder: true })}
                    className="focus-ring rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white/80 transition hover:-translate-y-0.5 hover:bg-white/10"
                    data-affiliate-placeholder={action.kind === 'partner' ? 'true' : undefined}
                    data-track={`guide-${guide.id}-${action.kind}-placeholder`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/12 bg-white/[0.07] p-5 shadow-soft sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-gold">Phrase cards</p>
            <h3 className="mt-2 font-serif text-3xl font-black tracking-tight text-white">Sentences worth saving offline.</h3>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {phraseCards.map((phrase) => (
              <article key={phrase.situation} className="rounded-3xl bg-white p-5 text-britain-ink">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">{phrase.situation}</p>
                <p className="mt-3 text-lg font-black leading-7">"{phrase.sayThis}"</p>
                <p className="mt-3 text-sm font-bold leading-6 text-britain-ink/60">{phrase.means}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GuideCards;
