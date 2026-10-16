// ─── Modular Dialogue Corpus engine ─────────────────────────────
// Additive infrastructure only. Nothing in the existing flow is rewired by
// this module: it exposes a data-driven, weighted, contextual line selector
// (`getDialogue`) that queries a corpus it does not otherwise know about.
//
// Layers:
//   1. Data layer   — DialogueEntry[] grouped by character + scene (+ mood tag)
//   2. Trigger layer— eligibility by scene / mood / prerequisites / consumed set
//   3. Random layer — weighted selection with an injectable RNG (deterministic in tests)
//
// The engine is deliberately generic: it knows nothing about game state or the
// contents of any pool. App-specific projection lives in `dialogue-corpus.ts`.

export type DialogueMood =
  | 'casual'
  | 'tense'
  | 'threatening'
  | 'informative'
  | 'warm'
  | 'greedy'
  | 'cheerful'
  | 'paranoid';

/** Structural shape of a pronoun set (matches the engine's PronounSet). */
export interface DialoguePronouns {
  he: string;
  him: string;
  his: string;
  He: string;
  His: string;
}

/** Numeric context fields a prerequisite may compare against. */
export type NumericContextKey =
  | 'turn'
  | 'heat'
  | 'credibility'
  | 'reputation'
  | 'cash'
  | 'bank'
  | 'netWorth'
  | 'daysSince'
  | 'rapport'
  | 'trips'
  | 'busts'
  | 'dealNumber';

/** Placeholder values substituted into a line at render time. */
export interface DialogueVars {
  name?: string;
  good?: string;
  heat?: number | string;
  pron?: DialoguePronouns;
  [key: string]: string | number | DialoguePronouns | undefined;
}

/** Everything a line can be triggered by or render with. */
export interface DialogueContext {
  /** the speaker/owner of the corpus this query targets */
  characterId: string;
  /** scene/stage context, e.g. 'arrival' | 'deal' | 'raid' */
  scene: string;
  /** optional emotional state / mood tag of the active character */
  mood?: string;
  /** arbitrary named facts available to prerequisites */
  flags?: Record<string, boolean | number | string>;
  location?: string;
  turn?: number;
  heat?: number;
  credibility?: number;
  reputation?: number;
  cash?: number;
  bank?: number;
  netWorth?: number;
  daysSince?: number;
  rapport?: number;
  trips?: number;
  busts?: number;
  dealNumber?: number;
  vars?: DialogueVars;
}

/** Declarative gate. All prerequisites on a line must hold for it to be eligible. */
export type Prerequisite =
  | { kind: 'flag'; key: string; equals?: boolean | number | string }
  | { kind: 'notFlag'; key: string }
  | { kind: 'atLeast'; key: NumericContextKey | string; value: number }
  | { kind: 'atMost'; key: NumericContextKey | string; value: number }
  | { kind: 'location'; is: string }
  | { kind: 'notLocation'; is: string }
  | { kind: 'mood'; is: string }
  | { kind: 'scene'; is: string }
  | { kind: 'custom'; test: (ctx: DialogueContext) => boolean; label?: string };

export interface DialogueEntry {
  id: string;
  characterId: string;
  scene: string;
  /** Optional mood tag. Entries without a mood act as universal for that scene. */
  mood?: DialogueMood | string;
  /** Relative selection weight (default 1). Higher = more likely. */
  weight?: number;
  prereqs?: Prerequisite[];
  /** May contain $name, $pron, $He/$His/$him, %GOOD% and %d placeholders. */
  text: string;
  /** When true, the line is skipped once its id appears in the consumed set. */
  once?: boolean;
}

export interface DialogueResult {
  id: string;
  text: string;
  characterId: string;
  scene: string;
  mood?: string;
  weight: number;
  /** true when no corpus line matched and the caller's fallback was used */
  fallbackUsed?: boolean;
}

export type Rng = () => number;

export interface GetDialogueOptions {
  corpus?: DialogueCorpus;
  /** extra context merged over the explicit characterId/scene/mood arguments */
  ctx?: Partial<DialogueContext>;
  rng?: Rng;
  /** returned (rendered) when nothing matches; enables a guaranteed line */
  fallback?: string;
  /** ids already spoken — used for `once` lines */
  consumed?: Set<string>;
  /** drop mood, then drop scene, when matching (defaults true) */
  allowMoodFallback?: boolean;
  allowSceneFallback?: boolean;
}

// ─── Corpus (data layer) ────────────────────────────────────────

export class DialogueCorpus {
  readonly entries: DialogueEntry[] = [];
  private readonly byCharacter = new Map<string, DialogueEntry[]>();

  constructor(entries: DialogueEntry[] = []) {
    for (const entry of entries) this.add(entry);
  }

  add(...entries: DialogueEntry[]): this {
    for (const entry of entries) {
      this.entries.push(entry);
      const bucket = this.byCharacter.get(entry.characterId);
      if (bucket) bucket.push(entry);
      else this.byCharacter.set(entry.characterId, [entry]);
    }
    return this;
  }

  /** Bulk-register plain lines for a character/scene with shared metadata. */
  addPool(
    characterId: string,
    scene: string,
    lines: string[],
    opts: { mood?: DialogueMood | string; weight?: number; prereqs?: Prerequisite[]; once?: boolean } = {},
  ): this {
    lines.forEach((text, i) => {
      this.add({
        id: `${characterId}:${scene}:${opts.mood ?? 'any'}:${i}`,
        characterId,
        scene,
        mood: opts.mood,
        weight: opts.weight,
        prereqs: opts.prereqs,
        once: opts.once,
        text,
      });
    });
    return this;
  }

  forCharacter(characterId: string): readonly DialogueEntry[] {
    return this.byCharacter.get(characterId) ?? [];
  }

  clear(): this {
    this.entries.length = 0;
    this.byCharacter.clear();
    return this;
  }

  get size(): number {
    return this.entries.length;
  }
}

export function createCorpus(entries: DialogueEntry[] = []): DialogueCorpus {
  return new DialogueCorpus(entries);
}

// ─── Prerequisite evaluation (trigger layer) ────────────────────

function numericValue(ctx: DialogueContext, key: string): number | undefined {
  const direct = (ctx as unknown as Record<string, unknown>)[key];
  if (typeof direct === 'number') return direct;
  if (typeof direct === 'boolean') return direct ? 1 : 0;
  const flag = ctx.flags?.[key];
  if (typeof flag === 'number') return flag;
  if (typeof flag === 'boolean') return flag ? 1 : 0;
  return undefined;
}

function flagValue(ctx: DialogueContext, key: string): boolean | number | string | undefined {
  if (ctx.flags && key in ctx.flags) return ctx.flags[key];
  const direct = (ctx as unknown as Record<string, unknown>)[key];
  if (typeof direct === 'boolean' || typeof direct === 'number' || typeof direct === 'string') return direct;
  return undefined;
}

export function evaluatePrerequisite(prereq: Prerequisite, ctx: DialogueContext): boolean {
  switch (prereq.kind) {
    case 'flag': {
      const value = flagValue(ctx, prereq.key);
      if (value === undefined) return false;
      return prereq.equals === undefined ? value === true : value === prereq.equals;
    }
    case 'notFlag':
      return !flagValue(ctx, prereq.key);
    case 'atLeast': {
      const value = numericValue(ctx, prereq.key);
      return value !== undefined && value >= prereq.value;
    }
    case 'atMost': {
      const value = numericValue(ctx, prereq.key);
      return value !== undefined && value <= prereq.value;
    }
    case 'location':
      return ctx.location === prereq.is;
    case 'notLocation':
      return ctx.location !== prereq.is;
    case 'mood':
      return ctx.mood === prereq.is;
    case 'scene':
      return ctx.scene === prereq.is;
    case 'custom':
      return prereq.test(ctx);
    default:
      return false;
  }
}

export function meetsPrerequisites(entry: DialogueEntry, ctx: DialogueContext): boolean {
  if (!entry.prereqs || entry.prereqs.length === 0) return true;
  return entry.prereqs.every((p) => evaluatePrerequisite(p, ctx));
}

function moodEligible(entry: DialogueEntry, mood: string | null): boolean {
  if (mood === null) return true;
  return entry.mood === undefined || entry.mood === mood;
}

function eligibleEntries(
  corpus: DialogueCorpus,
  characterId: string,
  scene: string | null,
  mood: string | null,
  ctx: DialogueContext,
  consumed?: Set<string>,
): DialogueEntry[] {
  return corpus.forCharacter(characterId).filter((entry) => {
    if (scene !== null && entry.scene !== scene) return false;
    if (!moodEligible(entry, mood)) return false;
    if (entry.once && consumed?.has(entry.id)) return false;
    return meetsPrerequisites(entry, ctx);
  });
}

// ─── Selection (randomisation layer) ────────────────────────────

function weightOf(entry: DialogueEntry): number {
  const w = entry.weight ?? 1;
  return Number.isFinite(w) && w > 0 ? w : 0;
}

export function weightedPick(entries: DialogueEntry[], rng: Rng): DialogueEntry {
  const total = entries.reduce((sum, entry) => sum + weightOf(entry), 0);
  if (total <= 0) return entries[Math.floor(rng() * entries.length)] ?? entries[entries.length - 1];
  let threshold = rng() * total;
  for (const entry of entries) {
    threshold -= weightOf(entry);
    if (threshold < 0) return entry;
  }
  return entries[entries.length - 1];
}

// ─── Rendering ──────────────────────────────────────────────────

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function renderDialogue(text: string, vars?: DialogueVars): string {
  if (!vars) return text;
  let out = text;
  if (vars.pron) {
    out = out
      .replace(/\$pron\b/g, vars.pron.his)
      .replace(/\$He\b/g, vars.pron.He)
      .replace(/\$His\b/g, vars.pron.His)
      .replace(/\$him\b/g, vars.pron.him);
  }
  if (vars.name !== undefined) out = out.replace(/\$name\b/g, vars.name);
  if (vars.good !== undefined) out = out.replace(/%GOOD%/g, vars.good);
  if (vars.heat !== undefined) out = out.replace(/%d/g, String(vars.heat));
  for (const [key, value] of Object.entries(vars)) {
    if (key === 'pron' || key === 'name' || key === 'good' || key === 'heat') continue;
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    out = out.replace(new RegExp(`\\$${escapeRegExp(key)}\\b`, 'g'), String(value));
  }
  return out;
}

// ─── Public API ─────────────────────────────────────────────────

type ThirdArg = string | (GetDialogueOptions & Partial<DialogueContext>) | undefined;

function normaliseArgs(
  third: ThirdArg,
  explicitMood: string | undefined,
): { mood: string | undefined; options: GetDialogueOptions } {
  if (typeof third === 'string') return { mood: third, options: {} };
  if (third && typeof third === 'object') {
    const { corpus, ctx, rng, fallback, consumed, allowMoodFallback, allowSceneFallback, ...rest } = third;
    return {
      mood: explicitMood,
      options: { corpus, ctx: { ...ctx, ...rest }, rng, fallback, consumed, allowMoodFallback, allowSceneFallback },
    };
  }
  return { mood: explicitMood, options: {} };
}

/**
 * Query the corpus for a coherent, contextual line.
 *
 * `getDialogue(characterId, scene, emotionalState?, options?)`
 *  - third arg may be a mood string, or an options/context object.
 *  - deterministic when an `rng` is supplied.
 * Returns `null` only when nothing matches and no `fallback` is given.
 */
export function getDialogue(
  characterId: string,
  scene: string,
  emotionalState?: ThirdArg,
  options: GetDialogueOptions = {},
): DialogueResult | null {
  const isObjectThird = emotionalState !== undefined && typeof emotionalState !== 'string';
  const { mood, options: fromThird } = normaliseArgs(
    isObjectThird ? (emotionalState as ThirdArg) : undefined,
    typeof emotionalState === 'string' ? emotionalState : undefined,
  );
  const opts: GetDialogueOptions = isObjectThird
    ? { ...fromThird, ...options, ctx: { ...fromThird.ctx, ...options.ctx } }
    : options;

  const corpus = opts.corpus ?? DEFAULT_CORPUS;
  const rng = opts.rng ?? Math.random;
  const allowMoodFallback = opts.allowMoodFallback ?? true;
  const allowSceneFallback = opts.allowSceneFallback ?? true;

  const baseCtx: DialogueContext = {
    characterId,
    scene,
    mood,
    ...opts.ctx,
    flags: { ...opts.ctx?.flags },
    vars: opts.ctx?.vars,
  };

  const attempts: Array<{ scene: string | null; mood: string | null }> = [{ scene, mood: mood ?? null }];
  if (mood && allowMoodFallback) attempts.push({ scene, mood: null });
  if (allowSceneFallback) attempts.push({ scene: null, mood: null });

  for (const attempt of attempts) {
    const ctx: DialogueContext = { ...baseCtx, scene: attempt.scene ?? scene };
    const pool = eligibleEntries(corpus, characterId, attempt.scene, attempt.mood, ctx, opts.consumed);
    if (pool.length === 0) continue;
    const chosen = weightedPick(pool, rng);
    if (chosen.once) opts.consumed?.add(chosen.id);
    return {
      id: chosen.id,
      text: renderDialogue(chosen.text, opts.ctx?.vars),
      characterId,
      scene: chosen.scene,
      mood: chosen.mood,
      weight: weightOf(chosen),
    };
  }

  if (opts.fallback !== undefined) {
    return {
      id: `${characterId}:${scene}:fallback`,
      text: renderDialogue(opts.fallback, opts.ctx?.vars),
      characterId,
      scene,
      mood,
      weight: 0,
      fallbackUsed: true,
    };
  }
  return null;
}

// ─── Default corpus registry ────────────────────────────────────
// A shared, mutable registry so the data layer (dialogue-corpus.ts) can register
// pools without the engine importing any content.

export const DEFAULT_CORPUS = createCorpus();

/** Merge (or replace) the default registry with a prepared corpus. */
export function registerCorpus(corpus: DialogueCorpus, replace = false): void {
  if (replace) DEFAULT_CORPUS.clear();
  DEFAULT_CORPUS.add(...corpus.entries);
}
