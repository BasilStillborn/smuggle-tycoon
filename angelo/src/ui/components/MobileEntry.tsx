import { useState, useCallback, Component, type ReactNode } from 'react';
import type { GameState } from '../../core';
import { GameShell } from '../flow/GameShell';
import { ContentWarning } from './ContentWarning';
import { UniversalIntro } from './UniversalIntro';
import { BriefingScreen } from './BriefingScreen';
import { LeaderboardScreen } from './LeaderboardScreen';

type Screen = 'warning' | 'intro' | 'briefing' | 'game' | 'leaderboard';

class ErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Game crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' }}>
          <div className="card" style={{ padding: 24, maxWidth: 400, textAlign: 'center' }}>
            <div style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 16 }}>Something went wrong. Refresh the page to continue.</div>
            <button className="btn btn-primary" onClick={this.props.onReset}>Go to Start</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function loadSavedState(): GameState | null {
  try {
    const raw = localStorage.getItem('angelo_save');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const MobileEntry: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('warning');
  const [loadedState, setLoadedState] = useState<GameState | null>(null);

  const handleStart = useCallback(() => {
    setLoadedState(null);
    setScreen('briefing');
  }, []);

  const handleBriefingDone = useCallback(() => {
    setScreen('game');
  }, []);

  const handleNewGame = useCallback(() => {
    setLoadedState(null);
    setScreen('intro');
  }, []);

  const handleLeaderboard = useCallback(() => {
    setScreen('leaderboard');
  }, []);

  const handleLeaderboardBack = useCallback(() => {
    setScreen('game');
  }, []);

  const handleLoadSave = useCallback(() => {
    const saved = loadSavedState();
    if (saved) {
      setLoadedState(saved);
      setScreen('game');
    }
  }, []);

  if (screen === 'game') {
    return (
      <ErrorBoundary onReset={() => { setScreen('warning'); }}>
        <GameShell
          onNewGame={handleNewGame}
          onLeaderboard={handleLeaderboard}
          initialState={loadedState}
        />
      </ErrorBoundary>
    );
  }

  if (screen === 'leaderboard') {
    return <LeaderboardScreen onBack={handleLeaderboardBack} />;
  }

  if (screen === 'briefing') {
    return <BriefingScreen onContinue={handleBriefingDone} />;
  }

  if (screen === 'warning') {
    return <ContentWarning onStart={() => setScreen('intro')} onLoadSave={handleLoadSave} />;
  }

  return <UniversalIntro onStart={handleStart} />;
};
