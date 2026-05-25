import type { PlayerState } from './types';

const BASE_CASH = 5000;
const BASE_CAPACITY = 50;
const BASE_STASH_CAPACITY = 100;

export function createPlayer(): PlayerState {
  return {
    cash: 0,
    bank: BASE_CASH,
    heat: 0,
    inventoryCapacity: BASE_CAPACITY,
    stashCapacity: BASE_STASH_CAPACITY,
    currentCountryId: 'london',
    inventory: [],
    stash: [],
    totalTrips: 0,
    totalProfit: 0,
    totalBusts: 0,
    runActive: true,
    reputation: 0,
    notoriety: 0,
    credit: 0,
    credibility: 0,
    peakNetWorth: 0,
    ownedAssets: [],
    unlockedContacts: [],
    visitedCountries: [],
  };
}

export function addCash(player: PlayerState, amount: number): PlayerState {
  return { ...player, cash: player.cash + amount };
}

export function deductCash(player: PlayerState, amount: number): PlayerState {
  return { ...player, cash: player.cash - amount };
}

export function setLocation(player: PlayerState, countryId: string): PlayerState {
  return { ...player, currentCountryId: countryId };
}

export function incrementTrips(player: PlayerState): PlayerState {
  return { ...player, totalTrips: player.totalTrips + 1 };
}

export function recordBust(player: PlayerState): PlayerState {
  return { ...player, totalBusts: player.totalBusts + 1 };
}

export function addReputation(player: PlayerState, amount: number): PlayerState {
  return { ...player, reputation: Math.min(100, Math.max(0, player.reputation + amount)) };
}

export function addNotoriety(player: PlayerState, amount: number): PlayerState {
  return { ...player, notoriety: Math.min(100, Math.max(0, player.notoriety + amount)) };
}

export function unlockContact(player: PlayerState, regionId: string): PlayerState {
  if (player.unlockedContacts.includes(regionId)) return player;
  return { ...player, unlockedContacts: [...player.unlockedContacts, regionId] };
}

export function addCredit(player: PlayerState, amount: number): PlayerState {
  return { ...player, credit: player.credit + amount };
}

export function deductCredit(player: PlayerState, amount: number): PlayerState {
  return { ...player, credit: Math.max(0, player.credit - amount) };
}

export function addCredibility(player: PlayerState, amount: number): PlayerState {
  return { ...player, credibility: Math.min(100, Math.max(0, player.credibility + amount)) };
}

export function deductCredibility(player: PlayerState, amount: number): PlayerState {
  return { ...player, credibility: Math.min(100, Math.max(0, player.credibility - amount)) };
}

export function addBank(player: PlayerState, amount: number): PlayerState {
  const updated = { ...player, bank: player.bank + amount };
  if (updated.bank + updated.cash > player.peakNetWorth) {
    return { ...updated, peakNetWorth: updated.bank + updated.cash };
  }
  return updated;
}

export function deductBank(player: PlayerState, amount: number): PlayerState {
  return { ...player, bank: Math.max(0, player.bank - amount) };
}

export function confiscateOnHand(player: PlayerState): PlayerState {
  return { ...player, cash: 0, inventory: [] };
}
