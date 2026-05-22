interface SafehouseLevel {
  level: number;
  name: string;
  description: string;
  minNetWorth: number;
  color: string;
}

const SAFEHOUSE_LEVELS: SafehouseLevel[] = [
  { level: 1, name: 'Parents Basement', description: "your mum does your washing, your stepdad gives you a hard time.. but its free", minNetWorth: 0, color: 'text-gray-600' },
  { level: 2, name: '1 bed Flat', description: "A modest flat. Front door key included. Landlord asks no questions. $10,000 net worth unlocks.", minNetWorth: 10000, color: 'text-gray-400' },
  { level: 3, name: 'Secure Apartment', description: 'Reinforced door. Bulletproof glass. Discreet.', minNetWorth: 25000, color: 'text-blue-400' },
  { level: 4, name: 'Private Villa', description: 'Gated compound. Underground garage. Staff quarters.', minNetWorth: 100000, color: 'text-purple-400' },
  { level: 5, name: 'Corporate Safehouse', description: 'Full security detail. Off-grid systems. Your own airstrip.', minNetWorth: 500000, color: 'text-retro-accent' },
];

export function getSafehouseLevel(netWorth: number): SafehouseLevel {
  let current = SAFEHOUSE_LEVELS[0];
  for (const level of SAFEHOUSE_LEVELS) {
    if (netWorth >= level.minNetWorth) {
      current = level;
    }
  }
  return current;
}

export function getSafehouseProgress(netWorth: number): { current: SafehouseLevel; next: SafehouseLevel | null; progress: number } {
  const current = getSafehouseLevel(netWorth);
  const idx = SAFEHOUSE_LEVELS.indexOf(current);
  const next = idx < SAFEHOUSE_LEVELS.length - 1 ? SAFEHOUSE_LEVELS[idx + 1] : null;

  let progress = 1;
  if (next) {
    const range = next.minNetWorth - current.minNetWorth;
    const earned = netWorth - current.minNetWorth;
    progress = Math.min(1, Math.max(0, earned / range));
  }

  return { current, next, progress };
}

export { SAFEHOUSE_LEVELS };
