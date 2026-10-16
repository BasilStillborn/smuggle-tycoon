// ─── Dialogue corpus: data layer + app adapter ──────────────────
// Authored content lives here, separate from the engine in `dialogue.ts`.
// To extend the game's dialogue you add entries/pools to this file (or any
// module that builds its own DialogueCorpus) — no flow logic changes needed.

import type { GameState, PlayerState } from './types';
import {
  createCorpus,
  registerCorpus,
  type DialogueCorpus,
  type DialogueVars,
  type DialogueContext,
  type Prerequisite,
} from './dialogue';

// ── Read-only projection of live game state ─────────────────────

/** Project the live game state into a dialogue context (no mutation). */
export function dialogueContextFromGameState(
  state: GameState,
  characterId: string,
  scene: string,
  mood?: string,
  vars?: DialogueVars,
): DialogueContext {
  const p: PlayerState = state.player;
  const ctx: DialogueContext = {
    characterId,
    scene,
    mood,
    turn: state.turn,
    heat: p.heat,
    credibility: p.credibility,
    reputation: p.reputation,
    cash: p.cash,
    bank: p.bank,
    netWorth: p.peakNetWorth,
    trips: p.totalTrips,
    busts: p.totalBusts,
    location: p.currentCountryId,
    vars,
    flags: {
      hasGoods: p.inventory.length > 0,
      hasStash: p.stash.length > 0,
      runActive: p.runActive,
      buyDeals: state.buyDealsCompleted,
      sellDeals: state.sellDealsCompleted,
    },
  };
  return ctx;
}

// ── Reusable prerequisite presets ───────────────────────────────

export const PREREQS = {
  /** Only once the run has meaningfully progressed. */
  seasoned: (turn = 8): Prerequisite => ({ kind: 'atLeast', key: 'turn', value: turn }),
  /** Never while the player is stood in their own safehouse. */
  notAtSafehouse: (): Prerequisite => ({ kind: 'notLocation', is: 'safehouse' }),
  /** Player is carrying product right now. */
  carryingGoods: (): Prerequisite => ({ kind: 'flag', key: 'hasGoods' }),
  /** A named story flag must be set. */
  flag: (key: string, equals?: boolean | number | string): Prerequisite => ({ kind: 'flag', key, equals }),
  /** Example lore gate: the character has heard about a specific past deal. */
  knowsMacau: (): Prerequisite[] => [
    { kind: 'flag', key: 'soldInMacau' },
    { kind: 'notLocation', is: 'safehouse' },
    { kind: 'atLeast', key: 'turn', value: 8 },
  ],
};

// ── Sample mini-pools (authoring examples) ──────────────────────

/** Build the sample/authoring corpus used by tests and as a template. */
export function buildSampleCorpus(): DialogueCorpus {
  const corpus = createCorpus();

  // Tony Stillbourne (col_1) — theatrical, evasive, faintly menacing.
  corpus.addPool('col_1', 'arrival', [
    `"Ah. You again." Tony Stillbourne adjusts a collar that was never straight. "Mind the step, mind the rug, and mind what you say in here."`,
    `"Of the West End," he insists, before you have said a word. "It matters. It will always matter."`,
    `He looks you up and down, deciding something he has already decided. "Sit. Don't touch the good chair."`,
  ], { mood: 'casual', weight: 2 });

  corpus.addPool('col_1', 'arrival', [
    `"You're late." He does not look up. "I don't do late. I do business, and business has a clock."`,
    `"The last man who wasted my afternoon still owes me an apology." A thin smile. "You'll do better."`,
  ], { mood: 'tense', weight: 1 });

  corpus.addPool('col_1', 'deal', [
    `"For you — a small consideration." He waves a hand as if swatting a fly. "Do not mistake generosity for weakness."`,
    `He names a number with the confidence of a man who has named it many times. "Take it or leave it. I'm easy either way."`,
  ], { mood: 'greedy', weight: 3 });

  corpus.addPool('col_1', 'farewell', [
    `"Off you go." He is already turning away. "And if anyone asks — the answer is no, and you were never here."`,
    `"Go on. The door's where you left it." He studies a fingernail. "Do try not to get nicked on the way home."`,
  ], { mood: 'casual', weight: 2 });

  // Snake (esp_3) — loud, status-obsessed, contemptuous.
  corpus.addPool('esp_3', 'arrival', [
    `"Sit down." He points at the chair across the table without looking. "You're making the place look nervous."`,
    `"I own this stretch of coast," he says, entirely unprompted. "The rest is negotiable. So is your time here."`,
  ], { mood: 'threatening', weight: 2 });

  corpus.addPool('esp_3', 'deal', [
    `He names his price like it is a favour and expects you to thank him for it. "That's the number. Don't insult me."`,
    `"Everyone wants a discount." He laughs, alone. "Nobody ever offers me one. Funny, that."`,
  ], { mood: 'greedy', weight: 3 });

  corpus.addPool('esp_3', 'deal', [
    `"You brought it here? In your own hands?" He almost sounds impressed. "Brave. Stupid. But brave."`,
  ], { mood: 'informative', weight: 1 });

  corpus.addPool('esp_3', 'raid', [
    `The club goes still. Snake's soldiers spread out like they have rehearsed it. "Nobody move. This is just tidying up."`,
  ], { mood: 'threatening', weight: 1 });

  // Fletcher (kingpin) — terse, paternal, pragmatic.
  corpus.addPool('fletcher', 'arrival', [
    `He holds the locker-room door with a shoulder. "In. Quick. Don't stand about looking like a copper."`,
    `"You look like you slept in a hedge." He steps aside anyway. "Worse men have turned up. Say your piece."`,
  ], { mood: 'casual', weight: 2 });

  corpus.addPool('fletcher', 'deal', [
    `He counts twice, slowly, and pockets the notes. "Alright. We're square. Keep your head down till the corner's clear."`,
    `"No speeches." He nods at the product. "That's the job. Do it the way I showed you."`,
  ], { mood: 'informative', weight: 2 });

  corpus.addPool('fletcher', 'raid', [
    `"Storeroom. Now." He does not raise his voice, which is somehow worse. "And don't come out till I say."`,
    `He moves you behind the heavy bags without a word. From the gap you watch him talk to the police like they are regulars.`,
  ], { mood: 'tense', weight: 2 });

  // Lore gate — only fires after the mid-game Macau thread and away from home.
  corpus.addPool('fletcher', 'deal', [
    `"Word travels." He does not look at you. "They know about Macau. That kind of thing follows a man."`,
  ], {
    mood: 'paranoid',
    weight: 1,
    prereqs: PREREQS.knowsMacau(),
    once: true,
  });

  return corpus;
}

// ── Registration ────────────────────────────────────────────────

/** The app's default corpus. Built once; consumers may add more pools. */
export const SAMPLE_CORPUS: DialogueCorpus = buildSampleCorpus();

let registered = false;
/** Register the sample corpus into the engine's default registry (idempotent). */
export function loadSampleCorpus(): void {
  if (registered) return;
  registerCorpus(SAMPLE_CORPUS, true);
  registered = true;
}
