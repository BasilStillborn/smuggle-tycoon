export interface LeaderboardEntry {
  id: string;
  alias: string;
  character_name: string;
  final_cash: number;
  peak_net_worth: number;
  current_wealth: number;
  total_profit: number;
  total_trips: number;
  total_busts: number;
  reputation: number;
  survival_time: number;
  countries_visited: number;
  score: number;
  created_at: string;
}

export interface ScorePayload {
  alias: string;
  characterName: string;
  finalCash: number;
  peakNetWorth: number;
  currentWealth: number;
  totalProfit: number;
  totalTrips: number;
  totalBusts: number;
  reputation: number;
  survivalTime: number;
  countriesVisited: number;
  scoreHash: string;
}

export interface SubmitResult {
  success: boolean;
  rank: number | null;
  message: string;
}

export type LeaderboardPeriod = 'all_time' | 'weekly' | 'daily';
