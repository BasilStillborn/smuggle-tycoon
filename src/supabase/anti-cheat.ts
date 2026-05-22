const HASH_SALT = 'smuggle-tycoon-v1-checksum';

// Max reasonable values
const MAX_TURNS = 100000;
const MAX_CASH = 1_000_000_000;
const MAX_PROFIT_PER_TURN = 500_000;
const MAX_COUNTRIES = 7;
const MAX_REPUTATION = 100;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export async function computeScoreHash(payload: {
  finalCash: number;
  peakNetWorth: number;
  currentWealth: number;
  totalProfit: number;
  totalTrips: number;
  totalBusts: number;
  survivalTime: number;
  countriesVisited: number;
}): Promise<string> {
  const str = [
    HASH_SALT,
    payload.finalCash,
    payload.peakNetWorth,
    payload.currentWealth,
    payload.totalProfit,
    payload.totalTrips,
    payload.totalBusts,
    payload.survivalTime,
    payload.countriesVisited,
  ].join('');

  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function validateScorePayload(payload: {
  alias: string;
  finalCash: number;
  peakNetWorth: number;
  currentWealth: number;
  totalProfit: number;
  totalTrips: number;
  totalBusts: number;
  reputation: number;
  survivalTime: number;
  countriesVisited: number;
}): ValidationResult {
  const errors: string[] = [];

  // Alias validation
  const alias = payload.alias.trim();
  if (alias.length === 0 || alias.length > 15) {
    errors.push('Alias must be 1-15 characters.');
  }

  // Numeric field validation
  if (!Number.isFinite(payload.finalCash) || payload.finalCash < 0) {
    errors.push('Invalid final cash.');
  }
  if (!Number.isFinite(payload.peakNetWorth) || payload.peakNetWorth < 0) {
    errors.push('Invalid peak net worth.');
  }
  if (!Number.isFinite(payload.totalProfit)) {
    errors.push('Invalid total profit.');
  }
  if (!Number.isInteger(payload.totalTrips) || payload.totalTrips < 0) {
    errors.push('Invalid total trips.');
  }
  if (!Number.isInteger(payload.totalBusts) || payload.totalBusts < 0) {
    errors.push('Invalid total busts.');
  }
  if (!Number.isInteger(payload.reputation) || payload.reputation < 0 || payload.reputation > MAX_REPUTATION) {
    errors.push('Invalid reputation.');
  }
  if (!Number.isInteger(payload.survivalTime) || payload.survivalTime < 0) {
    errors.push('Invalid survival time.');
  }
  if (!Number.isInteger(payload.countriesVisited) || payload.countriesVisited < 1 || payload.countriesVisited > MAX_COUNTRIES) {
    errors.push('Invalid countries visited.');
  }

  // Sanity checks
  if (payload.finalCash > MAX_CASH) {
    errors.push(`Final cash exceeds maximum allowed ($${MAX_CASH.toLocaleString()}).`);
  }
  if (payload.peakNetWorth > MAX_CASH * 2) {
    errors.push('Peak net worth exceeds maximum allowed.');
  }
  if (payload.currentWealth > MAX_CASH) {
    errors.push('Current wealth exceeds maximum allowed.');
  }
  if (payload.totalProfit > MAX_CASH * 2) {
    errors.push('Total profit exceeds maximum allowed.');
  }
  if (payload.survivalTime > MAX_TURNS) {
    errors.push('Survival time exceeds maximum.');
  }

  // Consistency checks
  if (payload.peakNetWorth < payload.finalCash) {
    errors.push('Peak net worth cannot be less than final cash.');
  }
  if (payload.totalBusts > payload.totalTrips) {
    errors.push('Busts cannot exceed trips.');
  }
  if (payload.totalTrips > payload.survivalTime) {
    errors.push('Trips cannot exceed turns survived.');
  }

  // Profit sanity: total profit shouldn't wildly exceed what turns — max profit per turn allows
  const maxReasonableProfit = Math.max(payload.survivalTime, 1) * MAX_PROFIT_PER_TURN;
  if (payload.totalProfit > maxReasonableProfit) {
    errors.push('Total profit is unreasonably high for survival time.');
  }

  return { valid: errors.length === 0, errors };
}
