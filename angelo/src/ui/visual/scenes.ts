export type WealthTier = 'destitute' | 'struggling' | 'comfortable' | 'wealthy' | 'rich' | 'elite';
export type FameTier = 'unknown' | 'known' | 'notable' | 'famous' | 'legendary';

export interface Scene {
  name: string;
  bgClass: string;
  overlayClass: string;
}

export function getWealthTier(netWorth: number): WealthTier {
  if (netWorth < 1000) return 'destitute';
  if (netWorth < 5000) return 'struggling';
  if (netWorth < 25000) return 'comfortable';
  if (netWorth < 100000) return 'wealthy';
  if (netWorth < 500000) return 'rich';
  return 'elite';
}

export function getFameTier(reputation: number): FameTier {
  if (reputation < 15) return 'unknown';
  if (reputation < 35) return 'known';
  if (reputation < 60) return 'notable';
  if (reputation < 85) return 'famous';
  return 'legendary';
}

const SCENES: Record<WealthTier, Record<FameTier, Scene>> = {
  destitute: {
    unknown: {
      name: 'Alleyway Flophouse',
      bgClass: 'bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#111111]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(40,20,10,0.3),transparent_70%)]',
    },
    known: {
      name: 'Rundown Warehouse',
      bgClass: 'bg-gradient-to-br from-[#0a0808] via-[#0d0a0a] to-[#120e0e]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(60,20,10,0.3),transparent_70%)]',
    },
    notable: {
      name: 'Cheap Motel Room',
      bgClass: 'bg-gradient-to-br from-[#0a0808] via-[#0f0b0a] to-[#141010]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(80,20,10,0.3),transparent_70%)]',
    },
    famous: {
      name: 'Backstreet Safehouse',
      bgClass: 'bg-gradient-to-br from-[#0a0808] via-[#110c0a] to-[#161212]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(100,20,10,0.3),transparent_70%)]',
    },
    legendary: {
      name: 'Underground Bunker',
      bgClass: 'bg-gradient-to-br from-[#0a0808] via-[#130d0a] to-[#181414]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(120,20,10,0.3),transparent_70%)]',
    },
  },
  struggling: {
    unknown: {
      name: 'Budget Hostel',
      bgClass: 'bg-gradient-to-br from-[#0d0d0d] via-[#121210] to-[#181818]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(30,30,20,0.3),transparent_70%)]',
    },
    known: {
      name: 'Shared Apartment',
      bgClass: 'bg-gradient-to-br from-[#0d0d0c] via-[#141312] to-[#1a1a19]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(50,40,20,0.3),transparent_70%)]',
    },
    notable: {
      name: 'Small Studio',
      bgClass: 'bg-gradient-to-br from-[#0d0d0c] via-[#161413] to-[#1c1c1a]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(70,50,20,0.3),transparent_70%)]',
    },
    famous: {
      name: 'Modest Flat',
      bgClass: 'bg-gradient-to-br from-[#0d0d0b] via-[#181513] to-[#1e1e1b]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(90,60,20,0.3),transparent_70%)]',
    },
    legendary: {
      name: 'Hidden Loft',
      bgClass: 'bg-gradient-to-br from-[#0d0d0b] via-[#1a1613] to-[#20201d]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(110,70,20,0.3),transparent_70%)]',
    },
  },
  comfortable: {
    unknown: {
      name: 'Decent Apartment',
      bgClass: 'bg-gradient-to-br from-[#111111] via-[#181818] to-[#202020]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(40,40,40,0.2),transparent_70%)]',
    },
    known: {
      name: 'City Condo',
      bgClass: 'bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#222222]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(60,50,40,0.2),transparent_70%)]',
    },
    notable: {
      name: 'Suburban House',
      bgClass: 'bg-gradient-to-br from-[#131313] via-[#1c1c1b] to-[#242423]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(80,60,40,0.2),transparent_70%)]',
    },
    famous: {
      name: 'Secure Residence',
      bgClass: 'bg-gradient-to-br from-[#141414] via-[#1e1e1c] to-[#262625]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(100,70,40,0.2),transparent_70%)]',
    },
    legendary: {
      name: 'Gated Villa',
      bgClass: 'bg-gradient-to-br from-[#151514] via-[#20201e] to-[#282827]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(120,80,40,0.2),transparent_70%)]',
    },
  },
  wealthy: {
    unknown: {
      name: 'High-Rise Suite',
      bgClass: 'bg-gradient-to-br from-[#151515] via-[#202020] to-[#2a2a2a]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(60,60,80,0.25),transparent_70%)]',
    },
    known: {
      name: 'Penthouse View',
      bgClass: 'bg-gradient-to-br from-[#161616] via-[#222222] to-[#2c2c2c]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(80,70,90,0.25),transparent_70%)]',
    },
    notable: {
      name: 'Executive Loft',
      bgClass: 'bg-gradient-to-br from-[#171717] via-[#242424] to-[#2e2e2e]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(100,80,100,0.25),transparent_70%)]',
    },
    famous: {
      name: 'Luxury Condo',
      bgClass: 'bg-gradient-to-br from-[#181818] via-[#262626] to-[#303030]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(120,90,110,0.25),transparent_70%)]',
    },
    legendary: {
      name: 'Private Estate',
      bgClass: 'bg-gradient-to-br from-[#191919] via-[#282828] to-[#323232]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(140,100,120,0.25),transparent_70%)]',
    },
  },
  rich: {
    unknown: {
      name: 'Waterfront Villa',
      bgClass: 'bg-gradient-to-br from-[#1a1a1a] via-[#282828] to-[#353535]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(80,80,120,0.3),transparent_70%)]',
    },
    known: {
      name: 'Marina Residence',
      bgClass: 'bg-gradient-to-br from-[#1b1b1b] via-[#2a2a2a] to-[#373737]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(100,90,130,0.3),transparent_70%)]',
    },
    notable: {
      name: 'Hilltop Mansion',
      bgClass: 'bg-gradient-to-br from-[#1c1c1c] via-[#2c2c2c] to-[#393939]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(120,100,140,0.3),transparent_70%)]',
    },
    famous: {
      name: 'Private Island',
      bgClass: 'bg-gradient-to-br from-[#1d1d1d] via-[#2e2e2e] to-[#3b3b3b]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(140,110,150,0.3),transparent_70%)]',
    },
    legendary: {
      name: 'Compound',
      bgClass: 'bg-gradient-to-br from-[#1e1e1e] via-[#303030] to-[#3d3d3d]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(160,120,160,0.3),transparent_70%)]',
    },
  },
  elite: {
    unknown: {
      name: 'Private Jet Lounge',
      bgClass: 'bg-gradient-to-br from-[#202020] via-[#303030] to-[#404040]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(100,100,160,0.35),transparent_70%)]',
    },
    known: {
      name: 'Global Suite',
      bgClass: 'bg-gradient-to-br from-[#212121] via-[#323232] to-[#424242]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(120,110,170,0.35),transparent_70%)]',
    },
    notable: {
      name: 'Sky Penthouse',
      bgClass: 'bg-gradient-to-br from-[#222222] via-[#343434] to-[#444444]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(140,120,180,0.35),transparent_70%)]',
    },
    famous: {
      name: 'International Estate',
      bgClass: 'bg-gradient-to-br from-[#232323] via-[#363636] to-[#464646]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(160,130,190,0.35),transparent_70%)]',
    },
    legendary: {
      name: 'Corporate Citadel',
      bgClass: 'bg-gradient-to-br from-[#242424] via-[#383838] to-[#484848]',
      overlayClass: 'before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(180,140,200,0.35),transparent_70%)]',
    },
  },
};

export function getScene(wealth: WealthTier, fame: FameTier): Scene {
  return SCENES[wealth][fame];
}
