import type { PlayerState } from './types';

export const MAX_HEAT = 100;

export function addHeat(player: PlayerState, amount: number): PlayerState {
  return { ...player, heat: Math.min(MAX_HEAT, player.heat + amount) };
}

export function reduceHeat(player: PlayerState, amount: number): PlayerState {
  return { ...player, heat: Math.max(0, player.heat - amount) };
}

export function getHeatLevel(player: PlayerState): 'low' | 'medium' | 'high' | 'critical' {
  if (player.heat >= 80) return 'critical';
  if (player.heat >= 50) return 'high';
  if (player.heat >= 25) return 'medium';
  return 'low';
}

export function getInspectionChance(player: PlayerState): number {
  return Math.min(0.8, 0.1 + player.heat * 0.007);
}

export function getBustChance(player: PlayerState): number {
  return Math.min(0.6, player.heat * 0.005);
}

export function getFineAmount(player: PlayerState, cargoValue: number): number {
  return Math.floor(cargoValue * (player.heat / MAX_HEAT) * 0.5);
}

export function getQuantityRiskMultiplier(quantity: number, risk: number): number {
  const base = 1 + Math.pow(quantity / 10, 1.3);
  const riskFactor = 1 + (risk - 1) * 0.15;
  return Math.round(base * riskFactor * 10) / 10;
}
