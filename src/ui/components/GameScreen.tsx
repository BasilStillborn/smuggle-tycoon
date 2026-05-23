import { useCallback, useEffect, useReducer, useRef, useMemo, useState } from 'react';
import type { GameState, GameAction } from '../../core';
import { createGameState, gameReducer as coreReducer, getInventoryValue, finalizeRun, loadJournal, getOwnedAssets, KINGPIN_POOL, getOverdraftLimit } from '../../core';
import { fetchLeaderboard } from '../../supabase';
import { audioManager } from '../../audio';
import { StatsPanel } from './StatsPanel';
import { MarketPanel } from './MarketPanel';
import { TravelPanel } from './TravelPanel';
import { EventModal } from './EventModal';
import { SafehousePanel } from './SafehousePanel';
import { getSafehouseTier } from '../visual/SafehouseState';
import { ScoreSubmitModal } from './ScoreSubmitModal';
import { AliasModal } from './AliasModal';
import { AssetShop } from './AssetShop';
import { GameBriefingModal } from './GameBriefingModal';
import { BankModal } from './BankModal';
import { InventoryPanel } from './InventoryPanel';
import { JournalScreen } from './JournalScreen';
import { VisualState, getCombinedVisuals } from '../visual/VisualState';

interface GameScreenProps {
  onNewGame: () => void;
  onLeaderboard: () => void;
  initialState?: GameState | null;
}

function getCountriesVisited(state: GameState): number {
  const visited = new Set<string>();
  visited.add(state.player.currentCountryId);
  Object.keys(state.marketMemory).forEach((cid) => visited.add(cid));
  return visited.size;
}

export function GameScreen({ onNewGame, onLeaderboard, initialState }: GameScreenProps) {
  const [state, dispatch] = useReducer(
    coreReducer,
    undefined,
    () => initialState ?? createGameState()
  );

  const prevStateRef = useRef<GameState | null>(null);
  const [showScoreSubmit, setShowScoreSubmit] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showAlias, setShowAlias] = useState(false);
  const [globalRank, setGlobalRank] = useState<number | null>(null);

  // Show alias entry on load — always appears, pre-populated if saved
  useEffect(() => {
    setShowAlias(true);
  }, []);

  // Fetch player rank daily
  useEffect(() => {
    const fetchRank = async () => {
      const alias = localStorage.getItem('angelo_alias');
      if (!alias) return;
      try {
        const entries = await fetchLeaderboard('all_time');
        const idx = entries.findIndex(e => e.alias === alias);
        setGlobalRank(idx >= 0 ? idx + 1 : null);
      } catch { setGlobalRank(null); }
    };
    fetchRank();
    // Refresh every 24 hours
    const interval = setInterval(fetchRank, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showAlias]);

  // Init audio on mount
  useEffect(() => {
    audioManager.init();
    audioManager.playAmbience(state.player.currentCountryId);
    audioManager.playMusic('normal');
    return () => {
      audioManager.stopAll();
    };
  }, []);

  // Detect safehouse tier changes
  useEffect(() => {
    const nw = state.player.bank + state.player.cash;
    const newTier = getSafehouseTier(nw, state.safehouseTier);
    if (newTier !== state.safehouseTier && !state.pendingEvent) {
      dispatch({ type: 'SAFEHOUSE_TIER_CHANGE' });
    }
  }, [state.player.bank, state.player.cash, state.safehouseTier, state.pendingEvent]);

  // Track when run ends to show score submit and save journal
  useEffect(() => {
    if (prevStateRef.current && !state.player.runActive && prevStateRef.current.player.runActive) {
      setShowScoreSubmit(true);
      finalizeRun(loadJournal(), {
        characterName: 'Angelo',
        peakNetWorth: state.player.peakNetWorth,
        totalProfit: state.player.totalProfit,
        totalBusts: state.player.totalBusts,
        finalCash: state.player.cash,
        finalHeat: state.player.heat,
        finalReputation: state.player.reputation,
        totalTrips: state.player.totalTrips,
        survivalTime: state.turn,
        countriesVisited: getCountriesVisited(state),
        mostVisitedRoute: state.player.currentCountryId,
      });
    }
  }, [state.player.runActive]);

  // Adaptive audio
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    audioManager.updateFromGameState({
      heat: state.player.heat,
      currentCountryId: state.player.currentCountryId,
      cash: state.player.cash + state.player.bank,
      pendingEvent: state.pendingEvent !== null,
      runActive: state.player.runActive,
    });

    if (prev) {
      if (prev.turn !== state.turn) {
        const prevLog = prev.gameLog;
        const currLog = state.gameLog;
        const newEntries = currLog.slice(prevLog.length);

        for (const entry of newEntries) {
          if (entry.includes('Bought')) audioManager.playSfx('buy');
          else if (entry.includes('Sold')) audioManager.playSfx('sell');
          else if (entry.includes('Traveled') && !entry.includes('BUSTED')) {
            audioManager.playSfx('travel_depart');
            setTimeout(() => audioManager.playSfx('travel_arrive'), 400);
          } else if (entry.includes('[SUCCESS]')) audioManager.playSfx('success');
          else if (entry.includes('[FAILURE]')) audioManager.playSfx('failure');
          else if (entry.includes('BUSTED')) audioManager.playSfx('bust');
          else if (entry.includes('Waited')) audioManager.playSfx('click');
          else if (entry.includes('Game saved') || entry.includes('Game loaded')) audioManager.playSfx('click');
          else if (entry.includes('EVENT')) audioManager.playSfx('event_appear');
        }
      }

      if (!state.player.runActive && prev.player.runActive) {
        audioManager.playSfx('bust');
      }
    }
  }, [state]);

  const gameOver = !state.player.runActive;

  const GAME_OVER_MSGS = useMemo(() => [
    `You've run out of fucking money, you twat. All those opportunities and you've screwed it up — and don't go blaming the Jews. They've got nothing to do with this. This is on you, boy. You're a bottle job just like your old man. You're gonna have to get a job delivery driving now, but don't go stealing the food or you'll get fired from that as well. Lazy cunt.`,
    `GAME OVER, you absolute plonker. Look at the state of you. Five grand in the bank and you've managed to not only lose it but end up owing money. That takes a special kind of talent, Angelo — the kind that gets you banned from Ladbrokes and disowned at family gatherings. Your nan knitted you a jumper last Christmas it says CUNT on it in big red letters, go and put it on! you grubby little bastard. Tesco are hiring night shift shelf stackers. They need silly black cunts like you who don't know their ass from their elbow. Oh, and if you do go and work in Tesco, don't get caught stealing from there as well!`,
    `You've gone and done it now, haven't you. Bankrupt. Skint. Busted flat. Less than zero. Your stepdad warned everyone this would happen — said you'd be back in the basement within a year, smelling of failure and cheap deodorant. He's going to be unbearable about this. Unbearable. You'll never hear the end of it at breakfast. "Morning, Angelo. Made any money laundering for the Albanian mafia lately?" Smug prick. And the worst part? He's right. You are a walking fucking disaster. Go sign on. The Jobcentre's got a desk with your name on it. Cunt.`,
    `Finished. Done. Washed up. You had it in your hands, Angelo — actual money, actual product, actual opportunities — and you've somehow turned it all into negative bank balance and a police file thicker than a phone book. They're going to study you at business school. "Case Study 47: How To Fuck Up A Smuggling Operation In Five Easy Steps." Your mum's going to be so disappointed. She already was, to be fair, but this is a whole new level. There's a kebab shop on the high street that needs a delivery driver. The manager's called Steve. He's a cunt, but so are you, so you'll get on fine. Off you pop.`,
  ], []);

  const gameOverMsg = useMemo(() => GAME_OVER_MSGS[Math.floor(Math.random() * GAME_OVER_MSGS.length)], []);

  const handleNewGame = useCallback(() => {
    audioManager.playSfx('click');
    setShowScoreSubmit(false);
    onNewGame();
  }, [onNewGame]);

  const handleMuteToggle = useCallback(() => {
    audioManager.toggleMute();
  }, []);

  const isMuted = audioManager.isMuted();

  const netWorth = useMemo(() => {
    const invValue = getInventoryValue(state.player, state.currentMarketPrices);
    return state.player.bank + state.player.cash + invValue;
  }, [state.player.bank, state.player.cash, state.player.inventory, state.currentMarketPrices]);

  const ownsFunctionalAsset = useMemo(() => {
    return getOwnedAssets(state.player).some(a => a.class === 'functional');
  }, [state.player.ownedAssets]);

  const visuals = useMemo(
    () => getCombinedVisuals({
      cash: state.player.cash + state.player.bank,
      inventoryValue: getInventoryValue(state.player, state.currentMarketPrices),
      peakNetWorth: state.player.peakNetWorth,
      reputation: state.player.reputation,
      heat: state.player.heat,
      hasFunctionalAsset: ownsFunctionalAsset,
    }),
    [state.player.cash, state.player.bank, state.player.inventory, state.currentMarketPrices, state.player.reputation, state.player.peakNetWorth, state.player.heat, ownsFunctionalAsset]
  );

  const submitState = useMemo(() => ({
    characterName: 'Angelo',
    cash: state.player.cash,
    bank: state.player.bank,
    peakNetWorth: state.player.peakNetWorth,
    totalProfit: state.player.totalProfit,
    totalTrips: state.player.totalTrips,
    totalBusts: state.player.totalBusts,
    reputation: state.player.reputation,
    survivalTime: state.turn,
    countriesVisited: getCountriesVisited(state),
  }), [state]);

  const handleScoreSubmitDone = useCallback(() => {
    setShowScoreSubmit(false);
  }, []);

  const handleEndTrip = useCallback(() => {
    dispatch({ type: 'END_TRIP' });
  }, []);

  const isAtOrigin = state.player.currentCountryId === 'london';
  const canStartTrip = isAtOrigin && state.player.cash === 0 && state.player.bank > 0;
  const canEndTrip = isAtOrigin && state.player.inventory.length === 0 && (state.player.totalTrips > 0 || state.player.cash > 0);

  const KINGPIN_NICKNAMES: Record<string, string> = {
    avi: '(the Jew)',
    iqbal: '(the chav)',
    sergio: '(the Albanian drug dealer)',
  };

  const cashColor = state.player.cash < 0 ? 'text-retro-danger' : 'text-retro-success';
  const cashPulse = state.player.cash < -500 ? 'animate-pulse' : '';

  if (gameOver) {
    return (
      <div className="min-h-screen bg-retro-bg text-retro-text p-6 font-mono flex flex-col items-center justify-center">
        <div className="border border-retro-border bg-retro-panel p-8 max-w-md w-full text-center">
          <div className="text-retro-danger text-lg mb-4 glow-text-danger">GAME OVER</div>
          <div className="text-sm text-gray-300 mb-6 leading-relaxed space-y-2">
            {gameOverMsg}
          </div>
          <div className="text-[10px] text-gray-600 mb-4 space-x-4">
            <span>Bank: <span className="text-retro-success">${state.player.bank.toLocaleString()}</span></span>
            <span>Peak: <span className="text-retro-accent">${state.player.peakNetWorth.toLocaleString()}</span></span>
            <span>Trips: {state.player.totalTrips}</span>
            <span>Busts: <span className="text-retro-danger">{state.player.totalBusts}</span></span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNewGame}
              className="touch-target pixel-highlight flex-1 border border-retro-accent text-retro-accent bg-[#111] hover:bg-[#222] px-6 py-3 text-sm transition-colors"
            >
              New Run
            </button>
            <button
              onClick={() => { audioManager.playSfx('click'); onLeaderboard(); }}
              className="touch-target pixel-highlight flex-1 border border-retro-border bg-[#111] hover:bg-[#222] px-6 py-3 text-sm transition-colors text-gray-400"
            >
              Leaderboard
            </button>
          </div>
        </div>

        {showScoreSubmit && (
          <ScoreSubmitModal state={submitState} onDone={handleScoreSubmitDone} />
        )}
      </div>
    );
  }

  return (
    <>
      <VisualState
      data={{
        cash: state.player.cash + state.player.bank,
        inventoryValue: getInventoryValue(state.player, state.currentMarketPrices),
        peakNetWorth: state.player.peakNetWorth,
        reputation: state.player.reputation,
        heat: state.player.heat,
      }}
    >
      <div className="min-h-screen text-retro-text font-mono">
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="border-b border-retro-border bg-retro-panel/90 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {globalRank && (
                <span className={`text-[10px] font-bold px-2 py-0.5 border ${globalRank <= 3 ? 'border-retro-accent text-retro-accent' : 'border-retro-border text-gray-500'}`}
                  title={`Global rank: #${globalRank.toLocaleString()}`}>
                  #{globalRank > 999 ? (globalRank / 1000).toFixed(1) + 'K' : globalRank}
                </span>
              )}
              <button
                onClick={() => { audioManager.playSfx('click'); setShowBriefing(true); }}
                className="text-[10px] text-gray-500 hover:text-retro-accent border border-retro-border px-1.5 py-0.5 transition-colors"
                title="Game brief / controls reference"
              >[GUIDE]</button>
              <div className="text-retro-accent text-sm tracking-widest uppercase glow-text">ANGELO</div>
            </div>

            {/* Cash — prominent center display */}
            <div className={`flex items-center gap-1 border-2 ${state.player.cash < 0 ? 'border-retro-danger' : 'border-retro-accent/50'} bg-[#0a0a0a] px-3 py-1 ${cashPulse}`}>
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Cash</span>
              <span className={`${cashColor} font-bold text-sm tabular-nums ${state.player.cash >= 0 ? 'glow-text-success' : 'glow-text-danger'}`}>${state.player.cash.toLocaleString()}</span>
              {state.player.cash < 0 && (
                <span className="text-[9px] text-retro-danger">/ ${getOverdraftLimit(state.player).toLocaleString()}</span>
              )}
            </div>

            <div className="flex gap-2 text-xs text-gray-500 items-center">
              <span className="text-gray-400">Turn {state.turn}</span>
              <button
                onClick={() => { audioManager.playSfx('click'); setShowBank(true); }}
                className="border-2 border-retro-accent/50 bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-3 py-1 text-xs font-bold transition-colors"
                title="Open banking"
              >[BANK]</button>
              <span className="text-gray-600 text-[10px]">|</span>
              <span className={state.player.heat >= 50 ? 'text-orange-400' : ''}>H{state.player.heat}</span>
              <span className={state.player.credibility >= 50 ? 'text-purple-400' : ''}>C{state.player.credibility}</span>
              <button
                onClick={() => { audioManager.playSfx('click'); onLeaderboard(); }}
                className="touch-target border border-retro-border px-2 py-0.5 hover:bg-[#222] transition-colors text-[10px]"
              >{globalRank ? `[SCORES #${globalRank}]` : '[SCORES]'}</button>
              <button
                onClick={() => { audioManager.playSfx('click'); setShowJournal(true); }}
                className="touch-target border border-retro-border px-2 py-0.5 hover:bg-[#222] transition-colors text-[10px]"
              >
                [JOURNAL]
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowGameMenu(!showGameMenu)}
                  className="touch-target border border-retro-border px-2 py-0.5 hover:bg-[#222] transition-colors text-[10px]"
                >
                  [MENU {showGameMenu ? '▲' : '▼'}]
                </button>
                {showGameMenu && (
                  <div className="absolute right-0 top-6 border-2 border-retro-border bg-retro-panel p-1 z-40 w-36 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    <button onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'SAVE' }); setShowGameMenu(false); }}
                      className="touch-target w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#222] transition-colors">Save Game</button>
                    <button onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'LOAD' }); setShowGameMenu(false); }}
                      className="touch-target w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#222] transition-colors">Load Game</button>
                    <button onClick={() => { audioManager.playSfx('click'); handleMuteToggle(); setShowGameMenu(false); }}
                      className="touch-target w-full text-left px-3 py-1.5 text-[10px] hover:bg-[#222] transition-colors">{isMuted ? 'Unmute Audio' : 'Mute Audio'}</button>
                    <div className="border-t border-retro-border my-0.5" />
                    <button onClick={() => { audioManager.playSfx('click'); setShowGameMenu(false); setShowEndConfirm(true); }}
                      className="touch-target w-full text-left px-3 py-1.5 text-[10px] text-red-400 hover:bg-[#1a0000] transition-colors">End Run</button>
                    <div className="border-t border-retro-border my-0.5" />
                    <button onClick={() => setShowGameMenu(false)}
                      className="touch-target w-full text-left px-3 py-1.5 text-[10px] text-gray-500 hover:bg-[#222] transition-colors">Close Menu</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Three-panel layout */}
          <div className="flex-1 flex gap-0 overflow-hidden">
            {/* Left: Stats + Safehouse */}
            <div className="w-64 shrink-0 border-r border-retro-border overflow-y-auto">
              <StatsPanel state={state} />
              <div className="mt-0.5 border-t border-retro-border pt-1">
                <SafehousePanel netWorth={state.player.bank + state.player.cash} currentTier={state.safehouseTier} />
              </div>
            </div>

            {/* Center: Market + Assets */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {canStartTrip && (
                <div className="border border-retro-border bg-retro-panel p-3">
                  <div className="text-[10px] text-gray-500 mb-2">Withdraw cash using the Bank box, then choose a destination to fly to.</div>
                </div>
              )}

              <MarketPanel state={state} dispatch={dispatch} />

              <InventoryPanel state={state} dispatch={dispatch} />

              <div className="border-t-2 border-retro-border my-2" />
              <AssetShop state={state} dispatch={dispatch} />

              {/* End Trip — always visible, greyed out when unavailable */}
              {isAtOrigin && (
                <div className="border border-retro-border bg-retro-panel p-3">
                  <button
                    onClick={() => { if (canEndTrip) { audioManager.playSfx('click'); handleEndTrip(); } }}
                    disabled={!canEndTrip}
                    title={!canEndTrip
                      ? state.player.inventory.length > 0
                        ? 'Stash or sell your goods before ending the trip'
                        : state.player.cash === 0
                          ? 'No cash to deposit — you are already banked'
                          : ''
                      : `Deposit $${state.player.cash.toLocaleString()} to your bank account`}
                    className={`touch-target w-full border-2 px-4 py-3 text-xs transition-colors font-bold ${canEndTrip ? 'border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent' : 'border-retro-border bg-[#111] text-gray-600 cursor-not-allowed'}`}
                  >
                    {canEndTrip
                      ? `DEPOSIT & RETURN ($${state.player.cash.toLocaleString()} → Bank)`
                      : state.player.inventory.length > 0
                        ? 'Stash goods to end trip'
                        : 'End Trip'}
                  </button>
                  {!canEndTrip && (
                    <div className="text-[9px] text-gray-600 mt-1">
                      {state.player.inventory.length > 0
                        ? 'Stash or sell your goods first, then deposit.'
                        : state.player.cash === 0
                          ? 'No cash on hand to deposit.'
                          : 'Return to London to end your trip.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Travel + Kingpins */}
            <div className="w-72 shrink-0 border-l border-retro-border overflow-y-auto">
              <TravelPanel state={state} dispatch={dispatch} />

              {/* Kingpin cards — always visible, styled like flights */}
              <div className="px-2 mt-0.5 border-t border-retro-border pt-1 space-y-1.5 pb-2">
                <div className="text-retro-accent text-[10px] uppercase tracking-widest glow-text px-1">Kingpins</div>
                {(() => {
                  const stashValue = state.player.stash.reduce((sum, i) => {
                    const g = state.goods.find(x => x.id === i.goodId);
                    return sum + (g ? g.baseValuePerUnit * i.quantity : 0);
                  }, 0);
                  const invValue = state.player.inventory.reduce((sum, i) => {
                    const g = state.goods.find(x => x.id === i.goodId);
                    return sum + (g ? g.baseValuePerUnit * i.quantity : 0);
                  }, 0);
                  const visibleValue = invValue > 0 ? invValue : stashValue;
                  return KINGPIN_POOL.map(kp => {
                    const canMeet = state.gamePhase === 'selling' && visibleValue >= kp.minStashValue;
                    const short = kp.minStashValue - visibleValue;
                    const btnLabel = state.gamePhase !== 'selling' ? 'Return to London'
                      : canMeet ? `Contact ${kp.name}`
                      : `Need $${short.toLocaleString()}`;
                    return (
                      <button key={kp.id}
                        onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'CONTACT_KINGPIN', kingpinId: kp.id }); }}
                        className={`touch-target w-full text-left border-2 px-3 py-2 text-xs transition-colors ${
                          canMeet
                            ? 'border-retro-border bg-[#111] hover:bg-[#222] cursor-pointer'
                            : 'border-retro-border bg-[#111] text-gray-600 cursor-pointer hover:bg-[#1a1a1a] opacity-70'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${canMeet ? 'text-gray-300' : 'text-gray-500'}`}>{kp.name} <span className="text-gray-600 font-normal text-[10px]">{KINGPIN_NICKNAMES[kp.id]}</span></span>
                          <span className="text-[10px] text-retro-success font-bold">{Math.round(kp.sellPriceMod * 100)}%</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{kp.description.substring(0, 50)}...</div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[9px] text-gray-600">{kp.location}</span>
                          <span className="text-[9px] text-retro-accent font-bold">${kp.minStashValue.toLocaleString()}</span>
                        </div>
                        <div className={`text-[9px] mt-1 ${canMeet ? 'text-retro-accent' : 'text-gray-600'}`}>
                          {btnLabel}
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualState>

    {/* Event Modal — outside VisualState stacking context, renders above scanlines/vignette */}
    {state.pendingEvent && (
      <EventModal event={state.pendingEvent} dispatch={dispatch} />
    )}

    {/* End Run confirmation dialog */}
    {showEndConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowEndConfirm(false)}>
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative border-2 border-retro-border bg-retro-panel max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="text-retro-danger text-xs uppercase tracking-widest mb-4 glow-text-danger font-bold">End Current Run</div>
          <div className="text-sm text-gray-300 leading-relaxed mb-4 space-y-3">
            <p>This action will end your current game immediately.</p>
            <p>Your progress will be saved to the leaderboard. There is no undo.</p>
            <p className="text-gray-500 text-xs italic">Final cash, peak net worth, trips, and busts will all be recorded. Start a new game afterwards to continue playing.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { audioManager.playSfx('click'); setShowEndConfirm(false); }}
              className="touch-target flex-1 border-2 border-retro-border bg-[#111] hover:bg-[#222] px-4 py-3 text-xs transition-colors text-gray-400">Go Back</button>
            <button onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'END_RUN' }); }}
              className="touch-target flex-1 border-2 border-retro-danger bg-retro-danger/10 hover:bg-retro-danger/20 px-4 py-3 text-xs transition-colors text-retro-danger font-bold">Confirm End Run</button>
          </div>
        </div>
      </div>
    )}
    {showAlias && <AliasModal onDone={() => setShowAlias(false)} onLoadSave={() => { dispatch({ type: 'LOAD' }); setShowAlias(false); }} />}
    {showBriefing && <GameBriefingModal onClose={() => setShowBriefing(false)} />}
    {showBank && <BankModal state={state} dispatch={dispatch} onClose={() => setShowBank(false)} />}
    </>
  );
}
