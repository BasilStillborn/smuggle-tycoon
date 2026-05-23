import { useState, useCallback, Component, type ReactNode } from 'react';
import { GameScreen } from './ui/components/GameScreen';
import { LeaderboardScreen } from './ui/components/LeaderboardScreen';
import { UniversalIntro } from './ui/components/UniversalIntro';
import { BriefingScreen } from './ui/components/BriefingScreen';
import { ContentWarning } from './ui/components/ContentWarning';

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
        <div className="min-h-screen bg-retro-bg text-retro-text font-mono flex items-center justify-center p-4">
          <div className="border-2 border-retro-border bg-retro-panel max-w-md w-full p-6 text-center">
            <div className="text-retro-danger text-sm mb-4">Something went wrong. Refresh the page to continue.</div>
            <button
              onClick={this.props.onReset}
              className="border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-6 py-2 text-xs uppercase"
            >Go to Start</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>('warning');

  const handleStart = useCallback(() => {
    setScreen('briefing');
  }, []);

  const handleBriefingDone = useCallback(() => {
    setScreen('game');
  }, []);

  const handleNewGame = useCallback(() => {
    setScreen('intro');
  }, []);

  const handleLeaderboard = useCallback(() => {
    setScreen('leaderboard');
  }, []);

  const handleLeaderboardBack = useCallback(() => {
    setScreen('game');
  }, []);

  if (screen === 'game') {
    return (
      <ErrorBoundary onReset={() => { setScreen('warning'); }}>
        <div className="crt">
          <GameScreen
            onNewGame={handleNewGame}
            onLeaderboard={handleLeaderboard}
          />
        </div>
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
    return <ContentWarning onStart={() => setScreen('intro')} />;
  }

  return <UniversalIntro onStart={handleStart} />;
}

export default App;
