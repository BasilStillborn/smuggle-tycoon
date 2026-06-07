import { trackEvent } from '../lib/analytics';

type LondonChecklistSeoProps = {
  onStart: () => void;
};

const checklistBlocks = [
  {
    title: 'Before You Fly',
    items: ['Check if you need a UK visa', 'Confirm roaming or buy an eSIM', 'Save your hotel address offline', 'Check your payment card works abroad'],
  },
  {
    title: 'At Heathrow Or Gatwick',
    items: ['Ignore unofficial taxi offers', 'Choose train, Tube, coach, or licensed taxi', 'Activate mobile data before leaving Wi-Fi', 'Check rail disruption before buying a ticket'],
  },
  {
    title: 'First London Journey',
    items: ['Use the same contactless card in and out', 'Stand on the right on escalators', 'Keep luggage close on busy platforms', 'Check the last train if arriving late'],
  },
  {
    title: 'First Evening',
    items: ['Find nearest pharmacy and supermarket', 'Save 999 and NHS 111', 'Check tomorrow weather', 'Keep passport and payment cards separate'],
  },
];

const faqs = [
  {
    question: 'Do tourists need an Oyster card in London?',
    answer: 'Many visitors can use contactless cards or mobile wallets instead. The key rule is to use the same card or phone for each journey.',
  },
  {
    question: 'Is cash needed in London?',
    answer: 'Cash is useful as backup, but cards and mobile wallets are widely used. Some places are card-only, especially in central London.',
  },
  {
    question: 'What number should a tourist call in a UK emergency?',
    answer: 'Call 999 for police, ambulance, or fire emergencies. Use NHS 111 for urgent medical advice when it is not life-threatening.',
  },
];

function LondonChecklistSeo({ onStart }: LondonChecklistSeoProps) {
  function handleClick() {
    trackEvent('seo_checklist_cta_clicked', { location: 'london_seo_section' });
    onStart();
  }

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-red">SEO test page block</p>
            <h2 className="mt-2 font-serif text-3xl font-black tracking-tight text-britain-ink sm:text-5xl">First time visiting London checklist</h2>
            <p className="mt-4 text-base font-semibold leading-7 text-britain-ink/68 sm:text-lg sm:leading-8">
              If you are visiting London for the first time, the hard part is not finding famous attractions. The hard part is landing, getting connected, paying for transport, reaching your hotel, and knowing what to do if something goes wrong.
            </p>
            <p className="mt-4 text-base font-semibold leading-7 text-britain-ink/62">
              This MVP targets searches such as first time visiting London, Heathrow to London first time visitor, UK SIM card for tourists, contactless on the Tube, and UK emergency number for tourists.
            </p>
            <button
              type="button"
              onClick={handleClick}
              className="focus-ring mt-7 w-full rounded-full bg-britain-red px-6 py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-700 sm:w-auto"
            >
              Generate a London arrival checklist
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {checklistBlocks.map((block) => (
              <article key={block.title} className="rounded-[1.5rem] border border-britain-ink/10 bg-britain-paper p-5 shadow-soft">
                <h3 className="text-xl font-black text-britain-ink">{block.title}</h3>
                <div className="mt-4 space-y-3">
                  {block.items.map((item) => (
                    <p key={item} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold leading-6 text-britain-ink/70">{item}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[1.5rem] bg-britain-ink p-5 text-white shadow-card sm:rounded-[2rem] sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-gold">Common questions</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-3xl bg-white/8 p-5">
                <h3 className="text-lg font-black leading-7">{faq.question}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-white/68">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LondonChecklistSeo;
