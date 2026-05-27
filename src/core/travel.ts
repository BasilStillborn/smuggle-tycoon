import type { PlayerState, Country, TravelResult, ChoiceEvent, TravelClass } from './types';
import { deductCash, setLocation, incrementTrips } from './player';
import { reduceHeat, addHeat } from './heat';
import { COUNTRIES } from './world';
import { GOODS } from './goods';

const TRAVEL_COST_BASE = 200;
const TRAVEL_COST_PER_DISTANCE = 50;

const REGION_INDICES: Record<string, number> = {
  'South America': 0,
  'North America': 1,
  'North Africa': 2,
  'Europe': 3,
  'Middle East': 4,
  'Asia': 5,
};

export function getTicketCost(from: Country, to: Country, travelClass: TravelClass): number {
  const dist = Math.abs((REGION_INDICES[from.region] ?? 0) - (REGION_INDICES[to.region] ?? 0)) + 1;
  const classMultiplier = travelClass === 'first_class' ? 2.5 : 1.0;
  return Math.floor((TRAVEL_COST_BASE + TRAVEL_COST_PER_DISTANCE * dist) * classMultiplier);
}

type SuspicionTier = 'minimal' | 'medium' | 'high';

const CASH_STRAIGHT_MSGS: Record<SuspicionTier, string[]> = {
  minimal: [
    'Passport, nod, stamp. Nobody seems especially interested in your cash. Heat -%d.',
    'Your bag gets a cursory glance and a bored wave-through. Heat -%d.',
    'Customs process you like everyone else: briefly and without affection. Heat -%d.',
  ],
  medium: [
    'One extra question, one longer stare, then clearance. Heat -%d.',
    'An officer clocks the envelope, hesitates, then lets procedure win. Heat -%d.',
    'You get a second look from the fuzz before the stamp lands. Heat -%d.',
  ],
  high: [
    'With that much cash, every desk suddenly feels manned by a detective. You still get through. Heat -%d.',
    'Two officers shadow your bag to the scanner, then release you on a technicality called luck. Heat -%d.',
    'The law watch your hands like hawks, waiting for one wrong twitch. You give them none. Heat -%d.',
  ],
};

const PRODUCT_STRAIGHT_MSGS: Record<SuspicionTier, string[]> = {
  minimal: [
    'Return customs scan your bag and move on without ceremony. Heat -%d.',
    'Small load, clean pass, no one gets curious. Heat -%d.',
    'Your luggage clears screening with minimal fuss. Heat -%d.',
  ],
  medium: [
    'The scanner op pauses on your bag, then waves you through. Heat -%d.',
    'A handler glances over, considers a check, and lets it go. Heat -%d.',
    'You feel scrutiny at return customs, but nothing escalates. Heat -%d.',
  ],
  high: [
    'Heavy load, heavy tension — and somehow no side room. Heat -%d.',
    'The checkpoint circles you like a problem it can\'t quite prove. Heat -%d.',
    'You look one bad minute from a search table, but walk out intact. Heat -%d.',
  ],
};

const CASH_SNIFF_SETUPS: Record<SuspicionTier, string[]> = {
  minimal: [
    'Outbound officer asks destination, duration, and the same question twice.',
    'A customs agent taps your passport and asks for your carry-on.',
    'Routine outbound check: "Step aside for a moment, sir."',
  ],
  medium: [
    'Two officers compare your declaration card, then direct you to secondary.',
    'A plainclothes agent notices your cash envelope and calls over support.',
    'Outbound scanner flags your bag for manual inspection.',
  ],
  high: [
    'You hit outbound customs and are peeled out of the queue immediately.',
    'A supervisor appears before introductions. "Secondary. Now."',
    'Your carry-on goes straight to deep search while officers track your hands.',
  ],
};

const PRODUCT_SNIFF_SETUPS: Record<SuspicionTier, string[]> = {
  minimal: [
    'Return customs run a quick swab and keep you waiting just long enough to sweat.',
    'A handler gives the dog one lap around your bag, then signals you aside.',
    'A border officer asks for a routine unzip and visual check.',
  ],
  medium: [
    'The scanner operator frowns at your bag image and asks for a second look.',
    'A sniffer dog circles twice, sits, and the handler raises a hand.',
    'Return customs flag your bag for secondary and a full pocket check.',
  ],
  high: [
    'Your bag enters X-ray and three staff suddenly become very interested in your evening.',
    'A drug dog locks on and customs steer you toward the interview-room corridor.',
    'Checkpoint escalation is immediate: supervisor, gloves, secondary table, no small talk.',
  ],
};

function randomMsg(messages: string[], heatVal: number): string {
  const msg = messages[Math.floor(Math.random() * messages.length)];
  return msg.replace('%d', String(heatVal));
}

function randomLine(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

function getCashSuspicionTier(cash: number): SuspicionTier {
  if (cash > 25000) return 'high';
  if (cash > 10000) return 'medium';
  return 'minimal';
}

function getInventoryWeight(player: PlayerState): number {
  return player.inventory.reduce((sum, item) => {
    const good = GOODS.find((g) => g.id === item.goodId);
    return sum + (good ? good.weight * item.quantity : 0);
  }, 0);
}

function getProductSuspicionTier(player: PlayerState): SuspicionTier {
  const weight = getInventoryWeight(player);
  if (weight > 0.15) return 'high';
  if (weight > 0.05) return 'medium';
  return 'minimal';
}

function getTravelSuspicionTier(player: PlayerState, isReturnLeg: boolean): SuspicionTier {
  return isReturnLeg ? getProductSuspicionTier(player) : getCashSuspicionTier(player.cash);
}

function getSniffProbability(player: PlayerState, isReturnLeg: boolean, travelClass: TravelClass): number {
  const tier = getTravelSuspicionTier(player, isReturnLeg);
  const BASE_PROB: Record<SuspicionTier, number> = {
    minimal: 0.08,
    medium: 0.20,
    high: 0.35,
  };
  let prob = BASE_PROB[tier];
  prob += (player.heat / 100) * 0.25;
  if (travelClass === 'first_class') prob *= 0.75;
  return Math.min(Math.max(prob, 0.05), 0.75);
}

function getCustomsBribeCost(player: PlayerState): number {
  if (player.peakNetWorth >= 50000) return 1200;
  if (player.peakNetWorth >= 10000) return 700;
  return 300;
}

function getStraightThroughMsg(player: PlayerState, isReturnLeg: boolean, heatDecay: number): string {
  const tier = getTravelSuspicionTier(player, isReturnLeg);
  const pool = isReturnLeg ? PRODUCT_STRAIGHT_MSGS[tier] : CASH_STRAIGHT_MSGS[tier];
  return randomMsg(pool, heatDecay);
}

function getSniffSetup(player: PlayerState, isReturnLeg: boolean): string {
  const tier = getTravelSuspicionTier(player, isReturnLeg);
  const pool = isReturnLeg ? PRODUCT_SNIFF_SETUPS[tier] : CASH_SNIFF_SETUPS[tier];
  return randomLine(pool);
}

function getDistance(from: Country, to: Country): number {
  return Math.abs((REGION_INDICES[from.region] ?? 0) - (REGION_INDICES[to.region] ?? 0)) + 1;
}

export function travel(
  player: PlayerState,
  toCountryId: string,
  travelClass: TravelClass = 'economy',
  isReturnLeg: boolean = false,
): { player: PlayerState; result: TravelResult } {
  if (toCountryId === player.currentCountryId) {
    return {
      player,
      result: {
        success: false,
        cost: 0,
        delay: 0,
        message: 'You are already in this country.',
        securitySniffTriggered: false,
      },
    };
  }

  const fromCountry = COUNTRIES.find((c) => c.id === player.currentCountryId);
  const toCountry = COUNTRIES.find((c) => c.id === toCountryId);

  if (!fromCountry || !toCountry) {
    return {
      player,
      result: {
        success: false,
        cost: 0,
        delay: 0,
        message: 'Invalid destination.',
        securitySniffTriggered: false,
      },
    };
  }

  const distance = getDistance(fromCountry, toCountry);
  const classMultiplier = travelClass === 'first_class' ? 2.5 : 1.0;
  const priceVariation = 0.9 + Math.random() * 0.2;
  const baseCost = (TRAVEL_COST_BASE + TRAVEL_COST_PER_DISTANCE * distance);
  const travelCost = Math.floor(baseCost * priceVariation * classMultiplier);

  if (player.cash < travelCost) {
    return {
      player,
      result: {
        success: false,
        cost: travelCost,
        delay: 0,
        message: `Not enough cash for travel. Need $${travelCost}.`,
        securitySniffTriggered: false,
      },
    };
  }

  const delay = 1 + Math.floor(Math.random() * 3);

  const sniff = Math.random() < getSniffProbability(player, isReturnLeg, travelClass);

  let updatedPlayer = deductCash(player, travelCost);

  if (!sniff) {
    // 75% base: straight through
    const heatDecay = 3 + Math.floor(Math.random() * 6);
    updatedPlayer = reduceHeat(updatedPlayer, heatDecay);
    updatedPlayer = setLocation(updatedPlayer, toCountryId);
    updatedPlayer = incrementTrips(updatedPlayer);

    const smoothMsg = getStraightThroughMsg(updatedPlayer, isReturnLeg, heatDecay);
    return {
      player: updatedPlayer,
      result: {
        success: true,
        cost: travelCost,
        delay,
        message: `Traveled from ${fromCountry.name} to ${toCountry.name}. Cost: $${travelCost}. ${smoothMsg}`,
        securitySniffTriggered: false,
      },
    };
  }

  // 25%: security sniff — player doesn't change location yet
  const sniffSetup = getSniffSetup(updatedPlayer, isReturnLeg);
  return {
    player: updatedPlayer,
    result: {
      success: true,
      cost: travelCost,
      delay,
      message: `Security checkpoint at ${toCountry.name} airport. ${sniffSetup}`,
      securitySniffTriggered: true,
    },
  };
}

export function generateSniffChoices(player: PlayerState, isReturnLeg: boolean): ChoiceEvent {
  const sniffSetup = getSniffSetup(player, isReturnLeg);
  const bribeCost = getCustomsBribeCost(player);
  const canAffordBribe = player.cash >= bribeCost;
  const bribeText = canAffordBribe
    ? `Slide $${bribeCost.toLocaleString()} into your passport and hand it over.`
    : `Bribe — can't afford (need $${bribeCost.toLocaleString()}, have $${player.cash.toLocaleString()})`;
  const event: ChoiceEvent = {
    id: 'travel_sniff',
    title: 'Security Checkpoint',
    context: sniffSetup + ' You need to decide — now.',
    choices: [
      {
        id: 'bribe',
        text: bribeText,
        odds: canAffordBribe ? 0.60 : 0,
        successEffects: { cashDelta: -bribeCost, heatDelta: 5, reputationDelta: 0, credibilityDelta: 10, inventoryLost: false, message: 'The officer glances at the cash, stamps your passport, and waves you through. You exhale.' },
        failEffects: { cashDelta: -bribeCost, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: 'He pockets the money, then radios for backup. They tear through your luggage. Everything is confiscated.' },
      },
      {
        id: 'bluff',
        text: 'Keep calm. You are just a tourist. Nothing to declare.',
        odds: 0.40,
        successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: 5, inventoryLost: false, message: 'He stares at you for a long moment. Then he nods and waves you through. Close call.' },
        failEffects: { cashDelta: 0, heatDelta: 35, reputationDelta: 0, credibilityDelta: -15, inventoryLost: true, message: 'He doesn\'t believe you. A full search finds everything. You\'re lucky you\'re not in cuffs.' },
      },
      {
        id: 'abort',
        text: 'Turn around. Abort the run. Go home.',
        odds: 0.95,
        successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: 'You turn and walk back through the terminal. The run is dead, but you are free. The ticket money is gone.' },
        failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' },
      },
    ],
  };
  (event as any)._bribeCost = bribeCost;
  return event;
}
