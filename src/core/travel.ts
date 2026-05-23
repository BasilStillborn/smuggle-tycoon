import type { PlayerState, Country, TravelResult, ChoiceEvent, TravelClass } from './types';
import { deductCash, setLocation, incrementTrips } from './player';
import { reduceHeat, addHeat } from './heat';
import { COUNTRIES } from './world';

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

// Narrative variant pools for travel encounters
const STRAIGHT_THROUGH_MSGS: string[] = [
  'Smooth crossing. No inspection. Heat -%d.',
  'You walk through the terminal like you belong. Nobody bats an eye. Heat -%d.',
  'The customs officer barely glances at your passport. Waves you through. Heat -%d.',
  'You blend into the crowd. Standard exit. No drama. Heat -%d.',
  'A bored official stamps your documents without looking up. Easy. Heat -%d.',
  'The baggage scanner beeps but the operator waves you on. Too busy for a full check. Heat -%d.',
  'You follow a family with crying kids through the gate. The guards are too distracted to notice you. Heat -%d.',
  'Clean passport, clean record, clean exit. The system works in your favour today. Heat -%d.',
  'You time your walk perfectly — right behind a diplomat. Courtesy lane opens up. Heat -%d.',
  'The security dog is asleep by its handler\'s feet. You walk past without a sound. Heat -%d.',
];

const SNIFF_SETUPS: string[] = [
  'A customs officer flags your documents and gestures you toward a secondary screening area. Your heart pounds.',
  'The security dog suddenly perks up, sniffing the air near your bag. The handler\'s eyes narrow.',
  'A random baggage scan flags your luggage. An attendant waves you over. "Step this way, sir."',
  'Your heart drops as you see the passport control officer studying your visa too carefully.',
  'The metal detector beeps. An officer pats you down. Too thorough. Too slow.',
  'A plainclothes agent watches you from the mezzanine. He speaks into his radio. Two guards approach.',
  'The drug sniffing scanner lights up as you walk through. "Please step aside for a moment."',
  'An officer pulls you out of the queue at random. "Routine check. Empty your pockets."',
  'Your bag gets caught in a secondary X-ray. The operator frowns at the screen and calls for a supervisor.',
  'A sniffer dog circles your bag and sits. The handler tightens his grip on the leash.',
];

function randomMsg(messages: string[], heatVal: number): string {
  const msg = messages[Math.floor(Math.random() * messages.length)];
  return msg.replace('%d', String(heatVal));
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
  const countryMod = toCountry.policeIntensity / 30;
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

  // Sniff chance: 0% on outbound with under $20k cash (just a traveler)
  // Return leg or carrying $20k+ cash triggers customs scrutiny
  const returnMod = isReturnLeg ? 1.4 : 1.0;
  const classSniffMod = travelClass === 'first_class' ? 0.55 : 1.0;
  let sniffChance = 0;
  if (isReturnLeg || player.cash >= 20000) {
    sniffChance = Math.min(0.50, Math.max(0.08,
      (0.25 * returnMod - player.credibility * 0.0015 + player.heat * 0.002 + countryMod * 0.1) * classSniffMod
    ));
  }

  const sniff = Math.random() < sniffChance;

  let updatedPlayer = deductCash(player, travelCost);

  if (!sniff) {
    // 75% base: straight through
    const heatDecay = 3 + Math.floor(Math.random() * 6);
    updatedPlayer = reduceHeat(updatedPlayer, heatDecay);
    updatedPlayer = setLocation(updatedPlayer, toCountryId);
    updatedPlayer = incrementTrips(updatedPlayer);

    const smoothMsg = randomMsg(STRAIGHT_THROUGH_MSGS, heatDecay);
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
  const sniffSetup = SNIFF_SETUPS[Math.floor(Math.random() * SNIFF_SETUPS.length)];
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

export function generateSniffChoices(): ChoiceEvent {
  const sniffSetup = SNIFF_SETUPS[Math.floor(Math.random() * SNIFF_SETUPS.length)];
  return {
    id: 'travel_sniff',
    title: 'Security Checkpoint',
    context: sniffSetup + ' You need to decide — now.',
    choices: [
      {
        id: 'bribe',
        text: 'Slide $500 into your passport and hand it over.',
        odds: 0.60,
        successEffects: { cashDelta: -500, heatDelta: 5, reputationDelta: 0, credibilityDelta: 10, inventoryLost: false, message: 'The officer glances at the cash, stamps your passport, and waves you through. You exhale.' },
        failEffects: { cashDelta: -500, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: 'He pockets the money, then radios for backup. They tear through your luggage. Everything is confiscated.' },
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
}
