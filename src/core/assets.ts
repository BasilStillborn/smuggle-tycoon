import type { PlayerState, AssetClass, OperationalBenefits } from './types';
import { addNotoriety, unlockContact } from './player';

export interface StatusAsset {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'watch' | 'jewelry' | 'clothing' | 'vehicle' | 'property' | 'storage';
  class: AssetClass;
  visualTier: 1 | 2 | 3;
  requiredReputation: number;
  requiredNetWorth: number;
  creditValue: number;
  stashBonus?: number;
  notorietyBonus?: number;
  regionContacts?: string[];
  operationalBenefits?: OperationalBenefits;
  requiresAsset?: string;
}

export function getClassLabel(assetClass: AssetClass): string {
  switch (assetClass) {
    case 'cosmetic': return 'Type I — Cosmetic';
    case 'functional': return 'Type II — Status';
    case 'operational': return 'Type III — Utility';
  }
}

export function getClassShortLabel(assetClass: AssetClass): string {
  switch (assetClass) {
    case 'cosmetic': return 'Cosmetic';
    case 'functional': return 'Status';
    case 'operational': return 'Utility';
  }
}

export function getClassDescription(assetClass: AssetClass): string {
  switch (assetClass) {
    case 'cosmetic': return 'Increases credit score. Sellable at 50% value.';
    case 'functional': return 'Unlocks notoriety and regional contacts. Sellable at 40% value.';
    case 'operational': return 'Modifies core probabilities. Sellable at 30% value.';
  }
}

export const STATUS_ASSETS: StatusAsset[] = [
  // Type I — Cosmetic
  { id: 'simple_watch', name: 'Simple Watch', description: 'A basic steel quartz watch. Tells time.', price: 50, category: 'watch', class: 'cosmetic', visualTier: 1, requiredReputation: 0, requiredNetWorth: 0, creditValue: 1 },
  { id: 'gold_automatic_watch', name: 'Gold Automatic Watch', description: 'Swiss movement. Solid gold case. Quiet luxury.', price: 3500, category: 'watch', class: 'cosmetic', visualTier: 2, requiredReputation: 5, requiredNetWorth: 8000, creditValue: 350 },
  { id: 'platinum_tourbillon_watch', name: 'Platinum Tourbillon Watch', description: 'Rare. Mechanical. A statement only the truly wealthy understand.', price: 25000, category: 'watch', class: 'cosmetic', visualTier: 3, requiredReputation: 25, requiredNetWorth: 50000, creditValue: 2500 },
  { id: 'fake_leather_jacket', name: 'Fake Leather Jacket', description: 'Faux leather. Passable at night. Cheap fake shit thing with a racing stripe down it — you\'re going to look like a right bell end in this.', price: 80, category: 'clothing', class: 'cosmetic', visualTier: 1, requiredReputation: 0, requiredNetWorth: 0, creditValue: 1 },
  { id: 'real_leather_jacket', name: 'Real Leather Jacket', description: 'Black Italian real leather. This is fucking cool. You look badass in this. Proper stitching. Proper weight. Makes the fake one look like a bin bag.', price: 800, category: 'clothing', class: 'cosmetic', visualTier: 1, requiredReputation: 0, requiredNetWorth: 2000, creditValue: 80 },
  { id: 'gold_chain', name: 'Gold Chain', description: 'Heavy. Flashy. Impossible to ignore.', price: 1800, category: 'jewelry', class: 'cosmetic', visualTier: 2, requiredReputation: 5, requiredNetWorth: 5000, creditValue: 180 },
  { id: 'designer_suit', name: 'Designer Suit', description: 'Armani cut. Silk lining. You are the product now.', price: 5000, category: 'clothing', class: 'cosmetic', visualTier: 2, requiredReputation: 10, requiredNetWorth: 12000, creditValue: 500 },
  { id: 'designer_tracksuit', name: 'Designer Tracksuit', description: 'Matching top and bottom. Roadman who just won the lottery — all the menace, none of the poverty. Makes you look like a right fucking twat... some people like that sort of thing.', price: 5000, category: 'clothing', class: 'cosmetic', visualTier: 2, requiredReputation: 10, requiredNetWorth: 12000, creditValue: 500 },
  { id: 'mink_fur_coat', name: 'Mink Fur Coat', description: 'Real mink. Oligarch\'s mistress or 1970s pimp. Only a complete nonce would wear something like this... keeps you warm in winter though.', price: 6000, category: 'clothing', class: 'cosmetic', visualTier: 2, requiredReputation: 10, requiredNetWorth: 15000, creditValue: 600 },
  { id: 'diamond_ring', name: 'Diamond Ring', description: 'Three carats. Untraceable.', price: 12000, category: 'jewelry', class: 'cosmetic', visualTier: 3, requiredReputation: 20, requiredNetWorth: 40000, creditValue: 1200 },
  // Type II — Functional
  { id: 'luxury_sports_car', name: 'Luxury V8 Sports Car', description: '0 to 60 in 3 seconds. 0 to respect in one drive.', price: 35000, category: 'vehicle', class: 'functional', visualTier: 2, requiredReputation: 15, requiredNetWorth: 25000, creditValue: 3000, notorietyBonus: 10, regionContacts: ['Europe'] },
  { id: 'luxury_v12_hypercar', name: 'Luxury V12 Hyper Car', description: 'Carbon fibre body. Limited production. Unmistakable engine note.', price: 85000, category: 'vehicle', class: 'functional', visualTier: 2, requiredReputation: 20, requiredNetWorth: 50000, creditValue: 6000, notorietyBonus: 15, regionContacts: ['Europe'] },
  { id: 'speedboat', name: 'Speedboat', description: 'Fast across water. Faster across borders.', price: 40000, category: 'vehicle', class: 'functional', visualTier: 2, requiredReputation: 30, requiredNetWorth: 80000, creditValue: 8000, notorietyBonus: 15, regionContacts: ['South America'] },
  { id: 'grand_apartment', name: 'Grand Apartment', description: 'Panoramic view. Bulletproof glass. Discreet.', price: 150000, category: 'property', class: 'functional', visualTier: 3, requiredReputation: 40, requiredNetWorth: 250000, creditValue: 30000, notorietyBonus: 20, regionContacts: ['North America', 'Europe'] },
  { id: 'mega_yacht', name: 'Mega Yacht', description: '80 feet. Helipad. Your country on water.', price: 350000, category: 'vehicle', class: 'functional', visualTier: 3, requiredReputation: 50, requiredNetWorth: 500000, creditValue: 70000, notorietyBonus: 30, regionContacts: ['South America', 'North America', 'Europe', 'Asia', 'North Africa', 'Middle East'] },
  // Type III — Operational
  { id: 'safehouse_network', name: 'Safehouse Network', description: 'Six safehouses across three continents. Clean. Stocked. Unlisted.', price: 45000, category: 'property', class: 'operational', visualTier: 2, requiredReputation: 20, requiredNetWorth: 35000, creditValue: 2250, operationalBenefits: { inspectionReduction: 0.15, bustReduction: 0.15, heatDecayBonus: 0, fineReduction: 0 } },
  { id: 'fake_passport_ring', name: 'Fake Passport Ring', description: 'A forger in Prague. Seven identities. Seven exit plans.', price: 30000, category: 'clothing', class: 'operational', visualTier: 2, requiredReputation: 15, requiredNetWorth: 25000, creditValue: 1500, operationalBenefits: { inspectionReduction: 0, bustReduction: 0.2, heatDecayBonus: 0, fineReduction: 0 } },
  { id: 'bribery_fund', name: 'Bribery Fund', description: 'Standing retainer with port officials. Cash upfront, cargo waved through.', price: 55000, category: 'property', class: 'operational', visualTier: 3, requiredReputation: 25, requiredNetWorth: 60000, creditValue: 2750, operationalBenefits: { inspectionReduction: 0.2, bustReduction: 0, heatDecayBonus: 0, fineReduction: 0.5 } },
  { id: 'comms_hub', name: 'Comms Hub', description: 'Satellite uplink in a warehouse. Encrypted. Untraceable.', price: 75000, category: 'property', class: 'operational', visualTier: 3, requiredReputation: 30, requiredNetWorth: 80000, creditValue: 3750, operationalBenefits: { inspectionReduction: 0, bustReduction: 0, heatDecayBonus: 0.5, fineReduction: 0 } },
  // Storage
  { id: 'storage_unit', name: 'Storage Unit', description: 'A lock-up garage on the outskirts of London. Discreet. No questions asked. Adds 100kg stash capacity.', price: 15000, category: 'property', class: 'cosmetic', visualTier: 2, requiredReputation: 5, requiredNetWorth: 10000, creditValue: 1500, stashBonus: 100 },
  { id: 'warehouse', name: 'Warehouse', description: 'A proper industrial unit. 300kg capacity. Requires Storage Unit. The foundation of any serious operation.', price: 50000, category: 'property', class: 'functional', visualTier: 3, requiredReputation: 20, requiredNetWorth: 50000, creditValue: 5000, stashBonus: 300, requiresAsset: 'storage_unit' },
];

export function getStashCapacity(player: PlayerState): number {
  const base = 100;
  const bonus = (player.ownedAssets ?? []).reduce((sum, id) => {
    const a = getAsset(id);
    return sum + (a?.stashBonus ?? 0);
  }, 0);
  return base + bonus;
}

export function canAffordAsset(player: PlayerState, asset: StatusAsset): boolean {
  if (asset.requiresAsset && !(player.ownedAssets ?? []).includes(asset.requiresAsset)) return false;
  return (player.bank + player.cash) >= asset.price
    && player.reputation >= asset.requiredReputation
    && player.peakNetWorth >= asset.requiredNetWorth;
}

export function buyAsset(player: PlayerState, asset: StatusAsset): { player: PlayerState; success: boolean } {
  if (!canAffordAsset(player, asset)) return { player, success: false };
  const owned = player.ownedAssets ?? [];
  if (owned.includes(asset.id)) return { player, success: false };

  let stashCap = player.stashCapacity;
  if (asset.stashBonus) stashCap += asset.stashBonus;
  let updated = { ...player, bank: player.bank - asset.price, ownedAssets: [...owned, asset.id], stashCapacity: stashCap, credibility: Math.min(100, player.credibility + asset.creditValue) };

  if (asset.class === 'functional') {
    if (asset.notorietyBonus) updated = addNotoriety(updated, asset.notorietyBonus);
    if (asset.regionContacts) {
      for (const regionId of asset.regionContacts) {
        updated = unlockContact(updated, regionId);
      }
    }
  }

  return { player: updated, success: true };
}

export function sellAsset(player: PlayerState, assetId: string): { player: PlayerState; payout: number; success: boolean } {
  const owned = player.ownedAssets ?? [];
  if (!owned.includes(assetId)) return { player, payout: 0, success: false };

  const asset = getAsset(assetId);
  if (!asset) return { player, payout: 0, success: false };

  const payoutRatio = asset.class === 'cosmetic' ? 0.5
    : asset.class === 'functional' ? 0.4
    : 0.3;
  const payout = Math.floor(asset.price * payoutRatio);

  let updated = {
    ...player,
    ownedAssets: owned.filter((id) => id !== assetId),
    cash: player.cash + payout,
    credibility: Math.max(0, player.credibility - asset.creditValue),
  };

  if (asset.class === 'functional') {
    if (asset.notorietyBonus) {
      updated = { ...updated, notoriety: Math.max(0, updated.notoriety - asset.notorietyBonus) };
    }
  }

  return { player: updated, payout, success: true };
}

export function getAsset(id: string): StatusAsset | undefined {
  return STATUS_ASSETS.find((a) => a.id === id);
}

export function getPlayerVisualTier(player: PlayerState): 1 | 2 | 3 {
  const owned = player.ownedAssets ?? [];
  let highestTier: 1 | 2 | 3 = 1;

  for (const assetId of owned) {
    const asset = getAsset(assetId);
    if (asset && asset.visualTier > highestTier) {
      highestTier = asset.visualTier;
    }
  }

  if (player.peakNetWorth >= 100000) highestTier = Math.max(highestTier, 2) as 1 | 2 | 3;
  if (player.peakNetWorth >= 500000) highestTier = 3;

  return highestTier;
}

export function getOwnedAssets(player: PlayerState): StatusAsset[] {
  return (player.ownedAssets ?? []).map((id) => getAsset(id)).filter(Boolean) as StatusAsset[];
}

export function hasHighTierAsset(player: PlayerState, minTier: 1 | 2 | 3): boolean {
  return (player.ownedAssets ?? []).some((id) => {
    const a = getAsset(id);
    return a && a.visualTier >= minTier;
  });
}

export function hasTypeIII(player: PlayerState): boolean {
  return (player.ownedAssets ?? []).some((id) => {
    const a = getAsset(id);
    return a && a.class === 'operational';
  });
}

export function getActiveOperationalBenefits(player: PlayerState): OperationalBenefits {
  const base: OperationalBenefits = { inspectionReduction: 0, bustReduction: 0, heatDecayBonus: 0, fineReduction: 0 };
  return (player.ownedAssets ?? []).reduce((acc, id) => {
    const a = getAsset(id);
    if (a && a.class === 'operational' && a.operationalBenefits) {
      return {
        inspectionReduction: Math.min(0.6, acc.inspectionReduction + a.operationalBenefits.inspectionReduction),
        bustReduction: Math.min(0.6, acc.bustReduction + a.operationalBenefits.bustReduction),
        heatDecayBonus: Math.min(1, acc.heatDecayBonus + a.operationalBenefits.heatDecayBonus),
        fineReduction: Math.min(0.8, acc.fineReduction + a.operationalBenefits.fineReduction),
      };
    }
    return acc;
  }, base);
}

export function getTotalNotorietyBonus(player: PlayerState): number {
  return (player.ownedAssets ?? []).reduce((sum, id) => {
    const a = getAsset(id);
    return sum + (a && a.class === 'functional' ? (a.notorietyBonus ?? 0) : 0);
  }, 0);
}
