import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { GameState, GameAction } from '../../core';
import { createGameState, gameReducer, getCountry, getLocationLabel } from '../../core';
import { audioManager } from '../../audio';
import type { SfxType } from '../../audio';
import { haptic, type HapticStyle } from '../../audio/haptics';

export const SAVE_KEY = 'angelo_save';

type Phase = GameState['gamePhase'];

export interface RunTransitionInfo {
  tone: 'neutral' | 'money' | 'danger';
  eyebrow?: string;
  label: string;
  sub?: string;
  cue: SfxType;
  haptic: HapticStyle;
  /** Bumped per fire so the overlay remounts and replays its animation. */
  nonce: number;
}

export interface GameFlow {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  /** Pure dispatch. Feedback belongs to the Tap primitive, not here. */
  send: (action: GameAction) => void;
  /** Imperative cue for state-driven moments that aren't taps. */
  feedback: (style?: HapticStyle) => void;
  transition: RunTransitionInfo | null;
  clearTransition: () => void;
}

export function loadSavedState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export function clearSavedState(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

function placeLabel(state: GameState): string {
  const country = getCountry(state.player.currentCountryId);
  return country ? getLocationLabel(country) : 'London';
}

/** The four high-stakes hinges of a single run, as phase boundaries. */
function transitionForPhase(prev: Phase | null, state: GameState): Omit<RunTransitionInfo, 'nonce'> | null {
  const phase = state.gamePhase;
  if (prev === null || prev === phase) return null;

  switch (phase) {
    case 'flying_out':
      if (prev === 'home') {
        return { tone: 'neutral', eyebrow: 'Flight', label: 'Departing', sub: 'Wheels up.', cue: 'travel_depart', haptic: 'medium' };
      }
      return null;
    case 'arrived':
      if (prev === 'flying_out' || prev === 'flying_back') {
        return { tone: 'neutral', eyebrow: 'Flight', label: 'Arriving', sub: placeLabel(state), cue: 'travel_arrive', haptic: 'medium' };
      }
      return null;
    case 'selling': {
      const busted = (state.pendingEvent?.id ?? '').startsWith('bust');
      return busted
        ? { tone: 'danger', eyebrow: 'Return', label: 'Busted', sub: 'Back in London.', cue: 'danger', haptic: 'error' }
        : { tone: 'money', eyebrow: 'Return', label: 'Back in London', sub: 'Time to move the product.', cue: 'processing', haptic: 'success' };
    }
    case 'home':
      if (prev !== 'home') {
        return { tone: 'money', label: 'Run complete', cue: 'money', haptic: 'success' };
      }
      return null;
    default:
      return null;
  }
}

export function useGameFlow(initialState?: GameState | null): GameFlow {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState ?? createGameState());
  const [transition, setTransition] = useState<RunTransitionInfo | null>(null);

  const prevStateRef = useRef<GameState | null>(null);
  const prevEventIdRef = useRef<string | null>(null);
  const prevPhaseRef = useRef<Phase | null>(null);
  const prevCredibilityRef = useRef<number | null>(null);
  const nonceRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    audioManager.init();
  }, []);

  useEffect(() => {
    if (prevStateRef.current && prevStateRef.current !== state) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch {
          /* quota */
        }
      }, 500);
    }
    prevStateRef.current = state;
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  useEffect(() => {
    audioManager.updateFromGameState({
      heat: state.player.heat,
      pendingEvent: !!state.pendingEvent,
      runActive: true,
    });

    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = state.gamePhase;

    const credibility = state.player.credibility;
    const prevCredibility = prevCredibilityRef.current;
    prevCredibilityRef.current = credibility;

    const hinge = transitionForPhase(prevPhase, state);
    if (hinge) {
      audioManager.playSfx(hinge.cue);
      haptic(hinge.haptic);
      setTransition({ ...hinge, nonce: ++nonceRef.current });
      prevEventIdRef.current = state.pendingEvent?.id ?? null;
      return;
    }

    const id = state.pendingEvent?.id ?? null;
    if (id && id !== prevEventIdRef.current && state.pendingEvent) {
      const ctx = state.pendingEvent.context ?? '';
      const isBad = /BUST|busted|confiscat/i.test(ctx) || id.startsWith('bust');
      audioManager.playSfx(isBad ? 'danger' : 'reveal');
      haptic(isBad ? 'error' : 'light');
      prevEventIdRef.current = id;
      return;
    }
    prevEventIdRef.current = id;

    // "The Click" for a standing drop: a quiet downbeat when credibility slips.
    // Display-only — proves the meter moved without a toast or a number popping.
    if (prevCredibility !== null && credibility < prevCredibility) {
      audioManager.playSfx('credibility_drop');
      haptic('light');
    }
  }, [state]);

  const send = useCallback((action: GameAction) => {
    dispatch(action);
  }, []);

  const feedback = useCallback((style: HapticStyle = 'light') => {
    audioManager.playSfx('click');
    haptic(style);
  }, []);

  const clearTransition = useCallback(() => setTransition(null), []);

  return { state, dispatch, send, feedback, transition, clearTransition };
}
