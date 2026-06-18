import type { ElementCategory, MatterState } from './elements';

export type PhysicalSample = {
  id: string;
  label: string;
  kind: 'element' | 'compound' | 'alloy' | 'mixture';
  meltingPointK?: number;
  boilingPointK?: number;
  roomState: MatterState | 'compound-solid' | 'compound-liquid' | 'compound-gas';
  category?: ElementCategory;
  note: string;
};

export const elementPhysicalData: Record<string, Partial<PhysicalSample>> = {
  H: { meltingPointK: 13.99, boilingPointK: 20.27, note: 'Hydrogen stays a fast, light gas except at extremely cold temperatures.' },
  He: { meltingPointK: 0.95, boilingPointK: 4.22, note: 'Helium remains gaseous until almost absolute zero.' },
  Li: { meltingPointK: 453.65, boilingPointK: 1603, note: 'Lithium softens and melts at relatively low heat for a metal.' },
  C: { meltingPointK: 3915, boilingPointK: 4300, note: 'Carbon holds its solid form through ordinary chamber temperatures.' },
  N: { meltingPointK: 63.15, boilingPointK: 77.36, note: 'Nitrogen becomes liquid only in deep cold.' },
  O: { meltingPointK: 54.36, boilingPointK: 90.19, note: 'Oxygen becomes a pale blue liquid in extreme cold.' },
  Ne: { meltingPointK: 24.56, boilingPointK: 27.07, note: 'Neon needs cryogenic cold before it condenses.' },
  Na: { meltingPointK: 370.87, boilingPointK: 1156, note: 'Sodium melts just above the boiling point of water.' },
  Mg: { meltingPointK: 923, boilingPointK: 1363, note: 'Magnesium glows intensely before it reaches its melting point here.' },
  Al: { meltingPointK: 933.47, boilingPointK: 2792, note: 'Aluminium forms a protective oxide skin as it warms.' },
  Si: { meltingPointK: 1687, boilingPointK: 3538, note: 'Silicon remains solid in this chamber range.' },
  S: { meltingPointK: 388.36, boilingPointK: 717.8, note: 'Sulfur melts into a golden liquid and later gives vapour.' },
  Cl: { meltingPointK: 171.6, boilingPointK: 239.11, note: 'Chlorine is a gas at room temperature but condenses when chilled.' },
  K: { meltingPointK: 336.53, boilingPointK: 1032, note: 'Potassium melts in a warm chamber and reacts eagerly.' },
  Ca: { meltingPointK: 1115, boilingPointK: 1757, note: 'Calcium stays solid across ordinary experiments.' },
  Fe: { meltingPointK: 1811, boilingPointK: 3134, note: 'Iron stays solid here, but it can glow as heat rises.' },
  Cu: { meltingPointK: 1357.77, boilingPointK: 2835, note: 'Copper stays solid in this range and oxidises at the surface.' },
  Zn: { meltingPointK: 692.68, boilingPointK: 1180, note: 'Zinc can melt in the hotter part of this chamber.' },
  Br: { meltingPointK: 265.8, boilingPointK: 332, note: 'Bromine is liquid near room temperature and fumes as it warms.' },
  Ag: { meltingPointK: 1234.93, boilingPointK: 2435, note: 'Silver remains solid and reflective in this chamber.' },
  I: { meltingPointK: 386.85, boilingPointK: 457.4, note: 'Iodine sublimes easily, making purple vapour.' },
  Au: { meltingPointK: 1337.33, boilingPointK: 3129, note: 'Gold remains solid and unreactive in most experiments.' },
  Hg: { meltingPointK: 234.32, boilingPointK: 629.88, note: 'Mercury is liquid at room temperature and vapourises when hot.' },
  Pb: { meltingPointK: 600.61, boilingPointK: 2022, note: 'Lead melts at a comparatively low metal temperature.' },
};

export const compoundPhysicalData: Record<string, PhysicalSample> = {
  H2O: {
    id: 'H2O',
    label: 'Water',
    kind: 'compound',
    meltingPointK: 273.15,
    boilingPointK: 373.15,
    roomState: 'compound-liquid',
    note: 'Water visibly freezes, melts, boils, and condenses in the chamber.',
  },
  NaCl: {
    id: 'NaCl',
    label: 'Sodium chloride',
    kind: 'compound',
    meltingPointK: 1074,
    boilingPointK: 1738,
    roomState: 'compound-solid',
    note: 'Salt forms strong crystals and stays solid in this chamber range.',
  },
  CO2: {
    id: 'CO2',
    label: 'Carbon dioxide',
    kind: 'compound',
    meltingPointK: 216.6,
    boilingPointK: 194.7,
    roomState: 'compound-gas',
    note: 'Carbon dioxide can behave like dry ice at low temperature and low pressure.',
  },
  Fe2O3: { id: 'Fe2O3', label: 'Iron oxide', kind: 'compound', meltingPointK: 1838, roomState: 'compound-solid', note: 'Rust is a solid oxide that blooms across iron surfaces.' },
  MgO: { id: 'MgO', label: 'Magnesium oxide', kind: 'compound', meltingPointK: 3125, roomState: 'compound-solid', note: 'Magnesium oxide forms as a bright white solid ash.' },
  CuO: { id: 'CuO', label: 'Copper oxide', kind: 'compound', meltingPointK: 1599, roomState: 'compound-solid', note: 'Copper oxide darkens the surface like a mineral skin.' },
  SiO2: { id: 'SiO2', label: 'Silica', kind: 'compound', meltingPointK: 1986, roomState: 'compound-solid', note: 'Silica is the tough network found in quartz and glass.' },
  CaO: { id: 'CaO', label: 'Calcium oxide', kind: 'compound', meltingPointK: 2845, roomState: 'compound-solid', note: 'Calcium oxide stays as a hot, pale solid.' },
  CaCl2: { id: 'CaCl2', label: 'Calcium chloride', kind: 'compound', meltingPointK: 1045, roomState: 'compound-solid', note: 'Calcium chloride forms a stable ionic solid.' },
  KCl: { id: 'KCl', label: 'Potassium chloride', kind: 'compound', meltingPointK: 1043, roomState: 'compound-solid', note: 'Potassium chloride forms bright ionic crystals.' },
  NO: { id: 'NO', label: 'Nitric oxide', kind: 'compound', meltingPointK: 109.5, boilingPointK: 121.4, roomState: 'compound-gas', note: 'Nitric oxide stays gaseous in ordinary chamber conditions.' },
  NO2: { id: 'NO2', label: 'Nitrogen dioxide', kind: 'compound', meltingPointK: 261.9, boilingPointK: 294.3, roomState: 'compound-gas', note: 'Nitrogen dioxide becomes a reddish-brown gas as it warms.' },
  'Steel alloy': { id: 'Steel alloy', label: 'Steel alloy', kind: 'alloy', meltingPointK: 1700, roomState: 'compound-solid', note: 'Steel is a tough solid alloy of iron and carbon.' },
  'Brass alloy': { id: 'Brass alloy', label: 'Brass alloy', kind: 'alloy', meltingPointK: 1180, roomState: 'compound-solid', note: 'Brass is a golden alloy that softens into a molten blend at high heat.' },
  'Organic molecule family': { id: 'Organic molecule family', label: 'Organic molecule family', kind: 'mixture', roomState: 'compound-liquid', note: 'Organic compounds can boil, burn, or rearrange depending on structure.' },
};
