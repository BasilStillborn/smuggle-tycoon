import type { GameState, GameAction, PlayerState, MarketPrice, JournalRunEntry, ChoiceEvent, EventChoice, GamePhase, TravelClass } from './types';
import { createPlayer, deductCash } from './player';
import { COUNTRIES, getCountry } from './world';
import { GOODS } from './goods';
import { generateMarketPrices } from './economy';
import { travel, generateSniffChoices, getTicketCost } from './travel';
import { getUsedCapacity, getRemainingCapacity, getInventoryValue, removeGood, addGood } from './inventory';
import { getHeatLevel } from './heat';
import { createDirector, updateDirector, getDirectorEventChance, getForcedEvent } from './director';
import { generateProceduralEvent, resolveEventChoice } from './events-procedural';
import { generateDealerEncounter, generateSellEncounter, getDealerOptions, p, KINGPIN_POOL, generateKingpinEncounter } from './dealer-encounters';
import { buyAsset, sellAsset, getAsset, getActiveOperationalBenefits } from './assets';
import { startTrip, endTrip as bankEndTrip, checkOverdraft, transferFromBank, transferToBank } from './bank-actions';
import { getChanceCard } from './chance-cards';
import { getSafehouseTier, SAFEHOUSE_ADVANCE_TITLES, SAFEHOUSE_ADVANCE_MSGS, SAFEHOUSE_DEMOTE_TITLES, SAFEHOUSE_DEMOTE_MSGS } from '../ui/visual/SafehouseState';

// ─── Constants ──────────────────────────────────────────────

const ORIGIN_COUNTRY = 'london';

const nullEffects = { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' };

const nullChoice = { odds: 1.0, successEffects: nullEffects, failEffects: nullEffects } as const;

const BEST_LOCATIONS_TEXT: Record<string, string> = {
  cocaine: 'Medellín, Colombia', heroin: 'Kabul, Afghanistan', hashish: 'Amsterdam, Netherlands',
  weed: 'Amsterdam, Netherlands', meth: 'Barcelona, Spain', ecstasy: 'Barcelona, Spain',
};

const BEST_LOCATION_ID: Record<string, string> = {
  cocaine: 'colombia', heroin: 'afghanistan', hashish: 'netherlands',
  weed: 'netherlands', meth: 'spain', ecstasy: 'spain',
};

// ─── Dialogue constants ──────────────────────────────────────

const FAREWELLS: Record<string, string> = {
  col_1: `$name nods once. "Pleasure doing business with you, Angelo. Now fuck off."`,
  col_2: `$name glances at the door. "Right. Get out before you draw attention to us, you spastic."`,
  col_3: `$name opens $pron laptop without looking up. "The door is behind you, Angelo. Don't come back without more cash."`,
  net_1: `$name gives you a lazy wave. "Nice one bruv. Say nothing to no one, yeah?"`,
  net_2: `$name taps $pron phone. "Transaction complete. Delete this conversation, you nonce."`,
  net_3: `$name looks genuinely pleased. "Oh wow, that was great, Angelo! Come back anytime. I'll probably be here. Unless I'm at the park, you Blacky."`,
  esp_1: `$name embraces you like a brother. "Angelo! Go with God. And the product. Mostly the product, you brilliant little cunt."`,
  esp_2: `$name lights a cigarette. "Business concluded. Now get out of my bar before someone recognises you, you fucking spastic."`,
  esp_3: `$name fumbles with a drawer. "¡Adiós, Angelo! I had a loyalty card for you but I think I lost it. Come back anyway, you Coon!"`,
  afg_1: `$name sets down $pron tea. "Go in peace, Angelo. The road to the airport is dangerous after dark. You would do well to hurry, you strange little nonce."`,
  afg_2: `$name stares at you with unblinking intensity. "We are done here. If you speak of this meeting, I will know. Now go, you cheeky Blacky."`,
  afg_3: `From behind you, barely audible: "Yeah. Keep walking, retard. See you next time." $name has already turned away.`,
};

const HAGGLE_WIN: Record<string, string> = {
  col_1: `$name inclines his head — the barest fraction. "Angelo. You have nerve. I respect nerve." He pauses. "Fifteen percent off. Because I like you. That is the only reason, you clever little cunt."`,
  col_2: `$name wipes sweat from his forehead. "Okay, okay, Angelo. You drive a hard bargain. Fifteen off. But if anyone asks, I charged you full price, you spastic." He looks around nervously.`,
  col_3: `$name studies you for a long moment. Then she closes her laptop. "Twenty percent off, Angelo. And don't expect it again, you cheeky little cunt."`,
  net_1: `$name laughs and passes you the joint. "Angelo, my man. You're all right. Here, take the discount. Call it a friendship discount, you handsome bastard."`,
  net_2: `$name looks at you over her glasses. Then she almost smiles. "Fifteen percent off, Angelo. You've earned it. Don't make me regret it, you spastic."`,
  net_3: `$name blinks. "Oh, wow. Yeah, man, Angelo, of course. I can totally do a discount. What were we talking about again, you absolute Coon?" He knocks fifteen percent off without even realising it.`,
  esp_1: `$name spreads his arms wide. "Angelo! Brother! You are a businessman after my own heart. Fifteen off. We do this again, yeah, you brilliant little cunt?"`,
  esp_2: `$name snorts. "Alright, Angelo. You've got more spine than most of the cunts who sit in that chair. Fifteen percent off. Don't push your luck, you fucking spastic."`,
  esp_3: `$name pumps his fist. "YES! I knew negotiating was the right move, Angelo! Oh, uh — I mean. Fifteen off. Very professional. Very serious." He tries to look cool. It doesn't work, the little Blacky.`,
  afg_1: `$name is silent for a long moment. Then — the barest hint of amusement. "You honour me with your persistence, Angelo. The discount is yours. Sit. Have more tea, you clever little cunt."`,
  afg_2: `$name stares at you. Then he laughs — a short, hard sound. "Angelo. You fight like a Pashtun. I respect that." He knocks twenty percent off. "Do not expect this again, you mad Coon."`,
  afg_3: `$name doesn't react. Then she pushes the steel table slightly. "Fifteen percent, Angelo. Because I'm curious what you'll do with it, you strange little nonce."`,
};

const HAGGLE_LOSE: Record<string, string> = {
  col_1: `$name doesn't blink. "I don't negotiate, Angelo. The price is the price. Now it's twenty percent higher for wasting my time. Take it or leave it, you little cunt."`,
  col_2: `$name's face twists. "Angelo. You come to MY city, in MY bar, and try to mug ME off? The price just went up twenty percent, you cheeky little cunt. Take it or piss off."`,
  col_3: `$name closes her laptop with a sharp click. "I don't have time for amateurs who think they can haggle with me, Angelo. The price is now twenty percent higher. Accept it, you fucking retard, or get out."`,
  net_1: `$name frowns. "Not cool, Angelo. Not cool at all. The price just went up. This isn't a market stall, this is a business. Professional. We had a good thing going here, you spastic."`,
  net_2: `$name's expression doesn't change, but the temperature in the room drops. "You're wasting my time, Angelo. The price just went up twenty percent. I have a conference call in six minutes. Decide, you nonce."`,
  net_3: `$name's expression hardens. "Wait, what? No, no, no, Angelo. That was the friend price. Now it's the... not-friend price. Which is higher, you absolute Blacky." He tries to look stern. It almost works.`,
  esp_1: `$name looks genuinely hurt. "Angelo... I thought we had something here, brother. Now the price goes up. Fifteen percent. Because you broke my heart a little, you little cunt."`,
  esp_2: `$name laughs — a dry, humourless sound. "Ballsy. Stupid, but ballsy, Angelo. The price just went up twenty percent. You can pay it or you can fuck off back to whatever rock you crawled out from under, you spastic."`,
  esp_3: `$name looks crushed. "Oh. Oh, no, Angelo. I was really hoping you'd just... accept it? I'm not very good at the 'price just went up' thing. But — it did. It went up, you Blacky. I read about this in a business book."`,
  afg_1: `$name sets down his tea. Slowly. Deliberately. "You try to bargain with an elder in his own home, Angelo. The price is now thirty percent higher. Pay it, or leave my compound, you disrespectful nonce."`,
  afg_2: `$name leans forward. "Angelo. I have killed men for less disrespect than you just showed me. The price is twenty percent higher. If you argue again, it goes up another twenty, you Blacky. And my patience is not infinite."`,
  afg_3: `$name says nothing for five full seconds. Then: "Disappointing, Angelo." One word. It lands like a hammer. "Twenty percent more. Accept or go, you strange little retard."`,
};

const WALK_AWAYS: Record<string, string> = {
  col_1: `You stand. Angelo. $name doesn't move. "Pity." One word. Cold as the finca stones.`,
  col_2: `$name looks almost relieved. "Yeah. Yeah, okay, Angelo. Maybe next time. When I'm less... you know." He gestures vaguely at everything.`,
  col_3: `$name doesn't look up from her laptop. "Door's behind you, Angelo." She's already typing.`,
  net_1: `$name gives you a lazy wave. "No worries, Angelo. The canal's nice this time of year. Enjoy your walk, you spastic."`,
  net_2: `$name picks up her phone. "Security will show you out, Angelo. I have a call." You were never really there.`,
  net_3: `$name looks confused. "Oh. Right. Yeah, sure, Angelo. Come back anytime! I'll probably be here. Unless I'm at the park, you fucking retard."`,
  esp_1: `$name clutches his chest dramatically. "Angelo! Brother! You wound me! But okay — I respect the decision. Come back when you're ready to party, you little cunt."`,
  esp_2: `$name shrugs. "Your loss, Angelo. I was looking forward to doing business. Now get out of my bar, you nonce."`,
  esp_3: `$name deflates. "Oh. Okay, Angelo. That's fine. Totally fine. I wasn't... emotionally invested or anything, you fucking retard." He was emotionally invested.`,
  afg_1: `$name inclines his head. "Go in peace, Angelo. The road to Kandahar is dangerous at night."`,
  afg_2: `$name snorts. "Go, Angelo. Before I change my mind about letting you leave, you cheeky little cunt."`,
  afg_3: `You turn. From behind you, Angelo, barely audible: "Yeah. Keep walking, retard." The voice is so quiet you almost imagine it.`,
};

// ─── Phase guard ─────────────────────────────────────────────

const PHASE_ACTIONS: Record<GamePhase, string[]> = {
  home: ['START_TRIP', 'SELECT_PRODUCT', 'CONFIRM_FLIGHT', 'TRAVEL', 'TRANSFER_FROM_BANK', 'TRANSFER_TO_BANK', 'STASH_GOODS', 'RETRIEVE_GOODS', 'VIEW_MARKET', 'VIEW_INVENTORY', 'WAIT', 'END_RUN', 'END_TRIP', 'BUY_ASSET', 'SELL_ASSET', 'SAVE', 'LOAD', 'RESPOND_EVENT', 'CANCEL_AIRPORT', 'SAFEHOUSE_TIER_CHANGE'],
  selling: ['SELECT_PRODUCT', 'CONFIRM_FLIGHT', 'CONTACT_KINGPIN', 'MEET_KINGPIN', 'SELL', 'STASH_GOODS', 'RETRIEVE_GOODS', 'TRANSFER_FROM_BANK', 'TRANSFER_TO_BANK', 'VIEW_MARKET', 'VIEW_INVENTORY', 'WAIT', 'END_RUN', 'END_TRIP', 'BUY_ASSET', 'SELL_ASSET', 'SAVE', 'LOAD', 'RESPOND_EVENT', 'CANCEL_AIRPORT', 'SAFEHOUSE_TIER_CHANGE'],
  buying: ['BUY', 'TRAVEL', 'FLY_HOME', 'RESPOND_EVENT'],
  selecting_dealer: ['SELECT_DEALER', 'FLY_HOME', 'RESPOND_EVENT'],
  arrived: ['AFTER_CUSTOMS', 'RESPOND_EVENT', 'TRAVEL'],
  flying_out: ['TRAVEL', 'RESPOND_EVENT'],
  flying_back: ['RESPOND_EVENT'],
  returned: ['RESPOND_EVENT', 'STASH_GOODS', 'RETRIEVE_GOODS'],
};

function isActionAllowed(phase: GamePhase, actionType: string): boolean {
  return PHASE_ACTIONS[phase]?.includes(actionType) ?? false;
}

// ─── Helpers ─────────────────────────────────────────────────

export function createGameState(): GameState {
  const player = createPlayer();
  const director = createDirector();
  const country = getCountry(player.currentCountryId)!;
  const marketPrices = generateMarketPrices(country, director, 0, player.heat);

  return {
    player, world: COUNTRIES, goods: GOODS, director, turn: 0,
    currentMarketPrices: marketPrices,
    lastEventMessage: 'Angelo. The network is waiting for you.',
    gameLog: [], pendingEvent: null, travelSniff: null,
    pendingSell: null, pendingBuy: null, pendingFlight: null,
    headingToAirport: false, selectedProductId: null, gamePhase: 'home',
    selectedDealer: null, selectedKingpin: null,
    dealerRapport: {}, marketMemory: {}, journalEntries: [],
    securitySniffsPassed: 0, buyDealsCompleted: 0, sellDealsCompleted: 0,
    firstRunTutorialShown: false, safehouseTier: 1,
  };
}

function getNetWorth(player: PlayerState, _marketPrices?: any): number {
  return player.bank + player.cash;
}

function getBuyInfo(state: GameState) {
  const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
  const mktPrice = state.currentMarketPrices.find(p => p.goodId === state.selectedProductId);
  const dealer = state.selectedDealer;
  const buyPrice = mktPrice ? Math.floor(mktPrice.buyPrice * (1 + (dealer ? dealer.priceModifier - 1 : 0) * 0.5)) : 100;
  const unit = selectedGood?.unitOfMeasure ?? 'x';
  const defQty = selectedGood?.standardDealSize ?? 10;
  const totalCost = buyPrice * defQty;
  const maxQty = Math.max(1, Math.floor((state.player.cash - 500) / buyPrice));
  return { selectedGood, mktPrice, dealer, buyPrice, unit, defQty, totalCost, maxQty };
}

function createDealerIntro(state: GameState, title?: string): ChoiceEvent {
  const { dealer, buyPrice, unit, defQty, totalCost, selectedGood } = getBuyInfo(state);
  return {
    id: 'dealer_intro_' + Date.now().toString(36),
    title: title ?? `Meeting ${dealer?.name}`,
    context: `${dealer?.name} is waiting for you at ${dealer?.location}.\n\n${selectedGood?.name ?? 'product'}: $${buyPrice}/${unit}\nCash on hand: $${state.player.cash.toLocaleString()}\n\n⚠ Keep at least $500 spare for customs on the way home.`,
    choices: [
      { id: 'qty_2', text: `2 ${unit}s — $${(buyPrice * 2).toLocaleString()}`, ...nullChoice },
      { id: `qty_${defQty}`, text: `${defQty} ${unit}s — $${totalCost.toLocaleString()}`, ...nullChoice },
      { id: 'custom_qty', text: 'Custom amount...', ...nullChoice },
      { id: 'back_out', text: 'Something\'s off — walk away', ...nullChoice },
    ],
  };
}

function createCustomQtyEvent(state: GameState): ChoiceEvent {
  const { dealer, selectedGood, buyPrice, unit, maxQty } = getBuyInfo(state);
  const event: ChoiceEvent = {
    id: 'custom_qty_' + Date.now().toString(36),
    title: 'Custom Amount',
    context: `${dealer?.name ?? 'Dealer'}: "${selectedGood?.name ?? 'product'} — $${buyPrice}/${unit}. How many, Angelo?"`,
    choices: [
      { id: 'confirm', text: '', ...nullChoice },
      { id: 'cancel', text: 'Cancel — go back', ...nullChoice },
    ],
  };
  (event as any)._buyPrice = buyPrice;
  (event as any)._maxQty = maxQty;
  (event as any)._unit = unit;
  (event as any)._goodName = selectedGood?.name ?? 'product';
  return event;
}

function warnEvent(title: string, context: string): ChoiceEvent {
  return { id: 'kingpin_warn_' + Date.now().toString(36), title, context, choices: [{ id: 'understood', text: 'Understood', ...nullChoice }] };
}

function withTurn(state: GameState, message: string): GameState {
  return { ...state, turn: state.turn + 1, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
}

function withDirector(state: GameState, player: PlayerState): GameState {
  return { ...state, director: updateDirector(state.director, player, state) };
}

function updatePeakNetWorth(player: PlayerState, marketPrices: MarketPrice[]): PlayerState {
  const nw = getNetWorth(player, marketPrices);
  return nw > player.peakNetWorth ? { ...player, peakNetWorth: nw } : player;
}

function journalEntry(state: GameState, entry: JournalRunEntry): GameState {
  return { ...state, journalEntries: [...state.journalEntries, entry] };
}

function getRecentTradeVolume(state: GameState): number {
  return state.marketMemory[state.player.currentCountryId]?.recentTradeVolume ?? 0;
}

function updateMarketMemory(state: GameState, volumeIncrease: number): GameState {
  const countryId = state.player.currentCountryId;
  const existing = state.marketMemory[countryId];
  return { ...state, marketMemory: { ...state.marketMemory, [countryId]: { countryId, recentTradeVolume: (existing?.recentTradeVolume ?? 0) + volumeIncrease, lastVisitedTurn: state.turn } } };
}

function tryTriggerProceduralEvent(state: GameState): GameState {
  if (state.pendingEvent) return state;
  const forcedReason = getForcedEvent(state.director, state.player);
  let eventChance = forcedReason ? 1.0 : getDirectorEventChance(state.director);
  if (Math.random() >= eventChance) return state;
  const event = generateProceduralEvent(state.player, state.director);
  return { ...state, pendingEvent: event, lastEventMessage: `EVENT: $${event.title}`, gameLog: [...state.gameLog, `[Turn $${state.turn}] EVENT: ${event.title}`], director: { ...state.director, timeSinceLastEvent: 0, eventCooldown: 3 } };
}

function handleOverdraft(player: PlayerState): PlayerState {
  if (checkOverdraft(player)) return { ...player, runActive: false };
  return player;
}

function generateSummaryEvent(title: string, context: string, hasGoods: boolean): ChoiceEvent {
  const choices = [
    { id: 'buy_more', text: 'Arrange Another Deal', ...nullChoice },
  ];
  if (hasGoods) {
    (choices as any[]).unshift({ id: 'continue', text: 'Proceed to Airport', ...nullChoice });
  }
  return { id: 'summary_' + Date.now().toString(36), title, context, choices: choices as any };
}

// ─── RESPOND_EVENT Handlers ──────────────────────────────────

function handleChanceCard(state: GameState): GameState {
  const ce = state.pendingEvent!.choices[0].successEffects;
  let u = { ...state.player };
  if (ce.cashDelta !== 0) u.cash = Math.max(-1000, u.cash + ce.cashDelta);
  if (ce.heatDelta) u.heat = Math.min(100, Math.max(0, u.heat + ce.heatDelta));
  if (ce.reputationDelta) u.reputation = Math.min(100, Math.max(0, u.reputation + ce.reputationDelta));
  if (ce.credibilityDelta) u.credibility = Math.min(100, Math.max(0, u.credibility + ce.credibilityDelta));
  return { ...state, player: u, pendingEvent: null, lastEventMessage: ce.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${ce.message}`] };
}

function handleTutorial(state: GameState): GameState {
  return { ...state, pendingEvent: null, firstRunTutorialShown: true, lastEventMessage: 'Now build your stash. Book another flight.' };
}

function handleNoCash(state: GameState): GameState {
  return { ...state, pendingEvent: null, lastEventMessage: 'Go to your bank and withdraw more cash.' };
}

function handleEndTripWarn(state: GameState): GameState {
  return { ...state, pendingEvent: null, lastEventMessage: 'Resolve the issue before booking another flight.' };
}

function handleKingpinWarn(state: GameState): GameState {
  return { ...state, pendingEvent: null, lastEventMessage: 'Stash more product and try again.' };
}

function handleConfirmFlight(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'go_back') {
    return { ...state, pendingEvent: null, pendingFlight: null, lastEventMessage: 'Flight cancelled.' };
  }
  const { toCountryId, travelClass } = state.pendingFlight!;
  const firstTimeBigCash = state.player.cash >= 20000 && state.player.peakNetWorth < 20000;
  if (firstTimeBigCash) {
    const bigTimeEvent: ChoiceEvent = {
      id: 'bigtime_' + Date.now().toString(36),
      title: 'You Have Entered the Big Leagues',
      context: [`You have purchased a ticket with $${state.player.cash.toLocaleString()} in your pocket.`, `Carrying $20,000 or more in cash changes your status. From now on, outbound flights will trigger customs checks. Security will be more suspicious. Dogs may circle your luggage. Officers may pull you aside.`, `You will need to talk your way through, bribe your way through, or get lucky. The days of walking straight through security are over.`, `This is the price of doing serious business. Welcome to the big leagues, Angelo.`].join('\n\n'),
      choices: [
        { id: 'continue', text: 'Proceed to the airport', ...nullChoice },
        { id: 'return_home', text: 'Return home — you are not ready', ...nullChoice },
      ],
    };
    return { ...state, pendingEvent: bigTimeEvent, pendingFlight: { toCountryId, travelClass }, lastEventMessage: 'You are now carrying $20,000+. Security will be tighter.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Big time threshold reached.`] };
  }
  return doTravel({ ...state, pendingEvent: null, pendingFlight: null }, toCountryId, travelClass);
}

function handleBigTime(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'return_home') {
    return { ...state, pendingEvent: null, pendingFlight: null, lastEventMessage: 'You decided to postpone the trip. Your cash is safe in your pocket.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Big time trip postponed.`] };
  }
  const { toCountryId, travelClass } = state.pendingFlight!;
  return doTravel({ ...state, pendingEvent: null, pendingFlight: null }, toCountryId, travelClass);
}

function handleSummary(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'fly_home') {
    const hasGoods = state.player.inventory.length > 0;
    if (hasGoods) {
      const travelClass = state.pendingFlight?.travelClass ?? 'economy';
      return doTravel({ ...state, gamePhase: 'flying_out', pendingEvent: null, pendingBuy: null }, ORIGIN_COUNTRY, travelClass);
    }
    let u = { ...state.player, currentCountryId: ORIGIN_COUNTRY };
    return { ...state, player: u, gamePhase: 'home', pendingEvent: null, lastEventMessage: 'Back in London.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Returned home.`] };
  }
  if (action.choiceId === 'buy_more') {
    if (!state.selectedDealer) return { ...state, pendingEvent: null, lastEventMessage: 'No dealer selected.' };
    return { ...state, pendingEvent: createDealerIntro(state), lastEventMessage: 'Back to the deal.' };
  }
  const isProceed = action.choiceId === 'continue';
  return { ...state, pendingEvent: null, headingToAirport: isProceed ? true : state.headingToAirport, lastEventMessage: isProceed ? 'Choose your destination.' : '' };
}

function handleTravelSniff(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const choice = state.pendingEvent!.choices.find(c => c.id === action.choiceId);
  if (!choice) return state;
  const isAbort = action.choiceId === 'abort';
  const beginnerMode = state.securitySniffsPassed < 3;
  const roll = Math.random();
  const success = (!isAbort && beginnerMode) ? true : (roll < choice.odds);
  const effects = success ? choice.successEffects : choice.failEffects;
  if (effects.cashDelta === 0 && effects.heatDelta === 0 && effects.reputationDelta === 0 && effects.credibilityDelta === 0 && !effects.inventoryLost && effects.message === '') {
    return { ...state, pendingEvent: null, travelSniff: null, lastEventMessage: 'You walk away.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Aborted at checkpoint.`] };
  }
  let updatedPlayer = { ...state.player };
  updatedPlayer = deductCash(updatedPlayer, Math.abs(effects.cashDelta));
  if (effects.heatDelta) updatedPlayer.heat = Math.min(100, Math.max(0, updatedPlayer.heat + effects.heatDelta));
  if (effects.credibilityDelta) updatedPlayer.credibility = Math.min(100, Math.max(0, updatedPlayer.credibility + effects.credibilityDelta));
  const lostAllCash = effects.inventoryLost ? updatedPlayer.cash : 0;
  const busted = !success && effects.inventoryLost;
  if (effects.inventoryLost) updatedPlayer = { ...updatedPlayer, inventory: [], cash: Math.max(0, updatedPlayer.cash) };
  const sniffToCountry = (!busted && choice.id !== 'abort') ? getCountry(state.travelSniff!.toCountryId) : null;
  if (sniffToCountry) updatedPlayer.currentCountryId = state.travelSniff!.toCountryId;
  updatedPlayer = handleOverdraft(updatedPlayer);
  const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
  const message = `[${outcomeLabel}] ${effects.message}`;
  if (busted) {
    const bustVariants = ['They slam you face-first onto the counter.', 'Two officers drag you into a windowless room.', 'The dog handler grins as the sniffer sits by your bag.', 'They march you through the terminal in full view.', 'The customs officer reads from a screen.'];
    const bustContext = bustVariants[Math.floor(Math.random() * bustVariants.length)];
    const summaryEvent = generateSummaryEvent('BUSTED', `BUSTED. Taken to police cells.\n\n${bustContext}\n\nLost: ALL cash ($${lostAllCash.toLocaleString()} confiscated)`, false);
    let s = withDirector(withTurn({ ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: summaryEvent, travelSniff: null, lastEventMessage: '' }, message), updatedPlayer);
    if (!s.player.runActive) return { ...s, lastEventMessage: 'Debt exceeds $1,000. Game over.' };
    return s;
  }
  if (sniffToCountry) {
    const sniffArrivalLines = [`You pass through ${sniffToCountry.city} airport after the checkpoint. Your documents are in order.`, `You collect your belongings and head towards the exit. Welcome to ${sniffToCountry.city}.`];
    const arrivalEvent: ChoiceEvent = { id: 'arrival_' + Date.now().toString(36), title: `Customs Clearance — ${sniffToCountry.name}`, context: sniffArrivalLines.join('\n\n'), choices: [{ id: 'proceed_arrival', text: 'Continue', ...nullChoice }] };
    let s = withTurn({ ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: arrivalEvent, travelSniff: null, gamePhase: 'arrived', lastEventMessage: '' }, message);
    s = { ...s, currentMarketPrices: generateMarketPrices(sniffToCountry, state.director, 0, updatedPlayer.heat), securitySniffsPassed: success ? state.securitySniffsPassed + 1 : state.securitySniffsPassed };
    return withDirector(s, updatedPlayer);
  }
  return withDirector(withTurn({ ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: null, travelSniff: null, lastEventMessage: message }, message), updatedPlayer);
}

function handleArrival(state: GameState): GameState {
  if (state.player.currentCountryId === ORIGIN_COUNTRY) {
    return { ...state, gamePhase: 'selling', pendingEvent: null, lastEventMessage: 'Welcome back to London. Stash goods or meet the kingpin.' };
  }
  const country = getCountry(state.player.currentCountryId);
  if (!country) return state;
  const options = getDealerOptions(country.id, state.dealerRapport);
  const dealerLines = options.map((opt) => `[${opt.profile.name}] — ${opt.profile.description}\n  ${opt.profile.location}`);
  const dealerEvent: ChoiceEvent = {
    id: 'dealer_select_' + Date.now().toString(36),
    title: `Choose Your Contact — ${country.city}`,
    context: `You need a supplier. Who do you want to meet?\n\n${dealerLines.join('\n\n')}`,
    choices: options.map(opt => ({ id: opt.profile.dealerId, text: `${opt.profile.name} — ${opt.profile.location}`, ...nullChoice })),
  };
  return { ...state, gamePhase: 'selecting_dealer', pendingEvent: dealerEvent, lastEventMessage: 'Choose your supplier.' };
}

function handleDealerSelect(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const country = getCountry(state.player.currentCountryId);
  if (!country) return state;
  const options = getDealerOptions(country.id, state.dealerRapport);
  const selected = options.find(o => o.profile.dealerId === action.choiceId);
  if (!selected) return { ...state, lastEventMessage: 'Invalid selection.' };
  const withDealer = { ...state, gamePhase: 'buying' as const, selectedDealer: selected.profile };
  return { ...withDealer, pendingEvent: createDealerIntro(withDealer), lastEventMessage: `Meeting ${selected.profile.name}...` };
}

function handleDealerIntroOrCustomQty(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'cancel') {
    return { ...state, pendingEvent: createDealerIntro(state), lastEventMessage: 'Back to the deal.' };
  }
  if (action.choiceId === 'back_out') {
    const dealer = state.selectedDealer;
    const walkLine = (WALK_AWAYS[dealer?.dealerId ?? ''] ?? 'You walked away from the deal. Choose another contact or fly home.').replace('$name', dealer?.name ?? '');
    return { ...state, gamePhase: 'selecting_dealer', selectedDealer: null, pendingEvent: null, lastEventMessage: walkLine };
  }
  if (action.choiceId === 'negotiate') {
    return handleNegotiate(state);
  }
  if (action.choiceId === 'custom_qty') {
    return { ...state, pendingEvent: createCustomQtyEvent(state), lastEventMessage: 'Choose your amount.' };
  }
  if (action.choiceId.startsWith('qty_')) {
    const qty = parseInt(action.choiceId.replace('qty_', ''), 10);
    if (isNaN(qty) || qty <= 0) return { ...state, lastEventMessage: 'Invalid quantity.' };
    const cleanState = { ...state, pendingEvent: null };
    return gameReducer(cleanState, { type: 'BUY', goodId: state.selectedProductId!, quantity: qty });
  }
  return state;
}

function handleNegotiate(state: GameState): GameState {
  const dealer = state.selectedDealer;
  const rapport = state.dealerRapport[dealer?.dealerId ?? ''] ?? 0;
  const pr = dealer ? p(dealer) : p({ gender: 'male' });
  const haggleSuccessChance = 0.3 + rapport * 0.15;
  const roll = Math.random();
  if (roll < haggleSuccessChance) {
    const winText = (HAGGLE_WIN[dealer?.dealerId ?? ''] ?? `${dealer?.name} grins. "You drive a hard bargain. Fine — I'll knock 20% off. But you owe me a favour next time."\n\nThe price drops. ${pr.He} seems to respect the negotiation.`).replace('$name', dealer?.name ?? 'Dealer');
    const negotiateEvent: ChoiceEvent = {
      id: 'haggle_win_' + Date.now().toString(36), title: 'Deal Sweetened', context: winText,
      choices: [{ id: 'accept_deal', text: 'Take the discounted deal', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 3, credibilityDelta: 5, message: '' }, failEffects: nullEffects }],
    };
    return { ...state, pendingEvent: negotiateEvent, lastEventMessage: 'Haggle successful — price lowered.' };
  }
  const loseText = (HAGGLE_LOSE[dealer?.dealerId ?? ''] ?? `${dealer?.name}'s expression hardens. "You think I run a fucking charity? The price just went up 15%. Take it or leave it."`).replace('$name', dealer?.name ?? 'Dealer');
  const negotiateFail: ChoiceEvent = {
    id: 'haggle_lose_' + Date.now().toString(36), title: 'Dealer Offended', context: loseText,
    choices: [
      { id: 'accept_deal', text: 'Accept the higher price', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: -2, credibilityDelta: -3, message: '' }, failEffects: nullEffects },
      { id: 'back_out', text: 'Walk away — this deal is dead', ...nullChoice },
    ],
  };
  return { ...state, pendingEvent: negotiateFail, lastEventMessage: 'Haggle failed — price increased.' };
}

function handleHaggleWin(state: GameState, _action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const boosted = { ...state.player, reputation: Math.min(100, state.player.reputation + 3), credibility: Math.min(100, state.player.credibility + 5) };
  const goodDef = state.goods.find(g => g.id === state.selectedProductId);
  const defQty = goodDef?.standardDealSize ?? 10;
  return gameReducer({ ...state, player: boosted, pendingEvent: null }, { type: 'BUY', goodId: state.selectedProductId!, quantity: defQty });
}

function handleHaggleLose(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (action.choiceId === 'back_out') {
    const dealer = state.selectedDealer;
    const pr = dealer ? p(dealer) : p({ gender: 'male' });
    return { ...state, gamePhase: 'selecting_dealer', selectedDealer: null, pendingEvent: null, lastEventMessage: `You walked away. ${dealer?.name} mutters something under ${pr.his} breath.` };
  }
  let penalised = { ...state.player, reputation: Math.max(0, state.player.reputation - 2), credibility: Math.max(0, state.player.credibility - 3) };
  const goodDef = state.goods.find(g => g.id === state.selectedProductId);
  const defQty = goodDef?.standardDealSize ?? 10;
  return gameReducer({ ...state, player: penalised, pendingEvent: null }, { type: 'BUY', goodId: state.selectedProductId!, quantity: defQty });
}

function handleBuyEncounter(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const choice = state.pendingEvent!.choices.find(c => c.id === action.choiceId);
  if (!choice) return state;
  const beginnerMode = state.buyDealsCompleted < 3;
  const roll = Math.random();
  const success = beginnerMode ? true : (roll < choice.odds);
  const effects = success ? choice.successEffects : choice.failEffects;
  let updatedPlayer = { ...state.player };
  if (effects.cashDelta !== 0) {
    if (effects.cashDelta < 0) updatedPlayer.cash = Math.max(-1000, updatedPlayer.cash - Math.abs(effects.cashDelta));
    else updatedPlayer.cash += effects.cashDelta;
  }
  if (effects.heatDelta) updatedPlayer.heat = Math.min(100, Math.max(0, updatedPlayer.heat + effects.heatDelta));
  if (effects.credibilityDelta) updatedPlayer.credibility = Math.min(100, Math.max(0, updatedPlayer.credibility + effects.credibilityDelta));
  if (effects.inventoryLost) updatedPlayer = { ...updatedPlayer, inventory: [] };

  let buySummaryMsg: string | null = null;
  let s = { ...state };
  if (s.pendingBuy) {
    if (success) {
      updatedPlayer = deductCash(updatedPlayer, s.pendingBuy.totalCost);
      updatedPlayer = addGood(updatedPlayer, s.pendingBuy.goodId, s.pendingBuy.quantity);
      const goodDef = s.goods.find(g => g.id === s.pendingBuy!.goodId);
      buySummaryMsg = `BOUGHT ${s.pendingBuy.quantity} ${goodDef?.unitOfMeasure ?? 'unit'}${s.pendingBuy.quantity > 1 ? 's' : ''} of ${goodDef?.name ?? 'product'} FOR $${s.pendingBuy.totalCost.toLocaleString()}.`;
      const dealerId = s.selectedDealer?.dealerId;
      if (dealerId) {
        const current = s.dealerRapport[dealerId] ?? 0;
        s = { ...s, dealerRapport: { ...s.dealerRapport, [dealerId]: current + 1 } };
      }
    } else {
      buySummaryMsg = 'The deal fell through.';
    }
    s = { ...s, pendingBuy: null };
  }

  updatedPlayer = handleOverdraft(updatedPlayer);
  const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
  const messageText = effects.message ? `[${outcomeLabel}] ${effects.message}` : '';

  const hasGoods = updatedPlayer.inventory.length > 0;
  const flyLines = [messageText];
  if (buySummaryMsg) flyLines.push(buySummaryMsg);
  if (success && s.selectedDealer) {
    const farewellLine = FAREWELLS[s.selectedDealer.dealerId]
      ?.replace('$name', s.selectedDealer.name)
      ?.replace('$pron', p(s.selectedDealer).his);
    if (farewellLine) flyLines.push(farewellLine);
  }
  flyLines.push(`Remaining Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`);
  const flyChoices: ChoiceEvent = {
    id: 'summary_' + Date.now().toString(36),
    title: buySummaryMsg ? (success ? 'Deal Successful' : 'Deal Failed') : 'Deal Failed',
    context: flyLines.join('\n\n'),
    choices: [
      { id: 'fly_home', text: hasGoods ? 'Fly home with product' : 'Fly home empty-handed', ...nullChoice },
      ...(hasGoods ? [{ id: 'buy_more', text: 'Try to buy more', ...nullChoice }] : []),
    ],
  };
  return withDirector(withTurn({ ...s, player: updatePeakNetWorth(updatedPlayer, s.currentMarketPrices), pendingEvent: flyChoices, lastEventMessage: '' }, messageText), updatedPlayer);
}

function handleSellEncounter(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const choice = state.pendingEvent!.choices.find(c => c.id === action.choiceId);
  if (!choice) return state;
  const beginnerMode = state.sellDealsCompleted < 3;
  const roll = Math.random();
  const success = beginnerMode ? true : (roll < choice.odds);
  const effects = success ? choice.successEffects : choice.failEffects;
  let updatedPlayer = { ...state.player };
  if (effects.cashDelta !== 0) {
    if (effects.cashDelta < 0) updatedPlayer.cash = Math.max(-1000, updatedPlayer.cash - Math.abs(effects.cashDelta));
    else updatedPlayer.cash += effects.cashDelta;
  }
  if (effects.heatDelta) updatedPlayer.heat = Math.min(100, Math.max(0, updatedPlayer.heat + effects.heatDelta));
  if (effects.credibilityDelta) updatedPlayer.credibility = Math.min(100, Math.max(0, updatedPlayer.credibility + effects.credibilityDelta));
  if (effects.inventoryLost) {
    if (success) updatedPlayer.cash += state.pendingSell!.baseSellPrice * state.pendingSell!.quantity;
    updatedPlayer = removeGood(updatedPlayer, state.pendingSell!.goodId, state.pendingSell!.quantity);
  }
  updatedPlayer = handleOverdraft(updatedPlayer);
  const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
  const messageText = effects.message ? `[${outcomeLabel}] ${effects.message}` : '';
  const revenue = success && effects.inventoryLost ? state.pendingSell!.baseSellPrice * state.pendingSell!.quantity : 0;
  const sellLines = success
    ? [messageText, `SOLD $${state.pendingSell!.quantity} units FOR $${revenue.toLocaleString()}.`, `Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`, '', 'The deal is done. You head back to your safehouse.']
    : [messageText, 'The deal failed. No payment received.', `Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`, '', 'You slink back to your safehouse empty-handed.'];
  const sellSummary: ChoiceEvent = {
    id: 'summary_' + Date.now().toString(36), title: success ? 'Deal Successful' : 'Deal Failed', context: sellLines.join('\n\n'),
    choices: [{ id: 'continue', text: 'Continue', ...nullChoice }],
  };
  return withDirector(withTurn({ ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: sellSummary, pendingSell: null, lastEventMessage: '' }, messageText), updatedPlayer);
}

function handleFallbackEvent(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  const { player, message } = resolveEventChoice(state.player, state.pendingEvent!, action.choiceId);
  const playerWithPeak = updatePeakNetWorth(player, state.currentMarketPrices);
  const nw = getNetWorth(playerWithPeak, state.currentMarketPrices);
  const updated = handleOverdraft(playerWithPeak);
  let s = journalEntry(withTurn({ ...state, player: updated, pendingEvent: null, lastEventMessage: message }, message), { turn: state.turn + 1, type: 'event', title: `Event: $${state.pendingEvent!.title}`, description: message, cash: updated.cash, netWorth: nw, heat: updated.heat, reputation: updated.reputation });
  if (!s.player.runActive) return { ...s, lastEventMessage: 'Debt exceeds $1,000. Game over.' };
  return withDirector(s, updated);
}

function dispatchEventResponse(state: GameState, action: GameAction & { type: 'RESPOND_EVENT'; choiceId: string }): GameState {
  if (!state.pendingEvent) return state;
  const id = state.pendingEvent.id;
  if (id.startsWith('chance_card_')) return handleChanceCard(state);
  if (id.startsWith('tutorial_')) return handleTutorial(state);
  if (id.startsWith('no_cash_')) return handleNoCash(state);
  if (id.startsWith('end_trip_warn_')) return handleEndTripWarn(state);
  if (id.startsWith('kingpin_warn_')) return handleKingpinWarn(state);
  if (id.startsWith('safehouse_promote_') || id.startsWith('safehouse_demote_')) {
    const nw = state.player.bank + state.player.cash;
    const newTier = getSafehouseTier(nw, state.safehouseTier);
    return { ...state, pendingEvent: null, safehouseTier: newTier, lastEventMessage: '' };
  }
  if (id.startsWith('confirm_flight_') && state.pendingFlight) return handleConfirmFlight(state, action);
  if (id.startsWith('bigtime_') && state.pendingFlight) return handleBigTime(state, action);
  if (id.startsWith('summary_')) return handleSummary(state, action);
  if (id === 'travel_sniff' && state.travelSniff) return handleTravelSniff(state, action);
  if (id.startsWith('arrival_')) return handleArrival(state);
  if (id.startsWith('dealer_select_')) return handleDealerSelect(state, action);
  if (id.startsWith('dealer_intro_') || id.startsWith('custom_qty_')) return handleDealerIntroOrCustomQty(state, action);
  if (id.startsWith('haggle_win_') && action.choiceId === 'accept_deal') return handleHaggleWin(state, action);
  if (id.startsWith('haggle_lose_')) return handleHaggleLose(state, action);
  if (id.startsWith('enc_')) return handleBuyEncounter(state, action);
  if ((id.startsWith('sell_enc_') || id.startsWith('kingpin_')) && state.pendingSell) return handleSellEncounter(state, action);
  return handleFallbackEvent(state, action);
}

// ─── Direct TRAVEL dispatch (no recursion) ───────────────────

function doTravel(state: GameState, toCountryId: string, travelClass: TravelClass): GameState {
  if (state.gamePhase !== 'home' && state.gamePhase !== 'buying' && state.gamePhase !== 'flying_out') {
    return { ...state, lastEventMessage: 'You cannot travel right now.' };
  }

  const isReturnLeg = state.gamePhase === 'buying';
  const { player: travelPlayer, result } = travel(state.player, toCountryId, travelClass, isReturnLeg);
  let player = travelPlayer;

  if (!result.success) return { ...state, player: handleOverdraft(player), lastEventMessage: result.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${result.message}`] };

  if (result.success && !result.securitySniffTriggered && travelClass === 'first_class') {
    player = { ...player, credibility: Math.min(100, player.credibility + 2) };
  }

  if (result.securitySniffTriggered) {
    const sniffEvent = generateSniffChoices();
    if (player.cash < 500) {
      sniffEvent.choices = sniffEvent.choices.map(c => c.id === 'bribe' ? { ...c, text: `Bribe — Can't afford (you have $${player.cash}, need $500)`, odds: 0 } : c);
    }
    return { ...state, player: handleOverdraft(player), pendingEvent: sniffEvent, travelSniff: { toCountryId, cost: result.cost }, lastEventMessage: result.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${result.message}`] };
  }

  player.currentCountryId = toCountryId;
  const newCountry = getCountry(toCountryId)!;
  const tradeVol = getRecentTradeVolume({ ...state, player });
  const newMarketPrices = generateMarketPrices(newCountry, state.director, tradeVol, player.heat);
  const playerWithPeak = updatePeakNetWorth(player, newMarketPrices);
  const nw = getNetWorth(playerWithPeak, newMarketPrices);
  let s: GameState = withDirector(withTurn(journalEntry({ ...state, player: playerWithPeak, currentMarketPrices: newMarketPrices, lastEventMessage: result.message }, { turn: state.turn + 1, type: 'travel', title: `Traveled to ${newCountry.name}`, description: result.message, cash: playerWithPeak.cash, netWorth: nw, heat: playerWithPeak.heat, reputation: playerWithPeak.reputation }), result.message), playerWithPeak);

  if (isReturnLeg) {
    s = { ...s, gamePhase: 'selling' };
    const arrivalLines = [`You have returned to London.`, playerWithPeak.inventory.length > 0 ? `You have product in your possession. The heat is $${playerWithPeak.heat}/100. You can stash your goods or proceed to meet the kingpin.` : `You returned empty-handed.`];
    if (!state.firstRunTutorialShown && playerWithPeak.inventory.length > 0) {
      const tutorialEvent: ChoiceEvent = {
        id: 'tutorial_' + Date.now().toString(36), title: 'You Did It',
        context: `You made it back. You might have finally found something you're actually good at.\n\nDealers in London only buy in bulk. Each kingpin has a minimum — Iqbal won't get out of bed for less than $500 worth of product. Avi wants $5,000 and Sergio wants $2,000.\n\nStash your goods after each trip. When you've built up enough, retrieve the product you want to sell and contact a kingpin.\n\nNow — book another flight and build your stash. You're going to need it.`,
        choices: [{ id: 'got_it', text: 'Got it — back to work', ...nullChoice }],
      };
      s.pendingEvent = tutorialEvent;
      s.lastEventMessage = '';
      return s;
    }
    s.pendingEvent = generateSummaryEvent('Back in London', arrivalLines.join('\n\n'), false);
    s.lastEventMessage = '';
    return s;
  }

  const arrivalLines = [`You pass through ${newCountry.city} airport security with no trouble. Your documents are in order.`, `You collect your belongings and head towards the exit. Welcome to ${newCountry.city}.`];
  const arrivalEvent: ChoiceEvent = { id: 'arrival_' + Date.now().toString(36), title: `Customs Clearance — ${newCountry.name}`, context: arrivalLines.join('\n\n'), choices: [{ id: 'proceed_arrival', text: 'Continue', ...nullChoice }] };
  return { ...s, gamePhase: 'arrived', pendingEvent: arrivalEvent, lastEventMessage: `Cleared customs in ${newCountry.city}.` };
}

// ─── Main Reducer ────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.pendingEvent && action.type !== 'RESPOND_EVENT' && action.type !== 'STASH_GOODS' && action.type !== 'RETRIEVE_GOODS' && action.type !== 'CONTACT_KINGPIN') return state;

  if (action.type !== 'RESPOND_EVENT' && !isActionAllowed(state.gamePhase, action.type)) {
    return { ...state, lastEventMessage: `Cannot ${action.type.toLowerCase()} in ${state.gamePhase} phase.` };
  }

  switch (action.type) {

    case 'START_TRIP': {
      const { player, success, message } = startTrip(state.player, action.amount);
      if (!success) return { ...state, lastEventMessage: message };
      const country = getCountry(player.currentCountryId)!;
      const marketPrices = generateMarketPrices(country, state.director, 0, player.heat);
      const chanceCard = getChanceCard();
      if (chanceCard) {
        const isPositive = chanceCard.effects.cashDelta >= 0;
        const cardEvent: ChoiceEvent = {
          id: 'chance_card_' + Date.now().toString(36), title: isPositive ? 'Good Luck' : 'Bad Luck', context: chanceCard.text,
          choices: [{ id: 'acknowledge', text: 'Continue', odds: 1.0, successEffects: chanceCard.effects, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' } }],
        };
        return { ...state, player, currentMarketPrices: marketPrices, pendingEvent: cardEvent, lastEventMessage: chanceCard.text, gameLog: [...state.gameLog, `[Turn $${state.turn}] Chance card: ${chanceCard.text}`] };
      }
      return { ...state, player, currentMarketPrices: marketPrices, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
    }

    case 'SELECT_PRODUCT': {
      return { ...state, selectedProductId: action.goodId, lastEventMessage: action.goodId ? `Selected ${state.goods.find(g => g.id === action.goodId)?.name ?? ''}.` : 'Product deselected.' };
    }

    case 'CONFIRM_FLIGHT': {
      if (!state.selectedProductId) {
        return { ...state, lastEventMessage: 'Select a product first by clicking on it in the Market panel.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Flight blocked: no product selected.`] };
      }
      if (state.gamePhase !== 'home') {
        const atOrigin = state.player.currentCountryId === ORIGIN_COUNTRY;
        const hasInv = state.player.inventory.length > 0;
        if (state.gamePhase === 'selling' && atOrigin && !hasInv) {
          state = { ...state, gamePhase: 'home' };
        } else {
          const guidance = !atOrigin ? "You're abroad. Fly home first." : hasInv ? "You're carrying goods. Stash them first, then book another flight." : "Use the DEPOSIT & RETURN button to end your current trip.";
          const we: ChoiceEvent = { id: 'end_trip_warn_' + Date.now().toString(36), title: 'End Current Trip First', context: `You can't book a flight right now.\n\n${guidance}\n\nThen withdraw fresh cash if needed and book a new flight.`, choices: [{ id: 'understood', text: 'Understood', ...nullChoice }] };
          return { ...state, pendingEvent: we, lastEventMessage: guidance };
        }
      }
      const destCountry = getCountry(action.toCountryId);
      if (!destCountry) return { ...state, lastEventMessage: 'Invalid destination.' };
      const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
      const bestLoc = selectedGood ? BEST_LOCATIONS_TEXT[selectedGood.id] : 'the destination';
      const bestCountryId = selectedGood ? BEST_LOCATION_ID[selectedGood.id] : null;
      const isBestSource = bestCountryId === action.toCountryId;
      const estCost = getTicketCost(getCountry(state.player.currentCountryId)!, destCountry, action.travelClass);
      const goodName = selectedGood?.name ?? 'product';
      const minProdCost = selectedGood ? (state.currentMarketPrices.find(p => p.goodId === state.selectedProductId)?.buyPrice ?? 100) * selectedGood.standardDealSize : 200;
      const BRIBE_RESERVE = 500;
      const totalNeeded = estCost + minProdCost + BRIBE_RESERVE;

      if (state.player.cash < totalNeeded) {
        const reason = state.player.cash < estCost
          ? `You don't have enough cash to buy this ticket.\n\nTicket: $${estCost}\nCash on hand: $${state.player.cash.toLocaleString()}`
          : `You have enough for the ticket — but not enough to make this trip worthwhile.\n\nTicket: $${estCost}\nMinimum product: $${minProdCost.toLocaleString()} (${selectedGood?.standardDealSize ?? 10} ${selectedGood?.unitOfMeasure ?? 'unit'}${(selectedGood?.standardDealSize ?? 10) > 1 ? 's' : ''} of ${goodName})\nBuffer for expenses: $${BRIBE_RESERVE} — potential bribes can be costly, you'll want at least this spare.\n\nTotal needed: $${totalNeeded.toLocaleString()}\nCash on hand: $${state.player.cash.toLocaleString()}`;
        const we: ChoiceEvent = { id: 'no_cash_' + Date.now().toString(36), title: 'Not Enough Cash', context: `${reason}\n\nGo to the ATM at the top of the screen and withdraw more cash.`, choices: [{ id: 'understood', text: 'I understand', ...nullChoice }] };
        return { ...state, pendingEvent: we, lastEventMessage: 'Not enough cash to make this trip.' };
      }

      const confirmEvent: ChoiceEvent = {
        id: 'confirm_flight_' + Date.now().toString(36), title: 'Confirm Flight',
        context: `Fly to ${destCountry.city}, ${destCountry.name} to buy ${goodName}?\n\n${isBestSource ? `You're heading to the best source for ${goodName}.` : `Your best source for ${goodName} is ${bestLoc}.`}\nTicket: $${estCost} (${action.travelClass === 'first_class' ? 'First Class' : 'Economy'})\nCash on hand: $${state.player.cash.toLocaleString()}\n\n${selectedGood ? `Current dealer price: $${(state.currentMarketPrices.find(p => p.goodId === selectedGood.id)?.buyPrice ?? 0).toFixed(0)}/${selectedGood.unitOfMeasure}` : ''}\n\nClick a different product in the Market panel to change your choice.`,
        choices: [
          { id: 'continue', text: 'Book flight', ...nullChoice },
          { id: 'go_back', text: 'Go back', ...nullChoice },
        ],
      };
      return { ...state, pendingEvent: confirmEvent, pendingFlight: { toCountryId: action.toCountryId, travelClass: action.travelClass }, lastEventMessage: 'Confirm your flight.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Flight confirmation for ${destCountry.name}.`] };
    }

    case 'TRAVEL': return doTravel(state, action.toCountryId, action.travelClass);

    case 'AFTER_CUSTOMS': {
      if (state.gamePhase !== 'arrived') return state;
      const country = getCountry(state.player.currentCountryId)!;
      const options = getDealerOptions(country.id, state.dealerRapport);
      if (options.length === 0) return { ...state, lastEventMessage: 'No dealers available in this country. Try another destination.' };
      const dealerLines = options.map((opt, i) => {
        const rapportLabel = opt.rapportLevel > 0 ? ` (familiar: ${opt.rapportLevel})` : '';
        return `[${i + 1}] ${opt.profile.name} — ${opt.profile.description}${rapportLabel}\n  ${opt.profile.location}`;
      });
      const dealerEvent: ChoiceEvent = {
        id: 'dealer_select_' + Date.now().toString(36), title: `Choose Your Contact — ${country.city}`,
        context: `You need a supplier. Who do you want to meet?\n\n${dealerLines.join('\n\n')}`,
        choices: options.map(opt => ({ id: opt.profile.dealerId, text: `${opt.profile.name} — ${opt.profile.location}`, ...nullChoice })),
      };
      return { ...state, gamePhase: 'selecting_dealer', pendingEvent: dealerEvent, lastEventMessage: 'Choose your supplier.' };
    }

    case 'SELECT_DEALER': {
      if (state.gamePhase !== 'selecting_dealer') return state;
      const country = getCountry(state.player.currentCountryId);
      if (!country) return state;
      const options = getDealerOptions(country.id, state.dealerRapport);
      const selected = options.find(o => o.profile.dealerId === action.dealerId);
      if (!selected) return { ...state, lastEventMessage: 'Invalid dealer selection.' };
      const withDealer = { ...state, gamePhase: 'buying' as const, selectedDealer: selected.profile };
      return { ...withDealer, pendingEvent: createDealerIntro(withDealer), lastEventMessage: `Meeting ${selected.profile.name}...` };
    }

    case 'BUY': {
      if (state.gamePhase !== 'buying') return { ...state, lastEventMessage: 'You can only buy product from a dealer abroad.' };
      if (!state.selectedDealer) return { ...state, lastEventMessage: 'No dealer selected.' };
      const buyCountry = getCountry(state.player.currentCountryId);
      if (!buyCountry) return { ...state, lastEventMessage: 'Cannot buy here.' };
      const buyGoodDef = state.goods.find(g => g.id === action.goodId);
      if (!buyGoodDef) return { ...state, lastEventMessage: 'Unknown good.' };
      const price = state.currentMarketPrices.find(p => p.goodId === action.goodId);
      if (!price) return { ...state, lastEventMessage: 'Good not available.' };
      const effectiveBuyPrice = Math.floor(price.buyPrice * state.selectedDealer.priceModifier);
      const totalCost = effectiveBuyPrice * action.quantity;
      if (state.player.cash < totalCost) return { ...state, lastEventMessage: `Need $${totalCost.toLocaleString()}, have $${state.player.cash.toLocaleString()}.` };
      const weightNeeded = buyGoodDef.weight * action.quantity;
      if (weightNeeded > getRemainingCapacity(state.player)) return { ...state, lastEventMessage: 'Not enough inventory capacity.' };
      const dealContext = { pricePerUnit: effectiveBuyPrice, quantity: action.quantity, totalCost };
      const encounter = generateDealerEncounter(state.player, buyCountry, state.selectedDealer, dealContext);
      return { ...state, pendingEvent: encounter, pendingBuy: { goodId: action.goodId, quantity: action.quantity, totalCost }, lastEventMessage: `Meeting ${state.selectedDealer.name}...`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Buying from ${state.selectedDealer.name}.`] };
    }

    case 'CONTACT_KINGPIN': {
      if (state.gamePhase !== 'selling') return { ...state, pendingEvent: warnEvent('Not Available', 'You can only contact kingpins once you meet the minimum stash threshold. Fly abroad, do some deals, and build up your stash first.') };
      const kingpin = KINGPIN_POOL.find(k => k.id === action.kingpinId);
      if (!kingpin) return { ...state, pendingEvent: warnEvent('Error', 'Invalid kingpin selection.') };
      if (state.player.inventory.length === 0) return { ...state, pendingEvent: warnEvent('No Product', `You've got nothing on you, Angelo. Empty pockets, empty bag. You need to retrieve product from your stash first. The kingpins aren't going to buy fresh air, you daft little cunt. Go to the Inventory panel, click what you want to sell, bring it out — THEN make the call. fuck me they said you were lazy this takes the piss!`), lastEventMessage: 'No product to sell.' };
      if (state.player.inventory.length > 1) {
        const names = state.player.inventory.map(i => state.goods.find(g => g.id === i.goodId)?.name ?? i.goodId).join(', ');
        return { ...state, pendingEvent: warnEvent('One At A Time', `You can only sell one type of product at a time.\n\nYou're carrying: ${names}\n\nStash the ones you're not selling first.`), lastEventMessage: 'Sell one product at a time.' };
      }
      const sellGood = state.player.inventory[0];
      const goodDef = state.goods.find(g => g.id === sellGood.goodId);
      const productValue = goodDef ? goodDef.baseValuePerUnit * sellGood.quantity : 0;
      if (productValue < kingpin.minStashValue) {
        return { ...state, pendingEvent: warnEvent('Below Minimum', `These kingpins don't get out of bed for pocket change, Angelo, you lazy coon. You've got to build up your stash first — make a few runs, stack some product, THEN give them a bell. You can't walk into Hatton Garden with a tenner and expect Avi to roll out the red carpet, that covetous Jew will take everything you've got, even if you've got nothing. So start small with the chav behind Chicken Cottage. Build up. Then go big. When you've got enough product, the big boys will take your call. Until then, you're just another wannabe with a bag of nothing. You cant fuck about here, Angelo, youre not in Zimbabwe anymore!`), lastEventMessage: 'Need more product.' };
      }
      const sellPriceData = state.currentMarketPrices.find(p => p.goodId === sellGood.goodId);
      if (!sellPriceData) return { ...state, pendingEvent: warnEvent('No Buyer', 'No buyer for this product right now. Check the market prices first.') };
      const goodName = goodDef?.name ?? 'goods';
      const adjustedPrice = Math.floor(sellPriceData.sellPrice * kingpin.sellPriceMod);
      const kingpinEvent = generateKingpinEncounter(state.player, kingpin, goodName, productValue);
      return { ...state, selectedKingpin: kingpin, pendingEvent: kingpinEvent, pendingSell: { goodId: sellGood.goodId, quantity: sellGood.quantity, baseSellPrice: adjustedPrice, countryId: 'london' }, lastEventMessage: `Calling ${kingpin.name}...`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Contacted kingpin: ${kingpin.name}.`] };
    }

    case 'MEET_KINGPIN': {
      if (state.gamePhase !== 'selling') return { ...state, lastEventMessage: 'No kingpin available now.' };
      if (state.player.inventory.length === 0) return { ...state, lastEventMessage: 'No product to sell. Retrieve goods from stash first.' };
      const sellGood = state.player.inventory[0];
      const sellPriceData = state.currentMarketPrices.find(p => p.goodId === sellGood.goodId);
      if (!sellPriceData) return { ...state, lastEventMessage: 'No buyer for this product right now.' };
      const goodName = GOODS.find(g => g.id === sellGood.goodId)?.name ?? 'goods';
      const country = getCountry(state.player.currentCountryId)!;
      const kingpinEvent = generateSellEncounter(state.player, country, goodName);
      return { ...state, pendingEvent: kingpinEvent, pendingSell: { goodId: sellGood.goodId, quantity: sellGood.quantity, baseSellPrice: sellPriceData.sellPrice, countryId: country.id }, lastEventMessage: `Meeting kingpin in ${country.city}...`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Kingpin meeting.`] };
    }

    case 'SELL': {
      if (state.gamePhase !== 'selling') return { ...state, lastEventMessage: 'You can only sell through the kingpin.' };
      return { ...state, lastEventMessage: 'Use MEET_KINGPIN to arrange a sale.' };
    }

    case 'STASH_GOODS': {
      if (state.gamePhase !== 'selling' && state.gamePhase !== 'home') return { ...state, lastEventMessage: 'Cannot stash goods now.' };
      if (state.player.inventory.length === 0) return { ...state, lastEventMessage: 'Nothing to stash.' };
      const stashWeight = state.player.inventory.reduce((sum, item) => { const g = state.goods.find(x => x.id === item.goodId); return sum + (g ? g.weight * item.quantity : 0); }, 0);
      const stashFree = state.player.stashCapacity - state.player.stash.reduce((sum, item) => { const g = state.goods.find(x => x.id === item.goodId); return sum + (g ? g.weight * item.quantity : 0); }, 0);
      if (stashWeight > stashFree) return { ...state, lastEventMessage: `Not enough stash space. Need $${stashWeight.toFixed(1)}kg, have ${stashFree.toFixed(1)}kg free.` };
      let updatedStash = state.player.stash.map(s => ({ ...s }));
      for (const item of state.player.inventory) {
        const idx = updatedStash.findIndex(s => s.goodId === item.goodId);
        if (idx >= 0) { updatedStash[idx] = { ...updatedStash[idx], quantity: updatedStash[idx].quantity + item.quantity }; }
        else { updatedStash.push({ goodId: item.goodId, quantity: item.quantity }); }
      }
      return { ...state, player: { ...state.player, inventory: [], stash: updatedStash }, lastEventMessage: `Stashed $${state.player.inventory.reduce((s, i) => s + i.quantity, 0)} units in your storage.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Goods stashed.`] };
    }

    case 'RETRIEVE_GOODS': {
      if (state.gamePhase !== 'selling' && state.gamePhase !== 'home') return { ...state, lastEventMessage: 'Cannot retrieve goods now.' };
      const stashItem = state.player.stash.find(s => s.goodId === action.goodId);
      if (!stashItem || stashItem.quantity < action.quantity) return { ...state, lastEventMessage: 'Not enough in stash.' };
      const g = state.goods.find(x => x.id === action.goodId);
      const weightNeeded = g ? g.weight * action.quantity : 0;
      const capFree = state.player.inventoryCapacity - state.player.inventory.reduce((sum, item) => { const gi = state.goods.find(x => x.id === item.goodId); return sum + (gi ? gi.weight * item.quantity : 0); }, 0);
      if (weightNeeded > capFree) return { ...state, lastEventMessage: 'Not enough inventory space.' };
      let newStash = state.player.stash.map(s => s.goodId === action.goodId ? { ...s, quantity: s.quantity - action.quantity } : s).filter(s => s.quantity > 0);
      let newInv = state.player.inventory.map(i => ({ ...i }));
      const existing = newInv.find(i => i.goodId === action.goodId);
      if (existing) { newInv = newInv.map(i => i.goodId === action.goodId ? { ...i, quantity: i.quantity + action.quantity } : i); }
      else { newInv.push({ goodId: action.goodId, quantity: action.quantity }); }
      return { ...state, player: { ...state.player, stash: newStash, inventory: newInv }, lastEventMessage: `Retrieved $${action.quantity}x from stash.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Retrieved from stash.`] };
    }

    case 'FLY_HOME': {
      if (state.gamePhase !== 'buying') return { ...state, lastEventMessage: 'Cannot fly home now.' };
      let updatedPlayer = { ...state.player, currentCountryId: ORIGIN_COUNTRY, cash: Math.max(0, state.player.cash) };
      updatedPlayer = handleOverdraft(updatedPlayer);
      return { ...state, player: updatedPlayer, gamePhase: 'home', lastEventMessage: 'You flew home empty-handed. Better luck next time.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Flew home empty.`] };
    }

    case 'RESPOND_EVENT': return dispatchEventResponse(state, action as GameAction & { type: 'RESPOND_EVENT'; choiceId: string });

    case 'VIEW_MARKET': {
      const country = getCountry(state.player.currentCountryId)!;
      const tradeVol = getRecentTradeVolume(state);
      const prices = generateMarketPrices(country, state.director, tradeVol, state.player.heat);
      const priceList = prices.map(p => `${p.goodName}: Buy=$${p.buyPrice} Sell=$${p.sellPrice} (Demand:${p.demand})`).join('\n  ');
      return { ...state, currentMarketPrices: prices, lastEventMessage: `Market prices in ${country.name}:\n  ${priceList}` };
    }

    case 'VIEW_INVENTORY': {
      const used = getUsedCapacity(state.player);
      const remaining = getRemainingCapacity(state.player);
      const invValue = getInventoryValue(state.player, state.currentMarketPrices);
      let invList = 'Empty';
      if (state.player.inventory.length > 0) { invList = state.player.inventory.map(i => { const g = state.goods.find(x => x.id === i.goodId); return `${g?.name ?? i.goodId}: ${i.quantity}x`; }).join('\n  '); }
      let stashList = 'Empty';
      if (state.player.stash.length > 0) { stashList = state.player.stash.map(i => { const g = state.goods.find(x => x.id === i.goodId); return `${g?.name ?? i.goodId}: ${i.quantity}x`; }).join('\n  '); }
      return { ...state, lastEventMessage: `INVENTORY (${used.toFixed(3)}/${state.player.inventoryCapacity}kg)\n  ${invList}\nEstimated value: $${invValue.toLocaleString()}\n\nSTASH (${state.player.stash.reduce((s, i) => { const g = state.goods.find(x => x.id === i.goodId); return s + (g ? g.weight * i.quantity : 0); }, 0).toFixed(1)}/${state.player.stashCapacity}kg)\n  ${stashList}` };
    }

    case 'WAIT': {
      let updatedPlayer: PlayerState = { ...state.player };
      const ops = getActiveOperationalBenefits(updatedPlayer);
      const decay = Math.floor((5 + Math.random() * 10) * (1 + ops.heatDecayBonus));
      updatedPlayer.heat = Math.max(0, updatedPlayer.heat - decay);
      updatedPlayer.credibility = Math.max(0, updatedPlayer.credibility - 5);
      const repDecay = Math.floor(1 + Math.random() * 2);
      updatedPlayer.reputation = Math.max(0, updatedPlayer.reputation - repDecay);
      let s: GameState = withTurn({ ...state, player: updatedPlayer, lastEventMessage: `You wait and lie low. Heat -$${decay}. Credibility -5. Reputation -${repDecay}.` }, `Waited. Heat -${decay}. Cred -5. Rep -${repDecay}.`);
      return tryTriggerProceduralEvent(withDirector(s, updatedPlayer));
    }

    case 'END_RUN': {
      const nw = getNetWorth(state.player, state.currentMarketPrices);
      return journalEntry({ ...state, player: { ...state.player, runActive: false }, lastEventMessage: 'Run ended. Game over.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Run ended.`] }, { turn: state.turn, type: 'run_end', title: 'Run Concluded', description: `Final tally: $${state.player.cash.toLocaleString()} cash · $${state.player.bank.toLocaleString()} bank · ${state.player.totalTrips} trips · ${state.player.totalBusts} busts`, cash: state.player.cash, netWorth: nw, heat: state.player.heat, reputation: state.player.reputation });
    }

    case 'END_TRIP': {
      const { player, message } = bankEndTrip(state.player, ORIGIN_COUNTRY);
      let s: GameState = withTurn({ ...state, player: updatePeakNetWorth(player, state.currentMarketPrices), lastEventMessage: message, gamePhase: 'home' }, message);
      return withDirector(s, player);
    }

    case 'TRANSFER_FROM_BANK': {
      const { player, success, message } = transferFromBank(state.player, action.amount);
      if (!success) return { ...state, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
      return { ...state, player: handleOverdraft(player), lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
    }
    case 'TRANSFER_TO_BANK': {
      const { player, success, message } = transferToBank(state.player, action.amount);
      if (!success) return { ...state, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
      return { ...state, player, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`] };
    }

    case 'BUY_ASSET': {
      const asset = getAsset(action.assetId);
      if (!asset) return { ...state, lastEventMessage: 'Asset not found.' };
      const { player, success } = buyAsset(state.player, asset);
      if (!success) return { ...state, lastEventMessage: 'Cannot afford or already owned.' };
      const nw = getNetWorth(player, state.currentMarketPrices);
      return journalEntry({ ...state, player: updatePeakNetWorth(player, state.currentMarketPrices), lastEventMessage: `Purchased $${asset.name} for $${asset.price.toLocaleString()}. Credit +${asset.creditValue}.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Bought asset: ${asset.name}.`] }, { turn: state.turn, type: 'purchase', title: `Bought $${asset.name}`, description: asset.description, cash: player.cash, netWorth: nw, heat: player.heat, reputation: player.reputation });
    }

    case 'SELL_ASSET': {
      const { player, payout, success } = sellAsset(state.player, action.assetId);
      if (!success) return { ...state, lastEventMessage: 'Asset not found or not owned.' };
      return { ...state, player: updatePeakNetWorth(player, state.currentMarketPrices), lastEventMessage: `Sold asset for $${payout.toLocaleString()}.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Sold asset for $${payout.toLocaleString()}.`] };
    }

    case 'SAVE': {
      try { localStorage.setItem('angelo_save', JSON.stringify(state)); return { ...state, lastEventMessage: 'Game saved successfully.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Game saved.`] }; }
      catch { return { ...state, lastEventMessage: 'Failed to save game.' }; }
    }

    case 'LOAD': {
      try {
        const saveData = localStorage.getItem('angelo_save');
        if (!saveData) return { ...state, lastEventMessage: 'No save data found.' };
        return { ...JSON.parse(saveData), lastEventMessage: 'Game loaded successfully.', gameLog: [...JSON.parse(saveData).gameLog, `[Turn $${JSON.parse(saveData).turn}] Game loaded.`] };
      } catch { return { ...state, lastEventMessage: 'Failed to load save. Corrupted data.' }; }
    }

    case 'CANCEL_AIRPORT': return { ...state, headingToAirport: false, lastEventMessage: 'Flight cancelled.' };

    case 'SAFEHOUSE_TIER_CHANGE': {
      const nw = state.player.bank + state.player.cash;
      const newTier = getSafehouseTier(nw, state.safehouseTier);
      if (newTier === state.safehouseTier) return state;
      const isPromotion = newTier > state.safehouseTier;
      const tier = isPromotion ? newTier : state.safehouseTier - 1; // demoted TO previous tier
      const evt: ChoiceEvent = {
        id: (isPromotion ? 'safehouse_promote_' : 'safehouse_demote_') + Date.now().toString(36),
        title: isPromotion ? (SAFEHOUSE_ADVANCE_TITLES[tier] ?? 'New Safehouse') : (SAFEHOUSE_DEMOTE_TITLES[tier] ?? 'Downgraded'),
        context: isPromotion ? (SAFEHOUSE_ADVANCE_MSGS[tier] ?? '') : (SAFEHOUSE_DEMOTE_MSGS[tier] ?? ''),
        choices: [{ id: 'continue', text: 'Continue', ...nullChoice }],
      };
      return { ...state, pendingEvent: evt, lastEventMessage: '' };
    }
    default: return state;
  }
}

export function getStatusReport(state: GameState): string {
  const country = getCountry(state.player.currentCountryId)!;
  const heatLevel = getHeatLevel(state.player);
  const used = getUsedCapacity(state.player);
  const remaining = getRemainingCapacity(state.player);
  return [
    `=== ANGELO: THE CHRONICLES OF CRIME ===`,
    `Turn: ${state.turn}    Phase: ${state.gamePhase}`,
    `Location: ${country.name} (${country.region})`,
    `Bank: $${state.player.bank.toLocaleString()}`,
    `Cash: $${state.player.cash.toLocaleString()}`,
    `Heat: ${state.player.heat}/100 [${heatLevel.toUpperCase()}]`,
    `Credit: ${state.player.credit}    Credibility: ${state.player.credibility}/100`,
    `Reputation: ${state.player.reputation}/100`,
    `Inventory: ${used.toFixed(3)}/${state.player.inventoryCapacity}kg used, ${remaining.toFixed(3)}kg free`,
    `Stash: ${state.player.stash.reduce((s, i) => s + i.quantity, 0)} units / ${state.player.stashCapacity}kg`,
    `Trips: ${state.player.totalTrips}  Busts: ${state.player.totalBusts}`,
    `Director: Tension=${state.director.tension} Boredom=${state.director.boredom} Attn=${state.director.enforcementAttention}`,
    `Last event: ${state.lastEventMessage.substring(0, 80)}`,
    `========================`,
  ].join('\n');
}
