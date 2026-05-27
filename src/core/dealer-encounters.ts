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
  { countryId: 'colombia', dealerId: 'col_1', name: 'Basil Stillborn', gender: 'male', description: 'washed-up failed British actor. Lives in a flat outside Villa Del Prado pretending he\'s "semi-retired", but really he fled London due to mounting debts, unpaid taxes, and several deeply embarrassing sexual abuse allegations involving minors. Survives by doing terrible radio adverts for cheap hotels, dodgy car hire firms and low-budget perfume commercials aimed at American tourists. Speaks with an absurdly over-pronounced theatrical English accent and insists on introducing himself as "Basil Stillborn of the West End". Don\'t let him near your kids', location: 'a flat outside Villa Del Prado', priceModifier: 1.15, riskBonus: -0.05, rapport: 0 },
  { countryId: 'colombia', dealerId: 'col_2', name: 'Pablo', gender: 'male', description: 'Started out selling fake lottery tickets, then discovered the white powder. Now the cartel owns half of Bogotá. Will shoot you in the face if you look at him wrong — police won\'t touch him. His henchmen will cut you from arsehole to breakfast time if you short change him by so much as a dime.', location: 'a back room behind a lottery ticket kiosk in the seediest part of Bogotá — a rusted fan, a crucifix, and a framed photo of a young Pablo in a fake gold chain', priceModifier: 1.25, riskBonus: 0.20, rapport: 0 },
  { countryId: 'colombia', dealerId: 'col_3', name: 'Eli Weiss', gender: 'male', description: 'covetous Jew, sells Nazi memorabilia, stolen watches and non-prescription stimulants through obscure internet forums and "historical collector" meetups. permanently overdressed in loafers and tucked-in shirts like he\'s auditioning to be a junior stockbroker. Speaks with a strange half-American, half-forced European accent depending on who he\'s trying to impress. Claims his grandfather was a camp kapo at Auschwitz and talks about it with bizarre pride, insisting he was "a survivor who understood power." Obsessed with authoritarianism, "traditional values," and obscure World War II history to a deeply uncomfortable degree.', location: 'a cramped flat in the Zona Rosa, stuffed floor-to-ceiling with books on Nazi Germany, Karl Marx, and The Castaño brothers. an overpowering smell of old paper and coffee emanates from the hallways and living room', priceModifier: 1.0, riskBonus: 0.0, rapport: 0 },
  // Netherlands (weed, hashish)
  { countryId: 'netherlands', dealerId: 'net_1', name: 'Pieter', gender: 'male', description: 'Houseboat philosopher. Always high. Grows his own truffles. Once tried to sell a sofa he thought was a dragon.', location: 'his houseboat on a quiet Amsterdam canal', priceModifier: 0.95, riskBonus: -0.05, rapport: 0 },
  { countryId: 'netherlands', dealerId: 'net_2', name: 'Lena', gender: 'female', description: 'Russian import. Runs a couple of brothels in the red light district. Came to Amsterdam ten years ago with nothing — now she owns half the windows on her canal. Sexy as hell and knows it. Flirts with everyone. It works. You\'ll pay her prices and you\'ll enjoy it.', location: 'the back office of her flagship brothel on the Oudezijds Achterburgwal — red velvet curtains, a chaise longue, and a bottle of Stoli on the desk for special guests', priceModifier: 1.2, riskBonus: -0.15, rapport: 0 },
  { countryId: 'netherlands', dealerId: 'net_3', name: 'Micky', gender: 'male', description: 'Big black bastard. East London boy. Fled to Amsterdam after a robbery went sideways. Been dealing weed and cocaine out here ever since. Kept the accent. Kept the attitude. Made a name for himself. Proper old-school London gangster — proper hard cunt. Don\'t let the smile fool you — he\'s put people in hospital for less than what you\'re probably thinking right now.', location: 'a rented flat above a Surinamese takeaway in Amsterdam-Zuidoost — football on the telly, a machete under the sofa, and a framed photo of his mum on the mantelpiece', priceModifier: 0.8, riskBonus: 0.1, rapport: 0 },
  // Spain (MDMA, ecstasy)
  { countryId: 'spain', dealerId: 'esp_1', name: 'Howard', gender: 'male', description: 'Ex coal miner from the Valleys. Emigrated after Thatcher shut the pits. Now sells weed out of an old VW camper van. Fair prices. Won\'t double cross you. Police know his face but can never prove anything.', location: 'his rusted VW camper van parked up on a quiet hillside overlooking Barcelona — beanbags, fairy lights, and a Welsh dragon sticker on the back window', priceModifier: 1.15, riskBonus: 0.0, rapport: 0 },
  { countryId: 'spain', dealerId: 'esp_2', name: 'Barry', gender: 'female', description: 'Six foot tall in cheap blonde wigs, skin-tight dresses and enough fake tan to stain furniture. Built like a nightclub bouncer with massive arms, a deep smoker\'s voice and permanently smudged makeup melting off in the Spanish heat. Looks less like a glamorous woman and more like an angry divorced scaffolder who got lost on the way to Benidorm Pride. Originally from Portsmouth. Moved to Spain after several "misunderstandings" involving pub fights, unpaid debts and allegedly threatening a vape shop owner with a bar stool. Spends most nights chain-smoking outside tacky karaoke bars arguing with tourists, delivery drivers and anyone who accidentally says "mate." Desperate to be seen as classy and intimidating at the same time despite living above a collapsing kebab shop with three stolen French bulldogs.', location: 'a tapas bar in the Albaicín, Granada', priceModifier: 0.9, riskBonus: 0.02, rapport: 0 },
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
    id: 'avi',
    name: 'Avi',
    description: 'Hatton Garden diamond man. Three generations in the trade — his bubbe ran the numbers, his father ran the gold. Avi runs everything. Calls you "bubbeleh" when he likes you.',
    location: 'a private office above a diamond wholesaler in Hatton Garden',
    minStashValue: 5000,
    sellPriceMod: 1.2,
    encounterWeights: { clean: 85, raid: 15 },
    buys: ['ecstasy', 'cocaine'],
  },
  {
    id: 'sergio',
    name: 'Sergio',
    description: 'Albanian. North London. Volatile as a bag of snakes but pays top dollar when he\'s in a good mood.',
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
    dealerIds: ['col_1','col_3','afg_2'],
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
    dealerIds: ['net_1','esp_2','esp_3'],
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
        { id: 'take_double', text: 'Take double volume. Big risk, big reward.', odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: 'The quality is exceptional — pure and clean. You flip it fast. Double the profit, double the reputation.' }, failEffects: { cashDelta: -2000, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: 'It\'s a setup. Police swarm the bar from the back entrance. You escape through the kitchen but the cash and product stay behind.' } },
        { id: 'stick_standard', text: 'Stick to the original amount. Test the quality first.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `${p(dealer).He} nods. "Smart. We'll talk about volume next time." The standard deal goes smoothly.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: true, message: 'The sample was good, Angelo . but the main batch is cut to shit. You move it at a loss. Lesson learned.' } },
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
        { id: 'ignore', text: 'Proceed anyway. The product is worth the risk.', odds: 0.20, successEffects: { cashDelta: 5000, heatDelta: 20, reputationDelta: 10, credibilityDelta: 15, inventoryLost: false, message: 'The man with the wire walks straight past you and arrests a completely different dealer two doors down. Wrong place, wrong time — for HIM. You and your contact stand there frozen like two spastics watching a car crash. When the dust settles, you\'re both still standing. The deal goes through. Sometimes it\'s better to be lucky than good.' }, failEffects: { cashDelta: -5000, heatDelta: 40, reputationDelta: 0, credibilityDelta: -20, inventoryLost: true, message: 'It IS a sting. Federal agents pour out of the van. You lose everything — cash, product, freedom for about six terrifying hours. You barely walk away.' } },
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
        { id: 'take_bonus', text: 'Take the bonus. Extra product, half price.', odds: 0.55 + player.credibility * 0.003, successEffects: { cashDelta: -300, heatDelta: 10, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: 'The bonus product is pristine. You sell it for significantly more than expected. Sometimes the gamble pays.' }, failEffects: { cashDelta: -300, heatDelta: 15, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: 'The "bonus" product is cut with god knows what. Baking soda, mostly. Worthless. You\'re stuck with it and your dealer is suddenly unreachable.' } },
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
        { id: 'take_job', text: 'Accept. This is the big leagues.', odds: 0.40 + player.credibility * 0.005, successEffects: { cashDelta: 10000, heatDelta: 15, reputationDelta: 10, credibilityDelta: 20, inventoryLost: false, message: 'The operation runs like a Swiss watch. You earn every dollar — and a reputation that opens new doors.' }, failEffects: { cashDelta: -5000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -15, inventoryLost: true, message: 'Set up. You walk into an ambush — three men waiting in the dark. You lose the cash and the product. You\'re lucky to walk out at all.' } },
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
        { id: 'get_in', text: 'Get in the SUV. This is how empires are built.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 25000, heatDelta: 20, reputationDelta: 15, credibilityDelta: 30, inventoryLost: false, message: 'The cartel offers you a direct pipeline — no middlemen, no markup, priority supply. Your earnings triple. Your name starts appearing in rooms you\'ve never entered.' }, failEffects: { cashDelta: -10000, heatDelta: 35, reputationDelta: 0, credibilityDelta: -20, inventoryLost: true, message: 'It\'s a shakedown. They take your cash as a "security deposit" and dump you on the outskirts of town with a warning. You were too eager.' } },
        { id: 'negotiate', text: 'Stay on the street. Talk through the window.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 10000, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: 'They respect the caution. "A man who doesn\'t rush — rare." A smaller deal is offered. Good money, less exposure.' }, failEffects: { cashDelta: -3000, heatDelta: 15, reputationDelta: 0, credibilityDelta: -8, inventoryLost: true, message: 'The window rolls up. "You waste our time." The SUV drives off. The opportunity evaporates.' } },
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
      context: [
        `Howard waves you into his camper. "Police sniffing around all week, butt. Supply's tight. Price up ${Math.round(pct * 100)}%. Don't sulk at me, mun."`,
        `Fairy lights, beanbags, and Howard rolling a joint. "Road's crawling with plainclothes. ${Math.round(pct * 100)}% increase. Blame the heat, not me, butt."`,
        `Howard cracks the van door. "Bad week, Angelo. Tight stock, nosey coppers, same old shit. Price climbs ${Math.round(pct * 100)}%."`,
      ][Math.floor(Math.random() * 3)],
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
      context: [
        `Howard parks higher up the hill tonight. "Old mate from the Valleys sent special Rhondda stock. Wants double moved. You brave or just chatty, butt?"`,
        `Different lay-by, same camper. Howard taps a crate. "Rhondda grower came through. Double volume on offer. Big upside, big aggro."`,
        `Howard grins from the driver's seat. "Got a Welsh batch that needs shifting fast. Double load, double noise. You in or playing safe, mun?"`,
      ][Math.floor(Math.random() * 3)],
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
      context: [
        `Howard's van is suspiciously tidy. "Got a fifty-grand port move, old-school paperwork, fake names. Twenty percent for you. Legend money or prison food."`,
        `Howard leans in. "Seventies smuggling playbook, butt. Fifty grand through the port, no noise. Twenty percent cut. Big boy decision."`,
        `Fresh Welsh dragon sticker, serious tone. "One major run. False papers, quiet route, fifty grand value. You become a name or a cautionary tale."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_job', text: 'Accept. This is the big leagues.', odds: 0.40 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Howard's eyes light up. "Tidy, mun! Absolutely tidy!" He reaches under the driver's seat and pulls out a folder — names, dates, shipping manifests, the works. Old-school. Proper smuggler craftsmanship. "This is how they did it before computers, Angelo. Paper trails that lead nowhere." The operation runs like clockwork. You earn every dollar — and Howard earns your undying respect.` }, failEffects: { cashDelta: -3000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The paperwork was too old. The shipping manifest had a typo — a Welsh word that Spanish customs didn't recognise but still flagged. It was enough. Howard tries to warn you — "Scatter, butt! SCATTER!" — but it's too late. Two men grab you. The cash and product stay behind. Howard drives off in the van, shouting apologies in Welsh out the window.` } },
        { id: 'negotiate_cut', text: 'Counter at thirty percent. Your risk, your price.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Howard pauses. Then that slow Welsh grin. "Thirty percent. You know what, Angelo? That's fair. That's actually fair." He puts his calloused miner's hand out. "Deal. The union taught me one thing: never agree to the first offer. Good lad." The most profitable run you've ever done. Howard gives you a Welsh coal keyring as a souvenir. "Solid as the pits, mun."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Howard chuckles, but it's sad. "I can't, butt. Twenty percent is what it is. The old ways were built on trust, not negotiation. The offer's off the table." He doesn't seem angry. Just... old. You leave with nothing. The camper van's engine rattles as you walk away.` } },
        { id: 'decline_offer', text: 'Politely decline. You don\'t know this contact well enough.', odds: 0.90, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Howard doesn't push. "Wise, mun. Very wise." He pulls out a small Welsh flag from the glove compartment. "Take this. For luck. And when you ARE sure — you know where to find me." The van rumbles off into the Spanish night. The flag is now in your wallet.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
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
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). Don't argue with the abortionist.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Mohamed counts the cash — twice. "Submission is wisdom. The Koran teaches this. Your people will learn it too, one day. At the end of a sword." He hands over the product. "The transaction is blessed. Now fuck off." You're out before the Kalashnikov gets involved.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `Mohamed takes your money. Then nods at his sons. "Search the Western cunt." Nothing — but they take their time. Take the product. Take your dignity. "Perhaps next week you'll come with more respect. And more cash. Now crawl back to your whore mother in London."` } },
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
        { id: 'pay_up', text: 'Pay what he asks. Four guns, one you.', odds: 0.55 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 0, credibilityDelta: 2, inventoryLost: false, message: `Mohamed counts the cash, then spits in the dust. "Fair price. Fair deal. The Prophet watched this transaction." He gestures — a son throws you the package. Says something in Pashto. They laugh. Mohamed translates: "He says you smell like a pig. I agree." You take the product and leave. Quickly.` }, failEffects: { cashDelta: -500, heatDelta: 20, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `Mohamed takes the money, nods at his sons. You're on the ground, boot on your throat. "The product stays. The money stays. Consider it reparations for twenty years of Western bombs, fucker." You're dragged to the main road. Left in the dust. "Tell London. Tell them Mohamed el Mohamed sends his regards. And his boot."` } },
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
        `Mohamed taps a leather ledger. "Names, debts, graves. Today I write yours. Black ink for money. Red ink for blood."`,
        `Cross-legged and smiling like a snake, Mohamed opens the book. "Every infidel I buried is in here. Decide what color your page gets."`,
        `He turns a page with priest-like calm. "You owe me now, cunt. Only question is whether I collect cash or collect you."`,
      ][Math.floor(Math.random() * 3)],
      choices: [
        { id: 'take_bonus', text: 'Take the extra product. Mohamed\'s ink can wait.', odds: 0.55 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Mohamed writes in black. Slowly. Deliberately. "You now have a credit line. Dangerous — but valuable. Like a snake you keep in your pocket." The product is pure. Triple profit. His name opens doors in places Westerners don't go. But every deal you do now — he knows. He's watching. The ledger grows.` }, failEffects: { cashDelta: -2000, heatDelta: 20, reputationDelta: 0, credibilityDelta: -8, inventoryLost: true, message: `The bonus product is real. But so is the entry in red. "A favour owed. I collect favours, cunt. Like your empire collected colonies — with patience. And violence. And time." For weeks you feel eyes on you. Pashto voices in your sleep. One day the favour comes due. You pray it's money he wants.` } },
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
        { id: 'get_in', text: 'Accept. The mosque protects its own.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 12, inventoryLost: false, message: `Mohamed writes your name. In Arabic. In the ledger. "You are now connected. The mosque protects what it owns. And it owns you now, cunt." Direct pipeline. No middlemen. Triple earnings. Muslim contacts across five countries reach out within hours. The mosque is a network. And you're in it. For better. Or much, much worse.` }, failEffects: { cashDelta: -3000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `It's a shakedown. They take everything — "security deposit" he calls it, smiling. His sons dump you at the edge of Kabul. "The mosque does not forget. It does not forgive. And it does not return deposits, fucker." You walk. Barefoot. Broke. The sermon continues behind you. Something about vengeance. Something about fire.` } },
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
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). Micky's product is worth it.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Micky grins. "That's what I like. No drama. Just business." Tosses you the bag. "Done. Now piss off before my phone rings — got three more people waiting. Looks like a fucking youth club in here."` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `Micky takes the cash, phone buzzes, face drops. "Ah, for fuck's sake." He's up. Fast. "Out. NOW. Back way." Shoves you toward the fire escape. "Anyone asks — you were never here, poofter." You make it. Product doesn't. Cash doesn't.` } },
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
        { id: 'stay_calm', text: 'Stay calm. Don\'t show fear.', odds: 0.55 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 1, credibilityDelta: 5, inventoryLost: false, message: `Micky nods. "Told you, Del. Solid. East London boys — don't scare easy." Tiny cracks a smile. Tension breaks. Micky slides the product over. "Standard price. For being cool. Most people piss themselves when they meet Tiny."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `You flinch. Tiny sees it. "He's scared, Mick." Micky sighs. "For fuck's sake, Angelo. I vouched for you. And you're trembling like a poofter at a prison visit." Slides product back. "Come back when you've grown a pair." Del laughs. Not friendly.` } },
        { id: 'stand_up', text: 'Stand up. Meet them eye to eye.', odds: 0.25 + player.notoriety * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 10, inventoryLost: false, message: `You stand. Micky's eyebrows go up. Del shifts. Even Tiny grins. "Alright," Micky says, quieter. "Didn't expect that, you mad little prick." Slides product over. "Tiny — give him the good bag." Tiny produces a better package. "That's for people I actually like. Don't make me regret it."` }, failEffects: { cashDelta: 0, heatDelta: 20, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `Tiny stands too. And keeps standing — until he's looking down at you. "Sit," Micky says. Tiny sits. Micky leans forward. "Never stand up in a room you don't own. Lesson one. Free." Slides product back. "Deal's off. Come back next week. If you can still walk, you cocky little cunt."` } },
        { id: 'talk_yourself_out', text: 'Crack a joke. Defuse it.', odds: 0.60, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 3, inventoryLost: false, message: `"So which one's the muscle and which one's the brains?" Silence. Then Micky erupts. "This cunt! Told you, Del — mouth on him!" Del cracks up. Tiny's mouth twitches. Deal goes through. Micky's still chuckling. "Come back soon, Angelo. You're entertainment, you mouthy prick."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `Joke lands wrong. Very wrong. "What did you say about my brother?" Del's voice is ice. Micky holds up a hand. "Easy, Del. Bad timing, mate. His cousin got bail denied this morning." Looks at you — disappointed. "Deal's off. Out. Now." You're ushered out. Quick.` } },
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
        { id: 'take_job', text: 'Big risk, big reward. In.', odds: 0.40 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 12, inventoryLost: false, message: `Micky clinks your glass. "My man. Knew you had it, you greedy little cunt." Pulls out a burner phone. "Do what I say, when I say it. No questions." Operation runs smooth. Sixty grand vanishes through the port. Micky hands you your cut in a Tesco carrier bag. "Don't spend it all at once. And don't tell Tiny. Tiny gets jealous."` }, failEffects: { cashDelta: -3000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The contact was a setup. Dutch police watching Micky for months. Three unmarked cars light up. "POLICE! HANDEN OP JE HOOFD!" Micky in your ear: "RUN, ANGELO! FUCKING RUN!" You don't make it. Six hours in a Dutch cell. Micky gets away. You get the blame. "You're too fucking slow, you useless cunt," his voice echoes in your head.` } },
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
        { id: 'take_job', text: 'Make the delivery. Micky\'s machete is very present.', odds: 0.50 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 8, inventoryLost: false, message: `The delivery goes smooth. Competitor's happy. Micky's Surinamese guy suddenly finds his manners. "Funny how competition works, innit." Micky grins. "Ten percent off. Permanently. You've earned it." He puts the machete away. Doesn't need it today. But it's there. Always there.` }, failEffects: { cashDelta: -2000, heatDelta: 20, reputationDelta: 0, credibilityDelta: -8, inventoryLost: true, message: `The competitor takes the delivery — then the cash. Then calls Micky's Surinamese guy. Now they're BOTH pissed at Micky. And you're in the middle. Micky's quiet when you get back. "Cheers for that, Angelo. Really helped. Now I've got two suppliers who want to kill me. And you." The machete stays on the table. Just in case.` } },
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
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). Don't argue with a man who has a framed photo of himself.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Pablo counts the cash twice — once with his eyes, once with his fingers. "Smart man, Angelo. Men who pay and don't complain — they live long." He pushes the product across the desk. "The next one will be cheaper. If you survive that long, you cheeky little cunt."` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `You hand over the cash. Pablo smiles — and nods at the door. Two men enter. "Search him," Pablo says, not looking up. "I don't trust Englishmen who pay too easily." They find your backup cash, your phone, your dignity. They leave with everything. Pablo tosses a scratch card at you. "You lose sometimes. That's the game, you nonce."` } },
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
        { id: 'take_double', text: 'Take double. The machete is just for decoration. Probably.', odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: `Pablo smiles. The machete stays on the desk. "Good choice, Angelo. You're going far — if you don't get greedy." The product is pure. The profit is massive. Pablo wraps the machete back on the wall. "For next time. When you're ready for triple." He doesn't look at you when he says it. You're not sure if that's threatening or not. It's definitely threatening.` }, failEffects: { cashDelta: -2000, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The deal is a setup. Two Colombian police in plainclothes burst in — but they're not police. They're Pablo's men wearing fake badges. "Testing you, Angelo." Pablo shakes his head. "You failed. My men say you flinched. I don't do business with men who flinch." The product goes back in the safe. Your cash goes in his pocket. "Come back when you've grown a pair. The machete will be waiting, you spastic."` } },
        { id: 'stick_standard', text: 'Stick to the original amount. The machete is very convincing.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `Pablo shrugs. "Smart. The machete works better than words, eh?" He puts it back on the wall. "Standard deal. Same price. You survive. Maybe next time you try the machete deal." He scratches a lottery ticket. Wins five dollars. Smiles. "Today is a good day, Angelo. Don't ruin it."` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: true, message: `Pablo hands you the product — but it's light. Half the usual. "Supply chain problems," he says, smiling. You can't argue. The machete is watching. "You'll survive on half, Angelo. It'll make you appreciate the full amount next time." Lesson learned: Pablo is not a man you argue with when there's a machete in the room.` } },
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
        { id: 'get_in', text: 'Accept. This is what you came to Colombia for.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 12, inventoryLost: false, message: `Pablo opens a drawer. Inside: a burner phone, a shipping manifest, and a wad of cash. "Welcome to the organisation, Angelo. You work for me now. But in six months — you work for yourself. That's how it works." The pipeline is smooth. The product is pristine. Your earnings triple overnight. Pablo sends you a new photo — this time of both of you, arms around each other. "Remember where you started, you lucky little cunt."` }, failEffects: { cashDelta: -3000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `The shipment is intercepted at the port. Pablo's phone rings — he listens, face darkening. "The police. Someone talked." He looks at you. "Was it you, Angelo?" His hand drifts to the drawer — the one with the gun. "It doesn't matter. The organisation needs a lesson. And you — you're going to be the lesson." His men grab you. They take the cash. The product. Your dignity. You wake up in an alley. Alive. That's the warning. Next time, you won't wake up, you Coon.` } },
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
        { id: 'get_in', text: 'Accept. In for the big score.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Micky slaps the table. "YES! Knew it! Knew you weren't completely fucking useless!" He leans in, voice dropping. "Right. Here's how it works — my people move the product, you move the cash. Simple. Clean. You try anything clever and I'll personally put you in the ground next to my last runner. He tried to stiff me. He's now a canal feature." He pours two glasses. "Welcome aboard, you mad cunt."` }, failEffects: { cashDelta: -3000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `Micky's face hardens. He makes a phone call, listens, hangs up. "They don't trust you, Angelo. And neither do I." He stands — quicker than you expected. "I vouched for you. Made you sound like a proper villain. And you showed up looking like a lost tourist." He shoves a finger in your chest. "Get out of my sight before I forget we're mates. And don't bother coming back till you've got something to prove. If you ever do."` } },
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
        { id: 'accept_hike', text: `Accept the new price (+$${increase}). The portraits are watching.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Mohamed Durrani Allah bows his head — the barest incline. "Wise. My father always said: 'Pay the opium exporter, argue with the viceroy.' You have the instincts of a Durrani, Angelo. High praise." He pushes the product across the cracked table. "One day you will sit in a room like this, surrounded by portraits of yourself. And you will remember who gave you your start. A man who outlasted empires."` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `You hand over the cash. Mohamed Durrani Allah counts it, sniffs, counts it again. "Short by forty dollars." You know it's not. He knows it's not. But the two men in the corner — they don't know it's not. "Leave the difference — and your dignity — on the table." They take your product as collateral. You leave lighter and stupider. "Come back when you can count, you British nonce."` } },
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
        { id: 'take_double', text: "Take double. You're not here to judge his friends.", odds: 0.45 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 12, inventoryLost: false, message: `Mohamed Durrani Allah refills his glass. "Excellent. The Durrani bloodline extends another day." He produces a second bottle — this one sealed. "Real Scotch. Gift from a diplomat who owed me. We can be civilized, Angelo. When the situation calls for it." The product is pure. The profit is enormous. He raises his glass: "To the aristocracy. Dead, but not forgotten."` }, failEffects: { cashDelta: -2000, heatDelta: 25, reputationDelta: 0, credibilityDelta: -10, inventoryLost: true, message: `The Pakistani contact was compromised. Taliban checkpoints on the road. The shipment is seized. Mohamed Durrani Allah's phone rings — he listens, face pale. "They took everything. My product. My money. My dignity." He looks at you — and for a moment, the aristocrat is gone. Just a frightened old man. "You should leave, Angelo. Before they come for me. And whoever is with me." You leave. Fast. You hear shouts behind you in Pashto.` } },
        { id: 'stick_standard', text: 'Stick to the original amount. Traffickers make you nervous.', odds: 0.75 + player.credibility * 0.002, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 2, credibilityDelta: 5, inventoryLost: false, message: `Mohamed Durrani Allah shrugs. "Prudent. My father always said: 'Better one province ruled well than three provinces ruled badly.'" He pauses. "He said that before the communists shot him, of course. But the principle stands." The standard deal goes through. He doesn't offer you the second bottle.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -3, inventoryLost: true, message: `The product is cut. Badly. Baking soda mixed with talcum powder — street-level garbage. Mohamed Durrani Allah inspects it himself. "That Pakistani bastard." He's furious — but it's aimed at himself. "I trusted him. Like I trusted the British. Like I trusted the Soviets. Like I trusted the Americans." He pours the last of the whiskey. "Everyone fucks the Durranis eventually, Angelo. Today it was your turn."` } },
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
        { id: 'get_in', text: 'Accept. The missing portrait haunts you less than poverty.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Mohamed Durrani Allah closes his eyes — relief or prayer, you can't tell. "The Durrani name still means something. I knew it would." He hands you a map, a phone number, and a wad of cash for bribes. "The Taliban commander on this route — he owes my family. From before the war. Before everything." The shipment moves clean. Thirty percent is ten times what you've ever made. When you return, the portrait is back on the wall. "My son shipped it from Dubai. The Durranis endure, Angelo. We always endure."` }, failEffects: { cashDelta: -3000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `The Taliban commander does not remember the favour. Or chooses not to. The checkpoint is a death trap. You escape with your life — barely — but the product stays in the back of a truck that drives away toward a compound you will never find. Mohamed Durrani Allah's phone is dead when you call. The villa is locked. The portrait is still missing. You have been disavowed. Exactly as promised.` } },
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
          { id: 'accept_hike', text: `Accept the new price (+$${increase}). Lena's product is worth it.`, odds: 0.70 + player.credibility * 0.002, successEffects: { cashDelta: -increase, heatDelta: 5, reputationDelta: 0, credibilityDelta: 3, inventoryLost: false, message: `Lena smiles. "Good boy. Most men whine first." She slides the package across velvet and pats your cheek like you're a trained dog. Deal done.` }, failEffects: { cashDelta: -increase, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: true, message: `She takes your cash, then nods once. Two heavies empty your pockets and your backup stash. "Too easy," Lena says. "That was your first mistake."` } },
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
          { id: 'take_job', text: 'Make the delivery. Twenty percent bonus is real money.', odds: 0.50 + player.credibility * 0.003, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 5, credibilityDelta: 8, inventoryLost: false, message: `The clients switch on the spot. Lena calls an hour later, purring down the phone. "Very good, Angelo. You might be useful after all."` }, failEffects: { cashDelta: -2000, heatDelta: 20, reputationDelta: 0, credibilityDelta: -8, inventoryLost: true, message: `The brothers rob you and laugh in your face. Lena hears the report in silence, then says, "I do not keep men who fail twice." Bonus gone. So is her warmth.` } },
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
          { id: 'get_in', text: 'Accept. This is major-league money.', odds: 0.30 + player.credibility * 0.005, successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 8, credibilityDelta: 15, inventoryLost: false, message: `Pipeline opens clean. Your margins explode. Lena texts at 3am: "Welcome to family. Do not embarrass me." That's both a promise and a threat.` }, failEffects: { cashDelta: -3000, heatDelta: 30, reputationDelta: 0, credibilityDelta: -12, inventoryLost: true, message: `The meet gets burned by intelligence. You escape through a service stairwell with nothing but your passport and panic. Lena vanishes from every number you had.` } },
          { id: 'negotiate', text: 'Ask for a bigger cut.', odds: 0.50 + player.credibility * 0.004, successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, credibilityDelta: 8, inventoryLost: false, message: `Lena drums her nails, then nods once. "Twenty-two. Because I like your nerve." Smaller route, safer pace, still serious money.` }, failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 0, credibilityDelta: -5, inventoryLost: false, message: `Her expression hardens. "You push too far." Offer stays at twenty, and she makes sure you feel the demotion instantly.` } },
          { id: 'refuse', text: 'Refuse. FSB attention is not worth it.', odds: 0.80, successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: `Lena raises her glass. "Wise men choose their wars." Folder disappears into a locked drawer. Offer remains open, barely.` }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } },
        ],
      };
    },
  },
];

// ── Encounter context pools keyed by dealerId (buy-phase scene-setting) ──

const ENCOUNTER_CONTEXTS: Record<string, string[]> = {
  col_1: [
    `Basil greets you at the door in a stained silk dressing gown. "So sorry about the mess — the housekeeper's been detained. Restraining order. A misunderstanding." He gestures to a coffee table dusted with white powder.`,
    `You find Basil in a candlelit living room, rehearsing a cheap aftershave commercial into a mirror. "Basil Stillborn of the West End!" He spins. "Ah! Didn't hear you. Come in. Do not look at those polaroids."`,
    `A poorly produced radio jingle blares from a speaker. "Ruedas Rodríguezzz — zzzensational!" Basil grins. "Voiceover work. Pays for the good cocaine. I assume you're here to relieve me of some inventory?"`,
  ],
  col_3: [
    `Eli leads you through the cramped, overwhelming depths of his flat—past towering stacks of Mein Kampf and Lenin volumes. 'The atmosphere here,' he says, gesturing with a theatrical flourish, 'is saturated with Order. You must learn to breathe it in.'`,
    `He points toward a specific grouping of books on state control and history. 'You need to understand the difference between mere existence and purpose, Angelo. I deal in things that have a profound ideological foundation—things like these.'`,
    `The focus is always back towards the dusty central desk, covered with documents and memorabilia. He leans over it, forcing you into his bubble of toxic knowledge: 'This isn't just money; this is the exchange of principles. You must see the structure here.'`,
  ],
  esp_3: [
    `Snake waves you into a private booth at a beachfront club. "The help will bring drinks. Don't touch anything — the upholstery costs more than your life savings." Two men in sunglasses stand by the door. He doesn't introduce them.`,
    `You find Snake on a sun lounger by a private pool, phone in one hand, cigar in the other. "Sit. Not there — that's where my girl sits. There. On the floor. I'm kidding. Relax, you tense little peasant." He doesn't look up from his phone.`,
    `The Bentley idles in a marina parking lot. Snake's in the driver's seat, music thumping. "Get in. Keep your shoes off the leather. This car has standards even if you don't. Product's in the glovebox. Don't get fingerprints on anything."`,
  ],
  esp_2: [
    `Barry leads you into a private booth upholstered in silk and diamonds. "The help will bring drinks. And don't touch anything — it cost more than your entire damn zip code." Two massive bouncers stand by the door like they own the place.`,
    `She waits for you by the pool, draped over a custom chaise lounge, looking completely bored while sipping champagne. "Come closer, sweet thing. You need to understand that this whole vibe — this level of money — is not for people who look like they missed their bus."`,
    `The mega yacht idles in the marina. Barry is leaning against the railing, flashing a massive ring, surveying the city with an air of absolute ownership. "Get closer. I need to make sure your pathetic little presence adds some kind of contrast... because right now, you look like cheap background filler."`,
  ],
};

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
  const contextPool = dealer ? ENCOUNTER_CONTEXTS[dealer.dealerId] : undefined;
  if (contextPool && contextPool.length > 0) {
    event.context = contextPool[Math.floor(Math.random() * contextPool.length)];
  }
  return event;
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
  const { clean, raid } = kingpin.encounterWeights;
  const total = clean + raid;
  const roll = Math.random() * total;

  if (roll < clean) {
    return generateKingpinClean(player, kingpin, goodName, totalValue);
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
