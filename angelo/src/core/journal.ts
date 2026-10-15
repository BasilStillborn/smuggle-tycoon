export interface JournalEntry {
  turn: number;
  timestamp: number;
  type: 'milestone' | 'event' | 'purchase' | 'bust' | 'travel' | 'run_end';
  title: string;
  description: string;
  cash: number;
  netWorth: number;
  heat: number;
  reputation: number;
}

export interface PlayerJournal {
  entries: JournalEntry[];
  totalRuns: number;
  allTimePeakNetWorth: number;
  allTimeProfit: number;
  allTimeBusts: number;
  favoriteCharacter: string;
  favoriteRoute: string;
}

const JOURNAL_KEY = 'angelo_journal';

export function loadJournal(): PlayerJournal {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createEmptyJournal();
}

export function saveJournal(journal: PlayerJournal): void {
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  } catch {}
}

function createEmptyJournal(): PlayerJournal {
  return {
    entries: [],
    totalRuns: 0,
    allTimePeakNetWorth: 0,
    allTimeProfit: 0,
    allTimeBusts: 0,
    favoriteCharacter: '',
    favoriteRoute: '',
  };
}

export function addJournalEntry(
  journal: PlayerJournal,
  entry: Omit<JournalEntry, 'timestamp'>
): PlayerJournal {
  return {
    ...journal,
    entries: [...journal.entries, { ...entry, timestamp: Date.now() }],
  };
}

export function finalizeRun(
  journal: PlayerJournal,
  runData: {
    characterName: string;
    peakNetWorth: number;
    totalProfit: number;
    totalBusts: number;
    finalCash: number;
    finalHeat: number;
    finalReputation: number;
    totalTrips: number;
    survivalTime: number;
    countriesVisited: number;
    mostVisitedRoute: string;
  }
): PlayerJournal {
  // Count how many times this character was used
  const charEntries = journal.entries.filter((e) => e.title.includes(runData.characterName));
  const charUseCount = charEntries.length + 1;

  // Update all-time stats
  const updated: PlayerJournal = {
    ...journal,
    entries: [
      ...journal.entries,
      {
        turn: runData.survivalTime,
        timestamp: Date.now(),
        type: 'run_end',
        title: `Run Ended — $${runData.characterName}`,
        description: `Survived $${runData.survivalTime} turns. Final cash: $${runData.finalCash.toLocaleString()}. Profit: ${runData.totalProfit.toLocaleString()}. Busts: ${runData.totalBusts}. Countries visited: ${runData.countriesVisited}/7.`,
        cash: runData.finalCash,
        netWorth: runData.peakNetWorth,
        heat: runData.finalHeat,
        reputation: runData.finalReputation,
      },
    ],
    totalRuns: journal.totalRuns + 1,
    allTimePeakNetWorth: Math.max(journal.allTimePeakNetWorth, runData.peakNetWorth),
    allTimeProfit: journal.allTimeProfit + runData.totalProfit,
    allTimeBusts: journal.allTimeBusts + runData.totalBusts,
    favoriteCharacter: charUseCount > 1 ? runData.characterName : journal.favoriteCharacter || runData.characterName,
    favoriteRoute: runData.mostVisitedRoute || journal.favoriteRoute,
  };

  saveJournal(updated);
  return updated;
}
