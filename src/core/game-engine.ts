import type { GameState, GameAction, PlayerState, MarketPrice, JournalRunEntry, ChoiceEvent, DealerProfile } from './types';
import { createPlayer, deductCash } from './player';
import { COUNTRIES, getCountry } from './world';
import { GOODS } from './goods';
import { generateMarketPrices } from './economy';
import { travel, generateSniffChoices } from './travel';
import { getUsedCapacity, getRemainingCapacity, getInventoryValue, removeGood, addGood } from './inventory';
import { getHeatLevel } from './heat';
import { createDirector, updateDirector, getDirectorEventChance, getForcedEvent } from './director';
import { generateProceduralEvent, resolveEventChoice } from './events-procedural';
import { generateDealerEncounter, generateSellEncounter, getDealerOptions, p, KINGPIN_POOL, generateKingpinEncounter } from './dealer-encounters';
import { buyAsset, sellAsset, getAsset, getActiveOperationalBenefits } from './assets';
import { startTrip, endTrip as bankEndTrip, checkOverdraft, transferFromBank, transferToBank } from './bank-actions';
import { getChanceCard } from './chance-cards';

const ORIGIN_COUNTRY = 'london';

const BEST_LOCATIONS_TEXT: Record<string, string> = {
  cocaine: 'Medellín, Colombia',
  heroin: 'Kabul, Afghanistan',
  hashish: 'Amsterdam, Netherlands',
  weed: 'Amsterdam, Netherlands',
  meth: 'Barcelona, Spain',
  ecstasy: 'Barcelona, Spain',
};

const BEST_LOCATION_ID: Record<string, string> = {
  cocaine: 'colombia',
  heroin: 'afghanistan',
  hashish: 'netherlands',
  weed: 'netherlands',
  meth: 'spain',
  ecstasy: 'spain',
};

export function createGameState(): GameState {
  const player = createPlayer();
  const director = createDirector();
  const country = getCountry(player.currentCountryId)!;
  const marketPrices = generateMarketPrices(country, director, 0, player.heat);

  return {
    player,
    world: COUNTRIES,
    goods: GOODS,
    director,
    turn: 0,
    currentMarketPrices: marketPrices,
    lastEventMessage: 'Angelo. The network is waiting for you.',
    gameLog: [],
    pendingEvent: null,
    travelSniff: null,
    pendingSell: null,
    pendingBuy: null,
    pendingFlight: null,
    headingToAirport: false,
    selectedProductId: null,
    gamePhase: 'home',
    selectedDealer: null,
    selectedKingpin: null,
    dealerRapport: {},
    marketMemory: {},
    journalEntries: [],
    securitySniffsPassed: 0,
    buyDealsCompleted: 0,
    sellDealsCompleted: 0,
    firstRunTutorialShown: false,
  };
}

function getNetWorth(player: PlayerState, marketPrices: MarketPrice[]): number {
  const invValue = player.inventory.reduce((sum, item) => {
    const price = marketPrices.find((p) => p.goodId === item.goodId);
    return sum + (price ? price.sellPrice * item.quantity : 0);
  }, 0);
  return player.bank + player.cash + invValue;
}

function updatePeakNetWorth(player: PlayerState, marketPrices: MarketPrice[]): PlayerState {
  const nw = getNetWorth(player, marketPrices);
  return nw > player.peakNetWorth ? { ...player, peakNetWorth: nw } : player;
}

function journalEntry(state: GameState, entry: JournalRunEntry): GameState {
  return { ...state, journalEntries: [...state.journalEntries, entry] };
}

function getRecentTradeVolume(state: GameState): number {
  const mem = state.marketMemory[state.player.currentCountryId];
  return mem ? mem.recentTradeVolume : 0;
}

function updateMarketMemory(state: GameState, volumeIncrease: number): GameState {
  const countryId = state.player.currentCountryId;
  const existing = state.marketMemory[countryId];
  return {
    ...state,
    marketMemory: {
      ...state.marketMemory,
      [countryId]: {
        countryId,
        recentTradeVolume: (existing?.recentTradeVolume ?? 0) + volumeIncrease,
        lastVisitedTurn: state.turn,
      },
    },
  };
}

function tryTriggerProceduralEvent(state: GameState): GameState {
  if (state.pendingEvent) return state;
  const forcedReason = getForcedEvent(state.director, state.player);
  let eventChance = forcedReason ? 1.0 : getDirectorEventChance(state.director);
  if (Math.random() >= eventChance) return state;
  const event = generateProceduralEvent(state.player, state.director);
  return {
    ...state,
    pendingEvent: event,
    lastEventMessage: `EVENT: $${event.title}`,
    gameLog: [...state.gameLog, `[Turn $${state.turn}] EVENT: ${event.title}`],
    director: { ...state.director, timeSinceLastEvent: 0, eventCooldown: 3 },
  };
}

function handleOverdraft(player: PlayerState): PlayerState {
  if (checkOverdraft(player)) return { ...player, runActive: false };
  return player;
}

function generateSummaryEvent(title: string, context: string, hasGoods: boolean): ChoiceEvent {
  const choices = [
    { id: 'buy_more', text: 'Arrange Another Deal', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } } as const,
  ];
  if (hasGoods) {
    (choices as any[]).unshift({ id: 'continue', text: 'Proceed to Airport', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } });
  }
  return { id: 'summary_' + Date.now().toString(36), title, context, choices: choices as any };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.pendingEvent && action.type !== 'RESPOND_EVENT') return state;

  switch (action.type) {

    // ====== HOME PHASE ======
    case 'START_TRIP': {
      const { player, success, message } = startTrip(state.player, action.amount);
      if (!success) return { ...state, lastEventMessage: message };

      const country = getCountry(player.currentCountryId)!;
      const marketPrices = generateMarketPrices(country, state.director, 0, player.heat);

      // Chance card at home
      const chanceCard = getChanceCard();
      if (chanceCard) {
        const isPositive = chanceCard.effects.cashDelta >= 0;
        const cardEvent: ChoiceEvent = {
          id: 'chance_card_' + Date.now().toString(36),
          title: isPositive ? 'Good Luck' : 'Bad Luck',
          context: chanceCard.text,
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
        // In London with no goods on person — auto-transition to home and continue booking
        if (state.gamePhase === 'selling' && atOrigin && !hasInv) {
          state = { ...state, gamePhase: 'home' };
        } else {
          const guidance = !atOrigin
            ? "You're abroad. Fly home first."
            : hasInv
              ? "You're carrying goods. Stash them first, then book another flight."
              : "Use the DEPOSIT & RETURN button to end your current trip.";
          const warnEvent: ChoiceEvent = {
            id: 'end_trip_warn_' + Date.now().toString(36),
            title: 'End Current Trip First',
            context: `You can't book a flight right now.\n\n${guidance}\n\nThen withdraw fresh cash if needed and book a new flight.`,
            choices: [{ id: 'understood', text: 'Understood', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }],
          };
          return { ...state, pendingEvent: warnEvent, lastEventMessage: guidance };
        }
      }
      const destCountry = getCountry(action.toCountryId);
      if (!destCountry) return { ...state, lastEventMessage: 'Invalid destination.' };
      const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
      const bestLoc = selectedGood ? BEST_LOCATIONS_TEXT[selectedGood.id] : 'the destination';
      const bestCountryId = selectedGood ? BEST_LOCATION_ID[selectedGood.id] : null;
      const isBestSource = bestCountryId === action.toCountryId;
      const econPrice = 200;
      const classMult = action.travelClass === 'first_class' ? 2.5 : 1.0;
      const estCost = Math.floor(econPrice * classMult);
      const goodName = selectedGood?.name ?? 'product';

      // Hard gate — player must have enough cash to make this trip worthwhile
      const minProdCost = selectedGood ? (state.currentMarketPrices.find(p => p.goodId === state.selectedProductId)?.buyPrice ?? 100) * selectedGood.standardDealSize : 200;
      const BRIBE_RESERVE = 500;
      const totalNeeded = estCost + minProdCost + BRIBE_RESERVE;

      if (state.player.cash < totalNeeded) {
        const reason = state.player.cash < estCost
          ? `You don't have enough cash to buy this ticket.\n\nTicket: $${estCost}\nCash on hand: $${state.player.cash.toLocaleString()}`
          : `You have enough for the ticket — but not enough to make this trip worthwhile.\n\nTicket: $${estCost}\nMinimum product: $${minProdCost.toLocaleString()} (${selectedGood?.standardDealSize ?? 10} ${selectedGood?.unitOfMeasure ?? 'unit'}${(selectedGood?.standardDealSize ?? 10) > 1 ? 's' : ''} of ${goodName})\nBuffer for expenses: $${BRIBE_RESERVE} — potential bribes can be costly, you'll want at least this spare.\n\nTotal needed: $${totalNeeded.toLocaleString()}\nCash on hand: $${state.player.cash.toLocaleString()}`;
        const warnEvent: ChoiceEvent = {
          id: 'no_cash_' + Date.now().toString(36),
          title: 'Not Enough Cash',
          context: `${reason}\n\nGo to the ATM at the top of the screen and withdraw more cash.`,
          choices: [{ id: 'understood', text: 'I understand', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }],
        };
        return { ...state, pendingEvent: warnEvent, lastEventMessage: 'Not enough cash to make this trip.' };
      }

      const confirmEvent: ChoiceEvent = {
        id: 'confirm_flight_' + Date.now().toString(36),
        title: 'Confirm Flight',
        context: `Fly to ${destCountry.city}, ${destCountry.name} to buy ${goodName}?\n\n${isBestSource ? `You're heading to the best source for ${goodName}.` : `Your best source for ${goodName} is ${bestLoc}.`}\nTicket: $${estCost} (${action.travelClass === 'first_class' ? 'First Class' : 'Economy'})\nCash on hand: $${state.player.cash.toLocaleString()}\n\n${selectedGood ? `Current dealer price: $${(state.currentMarketPrices.find(p => p.goodId === selectedGood.id)?.buyPrice ?? 0).toFixed(0)}/${selectedGood.unitOfMeasure}` : ''}\n\nClick a different product in the Market panel to change your choice.`,
        choices: [
          { id: 'continue', text: 'Book flight', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
          { id: 'go_back', text: 'Go back', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
        ],
      };
      return { ...state, pendingEvent: confirmEvent, pendingFlight: { toCountryId: action.toCountryId, travelClass: action.travelClass }, lastEventMessage: 'Confirm your flight.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Flight confirmation for ${destCountry.name}.`] };
    }

    case 'TRAVEL': {
      if (state.gamePhase !== 'home' && state.gamePhase !== 'buying' && state.gamePhase !== 'flying_out') {
        return { ...state, lastEventMessage: 'You cannot travel right now.' };
      }

      const isReturnLeg = state.gamePhase === 'buying';
      const { player: travelPlayer, result } = travel(state.player, action.toCountryId, action.travelClass, isReturnLeg);
      let player = travelPlayer;

      if (!result.success) return { ...state, player: handleOverdraft(player), lastEventMessage: result.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${result.message}`] };

      // First-class credibility bonus
      if (result.success && !result.securitySniffTriggered && action.travelClass === 'first_class') {
        player = { ...player, credibility: Math.min(100, player.credibility + 2) };
      }

      if (result.securitySniffTriggered) {
        const sniffEvent = generateSniffChoices();
        // Gray out bribe if player can't afford it
        if (player.cash < 500) {
          sniffEvent.choices = sniffEvent.choices.map(c => c.id === 'bribe'
            ? { ...c, text: `Bribe — Can't afford (you have $${player.cash}, need $500)`, odds: 0 }
            : c);
        }
        return { ...state, player: handleOverdraft(player), pendingEvent: sniffEvent, travelSniff: { toCountryId: action.toCountryId, cost: result.cost }, lastEventMessage: result.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${result.message}`] };
      }

      // Landed safely
      player.currentCountryId = action.toCountryId;
      const newCountry = getCountry(action.toCountryId)!;
      const tradeVol = getRecentTradeVolume({ ...state, player });
      const newMarketPrices = generateMarketPrices(newCountry, state.director, tradeVol, player.heat);
      const playerWithPeak = updatePeakNetWorth(player, newMarketPrices);
      const nw = getNetWorth(playerWithPeak, newMarketPrices);
      let updatedState: GameState = { ...state, player: playerWithPeak, currentMarketPrices: newMarketPrices, lastEventMessage: result.message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${result.message}`], turn: state.turn + 1 };
      updatedState = journalEntry(updatedState, { turn: updatedState.turn, type: 'travel', title: `Traveled to ${newCountry.name}`, description: result.message, cash: playerWithPeak.cash, netWorth: nw, heat: playerWithPeak.heat, reputation: playerWithPeak.reputation });
      updatedState.director = updateDirector(updatedState.director, updatedState.player, updatedState);

      if (isReturnLeg) {
        // Returning to UK with product — selling phase
        updatedState = { ...updatedState, gamePhase: 'selling' };
        // Auto-trigger arrival summary
        const arrivalLines = [`You have returned to London.`, playerWithPeak.inventory.length > 0 ? `You have product in your possession. The heat is $${playerWithPeak.heat}/100. You can stash your goods or proceed to meet the kingpin.` : `You returned empty-handed.`];
        // First-run tutorial — congratulations and dealer explanation
        if (!state.firstRunTutorialShown && playerWithPeak.inventory.length > 0) {
          const tutorialEvent: ChoiceEvent = {
            id: 'tutorial_' + Date.now().toString(36),
            title: 'You Did It',
            context: `You made it back. You might have finally found something you're actually good at.\n\nDealers in London only buy in bulk. Each kingpin has a minimum — Iqbal won't get out of bed for less than $500 worth of product. Avi wants $5,000 and Sergio wants $2,000.\n\nStash your goods after each trip. When you've built up enough, retrieve the product you want to sell and contact a kingpin.\n\nNow — book another flight and build your stash. You're going to need it.`,
            choices: [{ id: 'got_it', text: 'Got it — back to work', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }],
          };
          updatedState.pendingEvent = tutorialEvent;
          updatedState.lastEventMessage = '';
          return updatedState;
        }
        updatedState.pendingEvent = generateSummaryEvent('Back in London', arrivalLines.join('\n\n'), false);
        updatedState.lastEventMessage = '';
        return updatedState;
      }

      // Arrived at destination — outbound
      const arrivalLines = [`You pass through ${newCountry.city} airport security with no trouble. Your documents are in order.`, `You collect your belongings and head towards the exit. Welcome to ${newCountry.city}.`];
      const arrivalEvent: ChoiceEvent = { id: 'arrival_' + Date.now().toString(36), title: `Customs Clearance — ${newCountry.name}`, context: arrivalLines.join('\n\n'), choices: [{ id: 'proceed_arrival', text: 'Continue', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] };
      return { ...updatedState, gamePhase: 'arrived', pendingEvent: arrivalEvent, lastEventMessage: `Cleared customs in ${newCountry.city}.` };
    }

    case 'AFTER_CUSTOMS': {
      if (state.gamePhase !== 'arrived') return state;
      const country = getCountry(state.player.currentCountryId)!;
      const options = getDealerOptions(country.id, state.dealerRapport);
      if (options.length === 0) {
        return { ...state, lastEventMessage: 'No dealers available in this country. Try another destination.' };
      }
      const dealerLines = options.map((opt, i) => {
        const rapportLabel = opt.rapportLevel > 0 ? ` (familiar: ${opt.rapportLevel})` : '';
        return `[${i + 1}] ${opt.profile.name} — ${opt.profile.description}${rapportLabel}\n  ${opt.profile.location}`;
      });
      const dealerEvent: ChoiceEvent = {
        id: 'dealer_select_' + Date.now().toString(36),
        title: `Choose Your Contact — ${country.city}`,
        context: `You need a supplier. Who do you want to meet?\n\n${dealerLines.join('\n\n')}`,
        choices: options.map((opt, i) => ({
          id: opt.profile.dealerId,
          text: `${opt.profile.name} — ${opt.profile.location}`,
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        })),
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

      const dealer = selected.profile;
      const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
      const goodName = selectedGood?.name ?? 'product';
      const unit = selectedGood?.unitOfMeasure ?? 'x';
      const mktPrice = state.currentMarketPrices.find(p => p.goodId === state.selectedProductId);
      const buyPrice = mktPrice ? Math.floor(mktPrice.buyPrice * (1 + (dealer.priceModifier - 1) * 0.5)) : 100;
      const defQty = selectedGood?.standardDealSize ?? 10;
      const totalCost = buyPrice * defQty;
      const canAfford = state.player.cash >= totalCost;
      const dealerIntro: ChoiceEvent = {
        id: 'dealer_intro_' + Date.now().toString(36),
        title: `Meeting ${dealer.name}`,
        context: `${dealer.name} is waiting for you at ${dealer.location}.\n\n${goodName}: $${buyPrice}/${unit}\nCash on hand: $${state.player.cash.toLocaleString()}\n\n⚠ Keep at least $500 spare for customs on the way home.`,
        choices: [
          { id: 'qty_2', text: `2 ${unit}${selectedGood ? 's' : ''} — $${(buyPrice * 2).toLocaleString()}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
          { id: `qty_${defQty}`, text: `${defQty} ${unit}${selectedGood && defQty > 1 ? 's' : ''} — $${totalCost.toLocaleString()}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
          { id: 'custom_qty', text: 'Custom amount...', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
          { id: 'back_out', text: 'Something\'s off — walk away', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
        ],
      };
      return { ...state, gamePhase: 'buying', selectedDealer: dealer, pendingEvent: dealerIntro, lastEventMessage: `Meeting ${dealer.name}...` };
    }

    case 'BUY': {
      if (state.gamePhase !== 'buying') {
        return { ...state, lastEventMessage: 'You can only buy product from a dealer abroad.' };
      }
      if (!state.selectedDealer) return { ...state, lastEventMessage: 'No dealer selected.' };

      const buyCountry = getCountry(state.player.currentCountryId);
      if (!buyCountry) return { ...state, lastEventMessage: 'Cannot buy here.' };

      const buyGoodDef = state.goods.find(g => g.id === action.goodId);
      if (!buyGoodDef) return { ...state, lastEventMessage: 'Unknown good.' };

      const price = state.currentMarketPrices.find(p => p.goodId === action.goodId);
      if (!price) return { ...state, lastEventMessage: 'Good not available.' };

      // Apply dealer price modifier
      const effectiveBuyPrice = Math.floor(price.buyPrice * state.selectedDealer.priceModifier);
      const totalCost = effectiveBuyPrice * action.quantity;

      if (state.player.cash < totalCost) return { ...state, lastEventMessage: `Need $${totalCost.toLocaleString()}, have ${state.player.cash.toLocaleString()}.` };

      const weightNeeded = buyGoodDef.weight * action.quantity;
      if (weightNeeded > getRemainingCapacity(state.player)) return { ...state, lastEventMessage: 'Not enough inventory capacity.' };

      // Trigger dealer encounter
      const dealContext = { pricePerUnit: effectiveBuyPrice, quantity: action.quantity, totalCost };
      const encounter = generateDealerEncounter(state.player, buyCountry, state.selectedDealer, dealContext);
      return { ...state, pendingEvent: encounter, pendingBuy: { goodId: action.goodId, quantity: action.quantity, totalCost }, lastEventMessage: `Meeting ${state.selectedDealer.name}...`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Buying from ${state.selectedDealer.name}.`] };
    }

    case 'CONTACT_KINGPIN': {
      if (state.gamePhase !== 'selling') {
        const pw: ChoiceEvent = { id: 'kingpin_warn_' + Date.now().toString(36), title: 'Not Available', context: 'You can only contact kingpins once you meet the minimum stash threshold. Fly abroad, do some deals, and build up your stash first.', choices: [{ id: 'understood', text: 'Understood', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] };
        return { ...state, pendingEvent: pw };
      }
      const kingpin = KINGPIN_POOL.find(k => k.id === action.kingpinId);
      if (!kingpin) {
        const pw: ChoiceEvent = { id: 'kingpin_warn_' + Date.now().toString(36), title: 'Error', context: 'Invalid kingpin selection.', choices: [{ id: 'understood', text: 'Understood', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] };
        return { ...state, pendingEvent: pw };
      }

      if (state.player.inventory.length === 0) {
        const pw: ChoiceEvent = { id: 'kingpin_warn_' + Date.now().toString(36), title: 'No Product', context: 'No product in your inventory. Retrieve goods from your stash first, then contact a kingpin.', choices: [{ id: 'understood', text: 'Understood', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] };
        return { ...state, pendingEvent: pw, lastEventMessage: 'No product to sell.' };
      }

      if (state.player.inventory.length > 1) {
        const names = state.player.inventory.map(i => state.goods.find(g => g.id === i.goodId)?.name ?? i.goodId).join(', ');
        const pw: ChoiceEvent = { id: 'kingpin_warn_' + Date.now().toString(36), title: 'One At A Time', context: `You can only sell one type of product at a time.\n\nYou're carrying: ${names}\n\nStash the ones you're not selling first.`, choices: [{ id: 'understood', text: 'Understood', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] };
        return { ...state, pendingEvent: pw, lastEventMessage: 'Sell one product at a time.' };
      }

      const sellGood = state.player.inventory[0];
      const goodDef = state.goods.find(g => g.id === sellGood.goodId);
      const productValue = goodDef ? goodDef.baseValuePerUnit * sellGood.quantity : 0;

      if (productValue < kingpin.minStashValue) {
        const pw: ChoiceEvent = { id: 'kingpin_warn_' + Date.now().toString(36), title: 'Below Minimum', context: `${kingpin.name} won't meet for less than $${kingpin.minStashValue.toLocaleString()}.\n\nYour ${goodDef?.name ?? 'product'} is only worth $${productValue.toLocaleString()}.\n\nMake a few more runs and build up your stash — or try a different kingpin with a lower minimum.`, choices: [{ id: 'understood', text: 'Understood', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] };
        return { ...state, pendingEvent: pw, lastEventMessage: 'Need more product.' };
      }

      const sellPriceData = state.currentMarketPrices.find(p => p.goodId === sellGood.goodId);
      if (!sellPriceData) {
        const pw: ChoiceEvent = { id: 'kingpin_warn_' + Date.now().toString(36), title: 'No Buyer', context: 'No buyer for this product right now. Check the market prices first.', choices: [{ id: 'understood', text: 'Understood', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] };
        return { ...state, pendingEvent: pw };
      }

      const goodName = goodDef?.name ?? 'goods';
      const adjustedPrice = Math.floor(sellPriceData.sellPrice * kingpin.sellPriceMod);
      const kingpinEvent = generateKingpinEncounter(state.player, kingpin, goodName, productValue);

      return {
        ...state,
        selectedKingpin: kingpin,
        pendingEvent: kingpinEvent,
        pendingSell: { goodId: sellGood.goodId, quantity: sellGood.quantity, baseSellPrice: adjustedPrice, countryId: 'london' },
        lastEventMessage: `Calling ${kingpin.name}...`,
        gameLog: [...state.gameLog, `[Turn $${state.turn}] Contacted kingpin: ${kingpin.name}.`],
      };
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
      return {
        ...state,
        pendingEvent: kingpinEvent,
        pendingSell: { goodId: sellGood.goodId, quantity: sellGood.quantity, baseSellPrice: sellPriceData.sellPrice, countryId: country.id },
        lastEventMessage: `Meeting kingpin in ${country.city}...`,
        gameLog: [...state.gameLog, `[Turn $${state.turn}] Kingpin meeting.`],
      };
    }

    case 'SELL': {
      if (state.gamePhase !== 'selling') return { ...state, lastEventMessage: 'You can only sell through the kingpin.' };
      return { ...state, lastEventMessage: 'Use MEET_KINGPIN to arrange a sale.' };
    }

    case 'STASH_GOODS': {
      if (state.gamePhase !== 'selling' && state.gamePhase !== 'home') return { ...state, lastEventMessage: 'Cannot stash goods now.' };
      if (state.player.inventory.length === 0) return { ...state, lastEventMessage: 'Nothing to stash.' };

      const stashWeight = state.player.inventory.reduce((sum, item) => {
        const g = state.goods.find(x => x.id === item.goodId);
        return sum + (g ? g.weight * item.quantity : 0);
      }, 0);
      const stashFree = state.player.stashCapacity - state.player.stash.reduce((sum, item) => {
        const g = state.goods.find(x => x.id === item.goodId);
        return sum + (g ? g.weight * item.quantity : 0);
      }, 0);

      if (stashWeight > stashFree) return { ...state, lastEventMessage: `Not enough stash space. Need $${stashWeight.toFixed(1)}kg, have ${stashFree.toFixed(1)}kg free.` };

      let updatedStash = state.player.stash.map(s => ({ ...s }));
      for (const item of state.player.inventory) {
        const idx = updatedStash.findIndex(s => s.goodId === item.goodId);
        if (idx >= 0) {
          updatedStash[idx] = { ...updatedStash[idx], quantity: updatedStash[idx].quantity + item.quantity };
        } else {
          updatedStash.push({ goodId: item.goodId, quantity: item.quantity });
        }
      }

      return {
        ...state,
        player: { ...state.player, inventory: [], stash: updatedStash },
        lastEventMessage: `Stashed $${state.player.inventory.reduce((s, i) => s + i.quantity, 0)} units in your storage.`,
        gameLog: [...state.gameLog, `[Turn $${state.turn}] Goods stashed.`],
      };
    }

    case 'RETRIEVE_GOODS': {
      if (state.gamePhase !== 'selling' && state.gamePhase !== 'home') return { ...state, lastEventMessage: 'Cannot retrieve goods now.' };
      const stashItem = state.player.stash.find(s => s.goodId === action.goodId);
      if (!stashItem || stashItem.quantity < action.quantity) return { ...state, lastEventMessage: 'Not enough in stash.' };

      const g = state.goods.find(x => x.id === action.goodId);
      const weightNeeded = g ? g.weight * action.quantity : 0;
      const capFree = state.player.inventoryCapacity - state.player.inventory.reduce((sum, item) => {
        const gi = state.goods.find(x => x.id === item.goodId);
        return sum + (gi ? gi.weight * item.quantity : 0);
      }, 0);
      if (weightNeeded > capFree) return { ...state, lastEventMessage: `Not enough inventory space.` };

      let newStash = state.player.stash.map(s => s.goodId === action.goodId ? { ...s, quantity: s.quantity - action.quantity } : s).filter(s => s.quantity > 0);
      let newInv = state.player.inventory.map(i => ({ ...i }));
      const existing = newInv.find(i => i.goodId === action.goodId);
      if (existing) {
        newInv = newInv.map(i => i.goodId === action.goodId ? { ...i, quantity: i.quantity + action.quantity } : i);
      } else {
        newInv.push({ goodId: action.goodId, quantity: action.quantity });
      }

      return {
        ...state,
        player: { ...state.player, stash: newStash, inventory: newInv },
        lastEventMessage: `Retrieved $${action.quantity}x from stash.`,
        gameLog: [...state.gameLog, `[Turn $${state.turn}] Retrieved from stash.`],
      };
    }

    case 'FLY_HOME': {
      if (state.gamePhase !== 'buying') return { ...state, lastEventMessage: 'Cannot fly home now.' };
      let updatedPlayer = { ...state.player, currentCountryId: ORIGIN_COUNTRY, cash: Math.max(0, state.player.cash) };
      updatedPlayer = handleOverdraft(updatedPlayer);
      return { ...state, player: updatedPlayer, gamePhase: 'home', lastEventMessage: 'You flew home empty-handed. Better luck next time.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Flew home empty.`] };
    }

    // ====== RESPOND_EVENT (handles multiple event types) ======
    case 'RESPOND_EVENT': {
      if (!state.pendingEvent) return state;

      // Chance card
      if (state.pendingEvent.id.startsWith('chance_card_')) {
        const choice = state.pendingEvent.choices[0];
        const ce = choice.successEffects;
        let u = { ...state.player };
        if (ce.cashDelta !== 0) u.cash = Math.max(-1000, u.cash + ce.cashDelta);
        if (ce.heatDelta) u.heat = Math.min(100, Math.max(0, u.heat + ce.heatDelta));
        if (ce.reputationDelta) u.reputation = Math.min(100, Math.max(0, u.reputation + ce.reputationDelta));
        if (ce.credibilityDelta) u.credibility = Math.min(100, Math.max(0, u.credibility + ce.credibilityDelta));
        return { ...state, player: u, pendingEvent: null, lastEventMessage: `${ce.message}`, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${ce.message}`] };
      }

      // Tutorial — first run congratulations
      if (state.pendingEvent.id.startsWith('tutorial_')) {
        return { ...state, pendingEvent: null, firstRunTutorialShown: true, lastEventMessage: 'Now build your stash. Book another flight.' };
      }

      // Cash warning — dismiss
      if (state.pendingEvent.id.startsWith('no_cash_')) {
        return { ...state, pendingEvent: null, lastEventMessage: 'Go to your bank and withdraw more cash.' };
      }

      // End trip warning — dismiss
      if (state.pendingEvent.id.startsWith('end_trip_warn_')) {
        return { ...state, pendingEvent: null, lastEventMessage: 'Resolve the issue before booking another flight.' };
      }

      // Kingpin warning — dismiss
      if (state.pendingEvent.id.startsWith('kingpin_warn_')) {
        return { ...state, pendingEvent: null, lastEventMessage: 'Stash more product and try again.' };
      }

      // Flight confirmation
      if (state.pendingEvent.id.startsWith('confirm_flight_') && state.pendingFlight) {
        if (action.choiceId === 'go_back') {
          return { ...state, pendingEvent: null, pendingFlight: null, lastEventMessage: 'Flight cancelled.' };
        }
        const { toCountryId, travelClass } = state.pendingFlight;
        // Check for first-time $20k+ cash threshold — show big time warning
        const firstTimeBigCash = state.player.cash >= 20000 && state.player.peakNetWorth < 20000;
        if (firstTimeBigCash) {
          const bigTimeEvent: ChoiceEvent = {
            id: 'bigtime_' + Date.now().toString(36),
            title: 'You Have Entered the Big Leagues',
            context: [
              `You have purchased a ticket with $${state.player.cash.toLocaleString()} in your pocket.`,
              `Carrying $20,000 or more in cash changes your status. From now on, outbound flights will trigger customs checks. Security will be more suspicious. Dogs may circle your luggage. Officers may pull you aside.`,
              `You will need to talk your way through, bribe your way through, or get lucky. The days of walking straight through security are over.`,
              `This is the price of doing serious business. Welcome to the big leagues, Angelo.`,
            ].join('\n\n'),
            choices: [
              { id: 'continue', text: 'Proceed to the airport', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: 'return_home', text: 'Return home — you are not ready', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            ],
          };
          return { ...state, pendingEvent: bigTimeEvent, pendingFlight: { toCountryId, travelClass }, lastEventMessage: 'You are now carrying $20,000+. Security will be tighter.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Big time threshold reached.`] };
        }
        // Continue — execute the travel directly
        const cleanState = { ...state, pendingEvent: null, pendingFlight: null };
        return gameReducer(cleanState, { type: 'TRAVEL', toCountryId, travelClass });
      }

      // Big time narrative continuation — proceed to travel or return home
      if (state.pendingEvent.id.startsWith('bigtime_') && state.pendingFlight) {
        if (action.choiceId === 'return_home') {
          return { ...state, pendingEvent: null, pendingFlight: null, lastEventMessage: 'You decided to postpone the trip. Your cash is safe in your pocket.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Big time trip postponed.`] };
        }
        const { toCountryId, travelClass } = state.pendingFlight;
        const cleanState = { ...state, pendingEvent: null, pendingFlight: null };
        return gameReducer(cleanState, { type: 'TRAVEL', toCountryId, travelClass });
      }

      // Summary/dismiss — handles buy_more, fly_home, and regular dismiss
      if (state.pendingEvent.id.startsWith('summary_')) {
        // Fly home with product (from buy encounter summary)
        if (action.choiceId === 'fly_home') {
          const hasGoods = state.player.inventory.length > 0;
          if (hasGoods) {
            // Route through full TRAVEL flow for return flight with customs
            const travelClass = state.pendingFlight?.travelClass ?? 'economy';
            const cleanState = { ...state, gamePhase: 'flying_out' as const, pendingEvent: null, pendingBuy: null };
            return gameReducer(cleanState, { type: 'TRAVEL', toCountryId: ORIGIN_COUNTRY, travelClass });
          } else {
            let u = { ...state.player, currentCountryId: ORIGIN_COUNTRY };
            return { ...state, player: u, gamePhase: 'home', pendingEvent: null, lastEventMessage: 'Back in London.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Returned home.`] };
          }
        }
        if (action.choiceId === 'buy_more') {
          // Re-create dealer meeting with quantity options
          const dealer = state.selectedDealer;
          if (!dealer) return { ...state, pendingEvent: null, lastEventMessage: 'No dealer selected.' };
          const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
          const unit = selectedGood?.unitOfMeasure ?? 'x';
          const mktPrice = state.currentMarketPrices.find(p => p.goodId === state.selectedProductId);
          const buyPrice = mktPrice ? Math.floor(mktPrice.buyPrice * (1 + (dealer.priceModifier - 1) * 0.5)) : 100;
          const defQty = selectedGood?.standardDealSize ?? 10;
          const totalCost = buyPrice * defQty;
          const dealerIntro: ChoiceEvent = {
            id: 'dealer_intro_' + Date.now().toString(36),
            title: `Meeting ${dealer.name}`,
            context: `${dealer.name} is waiting for you at ${dealer.location}.\n\n${selectedGood?.name ?? 'product'}: $${buyPrice}/${unit}\nCash on hand: $${state.player.cash.toLocaleString()}\n\n⚠ Keep at least $500 spare for customs on the way home.`,
            choices: [
              { id: 'qty_2', text: `2 ${unit}s — $${(buyPrice * 2).toLocaleString()}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: `qty_${defQty}`, text: `${defQty} ${unit}s — $${totalCost.toLocaleString()}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: 'custom_qty', text: 'Custom amount...', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: 'back_out', text: 'Something\'s off — walk away', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            ],
          };
          return { ...state, pendingEvent: dealerIntro, lastEventMessage: 'Back to the deal.' };
        }
        const isProceed = action.choiceId === 'continue';
        return { ...state, pendingEvent: null, headingToAirport: isProceed ? true : state.headingToAirport, lastEventMessage: isProceed ? 'Choose your destination.' : '' };
      }

      // Travel sniff
      if (state.pendingEvent.id === 'travel_sniff' && state.travelSniff) {
        const choice = state.pendingEvent.choices.find(c => c.id === action.choiceId);
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
        // Don't move to destination if busted; only move if bribe/bluff succeeded and not abort
        const sniffToCountry = (!busted && choice.id !== 'abort') ? getCountry(state.travelSniff.toCountryId) : null;
        if (sniffToCountry) updatedPlayer.currentCountryId = state.travelSniff.toCountryId;
        updatedPlayer = handleOverdraft(updatedPlayer);
        const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
        const message = `[$${outcomeLabel}] ${effects.message}`;
        if (busted) {
          const bustVariants = ['They slam you face-first onto the counter.', 'Two officers drag you into a windowless room.', 'The dog handler grins as the sniffer sits by your bag.', 'They march you through the terminal in full view.', 'The customs officer reads from a screen.'];
          const bustContext = bustVariants[Math.floor(Math.random() * bustVariants.length)];
          const summaryEvent = generateSummaryEvent('BUSTED', `BUSTED. Taken to police cells.\n\n${bustContext}\n\nLost: ALL cash (${lostAllCash.toLocaleString()} confiscated)`, false);
          let updatedState: GameState = { ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: summaryEvent, travelSniff: null, lastEventMessage: '', gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`], turn: state.turn + 1 };
          updatedState.director = updateDirector(updatedState.director, updatedState.player, updatedState);
          if (!updatedState.player.runActive) return { ...updatedState, lastEventMessage: 'Debt exceeds $1,000. Game over.' };
          return updatedState;
        }
        // Successful sniff (no bust) — transition to arrival flow
        if (sniffToCountry) {
          const sniffArrivalLines = [`You pass through ${sniffToCountry.city} airport after the checkpoint. Your documents are in order.`, `You collect your belongings and head towards the exit. Welcome to ${sniffToCountry.city}.`];
          const arrivalEvent: ChoiceEvent = { id: 'arrival_' + Date.now().toString(36), title: `Customs Clearance — ${sniffToCountry.name}`, context: sniffArrivalLines.join('\n\n'), choices: [{ id: 'proceed_arrival', text: 'Continue', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] };
          let updatedState: GameState = { ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: arrivalEvent, travelSniff: null, gamePhase: 'arrived', lastEventMessage: '', gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`], turn: state.turn + 1, securitySniffsPassed: success ? state.securitySniffsPassed + 1 : state.securitySniffsPassed };
          updatedState.currentMarketPrices = generateMarketPrices(sniffToCountry, state.director, 0, updatedPlayer.heat);
          updatedState.director = updateDirector(updatedState.director, updatedState.player, updatedState);
          return updatedState;
        }
        // Aborted — back to origin
        let updatedState: GameState = { ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: null, travelSniff: null, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`], turn: state.turn + 1 };
        updatedState.director = updateDirector(updatedState.director, updatedState.player, updatedState);
        return updatedState;
      }

      // Arrival — show dealer selection (or route to selling if home)
      if (state.pendingEvent.id.startsWith('arrival_')) {
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
          choices: options.map(opt => ({ id: opt.profile.dealerId, text: `${opt.profile.name} — ${opt.profile.location}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } })),
        };
        return { ...state, gamePhase: 'selecting_dealer', pendingEvent: dealerEvent, lastEventMessage: 'Choose your supplier.' };
      }

      // Dealer select — show dealer intro
      if (state.pendingEvent.id.startsWith('dealer_select_')) {
        const country = getCountry(state.player.currentCountryId);
        if (!country) return state;
        const options = getDealerOptions(country.id, state.dealerRapport);
        const selected = options.find(o => o.profile.dealerId === action.choiceId);
        if (!selected) return { ...state, lastEventMessage: 'Invalid selection.' };
        const dealer = selected.profile;
        const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
        const goodName = selectedGood?.name ?? 'product';
        const unit = selectedGood?.unitOfMeasure ?? 'x';
        const mktPrice = state.currentMarketPrices.find(p => p.goodId === state.selectedProductId);
        const buyPrice = mktPrice ? Math.floor(mktPrice.buyPrice * (1 + (dealer.priceModifier - 1) * 0.5)) : 100;
        const defQty = selectedGood?.standardDealSize ?? 10;
        const totalCost = buyPrice * defQty;
        const dealerIntro: ChoiceEvent = {
          id: 'dealer_intro_' + Date.now().toString(36),
          title: `Meeting ${dealer.name}`,
          context: `${dealer.name} is waiting for you at ${dealer.location}.\n\n${goodName}: $${buyPrice}/${unit}\nCash on hand: $${state.player.cash.toLocaleString()}\n\n⚠ Keep at least $500 spare for customs on the way home.`,
          choices: [
            { id: 'qty_2', text: `2 ${unit}s — $${(buyPrice * 2).toLocaleString()}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            { id: `qty_${defQty}`, text: `${defQty} ${unit}s — $${totalCost.toLocaleString()}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            { id: 'custom_qty', text: 'Custom amount...', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            { id: 'back_out', text: 'Something\'s off — walk away', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
          ],
        };
        return { ...state, gamePhase: 'buying', selectedDealer: dealer, pendingEvent: dealerIntro, lastEventMessage: `Meeting ${dealer.name}...` };
      }

      // Dealer intro / custom qty — negotiation choices
      if (state.pendingEvent.id.startsWith('dealer_intro_') || state.pendingEvent.id.startsWith('custom_qty_')) {
        const dealer = state.selectedDealer;
        const pr = dealer ? p(dealer) : p({ gender: 'male' });
        const rapport = state.dealerRapport[dealer?.dealerId ?? ''] ?? 0;

        // Haggle win lines — per dealer
        const haggleWin: Record<string, string> = {
          col_1: `${dealer?.name} inclines his head — the barest fraction. "Angelo. You have nerve. I respect nerve." He pauses. "Fifteen percent off. Because I like you. That is the only reason, you clever cunt."`,
          col_2: `${dealer?.name} wipes sweat from his forehead. "Okay, okay, Angelo. You drive a hard bargain. Fifteen off. But if anyone asks, I charged you full price, you spastic." He looks around nervously.`,
          col_3: `${dealer?.name} studies you for a long moment. Then she closes her laptop. "Twenty percent off, Angelo. And don't expect it again, you cheeky cunt."`,
          net_1: `${dealer?.name} laughs and passes you the joint. "Angelo, my man. You're all right. Here, take the discount. Call it a friendship discount, you handsome bastard."`,
          net_2: `${dealer?.name} looks at you over her glasses. Then she almost smiles. "Fifteen percent off, Angelo. You've earned it. Don't make me regret it, you spastic."`,
          net_3: `${dealer?.name} blinks. "Oh, wow. Yeah, man, Angelo, of course. I can totally do a discount. What were we talking about again, you absolute retard?" He knocks fifteen percent off without even realising it.`,
          esp_1: `${dealer?.name} spreads his arms wide. "Angelo! Brother! You are a businessman after my own heart. Fifteen off. We do this again, yeah, you brilliant cunt?"`,
          esp_2: `${dealer?.name} snorts. "Alright, Angelo. You've got more spine than most of the cunts who sit in that chair. Fifteen percent off. Don't push your luck, you fucking spastic."`,
          esp_3: `${dealer?.name} pumps his fist. "YES! I knew negotiating was the right move, Angelo! Oh, uh — I mean. Fifteen off. Very professional. Very serious." He tries to look cool. It doesn't work, the little retard.`,
          afg_1: `${dealer?.name} is silent for a long moment. Then — the barest hint of amusement. "You honour me with your persistence, Angelo. The discount is yours. Sit. Have more tea, you clever cunt."`,
          afg_2: `${dealer?.name} stares at you. Then he laughs — a short, hard sound. "Angelo. You fight like a Pashtun. I respect that." He knocks twenty percent off. "Do not expect this again, you mad spastic."`,
          afg_3: `${dealer?.name} doesn't react. Then she pushes the steel table slightly. "Fifteen percent, Angelo. Because I'm curious what you'll do with it, you strange little nonce."`,
        };
        const haggleLose: Record<string, string> = {
          col_1: `${dealer?.name} doesn't blink. "I don't negotiate, Angelo. The price is the price. Now it's twenty percent higher for wasting my time. Take it or leave it, you cunt."`,
          col_2: `${dealer?.name}'s face twists. "Angelo. You come to MY city, in MY bar, and try to mug ME off? The price just went up twenty percent, you cheeky little cunt. Take it or piss off."`,
          col_3: `${dealer?.name} closes her laptop with a sharp click. "I don't have time for amateurs who think they can haggle with me, Angelo. The price is now twenty percent higher. Accept it, you retard, or get out."`,
          net_1: `${dealer?.name} frowns. "Not cool, Angelo. Not cool at all. The price just went up. This isn't a market stall, this is a business. Professional. We had a good thing going here, you spastic."`,
          net_2: `${dealer?.name}'s expression doesn't change, but the temperature in the room drops. "You're wasting my time, Angelo. The price just went up twenty percent. I have a conference call in six minutes. Decide, you nonce."`,
          net_3: `${dealer?.name}'s expression hardens. "Wait, what? No, no, no, Angelo. That was the friend price. Now it's the... not-friend price. Which is higher, you absolute retard." He tries to look stern. It almost works.`,
          esp_1: `${dealer?.name} looks genuinely hurt. "Angelo... I thought we had something here, brother. Now the price goes up. Fifteen percent. Because you broke my heart a little, you cunt."`,
          esp_2: `${dealer?.name} laughs — a dry, humourless sound. "Ballsy. Stupid, but ballsy, Angelo. The price just went up twenty percent. You can pay it or you can fuck off back to whatever rock you crawled out from under, you spastic."`,
          esp_3: `${dealer?.name} looks crushed. "Oh. Oh, no, Angelo. I was really hoping you'd just... accept it? I'm not very good at the 'price just went up' thing. But — it did. It went up, you retard. I read about this in a business book."`,
          afg_1: `${dealer?.name} sets down his tea. Slowly. Deliberately. "You try to bargain with an elder in his own home, Angelo. The price is now thirty percent higher. Pay it, or leave my compound, you disrespectful nonce."`,
          afg_2: `${dealer?.name} leans forward. "Angelo. I have killed men for less disrespect than you just showed me. The price is twenty percent higher. If you argue again, it goes up another twenty, you spastic. And my patience is not infinite."`,
          afg_3: `${dealer?.name} says nothing for five full seconds. Then: "Disappointing, Angelo." One word. It lands like a hammer. "Twenty percent more. Accept or go, you strange little retard."`,
        };

        if (action.choiceId === 'cancel') {
          const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
          const mktPrice = state.currentMarketPrices.find(p => p.goodId === state.selectedProductId);
          const dealer = state.selectedDealer;
          const buyPrice = mktPrice ? Math.floor(mktPrice.buyPrice * (1 + (dealer ? dealer.priceModifier - 1 : 0) * 0.5)) : 100;
          const unit = selectedGood?.unitOfMeasure ?? 'x';
          const defQty = selectedGood?.standardDealSize ?? 10;
          const totalCost = buyPrice * defQty;
          const dealerIntro: ChoiceEvent = {
            id: 'dealer_intro_' + Date.now().toString(36),
            title: `Meeting ${dealer?.name}`,
            context: `${dealer?.name} is waiting for you at ${dealer?.location}.\n\n${selectedGood?.name ?? 'product'}: $${buyPrice}/${unit}\nCash on hand: $${state.player.cash.toLocaleString()}\n\n⚠ Keep at least $500 spare for customs on the way home.`,
            choices: [
              { id: 'qty_2', text: `2 ${unit}s — $${(buyPrice * 2).toLocaleString()}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: `qty_${defQty}`, text: `${defQty} ${unit}s — $${totalCost.toLocaleString()}`, odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: 'custom_qty', text: 'Custom amount...', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: 'back_out', text: 'Something\'s off — walk away', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            ],
          };
          return { ...state, pendingEvent: dealerIntro, lastEventMessage: 'Back to the deal.' };
        }

        if (action.choiceId === 'back_out') {
          const walkAways: Record<string, string> = {
            col_1: `You stand. Angelo. ${dealer?.name} doesn't move. "Pity." One word. Cold as the finca stones.`,
            col_2: `${dealer?.name} looks almost relieved. "Yeah. Yeah, okay, Angelo. Maybe next time. When I'm less... you know." He gestures vaguely at everything.`,
            col_3: `${dealer?.name} doesn't look up from her laptop. "Door's behind you, Angelo." She's already typing.`,
            net_1: `${dealer?.name} gives you a lazy wave. "No worries, Angelo. The canal's nice this time of year. Enjoy your walk, you spastic."`,
            net_2: `${dealer?.name} picks up her phone. "Security will show you out, Angelo. I have a call." You were never really there.`,
            net_3: `${dealer?.name} looks confused. "Oh. Right. Yeah, sure, Angelo. Come back anytime! I'll probably be here. Unless I'm at the park, you retard."`,
            esp_1: `${dealer?.name} clutches his chest dramatically. "Angelo! Brother! You wound me! But okay — I respect the decision. Come back when you're ready to party, you cunt."`,
            esp_2: `${dealer?.name} shrugs. "Your loss, Angelo. I was looking forward to doing business. Now get out of my bar, you nonce."`,
            esp_3: `${dealer?.name} deflates. "Oh. Okay, Angelo. That's fine. Totally fine. I wasn't... emotionally invested or anything, you retard." He was emotionally invested.`,
            afg_1: `${dealer?.name} inclines his head. "Go in peace, Angelo. The road to Kandahar is dangerous at night."`,
            afg_2: `${dealer?.name} snorts. "Go, Angelo. Before I change my mind about letting you leave, you cheeky cunt."`,
            afg_3: `You turn. From behind you, Angelo, barely audible: "Yeah. Keep walking, retard." The voice is so quiet you almost imagine it.`,
          };
          const walkLine = walkAways[dealer?.dealerId ?? ''] ?? 'You walked away from the deal. Choose another contact or fly home.';
          return { ...state, gamePhase: 'selecting_dealer', selectedDealer: null, pendingEvent: null, lastEventMessage: walkLine };
        }
        if (action.choiceId === 'negotiate') {
          const haggleSuccessChance = 0.3 + rapport * 0.15;
          const roll = Math.random();
          if (roll < haggleSuccessChance) {
            const negotiateEvent: ChoiceEvent = {
              id: 'haggle_win_' + Date.now().toString(36),
              title: 'Deal Sweetened',
              context: haggleWin[dealer?.dealerId ?? ''] ?? `${dealer?.name} grins. "You drive a hard bargain. Fine — I'll knock 20% off. But you owe me a favour next time."\n\nThe price drops. ${pr.He} seems to respect the negotiation.`,
              choices: [{ id: 'accept_deal', text: 'Take the discounted deal', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 3, credibilityDelta: 5, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }],
            };
            return { ...state, pendingEvent: negotiateEvent, lastEventMessage: 'Haggle successful — price lowered.' };
          }
          const negotiateFail: ChoiceEvent = {
            id: 'haggle_lose_' + Date.now().toString(36),
            title: 'Dealer Offended',
            context: haggleLose[dealer?.dealerId ?? ''] ?? `${dealer?.name}'s expression hardens. "You think I run a fucking charity? The price just went up 15%. Take it or leave it."`,
            choices: [
              { id: 'accept_deal', text: 'Accept the higher price', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: -2, credibilityDelta: -3, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: 'back_out', text: 'Walk away — this deal is dead', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            ],
          };
          return { ...state, pendingEvent: negotiateFail, lastEventMessage: 'Haggle failed — price increased.' };
        }
        // Custom quantity — show input screen
        if (action.choiceId === 'custom_qty') {
          const selectedGood = state.goods.find(g => g.id === state.selectedProductId);
          const mktPrice = state.currentMarketPrices.find(p => p.goodId === state.selectedProductId);
          const dealer = state.selectedDealer;
          const buyPrice = mktPrice ? Math.floor(mktPrice.buyPrice * (1 + (dealer ? dealer.priceModifier - 1 : 0) * 0.5)) : 100;
          const maxQty = Math.max(1, Math.floor((state.player.cash - 500) / buyPrice));
          const unit = selectedGood?.unitOfMeasure ?? 'x';
          const customEvent: ChoiceEvent = {
            id: 'custom_qty_' + Date.now().toString(36),
            title: 'Custom Amount',
            context: `${dealer?.name ?? 'Dealer'}: "${selectedGood?.name ?? 'product'} — $${buyPrice}/${unit}. How many, Angelo?"`,
            choices: [
              { id: 'confirm', text: '', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
              { id: 'cancel', text: 'Cancel — go back', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            ],
          };
          (customEvent as any)._buyPrice = buyPrice;
          (customEvent as any)._maxQty = maxQty;
          (customEvent as any)._unit = unit;
          (customEvent as any)._goodName = selectedGood?.name ?? 'product';
          return { ...state, pendingEvent: customEvent, lastEventMessage: 'Choose your amount.' };
        }
        // Quantity selection — dispatch BUY with chosen amount
        if (action.choiceId.startsWith('qty_')) {
          const qty = parseInt(action.choiceId.replace('qty_', ''), 10);
          if (isNaN(qty) || qty <= 0) return { ...state, lastEventMessage: 'Invalid quantity.' };
          const cleanState = { ...state, pendingEvent: null };
          return gameReducer(cleanState, { type: 'BUY', goodId: state.selectedProductId!, quantity: qty });
        }
      }

      // Haggle win — proceed to buy with rapport bonus
      if (state.pendingEvent.id.startsWith('haggle_win_') && action.choiceId === 'accept_deal') {
        const boosted = { ...state.player, reputation: Math.min(100, state.player.reputation + 3), credibility: Math.min(100, state.player.credibility + 5) };
        const goodDef = state.goods.find(g => g.id === state.selectedProductId);
        const defQty = goodDef?.standardDealSize ?? 10;
        const cleanState = { ...state, player: boosted, pendingEvent: null };
        return gameReducer(cleanState, { type: 'BUY', goodId: state.selectedProductId!, quantity: defQty });
      }

      // Haggle lose — either accept higher price or walk away
      if (state.pendingEvent.id.startsWith('haggle_lose_')) {
        if (action.choiceId === 'back_out') {
          const dealer = state.selectedDealer;
          const pr = dealer ? p(dealer) : p({ gender: 'male' });
          return { ...state, gamePhase: 'selecting_dealer', selectedDealer: null, pendingEvent: null, lastEventMessage: `You walked away. ${dealer?.name} mutters something under ${pr.his} breath.` };
        }
        // accept_deal — buy with penalty
        let penalised = { ...state.player, reputation: Math.max(0, state.player.reputation - 2), credibility: Math.max(0, state.player.credibility - 3) };
        const goodDef = state.goods.find(g => g.id === state.selectedProductId);
        const defQty = goodDef?.standardDealSize ?? 10;
        const cleanState = { ...state, player: penalised, pendingEvent: null };
        return gameReducer(cleanState, { type: 'BUY', goodId: state.selectedProductId!, quantity: defQty });
      }

      // Buy encounter (enc_ — dealer negotiation)
      if (state.pendingEvent.id.startsWith('enc_')) {
        const choice = state.pendingEvent.choices.find(c => c.id === action.choiceId);
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

        // Complete pending purchase on success
        let buySummaryMsg: string | null = null;
        if (state.pendingBuy) {
          if (success) {
            updatedPlayer = deductCash(updatedPlayer, state.pendingBuy.totalCost);
            updatedPlayer = addGood(updatedPlayer, state.pendingBuy.goodId, state.pendingBuy.quantity);
            const goodDef = state.goods.find(g => g.id === state.pendingBuy!.goodId);
            buySummaryMsg = `BOUGHT ${state.pendingBuy.quantity} ${goodDef?.unitOfMeasure ?? 'unit'}${state.pendingBuy.quantity > 1 ? 's' : ''} of ${goodDef?.name ?? 'product'} FOR $${state.pendingBuy.totalCost.toLocaleString()}.`;
            // Increase rapport with selected dealer
            const dealerId = state.selectedDealer?.dealerId;
            if (dealerId) {
              const current = state.dealerRapport[dealerId] ?? 0;
              state = { ...state, dealerRapport: { ...state.dealerRapport, [dealerId]: current + 1 } };
            }
          } else {
            buySummaryMsg = 'The deal fell through.';
          }
          state = { ...state, pendingBuy: null };
        }

        updatedPlayer = handleOverdraft(updatedPlayer);
        const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
        const messageText = effects.message ? `[$${outcomeLabel}] ${effects.message}` : '';

        // After buying completes — show deal summary
        const hasGoods = updatedPlayer.inventory.length > 0;
        const flyLines = [messageText];
        if (buySummaryMsg) flyLines.push(buySummaryMsg);
        // Dealer farewell — short one-liner on successful deal
        if (success && state.selectedDealer) {
          const farewells: Record<string, string> = {
            col_1: `${state.selectedDealer.name} nods once. "Pleasure doing business with you, Angelo. Now fuck off."`,
            col_2: `${state.selectedDealer.name} glances at the door. "Right. Get out before you draw attention to us, you spastic."`,
            col_3: `${state.selectedDealer.name} opens ${p(state.selectedDealer).his} laptop without looking up. "The door is behind you, Angelo. Don't come back without more cash."`,
            net_1: `${state.selectedDealer.name} gives you a lazy wave. "Nice one bruv. Say nothing to no one, yeah?"`,
            net_2: `${state.selectedDealer.name} taps ${p(state.selectedDealer).his} phone. "Transaction complete. Delete this conversation, you nonce."`,
            net_3: `${state.selectedDealer.name} looks genuinely pleased. "Oh wow, that was great, Angelo! Come back anytime. I'll probably be here. Unless I'm at the park, you retard."`,
            esp_1: `${state.selectedDealer.name} embraces you like a brother. "Angelo! Go with God. And the product. Mostly the product, you brilliant cunt."`,
            esp_2: `${state.selectedDealer.name} lights a cigarette. "Business concluded. Now get out of my bar before someone recognises you, you fucking spastic."`,
            esp_3: `${state.selectedDealer.name} fumbles with a drawer. "¡Adiós, Angelo! I had a loyalty card for you but I think I lost it. Come back anyway, you retard!"`,
            afg_1: `${state.selectedDealer.name} sets down ${p(state.selectedDealer).his} tea. "Go in peace, Angelo. The road to the airport is dangerous after dark. You would do well to hurry, you strange little nonce."`,
            afg_2: `${state.selectedDealer.name} stares at you with unblinking intensity. "We are done here. If you speak of this meeting, I will know. Now go, you cheeky cunt."`,
            afg_3: `From behind you, barely audible: "Yeah. Keep walking, retard. See you next time." ${state.selectedDealer.name} has already turned away.`,
          };
          const farewellLine = farewells[state.selectedDealer.dealerId];
          if (farewellLine) flyLines.push(farewellLine);
        }
        flyLines.push(`Remaining Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`);
        const flyChoices: ChoiceEvent = {
          id: 'summary_' + Date.now().toString(36),
          title: buySummaryMsg ? (success ? 'Deal Successful' : 'Deal Failed') : 'Deal Failed',
          context: flyLines.join('\n\n'),
          choices: [
            { id: 'fly_home', text: hasGoods ? 'Fly home with product' : 'Fly home empty-handed', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
            ...(hasGoods ? [{ id: 'buy_more', text: 'Try to buy more', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } }] : []),
          ],
        };
        return { ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: flyChoices, pendingBuy: null, lastEventMessage: '', gameLog: [...state.gameLog, `[Turn $${state.turn}] ${messageText}`], turn: state.turn + 1, director: updateDirector(state.director, updatedPlayer, state), buyDealsCompleted: success ? state.buyDealsCompleted + 1 : state.buyDealsCompleted };
      }

      // Sell encounter (sell_enc_ or kingpin_ — kingpin)
      if ((state.pendingEvent.id.startsWith('sell_enc_') || state.pendingEvent.id.startsWith('kingpin_')) && state.pendingSell) {
        const choice = state.pendingEvent.choices.find(c => c.id === action.choiceId);
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
          if (success) updatedPlayer.cash += state.pendingSell.baseSellPrice * state.pendingSell.quantity;
          updatedPlayer = removeGood(updatedPlayer, state.pendingSell.goodId, state.pendingSell.quantity);
        }
        updatedPlayer = handleOverdraft(updatedPlayer);
        const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
        const messageText = effects.message ? `[$${outcomeLabel}] ${effects.message}` : '';
        const revenue = success && effects.inventoryLost ? state.pendingSell.baseSellPrice * state.pendingSell.quantity : 0;
        const sellLines = success
          ? [messageText, `SOLD $${state.pendingSell.quantity} units FOR $${revenue.toLocaleString()}.`, `Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`, '', 'The deal is done. You head back to your safehouse.']
          : [messageText, 'The deal failed. No payment received.', `Cash: $${updatedPlayer.cash.toLocaleString()}    Heat: ${updatedPlayer.heat}/100`, '', 'You slink back to your safehouse empty-handed.'];
        const sellSummary: ChoiceEvent = {
          id: 'summary_' + Date.now().toString(36),
          title: success ? 'Deal Successful' : 'Deal Failed',
          context: sellLines.join('\n\n'),
          choices: [
            { id: 'continue', text: 'Continue', odds: 1.0, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
          ],
        };
        return { ...state, player: updatePeakNetWorth(updatedPlayer, state.currentMarketPrices), pendingEvent: sellSummary, pendingSell: null, lastEventMessage: '', gameLog: [...state.gameLog, `[Turn $${state.turn}] ${messageText}`], turn: state.turn + 1, director: updateDirector(state.director, updatedPlayer, state), sellDealsCompleted: success ? state.sellDealsCompleted + 1 : state.sellDealsCompleted };
      }

      // Fallback: standard procedural event
      const { player, message } = resolveEventChoice(state.player, state.pendingEvent, action.choiceId);
      const playerWithPeak = updatePeakNetWorth(player, state.currentMarketPrices);
      const nw = getNetWorth(playerWithPeak, state.currentMarketPrices);
      const updated = handleOverdraft(playerWithPeak);
      let updatedState: GameState = { ...state, player: updated, pendingEvent: null, lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`], turn: state.turn + 1 };
      updatedState = journalEntry(updatedState, { turn: updatedState.turn, type: 'event', title: `Event: $${state.pendingEvent.title}`, description: message, cash: updated.cash, netWorth: nw, heat: updated.heat, reputation: updated.reputation });
      if (!updatedState.player.runActive) return { ...updatedState, lastEventMessage: 'Debt exceeds $1,000. Game over.' };
      return { ...updatedState, director: updateDirector(updatedState.director, updatedState.player, updatedState) };
    }

    // ====== HOME / SELLING shared actions ======
    case 'VIEW_MARKET': {
      const country = getCountry(state.player.currentCountryId)!;
      const tradeVol = getRecentTradeVolume(state);
      const prices = generateMarketPrices(country, state.director, tradeVol, state.player.heat);
      const priceList = prices.map(p => `${p.goodName}: Buy=$${p.buyPrice} Sell=${p.sellPrice} (Demand:${p.demand})`).join('\n  ');
      return { ...state, currentMarketPrices: prices, lastEventMessage: `Market prices in ${country.name}:\n  ${priceList}` };
    }

    case 'VIEW_INVENTORY': {
      const used = getUsedCapacity(state.player);
      const remaining = getRemainingCapacity(state.player);
      const invValue = getInventoryValue(state.player, state.currentMarketPrices);
      let invList = 'Empty';
      if (state.player.inventory.length > 0) {
        invList = state.player.inventory.map(i => { const g = state.goods.find(x => x.id === i.goodId); return `${g?.name ?? i.goodId}: ${i.quantity}x`; }).join('\n  ');
      }
      let stashList = 'Empty';
      if (state.player.stash.length > 0) {
        stashList = state.player.stash.map(i => { const g = state.goods.find(x => x.id === i.goodId); return `${g?.name ?? i.goodId}: ${i.quantity}x`; }).join('\n  ');
      }
      return { ...state, lastEventMessage: `INVENTORY (${used}/${state.player.inventoryCapacity}kg)\n  ${invList}\nEstimated value: ${invValue.toLocaleString()}\n\nSTASH (${state.player.stash.reduce((s,i) => { const g = state.goods.find(x => x.id === i.goodId); return s + (g ? g.weight * i.quantity : 0); }, 0).toFixed(1)}/${state.player.stashCapacity}kg)\n  ${stashList}` };
    }

    case 'WAIT': {
      let updatedPlayer: PlayerState = { ...state.player };
      const ops = getActiveOperationalBenefits(updatedPlayer);
      const decay = Math.floor((5 + Math.random() * 10) * (1 + ops.heatDecayBonus));
      updatedPlayer.heat = Math.max(0, updatedPlayer.heat - decay);
      updatedPlayer.credibility = Math.max(0, updatedPlayer.credibility - 5);
      const repDecay = Math.floor(1 + Math.random() * 2);
      updatedPlayer.reputation = Math.max(0, updatedPlayer.reputation - repDecay);
      let updatedState: GameState = { ...state, player: updatedPlayer, turn: state.turn + 1, lastEventMessage: `You wait and lie low. Heat -$${decay}. Credibility -5. Reputation -${repDecay}.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Waited. Heat -${decay}. Cred -5. Rep -${repDecay}.`] };
      updatedState.director = updateDirector(updatedState.director, updatedState.player, updatedState);
      return tryTriggerProceduralEvent(updatedState);
    }

    case 'END_RUN': {
      const nw = getNetWorth(state.player, state.currentMarketPrices);
      return journalEntry({ ...state, player: { ...state.player, runActive: false }, lastEventMessage: 'Run ended. Game over.', gameLog: [...state.gameLog, `[Turn $${state.turn}] Run ended.`] }, { turn: state.turn, type: 'run_end', title: 'Run Concluded', description: `Final tally: $$${state.player.cash.toLocaleString()} cash · ${state.player.bank.toLocaleString()} bank · ${state.player.totalTrips} trips · ${state.player.totalBusts} busts`, cash: state.player.cash, netWorth: nw, heat: state.player.heat, reputation: state.player.reputation });
    }

    case 'END_TRIP': {
      const { player, message } = bankEndTrip(state.player, ORIGIN_COUNTRY);
      let updatedState: GameState = { ...state, player: updatePeakNetWorth(player, state.currentMarketPrices), lastEventMessage: message, gameLog: [...state.gameLog, `[Turn $${state.turn}] ${message}`], turn: state.turn + 1, gamePhase: 'home' };
      updatedState.director = updateDirector(updatedState.director, updatedState.player, updatedState);
      return updatedState;
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
      return journalEntry({ ...state, player: updatePeakNetWorth(player, state.currentMarketPrices), lastEventMessage: `Purchased $${asset.name} for ${asset.price.toLocaleString()}. Credit +${asset.creditValue}.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Bought asset: ${asset.name}.`] }, { turn: state.turn, type: 'purchase', title: `Bought $${asset.name}`, description: asset.description, cash: player.cash, netWorth: nw, heat: player.heat, reputation: player.reputation });
    }

    case 'SELL_ASSET': {
      const { player, payout, success } = sellAsset(state.player, action.assetId);
      if (!success) return { ...state, lastEventMessage: 'Asset not found or not owned.' };
      return { ...state, player: updatePeakNetWorth(player, state.currentMarketPrices), lastEventMessage: `Sold asset for $${payout.toLocaleString()}.`, gameLog: [...state.gameLog, `[Turn $${state.turn}] Sold asset for ${payout.toLocaleString()}.`] };
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
    `Inventory: ${used}/${state.player.inventoryCapacity}kg used, ${remaining}kg free`,
    `Stash: ${state.player.stash.reduce((s,i) => s + i.quantity, 0)} units / ${state.player.stashCapacity}kg`,
    `Trips: ${state.player.totalTrips}  Busts: ${state.player.totalBusts}`,
    `Director: Tension=${state.director.tension} Boredom=${state.director.boredom} Attn=${state.director.enforcementAttention}`,
    `Last event: ${state.lastEventMessage.substring(0, 80)}`,
    `========================`,
  ].join('\n');
}
