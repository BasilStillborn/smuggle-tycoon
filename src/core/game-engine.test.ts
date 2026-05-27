import { describe, it, expect, beforeAll } from 'vitest';
import { createGameState, gameReducer, getStatusReport } from './game-engine';
import { getQuantityRiskMultiplier } from './heat';
import { generateProceduralEvent } from './events-procedural';
import { startTrip, endTrip, checkOverdraft } from './bank-actions';
import { createPlayer, BASE_CAPACITY, BASE_STASH_CAPACITY } from './player';
import { buyAsset, sellAsset, getAsset, getInventoryCapacity } from './assets';
import { getUsedCapacity } from './inventory';

// Polyfill localStorage for test environment
beforeAll(() => {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
});

describe('ANGELO Core Engine', () => {
  it('should create initial game state', () => {
    const state = createGameState();
    expect(state.player.cash).toBe(0);
    expect(state.player.bank).toBe(5000);
    expect(state.player.heat).toBe(0);
    expect(state.player.currentCountryId).toBe('london');
    expect(state.player.inventory).toEqual([]);
    expect(state.player.reputation).toBe(0);
    expect(state.player.notoriety).toBe(0);
    expect(state.player.credit).toBe(0);
    expect(state.player.credibility).toBe(0);
    expect(state.turn).toBe(0);
    expect(state.world.length).toBe(5);
    expect(state.goods.length).toBe(6);
    expect(state.currentMarketPrices.length).toBe(6);
  });

  it('should show market prices', () => {
    const state = createGameState();
    const result = gameReducer(state, { type: 'VIEW_MARKET' });
    expect(result.currentMarketPrices.length).toBe(6);
    expect(result.lastEventMessage).toContain('Market prices in');
    expect(result.lastEventMessage).toContain('Buy=$');
  });

  it('should handle START_TRIP and END_TRIP', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 2500 });
    expect(state.player.cash).toBe(2500);
    expect(state.player.bank).toBe(2500);

    state = gameReducer(state, { type: 'END_TRIP' });
    expect(state.player.cash).toBe(0);
    expect(state.player.bank).toBe(5000);
    expect(state.player.totalTrips).toBe(1);
    expect(state.player.currentCountryId).toBe('london');
  });

  it('should reject START_TRIP with insufficient bank', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 999999 });
    expect(state.player.cash).toBe(0);
    expect(state.player.bank).toBe(5000);
    expect(state.lastEventMessage).toContain('only have');
  });

  it('should allow buying goods', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 2500 });
    state = { ...state, gamePhase: 'buying' as const, selectedDealer: { countryId: 'london', dealerId: 'test', name: 'Test', gender: 'male', description: '', location: '', priceModifier: 1.0, riskBonus: 0, rapport: 0 } };
    const hashish = state.currentMarketPrices.find(p => p.goodId === 'hashish')!;
    state = gameReducer(state, { type: 'BUY', goodId: hashish.goodId, quantity: 5 });
    // BUY now triggers encounter in buying phase
    expect(state.pendingEvent).toBeTruthy();
  });

  it('should allow travel between countries', () => {
    // Need inventory to travel — simulate by setting a fake item
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 5000 });
    state = {
      ...state,
      player: { ...state.player, inventory: [{ goodId: 'hashish', quantity: 5 }] },
    };
    const targetId = state.world.find((c) => c.id !== state.player.currentCountryId)!.id;
    state = gameReducer(state, { type: 'TRAVEL', toCountryId: targetId, travelClass: 'economy' });
    // Travel might trigger sniff (probabilistic), so location may not change
    if (!state.pendingEvent) {
      expect(state.player.currentCountryId).toBe(targetId);
    }
  });

  it('should reject travel to same country', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 5000 });
    state = { ...state, pendingEvent: null };
    const result = gameReducer(state, { type: 'TRAVEL', toCountryId: state.player.currentCountryId, travelClass: 'economy' });
    expect(result.player.currentCountryId).toBe(state.player.currentCountryId);
    expect(result.lastEventMessage).toContain('already in this country');
  });

  it('should reject travel with insufficient cash', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 100 });
    // Chance card may have fired — clear pendingEvent if so
    state = { ...state, pendingEvent: null };
    const targetId = state.world.find((c) => c.id !== state.player.currentCountryId)!.id;
    const result = gameReducer(state, { type: 'TRAVEL', toCountryId: targetId, travelClass: 'economy' });
    expect(result.lastEventMessage).toContain('Not enough cash');
  });

  it('should handle WAIT action (heat + credibility decay)', () => {
    const state = { ...createGameState(), player: { ...createGameState().player, heat: 50, credibility: 50 } };
    const result = gameReducer(state, { type: 'WAIT' });
    expect(result.player.heat).toBeLessThan(50);
    expect(result.player.credibility).toBeLessThan(50);
    expect(result.turn).toBe(1);
  });

  it('should show inventory', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 5000 });
    // Clear any chance card
    state = { ...state, pendingEvent: null };
    const result = gameReducer(state, { type: 'VIEW_INVENTORY' });
    expect(result.lastEventMessage).toContain('INVENTORY');
    expect(result.lastEventMessage).toContain('kg');
  });

  it('should provide status report', () => {
    const state = createGameState();
    const report = getStatusReport(state);
    expect(report).toContain('ANGELO');
    expect(report).toContain('Bank:');
    expect(report).toContain('Cash:');
    expect(report).toContain('Heat:');
    expect(report).toContain('Director:');
  });

  it('should manage heat properly across actions', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 5000 });

    // WAIT should reduce heat directly (no pending event)
    const heatState = { ...state, player: { ...state.player, heat: 50 } };
    const result = gameReducer(heatState, { type: 'WAIT' });
    expect(result.player.heat).toBeLessThan(50);
    expect(result.player.heat).toBeGreaterThanOrEqual(0);
    expect(result.player.heat).toBeLessThanOrEqual(100);
    expect(result.turn).toBe(1);
  });

  it('should support SAVE and LOAD', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'SAVE' });
    expect(state.lastEventMessage).toContain('saved');

    const freshState = createGameState();
    const loaded = gameReducer(freshState, { type: 'LOAD' });
    expect(loaded.lastEventMessage).toContain('loaded');
  });

  it('should support END_RUN', () => {
    const state = createGameState();
    const result = gameReducer(state, { type: 'END_RUN' });
    expect(result.player.runActive).toBe(false);
  });

  it('should have quantity risk multiplier scaling with risk', () => {
    const q1 = getQuantityRiskMultiplier(1, 1);
    const q5 = getQuantityRiskMultiplier(5, 2);
    const q10 = getQuantityRiskMultiplier(10, 5);

    expect(q1).toBeGreaterThanOrEqual(1);
    expect(q10).toBeGreaterThan(q5);
    expect(q10).toBeGreaterThan(q1);
  });

  it('should complete full trip loop', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 5000 });
    expect(state.player.cash).toBe(5000);

    state = { ...state, gamePhase: 'buying' as const, selectedDealer: { countryId: 'london', dealerId: 'test', name: 'Test', gender: 'male', description: '', location: '', priceModifier: 1.0, riskBonus: 0, rapport: 0 } };
    const hashish = state.currentMarketPrices.find(p => p.goodId === 'hashish')!;
    state = gameReducer(state, { type: 'BUY', goodId: hashish.goodId, quantity: 10 });
    expect(state.pendingEvent).toBeTruthy();
  });

  it('should handle procedural events', () => {
    const state = createGameState();
    const event = generateProceduralEvent(state.player, state.director);
    expect(event).toBeDefined();
    expect(event.title).toBeTruthy();
    expect(event.context).toBeTruthy();
    expect(event.choices.length).toBeGreaterThanOrEqual(2);
  });

  it('should not generate back-alley dealer event while at home', () => {
    const state = createGameState();
    const homeState = { ...state, player: { ...state.player, currentCountryId: 'london' } };

    for (let i = 0; i < 200; i++) {
      const event = generateProceduralEvent(homeState.player, homeState.director);
      expect(event.title).not.toBe('The Back-Alley Deal');
    }
  });

  it('should have working director state updates', () => {
    let state = createGameState();
    state = gameReducer(state, { type: 'START_TRIP', amount: 5000 });

    for (let i = 0; i < 3; i++) {
      const targetId = state.world[(i + 1) % state.world.length].id;
      if (targetId !== state.player.currentCountryId) {
        state = gameReducer(state, { type: 'TRAVEL', toCountryId: targetId, travelClass: 'economy' });
      }
    }

    const updatedDirector = state.director;
    expect(typeof updatedDirector.tension).toBe('number');
    expect(typeof updatedDirector.boredom).toBe('number');
    expect(typeof updatedDirector.enforcementAttention).toBe('number');
  });

  it('should handle bank operations', () => {
    const player = createPlayer();
    expect(player.bank).toBe(5000);
    expect(player.cash).toBe(0);

    const { player: afterStart } = startTrip(player, 3000);
    expect(afterStart.cash).toBe(3000);
    expect(afterStart.bank).toBe(2000);

    const { player: afterEnd } = endTrip({ ...afterStart, cash: 4500 }, 'london');
    expect(afterEnd.cash).toBe(0);
    expect(afterEnd.bank).toBe(6500);
    expect(afterEnd.totalTrips).toBe(1);
  });

  it('should detect overdraft', () => {
    // Tier 1 (peak < $10K): $1,000 limit
    expect(checkOverdraft({ cash: -500, peakNetWorth: 0 } as any)).toBe(false);
    expect(checkOverdraft({ cash: -1001, peakNetWorth: 0 } as any)).toBe(true);
    // Tier 2 (peak $10K-$50K): $2,000 limit
    expect(checkOverdraft({ cash: -1500, peakNetWorth: 10000 } as any)).toBe(false);
    expect(checkOverdraft({ cash: -2500, peakNetWorth: 15000 } as any)).toBe(true);
    // Tier 3 (peak $50K+): $5,000 limit
    expect(checkOverdraft({ cash: -3000, peakNetWorth: 50000 } as any)).toBe(false);
    expect(checkOverdraft({ cash: -6000, peakNetWorth: 60000 } as any)).toBe(true);
  });

  it('should have 6 goods with correct structure', () => {
    const state = createGameState();
    expect(state.goods.length).toBe(6);
    const cocaine = state.goods.find(g => g.id === 'cocaine')!;
    expect(cocaine).toBeDefined();
    expect(cocaine.unitOfMeasure).toBe('brick');
    expect(cocaine.standardDealSize).toBe(10);
    expect(cocaine.baseValuePerUnit).toBe(51);
    expect(cocaine.risk).toBe(5);
  });

  it('should not reroute return summary back to dealer intro', () => {
    let state = createGameState();
    state = {
      ...state,
      gamePhase: 'selling',
      selectedDealer: { countryId: 'netherlands', dealerId: 'net_3', name: 'Micky', gender: 'male', description: '', location: '', priceModifier: 1, riskBonus: 0, rapport: 0 },
      pendingEvent: {
        id: 'return_summary_test',
        title: 'Back in London',
        context: 'Returned with goods.',
        choices: [
          { id: 'continue', text: 'Proceed to Airport', odds: 1, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
          { id: 'buy_more', text: 'Arrange Another Deal', odds: 1, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
        ],
      },
    } as any;

    const result = gameReducer(state, { type: 'RESPOND_EVENT', choiceId: 'buy_more' });
    expect(result.pendingEvent).toBeNull();
    expect(result.headingToAirport).toBe(true);
    expect(result.lastEventMessage).toContain('Choose your destination');
  });

  it('should close sell summary continue to london flow', () => {
    let state = createGameState();
    // Simulate being abroad (having sold goods in a foreign country)
    state = {
      ...state,
      player: { ...state.player, currentCountryId: 'netherlands' },
      gamePhase: 'selling',
      headingToAirport: true,
      pendingEvent: {
        id: 'sell_summary_test',
        title: 'Deal Successful',
        context: 'Sold goods.',
        choices: [
          { id: 'continue', text: 'Continue', odds: 1, successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' }, failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' } },
        ],
      },
    } as any;

    const result = gameReducer(state, { type: 'RESPOND_EVENT', choiceId: 'continue' });
    expect(result.pendingEvent).toBeNull();
    expect(result.headingToAirport).toBe(false);
    expect(result.lastEventMessage).toContain('Back in London');
  });

it('should allow retrieving goods from stash to inventory when capacity allows', () => {
    let state = createGameState();
    // Ensure we are in home phase (retrieve allowed in home and selling)
    state = { ...state, gamePhase: 'home' as const };
    // Give the player some weed in stash (100 units = 50kg, which fits in base capacity of 50kg)
    const weedGood = state.goods.find(g => g.id === 'weed');
    expect(weedGood).toBeDefined();
    const stashItem = { goodId: 'weed', quantity: 100 };
    state = { ...state, player: { ...state.player, stash: [stashItem], inventory: [] } };
    // Verify initial state
    expect(state.player.stash).toHaveLength(1);
    expect(state.player.stash[0].quantity).toBe(100);
    expect(state.player.inventory).toHaveLength(0);

    // Retrieve 100 units of weed
    const result = gameReducer(state, { type: 'RETRIEVE_GOODS', goodId: 'weed', quantity: 100 });
    // After retrieval, stash should be empty, inventory should have 100 units
    expect(result.player.stash).toHaveLength(0);
    expect(result.player.inventory).toHaveLength(1);
    expect(result.player.inventory[0].goodId).toBe('weed');
    expect(result.player.inventory[0].quantity).toBe(100);
    expect(result.lastEventMessage).toBe('Retrieved $100x from stash.');
  });

  it('should reject retrieving goods when inventory capacity is insufficient', () => {
    let state = createGameState();
    // Ensure we are in home phase
    state = { ...state, gamePhase: 'home' as const };
    // Give the player some weed in stash (200 units = 100kg, which exceeds base capacity of 50kg)
    const weedGood = state.goods.find(g => g.id === 'weed');
    expect(weedGood).toBeDefined();
    const stashItem = { goodId: 'weed', quantity: 200 };
    state = { ...state, player: { ...state.player, stash: [stashItem], inventory: [] } };
    // Verify initial state
    expect(state.player.stash).toHaveLength(1);
    expect(state.player.stash[0].quantity).toBe(200);
    expect(state.player.inventory).toHaveLength(0);

    // Attempt to retrieve 200 units of weed (should fail due to capacity)
    const result = gameReducer(state, { type: 'RETRIEVE_GOODS', goodId: 'weed', quantity: 200 });
    // Expect all fields except lastEventMessage to be identical
    const { lastEventMessage: _a, ...resultRest } = result;
    const { lastEventMessage: _b, ...stateRest } = state;
    expect(resultRest).toEqual(stateRest);
    expect(result.lastEventMessage).toBe('Not enough inventory space.');
  });

  it('should increase inventory capacity when buying capacity-giving assets', () => {
    const player = { ...createPlayer(), bank: 20000, peakNetWorth: 20000, reputation: 5 };
    expect(player.inventoryCapacity).toBe(BASE_CAPACITY);
    expect(player.stashCapacity).toBe(BASE_STASH_CAPACITY);

    const storageUnit = getAsset('storage_unit')!;
    expect(storageUnit.inventoryBonus).toBe(10);
    expect(storageUnit.stashBonus).toBe(100);

    const { player: afterBuy, success } = buyAsset(player, storageUnit);
    expect(success).toBe(true);
    expect(afterBuy.inventoryCapacity).toBe(BASE_CAPACITY + 10);
    expect(afterBuy.stashCapacity).toBe(BASE_STASH_CAPACITY + 100);
  });

  it('should decrease inventory capacity when selling capacity-giving assets', () => {
    const player = { ...createPlayer(), ownedAssets: ['storage_unit'], inventoryCapacity: BASE_CAPACITY + 10, stashCapacity: BASE_STASH_CAPACITY + 100 };

    const { player: afterSell, success } = sellAsset(player, 'storage_unit');
    expect(success).toBe(true);
    expect(afterSell.inventoryCapacity).toBe(BASE_CAPACITY);
    expect(afterSell.stashCapacity).toBe(BASE_STASH_CAPACITY);
  });

  it('should have getInventoryCapacity helper match player state', () => {
    const player = { ...createPlayer(), ownedAssets: ['storage_unit'], inventoryCapacity: BASE_CAPACITY + 10, stashCapacity: BASE_STASH_CAPACITY + 100 };
    expect(getInventoryCapacity(player)).toBe(BASE_CAPACITY + 10);
  });

  it('should have assetTutorialShown start false and become true after tutorial', () => {
    let state = createGameState();
    expect(state.assetTutorialShown).toBe(false);

    state = gameReducer(state, { type: 'ASSET_TUTORIAL' });
    expect(state.pendingEvent).not.toBeNull();
    expect(state.pendingEvent!.title).toBe('Sort Your Status Out');

    state = gameReducer(state, { type: 'RESPOND_EVENT', choiceId: 'understood' });
    expect(state.assetTutorialShown).toBe(true);
    expect(state.pendingEvent).toBeNull();
  });

  it('should sell asset normally via gameReducer without forced-sell popup', () => {
    let state = createGameState();
    state = { ...state, gamePhase: 'home' as const, player: { ...state.player, ownedAssets: ['simple_watch'], cash: 1000 } };
    const result = gameReducer(state, { type: 'SELL_ASSET', assetId: 'simple_watch' });
    expect(result.pendingEvent).toBeNull();
    expect(result.lastEventMessage).toContain('Sold');
    expect(result.lastEventMessage).toContain('Simple Watch');
    expect(result.player.ownedAssets).not.toContain('simple_watch');
  });

  it('should create forced-sell pendingEvent when selling capacity asset causes inventory overflow', () => {
    let state = createGameState();
    state = { ...state, gamePhase: 'home' as const };
    // storage_unit gives +10 inventory (60 total), fill with 110 weed (55kg) — fits in 60kg
    const playerWithStorage = { ...state.player, ownedAssets: ['storage_unit'], inventoryCapacity: BASE_CAPACITY + 10, cash: 100000 };
    const playerWithGoods = { ...playerWithStorage, inventory: [{ goodId: 'weed', quantity: 110 }] };
    state = { ...state, player: playerWithGoods };
    expect(getUsedCapacity(state.player)).toBeCloseTo(55, 1);
    // Sell storage_unit — capacity drops to 50, used = 55 > 50
    const result = gameReducer(state, { type: 'SELL_ASSET', assetId: 'storage_unit' });
    expect(result.pendingEvent).not.toBeNull();
    expect(result.pendingEvent!.title).toBe('Inventory Overflow');
    // Verify remaining inventory fits new capacity
    const usedAfter = getUsedCapacity(result.player);
    expect(usedAfter).toBeLessThanOrEqual(result.player.inventoryCapacity);
    expect(result.player.inventoryCapacity).toBe(BASE_CAPACITY);
    // Cash should include asset payout + liquidation
    expect(result.player.cash).toBeGreaterThan(state.player.cash);
    // Verify no pendingEvent after dismissing
    const dismissed = gameReducer(result, { type: 'RESPOND_EVENT', choiceId: 'continue' });
    expect(dismissed.pendingEvent).toBeNull();
  });

  it('should sell non-capacity asset without forced-sell even with full inventory', () => {
    let state = createGameState();
    state = { ...state, gamePhase: 'home' as const };
    // Player has a watch (no inventoryBonus), fill inventory to 55kg
    const playerWithWatch = { ...state.player, ownedAssets: ['simple_watch', 'storage_unit'], inventoryCapacity: BASE_CAPACITY + 10, cash: 100000 };
    const playerWithGoods = { ...playerWithWatch, inventory: [{ goodId: 'weed', quantity: 110 }] };
    state = { ...state, player: playerWithGoods };
    // Sell simple_watch — no capacity change, no overflow
    const result = gameReducer(state, { type: 'SELL_ASSET', assetId: 'simple_watch' });
    expect(result.pendingEvent).toBeNull();
    expect(result.lastEventMessage).toContain('Sold');
    expect(result.player.ownedAssets).not.toContain('simple_watch');
  });

  it('should show empty_return_ mockery event when returning to London with no product', () => {
    let state = createGameState();
    state = { ...state, gamePhase: 'selling', player: { ...state.player, currentCountryId: 'london', inventory: [] } };
    const nullEffects = { cashDelta: 0, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: '' };
    const nullChoice = { odds: 1.0, successEffects: nullEffects, failEffects: nullEffects };
    state = { ...state, pendingEvent: { id: 'empty_return_test', title: 'Back in London', context: `you have arrived back in London. you had no product on you so customs was no trouble, but I bet you feel like a right useless tit after that failed run, you're a fucking bottle job, just like your old man!`, choices: [{ id: 'agree', text: '(I agree)', ...nullChoice }] } };
    const result = gameReducer(state, { type: 'RESPOND_EVENT', choiceId: 'agree' });
    expect(result.pendingEvent).toBeNull();
    expect(result.lastEventMessage).toBe('Back in London. Better luck next time.');
  });
});
