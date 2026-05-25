import type { PlayerState, Country, MarketPrice, Good, DirectorState } from './types';
import { GOODS } from './goods';

function calcBuyPrice(
  good: Good,
  country: Country,
  enforcementAttention: number,
): number {
  const demandMod = country.demandModifiers[good.id] ?? 1.0;
  const enforcementNorm = enforcementAttention / 100;
  const enforcementPremium = 1 + enforcementNorm * 0.5;
  const demandFactor = 1 + demandMod;
  const price = good.baseValuePerUnit * demandFactor * enforcementPremium;
  return Math.max(1, Math.floor(price));
}

function calcSellPrice(
  buyPrice: number,
  demand: number,
): number {
  const multiplier = 1.0 + (demand / 100) * 2.0;
  return Math.max(1, Math.floor(buyPrice * multiplier));
}

export function generateMarketPrices(
  country: Country,
  director?: DirectorState,
  recentTradeVolume?: number,
  playerHeat?: number,
): MarketPrice[] {
  const enforcement = director?.enforcementAttention ?? 10;
  const heat = playerHeat ?? 0;

  return GOODS.map((good) => {
    const buyPrice = calcBuyPrice(good, country, enforcement);
    const baseDemand = Math.floor(5 + Math.random() * 95);
    const demandShift = Math.floor((100 - enforcement) * 0.2);
    const demand = Math.max(5, Math.min(100, baseDemand + demandShift));
    const sellPrice = calcSellPrice(buyPrice, demand);
    const spreadPct = Math.round(((sellPrice - buyPrice) / buyPrice) * 100);
    return {
      goodId: good.id,
      goodName: good.name,
      buyPrice,
      sellPrice,
      demand,
      spreadPct,
    };
  });
}
