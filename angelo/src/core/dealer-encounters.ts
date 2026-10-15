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
  { countryId: 'colombia', dealerId: 'col_1', name: 'Tony Stillbourne', gender: 'male', description: 'washed-up failed British stage actor and part time chauffer for Sir Jimmy Saville. Rents a flat in Villa Del Prado. Fled London due to mounting debts, unpaid taxes, and several deeply embarrassing sexual abuse allegations involving minors. due to his short stature and scruffy appearance the locals have nick-named him \'Shetland Tony" Speaks with an absurdly over-pronounced theatrical English accent and insists on introducing himself as "Tony Stillborn of the West End". (Don\'t let him near your kids)', location: 'a flat outside Villa Del Prado', priceModifier: 1.15, riskBonus: -0.05, rapport: 0 },
  { countryId: 'colombia', dealerId: 'col_2', name: 'Pablo', gender: 'male', description: 'Started out selling fake lottery tickets, then discovered the white powder. Now the cartel owns half of Bogotá. Will shoot you in the face if you look at him wrong — police won\'t touch him. His henchmen will cut you from arsehole to breakfast time if you short change him by so much as a dime.', location: 'a back room behind a lottery ticket kiosk in the seediest part of Bogotá — a rusted fan, a crucifix, and a framed photo of a young Pablo in a fake gold chain', priceModifier: 1.25, riskBonus: 0.20, rapport: 0 },
  // Spain (MDMA, ecstasy)
  { countryId: 'colombia', dealerId: 'col_3', name: 'Howard', gender: 'male', description: 'Welsh ex-drug smuggler, nice guy. Oxford-educated physicist and philosopher who once controlled 10% of the world\'s hashish trade. Served seven years in Terre Haute for the DEA. Now lives quietly in Colombia — still connected, still charming, still believes cannabis should be legal. Won\'t double cross you. Doesn\'t need to.', location: 'a rented flat in a quiet Bogotá neighbourhood — papers stacked on every surface, a Buddha statue by the window, and a cannabis plant growing openly on the balcony', priceModifier: 1.15, riskBonus: 0.0, rapport: 0 },
  { countryId: 'spain', dealerId: 'esp_2', name: 'Barry', gender: 'male', description: 'Six foot tall in cheap blonde wigs, skin-tight dresses and enough fake tan to stain furniture. Built like a nightclub bouncer with massive arms, a deep smoker\'s voice and permanently smudged makeup melting off in the Spanish heat. Looks less like a glamorous woman and more like an angry divorced scaffolder who got lost on the way to Benidorm Pride. Originally from Portsmouth. Moved to Spain after several "misunderstandings" involving pub fights, unpaid debts and allegedly threatening a vape shop owner with a bar stool. Spends most nights chain-smoking outside tacky karaoke bars arguing with tourists, delivery drivers and anyone who accidentally says "mate." Desperate to be seen as classy and intimidating at the same time despite living above a collapsing kebab shop with three stolen French bulldogs.', location: 'a tapas bar in the Albaicín, Granada', priceModifier: 0.9, riskBonus: 0.02, rapport: 0 },
  { countryId: 'spain', dealerId: 'esp_3', name: 'Snake', gender: 'male', description: 'Always tanned, always loud. designer sunglasses and too much gold jewellery. Drives a Bentley and spends most nights in VIP sections shouting about "real men" and "weak society." Originally from Luton. Moved to Spain after making money through dodgy nightclub promotions, pyramid schemes and and attempts to avoid mounting allegations of human trafficking. Surrounded by little, mostly white henchmen he calls his "soldiers." Obsessed with status, money, women and looking powerful despite rarely doing his own dirty work.', location: 'a private booth at a beachfront club in Marbella — his soldiers watch the door', priceModifier: 0.85, riskBonus: 0.18, rapport: 0 },
  // Afghanistan (opioids, heroin)
  { countryId: 'afghanistan', dealerId: 'afg_1', name: 'Mohamed', gender: 'male', description: 'He once had the most respectful job in his village, an abortionist. Follows the Koran to the letter, honoring family ties, practicing relentless honesty and beating his wife (lightly). head of the local mosque where he preaches sermons of hatred towards the west.', location: 'his mosque in Kabul — prayer mats on the floor, a Kalashnikov on the wall, and a ledger of every man who owes him money', priceModifier: 0.8, riskBonus: 0.15, rapport: 0 },
  { countryId: 'afghanistan', dealerId: 'afg_2', name: 'Mohamed Durrani Allah', gender: 'male', description: 'Pakistani opium exporter. His family were Afghan aristocracy in the early 19th century — he still has high-level connections, or so he claims. Probably a rapist. Knows child sex traffickers. Deals a bit of opium on the side. Dangerous, angry, and increasingly irrelevant. Thinks he is high society but the connections are running dry.', location: 'a crumbling colonial-era villa in Kabul — faded silk curtains, empty liquor cabinets, and framed portraits of ancestors who once ruled provinces', priceModifier: 1.15, riskBonus: 0.20, rapport: 0 },
];

// ============================================================
// KINGPIN POOL — London buyers to sell product to
// ============================================================

export const KINGPIN_POOL: KingpinProfile[] = [
  {
    id: 'fletcher',
    name: 'Fletcher',
    description: `Bermondsey. Old-school. Started with armed robbery in the 70s, graduated to cocaine and heroin through the 80s, and never looked back. Runs everything out of a boxing gym where the floor's sticky with blood and the air smells of liniment and violence. Doesn't use phones. Doesn't do email. You find him when he wants to be found. Fourteen convictions — never spent a night inside. The coppers know him, the judges know him, but nobody can make it stick. And anyone who's ever tried to grass him up has had a very unfortunate accident involving a very heavy bag.`,
    location: `a back-alley boxing gym in Bermondsey — muffled thuds, sweat-soaked canvas, and a smell that doesn't wash out`,
    minStashValue: 5000,
    sellPriceMod: 1.3,
    encounterWeights: { clean: 75, raid: 25 },
    buys: ['cocaine', 'heroin'],
  },
  {
    id: 'sergio',
    name: 'Sergio',
    description: 'Albanian. North London. Runs the Barking car wash like a business — because it is one. Quiet, precise, pays well. Cross him and you\'ll find out why his cousins never smile.',
    location: 'a car wash in Barking that never seems to actually wash cars',
    minStashValue: 1500,
    sellPriceMod: 1.15,
    encounterWeights: { clean: 80, raid: 20 },
    buys: ['heroin', 'meth'],
  },
  {
    id: 'iqbal',
    name: 'Quentin',
    description: 'Gay as a rainbow. Lives in a grubby flat above a Dalston launderette. Thinks he\'s Russell Brand but looks like Keith Chegwin. Snorts gear constantly, calls you "chocolate boy." Don\'t let him touch you — he WILL try.',
    location: 'his grubby flat above a launderette in Dalston — mirrors everywhere, silk kimono collection, and a chaise longue covered in dry jizz',
    minStashValue: 750,
    sellPriceMod: 0.9,
    encounterWeights: { clean: 90, raid: 10 },
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
          cashDelta: -600, cashPct: 0.20,
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
          cashDelta: -400, cashPct: 0.15,
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

  // Cash flavor — dealer comments on how much you're carrying
  let cashFlavor = '';
  if (player.cash > 15000) {
    cashFlavor = ['\n\nYour contact eyes the fat wallet in your pocket. "That\'s a lot of cash to be carrying, friend. Hope you\'re insured."', '\n\nThey nod at your coat. "You\'re walking heavy today. Around here, that gets you followed."', '\n\nThe dealer glances at your lumpy pocket. "You really should leave that in a hotel safe, mate. You\'re making me nervous just looking at you."'][Math.floor(Math.random() * 3)];
  } else if (player.cash > 10000) {
    cashFlavor = ['\n\nYour contact notices the bulge in your pocket. "Carrying a bit extra today? Bold."', '\n\n"You\'re carrying heavy," they say. "Be careful who sees that roll."', '\n\nThey glance at your jacket. "That\'s a lot of walking-around money, friend. Stay alert."'][Math.floor(Math.random() * 3)];
  }

  if (encounterType === 'clean') {
    return generateCleanSell(player, tier, context + cashFlavor);
  } else if (encounterType === 'raid') {
    return generateRaidSell(player, tier, context + cashFlavor, goodName);
  } else if (encounterType === 'gunfight') {
    return generateGunfightSell(player, tier, context + cashFlavor, goodName);
  } else {
    return generateHenchmenSell(player, tier, context + cashFlavor, goodName);
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
          inventoryLost: false,
          message: 'The deal goes sour at the last second. The buyer backs out and walks. No payment, no sale — but you still have the product.',
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
          message: 'He laughs. "You\'re funny." The better price is dead, and so is today\'s deal. Try again when he\'s less annoyed.',
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
          cashDelta: -500, cashPct: 0.20, heatDelta: 35, reputationDelta: -5, credibilityDelta: -10,
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
          cashDelta: -2000, cashPct: 0.25, heatDelta: 45, reputationDelta: -10, credibilityDelta: -15,
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
          cashDelta: -1000, cashPct: 0.20, heatDelta: 25, reputationDelta: -5, credibilityDelta: -8,
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
          cashDelta: -3000, cashPct: 0.30, heatDelta: 40, reputationDelta: -8, credibilityDelta: -15,
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
          cashDelta: -1500, cashPct: 0.25, heatDelta: 30, reputationDelta: -5, credibilityDelta: -10,
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
          cashDelta: -1000, cashPct: 0.20, heatDelta: 25, reputationDelta: -3, credibilityDelta: -5,
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
          cashDelta: -2500, cashPct: 0.25, heatDelta: 25, reputationDelta: -8, credibilityDelta: -12,
          inventoryLost: true,
          message: `They don't back down. They take the $%GOOD% and the cash. You're thrown out into the street, bruised and empty-handed. ${summary}`,
        },
      },
      {
        id: 'buy_off',
        text: 'Offer them a cut. Buy your way out.',
        odds: 0.55 + player.credibility * 0.002,
        successEffects: {
          cashDelta: -800, cashPct: 0.15, heatDelta: 5, reputationDelta: 1, credibilityDelta: 3,
          inventoryLost: false,
          message: 'You peel off a stack of bills. "Drinks on me." They laugh, take the money, and step aside. The deal continues. You\'re lighter, but you\'re still in the game.',
        },
        failEffects: {
          cashDelta: -800, cashPct: 0.15, heatDelta: 15, reputationDelta: -3, credibilityDelta: -8,
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
          cashDelta: -1000, cashPct: 0.15, heatDelta: 15, reputationDelta: -5, credibilityDelta: -10,
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
    dealerIds: ['col_1','col_3','afg_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pr = p(dealer);
      return {
      id: nextId(),
      title: 'The Back Alley Meeting',
      context: `Your contact leads Angelo through narrow alleys and hanging laundry. ${pr.He} stops in a dim courtyard. "Cash first," ${pr.he} says, hand out. The shadows seem to move behind ${pr.him}.`,
      choices: [
        { id: 'pay_up', text: 'Hand over the cash. Get the goods and go.', odds: 0.55 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 1, credibilityDelta: 5, inventoryLost: false, message: `${pr.He} counts the money, nods once. "Good lad, Angelo." and hands over the package. Clean deal. You're out before anyone notices.` }, failEffects: { cashDelta: -500, cashPct: 0.20, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `${pr.He} counts the money, then stops. "Numbers changed, Angelo. Supplier wants more than this." The meeting collapses into argument. You lose the holding money, but the deal is simply dead.` } },
        { id: 'stand_firm', text: 'Show the cash but demand to see the product first.', odds: 0.35 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 8, inventoryLost: false, message: `${pr.He} studies you for a long moment, then laughs. "Paranoid. I like that." ${pr.He} opens the bag. Pure quality. The deal proceeds on your terms.` }, failEffects: { cashDelta: 0, heatDelta: 20, reputationDelta: 0, credibilityDelta: -15, inventoryLost: false, message: `${pr.He} whistles. "Amateur hour, Angelo." The bag closes, the price goes up, and the room goes cold. No deal today. Come back with trust or more cash.` } },
        { id: 'walk', text: 'This feels wrong. Back away slowly.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'You back out slowly, hands visible. Nobody follows. Smart call.' }, failEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  {
    tier: 1,
    dealerIds: ['net_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Cafe Handoff',
      context: `Your contact gestures Angelo to a corner table, nursing a drink. ${p(dealer).He} slides a newspaper across. "It's inside," ${p(dealer).he} mutters. "Price went up ${Math.round(pct * 100)}%. Supply chain issues."`,
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). You're already here.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `${p(dealer).He} folds the paper. "Smart man." The deal is done. You overpaid — but you have the product.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `${p(dealer).He} counts again and grimaces. "Supplier moved it twice. I can't honour this." The extra cash is treated as a wasted reservation fee. No product changes hands.` } },
        { id: 'negotiate', text: 'Push back. We agreed on a price.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `${p(dealer).He} studies Angelo, then laughs — a short, surprised bark. "Alright. You've got stones." ${p(dealer).He} honours the original price. Respect earned.` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `${p(dealer).He} shrugs and closes the paper. "No deal, then." ${p(dealer).He} leaves you sitting alone at the table.` } },
        { id: 'walk', text: 'Stand up and leave. Not today.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'You walk. No deal, but no blood either.' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  {
    tier: 1,
    dealerIds: ['esp_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Cafe Handoff',
      context: `Barry's wedged into a vinyl booth, chain-smoking, nursing something pink in a martini glass. The makeup's melting. His wig's slightly crooked. He stubs out a cigarette and slides a plastic bag across the sticky tabletop. "Listen, darling — price went up ${Math.round(pct * 100)}%. Don't blame me, blame Brexit or some shit. You want it or not? I've got a karaoke night to get to."`,
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). You're already here.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `${p(dealer).He} folds the paper. "Smart man." The deal is done. You overpaid — but you have the product.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `${p(dealer).He} counts again and grimaces. "Supplier moved it twice. I can't honour this." The extra cash is treated as a wasted reservation fee. No product changes hands.` } },
        { id: 'negotiate', text: 'Push back. We agreed on a price.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `${p(dealer).He} studies Angelo, then laughs — a short, surprised bark. "Alright. You've got stones." ${p(dealer).He} honours the original price. Respect earned.` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `${p(dealer).He} shrugs and closes the paper. "No deal, then." ${p(dealer).He} leaves you sitting alone at the table.` } },
        { id: 'walk', text: 'Stand up and leave. Not today.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'You walk. No deal, but no blood either.' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  {
    tier: 1,
    dealerIds: ['esp_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Cafe Handoff',
      context: `Snake waves you over from a corner booth, two gold chains swinging. He doesn't do quiet handoffs. "Price went up ${Math.round(pct * 100)}%, mate. Supply chain my arse — I just wanted more money. You got a problem with that?" He grins. "'Course you don't." He slides the package across like he's doing you a favour.`,
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). You're already here.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `${p(dealer).He} folds the paper. "Smart man." The deal is done. You overpaid — but you have the product.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `${p(dealer).He} counts again and grimaces. "Supplier moved it twice. I can't honour this." The extra cash is treated as a wasted reservation fee. No product changes hands.` } },
        { id: 'negotiate', text: 'Push back. We agreed on a price.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `${p(dealer).He} studies Angelo, then laughs — a short, surprised bark. "Alright. You've got stones." ${p(dealer).He} honours the original price. Respect earned.` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `${p(dealer).He} shrugs and closes the paper. "No deal, then." ${p(dealer).He} leaves you sitting alone at the table.` } },
        { id: 'walk', text: 'Stand up and leave. Not today.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'You walk. No deal, but no blood either.' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  {
    tier: 1,
    dealerIds: ['col_1','col_3','afg_2'],
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
    dealerIds: ['net_1','esp_2','esp_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Private Bar Meeting',
      context: `Angelo meets his contact in a dimly lit bar. ${p(dealer).He} slides a sample across the worn wooden table. "Top shelf. Fresh from the lab. My guy wants to move double the usual volume. You interested?"`,
      choices: [
        { id: 'take_double', text: 'Take double volume. Big risk, big reward.', odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: 'The quality is exceptional — pure and clean. You flip it fast. Double the profit, double the reputation.' }, failEffects: { cashDelta: -2000, cashPct: 0.25, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: 'It\'s a setup. Police swarm the bar from the back entrance. You escape through the kitchen but the cash and product stay behind.' } },
        { id: 'stick_standard', text: 'Stick to the original amount. Test the quality first.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `${p(dealer).He} nods. "Smart. We'll talk about volume next time." The standard deal goes smoothly.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: 'The sample was good, but the main batch does not match it. Angelo refuses the downgrade. No deal today, but no product changes hands.' } },
        { id: 'decline', text: 'Decline. Your gut says no.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Angelo thanks him and leaves. Two days later, you hear that bar was raided by federal police. Trust your gut.' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  {
    tier: 2,
    dealerIds: ['col_1','col_3','afg_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Police Sting',
      context: `You arrive at the meeting point. A van is parked where your contact should be. Through the tinted window, you catch a glimpse — a man adjusting a wire under his shirt. Your stomach drops.`,
      choices: [
        { id: 'walk_past', text: 'Walk past casually. Don\'t stop. Don\'t look back.', odds: 0.60 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: 'You walk past with your phone to your ear, just another businessman. They don\'t follow. Your contact calls later: "They picked up my signal. You saved us both."' }, failEffects: { cashDelta: 0, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: 'They spot your hesitation. Two plainclothes agents break cover. Angelo runs. drops the product on the way, you spastic on the way. It\'s tagged as evidence.' } },
        { id: 'call_off', text: 'Call your contact. Warn him. Abort everything.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: 'The phone rings once. He answers. "I know," he says. "Get out of there. Now." The deal is off — but you\'re clean.' }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'No answer. You leave a message and disappear into the crowd. Alive and free.' } },
        { id: 'ignore', text: 'Proceed anyway. The product is worth the risk.', odds: 0.20, successEffects: { cashDelta: 5000, heatDelta: 20, reputationDelta: 10, credibilityDelta: 15, inventoryLost: false, message: 'The man with the wire walks straight past you and arrests a completely different dealer two doors down. Wrong place, wrong time — for HIM. You and your contact stand there frozen like two spastics watching a car crash. When the dust settles, you\'re both still standing. The deal goes through. Sometimes it\'s better to be lucky than good.' }, failEffects: { cashDelta: -5000, cashPct: 0.30, heatDelta: 40, reputationDelta: 0, credibilityDelta: -20, inventoryLost: true, message: 'It IS a sting. Federal agents pour out of the van. You lose everything — cash, product, freedom for about six terrifying hours. You barely walk away.' } },
      ],
    }),
  },
  {
    tier: 2,
    dealerIds: ['afg_2','net_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Bonus Offer',
      context: `Your contact seems unusually happy to see Angelo. "Got some good news for you," ${p(dealer).he} grins. "Supplier overproduced. I can give you an extra fifty percent at half price. Take it now, or it goes to someone else tonight."`,
      choices: [
        { id: 'take_bonus', text: 'Take the bonus. Extra product, half price.', odds: 0.55 + player.credibility * 0.003, successEffects: { cashDelta: -300, heatDelta: 10, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: 'The bonus product is pristine. You sell it for significantly more than expected. Sometimes the gamble pays.' }, failEffects: { cashDelta: -300, heatDelta: 15, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: 'The "bonus" product fails the quick test. Baking soda, mostly. You walk rather than take garbage, losing only the reservation money and some patience.' } },
        { id: 'refuse_bonus', text: 'Stick with the original deal. No surprises.', odds: 0.85, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `${p(dealer).He} shrugs. "Your loss, my friend." The original deal goes through cleanly. Slow and steady.` }, failEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `${p(dealer).He} looks disappointed but proceeds. The deal is fine.` } },
      ],
    }),
  },
  // === TIER 3: High credibility (60-100) ===
  {
    tier: 3,
    dealerIds: ['net_1','esp_2','esp_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Five-Star Proposition',
      context: `Your contact has clearly upgraded since he last saw Angelo. ${p(dealer).He} meets you in a penthouse suite — floor-to-ceiling windows, city lights below. A man in a tailored suit pours two glasses of whiskey. "We have a situation," he says. "A shipment worth fifty thousand needs to disappear — quietly. You\'re the one who can make that happen. Twenty percent is yours."`,
      choices: [
        { id: 'take_job', text: 'Accept. This is the big leagues.', odds: 0.40 + player.credibility * 0.005, successEffects: { cashDelta: 10000, heatDelta: 15, reputationDelta: 10, credibilityDelta: 20, inventoryLost: false, message: 'The operation runs like a Swiss watch. You earn every dollar — and a reputation that opens new doors.' }, failEffects: { cashDelta: -5000, cashPct: 0.30, heatDelta: 30, reputationDelta: 0, credibilityDelta: -15, inventoryLost: true, message: 'Set up. You walk into an ambush — three men waiting in the dark. You lose the cash and the product. You\'re lucky to walk out at all.' } },
        { id: 'negotiate_cut', text: 'Counter at thirty percent. Your risk, your price.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 15000, heatDelta: 15, reputationDelta: 12, credibilityDelta: 25, inventoryLost: false, message: 'He smiles — a slow, genuine smile. "Bold. I respect that. Thirty percent it is." Your most profitable run yet.' }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: 'He laughs. "You\'ve got balls, I\'ll give you that. But the offer is off the table." You leave with nothing. Some doors close.' } },
        { id: 'decline_offer', text: 'Politely decline. You don\'t know him well enough.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: 'He nods slowly. "Discretion. A dying art." He hands you a card. "When you\'re ready." The offer stays on the table.' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  {
    tier: 3,
    dealerIds: ['col_1','col_3','afg_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Cartel Invitation',
      context: `A black SUV with tinted windows pulls up beside you. The rear window rolls down — smooth, electric. The face inside is calm, unreadable. "Get in," he says. "The organisation has been watching Angelo. They want to make you an offer you cannot refuse."`,
      choices: [
        { id: 'get_in', text: 'Get in the SUV. This is how empires are built.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 25000, heatDelta: 20, reputationDelta: 15, credibilityDelta: 30, inventoryLost: false, message: 'The cartel offers you a direct pipeline — no middlemen, no markup, priority supply. Your earnings triple. Your name starts appearing in rooms you\'ve never entered.' }, failEffects: { cashDelta: -10000, cashPct: 0.35, heatDelta: 35, reputationDelta: 0, credibilityDelta: -20, inventoryLost: true, message: 'It\'s a shakedown. They take your cash as a "security deposit" and dump you on the outskirts of town with a warning. You were too eager.' } },
        { id: 'negotiate', text: 'Stay on the street. Talk through the window.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 10000, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: 'They respect the caution. "A man who doesn\'t rush — rare." A smaller deal is offered. Good money, less exposure.' }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -8, inventoryLost: false, message: 'The window rolls up. "You waste our time." The SUV drives off. The opportunity evaporates. No one chases you; no deal is punishment enough.' } },
        { id: 'refuse', text: 'Refuse. You don\'t answer to cartels.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: 'The window rolls up without a word. The SUV glides away. You feel their eyes on you for days — but you\'re still standing. Still independent.' }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  {
    tier: 3,
    dealerIds: ['col_1','col_3','esp_2','esp_3','net_1'],
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
  // === TIER 1 — Howard (col_3) ===
  {
    tier: 1,
    dealerIds: ['col_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Flat Meeting',
      context: [
        `Howard greets you at the door with a cup of tea. "Come in, Angelo. Sorry about the mess — the neighbours have been asking questions again and my old contacts are feeling the squeeze. Price is up ${Math.round(pct * 100)}% — same old story, different decade."`,
        `Papers everywhere. Howard's making tea. "Police have been sniffing around the usual ports. Price climbs ${Math.round(pct * 100)}%. Blame the DEA — they're still bitter about losing me the first time."`,
        `He gestures at the balcony. "The neighbours think I'm keeping to myself. Which is true, mostly. But the real business doesn't stop. ${Math.round(pct * 100)}% increase. Don't blame me — blame the Colombian authorities for being nosy."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). Howard's never led you wrong.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Howard nods, handing you a cup. "Good man. You know the drill — pay a bit more, stay a lot freer. My philosophy from Oxford: never overpay for the product, never underpay for the peace of mind." The deal is done. You overpaid — but Howard's product quality makes up for it.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Howard counts the extra and sighs. "Still short of what my man wants now. Sorry, Angelo — better to cancel than force a bad deal." He keeps the reservation money, promises first call next time, and sends you away without product.` } },
        { id: 'negotiate', text: 'Push back. Howard\'s a reasonable man.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `Howard studies you for a long moment — then that warm Welsh grin. "You know, the last person who negotiated with me was a Pakistani hashish supplier in 1978. He got a discount. So do you. Original price. Respect, Angelo."` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `He shakes his head, not offended. "Can't do it. Price is the price. Seven years in Terre Haute taught me one thing: a fair price keeps you free. I like being free."` } },
        { id: 'walk', text: 'Stand up and leave. The vibe feels off.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Howard doesn't try to stop you. "Good instinct. Trust it. I once walked out of a deal in Bangkok — two hours later the hotel was raided. Gut feeling is just your brain doing maths you don't know about."` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  // === TIER 2 — Howard (col_3) ===
  {
    tier: 2,
    dealerIds: ['col_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Old Network',
      context: [
        `Howard flips through an old contact list. "I've still got contacts from the old days. One of my Pakistani suppliers — his son runs the operation now. Wants to move double the usual. You interested, or shall I tell him to find someone else?"`,
        `He puts down his newspaper. "Old mate from the Brotherhood of Eternal Love got in touch. They've got a shipment that needs moving — double volume. Big upside, but it comes with attention. Your call."`,
        `"The Yakuza connection," he says casually. "Yes, I just said that sentence. They owe me a favour from the 80s. Double the product, half the usual risk. But if it goes wrong, it goes very wrong. Up to you, Angelo."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_double', text: 'Take double volume. Big risk, big reward.', odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: `Howard lights up. "There it is! That's the attitude that built empires. The Pakistanis came through — premium grade. You'll flip this in a day." Double profit. Double reputation.` }, failEffects: { cashDelta: -2000, cashPct: 0.25, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The tip-off came from inside. Customs were waiting. Howard takes the heat — "I've been arrested in twelve countries, Angelo. One more is a new stamp for my collection" — but the product's gone. You hear him on the phone, speaking Welsh. It doesn't sound polite.` } },
        { id: 'stick_standard', text: 'Stick to the original amount. Howard respects caution.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `Howard nods. "Smart. The best smugglers are the ones who know when not to smuggle. I learned that one the hard way — Terre Haute, 1990." The standard deal goes through without a hitch.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: `Howard weighs the standard batch and frowns. "That's not my usual. Supplier shorted it." He refuses to pass it on. No deal, no product, and an apology over cooling tea.` } },
        { id: 'decline', text: 'Decline. Too many red flags tonight.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Howard closes the folder. "Wise move." Two days later you hear the shipment was intercepted at the port. Howard knew. He was testing you. The test was: are you smarter than your ambition?` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  // === TIER 3 — Howard (col_3) ===
  {
    tier: 3,
    dealerIds: ['col_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Big One',
      context: [
        `Howard's flat is unusually tidy. "I've been asked to oversee a fifty-grand run. False manifests, paper trails that lead nowhere — my speciality. Twenty percent for you. You'll learn more from this than I did in three years at university."`,
        `He leans in. "Seventies playbook, Angelo. Before computers, before databases. Just paper, stamps, and charm. I've got a contact at the port — he knows me under a different name. Fifty grand. Twenty percent. Feeling lucky?"`,
        `"The Colombians want to move a shipment the old way — my way. No phones, no emails, just meetings, handshakes, and paperwork that dissolves in water. I need someone who can follow instructions and doesn't panic. That you?"`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_job', text: 'Accept. This is the big leagues.', odds: 0.40 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Howard's eyes light up. "Beautiful! This is how it used to work, Angelo. Before the digital trail, before tracking numbers. Paper and charm — that's all you need." He pulls out a folder — names, dates, manifests. The operation runs like clockwork. You earn every dollar.` }, failEffects: { cashDelta: -3000, cashPct: 0.25, heatDelta: 30, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The manifest had a typo. One digit off — a wrong address instead of a Colombian one. It was enough. Howard tries to warn you — "Scatter! SCATTER!" — but it's too late. The cash and product stay behind. Howard disappears into the flat as the mess starts.` } },
        { id: 'negotiate_cut', text: 'Counter at thirty percent. Your risk, your price.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Howard pauses. Then that slow smile. "Thirty percent. You know what? Fair. My old philosophy tutor used to say: never accept the first offer. That and scepticism. Deal." The most profitable run you've ever done.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `"I can't, Angelo. Twenty percent is what it is. This isn't a negotiation — it's a test. And you just failed." He doesn't seem angry. Just... disappointed. You leave with nothing.` } },
        { id: 'decline_offer', text: 'Politely decline. You don\'t know this contact well enough.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Howard nods. "Wise. Very wise." He walks you to the door. "When you're ready — you know where to find me. I'll be here. Probably on the balcony."` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  // === TIER 1 — Mohamed (afg_1) ===
  {
    tier: 1,
    dealerIds: ['afg_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Mosque Meeting',
      context: [
        `Mohamed doesn't look up. "Late again, Western cunt. Price up ${Math.round(pct * 100)}%. Blame your sanctions and your bombs."`,
        `Copper bowl, cold stare. "My people built empires while yours chased mud. ${Math.round(pct * 100)}% increase. Pay and shut up."`,
        `Mohamed dries his hands slowly. "You arrive late and still want mercy? Price rose ${Math.round(pct * 100)}%. You pay the difference, infidel."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). Don't argue with the abortionist.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Mohamed counts the cash — twice. "Submission is wisdom. The Koran teaches this. Your people will learn it too, one day. At the end of a sword." He hands over the product. "The transaction is blessed. Now fuck off." You're out before the Kalashnikov gets involved.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Mohamed counts the extra, then closes his fist around it. "Still not enough respect." The product stays on his side of the room. Your money bought only another lecture and an invitation to return with the full price.` } },
        { id: 'negotiate', text: 'Push back. You came a long way for this.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `Mohamed studies you like you're something he found on his shoe. "I removed foetuses for twenty years, cunt. Dead babies, every day. You think your English words will move ME?" He pauses — the faintest crack in the stone. "Alright. Original price. Because Allah respects persistence — even from infidels. But push me again and I'll show you what the inside of a woman looks like. On YOU."` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `Mohamed doesn't flinch. "You insult my mosque. You insult my family. You insult Islam itself — standing there in your Western clothes with your Western arrogance." He gestures at the Kalashnikov. "Leave. Now. Or I swear on the Prophet's name, I will make an example of you that will be taught in this mosque for a hundred years."` } },
        { id: 'walk', text: 'Back out. Gut says run.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Mohamed watches you stand. "Wise. Even a pig knows when the butcher is coming." He waves at the door. "Go. Before I ask Allah for guidance — and He tells me to keep you." Their eyes follow you until the gate closes. You hear him behind you: "The West WILL fall. It is written. And you, little cunt — you will fall with it."` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  // === TIER 1 — Mohamed (afg_1) ===
  {
    tier: 1,
    dealerIds: ['afg_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Village Collection',
      context: [
        `Four armed sons, one bad mood. Mohamed smiles thinly. "Price changed. Allah provides to me first tonight, cunt."`,
        `Mohamed switches from Pashto to English just for you. "My sons don't need your language. They speak blood. Pay the new number."`,
        `Guns on belts, dust in the yard. "English infidel," Mohamed says, "the deal price moved. Complain and you leave lighter."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'pay_up', text: 'Pay what he asks. Four guns, one you.', odds: 0.55 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 2, inventoryLost: false, message: `Mohamed counts the cash, then spits in the dust. "Fair price. Fair deal. The Prophet watched this transaction." He gestures — a son throws you the package. Says something in Pashto. They laugh. Mohamed translates: "He says you smell like a pig. I agree." You take the product and leave. Quickly.` }, failEffects: { cashDelta: -500, cashPct: 0.20, heatDelta: 20, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `Mohamed takes the money, nods at his sons. You're on the ground, boot on your throat. "The product stays. The money stays. Consider it reparations for twenty years of Western bombs, fucker." You're dragged to the main road. Left in the dust. "Tell London. Tell them Mohamed el Mohamed sends his regards. And his boot."` } },
        { id: 'stand_ground', text: 'Refuse. A deal\'s a deal.', odds: 0.25 + player.notoriety * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 10, inventoryLost: false, message: `Mohamed pauses. Studies you. Then — a bark of laughter. "The Englishman has stones! I did not expect this from a people who drink warm beer and apologise to furniture." He waves his sons back. "The agreed price. Respect." Hands you the package himself. "Brave or stupid. Allah has not told me which. Yet."` }, failEffects: { cashDelta: 0, heatDelta: 30, reputationDelta: 0, credibilityDelta: -20, inventoryLost: true, message: `Mohamed sighs. Almost disappointed. "The West. Always stubborn. Always wrong." He says something in Pashto. Before you can move, a son has your arms. Another empties your pockets. "I am a man of God. But my sons are young. They need practice on Western flesh." They leave you in the road. Product gone. Cash gone. One of them spits on your shoe.` } },
        { id: 'run_back', text: 'Four armed men. Time to fucking move.', odds: 0.60, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `You bolt. Mohamed shouts in Pashto — fury, not pursuit. "RUN! Run like your army ran from Afghanistan, cunt! Next time I'll put a bullet in your spine myself!" No deal. No blood. The sound of laughter echoes down the mountain road.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Your foot catches a stone. Before you can rise, two sons are above you. Mohamed calls them off — but not quickly. "Pathetic. Look at the mighty Westerner. Crawling in the dust like the dog he is." He takes your cash. Your product. "For the mosque. Allah appreciates your donation, nonce."` } },
      ],
    }),
  },
  // === TIER 2 — Mohamed (afg_1) ===
  {
    tier: 2,
    dealerIds: ['afg_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Ledger of Debts',
      context: [
        `Mohamed taps a leather ledger. "Names, debts, graves. Today I write yours." He slides a package across the floor. "But I also write opportunity. Supplier overproduced — extra product, half price. Take it and we both profit. Refuse... and your name goes in red."`,
        `Cross-legged and smiling like a snake, Mohamed opens the book. "Every infidel I buried is in here." He places a second bag beside the first. "Tonight you get a choice: walk with the usual, or take double at half price. Decide what color your page gets, cunt."`,
        `He turns a page with priest-like calm. "You owe me now." He gestures to an extra bundle. "My stock is overflowing and your Western greed is my profit. Take the bonus or leave — the ledger judges either way, infidel."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_bonus', text: 'Take the extra product. Mohamed\'s ink can wait.', odds: 0.55 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Mohamed writes in black. Slowly. Deliberately. "You now have a credit line. Dangerous — but valuable. Like a snake you keep in your pocket." The product is pure. Triple profit. His name opens doors in places Westerners don't go. But every deal you do now — he knows. He's watching. The ledger grows.` }, failEffects: { cashDelta: -2000, cashPct: 0.25, heatDelta: 20, reputationDelta: 0, credibilityDelta: -8, inventoryLost: true, message: `The bonus product is real. But so is the entry in red. "A favour owed. I collect favours, cunt. Like your empire collected colonies — with patience. And violence. And time." For weeks you feel eyes on you. Pashto voices in your sleep. One day the favour comes due. You pray it's money he wants.` } },
        { id: 'refuse_bonus', text: 'Stick to the deal. Generosity from this man terrifies you.', odds: 0.85, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Mohamed closes the ledger — but not before writing. "Cautious. I respect caution. Like a rat respects the shadow of a hawk." The deal goes clean. "I'll check on you. From time to time. To see if the West has made you soft. Softer." He gestures at the door. The Kalashnikov rattles its goodbye.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Mohamed shrugs. "Your loss." He writes anyway. You glimpse it — a number. Not your name. "Go. But know this: the mosque has a long memory. Longer than your country's. Longer than your Queen. And Allah does not forget. Neither do I."` } },
      ],
    }),
  },
  // === TIER 3 — Mohamed (afg_1) ===
  {
    tier: 3,
    dealerIds: ['afg_1'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Sermon of Hatred',
      context: [
        `Sermon ends the second he spots you. Mohamed gestures you inside, Kalashnikov in hand. "Tonight we discuss loyalty, not prices."`,
        `Prayer hall goes quiet. Mohamed appears with the rifle. "You're either inside my network or in its way. Decide."`,
        `His voice is fire through the wall, then silence. "Back room, now," he says, weapon visible and patience gone.`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'get_in', text: 'Accept. The mosque protects its own.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 12, inventoryLost: false, message: `Mohamed writes your name. In Arabic. In the ledger. "You are now connected. The mosque protects what it owns. And it owns you now, cunt." Direct pipeline. No middlemen. Triple earnings. Muslim contacts across five countries reach out within hours. The mosque is a network. And you're in it. For better. Or much, much worse.` }, failEffects: { cashDelta: -3000, cashPct: 0.30, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `It's a shakedown. They take everything — "security deposit" he calls it, smiling. His sons dump you at the edge of Kabul. "The mosque does not forget. It does not forgive. And it does not return deposits, fucker." You walk. Barefoot. Broke. The sermon continues behind you. Something about vengeance. Something about fire.` } },
        { id: 'negotiate', text: 'Talk through the doorway. Don\'t step fully in.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 6, inventoryLost: false, message: `Mohamed approves — grudgingly. "A man who doesn't rush. Rare among your people. Usually you Westerners charge in, guns blazing, then wonder why everyone hates you." A smaller deal. Good margin. Less exposure. He writes a partial entry. "Room to grow. Room to prove yourself. Don't disappoint me, cunt. I've killed men for less."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `The door closes. Hard. "You waste the mosque's time. Time is the one thing Allah does not refund." The sermon resumes behind you. The insult of your hesitation will linger. Contacts go cold. Suppliers ghost you. You're marked — not dangerous enough to kill, not useful enough to keep.` } },
        { id: 'refuse', text: 'Refuse. You don\'t answer to mosques. Or cartels. Or men who preach genocide.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `The door closes without a sound. Through the wall, the sermon continues: "...and the disbelievers will be cast into the fire, and the fire will not be quenched..." You walk. Independent. Alive. But a message reaches you three days later: "Six months. Then it becomes a debt. And I always collect." The Kalashnikov is in your dreams now.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  // === TIER 1 — Micky (net_3) ===
  {
    tier: 1,
    dealerIds: ['net_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Surinamese Connection',
      context: [
        `Reggae thumps upstairs. Micky grins. "Door shut, muggy little cunt. Supply's tight, price up ${Math.round(pct * 100)}%. Don't cry about Brexit again."`,
        `Micky flicks ash into a mug. "Surinamese skunk, top shelf. ${Math.round(pct * 100)}% increase 'cause supply's being a prick."`,
        `"Angelo, sit down and stop gawping," Micky says. "Stock's squeezed, so it's ${Math.round(pct * 100)}% more. Pay or jog on."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). Micky's product is worth it.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Micky grins. "That's what I like. No drama. Just business." Tosses you the bag. "Done. Now piss off before my phone rings — got three more people waiting. Looks like a fucking youth club in here."` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Micky takes the extra, checks his phone, and grimaces. "Supplier's moved it again. I'm not eating that difference." The bag stays under the table. Your reservation money is gone, but the deal simply dies.` } },
        { id: 'negotiate', text: 'Push back. A deal\'s a deal, Micky.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `Micky stares — then cracks up. "You know what? I respect that, you mouthy little cunt. Most people come in, see me, just agree to whatever I say." Picks up the bag. "Original price. Because you've got balls. Small ones. But balls nonetheless."` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `Micky's laugh dies. "Nah. You're taking the piss now." Stands up. All of him. "Price went up. Means price went up. Don't like it? Door's there, poofter." Sits back down. Turns up the football. Discount dead.` } },
        { id: 'walk', text: 'Something\'s off. Walk.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Micky shrugs. "Fair enough. Can't blame a man for trusting his gut." Waves at the door. "Come back when you've got the nerve. Or don't. Plenty more mugs in Amsterdam." As you leave — police van. Two streets away. Unmarked. Micky was right. So were you.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  // === TIER 1 — Micky (net_3) ===
  {
    tier: 1,
    dealerIds: ['net_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The East London Welcome',
      context: [
        `Two giants flank Micky. "Del and Tiny," he says. "Tiny's the small one, obviously. Sit down and don't act like a nonce."`,
        `Micky nods toward two heavy lads. "They wanted to size up the Englishman. Behave, and we all leave smiling."`,
        `"Relax," Micky says, as Del and Tiny stare holes through you. "This is just introductions, not your funeral. Yet."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'stay_calm', text: 'Stay calm. Don\'t show fear.', odds: 0.55 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 1, credibilityDelta: 5, inventoryLost: false, message: `Micky nods. "Told you, Del. Solid. East London boys — don't scare easy." Tiny cracks a smile. Tension breaks. Micky slides the product over. "Standard price. For being cool. Most people piss themselves when they meet Tiny."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `You flinch. Tiny sees it. "He's scared, Mick." Micky sighs. "For fuck's sake, Angelo. I vouched for you." He slides the product back. "Come back when you've grown a pair." No deal today.` } },
        { id: 'stand_up', text: 'Stand up. Meet them eye to eye.', odds: 0.25 + player.notoriety * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 10, inventoryLost: false, message: `You stand. Micky's eyebrows go up. Del shifts. Even Tiny grins. "Alright," Micky says, quieter. "Didn't expect that, you mad little prick." Slides product over. "Tiny — give him the good bag." Tiny produces a better package. "That's for people I actually like. Don't make me regret it."` }, failEffects: { cashDelta: 0, heatDelta: 20, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `Tiny stands too. And keeps standing — until he's looking down at you. "Sit," Micky says. Tiny sits. Micky leans forward. "Never stand up in a room you don't own. Lesson one." The product goes away. "Deal's off. Come back next week."` } },
        { id: 'talk_yourself_out', text: 'Crack a joke. Defuse it.', odds: 0.60, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 3, inventoryLost: false, message: `"So which one's the muscle and which one's the brains?" Silence. Then Micky erupts. "This cunt! Told you, Del — mouth on him!" Del cracks up. Tiny's mouth twitches. Deal goes through. Micky's still chuckling. "Come back soon, Angelo. You're entertainment, you mouthy prick."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Joke lands wrong. Very wrong. Micky holds up a hand before anyone escalates. "Bad timing, mate." He looks disappointed. "Deal's off. Out. Now." You're ushered out. Quick, but intact.` } },
      ],
    }),
  },
  // === TIER 2 — Micky (net_3) ===
  {
    tier: 2,
    dealerIds: ['net_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The London Calling',
      context: [
        `No football tonight, just Hennessy and business. "Sixty-grand shipment from my Canning Town contact. Quiet Amsterdam move. Twenty percent. You in?"`,
        `Micky slides you a glass. "Big London stock needs Dutch routing. Serious money, serious heat. If it burns, we both burn."`,
        `The flat is too tidy, which means trouble. "One old contact, one huge shipment, one risky run. Twenty percent and no mistakes."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_job', text: 'Big risk, big reward. In.', odds: 0.40 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 12, inventoryLost: false, message: `Micky clinks your glass. "My man. Knew you had it, you greedy little cunt." Pulls out a burner phone. "Do what I say, when I say it. No questions." Operation runs smooth. Sixty grand vanishes through the port. Micky hands you your cut in a Tesco carrier bag. "Don't spend it all at once. And don't tell Tiny. Tiny gets jealous."` }, failEffects: { cashDelta: -3000, cashPct: 0.25, heatDelta: 30, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The contact was a setup. Dutch police watching Micky for months. Three unmarked cars light up. "POLICE! HANDEN OP JE HOOFD!" Micky in your ear: "RUN, ANGELO! FUCKING RUN!" You don't make it. Six hours in a Dutch cell. Micky gets away. You get the blame. "You're too fucking slow, you useless cunt," his voice echoes in your head.` } },
        { id: 'negotiate_cut', text: 'Counter at thirty percent. Your neck, your price.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Micky swills his Hennessy. "Thirty percent." Pause. "Done. Because I need someone I can trust — and trust costs money, innit." Raises his glass. "To Canning Town. And getting the fuck out of Canning Town." Best run ever. Micky gives you a burner. "Keep this. Next time I call — you answer. Three in the morning, doesn't matter. You answer, poofter."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Micky shakes his head. "Can't do it, mate. Twenty's the number. My contact's firm — and he's not the kind of bloke you negotiate with. He's the kind who makes you disappear and tells your mum you moved to Spain." Pours himself another. "Offer's off. Next time, maybe. If you're still breathing."` } },
        { id: 'decline_offer', text: 'Too many unknowns. Decline.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Micky nods slowly. "Fair play. Can't blame you — I was like you once. Cautious. Smart." Finishes his drink. "Problem is, being smart and cautious got me stabbed outside a bookies in Stratford. So — up to you, muggy little cunt." Pockets the Hennessy. "Door's there. I'll call you for the next one."` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  // === TIER 2 — Micky (net_3) ===
  {
    tier: 2,
    dealerIds: ['net_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Dutch Muscle',
      context: [
        `Micky ends a tense call and lays a machete on the table. "Supplier's trying to cut me out. Deliver to his rival and I drop your prices ten percent. Permanent."`,
        `"Dutch supplier thinks I'm bluffing," Micky says, blade in hand. "Run one package to his competitor and we reset the market."`,
        `Kitchen meeting, hard face. "Need leverage tonight. You make one hostile delivery, I make your life cheaper forever."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_job', text: 'Make the delivery. Micky\'s machete is very present.', odds: 0.50 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 8, inventoryLost: false, message: `The delivery goes smooth. Competitor's happy. Micky's Surinamese guy suddenly finds his manners. "Funny how competition works, innit." Micky grins. "Ten percent off. Permanently. You've earned it." He puts the machete away. Doesn't need it today. But it's there. Always there.` }, failEffects: { cashDelta: -2000, cashPct: 0.20, heatDelta: 20, reputationDelta: 0, credibilityDelta: -8, inventoryLost: true, message: `The competitor takes the delivery — then the cash. Then calls Micky's Surinamese guy. Now they're BOTH pissed at Micky. And you're in the middle. Micky's quiet when you get back. "Cheers for that, Angelo. Really helped. Now I've got two suppliers who want to kill me. And you." The machete stays on the table. Just in case.` } },
        { id: 'refuse', text: 'Refuse. This is Micky\'s war, not yours.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 2, inventoryLost: false, message: `Micky stares at you. Then laughs — short, hard. "Smart. Very smart. Never get involved in other people's beef. Lesson number two." He puts the machete away. "Deal still on. Same price. But you owe me one now, poofter. And I don't forget." The deal goes through. The shadow of that favour follows you out the door.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: `Micky's disappointed. "You're supposed to be my man. My London connection. And you're backing out of a bit of legwork?" He shakes his head. "Deal's still on. Same price. But we're not mates anymore. And round here, not being mates with Micky is a very bad thing." Deal proceeds. Coldly.` } },
      ],
    }),
  },
  // === TIER 1 — Pablo (col_2) ===
  {
    tier: 1,
    dealerIds: ['col_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Lottery King',
      context: [
        `Pablo taps a framed photo of younger him. "From fake tickets to real empire. Price up ${Math.round(pct * 100)}%. You want pure, you pay Pablo."`,
        `Scratch cards, crucifix, and Pablo grinning. "Best coke in Bogotá costs more tonight: ${Math.round(pct * 100)}%. Buy street chalk if you're broke."`,
        `Pablo leans back behind the desk. "My product got pricier, not weaker. ${Math.round(pct * 100)}% increase. Decide quickly, amigo."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). Don't argue with a man who has a framed photo of himself.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Pablo counts the cash twice — once with his eyes, once with his fingers. "Smart man, Angelo. Men who pay and don't complain — they live long." He pushes the product across the desk. "The next one will be cheaper. If you survive that long, you cheeky little cunt."` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Pablo counts the extra, scratches a lottery ticket, and loses. "Bad omen." He pushes the product back into the drawer. "Price moved again. Reservation fee stays. Come back with a better number."` } },
        { id: 'negotiate', text: 'Push back. You came a long way. So did the cash.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `Pablo stares. The fan spins. The crucifix glints. Then — a laugh. Low. Genuine. "I like you, Angelo. You've got balls." He scratches a lottery ticket. Wins nothing. "Original price. Because I respect men who push back. But next time — I'll double it if you try again, you British cunt."` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `Pablo's smile vanishes. "You think this is a negotiation? This is Colombia, you stupid fucker. Not your little island with your little rules." He stands. "Get out. The price just tripled for next time — if there is a next time."` } },
        { id: 'walk', text: 'Stand up. The framed photo is giving you the creeps.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Pablo doesn't look up. "Your choice, Angelo." He scratches another ticket. "You know how many men have walked out of this room? Hundreds. You know how many came back? All of them." He loses again. "Everyone comes back to Pablo eventually, cunt." The fan keeps spinning.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  // === TIER 2 — Pablo (col_2) ===
  {
    tier: 2,
    dealerIds: ['col_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Arsehole Tax',
      context: [
        `Pablo sets a machete on the desk. "Double load, sixty percent upside. Short me one dollar and we discuss anatomy the hard way."`,
        `"Too much stock, not enough buyers," Pablo says, twirling the blade. "Take double and profit big, or stay small and boring."`,
        `The machete never leaves his hand. "I need volume moved now. Double package, better margin, zero forgiveness if you fuck me."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_double', text: 'Take double. The machete is just for decoration. Probably.', odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: `Pablo smiles. The machete stays on the desk. "Good choice, Angelo. You're going far — if you don't get greedy." The product is pure. The profit is massive. Pablo wraps the machete back on the wall. "For next time. When you're ready for triple." He doesn't look at you when he says it. You're not sure if that's threatening or not. It's definitely threatening.` }, failEffects: { cashDelta: -2000, cashPct: 0.25, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The deal is a setup. Two Colombian police in plainclothes burst in — but they're not police. They're Pablo's men wearing fake badges. "Testing you, Angelo." Pablo shakes his head. "You failed. My men say you flinched. I don't do business with men who flinch." The product goes back in the safe. Your cash goes in his pocket. "Come back when you've grown a pair. The machete will be waiting, you spastic."` } },
        { id: 'stick_standard', text: 'Stick to the original amount. The machete is very convincing.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `Pablo shrugs. "Smart. The machete works better than words, eh?" He puts it back on the wall. "Standard deal. Same price. You survive. Maybe next time you try the machete deal." He scratches a lottery ticket. Wins five dollars. Smiles. "Today is a good day, Angelo. Don't ruin it."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: `Pablo weighs the standard package, smiles, and calls it "supply chain problems." It's light. Angelo refuses the short count. Pablo shrugs. "Then come back when full weight exists." No deal.` } },
      ],
    }),
  },
  // === TIER 3 — Pablo (col_2) ===
  {
    tier: 3,
    dealerIds: ['col_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Medellín Pipeline',
      context: [
        `Air-con hums where the old fan used to rattle. "Medellín direct line. Fifty grand movement, no middlemen, twenty percent for you. Betray us and you vanish."`,
        `Pablo points at a photo with men you don't ask about. "You've been noticed. One pipeline from Medellín to London. Big money, permanent consequences."`,
        `"Street days are done," Pablo says. "This is organisation business now: direct supply, hard deadlines, zero mercy for mistakes."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'get_in', text: 'Accept. This is what you came to Colombia for.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 12, inventoryLost: false, message: `Pablo opens a drawer. Inside: a burner phone, a shipping manifest, and a wad of cash. "Welcome to the organisation, Angelo. You work for me now. But in six months — you work for yourself. That's how it works." The pipeline is smooth. The product is pristine. Your earnings triple overnight. Pablo sends you a new photo — this time of both of you, arms around each other. "Remember where you started, you lucky little cunt."` }, failEffects: { cashDelta: -3000, cashPct: 0.30, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `The shipment is intercepted at the port. Pablo's phone rings — he listens, face darkening. "The police. Someone talked." He looks at you. "Was it you, Angelo?" His hand drifts to the drawer — the one with the gun. "It doesn't matter. The organisation needs a lesson. And you — you're going to be the lesson." His men grab you. They take the cash. The product. Your dignity. You wake up in an alley. Alive. That's the warning. Next time, you won't wake up, you Bastard.` } },
        { id: 'negotiate', text: 'Twenty percent is good. But thirty percent is better.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Pablo stares at you. The air conditioning hums. Then — a slow, wide smile. "You know who the last man was who negotiated with the organisation?" He waits. "He's dead, Angelo. BUT..." He holds up a finger. "He's dead because he stole. Not because he asked. I like your stones. Twenty-five percent. Final. Don't push again, you cheeky British cunt."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Pablo's smile disappears. The temperature in the room drops. "You're lucky I like you, Angelo. The organisation does not negotiate." He closes the drawer. "The offer is withdrawn. You had your chance. Next time — maybe. If you survive that long." The deal evaporates. The pipeline closes. You walk out with nothing but the memory of the air conditioning.` } },
        { id: 'refuse', text: 'Refuse. The organisation sounds like a lot of paperwork.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Pablo shrugs. "Your choice. The organisation doesn't chase. We wait." He scratches a lottery ticket. Loses. "Everyone comes back eventually, Angelo." He doesn't look at you. "When you're ready — you know where to find me. The machete will be waiting. But so will the deal." You walk out. The air conditioning follows you into the Bogotá heat.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  {
    tier: 3,
    dealerIds: ['net_3'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Big Shipment',
      context: [
        `Micky cracks his knuckles. "Large shipment coming in from Morocco next week. Biggest I've ever done. I need a runner on the London end who won't bottle it. That's you — if you're not a cunt about it."`,
        `Micky puts his feet up. "I could move this gear through ten other mugs. But they're all useless. You? You've got bottle. Question is — have you got enough? One wrong move and I'll be visiting you in hospital."`,
        `Micky opens a duffel bag — sample product. "This is what serious money looks like, Angelo. I'm offering you first dibs on the London distribution. But if you fuck me over, I'll find you. And I'll enjoy finding you."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'get_in', text: 'Accept. In for the big score.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Micky slaps the table. "YES! Knew it! Knew you weren't completely fucking useless!" He leans in, voice dropping. "Right. Here's how it works — my people move the product, you move the cash. Simple. Clean. You try anything clever and I'll personally put you in the ground next to my last runner. He tried to stiff me. He's now a canal feature." He pours two glasses. "Welcome aboard, you mad cunt."` }, failEffects: { cashDelta: 0, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: false, message: `Micky's face hardens. He makes a phone call, listens, hangs up. "They don't trust you, Angelo. And neither do I." He stands — quicker than you expected. "I vouched for you. Made you sound like a proper villain. And you showed up looking like a lost tourist." The offer is dead. Come back when you've got something to prove.` } },
        { id: 'negotiate', text: 'Negotiate. Better terms.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Micky listens to your counter, then laughs. "Fuck me, you've got balls. Alright. Ten percent more your way. But if you're even a minute late on the first drop, I'm sending the boys round to break your knees. Both of them. Then I'll break them again for good measure." He grins. "We clear, you cheeky cunt?"` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Micky shakes his head slowly. "Nah. Not happening. You don't negotiate your way into my operation — you earn it. That's how it works. Try again next month and maybe — MAYBE — we talk terms. Push it again and I'll have my boys rearrange your face." He turns back to the football. Conversation over.` } },
        { id: 'refuse', text: 'Refuse. Too many unknowns.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Micky stares at you. Long and hard. Then he shrugs. "Your funeral. Opportunity like this doesn't come round twice, Angelo. But I'm not a mug — I won't beg." He pours himself a drink. "When you change your mind — and you will — you know where I am. Door's still open. But my patience? That's got a fuckin' limit."` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  // === TIER 1 — Mohamed Durrani Allah (afg_2) ===
  {
    tier: 1,
    dealerIds: ['afg_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      return {
      id: nextId(),
      title: 'The Fallen Durrani',
      context: [
        `Dusty portraits watch as Durrani pours weak tea. "Price rose ${Math.round(pct * 100)}%. My Pakistani contacts are beasts, not negotiators. Pay and live."`,
        `Cracked silver set, faded silk, aristocrat's sneer. "${Math.round(pct * 100)}% increase. The men behind my supply chain are not patient men."`,
        `Durrani gestures at the ruined villa. "Empires fall, prices rise. Tonight it's ${Math.round(pct * 100)}% more. Do not test me, Angelo."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). The portraits are watching.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Mohamed Durrani Allah bows his head — the barest incline. "Wise. My father always said: 'Pay the opium exporter, argue with the viceroy.' You have the instincts of a Durrani, Angelo. High praise." He pushes the product across the cracked table. "One day you will sit in a room like this, surrounded by portraits of yourself. And you will remember who gave you your start. A man who outlasted empires."` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Mohamed Durrani Allah counts it, sniffs, counts it again. "Still short for my Pakistani contact." The product returns to the cabinet. Your extra payment becomes the cost of wasting an aristocrat's evening.` } },
        { id: 'negotiate', text: 'Push back. Your money spends the same as a Durrani\'s.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `A long silence. One of the portraits seems to shift. Then — a laugh, rusty from disuse. "You cheeky cunt. I like it." He scratches his signet ring. "Original price. Because you remind me of my younger brother — before the Taliban shot him. He talked back too. Right up until the end." He slides the product over. "Don't end like my brother, Angelo."` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `Mohamed Durrani Allah stands slowly. The chair scrapes. "You come into my home — the home of a man whose ancestors ruled while yours foraged for roots — and you insult me?" His voice drops. "My contacts in Peshawar run girls through the border. They owe me. One phone call and you are a product, Angelo. Not a customer. Leave. Now. Before I make that call, you insolent cunt."` } },
        { id: 'walk', text: 'Stand up. This room smells like decay.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Mohamed Durrani Allah doesn't move. He stares at a portrait on the wall — a man on a horse, sword raised. "My great-great-grandfather. He beheaded a British officer for entering his tent without permission. Different times." He turns to you. "I would do the same. But I need the money. So go. Tell your children you sat in the presence of Afghan royalty. They won't believe you."` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
      };
    },
  },
  // === TIER 2 — Mohamed Durrani Allah (afg_2) ===
  {
    tier: 2,
    dealerIds: ['afg_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Silk Road Remnants',
      context: [
        `Durrani is drunk and honest. "Pakistani route came through. Double volume available. Ugly partners, pretty profits. You taking it?"`,
        `One full glass for him, a thimble for you. "Khyber line delivered extra stock. Double load tonight if you've got spine."`,
        `Liquor cabinet empty, opportunity full. "My contact can feed us double this round. You want money or safety, Angelo?"`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_double', text: "Take double. You're not here to judge his friends.", odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: `Mohamed Durrani Allah refills his glass. "Excellent. The Durrani bloodline extends another day." He produces a second bottle — this one sealed. "Real Scotch. Gift from a diplomat who owed me. We can be civilized, Angelo. When the situation calls for it." The product is pure. The profit is enormous. He raises his glass: "To the aristocracy. Dead, but not forgotten."` }, failEffects: { cashDelta: -2000, cashPct: 0.25, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The Pakistani contact was compromised. Taliban checkpoints on the road. The shipment is seized. Mohamed Durrani Allah's phone rings — he listens, face pale. "They took everything. My product. My money. My dignity." He looks at you — and for a moment, the aristocrat is gone. Just a frightened old man. "You should leave, Angelo. Before they come for me. And whoever is with me." You leave. Fast. You hear shouts behind you in Pashto.` } },
        { id: 'stick_standard', text: 'Stick to the original amount. Traffickers make you nervous.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `Mohamed Durrani Allah shrugs. "Prudent. My father always said: 'Better one province ruled well than three provinces ruled badly.'" He pauses. "He said that before the communists shot him, of course. But the principle stands." The standard deal goes through. He doesn't offer you the second bottle.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: `The product tests badly before money changes hands. Mohamed Durrani Allah goes pale with aristocratic fury. "That Pakistani bastard." He cancels the handoff rather than sell garbage under his name.` } },
      ],
    }),
  },
  // === TIER 3 — Mohamed Durrani Allah (afg_2) ===
  {
    tier: 3,
    dealerIds: ['afg_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => ({
      id: nextId(),
      title: 'The Last Favour',
      context: [
        `One portrait is gone from the wall. "Sold it," Durrani says. "Now I need a fifty-grand opium run through Taliban roads. Thirty percent, total deniability."`,
        `Tea instead of whiskey, empty space where ancestry hung. "Big border move, dangerous route, thirty percent cut. If captured, I never knew you."`,
        `Durrani speaks quietly. "My name no longer opens checkpoints. Yours might pass unnoticed. Move this shipment and get paid like nobility."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'get_in', text: 'Accept. The missing portrait haunts you less than poverty.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Mohamed Durrani Allah closes his eyes — relief or prayer, you can't tell. "The Durrani name still means something. I knew it would." He hands you a map, a phone number, and a wad of cash for bribes. "The Taliban commander on this route — he owes my family. From before the war. Before everything." The shipment moves clean. Thirty percent is ten times what you've ever made. When you return, the portrait is back on the wall. "My son shipped it from Dubai. The Durranis endure, Angelo. We always endure."` }, failEffects: { cashDelta: -3000, cashPct: 0.30, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `The Taliban commander does not remember the favour. Or chooses not to. The checkpoint is a death trap. You escape with your life — barely — but the product stays in the back of a truck that drives away toward a compound you will never find. Mohamed Durrani Allah's phone is dead when you call. The villa is locked. The portrait is still missing. You have been disavowed. Exactly as promised.` } },
        { id: 'negotiate', text: 'Thirty is good. Forty is what desperate men pay.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `He stares at you. The empty wall where the portrait hung seems to grow larger. Then — a slow, bitter laugh. "You see weakness and you press. I would have done the same at your age." He shrugs. "Thirty-five. Because I am not desperate enough to give you forty. But I am desperate enough to negotiate with a man who just watched me sell my ancestor's portrait, you cheeky cunt."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `He closes his eyes. "A Durrani does not negotiate from desperation. A Durrani finds another way." He opens them. "The offer is withdrawn. I will find someone else. Someone who does not smell the blood in the water." The missing portrait seems to mock you on the way out. "Come back when you have learned respect, Angelo. If there is still a door to come back through."` } },
        { id: 'refuse', text: 'Refuse. You don\'t do Taliban checkpoints for any price.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Mohamed Durrani Allah nods slowly. "I understand. I would refuse too, if I were you." He walks to the empty wall. "My father used to say: 'A wise man knows which wars to fight.' He fought the wrong one. So did I." He doesn't turn around. "Go, Angelo. But if you change your mind — the road through the Khyber will still be there. And so will the Durrani. Always."` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
      ],
    }),
  },
  // === TIER 1 — Lena (net_2) ===
  {
    tier: 1,
    dealerIds: ['net_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile, dealContext?: DealContext): ChoiceEvent => {
      const pct = 0.05 + Math.random() * 0.05;
      const increase = dealContext ? Math.floor(dealContext.totalCost * pct) : 300;
      const lVars = [
        `Red velvet walls, two bodyguards, and Lena swirling Stoli like she's in a film. "Price up ${Math.round(pct * 100)}%, darling. Pay or stop wasting my oxygen, you cheeky cunt."`,
        `Lena taps ash into a crystal tray. "Supply is tighter than your wallet tonight, Angelo. ${Math.round(pct * 100)}% extra. Smile nicely and maybe I don't make it worse."`,
        `"Moscow sneezed, Amsterdam pays." Lena smirks. "${Math.round(pct * 100)}% increase. You want product or you want a lecture, you little nonce?"`,
      ];
      return {
        id: nextId(),
        title: 'The Back Room Appointment',
        context: lVars[Math.floor(Math.random() * lVars.length)],
        choices: [
          { id: 'accept_hike', text: `Accept the new price (+$${increase}). Lena's product is worth it.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Lena smiles. "Good boy. Most men whine first." She slides the package across velvet and pats your cheek like you're a trained dog. Deal done.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `She counts the extra and smiles without warmth. "Still light, darling." The package disappears back under velvet. Your deposit stays with her. The deal does not.` } },
          { id: 'negotiate', text: 'Push back. The legs are nice but the price is not.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 10, inventoryLost: false, message: `Lena laughs, genuinely amused. "You said no to me? That's new." She honors the original price and leans in close. "Do not make me regret finding you interesting."` }, failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 0, credibilityDelta: -10, inventoryLost: false, message: `Her smile dies. "You confuse pretty with weak." She points at the door. "Get out before I let the boys practice on you, you spastic."` } },
          { id: 'walk', text: 'Something about this room feels wrong. Leave.', odds: 0.95, successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Lena blows a kiss as you leave. "Smart men live longer, darling." In the hallway you hear rapid Russian on a burner phone. Not brothel business.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
        ],
      };
    },
  },
  // === TIER 2 — Lena (net_2) ===
  {
    tier: 2,
    dealerIds: ['net_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => {
      const lVars = [
        `Lena pours two shots. "Competitor undercut me in De Wallen. Deliver this to his best clients and remind them who runs this city. Twenty percent bonus."`,
        `"A Georgian idiot thinks he can take my corners." Lena nudges a bag toward you. "One delivery. Public message. Twenty percent on top if you don't screw it up."`,
        `Her office door locks behind you. "Do this run for me and I pay twenty percent extra," Lena says. "Fail, and I remember forever."`,
      ];
      return {
        id: nextId(),
        title: 'The Brothel Proposal',
        context: lVars[Math.floor(Math.random() * lVars.length)],
        choices: [
          { id: 'take_job', text: 'Make the delivery. Twenty percent bonus is real money.', odds: 0.50 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 8, inventoryLost: false, message: `The clients switch on the spot. Lena calls an hour later, purring down the phone. "Very good, Angelo. You might be useful after all."` }, failEffects: { cashDelta: -2000, cashPct: 0.20, heatDelta: 20, reputationDelta: 0, credibilityDelta: -8, inventoryLost: true, message: `The brothers rob you and laugh in your face. Lena hears the report in silence, then says, "I do not keep men who fail twice." Bonus gone. So is her warmth.` } },
          { id: 'refuse', text: 'Refuse. This is Lena\'s war, not yours.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 2, inventoryLost: false, message: `Lena narrows her eyes, then nods. "Cautious. Annoying, but smart." Deal stands at normal terms. A favor debt quietly appears anyway.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: `"Disappointing," Lena says, already looking past you. "We still do business. But not as friends." The room gets colder by ten degrees.` } },
        ],
      };
    },
  },
  // === TIER 3 — Lena (net_2) ===
  {
    tier: 3,
    dealerIds: ['net_2'],
    generate: (player: PlayerState, country: Country, dealer: DealerProfile): ChoiceEvent => {
      const lVars = [
        `No vodka tonight. Just tea and a dossier. "Moscow wants an Amsterdam-London pipeline. Fifty grand flow, twenty percent for you. If this leaks, you disappear."`,
        `Lena slides over a burner phone. "This rings, you answer. Russian money, Dutch routes, London demand. Big rewards, bigger graves. In or out?"`,
        `"My people in Moscow need a Western face," Lena says flatly. "Take the route and make us rich. Or walk away and stay boring."`,
      ];
      return {
        id: nextId(),
        title: 'The Russian Connection',
        context: lVars[Math.floor(Math.random() * lVars.length)],
        choices: [
          { id: 'get_in', text: 'Accept. This is major-league money.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Pipeline opens clean. Your margins explode. Lena texts at 3am: "Welcome to family. Do not embarrass me." That's both a promise and a threat.` }, failEffects: { cashDelta: -3000, cashPct: 0.25, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `The meet gets burned by intelligence. You escape through a service stairwell with nothing but your passport and panic. Lena vanishes from every number you had.` } },
          { id: 'negotiate', text: 'Ask for a bigger cut.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Lena drums her nails, then nods once. "Twenty-two. Because I like your nerve." Smaller route, safer pace, still serious money.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Her expression hardens. "You push too far." Offer stays at twenty, and she makes sure you feel the demotion instantly.` } },
          { id: 'refuse', text: 'Refuse. FSB attention is not worth it.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Lena raises her glass. "Wise men choose their wars." Folder disappears into a locked drawer. Offer remains open, barely.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
        ],
      };
    },
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
  const event = template.generate(player, country, dealer, dealContext);
  // ENCOUNTER_CONTEXTS removed — not letting generic flavor text
  // override the template's actual scenario (was causing continuity errors)
  return event;
}

// ============================================================
// KINGPIN ENCOUNTER GENERATOR — 3 named kingpins
// ============================================================

const APPROACH_SETUPS: Record<string, string[]> = {
  fletcher: [
    `The gym smells of old sweat and bleach — a working smell, not a clean one. Through the frosted glass of the front door you see shapes moving — a heavy bag swinging, a lad skipping rope. Somewhere inside, a man shouts instructions in a voice that's been ruined by sixty years of cheap cigars and shouting over crowd noise. Fletcher's in there. You can feel it.`,
    `Bermondsey at dusk. The high street is quiet — chicken shop, bookies, a pub that hasn't been redecorated since 1987. The gym's down a side alley, between a bail bonds office and a boarded-up barber's. Light spills from the window — yellow, industrial. Through the glass you see a ring. Two lads sparring. An old man in a tracksuit watching with his arms crossed. That's him.`,
    `You find the gym by sound — the thud of leather on heavy bag, the squeak of trainers on worn floorboards, the grunt of a man working through pain. The door's propped open with a dumbbell. Inside, a young lad is doing pad work with a trainer. Fletcher sits on a stool in the corner, towel over one shoulder, watching everything. His eyes find you before you've taken two steps inside.`,
  ],
  fletcher_win: [
    `Fletcher spots you the moment you push through the door. "Look who it is — the man who put Danny on his arse." He gestures you in with a tilt of his head. "Grab a seat. He's still telling everyone about it." Around the gym, a few lads nod at you. Different to last time. Familiar.`,
    `Danny's in the ring, working the pads with a younger lad. He sees you and taps his glove on the ropes — a greeting. Fletcher looks up from wrapping his hands. "My best lad. And you dropped him." He shakes his head slowly. "Don't let it go to your head, but — not bad, Angelo. Not bad at all. Come on in."`,
    `The gym feels different this time. The lads recognise you. The heavy bag stops swinging as you walk past. Fletcher doesn't shout — he just tilts his head. "Back for more business, or are you after a rematch?" A dry laugh. "I'm joking. You're not that stupid. Grab a seat."`,
  ],
  fletcher_comp_loss: [
    `Fletcher looks up from the heavy bag as you walk in. "You again." He works a bit more on the bag — left-right-left — then lets it swing. "Still got a bump on your head from Danny?" He almost — almost — smiles. "He said it was a good fight. Reckons you gave him more trouble than he expected." He gestures you in. "Come on, then."`,
    `Danny touches his gloves together in your direction as you enter. Respect, of a sort. Fletcher follows your gaze. "He's been asking when you're coming back. Says you've got a chin on you." He grunts. "High praise from a man who spends his life hitting people."`,
    `The gym's in full swing — skipping ropes, pad work, the grunt of effort. Fletcher waves you over. "Danny's still talking about that spar. Says you've got good instincts." He pauses. "I say you got lucky. But lucky's better than nothing. Come on."`,
  ],
  fletcher_loss: [
    `Fletcher sees you at the door and pauses mid-punch. "Look who dragged himself back." He lets the bag swing and turns, raising his voice: "DANNY! YOUR PUNCHING BAG'S HERE!" A few lads laugh. You feel your ears go red. Fletcher gestures you in, flat. "Calm down, I'm only messing. Come on, let's get this over with."`,
    `Danny smirks as you walk past the ring. Fletcher catches it. "Don't mind him. He's just proud of that uppercut. Reckons it's the best he's thrown all month." He turns back to wrapping his hands. "He's probably right. But fair play for coming back. Most lads he drops don't show their face again."`,
    `"Back again?" Fletcher doesn't look up from the heavy bag. "Thought Danny might've put you off for good. Most lads he puts down — they find a different gym. Different city, even." He finally glances at you. "But you came back. I'll give you that much." He gestures half-heartedly. "Come on, then."`,
  ],
  sergio: [
    `The car wash in Barking is shut — roller door down, forecourt empty. But there's a light on in the back office. A silhouette moves behind the blinds. A dog barks somewhere inside.`,
    `Barking is grey, damp, and quiet. Sergio's place looks abandoned — faded signage, a tyre stack, a puddle of oil rainbowing on the concrete. The back door is ajar. Through the gap, you hear Albanian.`,
    `You pull up to the car wash. No cars. No staff. Just a white van with blacked-out windows parked around the side. Music thumps from somewhere inside — mournful Balkan pop.`,
  ],
  iqbal: [
    `Dalston high street is alive with chicken shops and pound stores. Quentin's flat above the launderette has its curtain twitching. Through the steamed-up window, a silhouette in a silk robe moves past.`,
    `The launderette smells of fabric softener and poverty. A buzzer by the side door — the label reads "Q. Iglesias (Artist)." From above, you hear laughter, then a sneeze, then more laughter.`,
    `You stand outside the Dalston flat, watching the launderette customers come and go. Quentin's window is open a crack — music drifts out. Something jazzy. Something inappropriate for this part of town.`,
  ],
};

// ── Dialogue pools keyed by kingpin ID ──────────────────────────

const CLEAN_SETUPS: Record<string, string[]> = {
  fletcher: [
    `Fletcher nods at the lockers. "Third one from the left. Combination's 19-74 — year I did my first stretch. Don't touch nothing else." You squeeze into the narrow space between the changing bench and the rusted lockers, cash and product in your lap. Through the slats you watch the gym continue — skipping ropes, pad work, the grunt of effort. No police. No trouble. After twenty minutes, Fletcher taps the locker twice. "Clear. Out you come, you nonce."`,
    `The storeroom. It's full of old boxing gloves stiff with dried sweat, piles of towels that haven't seen bleach since the 90s, and a mop bucket that's seen things. Fletcher shoves you in, pulls the string on the bare bulb. "Quiet. Not a word." You hear the front door open. Voices — not police, just gym lads. Fletcher handles them — "Get changed and warm up, I'll be with you in five." They never check the storeroom.`,
    `Under the ring. Fletcher lifts the canvas apron and gestures. "In. Quick." You slide underneath with the cash and product, crouching on the dusty boards, surrounded by the muffled thump of feet and the squeak of leather on canvas. Above you, two lads spar — you hear every grunt, every coach's instruction. Through a gap in the canvas you can see shoes. Police shoes. They circle the ring, ask a few questions, leave. Fletcher's voice: "Alright, break. Water break. Good work, lads." The canvas lifts. "They're gone. You can breathe now."`,
    `The changing room shower — the one that's been broken since Fletcher's father ran this place. "Get in. Pull the curtain." You stand in the mouldy shower stall, cash and product clutched to your chest, listening to the gym echo. A copper walks in to take a piss. You hold your breath. He flushes, washes his hands, and leaves. Fletcher's gruff laugh follows: "First time I hid in there was 1983. Still works, you nonce."`,
    `Behind the heavy bags. There's a gap between the bag rack and the wall — just wide enough for a man and a bag of product. "Squeeze in. Don't breathe." You press yourself against the cold brick, the heavy bag swaying inches from your face, the smell of leather and chalk in your nostrils. A raid sweeps through — officers shouting, lockers opening, gloves tossed aside. They don't find you. When it's over, Fletcher pulls the bag aside. "Told you. Best hiding spot in London. My father hid from the Krays here in '64." He grins — the first time you've seen teeth.`,
  ],
  fletcher_win: [
    `"Alright, follow me." He leads you past the ring. Danny's shadowboxing. "Danny — show him the respect he earned." Danny gives a short nod his way. "After you, boss." The locker room is clear. "Same combination. 19-74." He gestures you in. "Quick one today. I've got a lad who needs his arse kicked in the ring."`,
    `"Under the ring. You know the drill." He lifts the canvas. "You did proper good against Danny. Don't let the compliments make you sloppy." You slide under. The dust is the same. The smell of old canvas and sweat. The floorboards creak with footsteps above. Police pass through. They never check.`,
    `"Water station's in the changing room. Lads are distracted with pad work. You've got five minutes." He hands you a key. "And Angelo — keep your head down, but don't act scared. You've earned the right to be here. Act like it."`,
    `"My father's hiding spot — the corner behind the heavy bags. I've only ever shown it to men I trust." He looks at you — a long, appraising look. "After what you did to Danny, you're on that list." You squeeze behind the bags. The sweat and chalk smell fills your nose. A raid passes through the gym. They don't find you.`,
    `"Get in the van. Grey Transit, alley." He tosses you the keys. "Take the product. Take your time. Nobody's following — I checked." He taps the roof twice. "And Angelo — that was a good right hand. Where'd you learn that?" He doesn't wait for an answer. The Transit starts first time.`,
  ],
  fletcher_comp_loss: [
    `"Storeroom's clear. Get in." Fletcher's businesslike, but there's something different in his voice. Less of an edge. "You held your own against Danny. Plenty of lads can't say that." He gestures you into the cramped space. "Now let's see if you can sell as well as you can take a punch."`,
    `"Under the ring. Quick." He lifts the canvas. "You got lucky out there. But lucky's better than nothing." A pause. "Danny says your footwork's decent. He doesn't pay compliments lightly." You slide under. The muffled thud of feet above. Familiar now. Comfortable, almost.`,
    `"Changing room shower — the broken one. You remember it from last time." It's almost a joke. "Don't worry — the copper's already had his piss today. Saw him in the cafe." You stand in the mouldy stall, clutching the product. No coppers come. Clean exit.`,
    `"Equipment locker. Squeeze in." He shuts the door. Through the slats you see him turn back to the gym. Muttering to himself: "Remind me why I'm doing business with a man Danny couldn't put away." He's not angry. Just — bemused.`,
    `"Behind the heavy bags. The one on the end. You know the spot." He gestures. "Danny says you've got decent footwork. I told him decent's not good enough in my gym." He pauses. "But it's a start. Let's see the product."`,
  ],
  fletcher_loss: [
    `"Right. Storeroom. And try not to get caught this time — we've got an audience." He shoves the door open. "Danny wanted to watch the deal. Told him to fuck off." A pause. "He's still laughing. Pay him no mind." You squeeze into the cramped space. The locker door clicks shut behind you.`,
    `"Under the ring. Don't breathe so loud this time." He lifts the canvas. "Most blokes who take a shot from Danny don't come back. You did." He shakes his head. "Still deciding if that's stupid or brave." You slide onto the dusty boards. The footsteps above feel heavier today.`,
    `"Changing room. In the shower." He points. "Same one you stumbled into after Danny put you down. At least you know the route now." The curtain is still damp from last time. You stand in the mouldy stall, clutching the product, the echo of the gym muffled through the tiles.`,
    `"Behind the heavy bags — the one on the end. Watch your head." He mutters, half to himself: "Danny's still telling everyone he went easy on you. I told him to shut his mouth. He didn't listen." You squeeze behind the bags. Through the gap you see Fletcher walk away, shaking his head. You hear him chuckling.`,
    `"Equipment locker. Get in." He shuts it. The lock clicks. His voice through the metal: "One noise and we're both done. I've got a reputation to protect." A beat. "Unlike your chin." You hear his footsteps fade. He's definitely laughing.`,
  ],
  sergio: [
    `The car wash in Barking is closed — it's always closed. Angelo meets Sergio in the back office: a desk, two chairs, a CCTV monitor showing an empty forecourt. He doesn't sit. "You brought what you said?" He gestures at the %GOOD%. "Show me, Blacky."`,
    `Sergio is under a BMW on the hydraulic lift, wiping grease from his hands. "Five minutes," he says without looking at you. "I'm replacing a timing belt. You can wait." You wait. When he's done, he leads you to the office — locks the door behind you. "Now. Business."`,
    `The car wash has four other men in it — all Albanian, all watching you. Sergio is at the centre, arms crossed, eyeing Angelo. "My cousins," he says. "They don't speak much English. Don't worry — they're only here in case you try something stupid." He smiles. It doesn't reach his eyes. "The product. On the table, you Bastard."`,
    `Sergio's in a bad mood. You can tell because he's actually speaking — rapid Albanian into his phone, gesturing at the ceiling. He hangs up. Stares at you. "Someone I know is being stupid today. Let's hope you're not." He takes a breath. "You have the %GOOD%? Good. Put it on the table. Slowly."`,
    `You find Sergio in the back, counting stacks of cash with a machine. He doesn't acknowledge you until it finishes. The final tally: a number you don't catch. He feeds the stacks into a bag without looking at you. "That was last week." He finally turns. "Now show me what you've got. And don't waste my time, Blacky."`,
  ],
  iqbal: [`You meet Quentin in his flat above the launderette — mirrors on every wall, a chaise longue in the corner that's seen things, things no furniture should see. He's in a silk kimono, nostrils dusted white. "Oh, you came! I knew you would, chocolate boy." He claps his hands. "%GOOD% on the table. Slowly. I want to watch." He does another line while you comply.`],
};

const CLEAN_CLOSE_SUCCESS: Record<string, string[]> = {
  fletcher: [
    `Fletcher counts the cash with his thumb — old-school, no machine. He nods once. "Good. Clean. You know what you're doing." He tucks the money into his tracksuit pocket and gestures at the door. "Next time, bring more. The lads are hungry." The deal is done. You feel like you've passed a test.`,
    `He tests the product with a tiny pinch on his gum, waits, nods. "Decent. Not the best I've had, but decent." He peels off the cash from a roll thick enough to choke a horse. "Here. Don't spend it all on that chicken shop round the corner — their wings are shite anyway."`,
    `Fletcher leans against the ring apron, arms crossed. "You're alright, you are. For a —" he gestures vaguely at you — "whatever you are. Most people who walk in here can't look me in the eye. You did. Respect." He hands over the cash. A compliment from Fletcher feels heavier than most.`,
    `The deal goes quick. Fletcher doesn't waste movement — cash handed over, product inspected, deal done. "Same time next week?" It's not a question. You nod. He's already turning to shout at a lad on the heavy bag. "KEEP YOUR HANDS UP, DANNY! HANDS UP!" The deal is done. The gym continues.`,
    `Fletcher puts the kettle on — a chipped mug with "WORLD'S OKAYEST GANGSTER" written on it. "Tea?" You accept. He makes it strong, two sugars, no milk. "My father's recipe. Used to make it for the Krays." He sips. "They said it was shite. I think they were just being cunts." He hands you the cash with the tea. A strange moment of civility in a gym that's seen neither.`,
  ],
  fletcher_win: [
    `"Good product. Clean." He pockets it. "You know what you're doing — I'll give you that." He peels off the cash. "Same again next week. And Angelo — that was a hell of a right hand. Don't forget who taught you, though. And I don't mean me — I mean Danny." The corner of his mouth twitches.`,
    `"You're alright, you are." He counts the cash without looking at it. "Danny respects you. And Danny doesn't respect anyone he can knock down." He slides the money across the ring apron. "Which means you're not as soft as you look."`,
    `"Clean deal. Quick. Efficient." Fletcher nods. "You've got a future in this business — long as you keep your hands up in and out of the ring." He turns away. "Same time next week."`,
    `The kettle's on. "Tea?" He pours without waiting for an answer. "My father's recipe. Same as last time." He hands you the mug. "You're becoming a regular. Don't make me regret it." He sips. "The Krays still hate it. That's how I know it's good."`,
    `He counts the cash, thumb running down the edge of the notes. "Most people who walk into my gym — they're either coppers or idiots." He hands it over. "You're neither. That counts for something round here." A pause. "And you put Danny down. That counts for more."`,
  ],
  fletcher_comp_loss: [
    `"Decent product." He pockets it. "Payment's fair." He hands the cash over. "You did alright against Danny. Not great — but alright. He said you caught him clean with that body shot." Almost a compliment.`,
    `"Here." He slides the cash across the bench. "Next time bring better product." He almost smiles. "Or better footwork. I'm not picky." The cash is all there. Fair deal.`,
    `"Clean. Good." He stashes the product in his gym bag. "I've done business with worse people. And I've seen worse chins." He gestures at the door. "Same time next week. And Angelo — work on that left hook. It's telegraphed."`,
    `"Alright. Deal's done." He leans against the ring post. "You're not the worst I've dealt with. Credit where it's due — you came back after Danny." He doesn't say "after Danny put you down." That's the courtesy.`,
    `Cash counted. Product stashed. "Business is business," Fletcher says. "But you've got a bit of bottle. Hold onto that." He turns to the bag. The conversation's over.`,
  ],
  fletcher_loss: [
    `"Product's alright." He sniffs it, nods once. "You're still standing. That's about all I can say for you today." He counts the cash. "Danny wanted to watch the deal. Told him to stop being a prick and get back on the pads." A pause. "He's still smirking, the cunt."`,
    `"Here." He tosses the cash onto the bench. "Don't spend it all on ice packs." He's not smiling — but his eyes are. "Same again next time. But bring a better guard. You dropped your left three times in that spar. Three times."`,
    `"Clean enough." He pockets the product. "You know, most lads Danny flattens — they don't come back through that door. Ever." A pause. "You're either brave or thick. I haven't decided which yet. But you came back. I'll give you that."`,
    `"Tea?" He's already pouring. "My father's recipe. Krays hated it." He slides the mug across. "You'll need it. Danny's been talking about your chin all week. Says it's better than he thought it was." He sips. "Might be the nicest thing he's ever said about a man he put on the canvas."`,
    `Cash counted. Product inspected. "Same time next week." He turns to the heavy bag. "And Angelo — keep your left hand up. You drop it when you throw the right. Danny noticed. I noticed. Now you know." He throws a combination at the bag. Conversation over.`,
  ],
  sergio: [
    `Sergio tests the product Angelo brought — a tiny sample on the back of his hand, rubbed into the skin. He waits. Nods. "Good. You don't lie to me. Some people lie to me." He doesn't elaborate on what happens to those people. He counts the cash twice — once for him, once for you. The deal is done, Blacky.`,
    `"Shumë mirë." Very good. Sergio almost smiles. He counts the cash quickly — the machine whirring — and hands it over. "You are reliable. I don't forget reliable people." A pause. "I also don't forget unreliable people." He locks eyes with you. "So stay reliable, you Bastard."`,
    `Sergio's mood has improved. He offers you a coffee — thick, black, Albanian-style. "My grandmother's recipe." He watches you drink. "She would've liked you. She had a saying: once is business, twice is trust. Three times is family." He raises his cup. "We're at two, Blacky. Don't fuck up the third."`,
    `The deal is quick. Efficient. Sergio doesn't waste movement — cash counted, product bagged, handshake exchanged. His grip is firm but controlled. "Good. You conduct yourself properly. I notice these things." He's already turning away. "Next time, bring more. I have buyers."`,
    `"You see?" Sergio gestures at the CCTV monitor — the empty forecourt, the closed shutters. "Clean. Quiet. Nobody knows we're here. Nobody needs to know." He hands over the cash. "This is how business should be. Between people who understand each other, you little Bastard."`,
  ],
  iqbal: [`Quentin fans himself with the cash, sniffing between sentences. "Delicious. Absolutely delicious. You're very good at this, chocolate boy — very good." He leans in close, gear-fuelled breath on your neck. "We should do this again. Maybe somewhere with fewer mirrors. Or more mirrors. I haven't decided." He hands over a crumpled envelope. It smells of poppers and poor decisions.`],
};

const CLEAN_CLOSE_FAIL: Record<string, string[]> = {
  fletcher: [
    `Fletcher tests the product, weighs the silence, then shakes his head. "Not today, son. Quality's fine. Timing ain't." The cash stays in his pocket, the product stays with you, and the deal gets pushed to another day.`,
    `A lad from the gym interrupts with a whispered message. Fletcher listens, then closes the bag. "Market moved. I don't buy into a moving number." He points at the door. "Take it home. We'll talk when the price settles."`,
  ],
  sergio: [
    `Sergio's phone rings. He answers in Albanian — rapid, sharp. His expression darkens. He hangs up. "There is a problem. Someone I know." He pushes the product back across the desk. "We do this another day."`,
    `One of the cousins bursts in, speaking fast, pointing at the CCTV. Sergio's face goes hard. "Not now." He pushes the product back. "Service corridor, second left. Bring it again when I call."`,
  ],
  iqbal: [`Quentin's phone buzzes. He glances at it mid-snort and his whole face collapses. "Oh no. Oh no no no. That council man again." He's already grabbing his feather boa. "We'll have to reschedule, chocolate boy. Don't pout — it's unbecoming." The product stays with you. The chaise longue wobbles.`],
};

const CLEAN_NEGOTIATE_SUCCESS: Record<string, string[]> = {
  fletcher: [
    `Fletcher stares at you. The silence stretches — a full minute. Then a slow, dangerous grin. "You're negotiating with me. In my own gym. In front of my lads." He shakes his head. "You've got balls, I'll give you that." He peels off extra cash. "Ten percent. Because you've either got heart or a death wish, and I want to find out which."`,
    `He laughs — a single, sharp bark that echoes off the gym walls. A few lads look over. "This one's negotiating with me!" He shakes his head, still chuckling. "Fucking hell, Angelo. Alright. Extra ten percent. But if I hear you've been telling people I went easy on you, I'll put you in the ring with Danny and let him sort you out." He hands over the cash with a grin that's three parts threat, one part respect.`,
    `Fletcher doesn't say anything. He just looks at you for a long moment, then counts out the extra cash with deliberate slowness. "You know how many people have negotiated with me?" He hands it over. "None. You're the first. Don't make me regret it." He's not smiling. But he's not angry either. That's as close to a win as you're going to get.`,
    `"I respect nerve," Fletcher says, pulling a wad from his other pocket. "Always have. My father used to say: 'A man who doesn't ask doesn't get.'" He counts out the bonus. "Twenty percent. Because you asked nice. But next time — don't push it, son. I'm old, not soft." He hands it over. The word "son" from him feels like both an insult and an honour.`,
    `He considers your counter-offer. Rubs his jaw — a habit from fifty years of boxing. "Alright. Fifteen. And that's generous — I don't do generous." He peels the notes off the roll. "You remind me of myself at your age. Young. Stupid. Willing to ask for things that aren't yours." He hands over the cash. "Don't let it go to your head, you cheeky cunt."`,
  ],
  fletcher_win: [
    `"Negotiating with me again." A crooked grin. "You've got balls the size of fucking grapefruits, you know that?" He rubs his jaw. "But after what you did to Danny — alright. Twenty percent. Because you earned it. Not because you asked nicely."`,
    `He laughs — that sharp bark. "You're pushing your luck, Angelo. But I'll allow it." He peels off extra cash. "Ten percent. Because you've got nerve and you can actually fight. Don't get used to both."`,
    `"I respect nerve." He counts out the bonus. "Fifteen percent. For the man who put my best lad on the canvas." He hands it over. "Don't let it go to your head. Danny's already insufferable about the rematch he wants."`,
    `He considers it, rubbing his jaw. "Alright. Twenty. Because you asked. And because Danny still hasn't shut up about that overhand right." He hands over the cash. "Don't make this a habit."`,
    `"You know, nobody's negotiated with me since 1993." He peels the extra. "Twenty percent. For the man who walked into my gym, fought my best lad, and walked out with a win." He almost smiles. "You've earned the right to be annoying."`,
  ],
  fletcher_comp_loss: [
    `He squints at you. "You're pushing it. But you held your own against Danny better than most." He peels off extra cash. "Ten percent. Don't push again."`,
    `"Negotiate?" He chuckles dryly. "You got a competitive loss with my lad and now you want more money?" Shakes his head. "Alright. Ten percent. Because you didn't back down from him and you're not backing down now. I respect consistency."`,
    `"Nerve. You've got it." He counts extra. "Ten percent. Because you didn't back down from Danny and you're not backing down now." A pause. "But you're on thin ice. Both with me and with your chin."`,
    `"My father used to say: 'A man who asks gets.'" He peels notes off. "Ten. But that's it. Don't ask again. You tested Danny — don't test me."`,
    `He studies you. "You're not bad at this. Not good — but not bad." Bonus. "Ten percent. Because you held your own in there. That counts for something."`,
  ],
  fletcher_loss: [
    `He stares at you. A long, flat silence. "You got put on your arse by Danny. Clean. And now you're negotiating with me?" He holds your gaze. "Alright. Five percent. Because you've got hide, I'll give you that. But don't push it."`,
    `A low, humourless laugh. "You can't fight AND you can't negotiate." He pauses. "But you've got stones, I'll give you that." He peels off a small extra. "Five. And only because I'm in a surprising good mood."`,
    `"Tell you what." He leans in. "You survive another round with Danny without hitting the canvas — I'll give you fifteen percent." He leans back. "Till then? Take what you're given and be grateful."`,
    `He doesn't look up from the product. "You're fucking joking, right?" Silence. "Fine. Five percent. Because you came back after he put you down. That counts for something, even if your boxing doesn't."`,
    `"Negotiate." He says it flat. "After Danny dropped you in front of the whole gym. And now you want more money." A long pause. "Alright. Five percent. Because you're either brave or brain-damaged, and I want to see which one wins out."`,
  ],
  sergio: [
    `Sergio stares at you. The silence stretches. His cousins shift. Then he laughs — a single, sharp bark. He peels off the extra cash without counting. "You negotiate with me. Nobody negotiates with me." He slides it across. "Twenty percent. Because you're either brave or stupid, and I want to find out which."`,
    `"In my country, haggling is an insult." He pauses. "But you are not from my country. And you brought clean product." He counts out the bonus with precision. "Don't push your luck, Blacky. This is a courtesy, not a precedent." The cousins relax. You've passed some invisible test.`,
    `Sergio studies you like you're something he hasn't seen before. "Most people who walk in here — they agree to whatever I say. They're afraid." He nods slowly. "You're not afraid. That's either respect or stupidity." He counts out the bonus. "Extra ten percent. Because I respect someone who knows what they're worth."`,
    `"You want more money?" Sergio's voice is flat. He watches you for a long moment. Then he counts out the extra without a word. He slides it across. "You owe me, Blacky. Next time — you bring twice as much. That's not a request."`,
    `He counts out the extra cash with deliberate slowness — making you wait, making you wonder. "Twenty percent. Because you've earned it." He hands it over. "But earning it once doesn't mean you'll earn it again. Don't disappoint me, you little Bastard."`,
  ],
  iqbal: [`Quentin looks at you like you've just offered him a threesome with Russell Brand. "Oh. OH. You want MORE? Chocolate boy, I like you. I like you a lot." He runs a finger down your chest, leaves a tiny trail of coke residue on your shirt. "That's on me. Tell you what — bonus, because you've got lovely eyes. And because I want to see you without the shirt. Well, I'm SAYING it's because of the eyes." Extra ten percent. The finger stays on your chest longer than medically necessary.`],
};

const CLEAN_NEGOTIATE_FAIL: Record<string, string[]> = {
  fletcher: [
    `Fletcher doesn't even look at you. He turns to a lad on the heavy bag. "Danny. Fifty more. No breaks." Then back to you, flat: "You had your shot. Price is the price. Push again and the deal's off entirely." You leave with the product and no bonus.`,
    `He laughs — not the sharp bark from before, but a low, humourless chuckle. "You're pushing it, son." The original number stands, but not today. The gym feels ten degrees colder as you take the product back out.`,
  ],
  fletcher_loss: [
    `"I offered you five percent extra. You pushed for more." He pockets the bonus. "Now you get nothing. Standard price next time, if there is a next time." He turns back to the bag. Conversation over.`,
    `"You lost to Danny — and now you're pushing me?" He shakes his head slowly. "Original price next time." He gestures at the door. "I've had enough of your mouth for one day. Don't make it worse."`,
  ],
  sergio: [`Sergio laughs. Not a kind laugh. "You want more?" He leans back. "You get what you're given. That's how this works." The bonus dies, and he tells you to bring the product back when you accept the original number.`],
  iqbal: [`Quentin throws his head back and laughs — a theatrical, operatic sound that rattles the mirrors. "Oh, chocolate boy. NO. You're adorable when you try to negotiate." He pats your cheek. Twice. "Price is the price. Come back when you're ready to be realistic."`],
};

const RAID_SETUPS: Record<string, string[]> = {
  fletcher: [
    `The front door crashes open — police stream in through the main entrance, catching the morning session mid-spar. Lads scatter. Gloves fly. Fletcher doesn't move — he stands by the ring, arms crossed, watching the chaos like it's a show put on for his benefit. "RAID! EVERYONE ON THE WALL!" Fletcher looks at you. Calm. "Well, you heard the man."`,
    `Blue lights through the frosted glass. The gym goes quiet — skipping ropes stop, heavy bags sway to a halt. Fletcher sighs, long and deep. "Fucking Saturday morning. They always do it on Saturday morning." He doesn't look panicked. He looks annoyed. Like a man whose routine has been interrupted by something beneath his attention. "Back room. Now."`,
    `A dog barks outside. Then another. Fletcher's head snaps up — the first time you've seen him move fast. "Dogs. They've brought dogs." He grabs the product off the table. "They're not here for a chat, Angelo. Move." The German shepherds are already through the door, handlers struggling to keep up. Chaos.`,
    `The fire exit alarm screams. But it's not a drill — the door's been forced from outside. Police in tactical gear pour through the back entrance. Fletcher watches them enter, then turns to you with something like amusement. "Tactical unit. For a bit of coke and a few lads skipping rope. The Met's budget really has gone to shit."`,
    `An unmarked van pulls up outside. No sirens. No lights. Just a van full of plainclothes officers who move with the quiet efficiency of men who've done this before. Fletcher sees them through the window. "Met fucking Police." He doesn't raise his voice. "Angelo. Back room. Take the product. Leave the cash — it's insured."`,
  ],
  sergio: [`The door splinters inward. "POLICE! GET DOWN!" Blue lights strobe through the car wash windows. Sergio is already moving — calm, fast, pointing at the back. "Cousins. Now." His voice cuts through the noise. "MOVE, Blacky!"`],
  iqbal: [`The door to the flat splinters inward. "POLICE! EVERYBODY FREEZE!" Blue lights ricochet off every mirror — the whole room strobes like the world's shittest disco. Quentin drops his kimono in shock — full frontal, coke still on his top lip. "THIS IS AN OUTRAGE! I HAVE A PERFORMANCE ON THURSDAY! DO YOU KNOW HOW LONG 'DON'T CRY FOR ME ARGENTINA' TOOK TO LEARN?!" He's still naked. Nobody's enjoying this.`],
};

const RAID_GRAB_SUCCESS: Record<string, string[]> = {
  fletcher: [
    `You grab everything — cash, product — and dive through the fire exit into the alley. The metal door slams behind you, cutting off the chaos. You're two streets away before the first dog clears the doorway. Fletcher's laugh follows you through the brick walls.`,
    `Out the window — the one in the changing room that opens onto the bin yard. You land in a pile of black bags, roll, and come up running. Behind you, the gym is a symphony of shouting and barking. You disappear through the gap in the fence — the one the lads use to sneak out for fags. Product intact. Cash in your pocket.`,
    `Through the back of the storeroom — there's a false panel behind the boxing gloves. You shove through into the neighbouring building's corridor — a bail bonds office that's been closed for years. You catch your breath in a room full of dusty filing cabinets and forgotten promises. The raid continues next door. You slip out the front. Clean.`,
    `Fletcher's van — the grey Transit parked in the alley behind the gym. He tossed you the keys mid-raid. "GO! I'll sort this!" You pile into the driver's seat, product and cash on the passenger side, and pull out just as the tactical team breaches the front. Fletcher watches you go from the gym window, already lighting a cigarette.`,
    `Up the fire escape — rusted metal stairs that haven't been tested since the 80s. You climb with the product under one arm, cash in your jacket, feeling every step bend beneath you. The roof. Across three terraced rooftops — television aerials, pigeon shit, a discarded mattress. You drop down into the next street. The gym is a distant commotion. You're clean.`,
  ],
  sergio: [`You grab everything — cash, product — and dive through a back window. Glass shatters. You hit the wet concrete running. Behind you, the car wash is swarming. But you've got everything. Sergio's already gone.`],
  iqbal: [`You grab everything — cash, product, and somehow Quentin's backup kimono — and launch yourself through the fire escape. Behind you: shouting, crashing, and Quentin's voice slicing through it all: "THAT KIMONO WAS VINTAGE, YOU ABSOLUTE BASTARD! MY AUNTIE BROUGHT THAT BACK FROM KYOTO! SHE'S DEAD NOW!" You're two streets away before you realise you're running in a silk robe.`],
};

const RAID_GRAB_FAIL: Record<string, string[]> = {
  fletcher: [
    `You're halfway to the fire exit when a copper grabs you by the collar. You hit the deck hard — product and cash everywhere. Fletcher watches from the corner, already in cuffs, shaking his head. "Should've gone left, Angelo. Always go left."`,
    `The fire exit is blocked — a tactical officer already through it, weapon raised. "ON THE GROUND! NOW!" You don't argue. Everything bagged as evidence. Through the chaos, you see Fletcher being led out, calm as ever. "Don't worry, son. I know a brief who'll have this thrown out before tea time." He's probably right.`,
  ],
  sergio: [`You go for the door but they're already through. Cuffed before you can blink. Sergio's cousins are on the floor, faces down. Sergio himself is nowhere — vanished like smoke. Everything confiscated.`],
  iqbal: [`They're everywhere. Before you can reach the back window, an officer has you cuffed. Quentin is already crying — actual tears, mascara tracking through yesterday's foundation, snot mixing with the coke residue. "This is the WORST raid I've ever been in. And I've been in four. FIVE if you count Butlins 2009. That was a dark weekend, chocolate boy. A DARK weekend." Everything confiscated. You're charged. Quentin asks if you want to share a cell. You do not.`],
};

const RAID_SLIP_SUCCESS: Record<string, string[]> = {
  fletcher: [
    `You slip out through the boiler room — a narrow corridor that leads to the street behind the gym. The boiler hisses as you pass, pipes ticking, the heat oppressive. You emerge into the alley, gasping for air. Product safe. Cash left behind on the ring apron. Could be worse.`,
    `Through the bathroom window — the one that sticks because the frame's swollen from thirty years of steam. You wedge it open with your shoulder and slide through, landing in a patch of weeds behind the gym. A cat watches you from a wall. You're two blocks away by the time you hear the first shout. Product secure. Cash abandoned.`,
    `Behind the ring — there's a gap in the canvas at the corner where the lads store their training bags. You slide underneath, press yourself flat, and watch the raid unfold through the gap. Police boots everywhere. Fletcher being questioned. Cash on the table — they'll take it. But you've got the product. When the gym clears, you slip out through the back.`,
    `You walk. Just — walk. Through the chaos, past the shouting, past the dogs. You're just another lad leaving the gym during a raid, hands in your pockets, looking confused. Nobody stops you. Nobody checks. You're on the high street before the first dog barks. Product safe. Cash gone. The cold air hits you. Freedom.`,
    `Out the side door — the one marked "EMERGENCY EXIT — ALARM WILL SOUND." You push through. The alarm screams. But in the chaos of the raid, nobody notices one more alarm. You're in the next postcode before the alarm company calls it in. Product safe. Cash lost. You'll take it.`,
  ],
  sergio: [`You leave the cash on the desk and slip out through a service entrance. Cold air. Wet pavement. You're two blocks away before the sirens register. Product safe. Cash gone. Could be worse.`],
  iqbal: [`You leave the cash on the chaise longue and slip out through the launderette below. Through the ceiling you can hear Quentin: "OFFICER. OFFICER. Do you enjoy musical theatre? Because I'm getting VERY dramatic energy from you. Have you ever considered amateur dramatics? Because I can see you as Javert. Very authoritarian. Very repressed. You'd be PERFECT." The police are too bewildered to notice you. Product safe. Quentin's still monologuing.`],
};

const RAID_SLIP_FAIL: Record<string, string[]> = {
  fletcher: [
    `The boiler room door is bolted — new lock, not there last week. You rattle it, but it won't budge. A hand grabs your shoulder. "Going somewhere?" Everything seized. Through the gym, you catch Fletcher's eye. He just shakes his head, almost amused. "Bolted it myself last Tuesday. Keeps the kids out. Forgot to tell you."`,
    `The corridor is blocked — two officers with a dog. The German shepherd sits, watching you, tail wagging. Not aggressive. Just sure. "Drop it, mate." You drop it. Everything bagged. Fletcher's voice from somewhere: "Dogs. Always the dogs. I told you, didn't I? Told you they'd bring dogs."`,
  ],
  sergio: [`The service exit is blocked. An officer grabs you by the collar. Sergio's cousins are already in cuffs. Sergio himself — gone. Vanished. Everything seized.`],
  iqbal: [`The back window is jammed. An officer grabs you by the collar. Quentin spots you from across the room — still naked, still coked up, still somehow projecting. "OH, SO YOU'RE JUST LEAVING ME? TYPICAL. TYPICAL FUCKING MAN. First my ex-husband, now YOU." He turns to the officer. "Arrest him. But be gentle — he's very pretty when he's not betraying me." Everything's gone. Including your will to live.`],
};

const RAID_HIDE_SUCCESS: Record<string, string[]> = {
  fletcher: [
    `You squeeze into the equipment locker — between piled boxing gloves, a speed bag, and a jump rope that smells like it's been through a war. The locker door clicks shut. Through the slats you watch the raid pass — boots, voices, the thud of lockers being opened nearby. They don't check this one. When the noise clears, you push the door open. Everything intact. The gym is empty. Quiet.`,
    `Behind the heavy bags — pressed against the cold brick, the bags swaying from the chaos of the raid. An officer walks past, shoves a bag out of his way — it swings back, hiding you further. He doesn't check behind it. You stay frozen for what feels like an hour. When you emerge, the raid is over. Product secure. Cash still on the table. Fletcher's voice: "Alright, they're gone. You can come out, you nonce."`,
    `Under the ring — flat on your back on the dusty floorboards, the canvas above you dim and muffled. You can see feet through the gap — police boots circling, stopping, moving on. A flashlight beam sweeps under the ring, misses you by inches. You don't breathe for three minutes. When the gym clears, you slide out. Everything still here. The underside of the ring has a thin layer of chalk dust and sweat. It's been hiding people since the 70s.`,
    `In the bathroom stall — feet up on the toilet seat, holding your breath. A copper comes in, uses the urinal, washes his hands. You can see his reflection in the chrome of the toilet roll holder. He checks his teeth in the mirror, adjusts his tie, and leaves. He never checks the stall. The deal survives. You flush for realism on your way out.`,
    `The ceiling crawlspace — Fletcher's father's trick. You stand on the toilet tank, push the ceiling panel aside, and haul yourself up with the product. Below, the bathroom fills with officers. You lie flat on the dusty boards, breathing into your elbow, listening to them talk about a curry house they went to last week. Fifteen minutes later, they leave. You lower yourself down. Everything intact. The ceiling panel has "FLETCHER WAS HERE 1979" scrawled on the back in marker.`,
  ],
  sergio: [`You squeeze into a storage closet between cleaning supplies and motor oil. Through the gap you watch the chaos — officers shouting, dogs barking, Sergio's cousins face-down on the concrete. When the noise passes, you slip out. Everything intact.`],
  iqbal: [`You squeeze into the wardrobe — sequins, velvet, something that might have been a corset in 1987. Through a gap in the hangers you watch the police sweep the flat. Quentin is giving a full statement — with interpretive dance, with ACTING, with actual tears. They're too mesmerised to search properly. When the chaos passes, you emerge covered in glitter and questionable stains. But you've got everything. Worth the dry cleaning bill.`],
};

const RAID_HIDE_FAIL: Record<string, string[]> = {
  fletcher: [
    `The locker door swings open — an officer with a key ring. He's been systematically checking every one. "Got one." You're pulled out, cuffed, everything bagged. Through the gym you see Fletcher being led out, calm as ever. "Should've used the storeroom, Angelo. That locker's been compromised since 2004."`,
    `The dog finds you under the ring. It sits, whines, wags its tail. The handler pulls you out by the ankle. "Nice try." Everything seized. Fletcher watches from across the gym, already in cuffs. "The dog's new. Didn't know they had a dog." He shrugs. "You win some, you lose some, son."`,
  ],
  sergio: [`A dog finds you. The handler pulls you out by the arm. Everything bagged as evidence. Sergio's cousins are in cuffs. Sergio himself — gone. Vanished. Like he was never there.`],
  iqbal: [`The wardrobe door swings open. Sequins avalanche everywhere — a glitter bomb in a flat that's already seen too much. An officer pulls you out by the collar. Quentin gasps — genuinely, deeply offended. "You were hiding in my CABARET COLLECTION? That's vintage, chocolate boy! Some of those sequins are older than YOU!" He turns to the officer. "I want him charged. For theft AND for crimes against fashion." Everything bagged as evidence. You're done.`],
};

// Helper to get random item from an array
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// Helper to fill in placeholder in dialogue strings
function fill(dialogue: string, goodName: string): string {
  return dialogue.replace(/%GOOD%/g, goodName);
}

// ── Encounter generators ───────────────────────────────────────

export function generateKingpinApproachEvent(kingpin: KingpinProfile, fightOutcome?: string): ChoiceEvent {
  const pool = kp(APPROACH_SETUPS, kingpin, fightOutcome);
  const context = pool[Math.floor(Math.random() * pool.length)] ?? `You arrive at ${kingpin.location}. Time to make your move.`;
  const locationLine = `You pull up outside ${kingpin.location}.`;
  return {
    id: 'kingpin_approach_' + Date.now().toString(36),
    title: `Meeting ${kingpin.name} — Approach`,
    context: `${locationLine}\n\n${context}\n\nHow do you want to play this?`,
    choices: [
      { id: 'lowkey', text: 'Keep a low profile — observe before you\'re seen.', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' } },
      { id: 'flash', text: 'Walk in like you own the place — confidence is currency.', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' } },
      { id: 'watch', text: 'Scope the exits and keep your hand near your pocket.', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' } },
      { id: 'walk_away', text: 'Not feeling this — come back another time.', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' } },
    ],
  };
}

export function generateKingpinEncounter(
  player: PlayerState,
  kingpin: KingpinProfile,
  goodName: string,
  totalValue: number,
  oddsBonus?: Record<string, number>,
  fightOutcome?: string,
  forceRaid = false,
): ChoiceEvent {
  const event = forceRaid
    ? generateKingpinRaid(player, kingpin, goodName, totalValue, oddsBonus, fightOutcome)
    : generateKingpinClean(player, kingpin, goodName, totalValue, oddsBonus, fightOutcome);
  return { ...event, context: addCashFlavor(player, event.context) };
}

function addCashFlavor(player: PlayerState, context: string): string {
  if (player.cash > 15000) {
    const flavors = ['\n\nSergio\'s eyes flick to your coat pocket. "You\'re carrying a lot of cash, Blacky. That\'s either confidence or stupidity."', '\n\nFletcher stops mid-punch, stares at the bulge in your jacket. "You planning to buy the gym, or are you just showing off? Put that away before one of my lads gets ideas."', '\n\nQuentin fans himself. "Ooh, someone\'s got a thick wallet today. Careful, chocolate boy — this neighbourhood\'s full of sticky fingers."'];
    return context + flavors[Math.floor(Math.random() * flavors.length)];
  }
  if (player.cash > 10000) {
    const flavors = ['\n\n"You\'re carrying heavy today," they note. "Keep your wits about you."', '\n\nThey glance at your pocket. "That\'s a lot of walking money. You expecting trouble?"', '\n\n"Bit of a bulge there, friend. Hope you\'re not planning on getting turned over."'];
    return context + flavors[Math.floor(Math.random() * flavors.length)];
  }
  return context;
}

// ── Fight choice config for Fletcher's initiation ──────────────

interface FightChoiceConfig {
  id: string;
  text: string;
  baseOdds: number;
  scoreValue: number;
  successMessage: string;
  failMessage: string;
}

export const FIGHT_ROUND_CONFIG: Record<number, { title: string; context: string; choices: FightChoiceConfig[] }> = {
  1: {
    title: 'The Initiation — Round 1',
    context: `Fletcher's young lad — maybe nineteen, all sinew and bad intentions — circles you in the ring. The gym has gone quiet. Even the heavy bags have stopped swinging. He's quick. Left hand forward. He bounces on the balls of his feet, waiting for you to make the first move.\n\n"Go on, then," Fletcher says from the corner. "Let's see what you're made of, Angelo."`,
    choices: [
      { id: 'lead_jab', text: 'Lead with a stiff jab — test his range.', baseOdds: 0.65, scoreValue: 1, successMessage: 'Your jab catches him on the forehead — not clean, but enough to make him reset. He touches his brow, smirks. "Alright, then." Fletcher grunts approval from the corner.', failMessage: 'Your jab falls short. He slips it easily and taps your ribs in reply — a warning shot. Fletcher\'s voice: "Keep your chin down, Angelo. You\'re reachin\'."' },
      { id: 'feint_hook', text: 'Feint right, hook left — catch him off balance.', baseOdds: 0.45, scoreValue: 1, successMessage: 'He bites on the feint — drops his guard for half a second. Your hook catches him on the ear. He stumbles sideways, shakes it off, grins. "Lucky shot." Fletcher laughs — a dry rasp. "That weren\'t luck, Danny."', failMessage: 'He reads the feint like a book. Counterpunches your exposed ribs — hard enough to wind you. You backpedal, gasping. Fletcher: "Too obvious. You telegraph like a fucking weatherman, Angelo."' },
      { id: 'circle_away', text: 'Circle away, feel him out — patience.', baseOdds: 0.75, scoreValue: 1, successMessage: 'You move. Not quickly — economically. Cutting angles, making him reset. He follows, frustrated, throwing nothing. Fletcher nods slowly. "Good feet. You\'ve done this before."', failMessage: 'You circle but your footwork is sloppy — he cuts you off against the ropes and lands a body shot. "You\'re thinking too much," Fletcher says. "Stop thinking and start fighting."' },
    ],
  },
  2: {
    title: 'The Initiation — Round 2',
    context: `Round two.\n\nHe comes forward, right hand loaded. You can see it in his shoulders — he's planning something big. Fletcher's voice cuts through: "He drops his guard when he throws the right. Watch for it."`,
    choices: [
      { id: 'dodge_counter', text: 'Dodge the right and counter to the body.', baseOdds: 0.55, scoreValue: 1, successMessage: 'You slip the right — it whistles past your ear — and plant two clean shots to his ribs. He exhales hard, covers up, retreats. Fletcher\'s voice, louder now: "THAT\'S IT! THAT\'S FUCKING IT!"', failMessage: 'You try to slip but he was feinting. The right hooks over your guard — not full power, but enough to rock you. Your vision blurs for a second. Fletcher: "You fell for the oldest trick in the book, son. Keep your eyes on his shoulders, not his fists."' },
      { id: 'duck_uppercut', text: 'Duck under and come up with an uppercut.', baseOdds: 0.40, scoreValue: 1, successMessage: 'You drop under his wild swing and drive upward — your uppercut catches him clean on the chin. His head snaps back. He staggers. The gym ERUPTS. Fletcher bangs the canvas. "HOOOO! DANNY! You just got done by a civilian!" Danny shakes it off, grinning. "Fair fucking one, mate."', failMessage: 'He sees you duck — drops an elbow on the back of your head. Not legal, but this isn\'t a licensed fight. You eat canvas. Fletcher: "You can\'t duck a punch you haven\'t set up, Angelo. He was waiting for that. Get up."' },
      { id: 'block_clinch', text: 'Block and clinch — smother his work.', baseOdds: 0.70, scoreValue: 1, successMessage: 'You step into him, smother his punches, wrap him up in the clinch. He struggles — you\'re stronger than you look. Fletcher: "Good. Smart. Use your weight, use his momentum. You\'re not just a pretty face, are you?"', failMessage: 'You reach for the clinch but he steps back and cracks you with a straight right. Clean. You eat it. "You can\'t clinch from that distance, you plum," Fletcher says. "You gotta earn your way in."' },
    ],
  },
  3: {
    title: 'The Initiation — Round 3',
    context: `Final round. This is it. The whole gym is watching — lads on the bags, lads on the ropes, even the skipping has stopped. Fletcher leans into the ring. "Finish it, Angelo. Show me what you've got."`,
    choices: [
      { id: 'kitchen_sink', text: 'Step in — throw the kitchen sink.', baseOdds: 0.35, scoreValue: 1, successMessage: 'You let your hands go — three, four, five shots in combination. The last one — a overhand right — catches him flush on the jaw. His legs go. He drops to one knee, glove on the canvas. The gym goes silent. Then — cheering. Fletcher pulls you off him. "Alright, ALRIGHT! That\'s enough!" He looks at you, breathing hard. "Fucking hell, Angelo. You can actually fight."', failMessage: 'You swing wild — too eager. He steps back, lets you exhaust yourself, then taps you on the chin with a jab-cross that sends you to the canvas. You\'re up before the count, but you lost the round. Fletcher: "Heart. No technique. But heart counts for something in this game."' },
      { id: 'body_wear_down', text: 'Body shots — break him down.', baseOdds: 0.55, scoreValue: 1, successMessage: 'You dig to the body — left, right, left to the liver. His guard drops. His breath catches. He takes a knee, not from punishment but from exhaustion. Fletcher nods slowly. "Body work. Proper old-school. My father would\'ve liked you." He spits into a bucket. "Alright, that\'s enough. Get cleaned up."', failMessage: 'You go to the body but he catches you coming in — uppercut on the button. Your legs turn to rubber. The gym spins. You\'re on the canvas looking up at the lights. Fletcher peers over you. "You alright down there? Good. That was a lesson — body shots don\'t work if you walk onto an uppercut."' },
      { id: 'patient_strike', text: 'Let him tire — then strike when he drops.', baseOdds: 0.65, scoreValue: 1, successMessage: 'You let him come to you. He throws — you move. He swings — you\'re not there. Thirty seconds of this and his breathing is ragged. When his hands drop, you step in with a clean one-two that snaps his head back. Fletcher\'s voice, quiet: "Patience. Proper fucking patience. You\'ve got a boxer\'s brain in a civilian\'s body."', failMessage: 'You wait too long. He\'s not tired — he\'s feinting tiredness. When you step in, he\'s ready. A check hook catches you on the temple. You go down sideways. Fletcher shakes his head. "Never trust a tired boxer, Angelo. They\'re never as tired as they look."' },
    ],
  },
};

export function generateKingpinFightRound(
  player: PlayerState,
  kingpin: KingpinProfile,
  round: number,
  score: number,
): ChoiceEvent {
  const config = FIGHT_ROUND_CONFIG[round];
  if (!config) {
    // Generate result event for after round 3
    let outcomeTitle: string;
    let outcomeContext: string;
    let rapportDelta: number;
    if (score >= 3) {
      outcomeTitle = 'The Initiation — Victory';
      outcomeContext = `The gym erupts. Lads are cheering, banging lockers, howling. Danny picks himself up, spits blood, shakes your hand. "Fair play, mate. You're alright."\n\nFletcher steps through the ropes. He looks at you — really looks at you — for a long moment. Then he does something unexpected. He nods. A proper nod.\n\n"Not bad, Angelo. Not bad at all. I've seen a lot of lads come through that door. Most of them can't handle Danny. You put him on his arse." He almost — almost — smiles. "Deal's on. Better terms, too. You've earned it."`;
      rapportDelta = 15;
    } else if (score >= 2) {
      outcomeTitle = 'The Initiation — Competitive Loss';
      outcomeContext = `The bell rings. Danny grins — he's breathing hard, but he's still standing. "Close one, mate. Fucking close."\n\nFletcher unstraps your gloves. "You gave him a proper fight. More than most." He shakes his head slowly. "But 'close' doesn't count in this game, Angelo. You had him — and you let him off the hook." He tosses a towel at you. "Let's talk business. But you've got work to do before you're in my league."`;
      rapportDelta = 0;
    } else {
      outcomeTitle = 'The Initiation — Lesson Learned';
      outcomeContext = `Danny helps you up — not unkindly, but there's a grin he's trying to hide. "You alright, mate?" You nod. You're not.\n\nFletcher appears beside you. He doesn't offer water. "That was embarrassing. In front of the whole gym." He shakes his head. "Deal's still on. Same terms. But you've got a lot to prove, Angelo. Don't make me regret letting you through that door."`;
      rapportDelta = 0;
    }
    const ts = Date.now().toString(36);
    return {
      id: `kingpin_fight_result_${ts}`,
      title: outcomeTitle,
      context: outcomeContext,
      choices: [
        { id: 'continue', text: 'Continue', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: '' } },
      ],
    };
  }
  const ts = Date.now().toString(36);
  const credBonus = Math.min(0.15, player.credibility * 0.001);
  const notBonus = Math.min(0.25, player.notoriety * 0.002);
  return {
    id: `kingpin_fight_round_${round}_${ts}`,
    title: config.title,
    context: config.context,
    choices: config.choices.map(c => ({
      id: c.id,
      text: c.text,
      odds: Math.min(0.95, Math.max(0.10, c.baseOdds + credBonus + notBonus)),
      successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: c.successMessage },
      failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, message: c.failMessage },
    })),
  };
}

let _ks = 0;
function nextKingpinId(): string { return `kingpin_${++_ks}_${Date.now().toString(36)}`; }

function kp(key: Record<string, string[]>, k: KingpinProfile, outcome?: string): string[] {
  if (outcome) {
    const outcomeKey = `${k.id}_${outcome}`;
    if (key[outcomeKey]) return key[outcomeKey];
  }
  return key[k.id] ?? [''];
}

function applyOddsBonus(base: number, bonus?: Record<string, number>, choiceId?: string): number {
  if (!bonus || !choiceId) return base;
  const b = bonus[choiceId] ?? 0;
  return Math.min(1.0, Math.max(0.05, base + b));
}

function generateKingpinClean(player: PlayerState, k: KingpinProfile, goodName: string, totalValue: number, oddsBonus?: Record<string, number>, fightOutcome?: string): ChoiceEvent {
  return {
    id: nextKingpinId(),
    title: `Meeting ${k.name}`,
    context: fill(pick(kp(CLEAN_SETUPS, k, fightOutcome)), goodName),
    choices: [
      { id: 'close_deal', text: 'Close the deal.', odds: applyOddsBonus(0.85, oddsBonus, 'close_deal'),
        successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: true, message: fill(pick(kp(CLEAN_CLOSE_SUCCESS, k, fightOutcome)), goodName) },
        failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: -3, credibilityDelta: -5, inventoryLost: false, message: fill(pick(kp(CLEAN_CLOSE_FAIL, k, fightOutcome)), goodName) } },
      { id: 'negotiate', text: 'Push for a better price.', odds: applyOddsBonus(0.55, oddsBonus, 'negotiate'),
        successEffects: { cashDelta: Math.floor(totalValue * 0.2), heatDelta: 10, reputationDelta: 4, credibilityDelta: 8, inventoryLost: true, message: fill(pick(kp(CLEAN_NEGOTIATE_SUCCESS, k, fightOutcome)), goodName) },
        failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: -2, credibilityDelta: -5, inventoryLost: false, message: fill(pick(kp(CLEAN_NEGOTIATE_FAIL, k, fightOutcome)), goodName) } },
    ],
  };
}

function generateKingpinRaid(player: PlayerState, k: KingpinProfile, goodName: string, totalValue: number, oddsBonus?: Record<string, number>, fightOutcome?: string): ChoiceEvent {
  return {
    id: nextKingpinId(),
    title: 'THE RAID',
    context: fill(pick(kp(RAID_SETUPS, k, fightOutcome)), goodName),
    choices: [
      { id: 'grab_run', text: 'Grab everything and run. Now.', odds: applyOddsBonus(0.45, oddsBonus, 'grab_run'),
        successEffects: { cashDelta: Math.floor(totalValue * 0.5), heatDelta: 25, reputationDelta: 5, credibilityDelta: 10, inventoryLost: true, message: fill(pick(kp(RAID_GRAB_SUCCESS, k, fightOutcome)), goodName) },
        failEffects: { cashDelta: -3000, cashPct: 0.25, heatDelta: 40, reputationDelta: -10, credibilityDelta: -15, inventoryLost: true, message: fill(pick(kp(RAID_GRAB_FAIL, k, fightOutcome)), goodName) } },
      { id: 'slip_out', text: 'Slip out the back. Leave the cash.', odds: applyOddsBonus(0.65, oddsBonus, 'slip_out'),
        successEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: fill(pick(kp(RAID_SLIP_SUCCESS, k, fightOutcome)), goodName) },
        failEffects: { cashDelta: -1000, cashPct: 0.20, heatDelta: 30, reputationDelta: -5, credibilityDelta: -10, inventoryLost: true, message: fill(pick(kp(RAID_SLIP_FAIL, k, fightOutcome)), goodName) } },
      { id: 'hide', text: 'Hide. Wait for the chaos to pass.', odds: applyOddsBonus(0.75, oddsBonus, 'hide'),
        successEffects: { cashDelta: 0, heatDelta: 20, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: fill(pick(kp(RAID_HIDE_SUCCESS, k, fightOutcome)), goodName) },
        failEffects: { cashDelta: 0, heatDelta: 35, reputationDelta: -5, credibilityDelta: -10, inventoryLost: true, message: fill(pick(kp(RAID_HIDE_FAIL, k, fightOutcome)), goodName) } },
    ],
  };
}

export function getApproachOddsBonus(approach: 'lowkey' | 'flash' | 'watch'): Record<string, number> {
  switch (approach) {
    case 'lowkey': return { close_deal: 0.05, negotiate: 0.05, grab_run: 0.05, slip_out: 0.05, hide: 0.05 };
    case 'flash': return { close_deal: -0.05, negotiate: 0.10, grab_run: -0.05, slip_out: -0.05, hide: 0.00 };
    case 'watch': return { close_deal: 0.00, negotiate: 0.00, grab_run: 0.15, slip_out: 0.10, hide: 0.08 };
  }
}
