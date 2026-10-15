import type { GameState } from '../../core';

export type FlowScreen = 'hub' | 'plan' | 'plan-destination' | 'scene' | 'stash' | 'run';

export interface RunStep {
  id: string;
  label: string;
}

/** The four beats of a single run, mirrored from the engine phases. */
export const RUN_STEPS: RunStep[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'flight', label: 'Flight' },
  { id: 'deal', label: 'Deal' },
  { id: 'home', label: 'Home' },
];

/** True when the player is mid-run (has withdrawn cash or left home). */
export function isRunActive(state: GameState): boolean {
  return state.player.cash !== 0 || state.gamePhase !== 'home' || state.headingToAirport || state.player.inventory.length > 0;
}

export function resolveScreen(state: GameState): FlowScreen {
  if (state.pendingEvent) return 'scene';
  if (state.headingToAirport) return 'plan-destination';
  if (state.gamePhase === 'home') return state.player.cash === 0 ? 'hub' : 'plan';
  if (state.gamePhase === 'selling') return 'stash';
  return 'run';
}

/** 0-based index into RUN_STEPS for the current run beat. */
export function currentStepIndex(state: GameState): number {
  switch (state.gamePhase) {
    case 'home':
      return state.player.cash === 0 ? -1 : 0;
    case 'flying_out':
    case 'flying_back':
      return 1;
    case 'arrived':
    case 'selecting_dealer':
    case 'buying':
      return 2;
    case 'selling':
    case 'returned':
      return 3;
    default:
      return 0;
  }
}
