export interface SafehouseLevel {
  level: number;
  name: string;
  description: string;
  advanceAt: number;
  demoteAt: number;
  color: string;
}

export const SAFEHOUSE_LEVELS: SafehouseLevel[] = [
  { level: 1, name: 'Parents Basement', description: "your mum does your washing, your stepdad gives you a hard time.. but its free", advanceAt: 0, demoteAt: 0, color: 'text-gray-600' },
  { level: 2, name: '1 bed Flat', description: "A modest flat. Front door key included. Landlord asks no questions.", advanceAt: 20000, demoteAt: 5000, color: 'text-gray-400' },
  { level: 3, name: 'Secure Apartment', description: 'Reinforced door. Bulletproof glass. Discreet.', advanceAt: 50000, demoteAt: 25000, color: 'text-blue-400' },
  { level: 4, name: 'Private Villa', description: 'Gated compound. Underground garage. Staff quarters.', advanceAt: 150000, demoteAt: 75000, color: 'text-purple-400' },
  { level: 5, name: 'Corporate Safehouse', description: 'Full security detail. Off-grid systems. Your own airstrip.', advanceAt: 500000, demoteAt: 250000, color: 'text-retro-accent' },
];

export const SAFEHOUSE_ADVANCE_TITLES: Record<number, string> = {
  2: 'Moving On Up',
  3: 'Going Legit',
  4: 'The Big League',
  5: 'King of London',
};

export const SAFEHOUSE_ADVANCE_MSGS: Record<number, string> = {
  2: `Angelo's got 20 grand in the bank now, the cheeky little cunt. He's actually fucking making some money. He's rented a flat down the road — it's not much but it means he can have birds round now and his noncy stepdad will get off his back.`,
  3: `Fifty thousand dollars. Angelo's not fucking around anymore. He's moved into a secure apartment — reinforced doors, bulletproof glass, the works. His neighbours don't know his name and he likes it that way. The little prick is actually building something here.`,
  4: `One hundred and fifty grand. Angelo's in a villa now — gated compound, underground garage, staff quarters. His old mates from the estate wouldn't believe it. The cunt's got a swimming pool and a security detail. He's gone proper big time.`,
  5: `Half a million fucking dollars. Corporate safehouse. His own airstrip. Full security outfit. Angelo doesn't answer to anyone anymore — people answer to him. The skinny little shit from the basement is now the most dangerous man in North London. And he knows it.`,
};

export const SAFEHOUSE_DEMOTE_TITLES: Record<number, string> = {
  1: 'Back to the Basement',
  2: 'Downgraded',
  3: 'Falling Down',
  4: 'Empire Crumbling',
};

export const SAFEHOUSE_DEMOTE_MSGS: Record<number, string> = {
  1: `Angelo's broke again. Less than five grand. The flat's gone — the Jewish landlord changed the locks and kept the deposit, the thieving bastard. He's back in his parents' basement, washing machine rattling through the wall, his stepdad giving him that look. What a fucking embarrassment.`,
  2: `Angelo's slipped below twenty-five K. The security deposit on the apartment vanished. He's back in a one-bed flat — still got his own front door key, but that reinforced door? That belongs to someone else now. The cunt's going backwards. Time to wake the fuck up.`,
  3: `Less than seventy-five grand. The villa's gone. Staff let go. Gate code changed. Angelo's back in an apartment — it's discreet, it's professional. But it's not the fucking villa, is it. He can see where he was from where he is now. That stings, you little spastic.`,
  4: `Below two hundred and fifty thousand. The airstrip's been repossessed. Security detail disbanded. Corporate safehouse is someone else's problem now. Angelo's back in a villa — still nice, still gated. But he had an EMPIRE. He had it right in his hands. And he let it slip through his stupid fucking fingers.`,
};

export function getSafehouseLevel(netWorth: number): SafehouseLevel {
  let current = SAFEHOUSE_LEVELS[0];
  for (const level of SAFEHOUSE_LEVELS) {
    if (netWorth >= level.advanceAt) {
      current = level;
    }
  }
  return current;
}

export function getSafehouseTier(netWorth: number, currentTier: number): number {
  // Check advancement — only advance one tier at a time
  let tier = currentTier;
  for (let t = currentTier + 1; t <= 5; t++) {
    if (netWorth >= SAFEHOUSE_LEVELS[t - 1].advanceAt) {
      tier = t;
    }
  }
  // Check demotion
  while (tier > 1 && netWorth < SAFEHOUSE_LEVELS[tier - 1].demoteAt) {
    tier--;
  }
  return tier;
}

export function getSafehouseProgress(netWorth: number, currentTier: number): { current: SafehouseLevel; next: SafehouseLevel | null; progress: number } {
  // Display based on current stateful tier
  const idx = currentTier - 1;
  const current = SAFEHOUSE_LEVELS[idx] ?? SAFEHOUSE_LEVELS[0];
  const next = idx < SAFEHOUSE_LEVELS.length - 1 ? SAFEHOUSE_LEVELS[idx + 1] : null;

  let progress = 1;
  if (next) {
    const range = next.advanceAt - current.advanceAt;
    const earned = netWorth - current.advanceAt;
    progress = Math.min(1, Math.max(0, earned / range));
  }

  return { current, next, progress };
}
