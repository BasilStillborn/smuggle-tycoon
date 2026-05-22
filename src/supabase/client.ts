import type { LeaderboardEntry, ScorePayload, SubmitResult, LeaderboardPeriod } from './types';
import { validateScorePayload, computeScoreHash } from './anti-cheat';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

const TABLE = 'leaderboard_entries';

let isAvailable: boolean | null = null;

function clientAvailable(): boolean {
  if (isAvailable !== null) return isAvailable;
  isAvailable = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  return isAvailable;
}

export async function fetchLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  if (!clientAvailable()) return getFallbackLeaderboard(period);

  let dateFilter = '';

  if (period === 'weekly') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    dateFilter = `&created_at=gte.$${weekAgo}`;
  } else if (period === 'daily') {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    dateFilter = `&created_at=gte.$${dayAgo}`;
  }

  const url = `$${SUPABASE_URL}/rest/v1/${TABLE}?select=*${dateFilter}&order=score.desc&limit=100`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer $${SUPABASE_ANON_KEY}`,
      },
    });

    if (!res.ok) {
      console.warn('Supabase fetch failed:', res.status);
      return getFallbackLeaderboard(period);
    }

    return await res.json();
  } catch (err) {
    console.warn('Supabase unavailable:', err);
    return getFallbackLeaderboard(period);
  }
}

export async function submitScore(alias: string, gameState: {
  characterName: string;
  cash: number;
  bank: number;
  peakNetWorth: number;
  totalProfit: number;
  totalTrips: number;
  totalBusts: number;
  reputation: number;
  survivalTime: number;
  countriesVisited: number;
}): Promise<SubmitResult> {
  const currentWealth = gameState.bank + gameState.cash;
  // Client-side validation
  const validation = validateScorePayload({
    alias,
    finalCash: gameState.cash,
    peakNetWorth: gameState.peakNetWorth,
    currentWealth,
    totalProfit: gameState.totalProfit,
    totalTrips: gameState.totalTrips,
    totalBusts: gameState.totalBusts,
    reputation: gameState.reputation,
    survivalTime: gameState.survivalTime,
    countriesVisited: gameState.countriesVisited,
  });

  if (!validation.valid) {
    return { success: false, rank: null, message: validation.errors.join(' ') };
  }

  const score = gameState.peakNetWorth;

  const scoreHash = await computeScoreHash({
    finalCash: gameState.cash,
    peakNetWorth: gameState.peakNetWorth,
    currentWealth,
    totalProfit: gameState.totalProfit,
    totalTrips: gameState.totalTrips,
    totalBusts: gameState.totalBusts,
    survivalTime: gameState.survivalTime,
    countriesVisited: gameState.countriesVisited,
  });

  const payload: ScorePayload = {
    alias: alias.trim(),
    characterName: gameState.characterName,
    finalCash: gameState.cash,
    peakNetWorth: gameState.peakNetWorth,
    currentWealth,
    totalProfit: gameState.totalProfit,
    totalTrips: gameState.totalTrips,
    totalBusts: gameState.totalBusts,
    reputation: gameState.reputation,
    survivalTime: gameState.survivalTime,
    countriesVisited: gameState.countriesVisited,
    scoreHash,
  };

  if (!clientAvailable()) {
    return fallbackSubmit(payload, score);
  }

  try {
    // Check for existing alias — prevent duplicates, only keep highest score
    const checkUrl = `$${SUPABASE_URL}/rest/v1/${TABLE}?alias=eq.${encodeURIComponent(payload.alias)}&order=score.desc&limit=1`;
    const checkRes = await fetch(checkUrl, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer $${SUPABASE_ANON_KEY}` },
    });
    if (checkRes.ok) {
      const existing: any[] = await checkRes.json();
      if (existing.length > 0 && existing[0].score >= score) {
        return { success: false, rank: null, message: `Alias already on leaderboard. Your current best is $${existing[0].score.toLocaleString()}. Beat that to update.` };
      }
    }

    const res = await fetch(`$${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer $${SUPABASE_ANON_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        alias: payload.alias,
        character_name: payload.characterName,
        final_cash: payload.finalCash,
        peak_net_worth: payload.peakNetWorth,
        current_wealth: payload.currentWealth,
        total_profit: payload.totalProfit,
        total_trips: payload.totalTrips,
        total_busts: payload.totalBusts,
        reputation: payload.reputation,
        survival_time: payload.survivalTime,
        countries_visited: payload.countriesVisited,
        score,
        score_hash: payload.scoreHash,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { success: false, rank: null, message: `Server rejected submission ($${res.status}).` };
    }

    // Get rank by counting entries with higher scores
    const rank = await getScoreRank(score, payload.scoreHash);
    return { success: true, rank, message: `Score submitted! Rank #$${rank ?? '?'}` };
  } catch (err) {
    console.warn('Score submission failed:', err);
    return fallbackSubmit(payload, score);
  }
}

async function getScoreRank(score: number, hash: string): Promise<number | null> {
  try {
    const url = `$${SUPABASE_URL}/rest/v1/${TABLE}?select=id&score=gt.${score}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer $${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return null;
    const ahead: unknown[] = await res.json();
    return ahead.length + 1;
  } catch {
    return null;
  }
}

// Fallback: store scores in localStorage when Supabase is unavailable
const FALLBACK_KEY = 'angelo_local_scores';

function getFallbackScores(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFallbackScores(scores: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(scores));
  } catch {}
}

function fallbackSubmit(payload: ScorePayload, score: number): SubmitResult {
  const scores = getFallbackScores();
  const entry: LeaderboardEntry = {
    id: `local_$${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    alias: payload.alias,
    character_name: payload.characterName,
    final_cash: payload.finalCash,
    peak_net_worth: payload.peakNetWorth,
    current_wealth: payload.currentWealth,
    total_profit: payload.totalProfit,
    total_trips: payload.totalTrips,
    total_busts: payload.totalBusts,
    reputation: payload.reputation,
    survival_time: payload.survivalTime,
    countries_visited: payload.countriesVisited,
    score,
    created_at: new Date().toISOString(),
  };
  scores.push(entry);
  saveFallbackScores(scores);

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const rank = sorted.findIndex((s) => s.id === entry.id) + 1;

  return { success: true, rank, message: `Score saved locally! Rank #$${rank}` };
}

function getFallbackLeaderboard(period: LeaderboardPeriod): LeaderboardEntry[] {
  const scores = getFallbackScores();
  const now = Date.now();

  const filtered = scores.filter((s) => {
    if (period === 'all_time') return true;
    const created = new Date(s.created_at).getTime();
    if (period === 'weekly') return now - created < 7 * 24 * 60 * 60 * 1000;
    if (period === 'daily') return now - created < 24 * 60 * 60 * 1000;
    return true;
  });

  return filtered.sort((a, b) => b.score - a.score).slice(0, 100);
}
