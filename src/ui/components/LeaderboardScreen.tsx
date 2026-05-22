import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardEntry, LeaderboardPeriod } from '../../supabase';
import { fetchLeaderboard } from '../../supabase';
import { audioManager } from '../../audio';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'all_time', label: 'All Time' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'daily', label: 'Daily' },
];

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: LeaderboardPeriod) => {
    setLoading(true);
    const data = await fetchLeaderboard(p);
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  const handlePeriodChange = (p: LeaderboardPeriod) => {
    audioManager.playSfx('click');
    setPeriod(p);
  };

  const formatCash = (n: number) => `$${n.toLocaleString()}`;
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const rankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-500';
  };

  const trophy = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const firstColClass = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 font-bold';
    if (rank <= 3) return 'font-bold';
    return '';
  };

  // Get current player rank from stored data
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myStats, setMyStats] = useState<{ peak: number; current: number }>({ peak: 0, current: 0 });

  useEffect(() => {
    const stored = localStorage.getItem('angelo_alias');
    if (stored && entries.length > 0) {
      const idx = entries.findIndex(e => e.alias === stored);
      if (idx >= 0) {
        setMyRank(idx + 1);
        setMyStats({ peak: entries[idx].peak_net_worth, current: entries[idx].current_wealth ?? 0 });
      }
    }
  }, [entries]);

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text font-mono flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-retro-border bg-retro-panel px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { audioManager.playSfx('click'); onBack(); }}
            className="touch-target border-2 border-retro-border bg-[#111] hover:bg-[#222] px-3 py-1.5 text-xs transition-colors"
          >
            &larr; Back
          </button>
          <div className="text-retro-accent text-sm tracking-widest uppercase glow-text">
            Global Leaderboard
          </div>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex border-b-2 border-retro-border bg-retro-panel/50">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePeriodChange(p.key)}
            className={`touch-target flex-1 px-4 py-3 text-xs tracking-widest uppercase transition-colors ${
              period === p.key
                ? 'bg-[#1a1a1a] text-retro-accent border-b-2 border-retro-accent'
                : 'text-gray-500 hover:bg-[#111]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="flex text-[10px] text-gray-600 uppercase tracking-widest px-3 py-2 border-b border-retro-border bg-[#0d0d0d]">
        <div className="w-10 shrink-0 text-center">#</div>
        <div className="flex-1">Player</div>
        <div className="w-28 shrink-0 text-right">Max Wealth</div>
        <div className="w-24 shrink-0 text-right">Current</div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm animate-pulse">
            Loading scores...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">
            <div className="text-lg mb-2">No scores yet</div>
            <div className="text-xs">Complete a run to appear on the leaderboard</div>
          </div>
        ) : (
          entries.map((entry, i) => {
            const rank = i + 1;
            const isMe = entry.alias === localStorage.getItem('angelo_alias');
            return (
              <div
                key={entry.id}
                className={`flex text-xs px-3 py-2 border-b border-retro-border border-dashed items-center ${
                  rank <= 3 ? 'bg-[#111]' : isMe ? 'bg-[#151510]' : 'hover:bg-[#0f0f0f]'
                }`}
              >
                <div className={`w-10 shrink-0 text-center ${rankColor(rank)}`}>
                  {trophy(rank) || `#${rank}`}
                </div>
                <div className={`flex-1 truncate ${firstColClass(rank)}`}>
                  {entry.alias}{isMe && <span className="text-retro-accent ml-1 text-[9px]">(you)</span>}
                </div>
                <div className="w-28 shrink-0 text-right text-retro-accent">
                  {formatCash(entry.peak_net_worth)}
                </div>
                <div className="w-24 shrink-0 text-right text-gray-400">
                  {formatCash(entry.current_wealth ?? 0)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Your Rank */}
      {myRank && myRank > 10 && (
        <div className="border-y-2 border-retro-accent/30 bg-[#111] px-4 py-2">
          <div className="flex text-xs items-center">
            <div className="w-10 shrink-0 text-center text-gray-500">#{myRank}</div>
            <div className="flex-1 text-retro-accent font-bold">{localStorage.getItem('angelo_alias')} (you)</div>
            <div className="w-28 shrink-0 text-right text-retro-accent">{formatCash(myStats.peak)}</div>
            <div className="w-24 shrink-0 text-right text-gray-400">{formatCash(myStats.current)}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-retro-border bg-retro-panel px-4 py-3 text-[10px] text-gray-600 text-center space-y-1">
        {myRank && (
          <div className="text-retro-accent">
            You are ranked <span className="font-bold">#{myRank}</span> · Peak: {formatCash(myStats.peak)} · Current: {formatCash(myStats.current)}
          </div>
        )}
        <div>
          {SUPABASE_CONFIGURED
            ? 'Connected to global leaderboard'
            : 'Offline mode — scores stored locally'}
        </div>
      </div>
    </div>
  );
}

const SUPABASE_CONFIGURED = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
