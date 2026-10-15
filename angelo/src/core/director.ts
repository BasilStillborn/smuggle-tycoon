import type { DirectorState, PlayerState, GameState } from './types';
import { getActiveOperationalBenefits } from './assets';

export function createDirector(): DirectorState {
  return {
    tension: 30,
    boredom: 0,
    timeSinceLastEvent: 0,
    playerWealthTier: 0,
    recentRiskScore: 0,
    enforcementAttention: 10,
    eventCooldown: 0,
  };
}

export function getWealthTier(cash: number): number {
  if (cash >= 50000) return 5;
  if (cash >= 20000) return 4;
  if (cash >= 10000) return 3;
  if (cash >= 5000) return 2;
  if (cash >= 1000) return 1;
  return 0;
}

export function updateDirector(
  director: DirectorState,
  player: PlayerState,
  gameState: Pick<GameState, 'turn'>
): DirectorState {
  const wealthTier = getWealthTier(player.cash);
  const inventoryRatio = player.inventory.length > 0
    ? player.inventory.reduce((s, i) => s + i.quantity, 0) / player.inventoryCapacity
    : 0;

  let tension = director.tension;
  let boredom = director.boredom;
  let enforcementAttention = director.enforcementAttention;

  const ops = getActiveOperationalBenefits(player);
  const opSecurity = (ops.inspectionReduction + ops.bustReduction) / 2;
  tension = Math.max(0, Math.min(100, tension + player.heat * 0.1 - 0.5 - opSecurity * 0.5));
  boredom = Math.max(0, Math.min(100, boredom + 2 - (player.heat * 0.05) - player.notoriety * 0.02));

  const riskScore = (inventoryRatio * 0.4 + (player.heat / 100) * 0.6) * 100;
  const recentRiskScore = Math.max(0, Math.min(100, (director.recentRiskScore * 0.7 + riskScore * 0.3)));

  if (boredom > 60) {
    enforcementAttention = Math.max(5, enforcementAttention + 5);
    tension = Math.min(100, tension + 10);
  }

  if (wealthTier >= 4) {
    enforcementAttention = Math.min(100, enforcementAttention + 2);
    tension = Math.min(100, tension + 1);
  } else if (wealthTier === 3) {
    enforcementAttention = Math.min(100, enforcementAttention + 1);
  }

  if (player.notoriety > 0) {
    enforcementAttention = Math.min(100, enforcementAttention + player.notoriety * 0.15);
  }

  if (tension > 70) {
    enforcementAttention = Math.max(10, enforcementAttention - 5);
    boredom = Math.max(0, boredom - 5);
  }

  const eventCooldown = Math.max(0, director.eventCooldown - 1);

  const wealthFloor = wealthTier >= 4 ? 25 : wealthTier >= 3 ? 15 : wealthTier >= 2 ? 10 : 5;

  return {
    tension: Math.round(tension),
    boredom: Math.round(boredom),
    timeSinceLastEvent: director.timeSinceLastEvent + 1,
    playerWealthTier: wealthTier,
    recentRiskScore: Math.round(recentRiskScore),
    enforcementAttention: Math.round(Math.max(wealthFloor, Math.min(100, enforcementAttention))),
    eventCooldown,
  };
}

export type ForcedEventReason = 'boredom_peak' | 'tension_spike' | 'asset_hunt' | null;

export function getForcedEvent(director: DirectorState, player: PlayerState): ForcedEventReason {
  if (director.eventCooldown > 0) return null;
  if (director.boredom >= 80) {
    return 'boredom_peak';
  }
  if (director.tension >= 80) {
    return 'tension_spike';
  }
  if (player.ownedAssets.length >= 3 && director.timeSinceLastEvent > 8) {
    return 'asset_hunt';
  }
  return null;
}

export function getDirectorEventChance(director: DirectorState): number {
  let baseChance = 0.1;

  if (director.boredom > 70) baseChance += 0.2;
  else if (director.boredom > 50) baseChance += 0.1;

  if (director.tension > 70) baseChance -= 0.1;
  else if (director.tension < 20) baseChance += 0.15;

  if (director.timeSinceLastEvent > 10) {
    baseChance += 0.05 * Math.floor(director.timeSinceLastEvent / 5);
  }

  return Math.max(0.05, Math.min(0.6, baseChance));
}

export function getDirectorEventType(director: DirectorState): 'positive' | 'negative' | 'neutral' {
  if (director.tension > 65) return 'positive';
  if (director.boredom > 60) return 'negative';
  if (director.recentRiskScore > 60) return 'negative';
  if (director.recentRiskScore < 20 && director.boredom > 40) return 'positive';
  return Math.random() < 0.5 ? 'positive' : 'negative';
}
