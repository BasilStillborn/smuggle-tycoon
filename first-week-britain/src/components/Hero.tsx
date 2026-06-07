import { trackEvent } from '../lib/analytics';

type HeroProps = {
  onStart: () => void;
};

const proofPoints = ['Arrival checklist', 'Transport and payments', 'Emergency basics', 'Official links'];

function Hero({ onStart }: HeroProps) {
  function handleStart() {
    trackEvent('hero_cta_clicked', { location: 'hero' });
    onStart();
  }

  return (
    <header className="relative overflow-hidden bg-britain-ink text-white">
      <div className="absolute inset-0 opacity-25 station-stripe" />
      <div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-britain-red blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-britain-blue/60 blur-3xl" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
        <a href="#top" className="focus-ring rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold tracking-wide text-white backdrop-blur sm:px-4 sm:text-sm">
          First Week in Britain
        </a>
        <div className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          <a className="hover:text-white" href="#checklist">Checklist</a>
          <a className="hover:text-white" href="#guides">Guides</a>
          <a className="hover:text-white" href="#official">Official links</a>
        </div>
      </nav>

      <section id="top" className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:pb-28 lg:pt-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 backdrop-blur sm:mb-6 sm:px-4 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-britain-red" />
            London MVP now, UK-wide later
          </div>
          <h1 className="max-w-4xl font-serif text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl sm:leading-[0.95] lg:text-7xl">
            Land in Britain with a plan, not a pile of tabs.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:mt-6 sm:text-xl sm:leading-8">
            A practical arrival assistant for first-time visitors, students, and business travellers. It turns airport, payment, transport, health, and etiquette confusion into a simple first-week checklist.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleStart}
              className="focus-ring w-full rounded-full bg-britain-red px-6 py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-700 sm:w-auto"
              data-track="hero-start"
            >
              Build my checklist
            </button>
            <a
              href="#guides"
              className="focus-ring w-full rounded-full border border-white/25 bg-white/10 px-6 py-4 text-center text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto"
            >
              See what it covers
            </a>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-3 shadow-card backdrop-blur-md sm:rounded-[2rem] sm:p-4">
          <div className="rounded-[1.25rem] bg-britain-paper p-4 text-britain-ink shadow-soft sm:rounded-[1.5rem] sm:p-5">
            <div className="flex items-center justify-between border-b border-britain-ink/10 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-britain-red">Arrival board</p>
                <h2 className="mt-1 text-2xl font-black">Just landed</h2>
              </div>
              <div className="rounded-2xl bg-britain-ink px-3 py-2 text-sm font-black text-white">LHR</div>
            </div>
            <div className="mt-5 space-y-3">
              {proofPoints.map((point, index) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-britain-mist text-sm font-black text-britain-navy">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-black">{point}</p>
                    <p className="mt-1 text-sm leading-6 text-britain-ink/65">Plain-English actions, not generic travel inspiration.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}

export default Hero;
