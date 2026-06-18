import type { Element } from './elements';

export type ReactionAnimation = 'spark' | 'flame' | 'bubble' | 'smoke' | 'glow' | 'crystal' | 'calm' | 'storm';

export type ReactionType =
  | 'inert'
  | 'combustion'
  | 'oxidation'
  | 'salt-formation'
  | 'alloy'
  | 'gas-release'
  | 'crystallisation'
  | 'energetic'
  | 'synthesis'
  | 'exploration';

export type Environment = {
  temperature: number;
  pressureAtm: number;
};

export type ReactionResult = {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  safetyNote?: string;
  products: string[];
  reactionType: ReactionType;
  intensity: number;
  animation: ReactionAnimation;
  palette: string[];
  prompt: string;
};

export type ReactionRule = {
  id: string;
  symbols: string[];
  minTemperature?: number;
  minAirDensity?: number;
  result: Omit<ReactionResult, 'id' | 'intensity'> & { baseIntensity: number };
};

export const curatedReactions: ReactionRule[] = [
  {
    id: 'hydrogen-oxygen-water',
    symbols: ['H', 'O'],
    minTemperature: 360,
    result: {
      title: 'Water flash',
      summary: 'Hydrogen and oxygen combine into water vapour when enough energy starts the reaction.',
      explanation: 'Hydrogen is a fuel and oxygen helps fuels burn. With a spark or strong heat, they rearrange into H2O and release energy as heat and light.',
      safetyNote: 'Real hydrogen and oxygen mixtures can explode. This chamber keeps the lesson safely virtual.',
      products: ['H2O'],
      reactionType: 'combustion',
      baseIntensity: 92,
      animation: 'storm',
      palette: ['#67e8f9', '#facc15', '#fb7185'],
      prompt: 'Lower the temperature and see how the reaction waits for activation energy.',
    },
  },
  {
    id: 'sodium-chlorine-salt',
    symbols: ['Na', 'Cl'],
    result: {
      title: 'Table salt crystals',
      summary: 'Sodium and chlorine form sodium chloride: ordinary table salt.',
      explanation: 'Sodium wants to give away one electron while chlorine wants to gain one. The charged particles lock into a repeating crystal lattice.',
      safetyNote: 'Real sodium metal and chlorine gas are hazardous before they become salt.',
      products: ['NaCl'],
      reactionType: 'salt-formation',
      baseIntensity: 72,
      animation: 'crystal',
      palette: ['#38bdf8', '#f8fafc', '#a7f3d0'],
      prompt: 'Try potassium with chlorine to compare another alkali-metal salt.',
    },
  },
  {
    id: 'potassium-chlorine-salt',
    symbols: ['K', 'Cl'],
    result: {
      title: 'Violet salt maker',
      summary: 'Potassium and chlorine can form potassium chloride, another ionic salt.',
      explanation: 'Potassium is even more reactive than sodium. Chlorine accepts an electron, and the ions arrange into a stable solid.',
      safetyNote: 'Real potassium is violently reactive and should only be handled by trained professionals.',
      products: ['KCl'],
      reactionType: 'salt-formation',
      baseIntensity: 84,
      animation: 'crystal',
      palette: ['#c084fc', '#f8fafc', '#86efac'],
      prompt: 'Add oxygen-rich air and notice how reactive metals invite side reactions.',
    },
  },
  {
    id: 'iron-oxygen-rust',
    symbols: ['Fe', 'O'],
    minAirDensity: 35,
    result: {
      title: 'Rust bloom',
      summary: 'Iron reacts with oxygen to form iron oxide: rust.',
      explanation: 'Oxygen pulls electrons from iron atoms. Over time the surface changes into reddish-brown iron oxide.',
      products: ['Fe2O3'],
      reactionType: 'oxidation',
      baseIntensity: 48,
      animation: 'smoke',
      palette: ['#fb923c', '#7c2d12', '#fed7aa'],
      prompt: 'Raise air density to make oxidation feel faster and more dramatic.',
    },
  },
  {
    id: 'magnesium-oxygen-flare',
    symbols: ['Mg', 'O'],
    minTemperature: 450,
    minAirDensity: 25,
    result: {
      title: 'White flare',
      summary: 'Magnesium burns in oxygen with a brilliant white light.',
      explanation: 'Magnesium gives electrons to oxygen, forming magnesium oxide. The energy release is intense enough to glow dazzling white.',
      safetyNote: 'Never stare at or handle burning magnesium in real life.',
      products: ['MgO'],
      reactionType: 'combustion',
      baseIntensity: 90,
      animation: 'flame',
      palette: ['#ffffff', '#fde68a', '#38bdf8'],
      prompt: 'Compare with copper plus oxygen for a gentler oxidation story.',
    },
  },
  {
    id: 'carbon-oxygen-carbon-dioxide',
    symbols: ['C', 'O'],
    minTemperature: 420,
    minAirDensity: 25,
    result: {
      title: 'Carbon dioxide plume',
      summary: 'Carbon burns in oxygen to form carbon dioxide gas.',
      explanation: 'Carbon atoms bond with oxygen atoms. The result is CO2, the same gas made by fires, engines, and breathing animals.',
      products: ['CO2'],
      reactionType: 'combustion',
      baseIntensity: 70,
      animation: 'smoke',
      palette: ['#f97316', '#64748b', '#facc15'],
      prompt: 'Reduce air density to see how limited oxygen softens combustion.',
    },
  },
  {
    id: 'copper-oxygen-patina',
    symbols: ['Cu', 'O'],
    minAirDensity: 35,
    result: {
      title: 'Copper darkens',
      summary: 'Copper reacts with oxygen to make copper oxide on its surface.',
      explanation: 'Copper oxidises more calmly than magnesium. The surface can darken, and in real outdoor settings copper compounds can become green-blue patina.',
      products: ['CuO'],
      reactionType: 'oxidation',
      baseIntensity: 38,
      animation: 'glow',
      palette: ['#14b8a6', '#fb923c', '#0f766e'],
      prompt: 'Try iron with oxygen to compare a familiar rusting process.',
    },
  },
  {
    id: 'nitrogen-oxygen-lightning',
    symbols: ['N', 'O'],
    minTemperature: 760,
    result: {
      title: 'Lightning-air chemistry',
      summary: 'At very high temperature, nitrogen and oxygen can form nitrogen oxides.',
      explanation: 'Nitrogen gas is usually stubborn, but extreme heat can break its strong bond. That lets nitrogen and oxygen combine, like in lightning or engines.',
      products: ['NO', 'NO2'],
      reactionType: 'synthesis',
      baseIntensity: 76,
      animation: 'spark',
      palette: ['#60a5fa', '#facc15', '#fb7185'],
      prompt: 'Lower the heat to see why ordinary air is mostly stable.',
    },
  },
  {
    id: 'iron-carbon-steel',
    symbols: ['Fe', 'C'],
    minTemperature: 620,
    result: {
      title: 'Steel idea',
      summary: 'Iron mixed with a little carbon can become steel.',
      explanation: 'This is more of a material transformation than a simple molecule. Carbon atoms change how iron crystals slide, making the metal stronger and more useful.',
      products: ['Steel alloy'],
      reactionType: 'alloy',
      baseIntensity: 58,
      animation: 'glow',
      palette: ['#94a3b8', '#f97316', '#111827'],
      prompt: 'Try copper and zinc to discover brass.',
    },
  },
  {
    id: 'copper-zinc-brass',
    symbols: ['Cu', 'Zn'],
    minTemperature: 520,
    result: {
      title: 'Brass blend',
      summary: 'Copper and zinc can form brass, a golden-looking alloy.',
      explanation: 'Alloys are mixtures of metals. Zinc atoms fit among copper atoms, changing colour, hardness, and sound.',
      products: ['Brass alloy'],
      reactionType: 'alloy',
      baseIntensity: 52,
      animation: 'glow',
      palette: ['#f59e0b', '#fef3c7', '#fb923c'],
      prompt: 'Raise the temperature and watch the metal-mixing glow strengthen.',
    },
  },
  {
    id: 'silicon-oxygen-silica',
    symbols: ['Si', 'O'],
    minTemperature: 500,
    result: {
      title: 'Glass backbone',
      summary: 'Silicon and oxygen form silica, the backbone of quartz and glass.',
      explanation: 'Silicon bonds strongly with oxygen in repeating networks. These networks are why sand, quartz, and glass are so important.',
      products: ['SiO2'],
      reactionType: 'crystallisation',
      baseIntensity: 55,
      animation: 'crystal',
      palette: ['#bae6fd', '#f8fafc', '#93c5fd'],
      prompt: 'Try aluminium and oxygen for another common mineral-building oxide.',
    },
  },
  {
    id: 'aluminium-oxygen-oxide',
    symbols: ['Al', 'O'],
    minAirDensity: 30,
    result: {
      title: 'Protective armour',
      summary: 'Aluminium quickly forms a thin aluminium oxide coating.',
      explanation: 'The oxide layer clings tightly to aluminium and protects the metal underneath. That is why aluminium can look shiny without rusting away like iron.',
      products: ['Al2O3'],
      reactionType: 'oxidation',
      baseIntensity: 42,
      animation: 'glow',
      palette: ['#e5e7eb', '#93c5fd', '#f8fafc'],
      prompt: 'Try magnesium and oxygen at high heat to see a much brighter oxide reaction.',
    },
  },
  {
    id: 'calcium-oxygen-lime',
    symbols: ['Ca', 'O'],
    minTemperature: 430,
    result: {
      title: 'Lime glow',
      summary: 'Calcium reacts with oxygen to form calcium oxide, also called quicklime.',
      explanation: 'Calcium is a reactive metal. When it bonds with oxygen, the product is a useful compound found in cement and industrial chemistry.',
      products: ['CaO'],
      reactionType: 'oxidation',
      baseIntensity: 66,
      animation: 'glow',
      palette: ['#fef9c3', '#fb923c', '#f8fafc'],
      prompt: 'Try calcium with chlorine for the salt-making pattern.',
    },
  },
  {
    id: 'calcium-chlorine-salt',
    symbols: ['Ca', 'Cl'],
    result: {
      title: 'Calcium chloride crystals',
      summary: 'Calcium and chlorine form calcium chloride, a useful ionic salt.',
      explanation: 'Calcium tends to lose two electrons, while chlorine atoms gain one each. Together they form CaCl2.',
      products: ['CaCl2'],
      reactionType: 'salt-formation',
      baseIntensity: 62,
      animation: 'crystal',
      palette: ['#f8fafc', '#a7f3d0', '#38bdf8'],
      prompt: 'Try sodium and chlorine for the classic table salt example.',
    },
  },
  {
    id: 'carbon-hydrogen-oxygen-organic',
    symbols: ['C', 'H', 'O'],
    result: {
      title: 'Life chemistry trio',
      summary: 'Carbon, hydrogen, and oxygen are the alphabet of sugars, fuels, and living molecules.',
      explanation: 'These elements can connect in many shapes. Depending on arrangement, they can make alcohols, sugars, acids, fuels, and countless organic compounds.',
      products: ['Organic molecule family'],
      reactionType: 'exploration',
      baseIntensity: 44,
      animation: 'bubble',
      palette: ['#22c55e', '#67e8f9', '#facc15'],
      prompt: 'Add heat and air to imagine how organic fuels burn into water and carbon dioxide.',
    },
  },
];

export function reactionKey(symbols: string[]) {
  return [...new Set(symbols)].sort().join('+');
}

export function symbolsOf(selection: Element[]) {
  return selection.map((element) => element.symbol);
}
