import { useState } from 'react';
import type { GameState } from '../../core';
import { useGameFlow } from './useGameFlow';
import { resolveScreen } from './steps';
import { HubStatBar } from '../components/HubStatBar';
import { SceneCard } from '../components/SceneCard';
import { BankModal } from '../components/BankModal';
import { SafehouseSheet, AssetsSheet } from '../components/HubSheets';
import { HubScreen, type HubSheetId } from '../screens/HubScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { StashSellScreen } from '../screens/StashSellScreen';
import { RunScreen } from '../screens/RunScreen';

interface Props {
  initialState?: GameState | null;
  onNewGame: () => void;
  onLeaderboard: () => void;
}

export function GameShell({ initialState, onNewGame: _onNewGame, onLeaderboard: _onLeaderboard }: Props) {
  const { state, dispatch, send } = useGameFlow(initialState);
  const [sheet, setSheet] = useState<HubSheetId | null>(null);

  const screen = resolveScreen(state);
  const isScene = screen === 'scene';
  const day = state.player.totalTrips + 1;

  return (
    <div className="gameshell">
      {!isScene && (
        <HubStatBar state={state} day={day} />
      )}

      <main className="gameshell__main">
        {screen === 'hub' && <HubScreen state={state} send={send} onOpenSheet={setSheet} />}
        {screen === 'plan' && <PlanScreen state={state} send={send} />}
        {screen === 'plan-destination' && <PlanScreen state={state} send={send} destinationFirst />}
        {screen === 'stash' && <StashSellScreen state={state} send={send} />}
        {screen === 'run' && <RunScreen state={state} send={send} />}
        {isScene && state.pendingEvent && (
          <SceneCard
            event={state.pendingEvent}
            onChoose={(choiceId) => send({ type: 'RESPOND_EVENT', choiceId })}
          />
        )}
      </main>

      {sheet === 'bank' && <BankModal state={state} dispatch={dispatch} onClose={() => setSheet(null)} />}

      {sheet && sheet !== 'bank' && (
        <div className="sheet-backdrop" onClick={() => setSheet(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet__grip" />
            <div className="sheet__header">
              <span className="sheet__title">{sheet === 'safehouse' ? 'Safehouse' : 'Assets'}</span>
              <button className="sheet__close" onClick={() => setSheet(null)}>✕</button>
            </div>
            {sheet === 'safehouse' && <SafehouseSheet state={state} send={send} />}
            {sheet === 'assets' && <AssetsSheet state={state} send={send} />}
          </div>
        </div>
      )}
    </div>
  );
}
