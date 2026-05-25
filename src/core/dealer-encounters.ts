import type { PlayerState, Country, ChoiceEvent, DealerProfile, PronounSet, KingpinProfile } from './types';

interface DealContext {
  pricePerUnit: number;
  quantity: number;
  totalCost: number;
}

// Pronoun helper — returns correct gendered pronouns for any dealer
export function p(d: { gender: 'male' | 'female' }): PronounSet {
  const isF = d.gender === 'female';
  return { he: isF ? 'she' : 'he', him: isF ? 'her' : 'him', his: isF ? 'her' : 'his', He: isF ? 'She' : 'He', His: isF ? 'Her' : 'His' };
}

// ============================================================
// DEALER POOL — supplier profiles per country
// ============================================================

export function getDealersForCountry(countryId: string, rapport: Record<string, number>): DealerProfile[] {
  const all = DEALER_POOL.filter(d => d.countryId === countryId);
  // Sort by rapport descending so familiar dealers appear first in list
  return all.sort((a, b) => (rapport[b.dealerId] ?? 0) - (rapport[a.dealerId] ?? 0));
}

export interface DealerOption {
  profile: DealerProfile;
  rapportLevel: number;
}

export function getDealerOptions(countryId: string, rapport: Record<string, number>): DealerOption[] {
  const pool = getDealersForCountry(countryId, rapport);
  // Show 3 random dealers, preferring ones with rapport
  const withRapport = pool.filter(d => (rapport[d.dealerId] ?? 0) > 0);
  const withoutRapport = pool.filter(d => (rapport[d.dealerId] ?? 0) === 0);
  const shuffled = [...withRapport.sort(() => Math.random() - 0.5), ...withoutRapport.sort(() => Math.random() - 0.5)];
  const selected = shuffled.slice(0, 3);
  return selected.map(p => ({ profile: p, rapportLevel: rapport[p.dealerId] ?? 0 }));
}

const DEALER_POOL: DealerProfile[] = [
  // Colombia (cocaine)
  { countryId: 'colombia', dealerId: 'col_1', name: 'Alejandro', gender: 'male', description: 'Cartel connected. High prices, pure product.', location: 'a private finca in the hills outside Medellín', priceModifier: 1.15, riskBonus: -0.05, rapport: 0 },
  { countryId: 'colombia', dealerId: 'col_2', name: 'Carlos', gender: 'male', description: 'Street level. Cheap but unpredictable.', location: 'a noisy bar in the centre of Bogotá', priceModifier: 0.85, riskBonus: 0.10, rapport: 0 },
  { countryId: 'colombia', dealerId: 'col_3', name: 'Valentina', gender: 'female', description: 'Mid-level operator. Reliable, fair pricing.', location: 'a quiet café in the Zona Rosa', priceModifier: 1.0, riskBonus: 0.0, rapport: 0 },
  // Netherlands (weed, hashish)
  { countryId: 'netherlands', dealerId: 'net_1', name: 'Pieter', gender: 'male', description: 'Houseboat philosopher. Always high. Grows his own truffles. Once tried to sell a sofa he thought was a dragon.', location: 'his houseboat on a quiet Amsterdam canal', priceModifier: 0.95, riskBonus: -0.05, rapport: 0 },
  { countryId: 'netherlands', dealerId: 'net_2', name: 'Lena', gender: 'female', description: 'Premium supplier. Top quality, top price.', location: 'a minimalist office in the Zuidas business district', priceModifier: 1.2, riskBonus: -0.15, rapport: 0 },
  { countryId: 'netherlands', dealerId: 'net_3', name: 'Bram', gender: 'male', description: 'Coffee shop regular. Cheap, friendly, sometimes unreliable.', location: 'a back room of a busy coffee shop', priceModifier: 0.8, riskBonus: 0.1, rapport: 0 },
  // Spain (MDMA, ecstasy)
  { countryId: 'spain', dealerId: 'esp_1', name: 'Howard', gender: 'male', description: 'Ex coal miner from the Valleys. Emigrated after Thatcher shut the pits. Now sells weed out of an old VW camper van. Fair prices. Won\'t double cross you. Police know his face but can never prove anything.', location: 'his rusted VW camper van parked up on a quiet hillside overlooking Barcelona — beanbags, fairy lights, and a Welsh dragon sticker on the back window', priceModifier: 1.15, riskBonus: 0.0, rapport: 0 },
  { countryId: 'spain', dealerId: 'esp_2', name: 'Isabel', gender: 'female', description: 'North Africa pipeline. Good hashish, fair prices.', location: 'a tapas bar in the Albaicín, Granada', priceModifier: 0.9, riskBonus: 0.02, rapport: 0 },
  { countryId: 'spain', dealerId: 'esp_3', name: 'Jorge', gender: 'male', description: 'New to the game. Eager, negotiable, unpredictable.', location: 'a beachfront promenade in Marbella', priceModifier: 0.75, riskBonus: 0.18, rapport: 0 },
  // Afghanistan (opioids, heroin)
  { countryId: 'afghanistan', dealerId: 'afg_1', name: 'Rashid', gender: 'male', description: 'Tribal elder. Controls the poppy fields. Best price for bulk.', location: 'a walled compound outside Kandahar', priceModifier: 0.8, riskBonus: 0.05, rapport: 0 },
  { countryId: 'afghanistan', dealerId: 'afg_2', name: 'Hamid', gender: 'male', description: 'Ex-mujahideen. Respects courage. Dangerous if crossed.', location: 'a tea house in the Khyber Pass trading post', priceModifier: 0.9, riskBonus: 0.12, rapport: 0 },
  { countryId: 'afghanistan', dealerId: 'afg_3', name: 'Laila', gender: 'female', description: 'Operates under the radar. Professional, discreet.', location: 'a hidden basement lab on the outskirts of Kabul', priceModifier: 1.05, riskBonus: -0.08, rapport: 0 },
];

// ============================================================
// KINGPIN POOL — London buyers to sell product to
// ============================================================

export const KINGPIN_POOL: KingpinProfile[] = [
  {
    id: 'avi',
    name: 'Avi',
    description: 'Hatton Garden diamond man. Three generations in the trade — his bubbe ran the numbers, his father ran the gold. Avi runs everything. Calls you "bubbeleh" when he likes you.',
    location: 'a private office above a diamond wholesaler in Hatton Garden',
    minStashValue: 5000,
    sellPriceMod: 1.3,
    encounterWeights: { clean: 85, mugging: 10, raid: 5 },
    buys: ['ecstasy', 'cocaine'],
  },
  {
    id: 'sergio',
    name: 'Sergio',
    description: 'Albanian. North London. Volatile as a bag of snakes but pays top dollar when he\'s in a good mood.',
    location: 'a car wash in Barking that never seems to actually wash cars',
    minStashValue: 1500,
    sellPriceMod: 1.15,
    encounterWeights: { clean: 80, mugging: 15, raid: 5 },
    buys: ['heroin', 'meth'],
  },
  {
    id: 'iqbal',
    name: 'Quentin',
    description: 'Gay as a rainbow. Lives in a grubby flat above a Dalston launderette. Thinks he\'s Russell Brand but looks like Keith Chegwin. Snorts gear constantly, calls you "chocolate boy." Don\'t let him touch you — he WILL try.',
    location: 'his grubby flat above a launderette in Dalston — mirrors everywhere, silk kimono collection, and a chaise longue covered in dry jizz',
    minStashValue: 750,
    sellPriceMod: 0.9,
    encounterWeights: { clean: 90, mugging: 5, raid: 5 },
    buys: ['cocaine', 'hashish', 'weed'],
  },
];

function getCredibilityTier(player: PlayerState): number {
  if (player.credibility >= 60) return 3;
  if (player.credibility >= 25) return 2;
  return 1;
}

function getCountryRiskMod(countryId: string): string {
  const mods: Record<string, string> = {
    colombia: 'volatile',
    netherlands: 'open',
    spain: 'mixed',
    afghanistan: 'unstable',
    london: 'slick',
  };
  return mods[countryId] ?? 'neutral';
}

let _encounterSeed = 0;
let _sellSeed = 0;
function nextId(): string {
  return `enc_$${++_encounterSeed}_${Date.now().toString(36)}`;
}
function nextSellId(): string {
  return `sell_enc_$${++_sellSeed}_${Date.now().toString(36)}`;
}

// ============================================================
// NARRATIVE VARIANT POOLS — descriptive text to avoid repetition
// ============================================================

const BUY_ROBBERY_SETUPS: string[] = [
  'A man steps from behind a pillar as you count the cash. "Nice stack, friend. Hand it over."',
  'The dealer pockets your money, then nods toward the alley exit. Two silhouettes block the light.',
  'As you turn to leave, someone grabs your bag strap. Hard.',
  '"Wrong neighborhood, gringo." A knife glints under a streetlamp.',
  'The handoff is smooth — too smooth. You hear footsteps behind you.',
  'A kid no older than sixteen points a pistol at your ribs. "Give me the package."',
  'The dealer smiles, shakes your hand — and doesn\'t let go. His other hand comes up with a blade.',
  'You feel a hand clamp your shoulder. "You\'re with me now. Walk."',
  'The deal goes down easy. Then you hear a shotgun rack from the car idling beside you.',
  'You hand over the cash — and three men step out of a van. "Boss wants to meet you. Get in."',
];

const BUY_ROBBERY_SUMMARIES: string[] = [
  'You count your remaining money. It could have been worse. It could have been a lot worse.',
  'You escape with most of your cash and your life. The deal is dead — for now.',
  'Your heart pounds in your ears as you disappear into the crowd. Not your night.',
  'You limp away lighter but alive. The streets are unforgiving tonight.',
  'You made the smart call. Cash can be earned again. Your teeth cannot.',
  'You slip through a fire escape and lose them in the alleys. Close call.',
  'The adrenaline fades as you put three blocks between you and them. You\'re alive.',
  'You drop the cash and run. Pride wounded, wallet lightened, but breathing.',
];

const SELL_KINGPIN_CONTEXTS: Record<string, string[]> = {
  '1': [
    'A greasy man in a track suit waits in an abandoned fish market. "You got it?" He flashes a roll of cash.',
    'The meet is in a rundown flat above a kebab shop. The dealer counts bills with greasy fingers.',
    'A teenager on a moped pulls up. "My uncle sent me. Give me the goods, I give you this." He holds up a envelope.',
    'The buyer meets you in a car park. He flicks through the product, nods, hands you a bag of cash.',
  ],
  '2': [
    'The meeting is in the back room of a quiet hotel bar. Your contact wears a suit that costs more than your rent.',
    'A woman in a business suit sits at a corner table. She slides a burner phone across. "Next time, use this."',
    'The handoff is on a ferry crossing the river. Your contact sips coffee and reads a newspaper. "Under the seat."',
    'A hotel room. The buyer checks the quality with a small kit, then opens a briefcase full of cash.',
  ],
  '3': [
    'A private dining room in a five-star hotel. A man in a tailored suit pours whiskey. "I\'ve heard about you."',
    'The meeting is on a yacht docked at the marina. Your host gestures to a leather seat. "Drink?"',
    'A penthouse overlooking the city. The kingpin sits behind a mahogany desk. "I don\'t deal with amateurs. You\'ve been vetted."',
    'The exchange happens in a private art gallery. Your contact examines the product under a glass display case.',
  ],
};

const SELL_KINGPIN_SUMMARIES: Record<string, string[]> = {
  success: [
    'The deal closes clean. Cash in hand. Product delivered. Another step up the ladder.',
    'You count the money twice. It\'s all there. The kingpin nods. "Pleasure doing business."',
    'The exchange is smooth, professional. No drama. Just profit.',
    'You walk away with the payment. Your reputation grows with every clean transaction.',
    'The buyer tests the quality and smiles. "Consistent. I like that." You get paid in full.',
  ],
  failure: [
    'It goes bad fast. You escape with your skin but the product and the payment are both gone.',
    'The deal collapses. Someone talked. You barely get out before the place is surrounded.',
    'You lose the product in the chaos. The money never materializes. A total loss.',
    'The buyer\'s men turn on you. You fight your way out, empty-handed and bleeding.',
    'A misunderstanding turns violent. You leave with nothing but a warning.',
  ],
};

const SELL_RAID_SETUPS: string[] = [
  'Halfway through the exchange, tires screech outside. Someone yells "POLICE! GO GO GO!"',
  'The front door explodes inward. Flashing vests pour through the smoke. "EVERYONE ON THE GROUND!"',
  'Your contact\'s phone buzzes. He reads it and pales. "They\'re coming. We have two minutes."',
  'The deal is done — then you hear the helicopters. Blue lights flicker through the blinds.',
  'A lookout bursts in. "The feds are at the corner! Move!" Chaos erupts.',
  'The hotel lobby suddenly fills with plainclothes officers. Your contact bolts for the fire exit.',
  'A massive explosion rocks the building. Not police — a rival crew sending a message with a grenade.',
];

const SELL_GUNFIGHT_SETUPS: string[] = [
  'Shots ring out from the street. Your contact shoves you down. "RIVALS!" He pulls a pistol from his jacket.',
  'The deal is interrupted by a masked crew kicking down the door. Everything descends into chaos.',
  'A window shatters. A body drops. Your contact shoves a gun into your hand. "You\'re with me, yeah?"',
  'The room erupts. Your contact\'s own men open fire on each other — a betrayal mid-deal.',
  'A car screeches to a halt outside and automatic fire rakes the building. You hit the floor.',
];

const SELL_HENCHMEN_SETUPS: string[] = [
  'The buyer counts your product and laughs. "This is it? Take him." His men step forward.',
  '"Boss doesn\'t want to pay today." The dealer\'s men form a circle around you.',
  'Your contact looks nervous. Too nervous. His hand drifts toward his jacket. "There\'s been a change of plan."',
  'The deal seems clean — then you feel a gun barrel press against your spine. "Don\'t move."',
  'Your contact gestures to a side room. "The money is in there." The room is empty. Trap.',
];

// ============================================================
// BUY PHASE: Street Robbery Encounter
// ============================================================

export function generateBuyRobbery(player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent {
  const setup = BUY_ROBBERY_SETUPS[Math.floor(Math.random() * BUY_ROBBERY_SETUPS.length)];
  const summary = BUY_ROBBERY_SUMMARIES[Math.floor(Math.random() * BUY_ROBBERY_SUMMARIES.length)];
  const modTier = getCredibilityTier(player);
  const fightOdds = 0.30 + modTier * 0.10 + player.reputation * 0.002;
  const flightOdds = 0.60 + player.credibility * 0.002;

  return {
    id: nextId(),
    title: 'Street Robbery',
    context: setup,
    choices: [
      {
        id: 'fight',
        text: 'Fight. You didn\'t come this far to get rolled.',
        odds: Math.min(0.80, fightOdds),
        successEffects: {
          cashDelta: 500 + Math.floor(Math.random() * 1000),
          heatDelta: 15,
          reputationDelta: 3,
          credibilityDelta: 10,
          inventoryLost: false,
          message: `You catch them off guard. A quick elbow, a grabbed weapon — they scatter. You take their cash as compensation. $${summary}`,
        },
        failEffects: {
          cashDelta: -600,
          heatDelta: 25,
          reputationDelta: -2,
          credibilityDelta: -10,
          inventoryLost: true,
          message: `They tackle you. You land hard. By the time you\'re on your feet, your pockets are empty and the product is gone. $${summary}`,
        },
      },
      {
        id: 'flight',
        text: 'Run. Live to deal another day.',
        odds: Math.min(0.90, flightOdds),
        successEffects: {
          cashDelta: 0,
          heatDelta: 5,
          reputationDelta: 0,
          credibilityDelta: 5,
          inventoryLost: false,
          message: `You bolt through the crowd. They give chase for a block, then give up. You still have your cash and your goods. $${summary}`,
        },
        failEffects: {
          cashDelta: -400,
          heatDelta: 10,
          reputationDelta: 0,
          credibilityDelta: -5,
          inventoryLost: false,
          message: `You trip. They catch up, take a cut of your cash, and leave you in the gutter. At least the product survived. $${summary}`,
        },
      },
    ],
  };
}

// ============================================================
// SELL PHASE: Kingpin Encounters
// ============================================================

export function generateSellEncounter(player: PlayerState, country: Country, goodName: string): ChoiceEvent {
  const tier = getCredibilityTier(player);
  const flavor = getCountryRiskMod(country.id);
  const contexts = SELL_KINGPIN_CONTEXTS[String(tier)] ?? SELL_KINGPIN_CONTEXTS['1'];
  const context = contexts[Math.floor(Math.random() * contexts.length)];

  // Determine encounter type based on country risk + tier
  const roll = Math.random();
  const raidWeight = 0.20;
  const gunfightWeight = flavor === 'volatile' ? 0.35 : 0.15;
  const henchWeight = flavor === 'unstable' ? 0.35 : flavor === 'slick' ? 0.30 : 0.20;

  const encounterType = roll < raidWeight ? 'raid'
    : roll < raidWeight + gunfightWeight ? 'gunfight'
    : roll < raidWeight + gunfightWeight + henchWeight ? 'henchmen'
    : 'clean';

  if (encounterType === 'clean') {
    return generateCleanSell(player, tier, context);
  } else if (encounterType === 'raid') {
    return generateRaidSell(player, tier, context, goodName);
  } else if (encounterType === 'gunfight') {
    return generateGunfightSell(player, tier, context, goodName);
  } else {
    return generateHenchmenSell(player, tier, context, goodName);
  }
}

function generateCleanSell(player: PlayerState, tier: number, context: string): ChoiceEvent {
  const summary = SELL_KINGPIN_SUMMARIES.success[Math.floor(Math.random() * SELL_KINGPIN_SUMMARIES.success.length)];
  return {
    id: nextSellId(),
    title: tier >= 3 ? 'The Executive Handoff' : tier === 2 ? 'The Hotel Meet' : 'The Street Deal',
    context,
    choices: [
      {
        id: 'close_deal',
        text: 'Complete the transaction.',
        odds: 0.85 + player.credibility * 0.001,
        successEffects: {
          cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5,
          inventoryLost: true,
          message: summary,
        },
        failEffects: {
          cashDelta: 0, heatDelta: 15, reputationDelta: -3, credibilityDelta: -5,
          inventoryLost: true,
          message: 'The deal goes sour at the last second. The buyer bolts. You\'re left holding nothing.',
        },
      },
      {
        id: 'negotiate',
        text: 'Push for a better price. Your product is top shelf.',
        odds: 0.40 + player.credibility * 0.004,
        successEffects: {
          cashDelta: 2000, heatDelta: 10, reputationDelta: 4, credibilityDelta: 8,
          inventoryLost: true,
          message: `The buyer respects the hustle. "Fine. You\'ve earned it." He adds a bonus. $${summary}`,
        },
        failEffects: {
          cashDelta: 0, heatDelta: 10, reputationDelta: -2, credibilityDelta: -5,
          inventoryLost: false,
          message: 'He laughs. "You\'re funny." The deal is still on, but he takes note. No bonus for you.',
        },
      },
    ],
  };
}

function generateRaidSell(player: PlayerState, tier: number, context: string, goodName: string): ChoiceEvent {
  const setup = SELL_RAID_SETUPS[Math.floor(Math.random() * SELL_RAID_SETUPS.length)];
  const summary = SELL_KINGPIN_SUMMARIES.failure[Math.floor(Math.random() * SELL_KINGPIN_SUMMARIES.failure.length)];
  return {
    id: nextSellId(),
    title: 'THE RAID',
    context: `${context}\n\n${setup}`,
    choices: [
      {
        id: 'escape',
        text: 'Grab what you can and run. The goods can be replaced.',
        odds: 0.50 + player.credibility * 0.003,
        successEffects: {
          cashDelta: 0, heatDelta: 20, reputationDelta: 2, credibilityDelta: 5,
          inventoryLost: false,
          message: 'You dive through a back window, hit the ground running, and disappear into the crowd. You kept the product. The money can wait.',
        },
        failEffects: {
          cashDelta: -500, heatDelta: 35, reputationDelta: -5, credibilityDelta: -10,
          inventoryLost: true,
          message: `They catch you in the alley. The $%GOOD% is seized as evidence. You're lucky they didn't take you in. ${summary}`,
        },
      },
      {
        id: 'stand_ground',
        text: 'Stand your ground. You\'re not leaving empty-handed.',
        odds: 0.25 + player.notoriety * 0.004,
        successEffects: {
          cashDelta: 3000, heatDelta: 30, reputationDelta: 8, credibilityDelta: 12,
          inventoryLost: true,
          message: 'The police breach the room. In the chaos, you grab the cash and slip out a service door. You got paid — but your face is now on a camera.',
        },
        failEffects: {
          cashDelta: -2000, heatDelta: 45, reputationDelta: -10, credibilityDelta: -15,
          inventoryLost: true,
          message: `They flood the room. You're cuffed before you can move. They find the $%GOOD%, the cash, everything. Your name goes on a file. ${summary}`,
        },
      },
      {
        id: 'hide',
        text: 'Hide. Wait for them to pass. Then slip out.',
        odds: 0.60 + player.credibility * 0.002,
        successEffects: {
          cashDelta: 0, heatDelta: 15, reputationDelta: 1, credibilityDelta: 3,
          inventoryLost: false,
          message: 'You squeeze into a crawlspace and hold your breath. They search, but miss you. When the coast is clear, you slip out, product intact.',
        },
        failEffects: {
          cashDelta: -1000, heatDelta: 25, reputationDelta: -5, credibilityDelta: -8,
          inventoryLost: true,
          message: 'A dog finds you. They pull you out by your collar. The product is gone. You count yourself lucky you\'re not in the back of a van.',
        },
      },
    ],
  };
}

function generateGunfightSell(player: PlayerState, tier: number, context: string, goodName: string): ChoiceEvent {
  const setup = SELL_GUNFIGHT_SETUPS[Math.floor(Math.random() * SELL_GUNFIGHT_SETUPS.length)];
  const summary = SELL_KINGPIN_SUMMARIES.failure[Math.floor(Math.random() * SELL_KINGPIN_SUMMARIES.failure.length)];
  return {
    id: nextSellId(),
    title: 'BLOOD ON THE FLOOR',
    context: `${context}\n\n${setup}`,
    choices: [
      {
        id: 'join_fight',
        text: 'Grab a weapon and fight alongside your contact.',
        odds: 0.30 + player.credibility * 0.003 + player.notoriety * 0.002,
        successEffects: {
          cashDelta: 4000, heatDelta: 35, reputationDelta: 10, credibilityDelta: 15,
          inventoryLost: true,
          message: 'The firefight is brutal. You cover your contact\'s flank. When the smoke clears, the rivals are down and your contact is grateful. "You\'re solid." Big payday.',
        },
        failEffects: {
          cashDelta: -3000, heatDelta: 40, reputationDelta: -8, credibilityDelta: -15,
          inventoryLost: true,
          message: `You take a hit. Pain explodes through your arm. Your contact drags you out, but the $%GOOD% is left behind along with the cash. You're alive — barely.`,
        },
      },
      {
        id: 'flee_fight',
        text: 'Get out. The deal is dead.',
        odds: 0.55 + player.credibility * 0.002,
        successEffects: {
          cashDelta: 0, heatDelta: 20, reputationDelta: 0, credibilityDelta: 3,
          inventoryLost: false,
          message: 'You dive through the nearest exit and run. Your contact will understand — or he won\'t. You\'re alive and you still have the product.',
        },
        failEffects: {
          cashDelta: -1500, heatDelta: 30, reputationDelta: -5, credibilityDelta: -10,
          inventoryLost: true,
          message: 'You trip on the way out. Someone grabs your bag. You can\'t stop to fight for it. The product is gone. At least your blood is still inside your body.',
        },
      },
      {
        id: 'cover',
        text: 'Take cover. Let them fight. Protect yourself and the product.',
        odds: 0.45 + player.credibility * 0.003,
        successEffects: {
          cashDelta: 0, heatDelta: 20, reputationDelta: 3, credibilityDelta: 8,
          inventoryLost: false,
          message: 'You find cover behind an upturned table. Bullets fly overhead. When the shooting stops, you emerge with product intact. Your contact nods: "You\'ve got ice in your veins."',
        },
        failEffects: {
          cashDelta: -1000, heatDelta: 25, reputationDelta: -3, credibilityDelta: -5,
          inventoryLost: true,
          message: 'A stray shot hits your bag. The product spills across the floor. In the chaos, it gets trampled, ruined. You escape with nothing but your life.',
        },
      },
    ],
  };
}

function generateHenchmenSell(player: PlayerState, tier: number, context: string, goodName: string): ChoiceEvent {
  const setup = SELL_HENCHMEN_SETUPS[Math.floor(Math.random() * SELL_HENCHMEN_SETUPS.length)];
  const summary = SELL_KINGPIN_SUMMARIES.failure[Math.floor(Math.random() * SELL_KINGPIN_SUMMARIES.failure.length)];
  return {
    id: nextSellId(),
    title: 'THE DOUBLE CROSS',
    context: `${context}\n\n${setup}`,
    choices: [
      {
        id: 'stand_strong',
        text: 'Stand your ground. Show no fear. They blink first.',
        odds: 0.35 + player.credibility * 0.004 + player.notoriety * 0.002,
        successEffects: {
          cashDelta: 2000, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12,
          inventoryLost: true,
          message: 'You stare the lead henchman in the eyes. "You don\'t want this." Something in your voice makes him hesitate. He backs down. The deal goes through at a premium — respect money.',
        },
        failEffects: {
          cashDelta: -2500, heatDelta: 25, reputationDelta: -8, credibilityDelta: -12,
          inventoryLost: true,
          message: `They don't back down. They take the $%GOOD% and the cash. You're thrown out into the street, bruised and empty-handed. ${summary}`,
        },
      },
      {
        id: 'buy_off',
        text: 'Offer them a cut. Buy your way out.',
        odds: 0.55 + player.credibility * 0.002,
        successEffects: {
          cashDelta: -800, heatDelta: 5, reputationDelta: 1, credibilityDelta: 3,
          inventoryLost: false,
          message: 'You peel off a stack of bills. "Drinks on me." They laugh, take the money, and step aside. The deal continues. You\'re lighter, but you\'re still in the game.',
        },
        failEffects: {
          cashDelta: -800, heatDelta: 15, reputationDelta: -3, credibilityDelta: -8,
          inventoryLost: true,
          message: 'They take your bribe — then take the product anyway. "Thanks for the bonus." You\'ve been played.',
        },
      },
      {
        id: 'smooth_talk',
        text: 'Talk your way out. You\'re a businessman, not a target.',
        odds: 0.50 + player.reputation * 0.003,
        successEffects: {
          cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8,
          inventoryLost: false,
          message: 'Your words are silk. You remind them who you work with, who you know. The tension breaks. "Alright. You\'re legit." The deal resumes as if nothing happened.',
        },
        failEffects: {
          cashDelta: -1000, heatDelta: 15, reputationDelta: -5, credibilityDelta: -10,
          inventoryLost: false,
          message: 'They\'re not impressed. "Everyone talks." They take a grand off the top as a "tax" and continue the deal. Humiliating, but you\'re still standing.',
        },
      },
    ],
  };
}

// ============================================================
// ORIGINAL: Dealer Meeting Encounters (credibility-tiered)
// ============================================================

interface EncounterTemplate {
  tier: number;
  dealerIds: string[];
  generate: (p: PlayerState, c: Country, d: DealerProfile, dc?: DealContext) => ChoiceEvent;
}

export type { EncounterTemplate };

const DEALER_TEMPLATES: EncounterTemplate[] = [
  // === TIER 1: Low credibility (0-25) ===
  {
    tier: 1,
    dealerIds: ['col_1','col_2','col_3','afg_1','afg_2','afg_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pr = p(dealer);
      return {
      id: nextId(),
      title: 'The Back Alley Meeting',
      context: `Your contact leads Angelo through narrow alleys and hanging laundry. ${pr.He} stops in a dim courtyard. "Cash first," ${pr.he} says, hand out. The shadows seem to move behind ${pr.him}.`,
      choices: [
        { id: 'pay_up', text: 'Hand over the cash. Get the goods and go.', odds: 0.55 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 1, credibilityDelta: 5, inventoryLost: false, message: `${pr.He} counts the money, nods once. "Good lad, Angelo." and hands over the package. Clean deal. You're out before anyone notices.` }, failEffects: { cashDelta: -500, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `${pr.He} takes the money and shoves Angelo hard into the wall, you stupid little cunt. When you get up, ${pr.he}'s gone. So is the product. So is your cash.` } },
        { id: 'stand_firm', text: 'Show the cash but demand to see the product first.', odds: 0.35 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 8, inventoryLost: false, message: `${pr.He} studies you for a long moment, then laughs. "Paranoid. I like that." ${pr.He} opens the bag. Pure quality. The deal proceeds on your terms.` }, failEffects: { cashDelta: 0, heatDelta: 20, reputationDelta: 0, credibilityDelta: -15, inventoryLost: true, message: `${pr.He} whistles. "Amateur, Angelo, you spastic." Two men step out. "Bad move, Angelo, you little cunt." They take your cash, your watch, and leave you bleeding in the alley.` } },
        { id: 'walk', text: 'This feels wrong. Back away slowly.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'You back out slowly, hands visible. Nobody follows. Smart call.' }, failEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  {
    tier: 1,
    dealerIds: ['net_1','net_2','net_3','esp_2','esp_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Cafe Handoff',
      context: `Your contact gestures Angelo to a corner table, nursing a drink. ${p(dealer).He} slides a newspaper across. "It's inside," ${p(dealer).he} mutters. "Price went up ${Math.round(pct * 100)}%. Supply chain issues."`,
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). You're already here.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `${p(dealer).He} folds the paper. "Smart man." The deal is done. You overpaid — but you have the product.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `${p(dealer).He} takes your money, stands, and walks out. "Wrong move, Angelo, you nonce." A waiter bumps into you — when you look down, the newspaper is gone. So is the package inside it.` } },
        { id: 'negotiate', text: 'Push back. We agreed on a price.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `${p(dealer).He} studies Angelo, then laughs — a short, surprised bark. "Alright. You've got stones." ${p(dealer).He} honours the original price. Respect earned.` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `${p(dealer).He} shrugs and closes the paper. "No deal, then." ${p(dealer).He} leaves you sitting alone at the table.` } },
        { id: 'walk', text: 'Stand up and leave. Not today.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'You walk. No deal, but no blood either.' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  {
    tier: 1,
    dealerIds: ['col_1','col_2','col_3','afg_1','afg_2','afg_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const taxBase = dealContext ? Math.min(dealContext.totalCost, player.cash) : player.cash;
      const tax = Math.floor(taxBase * pct);
      const oddsBoost = Math.min(0.30, (tax / Math.max(1, player.cash)) * 0.40);
      return {
      id: nextId(),
      title: 'The Street Shakedown',
      context: `A group of men block the alley exit. The one in the middle smiles — gold tooth catching the light. "You're new around here. There's a tax for doing business in this neighbourhood. Pay it, or we take it all."`,
      choices: [
        { id: 'pay_tax', text: `Pay the "tax" — $${tax}. Keep it civil.`, odds: 0.55 + oddsBoost + player.credibility * 0.002, successEffects: { cashDelta: -tax, heatDelta: 5, reputationDelta: 0, credibilityDelta: 2, inventoryLost: false, message: `${p(dealer).He} pockets the cash. "Pleasure doing business, Angelo." His men part like a curtain. You pass unharmed.` }, failEffects: { cashDelta: -tax, heatDelta: 20, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `${p(dealer).He} takes the money — then nods. His men grab you from behind. They take everything. "Tax went up," ${p(dealer).he} says, walking away.` } },
        { id: 'stand_ground', text: 'Stand your ground. You don\'t pay tax to street trash.', odds: 0.25 + player.notoriety * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 15, inventoryLost: false, message: `Something in Angelo's eyes makes him pause. ${p(dealer).He} laughs — a genuine one this time. "Tough bastard. Alright. Pass." The men part. You walk through without paying a cent.` }, failEffects: { cashDelta: 0, heatDelta: 30, reputationDelta: 0, credibilityDelta: -20, inventoryLost: true, message: 'They jump Angelo. "Wrong move, you fucking retard." When you come to, your pockets are empty and your face is in the gutter. Pride wounded. Wallet destroyed.' } },
        { id: 'run_back', text: 'Turn and run. Get the hell out.', odds: 0.60, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'You bolt. They shout but nobody chases. You\'re safe — but the deal is dead.' }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: 'You slip on loose gravel. They catch up, shove you around a bit, and warn you not to come back. Nothing lost but pride.' } },
      ],
      };
    },
  },
  // === TIER 2: Medium credibility (25-60) ===
  {
    tier: 2,
    dealerIds: ['net_1','net_2','net_3','esp_2','esp_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Private Bar Meeting',
      context: `Angelo meets his contact in a dimly lit bar. ${p(dealer).He} slides a sample across the worn wooden table. "Top shelf. Fresh from the lab. My guy wants to move double the usual volume. You interested?"`,
      choices: [
        { id: 'take_double', text: 'Take double volume. Big risk, big reward.', odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: 'The quality is exceptional — pure and clean. You flip it fast. Double the profit, double the reputation.' }, failEffects: { cashDelta: -2000, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: 'It\'s a setup. Police swarm the bar from the back entrance. You escape through the kitchen but the cash and product stay behind.' } },
        { id: 'stick_standard', text: 'Stick to the original amount. Test the quality first.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `${p(dealer).He} nods. "Smart. We'll talk about volume next time." The standard deal goes smoothly.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: true, message: 'The sample was good, Angelo . but the main batch is cut to shit. You move it at a loss. Lesson learned.' } },
        { id: 'decline', text: 'Decline. Your gut says no.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Angelo thanks him and leaves. Two days later, you hear that bar was raided by federal police. Trust your gut.' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  {
    tier: 2,
    dealerIds: ['col_1','col_2','col_3','afg_1','afg_2','afg_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Police Sting',
      context: `You arrive at the meeting point. A van is parked where your contact should be. Through the tinted window, you catch a glimpse — a man adjusting a wire under his shirt. Your stomach drops.`,
      choices: [
        { id: 'walk_past', text: 'Walk past casually. Don\'t stop. Don\'t look back.', odds: 0.60 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: 'You walk past with your phone to your ear, just another businessman. They don\'t follow. Your contact calls later: "They picked up my signal. You saved us both."' }, failEffects: { cashDelta: 0, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: 'They spot your hesitation. Two plainclothes agents break cover. Angelo runs. drops the product on the way, you spastic on the way. It\'s tagged as evidence.' } },
        { id: 'call_off', text: 'Call your contact. Warn him. Abort everything.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: 'The phone rings once. He answers. "I know," he says. "Get out of there. Now." The deal is off — but you\'re clean.' }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'No answer. You leave a message and disappear into the crowd. Alive and free.' } },
        { id: 'ignore', text: 'Proceed anyway. The product is worth the risk.', odds: 0.20, successEffects: { cashDelta: 5000, heatDelta: 20, reputationDelta: 10, credibilityDelta: 15, inventoryLost: false, message: 'The man with the wire walks straight past you and arrests a completely different dealer two doors down. Wrong place, wrong time — for HIM. You and your contact stand there frozen like two spastics watching a car crash. When the dust settles, you\'re both still standing. The deal goes through. Sometimes it\'s better to be lucky than good.' }, failEffects: { cashDelta: -5000, heatDelta: 40, reputationDelta: 0, credibilityDelta: -20, inventoryLost: true, message: 'It IS a sting. Federal agents pour out of the van. You lose everything — cash, product, freedom for about six terrifying hours. You barely walk away.' } },
      ],
    }),
  },
  {
    tier: 2,
    dealerIds: ['afg_1','afg_2','afg_3','net_1','net_2','net_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Bonus Offer',
      context: `Your contact seems unusually happy to see Angelo. "Got some good news for you," ${p(dealer).he} grins. "Supplier overproduced. I can give you an extra fifty percent at half price. Take it now, or it goes to someone else tonight."`,
      choices: [
        { id: 'take_bonus', text: 'Take the bonus. Extra product, half price.', odds: 0.55 + player.credibility * 0.003, successEffects: { cashDelta: -300, heatDelta: 10, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: 'The bonus product is pristine. You sell it for significantly more than expected. Sometimes the gamble pays.' }, failEffects: { cashDelta: -300, heatDelta: 15, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: 'The "bonus" product is cut with god knows what. Baking soda, mostly. Worthless. You\'re stuck with it and your dealer is suddenly unreachable.' } },
        { id: 'refuse_bonus', text: 'Stick with the original deal. No surprises.', odds: 0.85, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `${p(dealer).He} shrugs. "Your loss, my friend." The original deal goes through cleanly. Slow and steady.` }, failEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `${p(dealer).He} looks disappointed but proceeds. The deal is fine.` } },
      ],
    }),
  },
  // === TIER 3: High credibility (60-100) ===
  {
    tier: 3,
    dealerIds: ['net_1','net_2','net_3','esp_2','esp_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Five-Star Proposition',
      context: `Your contact has clearly upgraded since he last saw Angelo. ${p(dealer).He} meets you in a penthouse suite — floor-to-ceiling windows, city lights below. A man in a tailored suit pours two glasses of whiskey. "We have a situation," he says. "A shipment worth fifty thousand needs to disappear — quietly. You\'re the one who can make that happen. Twenty percent is yours."`,
      choices: [
        { id: 'take_job', text: 'Accept. This is the big leagues.', odds: 0.40 + player.credibility * 0.005, successEffects: { cashDelta: 10000, heatDelta: 15, reputationDelta: 10, credibilityDelta: 20, inventoryLost: false, message: 'The operation runs like a Swiss watch. You earn every dollar — and a reputation that opens new doors.' }, failEffects: { cashDelta: -5000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -15, inventoryLost: true, message: 'Set up. You walk into an ambush — three men waiting in the dark. You lose the cash and the product. You\'re lucky to walk out at all.' } },
        { id: 'negotiate_cut', text: 'Counter at thirty percent. Your risk, your price.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 15000, heatDelta: 15, reputationDelta: 12, credibilityDelta: 25, inventoryLost: false, message: 'He smiles — a slow, genuine smile. "Bold. I respect that. Thirty percent it is." Your most profitable run yet.' }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: 'He laughs. "You\'ve got balls, I\'ll give you that. But the offer is off the table." You leave with nothing. Some doors close.' } },
        { id: 'decline_offer', text: 'Politely decline. You don\'t know him well enough.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: 'He nods slowly. "Discretion. A dying art." He hands you a card. "When you\'re ready." The offer stays on the table.' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  {
    tier: 3,
    dealerIds: ['col_1','col_2','col_3','afg_1','afg_2','afg_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Cartel Invitation',
      context: `A black SUV with tinted windows pulls up beside you. The rear window rolls down — smooth, electric. The face inside is calm, unreadable. "Get in," he says. "The organisation has been watching Angelo. They want to make you an offer you cannot refuse."`,
      choices: [
        { id: 'get_in', text: 'Get in the SUV. This is how empires are built.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 25000, heatDelta: 20, reputationDelta: 15, credibilityDelta: 30, inventoryLost: false, message: 'The cartel offers you a direct pipeline — no middlemen, no markup, priority supply. Your earnings triple. Your name starts appearing in rooms you\'ve never entered.' }, failEffects: { cashDelta: -10000, heatDelta: 35, reputationDelta: 0, credibilityDelta: -20, inventoryLost: true, message: 'It\'s a shakedown. They take your cash as a "security deposit" and dump you on the outskirts of town with a warning. You were too eager.' } },
        { id: 'negotiate', text: 'Stay on the street. Talk through the window.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 10000, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: 'They respect the caution. "A man who doesn\'t rush — rare." A smaller deal is offered. Good money, less exposure.' }, failEffects: { cashDelta: -3000, heatDelta: 15, reputationDelta: 0, credibilityDelta: -8, inventoryLost: true, message: 'The window rolls up. "You waste our time." The SUV drives off. The opportunity evaporates.' } },
        { id: 'refuse', text: 'Refuse. You don\'t answer to cartels.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: 'The window rolls up without a word. The SUV glides away. You feel their eyes on you for days — but you\'re still standing. Still independent.' }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  {
    tier: 3,
    dealerIds: ['col_1','col_2','col_3','esp_2','esp_3','net_1','net_2','net_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Fed Warning',
      context: `Your encrypted phone buzzes. Unknown number. You answer. A calm, filtered voice says: "You\'re on a list. They\'re building a case — surveillance, financial records, the works. Not today, not tomorrow — but soon. I can make your file disappear. Five thousand. Or you can take your chances."`,
      choices: [
        { id: 'pay_off', text: 'Pay $5,000. Make the file disappear.', odds: 0.50 + player.credibility * 0.003, successEffects: { cashDelta: -5000, heatDelta: -20, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: 'The voice pauses, then: "Done." You check your sources through back channels. Your file is clean. Five grand bought you a ghost.' }, failEffects: { cashDelta: -5000, heatDelta: 20, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: 'It was a scam. A very good one. The voice disappears along with your five grand. Your file is still very much active. And now you\'re five thousand lighter.' } },
        { id: 'lie_low', text: 'Lie low. Cancel everything. Wait it out.', odds: 0.75, successEffects: { cashDelta: 0, heatDelta: -15, reputationDelta: 0, credibilityDelta: 5, inventoryLost: false, message: 'You cancel the run and vanish for a week. When you resurface — radio silence. The heat has passed. Smart move.' }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: 'The warning was real. They raid your usual spots. You\'re not there — but your name is now pinned to the board. Heat\'s on.' } },
        { id: 'ignore', text: 'Ignore it. Deals don\'t wait for paranoia.', odds: 0.35, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 5, credibilityDelta: 10, inventoryLost: false, message: 'Angelo proceeds. The warning was a bluff, those nonces — a competitor trying to spook you off the market. The deal completes without a hitch.' }, failEffects: { cashDelta: 0, heatDelta: 30, reputationDelta: 0, credibilityDelta: -15, inventoryLost: true, message: 'They weren\'t bluffing. The deal is raided mid-exchange. You lose everything — and now you definitely have a file.' } },
      ],
    }),
  },
  // === TIER 1 — Howard (esp_1) ===
  {
    tier: 1,
    dealerIds: ['esp_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Hillside Meeting',
      context: `Howard waves you into the back of his VW camper van — beanbags, fairy lights, the faint smell of weed and old Welsh coal dust. "Sit down, butt. They've been watching the road all week — plainclothes. Supply's tight. Price went up ${Math.round(pct * 100)}%. Nothing I can do about it, mun."`,
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). Howard's never lied to you.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Howard nods slowly, passing you the joint. "Tidy. You're learning, Angelo. A good deal is one where both men walk away a bit unhappy — old pit saying." The deal is done. You overpaid — but Howard's product quality makes up for it.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `Howard takes your money, then his face drops. He's looking past you through the van window. "Police. Plainclothes — the same two from Tuesday. Lie flat, mun." They don't find you. But they find the product. By the time they've finished searching the van, the package is in an evidence bag and you're hiding behind a beanbag.` } },
        { id: 'negotiate', text: 'Push back. Howard\'s a reasonable man.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `Howard studies you for a long moment — then that slow Welsh grin breaks through. "Fair play, Angelo. You've got a bit of the union rep in you. Nobody's haggled with me since 1987. Alright — original price. Respect." The smoke curls around the fairy lights.` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `Howard shakes his head, not offended — just sad. "Can't do it, butt. Price is the price. I learned that from my father — and he learned it from the coal face." He fires up the van. "Come back when you're serious." The fairy lights flicker as he drives off.` } },
        { id: 'walk', text: 'Stand up and leave. The vibe feels off.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Howard doesn't try to stop you. "Good instinct, mun. Trust your gut — especially when the police have been staring at my van for three days." As you walk down the hillside, you see exactly that: an unmarked car parked two hundred metres down the lane. Howard was right.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  // === TIER 2 — Howard (esp_1) ===
  {
    tier: 2,
    dealerIds: ['esp_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Union Meeting',
      context: `Howard's parked the camper van somewhere different tonight — further up the mountain, away from the usual spot. He gestures at a crate in the back. "Had a call from an old mate from the Valleys. He's growing something special in the Rhondda — shipped it down. Wants me to move double the usual. What do you think, butt? Feeling brave or playing safe?"`,
      choices: [
        { id: 'take_double', text: 'Take double volume. Big risk, big reward.', odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: `Howard beams — proper Valleys smile. "There it is! That's the spirit, mun. My old crew chief would've loved you — never backed down from a challenge. Right, let's load you up." The batch is exceptional — Welsh-grown, Spanish-sun-dried. You flip it fast. Double profit. Double reputation. Howard gives you a thumbs up from the driver's seat.` }, failEffects: { cashDelta: -2000, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `You should've known better. Howard's mate from the Rhondda? The parcel's been flagged at the port. Spanish customs have been tracking it for weeks. Howard takes the heat — "I'll be fine, butt. I've been arrested more times than I've had hot dinners" — but you lose the cash and the product. You hear him shouting in Welsh as you leave. It doesn't sound complimentary.` } },
        { id: 'stick_standard', text: 'Stick to the original amount. Howard respects caution.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `Howard nods approvingly. "Wise. Very wise. You know what they say — 'the best miners are the ones who come home.'" He taps the side of his nose. The standard deal goes through without a hitch. He rolls you a joint for the road. "Come back when you're ready for the big stuff."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: true, message: `Howard shrugs — he's not angry, just disappointed. "The sample was lovely, Angelo. Lovely. But the main batch? Fucking Cardiff ditch weed, mun. I'm embarrassed — and I don't embarrass easy." He gives you a discount on your next visit as an apology. It doesn't make up for the loss.` } },
        { id: 'decline', text: 'Decline. Too many red flags tonight.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Howard doesn't argue. "Fair enough, butt." He scribbles something on a napkin. "That's my other number. The one the police don't know about. Call me when you're feeling bolder." Two days later you hear the Spanish Guardia raided the Rhondda shipment at the docks. Howard was one step ahead. The napkin is still in your pocket.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  // === TIER 3 — Howard (esp_1) ===
  {
    tier: 3,
    dealerIds: ['esp_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Old Smuggler\'s Wisdom',
      context: `Howard's van is tidier than usual — the beanbags are brushed, the fairy lights are working, the Welsh dragon sticker has been replaced with a fresh one. He's sitting cross-legged on the floor, leaning forward like he's about to share state secrets. "Angelo, butt — I've been doing this a long time. Longer than most. And I've got a contact who wants fifty grand's worth moved through the port. Quietly. The way they did it in the seventies — false papers, false names, the works. Twenty percent is yours. But this isn't like our usual deals. This is the kind of job that makes you a legend or puts you in prison for seven years. You in?"`,
      choices: [
        { id: 'take_job', text: 'Accept. This is the big leagues.', odds: 0.40 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Howard's eyes light up. "Tidy, mun! Absolutely tidy!" He reaches under the driver's seat and pulls out a folder — names, dates, shipping manifests, the works. Old-school. Proper smuggler craftsmanship. "This is how they did it before computers, Angelo. Paper trails that lead nowhere." The operation runs like clockwork. You earn every dollar — and Howard earns your undying respect.` }, failEffects: { cashDelta: -3000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The paperwork was too old. The shipping manifest had a typo — a Welsh word that Spanish customs didn't recognise but still flagged. It was enough. Howard tries to warn you — "Scatter, butt! SCATTER!" — but it's too late. Two men grab you. The cash and product stay behind. Howard drives off in the van, shouting apologies in Welsh out the window.` } },
        { id: 'negotiate_cut', text: 'Counter at thirty percent. Your risk, your price.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Howard pauses. Then that slow Welsh grin. "Thirty percent. You know what, Angelo? That's fair. That's actually fair." He puts his calloused miner's hand out. "Deal. The union taught me one thing: never agree to the first offer. Good lad." The most profitable run you've ever done. Howard gives you a Welsh coal keyring as a souvenir. "Solid as the pits, mun."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Howard chuckles, but it's sad. "I can't, butt. Twenty percent is what it is. The old ways were built on trust, not negotiation. The offer's off the table." He doesn't seem angry. Just... old. You leave with nothing. The camper van's engine rattles as you walk away.` } },
        { id: 'decline_offer', text: 'Politely decline. You don\'t know this contact well enough.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Howard doesn't push. "Wise, mun. Very wise." He pulls out a small Welsh flag from the glove compartment. "Take this. For luck. And when you ARE sure — you know where to find me." The van rumbles off into the Spanish night. The flag is now in your wallet.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
];

// ============================================================
// ORIGINAL: Dealer Encounter Generator (purchase phase)
// ============================================================

export function generateDealerEncounter(
  player: PlayerState,
  country: Country,
  dealer: DealerProfile,
  dealContext?: DealContext,
): ChoiceEvent {
  const tier = getCredibilityTier(player);

  const candidates = DEALER_TEMPLATES.filter((t) => {
    if (t.tier !== tier) return false;
    if (t.dealerIds.includes(dealer.dealerId)) return true;
    return false;
  });

  const pool = candidates.length > 0 ? candidates
    : DEALER_TEMPLATES.filter((t) => t.tier === tier);

  const final = pool.length > 0 ? pool
    : [DEALER_TEMPLATES[Math.floor(Math.random() * DEALER_TEMPLATES.length)]];

  const template = final[Math.floor(Math.random() * final.length)];
  return template.generate(player, country, dealer, dealContext);
}

// ============================================================
// KINGPIN ENCOUNTER GENERATOR — 3 named kingpins
// ============================================================

// ── Dialogue pools keyed by kingpin ID ──────────────────────────

const CLEAN_SETUPS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [
    `The car wash in Barking is closed — it's always closed. Angelo meets Sergio in the back office: a desk, two chairs, a CCTV monitor showing an empty forecourt. He doesn't sit. "You brought what you said?" He gestures at the %GOOD%. "Show me, Blacky."`,
    `Sergio is under a BMW on the hydraulic lift, wiping grease from his hands. "Five minutes," he says without looking at you. "I'm replacing a timing belt. You can wait." You wait. When he's done, he leads you to the office — locks the door behind you. "Now. Business."`,
    `The car wash has four other men in it — all Albanian, all watching you. Sergio is at the centre, arms crossed, eyeing Angelo. "My cousins," he says. "They don't speak much English. Don't worry — they're only here in case you try something stupid." He smiles. It doesn't reach his eyes. "The product. On the table, you Coon."`,
    `Sergio's in a bad mood. You can tell because he's actually speaking — rapid Albanian into his phone, gesturing at the ceiling. He hangs up. "Problems. Always problems." He takes a breath. "But business is business. You have the %GOOD%? Good. Let's not waste more time, Blacky."`,
    `You find Sergio in the back, counting stacks of cash with a machine. He doesn't acknowledge you until it finishes. The final tally: a number you don't catch. "That's last week. Now — this week." He points at your bag. "Show me what you brought, you little Blacky."`,
  ],
  iqbal: [`You meet Quentin in his flat above the launderette — mirrors on every wall, a chaise longue in the corner that's seen things, things no furniture should see. He's in a silk kimono, nostrils dusted white. "Oh, you came! I knew you would, chocolate boy." He claps his hands. "%GOOD% on the table. Slowly. I want to watch." He does another line while you comply.`],
};

const CLEAN_CLOSE_SUCCESS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [
    `Sergio tests the product Angelo brought — a tiny sample on the back of his hand, rubbed into the skin. He waits. Nods. "Good. You don't lie to me. Some people lie to me." He doesn't elaborate on what happens to those people. He counts the cash twice — once for him, once for you. The deal is done, Blacky.`,
    `"Shumë mirë." Very good. Sergio almost smiles. He counts the cash quickly — the machine whirring — and hands it over. "You are reliable. I don't forget reliable people." A pause. "I also don't forget unreliable people." He locks eyes with you. "So stay reliable, you Coon."`,
    `Sergio's mood has improved. He actually offers you a coffee — thick, black, Albanian-style. "My grandmother's recipe," he says. "She would've liked you. She liked people who did what they said they'd do." He hands over the cash and raises his tiny cup. "To business."`,
    `The deal is quick. Efficient. Sergio values speed — he doesn't like product sitting on the table longer than necessary. Cash counted, product bagged, handshake exchanged. His grip could crush walnuts. "Good. Now go, Blacky. I have other business." He's already on his phone before you reach the door.`,
    `"You see?" Sergio gestures at the CCTV monitor — the empty forecourt, the closed shutters. "Clean. Quiet. Nobody knows we're here. Nobody needs to know." He hands over the cash. "This is how business should be. Between people who understand each other, you little Coon."`,
  ],
  iqbal: [`Quentin fans himself with the cash, sniffing between sentences. "Delicious. Absolutely delicious. You're very good at this, chocolate boy — very good." He leans in close, gear-fuelled breath on your neck. "We should do this again. Maybe somewhere with fewer mirrors. Or more mirrors. I haven't decided." He hands over a crumpled envelope. It smells of poppers and poor decisions.`],
};

const CLEAN_CLOSE_FAIL: Record<string, string[]> = {
  avi: [
    `You try to hide in the vault but Avi's already closed it — with himself inside. "Sorry, bubbeleh! Only room for one!" You're caught in the open when the police sweep through. Everything seized. Avi mouths "sorry" through the vault window.`,
    `You go for the crawlspace but Yossi's already up there — with the diamonds. Not enough room. You drop back down just as an officer enters. "Found one." Everything gone. Yossi looks down from the ceiling and shrugs apologetically.`,
  ],
  sergio: [
    `Sergio's phone rings. He answers in Albanian — rapid, sharp. His expression darkens. He hangs up. "There is a problem. Someone I know." He pushes the product back across the desk. "We do this another day. Go now — before the problem arrives, Blacky."`,
    `One of the cousins bursts in, speaking fast, pointing at the CCTV. Sergio's face goes hard. "Police. Unmarked car. Two streets away." He's already standing, shoving cash into a bag. "Out the back. Now. We never met, you Coon." He disappears through a side door. You do the same.`,
  ],
  iqbal: [`Quentin's phone buzzes. He glances at it mid-snort and his whole face collapses. "Oh no. Oh no no no. That cunt from the council. They're trying to shut down my Wednesday night burlesque. Philistines! I'm an ARTIST!" He's already grabbing his feather boa. "We'll have to reschedule, chocolate boy. Don't pout — it's unbecoming. Oh, go on then, pout. You look fit when you're upset." He squeezes your arse on the way past. The chaise longue wobbles.`],
};

const CLEAN_NEGOTIATE_SUCCESS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [
    `Sergio stares at you. The silence stretches. His cousins shift uneasily. Then he laughs — a single, sharp bark. "You've got balls, Blacky. I respect balls." He peels off the extra cash. "Twenty percent. Because you asked. Nobody ever asks."`,
    `"In my country, haggling is an insult." He pauses. "But you are not from my country. And you bring good product." He counts out the bonus. "Don't make a habit of it, Coon." The cousins relax. You've passed some invisible test.`,
    `Sergio studies you like you're a puzzle he's trying to solve. "Most Englishmen — they come in here, they're nervous. They agree to whatever I say. You — you push back." He nods slowly. "Fine. Extra ten percent. Because you're not like most Englishmen."`,
    `"You want more money?" Sergio's voice is flat. Then his face cracks into something almost like a smile. "Fine. I'll give you more. But you owe me, Blacky. Next time — you bring twice as much. Deal?" He slides the bonus across. "Deal."`,
    `He counts out the extra cash with deliberate slowness — making you wait, making you wonder if he's about to change his mind. "Twenty percent. Because you are either very brave or very stupid. I haven't decided which, you little Coon." He hands it over. "Let's find out next time."`,
  ],
  iqbal: [`Quentin looks at you like you've just offered him a threesome with Russell Brand. "Oh. OH. You want MORE? Chocolate boy, I like you. I like you a lot." He runs a finger down your chest, leaves a tiny trail of coke residue on your shirt. "That's on me. Tell you what — bonus, because you've got lovely eyes. And because I want to see you without the shirt. Well, I'm SAYING it's because of the eyes." Extra ten percent. The finger stays on your chest longer than medically necessary.`],
};

const CLEAN_NEGOTIATE_FAIL: Record<string, string[]> = {
  avi: [
    `You try to hide in the vault but Avi's already closed it — with himself inside. "Sorry, bubbeleh! Only room for one!" You're caught in the open when the police sweep through. Everything seized. Avi mouths "sorry" through the vault window.`,
    `You go for the crawlspace but Yossi's already up there — with the diamonds. Not enough room. You drop back down just as an officer enters. "Found one." Everything gone. Yossi looks down from the ceiling and shrugs apologetically.`,
  ],
  sergio: [`Sergio laughs. "Nice try, Blacky." Deal still on, no bonus.`],
  iqbal: [`Quentin throws his head back and laughs — a theatrical, operatic sound that rattles the mirrors. Powdershake falls from his nostril. "Oh, chocolate boy. NO. You're adorable when you try to negotiate. Like a Jack Russell humping a sofa — lot of effort, fuck all result." He pats your cheek. Twice. "Price is the price. But I'll comp you a ticket to my show. I'm doing Liza. On ketamine." He snorts another line. "It's VERY avant-garde."`],
};

const MUGGING_SETUPS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [`Sergio's men step closer. "I think we take the product and keep the cash, you little Blacky."`],
  iqbal: [`Quentin's demeanour shifts — the camp drops away, replaced by something sharper. He snaps his fingers and two very large men in very tight vests step out of the bathroom. "Chocolate boy. I've decided I'm keeping the product AND the cash. Consider it a... charitable donation." He winks and does a line off the back of his hand. "Specifically, the art of ME having more than you. Jack Whitehall could probably get away with this. And he's a cunt."`],
};

const MUGGING_STARE_SUCCESS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [`You hold Sergio's gaze. He backs down. "Only joking." The deal completes.`],
  iqbal: [`You hold Quentin's gaze. He holds it back. The silence stretches — just the hum of the launderette below. Then his face cracks into a grin. "Ooh, you're GOOD. I like a man who doesn't blink." He waves the goons away. "Fuck off, lads. The grown-ups are doing business." Turns back to you, wipes his nose. "Russell Brand couldn't have done that. And Russell Brand has done a LOT." The deal completes normally.`],
};

const MUGGING_STARE_FAIL: Record<string, string[]> = {
  avi: [
    `You try to hide in the vault but Avi's already closed it — with himself inside. "Sorry, bubbeleh! Only room for one!" You're caught in the open when the police sweep through. Everything seized. Avi mouths "sorry" through the vault window.`,
    `You go for the crawlspace but Yossi's already up there — with the diamonds. Not enough room. You drop back down just as an officer enters. "Found one." Everything gone. Yossi looks down from the ceiling and shrugs apologetically.`,
  ],
  sergio: [`Sergio doesn't back down. His men take everything, you Coon.`],
  iqbal: [`Quentin doesn't back down. He leans closer — too close. You can smell last night's coke, this morning's poppers, and something floral that might be his nan's perfume. "You're trembling, chocolate boy. I can feel it. And not in the fun way." His goons move in. Everything's gone — cash, product, whatever shred of masculinity you walked in here with. Quentin blows you a kiss. White powder puffs from his lip.`],
};

const MUGGING_FIGHT_SUCCESS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [`You fight back, Blacky. In the chaos you grab the cash AND product. You're out before they recover.`],
  iqbal: [`You don't think — you just move. In the chaos of sequins and shattered mirror, you grab the cash AND product. Quentin shrieks — a genuine, trained operatic note that would impress Andrew Lloyd Webber. "MY CASH! MY PRODUCT! MY GOOD MIRROR, THE ONE WITHOUT JIZZ ON IT!" You're out the door before his goons can untangle themselves from a collapsed ballet barre. Worth every second.`],
};

const MUGGING_FIGHT_FAIL: Record<string, string[]> = {
  avi: [
    `You try to hide in the vault but Avi's already closed it — with himself inside. "Sorry, bubbeleh! Only room for one!" You're caught in the open when the police sweep through. Everything seized. Avi mouths "sorry" through the vault window.`,
    `You go for the crawlspace but Yossi's already up there — with the diamonds. Not enough room. You drop back down just as an officer enters. "Found one." Everything gone. Yossi looks down from the ceiling and shrugs apologetically.`,
  ],
  sergio: [`They're faster. Stronger. You wake up in the alley. Everything gone, you Blacky.`],
  iqbal: [`They're faster than you. One of them holds you while Quentin tuts disapprovingly, pausing only to sniff between his fingers. "Oh, chocolate boy. This is just EMBARRASSING now. For both of us. But mostly for you." He takes everything — cash, product, the score you had tucked in your sock. "I'm keeping this as a tip. You were a terrible audience. And a worse fighter."`],
};

const MUGGING_RUN_SUCCESS: Record<string, string[]> = {
  avi: [
    `"Yossi — the door!" You don't wait for Yossi to respond. You grab the cash, vault over Avi's desk, and you're through the fire exit before anyone can stop you. The stairs lead to the alley behind Hatton Garden. Behind you, Avi's voice: "The cash! He took the cash! What kind of gonif steals from a Jew?!"`,
    `You scoop the cash and run. Yossi chases you as far as the street but he's not built for sprinting — more of a "menacing walk" physique. By the time he reaches the pavement, you're already past the diamond exchange and heading for the Tube. Product left behind. Cash in pocket.`,
    `"Another time, Avi!" You grab the envelope and bolt down the stairs. Through the diamond wholesaler, past the alarmed display cases, out onto Hatton Garden. The gold dealers are giving you strange looks but nobody stops you. You're on the Central Line before Avi's finished shouting at Yossi.`,
  ],
  sergio: [`You scoop the cash and bolt, you clever Coon. The product stays behind — but you're alive.`],
  iqbal: [`You grab the cash and sprint. Behind you, Quentin's voice rings out — pure theatre kid projection, bouncing off every mirror: "COME BACK HERE, CHOCOLATE BOY! WE HAVEN'T FINISHED! I WAS GOING TO SHOW YOU MY CABARET ROUTINE!" You don't stop running until you're three Tube stops away. Product stays behind. Cash in pocket. You can still hear him in your head.`],
};

const MUGGING_RUN_FAIL: Record<string, string[]> = {
  avi: [
    `You try to hide in the vault but Avi's already closed it — with himself inside. "Sorry, bubbeleh! Only room for one!" You're caught in the open when the police sweep through. Everything seized. Avi mouths "sorry" through the vault window.`,
    `You go for the crawlspace but Yossi's already up there — with the diamonds. Not enough room. You drop back down just as an officer enters. "Found one." Everything gone. Yossi looks down from the ceiling and shrugs apologetically.`,
  ],
  sergio: [`You trip, Blacky. They catch you. Take everything.`],
  iqbal: [`You trip. On what? A feather boa. A cheap, shedding, pink feather boa, just lying there on the floor of a grubby Dalston flat like a prop from a show nobody asked for. Before you can get up, one of Quentin's goons is on you. Quentin looks down, genuinely disappointed, wiping his nose. "Oh dear. You tripped on the boa. That's symbolic, that is. I don't know of what, but it's definitely symbolic." Everything gone.`],
};

const RAID_SETUPS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [`The door splinters inward. "POLICE! GET DOWN!" Blue lights flash through the car wash windows. "MOVE, Blacky!"`],
  iqbal: [`The door to the flat splinters inward. "POLICE! EVERYBODY FREEZE!" Blue lights ricochet off every mirror — the whole room strobes like the world's shittest disco. Quentin drops his kimono in shock — full frontal, coke still on his top lip. "THIS IS AN OUTRAGE! I HAVE A PERFORMANCE ON THURSDAY! DO YOU KNOW HOW LONG 'DON'T CRY FOR ME ARGENTINA' TOOK TO LEARN?!" He's still naked. Nobody's enjoying this.`],
};

const RAID_GRAB_SUCCESS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [`You grab everything and dive through a back window. You got out with everything.`],
  iqbal: [`You grab everything — cash, product, and somehow Quentin's backup kimono — and launch yourself through the fire escape. Behind you: shouting, crashing, and Quentin's voice slicing through it all: "THAT KIMONO WAS VINTAGE, YOU ABSOLUTE BASTARD! MY AUNTIE BROUGHT THAT BACK FROM KYOTO! SHE'S DEAD NOW!" You're two streets away before you realise you're running in a silk robe.`],
};

const RAID_GRAB_FAIL: Record<string, string[]> = {
  avi: [
    `You try to hide in the vault but Avi's already closed it — with himself inside. "Sorry, bubbeleh! Only room for one!" You're caught in the open when the police sweep through. Everything seized. Avi mouths "sorry" through the vault window.`,
    `You go for the crawlspace but Yossi's already up there — with the diamonds. Not enough room. You drop back down just as an officer enters. "Found one." Everything gone. Yossi looks down from the ceiling and shrugs apologetically.`,
  ],
  sergio: [`They're everywhere, Blacky. Cuffed before you reach the door. Everything confiscated.`],
  iqbal: [`They're everywhere. Before you can reach the back window, an officer has you cuffed. Quentin is already crying — actual tears, mascara tracking through yesterday's foundation, snot mixing with the coke residue. "This is the WORST raid I've ever been in. And I've been in four. FIVE if you count Butlins 2009. That was a dark weekend, chocolate boy. A DARK weekend." Everything confiscated. You're charged. Quentin asks if you want to share a cell. You do not.`],
};

const RAID_SLIP_SUCCESS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [`You leave the cash and slip out a service entrance. The product is safe.`],
  iqbal: [`You leave the cash on the chaise longue and slip out through the launderette below. Through the ceiling you can hear Quentin: "OFFICER. OFFICER. Do you enjoy musical theatre? Because I'm getting VERY dramatic energy from you. Have you ever considered amateur dramatics? Because I can see you as Javert. Very authoritarian. Very repressed. You'd be PERFECT." The police are too bewildered to notice you. Product safe. Quentin's still monologuing.`],
};

const RAID_SLIP_FAIL: Record<string, string[]> = {
  avi: [
    `You try to hide in the vault but Avi's already closed it — with himself inside. "Sorry, bubbeleh! Only room for one!" You're caught in the open when the police sweep through. Everything seized. Avi mouths "sorry" through the vault window.`,
    `You go for the crawlspace but Yossi's already up there — with the diamonds. Not enough room. You drop back down just as an officer enters. "Found one." Everything gone. Yossi looks down from the ceiling and shrugs apologetically.`,
  ],
  sergio: [`The back is covered. An officer grabs you. "Got one, you little Coon." Everything's gone.`],
  iqbal: [`The back window is jammed. An officer grabs you by the collar. Quentin spots you from across the room — still naked, still coked up, still somehow projecting. "OH, SO YOU'RE JUST LEAVING ME? TYPICAL. TYPICAL FUCKING MAN. First my ex-husband, now YOU." He turns to the officer. "Arrest him. But be gentle — he's very pretty when he's not betraying me." Everything's gone. Including your will to live.`],
};

const RAID_HIDE_SUCCESS: Record<string, string[]> = {
  avi: [
    `The vault. Avi's personal vault — the one where he keeps the diamonds. He punches in a code, the door swings open. "In. Don't touch anything." You squeeze between the safe deposit boxes with the cash and product. The door closes. Absolute silence. Absolute darkness. You wait. Twenty minutes. An hour. Then — the door opens. Avi, looking exhausted. "They're gone. They took my filing cabinet but not my diamonds. Schmucks."`,
    `Under the desk. It's not dignified but the desk is mahogany and it goes all the way to the floor. You crawl underneath with the cash and product. Above you, Avi sits back down, casual. Police boots on the floorboards. "Officers! Can I help you? I'm a legitimate businessman. I have a license. I pay my taxes — most of them." They search the office. They don't check under the desk.`,
    `The false wall — behind Avi's filing cabinet. He slides it open, shoves you in with the cash and product. "Don't. Make. A. Sound." The panel slides back. Through the thin wall you hear everything — the raid, the search, Avi's indignant voice explaining that this is anti-Semitic harassment and his lawyer will hear about it. After forty minutes, the panel opens. "They're gone. Meshuggeneh police. No respect for business."`,
    `Avi points at a ceiling panel. "Up. The maintenance crawlspace. My father used it during the war." You scramble up with the cash and product. Below, the office fills with police. You lie flat on the dusty boards, breathing through your mouth, listening to Avi offer them coffee and rugelach. Eventually — silence. You lower yourself down. Everything's still here.`,
    `The bathroom. It's tiny — barely room for a toilet and a sink — but the window looks onto a flat roof. You climb out with the cash and product, crouch behind a ventilation unit, and wait. The helicopter circles — you feel the rotor wash — but it's focused on the front of the building. When it moves on, you climb down a drainpipe. Everything intact.`,
  ],
  sergio: [`You squeeze into a storage closet. When the chaos passes, you slip out with everything.`],
  iqbal: [`You squeeze into the wardrobe — sequins, velvet, something that might have been a corset in 1987. Through a gap in the hangers you watch the police sweep the flat. Quentin is giving a full statement — with interpretive dance, with ACTING, with actual tears. They're too mesmerised to search properly. When the chaos passes, you emerge covered in glitter and questionable stains. But you've got everything. Worth the dry cleaning bill.`],
};

const RAID_HIDE_FAIL: Record<string, string[]> = {
  avi: [
    `You try to hide in the vault but Avi's already closed it — with himself inside. "Sorry, bubbeleh! Only room for one!" You're caught in the open when the police sweep through. Everything seized. Avi mouths "sorry" through the vault window.`,
    `You go for the crawlspace but Yossi's already up there — with the diamonds. Not enough room. You drop back down just as an officer enters. "Found one." Everything gone. Yossi looks down from the ceiling and shrugs apologetically.`,
  ],
  sergio: [`A dog finds you, Blacky. They drag you out. Everything bagged as evidence.`],
  iqbal: [`The wardrobe door swings open. Sequins avalanche everywhere — a glitter bomb in a flat that's already seen too much. An officer pulls you out by the collar. Quentin gasps — genuinely, deeply offended. "You were hiding in my CABARET COLLECTION? That's vintage, chocolate boy! Some of those sequins are older than YOU!" He turns to the officer. "I want him charged. For theft AND for crimes against fashion." Everything bagged as evidence. You're done.`],
};

// Helper to get random item from an array
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Helper to fill in placeholder in dialogue strings
function fill(dialogue: string, goodName: string): string {
  return dialogue.replace(/%GOOD%/g, goodName);
}

// ── Encounter generators ───────────────────────────────────────

export function generateKingpinEncounter(
  player: PlayerState,
  kingpin: KingpinProfile,
  goodName: string,
  totalValue: number,
): ChoiceEvent {
  const { clean, mugging, raid } = kingpin.encounterWeights;
  const total = clean + mugging + raid;
  const roll = Math.random() * total;

  if (roll < clean) {
    return generateKingpinClean(player, kingpin, goodName, totalValue);
  } else if (roll < clean + mugging) {
    return generateKingpinMugging(player, kingpin, goodName, totalValue);
  } else {
    return generateKingpinRaid(player, kingpin, goodName, totalValue);
  }
}

let _ks = 0;
function nextKingpinId(): string { return `kingpin_${++_ks}_${Date.now().toString(36)}`; }

function kp(key: Record<string, string[]>, k: KingpinProfile): string[] {
  return key[k.id] ?? key['Avi'] ?? [''];
}

function generateKingpinClean(player: PlayerState, k: KingpinProfile, goodName: string, totalValue: number): ChoiceEvent {
  return {
    id: nextKingpinId(),
    title: `Meeting ${k.name}`,
    context: fill(pick(kp(CLEAN_SETUPS, k)), goodName),
    choices: [
      { id: 'close_deal', text: 'Close the deal.', odds: 0.85,
        successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: true, message: fill(pick(kp(CLEAN_CLOSE_SUCCESS, k)), goodName) },
        failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: -3, credibilityDelta: -5, inventoryLost: true, message: fill(pick(kp(CLEAN_CLOSE_FAIL, k)), goodName) } },
      { id: 'negotiate', text: 'Push for a better price.', odds: 0.55,
        successEffects: { cashDelta: Math.floor(totalValue * 0.2), heatDelta: 10, reputationDelta: 4, credibilityDelta: 8, inventoryLost: true, message: fill(pick(kp(CLEAN_NEGOTIATE_SUCCESS, k)), goodName) },
        failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: -2, credibilityDelta: -5, inventoryLost: false, message: fill(pick(kp(CLEAN_NEGOTIATE_FAIL, k)), goodName) } },
    ],
  };
}

function generateKingpinMugging(player: PlayerState, k: KingpinProfile, goodName: string, totalValue: number): ChoiceEvent {
  return {
    id: nextKingpinId(),
    title: 'Something Feels Wrong',
    context: fill(pick(kp(MUGGING_SETUPS, k)), goodName),
    choices: [
      { id: 'stare_down', text: 'Stare him down. You don\'t scare me.', odds: 0.65,
        successEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 5, credibilityDelta: 10, inventoryLost: true, message: fill(pick(kp(MUGGING_STARE_SUCCESS, k)), goodName) },
        failEffects: { cashDelta: 0, heatDelta: 25, reputationDelta: -5, credibilityDelta: -10, inventoryLost: true, message: fill(pick(kp(MUGGING_STARE_FAIL, k)), goodName) } },
      { id: 'fight', text: 'Fight back. No one takes from you.', odds: 0.50,
        successEffects: { cashDelta: 2000, heatDelta: 25, reputationDelta: 10, credibilityDelta: 15, inventoryLost: true, message: fill(pick(kp(MUGGING_FIGHT_SUCCESS, k)), goodName) },
        failEffects: { cashDelta: -2000, heatDelta: 30, reputationDelta: -8, credibilityDelta: -15, inventoryLost: true, message: fill(pick(kp(MUGGING_FIGHT_FAIL, k)), goodName) } },
      { id: 'run', text: 'Run. Live to deal another day.', odds: 0.80,
        successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: 3, inventoryLost: true, message: fill(pick(kp(MUGGING_RUN_SUCCESS, k)), goodName) },
        failEffects: { cashDelta: 0, heatDelta: 20, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: fill(pick(kp(MUGGING_RUN_FAIL, k)), goodName) } },
    ],
  };
}

function generateKingpinRaid(player: PlayerState, k: KingpinProfile, goodName: string, totalValue: number): ChoiceEvent {
  return {
    id: nextKingpinId(),
    title: 'THE RAID',
    context: fill(pick(kp(RAID_SETUPS, k)), goodName),
    choices: [
      { id: 'grab_run', text: 'Grab everything and run. Now.', odds: 0.45,
        successEffects: { cashDelta: Math.floor(totalValue * 0.5), heatDelta: 25, reputationDelta: 5, credibilityDelta: 10, inventoryLost: true, message: fill(pick(kp(RAID_GRAB_SUCCESS, k)), goodName) },
        failEffects: { cashDelta: -3000, heatDelta: 40, reputationDelta: -10, credibilityDelta: -15, inventoryLost: true, message: fill(pick(kp(RAID_GRAB_FAIL, k)), goodName) } },
      { id: 'slip_out', text: 'Slip out the back. Leave the cash.', odds: 0.65,
        successEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: fill(pick(kp(RAID_SLIP_SUCCESS, k)), goodName) },
        failEffects: { cashDelta: -1000, heatDelta: 30, reputationDelta: -5, credibilityDelta: -10, inventoryLost: true, message: fill(pick(kp(RAID_SLIP_FAIL, k)), goodName) } },
      { id: 'hide', text: 'Hide. Wait for the chaos to pass.', odds: 0.75,
        successEffects: { cashDelta: 0, heatDelta: 20, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: fill(pick(kp(RAID_HIDE_SUCCESS, k)), goodName) },
        failEffects: { cashDelta: 0, heatDelta: 35, reputationDelta: -5, credibilityDelta: -10, inventoryLost: true, message: fill(pick(kp(RAID_HIDE_FAIL, k)), goodName) } },
    ],
  };
}
