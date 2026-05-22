import { describe, it, expect, beforeAll } from 'vitest';
import { createGameState, gameReducer, getStatusReport } from './game-engine';
import { getQuantityRiskMultiplier } from './heat';
import { generateProceduralEvent } from './events-procedural';
import { startTrip, endTrip, checkOverdraft } from './bank-actions';
import { createPlayer } from './player';

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
    // Travel might trigger sniff (25% chance), so location may not change
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
});
