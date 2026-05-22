import { useState, useCallback } from 'react';
import { GameScreen } from './ui/components/GameScreen';
import { LeaderboardScreen } from './ui/components/LeaderboardScreen';
import { UniversalIntro } from './ui/components/UniversalIntro';
import { BriefingScreen } from './ui/components/BriefingScreen';
import { ContentWarning } from './ui/components/ContentWarning';

type Screen = 'warning' | 'intro' | 'briefing' | 'game' | 'leaderboard';

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
      <div className="crt">
        <GameScreen
          onNewGame={handleNewGame}
          onLeaderboard={handleLeaderboard}
        />
      </div>
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
