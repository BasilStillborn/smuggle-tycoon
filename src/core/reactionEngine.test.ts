import { describe, expect, it } from 'vitest';
import { getElement } from '../data/elements';
import { simulateReaction } from './reactionEngine';

function pick(...symbols: string[]) {
  return symbols.map((symbol) => {
    const element = getElement(symbol);
    if (!element) throw new Error(`Missing test element ${symbol}`);
    return element;
  });
}

describe('simulateReaction', () => {
  it('recognises sodium and chlorine as a salt-forming reaction', () => {
    const result = simulateReaction(pick('Na', 'Cl'), { temperature: 260, pressureAtm: 1 });
    expect(result.id).toBe('sodium-chlorine-salt');
    expect(result.products).toContain('NaCl');
    expect(result.reactionType).toBe('salt-formation');
  });

  it('waits for activation energy when hydrogen and oxygen are too cold', () => {
    const result = simulateReaction(pick('H', 'O'), { temperature: 120, pressureAtm: 1 });
    expect(result.id).toBe('hydrogen-oxygen-water-waiting');
    expect(result.reactionType).toBe('inert');
  });

  it('turns hydrogen and oxygen energetic when heated', () => {
    const result = simulateReaction(pick('O', 'H'), { temperature: 700, pressureAtm: 1.4 });
    expect(result.id).toBe('hydrogen-oxygen-water');
    expect(result.animation).toBe('storm');
    expect(result.intensity).toBeGreaterThan(90);
  });

  it('keeps noble gases calm under normal conditions', () => {
    const result = simulateReaction(pick('Ne', 'He'), { temperature: 220, pressureAtm: 1 });
    expect(result.reactionType).toBe('inert');
    expect(result.animation).toBe('calm');
  });
});
