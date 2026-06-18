import type { Environment, ReactionAnimation } from './reactions';

export type StarterExperiment = {
  id: string;
  title: string;
  symbols: string[];
  clue: string;
  payoff: string;
  difficulty: 'easy' | 'guided' | 'dramatic';
  environment: Environment;
  animation: ReactionAnimation;
};

export const starterExperiments: StarterExperiment[] = [
  {
    id: 'first-water-flash',
    title: 'Wake the water flash',
    symbols: ['H', 'O'],
    clue: 'Two invisible gases need a serious spark before they become water vapour.',
    payoff: 'A blue-white chamber flash with steam on the glass.',
    difficulty: 'dramatic',
    environment: { temperature: 690, pressureAtm: 1.25 },
    animation: 'storm',
  },
  {
    id: 'classic-salt',
    title: 'Build table salt',
    symbols: ['Na', 'Cl'],
    clue: 'A restless metal and a hungry halogen snap into a crystal pattern.',
    payoff: 'Tiny bright cubes grow into sodium chloride.',
    difficulty: 'easy',
    environment: { temperature: 295, pressureAtm: 1 },
    animation: 'crystal',
  },
  {
    id: 'rust-bloom',
    title: 'Grow a rust bloom',
    symbols: ['Fe', 'O'],
    clue: 'Give iron plenty of oxygen-rich air and watch the surface change.',
    payoff: 'Orange oxidation crawls across the chamber.',
    difficulty: 'easy',
    environment: { temperature: 330, pressureAtm: 1.55 },
    animation: 'smoke',
  },
  {
    id: 'white-flare',
    title: 'Ignite a white flare',
    symbols: ['Mg', 'O'],
    clue: 'Magnesium saves its best trick for high heat and oxygen.',
    payoff: 'A brilliant cartoon flare with sparks and lens glow.',
    difficulty: 'dramatic',
    environment: { temperature: 760, pressureAtm: 1.35 },
    animation: 'flame',
  },
  {
    id: 'brass-blend',
    title: 'Blend brass',
    symbols: ['Cu', 'Zn'],
    clue: 'Heat two metals until their colours melt into something golden.',
    payoff: 'A molten swirl that cools into a brass alloy.',
    difficulty: 'guided',
    environment: { temperature: 650, pressureAtm: 0.75 },
    animation: 'glow',
  },
];
