import type { GameState } from '../../core';
import { loadJournal } from '../../core';
import { audioManager } from '../../audio';

interface JournalScreenProps {
  state: GameState;
  onBack: () => void;
}

export function JournalScreen({ state, onBack }: JournalScreenProps) {
  const persistentJournal = loadJournal();
  const runEntries = state.journalEntries;
  const allEntries = persistentJournal.entries;

  const formatCash = (n: number) => `$${n.toLocaleString()}`;

  const typeLabel = (type: string) => {
    switch (type) {
      case 'milestone': return '[MILESTONE]';
      case 'event': return '[EVENT]';
      case 'purchase': return '[PURCHASE]';
      case 'bust': return '[BUST]';
      case 'travel': return '[TRAVEL]';
      case 'run_end': return '[END]';
      default: return `[$${type.toUpperCase()}]`;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'text-retro-success';
      case 'event': return 'text-retro-accent';
      case 'purchase': return 'text-purple-400';
      case 'bust': return 'text-retro-danger';
      case 'travel': return 'text-blue-400';
      case 'run_end': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

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
            The Empire Chronicle
          </div>
        </div>
      </div>

      {/* Cross-run stats */}
      <div className="border-b-2 border-retro-border bg-[#0d0d0d] px-4 py-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">All-Time Legacy</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-gray-600 text-[10px]">Total Runs</div>
            <div className="text-retro-accent">{persistentJournal.totalRuns}</div>
          </div>
          <div>
            <div className="text-gray-600 text-[10px]">Peak Net Worth</div>
            <div className="text-retro-accent">{formatCash(persistentJournal.allTimePeakNetWorth)}</div>
          </div>
          <div>
            <div className="text-gray-600 text-[10px]">Lifetime Profit</div>
            <div className="text-retro-success">{formatCash(persistentJournal.allTimeProfit)}</div>
          </div>
          <div>
            <div className="text-gray-600 text-[10px]">Total Busts</div>
            <div className="text-retro-danger">{persistentJournal.allTimeBusts}</div>
          </div>
          {persistentJournal.favoriteCharacter && (
            <div>
              <div className="text-gray-600 text-[10px]">Favorite Operative</div>
              <div className="text-purple-400">{persistentJournal.favoriteCharacter}</div>
            </div>
          )}
          {persistentJournal.favoriteRoute && (
            <div>
              <div className="text-gray-600 text-[10px]">Most Traveled Route</div>
              <div className="text-blue-400">{persistentJournal.favoriteRoute}</div>
            </div>
          )}
        </div>
      </div>

      {/* Run entries */}
      <div className="flex-1 overflow-y-auto">
        <div className="text-[10px] text-gray-600 uppercase tracking-widest px-4 py-2 border-b border-retro-border bg-[#0a0a0a]">
          This Run
        </div>
        {runEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-xs italic">No entries yet this run.</div>
        ) : (
          runEntries.map((entry, i) => (
            <div key={i} className="flex text-xs px-4 py-2 border-b border-retro-border border-dashed hover:bg-[#0f0f0f]">
              <div className="w-12 shrink-0 text-gray-600 text-[10px]">T{entry.turn}</div>
              <div className="w-20 shrink-0">
                <span className={`text-[10px] ${typeColor(entry.type)}`}>{typeLabel(entry.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-gray-300 truncate">{entry.title}</div>
                <div className="text-[10px] text-gray-600 truncate">{entry.description}</div>
              </div>
              <div className="w-28 shrink-0 text-right text-[10px] text-gray-500 hidden sm:block">
                ${entry.cash.toLocaleString()}
              </div>
            </div>
          ))
        )}

        {/* Persistent entries */}
        {allEntries.length > 0 && (
          <>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest px-4 py-2 border-b border-retro-border bg-[#0a0a0a] mt-4">
              Previous Runs
            </div>
            {allEntries.filter((e) => e.type === 'run_end').reverse().map((entry, i) => (
              <div key={i} className="flex text-xs px-4 py-2 border-b border-retro-border border-dashed hover:bg-[#0f0f0f]">
                <div className="w-12 shrink-0 text-gray-600 text-[10px]">T{entry.turn}</div>
                <div className="w-20 shrink-0">
                  <span className="text-[10px] text-gray-500">[RUN]</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-400 truncate">{entry.title}</div>
                  <div className="text-[10px] text-gray-600 truncate">{entry.description}</div>
                </div>
                <div className="w-28 shrink-0 text-right text-[10px] text-gray-600 hidden sm:block">
                  ${entry.cash.toLocaleString()}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
