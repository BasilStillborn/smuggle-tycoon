import type { PlayerState } from './types';

export function getOverdraftLimit(player: PlayerState): number {
  if (player.peakNetWorth >= 50000) return 5000;
  if (player.peakNetWorth >= 10000) return 2000;
  return 1000;
}

export function checkOverdraft(player: PlayerState): boolean {
  return player.cash < -getOverdraftLimit(player);
}

export function startTrip(player: PlayerState, amount: number): { player: PlayerState; success: boolean; message: string } {
  if (amount <= 0) {
    return { player, success: false, message: 'You must withdraw at least $1.' };
  }
  if (amount > player.bank) {
    return { player, success: false, message: `You only have $${player.bank.toLocaleString()} in the bank.` };
  }
  if (player.cash > 0) {
    return { player, success: false, message: 'You already have cash on hand. End your current trip first.' };
  }

  return {
    player: {
      ...player,
      bank: Math.max(0, player.bank - amount),
      cash: amount,
    },
    success: true,
    message: `Withdrew $${amount.toLocaleString()} from the bank. Cash on hand: ${amount.toLocaleString()}.`,
  };
}

export function endTrip(player: PlayerState, originId: string): { player: PlayerState; message: string; gameOver: boolean } {
  let updated = {
    ...player,
    bank: player.bank + player.cash,
    cash: 0,
    inventory: [],
    currentCountryId: originId,
    totalTrips: player.totalTrips + 1,
  };

  const totalWorth = updated.bank + updated.cash;
  if (totalWorth > player.peakNetWorth) {
    updated = { ...updated, peakNetWorth: totalWorth };
  }

  return {
    player: updated,
    message: `Returned to base. Cash deposited: $${player.cash.toLocaleString()}. Bank balance: ${updated.bank.toLocaleString()}.`,
    gameOver: false,
  };
}

export function transferFromBank(player: PlayerState, amount: number): { player: PlayerState; success: boolean; message: string } {
  if (amount <= 0) {
    return { player, success: false, message: 'Amount must be positive.' };
  }
  if (amount > player.bank) {
    return { player, success: false, message: `Only $${player.bank.toLocaleString()} in the bank.` };
  }
  return {
    player: { ...player, bank: player.bank - amount, cash: player.cash + amount },
    success: true,
    message: `Withdrew $${amount.toLocaleString()}.`,
  };
}

export function transferToBank(player: PlayerState, amount: number): { player: PlayerState; success: boolean; message: string } {
  if (amount <= 0) {
    return { player, success: false, message: 'Amount must be positive.' };
  }
  if (amount > player.cash) {
    return { player, success: false, message: `Only $${player.cash.toLocaleString()} cash on hand.` };
  }
  return {
    player: { ...player, cash: player.cash - amount, bank: player.bank + amount },
    success: true,
    message: `Deposited $${amount.toLocaleString()}.`,
  };
}
