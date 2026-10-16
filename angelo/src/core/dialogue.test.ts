import { describe, it, expect } from 'vitest';
import {
  createCorpus,
  getDialogue,
  renderDialogue,
  evaluatePrerequisite,
  weightedPick,
  registerCorpus,
  DEFAULT_CORPUS,
  type DialogueEntry,
  type Rng,
} from './dialogue';
import {
  buildSampleCorpus,
  SAMPLE_CORPUS,
  dialogueContextFromGameState,
  PREREQS,
} from './dialogue-corpus';
import { createGameState } from './game-engine';

// Deterministic RNG helpers -------------------------------------------------

function seqRng(values: number[]): Rng {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)] ?? 0;
}

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function entry(partial: Partial<DialogueEntry> & { text: string }): DialogueEntry {
  return { id: partial.id ?? partial.text, characterId: 'x', scene: 's', ...partial };
}

describe('Dialogue corpus engine', () => {
  it('selects weighted lines in proportion to their weight', () => {
    const corpus = createCorpus([
      entry({ id: 'heavy', text: 'heavy', weight: 3 }),
      entry({ id: 'light', text: 'light', weight: 1 }),
    ]);
    const rng = mulberry32(42);
    const counts: Record<string, number> = { heavy: 0, light: 0 };
    for (let i = 0; i < 4000; i++) {
      const result = getDialogue('x', 's', undefined, { corpus, rng });
      if (result) counts[result.id] += 1;
    }
    expect(counts.heavy).toBeGreaterThan(counts.light * 2);
    expect(counts.light).toBeGreaterThan(0);
  });

  it('filters by mood, treating untagged lines as universal', () => {
    const corpus = createCorpus([
      entry({ id: 'tense', text: 'tense line', mood: 'tense' }),
      entry({ id: 'warm', text: 'warm line', mood: 'warm' }),
      entry({ id: 'any', text: 'universal line' }),
    ]);
    const rng = mulberry32(1);
    for (let i = 0; i < 50; i++) {
      const result = getDialogue('x', 's', 'tense', { corpus, rng, allowMoodFallback: false });
      expect(['tense', 'any']).toContain(result?.id);
    }
  });

  it('falls back to dropping the mood when nothing matches it', () => {
    const corpus = createCorpus([entry({ id: 'warm', text: 'warm only', mood: 'warm' })]);
    const result = getDialogue('x', 's', 'tense', { corpus });
    expect(result?.id).toBe('warm');
  });

  it('gates lines on prerequisites (flags and numeric thresholds)', () => {
    const corpus = createCorpus([
      entry({ id: 'lore', text: 'macau', prereqs: PREREQS.knowsMacau() }),
      entry({ id: 'plain', text: 'plain' }),
    ]);
    const rng = mulberry32(7);

    const blocked = getDialogue('x', 's', undefined, {
      corpus,
      rng,
      ctx: { location: 'london', turn: 12, flags: { soldInMacau: false } },
    });
    expect(blocked?.id).toBe('plain');

    const allowed = getDialogue('x', 's', undefined, {
      corpus,
      rng,
      ctx: { location: 'amsterdam', turn: 12, flags: { soldInMacau: true } },
    });
    expect(allowed?.id).toBe('lore');

    const tooEarly = getDialogue('x', 's', undefined, {
      corpus,
      rng,
      ctx: { location: 'amsterdam', turn: 2, flags: { soldInMacau: true } },
    });
    expect(tooEarly?.id).toBe('plain');
  });

  it('evaluates each prerequisite kind directly', () => {
    const ctx = { characterId: 'x', scene: 's', turn: 9, heat: 60, location: 'amsterdam', flags: { soldInMacau: true } };
    expect(evaluatePrerequisite({ kind: 'atLeast', key: 'turn', value: 8 }, ctx)).toBe(true);
    expect(evaluatePrerequisite({ kind: 'atMost', key: 'heat', value: 50 }, ctx)).toBe(false);
    expect(evaluatePrerequisite({ kind: 'notLocation', is: 'safehouse' }, ctx)).toBe(true);
    expect(evaluatePrerequisite({ kind: 'flag', key: 'soldInMacau' }, ctx)).toBe(true);
    expect(evaluatePrerequisite({ kind: 'notFlag', key: 'soldInMacau' }, ctx)).toBe(false);
    expect(evaluatePrerequisite({ kind: 'custom', test: (c) => c.turn === 9 }, ctx)).toBe(true);
  });

  it('honours once-only lines via the consumed set', () => {
    const corpus = createCorpus([
      entry({ id: 'once', text: 'one-time', once: true, weight: 100 }),
      entry({ id: 'repeat', text: 'repeat' }),
    ]);
    const consumed = new Set<string>();
    const rng = mulberry32(3);
    const first = getDialogue('x', 's', undefined, { corpus, rng, consumed });
    expect(first?.id).toBe('once');
    expect(consumed.has('once')).toBe(true);
    for (let i = 0; i < 10; i++) {
      const next = getDialogue('x', 's', undefined, { corpus, rng, consumed });
      expect(next?.id).toBe('repeat');
    }
  });

  it('widens scene scope when the exact scene has no lines', () => {
    const corpus = createCorpus([entry({ id: 'other', text: 'other scene', scene: 'deal' })]);
    const result = getDialogue('x', 'arrival', undefined, { corpus });
    expect(result?.id).toBe('other');
  });

  it('returns a rendered fallback when nothing matches, else null', () => {
    const empty = createCorpus();
    expect(getDialogue('nobody', 'nowhere', undefined, { corpus: empty })).toBeNull();
    const fb = getDialogue('nobody', 'nowhere', undefined, {
      corpus: empty,
      fallback: 'Nothing to say, $name.',
      ctx: { vars: { name: 'Angelo' } },
    });
    expect(fb?.fallbackUsed).toBe(true);
    expect(fb?.text).toBe('Nothing to say, Angelo.');
  });

  it('is deterministic for a given RNG', () => {
    const corpus = buildSampleCorpus();
    const a = getDialogue('col_1', 'arrival', 'casual', { corpus, rng: mulberry32(99) });
    const b = getDialogue('col_1', 'arrival', 'casual', { corpus, rng: mulberry32(99) });
    expect(a?.id).toBe(b?.id);
    expect(a?.text).toBe(b?.text);
  });

  it('renders placeholders ($name, $pron, %GOOD%, %d, custom $vars)', () => {
    const out = renderDialogue('$name puts %GOOD% in $pron coat. Heat %d, $city.', {
      name: 'Angelo',
      good: 'hashish',
      heat: 12,
      city: 'London',
      pron: { he: 'he', him: 'him', his: 'his', He: 'He', His: 'His' },
    });
    expect(out).toBe('Angelo puts hashish in his coat. Heat 12, London.');
  });

  it('weightedPick returns a lone entry regardless of rng', () => {
    const only = entry({ id: 'only', text: 'only' });
    expect(weightedPick([only], () => 0.99)).toBe(only);
  });
});

describe('Dialogue corpus integration', () => {
  it('registers the sample corpus into the default registry', () => {
    registerCorpus(SAMPLE_CORPUS, true);
    expect(DEFAULT_CORPUS.size).toBe(SAMPLE_CORPUS.size);
    const line = getDialogue('fletcher', 'raid', undefined, { rng: mulberry32(5) });
    expect(line).not.toBeNull();
    expect(line?.characterId).toBe('fletcher');
    expect(line?.scene).toBe('raid');
  });

  it('maps live game state into a dialogue context (read-only)', () => {
    const state = createGameState();
    state.turn = 11;
    state.player = { ...state.player, heat: 42, credibility: 30, reputation: 7, cash: 1200, totalTrips: 3 };
    const ctx = dialogueContextFromGameState(state, 'fletcher', 'deal', 'casual');
    expect(ctx.characterId).toBe('fletcher');
    expect(ctx.scene).toBe('deal');
    expect(ctx.mood).toBe('casual');
    expect(ctx.turn).toBe(11);
    expect(ctx.heat).toBe(42);
    expect(ctx.credibility).toBe(30);
    expect(ctx.reputation).toBe(7);
    expect(ctx.location).toBe(state.player.currentCountryId);
    expect(ctx.flags?.runActive).toBe(state.player.runActive);
  });

  it('sample pools expose calm and high-tension scenes for key characters', () => {
    const fletcherScenes = new Set(SAMPLE_CORPUS.forCharacter('fletcher').map((e) => e.scene));
    expect(fletcherScenes.has('arrival')).toBe(true);
    expect(fletcherScenes.has('raid')).toBe(true);
    expect(SAMPLE_CORPUS.forCharacter('esp_3').length).toBeGreaterThanOrEqual(3);
  });

  it('keeps the sample corpus free of the macro-template placeholders it never renders', () => {
    for (const e of SAMPLE_CORPUS.entries) {
      expect(e.text).not.toContain('%GOOD%');
    }
  });
});
