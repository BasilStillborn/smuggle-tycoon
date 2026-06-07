import { useState } from 'react';
import { bilingualPhrases } from '../data/chineseVisitor';
import { trackEvent } from '../lib/analytics';

function copyWithFallback(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function PhraseCopyCards() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(id: string, text: string) {
    await copyWithFallback(text);
    setCopiedId(id);
    trackEvent('phrase_copied', { phrase_id: id, visitor_segment: 'chinese' });
    window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800);
  }

  return (
    <section className="mt-8 rounded-[1.5rem] border border-white/12 bg-white/[0.07] p-5 shadow-soft sm:rounded-[2rem] sm:p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-britain-gold">Bilingual phrase cards</p>
        <h3 className="mt-2 font-serif text-2xl font-black tracking-tight text-white sm:text-3xl">可以直接复制或出示的英文句子</h3>
        <p className="mt-3 text-base font-semibold leading-7 text-white/68">Save these before leaving airport Wi-Fi. They are designed for practical UK moments, not textbook English.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bilingualPhrases.map((phrase) => (
          <article key={phrase.id} className="rounded-3xl bg-white p-4 text-britain-ink sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">{phrase.situation}</p>
                <h4 className="mt-1 text-lg font-black">{phrase.chineseSituation}</h4>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(phrase.id, phrase.english)}
                className="focus-ring shrink-0 rounded-full bg-britain-ink px-3 py-3 text-xs font-black text-white transition hover:bg-britain-navy sm:py-2"
              >
                {copiedId === phrase.id ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-4 text-base font-black leading-7 sm:text-lg">"{phrase.english}"</p>
            <p className="mt-3 text-sm font-bold leading-6 text-britain-ink/70">{phrase.chineseMeaning}</p>
            <p className="mt-3 rounded-2xl bg-britain-cream p-3 text-sm font-bold leading-6 text-britain-ink/62">{phrase.tip}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PhraseCopyCards;
