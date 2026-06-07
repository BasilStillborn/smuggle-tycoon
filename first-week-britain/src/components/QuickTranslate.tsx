import { useState } from 'react';
import { trackEvent } from '../lib/analytics';

function buildGoogleTranslateUrl(text: string) {
  const trimmedText = text.trim();
  const baseUrl = 'https://translate.google.com/?sl=zh-CN&tl=en&op=translate';

  return trimmedText ? `${baseUrl}&text=${encodeURIComponent(trimmedText)}` : baseUrl;
}

function QuickTranslate() {
  const [sourceText, setSourceText] = useState('');
  const hasText = sourceText.trim().length > 0;
  const googleTranslateUrl = buildGoogleTranslateUrl(sourceText);

  function trackGoogleClick() {
    trackEvent('quick_translate_google_clicked', { has_text: hasText });
  }

  function trackBaiduClick() {
    trackEvent('quick_translate_baidu_clicked', { has_text: hasText });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-britain-ink p-5 text-white shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-gold">ZH → EN</p>
        <h3 className="mt-2 font-serif text-3xl font-black tracking-tight">快速译成英文</h3>
        <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
          给酒店、司机、药店或车站工作人员看。输入内容不会保存到本应用。
        </p>
      </div>

      <label className="block rounded-3xl border border-britain-ink/10 bg-white p-5 shadow-card">
        <span className="mb-2 block text-sm font-black text-britain-ink">输入你想说的中文</span>
        <textarea
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          rows={6}
          placeholder="比如：我想去这个地址，可以刷卡吗？"
          className="focus-ring w-full resize-none rounded-2xl border border-britain-ink/15 bg-britain-paper px-4 py-4 text-base font-bold leading-7 text-britain-ink outline-none"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={googleTranslateUrl}
          target="_blank"
          rel="noreferrer"
          onClick={trackGoogleClick}
          className="focus-ring inline-flex justify-center rounded-2xl bg-britain-red px-5 py-4 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-700"
        >
          用 Google 翻译成英文
        </a>
        <a
          href="https://fanyi.baidu.com/"
          target="_blank"
          rel="noreferrer"
          onClick={trackBaiduClick}
          className="focus-ring inline-flex justify-center rounded-2xl bg-britain-ink px-5 py-4 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-britain-navy"
        >
          打开百度翻译
        </a>
      </div>

      <p className="rounded-2xl bg-britain-cream px-4 py-3 text-xs font-bold leading-5 text-britain-ink/58">
        提醒：Google 或百度会按各自服务处理你输入的内容。本应用不会保存或上传这段文字。
      </p>
    </div>
  );
}

export default QuickTranslate;
