import { recommendedApps } from '../data/chineseVisitor';
import { trackEvent } from '../lib/analytics';

function RecommendedApps() {
  return (
    <section className="mt-8 rounded-[1.5rem] border border-britain-ink/10 bg-white p-5 shadow-card sm:rounded-[2rem] sm:p-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-red">Recommended apps before landing</p>
        <h3 className="mt-2 font-serif text-2xl font-black tracking-tight text-britain-ink sm:text-3xl">中国游客出发前建议准备的工具</h3>
        <p className="mt-3 text-base font-semibold leading-7 text-britain-ink/65">Install and test important tools before departure. Do not wait until airport Wi-Fi, roaming, or payment problems appear.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendedApps.map((app) => (
          <article key={app.id} className="rounded-3xl border border-britain-ink/10 bg-britain-paper p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">{app.category}</p>
            <h4 className="mt-2 text-xl font-black text-britain-ink">
              {app.chineseName ? `${app.chineseName} / ${app.name}` : app.name}
            </h4>
            <p className="mt-3 text-sm font-bold leading-6 text-britain-ink/68">{app.description}</p>
            {app.caution && <p className="mt-3 rounded-2xl bg-white p-3 text-xs font-bold leading-5 text-britain-ink/55">{app.caution}</p>}
            {app.href ? (
              <a
                href={app.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('recommended_app_clicked', { app_id: app.id, app_name: app.name, visitor_segment: 'chinese' })}
                className="focus-ring mt-5 inline-flex w-full justify-center rounded-full bg-britain-ink px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-britain-navy sm:w-auto sm:py-2"
              >
                Open app site
              </a>
            ) : (
              <button
                type="button"
                onClick={() => trackEvent('recommended_app_clicked', { app_id: app.id, app_name: app.name, visitor_segment: 'chinese', placeholder: true })}
                className="focus-ring mt-5 inline-flex w-full justify-center rounded-full border border-britain-ink/15 px-4 py-3 text-sm font-black text-britain-ink transition hover:-translate-y-0.5 hover:bg-white sm:w-auto sm:py-2"
              >
                Placeholder
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default RecommendedApps;
