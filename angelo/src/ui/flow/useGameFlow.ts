import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { GameState, GameAction } from '../../core';
import { createGameState, gameReducer } from '../../core';
import { audioManager } from '../../audio';
import { haptic } from '../../audio/haptics';

export const SAVE_KEY = 'angelo_save';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

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

export interface GameFlow {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  /** UI tap: click sound + light haptic. */
  press: (style?: HapticStyle) => void;
  /** Tap + dispatch an engine action. */
  send: (action: GameAction, style?: HapticStyle) => void;
}

export function useGameFlow(initialState?: GameState | null): GameFlow {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initialState ?? createGameState());

  const prevStateRef = useRef<GameState | null>(null);
  const prevEventIdRef = useRef<string | null>(null);
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

    const id = state.pendingEvent?.id ?? null;
    if (id && id !== prevEventIdRef.current && state.pendingEvent) {
      const ctx = state.pendingEvent.context ?? '';
      const isBad = /BUST|busted|confiscat/i.test(ctx) || id.startsWith('bust');
      audioManager.playSfx(isBad ? 'danger' : 'reveal');
      haptic(isBad ? 'error' : 'light');
    }
    prevEventIdRef.current = id;
  }, [state]);

  const press = useCallback((style: HapticStyle = 'light') => {
    audioManager.playSfx('click');
    haptic(style);
  }, []);

  const send = useCallback((action: GameAction, style: HapticStyle = 'light') => {
    audioManager.playSfx('click');
    haptic(style);
    dispatch(action);
  }, []);

  return { state, dispatch, press, send };
}
