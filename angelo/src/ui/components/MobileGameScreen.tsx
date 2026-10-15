import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { GameState, GameAction } from '../../core';
import {
  createGameState,
  gameReducer as coreReducer,
  getInventoryValue,
} from '../../core';
import { audioManager } from '../../audio';
import { BottomNav, type TabId } from './BottomNav';
import { DashboardPanel } from './DashboardPanel';
import { MarketPanel } from './MarketPanel';
import { TravelPanel } from './TravelPanel';
import { EventModal } from './EventModal';
import { SafehousePanel } from './SafehousePanel';
import { ScoreSubmitModal } from './ScoreSubmitModal';
import { KingpinsPanel } from './KingpinsPanel';
import { GameBriefingModal } from './GameBriefingModal';
import { BankModal } from './BankModal';
import { CashModal } from './CashModal';
import { PeakWealthModal } from './PeakWealthModal';
import { GuideGatekeeper } from './GuideGatekeeper';
import { JournalScreen } from './JournalScreen';

interface Props {
  onNewGame: () => void;
  onLeaderboard: () => void;
  initialState?: GameState | null;
}

export const MobileGameScreen: React.FC<Props> = ({ onNewGame, onLeaderboard, initialState }) => {
  const [state, dispatch] = useReducer(
    coreReducer,
    undefined,
    () => initialState ?? createGameState(),
  );

  const prevStateRef = useRef<GameState | null>(null);
  const [showScoreSubmit, setShowScoreSubmit] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showCash, setShowCash] = useState(false);
  const [showPeak, setShowPeak] = useState(false);
  const [showGuideGatekeeper, setShowGuideGatekeeper] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [alias, setAlias] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSave = useCallback((s: GameState) => {
    try {
      localStorage.setItem('angelo_save', JSON.stringify(s));
    } catch { /* quota */ }
  }, []);

  useEffect(() => {
    if (prevStateRef.current && prevStateRef.current !== state) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => handleSave(state), 500);
    }
    prevStateRef.current = state;
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state, handleSave]);

  const netWorth = state.player.cash + state.player.bank + getInventoryValue(state.player, state.currentMarketPrices);

  const handleNewGameConfirmed = useCallback(() => {
    localStorage.removeItem('angelo_save');
    onNewGame();
  }, [onNewGame]);

  const cashDisplay = state.player.runActive
    ? `$${state.player.cash.toLocaleString()}`
    : '—';

  const renderPanel = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPanel
            state={state}
            dispatch={dispatch}
            onOpenBank={() => setShowBank(true)}
            onOpenBriefing={() => setShowBriefing(true)}
            onEndRun={() => setShowEndConfirm(true)}
          />
        );
      case 'market':
        return <MarketPanel state={state} dispatch={dispatch} />;
      case 'travel':
        return <TravelPanel state={state} dispatch={dispatch} />;
      case 'safehouse':
        return <SafehousePanel netWorth={netWorth} currentTier={state.safehouseTier} />;
      case 'kingpins':
        return <KingpinsPanel state={state} dispatch={dispatch} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          paddingTop: 'calc(var(--safe-top) + 4px)',
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
          minHeight: 44,
        }}
      >
        <button
          onClick={() => setShowGameMenu(true)}
          style={{
            background: 'var(--bg-secondary)',
            border: 'none',
            color: 'var(--text)',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ☰
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{cashDisplay}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            NW: ${netWorth.toLocaleString()}
          </div>
        </div>
        <button
          onClick={() => setShowJournal(true)}
          style={{
            background: 'var(--bg-secondary)',
            border: 'none',
            color: 'var(--text)',
            padding: '6px 10px',
            borderRadius: 8,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Journal
        </button>
      </header>

      <main
        style={{
          flex: 1,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {renderPanel()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {showGameMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setShowGameMenu(false)}
        >
          <div
            className="card sheet-up"
            style={{
              width: '100%',
              maxWidth: 400,
              margin: '0 auto',
              padding: 24,
              borderRadius: '16px 16px 0 0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Menu</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => { setShowBank(true); setShowGameMenu(false); }}>
                Bank
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowCash(true); setShowGameMenu(false); }}>
                Cash
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowBriefing(true); setShowGameMenu(false); }}>
                Briefing
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowGuideGatekeeper(true); setShowGameMenu(false); }}>
                Guide
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowPeak(true); setShowGameMenu(false); }}>
                Peak Wealth
              </button>
              <button className="btn btn-secondary" onClick={onLeaderboard}>
                Leaderboard
              </button>
              <button
                className="btn btn-danger"
                onClick={() => { setShowEndConfirm(true); setShowGameMenu(false); }}
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowEndConfirm(false)}
        >
          <div
            className="card"
            style={{ padding: 24, maxWidth: 320, width: '90%', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>End Game?</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Your run will be finalized and submitted to the leaderboard.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEndConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleNewGameConfirmed}>
                End
              </button>
            </div>
          </div>
        </div>
      )}

      {showBank && <BankModal state={state} dispatch={dispatch} onClose={() => setShowBank(false)} />}
      {showCash && <CashModal onClose={() => setShowCash(false)} />}
      {showBriefing && <GameBriefingModal onClose={() => setShowBriefing(false)} />}
      {showGuideGatekeeper && <GuideGatekeeper onProceed={() => setShowGuideGatekeeper(false)} onClose={() => setShowGuideGatekeeper(false)} />}
      {showPeak && <PeakWealthModal onClose={() => setShowPeak(false)} />}
      {showJournal && <JournalScreen state={state} onBack={() => setShowJournal(false)} />}

      {state.pendingEvent && <EventModal event={state.pendingEvent} dispatch={dispatch} />}

      {showScoreSubmit && (
        <ScoreSubmitModal
          state={{
            characterName: alias || 'Unknown',
            cash: state.player.cash,
            bank: state.player.bank,
            peakNetWorth: state.player.peakNetWorth,
            totalProfit: state.player.totalProfit,
            totalTrips: state.player.totalTrips,
            totalBusts: state.player.totalBusts,
            reputation: state.player.reputation,
            survivalTime: state.turn,
            countriesVisited: state.player.visitedCountries.length,
          }}
          onDone={() => setShowScoreSubmit(false)}
        />
      )}
    </div>
  );
};
