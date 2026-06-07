import { useEffect, useState } from 'react';
import { trackEvent } from '../lib/analytics';

const RATE_API_URL = 'https://api.frankfurter.dev/v1/latest?from=GBP&to=CNY';
const CACHE_KEY = 'first-week-britain-gbp-cny-rate-v1';
const FALLBACK_RATE = 9.15;

type Direction = 'gbp-to-cny' | 'cny-to-gbp';
type RateSource = 'live' | 'cached' | 'fallback';

type CachedRate = {
  rate: number;
  date: string;
  fetchedAt: number;
};

type RateApiResponse = {
  date?: string;
  rates?: {
    CNY?: number;
  };
};

function readCachedRate(): CachedRate | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CachedRate;
    if (!Number.isFinite(parsed.rate) || parsed.rate <= 0) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function saveCachedRate(rate: CachedRate) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(rate));
  } catch {
    // Local storage can fail in private browsing. The converter still works with memory state.
  }
}

function formatAmount(value: number, currency: 'GBP' | 'CNY') {
  return new Intl.NumberFormat(currency === 'GBP' ? 'en-GB' : 'zh-CN', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'GBP' ? 2 : 0,
  }).format(value);
}

function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [direction, setDirection] = useState<Direction>('gbp-to-cny');
  const [rate, setRate] = useState(FALLBACK_RATE);
  const [rateDate, setRateDate] = useState('备用汇率');
  const [source, setSource] = useState<RateSource>('fallback');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cached = readCachedRate();
    if (cached) {
      setRate(cached.rate);
      setRateDate(cached.date);
      setSource('cached');
    }

    void refreshRate(cached);
  }, []);

  async function refreshRate(cachedRate = readCachedRate()) {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(RATE_API_URL);
      if (!response.ok) {
        throw new Error(`Currency API returned ${response.status}`);
      }

      const data = await response.json() as RateApiResponse;
      const nextRate = data.rates?.CNY;
      if (!Number.isFinite(nextRate) || !nextRate || nextRate <= 0) {
        throw new Error('Currency API response was missing CNY rate');
      }

      const nextCachedRate = {
        rate: nextRate,
        date: data.date ?? new Date().toISOString().slice(0, 10),
        fetchedAt: Date.now(),
      };

      setRate(nextCachedRate.rate);
      setRateDate(nextCachedRate.date);
      setSource('live');
      saveCachedRate(nextCachedRate);
      trackEvent('currency_rate_loaded', { source: 'live', pair: 'GBP_CNY' });
    } catch (apiError) {
      console.error(apiError);
      if (cachedRate) {
        setRate(cachedRate.rate);
        setRateDate(cachedRate.date);
        setSource('cached');
        setError('实时汇率暂时没取到，先用上次缓存的汇率。');
        trackEvent('currency_rate_loaded', { source: 'cached', pair: 'GBP_CNY' });
      } else {
        setRate(FALLBACK_RATE);
        setRateDate('备用汇率');
        setSource('fallback');
        setError('实时汇率暂时没取到，先用备用汇率估算。');
        trackEvent('currency_rate_loaded', { source: 'fallback', pair: 'GBP_CNY' });
      }
    } finally {
      setLoading(false);
    }
  }

  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? Math.max(0, numericAmount) : 0;
  const convertedAmount = direction === 'gbp-to-cny' ? safeAmount * rate : safeAmount / rate;
  const fromCurrency = direction === 'gbp-to-cny' ? 'GBP' : 'CNY';
  const toCurrency = direction === 'gbp-to-cny' ? 'CNY' : 'GBP';
  const sourceLabel = source === 'live' ? '实时汇率' : source === 'cached' ? '缓存汇率' : '备用汇率';

  function swapDirection() {
    setDirection((current) => current === 'gbp-to-cny' ? 'cny-to-gbp' : 'gbp-to-cny');
    trackEvent('currency_converter_swapped', { pair: 'GBP_CNY' });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-britain-ink p-5 text-white shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-gold">GBP / CNY</p>
        <h3 className="mt-2 font-serif text-3xl font-black tracking-tight">英镑人民币换算</h3>
        <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
          先心里有个数，别在收银台或打车时临时换算到发懵。
        </p>
      </div>

      <div className="rounded-3xl border border-britain-ink/10 bg-white p-5 shadow-card">
        <label className="block">
          <span className="mb-2 block text-sm font-black text-britain-ink">输入金额</span>
          <div className="flex overflow-hidden rounded-2xl border border-britain-ink/15 bg-britain-paper">
            <span className="flex min-w-20 items-center justify-center bg-britain-ink px-4 text-sm font-black text-white">
              {fromCurrency}
            </span>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="focus-ring min-w-0 flex-1 bg-transparent px-4 py-4 text-2xl font-black text-britain-ink outline-none"
            />
          </div>
        </label>

        <div className="mt-4 rounded-3xl bg-britain-cream p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-britain-red">估算结果</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-britain-ink">
            {formatAmount(convertedAmount, toCurrency)}
          </p>
          <p className="mt-2 text-sm font-bold text-britain-ink/58">
            {formatAmount(safeAmount, fromCurrency)} ≈ {formatAmount(convertedAmount, toCurrency)}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={swapDirection}
            className="focus-ring rounded-2xl bg-britain-red px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
          >
            切换方向
          </button>
          <button
            type="button"
            onClick={() => refreshRate()}
            disabled={loading}
            className="focus-ring rounded-2xl bg-britain-ink px-4 py-3 text-sm font-black text-white transition hover:bg-britain-navy disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? '更新中...' : '刷新实时汇率'}
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-3 text-sm font-bold leading-6 text-britain-ink/65 ring-1 ring-britain-ink/10">
          <p>£1 ≈ ¥{rate.toFixed(2)} · {sourceLabel} · {rateDate}</p>
          {error && <p className="mt-2 text-britain-red">{error}</p>}
          <p className="mt-2 text-xs leading-5 text-britain-ink/50">
            汇率仅供参考，实际扣款以银行、支付平台或发卡机构为准。
          </p>
        </div>
      </div>
    </div>
  );
}

export default CurrencyConverter;
