import type { PlayerState, InventoryItem, Good } from './types';
import { GOODS } from './goods';

export function getUsedCapacity(player: PlayerState): number {
  return player.inventory.reduce((total, item) => {
    const good = GOODS.find((g) => g.id === item.goodId);
    return total + (good ? good.weight * item.quantity : 0);
  }, 0);
}

export function getRemainingCapacity(player: PlayerState): number {
  return player.inventoryCapacity - getUsedCapacity(player);
}

export function addGood(player: PlayerState, goodId: string, quantity: number): PlayerState {
  const good = GOODS.find((g) => g.id === goodId);
  if (!good) return player;

  const weightNeeded = good.weight * quantity;
  const remaining = getRemainingCapacity(player);
  if (weightNeeded > remaining) return player;

  const existing = player.inventory.find((i) => i.goodId === goodId);
  if (existing) {
    return {
      ...player,
      inventory: player.inventory.map((i) =>
        i.goodId === goodId ? { ...i, quantity: i.quantity + quantity } : i
      ),
    };
  }

  return {
    ...player,
    inventory: [...player.inventory, { goodId, quantity }],
  };
}

export function removeGood(player: PlayerState, goodId: string, quantity: number): PlayerState {
  const existing = player.inventory.find((i) => i.goodId === goodId);
  if (!existing || existing.quantity < quantity) return player;

  const newQuantity = existing.quantity - quantity;
  return {
    ...player,
    inventory: newQuantity <= 0
      ? player.inventory.filter((i) => i.goodId !== goodId)
      : player.inventory.map((i) =>
          i.goodId === goodId ? { ...i, quantity: newQuantity } : i
        ),
  };
}

export function getGoodQuantity(player: PlayerState, goodId: string): number {
  return player.inventory.find((i) => i.goodId === goodId)?.quantity ?? 0;
}

export function getInventoryValue(player: PlayerState, marketPrices: { goodId: string; sellPrice: number }[]): number {
  return player.inventory.reduce((total, item) => {
    const price = marketPrices.find((p) => p.goodId === item.goodId)?.sellPrice ?? 0;
    return total + price * item.quantity;
  }, 0);
}
