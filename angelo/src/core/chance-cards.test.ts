import { describe, it, expect, vi, afterEach } from 'vitest';
import { getChanceCard } from './chance-cards';

describe('Chance cards', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when trigger roll misses 8% gate', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.5);
    expect(getChanceCard()).toBeNull();
  });

  it('returns good card when good pool is selected', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.0);

    const card = getChanceCard();
    expect(card).not.toBeNull();
    expect(card!.effects.cashDelta).toBeGreaterThan(0);
  });

  it('returns bad card when bad pool is selected', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.0);

    const card = getChanceCard();
    expect(card).not.toBeNull();
    expect(card!.effects.cashDelta).toBeLessThan(0);
  });
});
