import { curatedReactions, reactionKey, type Environment, type ReactionResult } from '../data/reactions';
import type { Element } from '../data/elements';
import { pressureToAirDensity } from './units';

const nobleGasSymbols = new Set(['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn']);
const alkaliSymbols = new Set(['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr']);
const halogenSymbols = new Set(['F', 'Cl', 'Br', 'I', 'At']);
const oxygenLike = new Set(['O']);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function environmentBoost(environment: Environment) {
  const heat = environment.temperature / 900;
  const air = pressureToAirDensity(environment.pressureAtm) / 100;
  return clamp((heat + air) * 12, 0, 24);
}

function makeFallback(selection: Element[], environment: Environment): ReactionResult {
  const symbols = selection.map((element) => element.symbol);
  const categories = new Set(selection.map((element) => element.category));
  const palette = selection.map((element) => element.tone);
  const names = selection.map((element) => element.name).join(', ');
  const hasNobleGas = symbols.some((symbol) => nobleGasSymbols.has(symbol));
  const hasAlkali = symbols.some((symbol) => alkaliSymbols.has(symbol));
  const hasHalogen = symbols.some((symbol) => halogenSymbols.has(symbol));
  const hasOxygen = symbols.some((symbol) => oxygenLike.has(symbol));
  const metals = selection.filter((element) => element.category.includes('metal') || element.category === 'transition-metal');
  const airDensity = pressureToAirDensity(environment.pressureAtm);

  if (hasNobleGas && selection.length <= 2 && environment.temperature < 800) {
    return {
      id: `fallback-${reactionKey(symbols)}`,
      title: 'Calm noble glow',
      summary: 'The noble gas mostly watches from the sidelines.',
      explanation: 'Noble gases already have comfortable electron shells, so they rarely need to trade or share electrons under everyday conditions.',
      products: ['No major reaction'],
      reactionType: 'inert',
      intensity: 16,
      animation: 'calm',
      palette: palette.length ? palette : ['#a78bfa'],
      prompt: 'Try adding oxygen and a reactive metal to create a more energetic story.',
    };
  }

  if (hasAlkali && hasHalogen) {
    return {
      id: `fallback-${reactionKey(symbols)}`,
      title: 'Salt-making pattern',
      summary: 'An alkali metal and a halogen tend toward an ionic salt.',
      explanation: 'Alkali metals easily lose one electron. Halogens eagerly gain one. That push-pull pattern is the classic recipe for salt crystals.',
      safetyNote: 'The real elements can be hazardous before the stable salt forms.',
      products: ['Ionic salt family'],
      reactionType: 'salt-formation',
      intensity: clamp(62 + environmentBoost(environment), 0, 100),
      animation: 'crystal',
      palette: [...palette, '#f8fafc'],
      prompt: 'Try sodium plus chlorine for the named table salt reaction.',
    };
  }

  if (hasOxygen && metals.length > 0 && airDensity > 25) {
    return {
      id: `fallback-${reactionKey(symbols)}`,
      title: 'Oxide forming',
      summary: 'Oxygen begins bonding with the metal surface.',
      explanation: 'Many metals react with oxygen to form oxides. Some oxides protect the metal, while others crumble away like rust.',
      products: ['Metal oxide family'],
      reactionType: environment.temperature > 560 ? 'combustion' : 'oxidation',
      intensity: clamp(36 + environmentBoost(environment) + (environment.temperature > 560 ? 18 : 0), 0, 100),
      animation: environment.temperature > 560 ? 'flame' : 'glow',
      palette: [...palette, '#f97316'],
      prompt: 'Compare iron, copper, magnesium, and aluminium with oxygen.',
    };
  }

  if (metals.length >= 2 && environment.temperature > 500) {
    return {
      id: `fallback-${reactionKey(symbols)}`,
      title: 'Molten metal mix',
      summary: 'The metals soften toward an alloy-like blend.',
      explanation: 'When heated strongly, metals can mix into alloys. Alloys often have different strength, colour, melting point, or sound than their ingredients.',
      products: ['Alloy family'],
      reactionType: 'alloy',
      intensity: clamp(45 + environmentBoost(environment), 0, 100),
      animation: 'glow',
      palette: [...palette, '#f59e0b'],
      prompt: 'Try copper plus zinc for brass or iron plus carbon for steel.',
    };
  }

  if (categories.has('reactive-nonmetal') && environment.temperature > 650) {
    return {
      id: `fallback-${reactionKey(symbols)}`,
      title: 'High-energy rearrangement',
      summary: `${names} jiggle, collide, and explore new bonds under high heat.`,
      explanation: 'Heat makes particles move faster. Faster collisions can break old bonds and give new structures a chance to form.',
      products: ['Possible compound family'],
      reactionType: 'exploration',
      intensity: clamp(38 + environmentBoost(environment), 0, 100),
      animation: 'spark',
      palette: [...palette, '#facc15'],
      prompt: 'Add oxygen or a halogen to make the outcome easier to predict.',
    };
  }

  return {
    id: `fallback-${reactionKey(symbols)}`,
    title: 'Gentle particle dance',
    summary: `${names} share the chamber, but no clear reaction takes over yet.`,
    explanation: 'Not every mixture reacts under every condition. Chemistry depends on electron patterns, energy, pressure, and the chance of useful collisions.',
    products: ['Mixture'],
    reactionType: 'inert',
    intensity: clamp(12 + environmentBoost(environment) / 2, 0, 36),
    animation: 'calm',
    palette: palette.length ? palette : ['#67e8f9', '#a78bfa'],
    prompt: 'Raise the temperature, add oxygen-rich air, or choose a known reactive pair.',
  };
}

export function simulateReaction(selection: Element[], environment: Environment): ReactionResult {
  if (selection.length === 0) {
    return {
      id: 'empty-chamber',
      title: 'Empty chamber',
      summary: 'Add one to three elements to begin.',
      explanation: 'Chemistry starts when particles have neighbours to collide, share electrons with, or ignore entirely.',
      products: [],
      reactionType: 'inert',
      intensity: 0,
      animation: 'calm',
      palette: ['#67e8f9', '#a78bfa'],
      prompt: 'Pick hydrogen and oxygen, or sodium and chlorine, for a strong first experiment.',
    };
  }

  const symbols = selection.map((element) => element.symbol);
  const uniqueKey = reactionKey(symbols);
  const exact = curatedReactions.find((rule) => reactionKey(rule.symbols) === uniqueKey);

  if (exact) {
    const underHeated = exact.minTemperature !== undefined && environment.temperature < exact.minTemperature;
    const underAired = exact.minAirDensity !== undefined && pressureToAirDensity(environment.pressureAtm) < exact.minAirDensity;
    if (underHeated || underAired) {
      return {
        id: `${exact.id}-waiting`,
        title: `${exact.result.title} is waiting`,
        summary: 'The ingredients are right, but the chamber conditions are not quite there yet.',
        explanation: underHeated
          ? 'Many reactions need activation energy. Raise the temperature to make collisions energetic enough to rearrange atoms.'
          : 'This reaction needs enough surrounding gas. Increase air density to supply more collisions and oxygen-rich contact.',
        products: ['Reactants waiting'],
        reactionType: 'inert',
        intensity: 24,
        animation: 'calm',
        palette: exact.result.palette,
        prompt: underHeated ? 'Raise the temperature slider until the chamber wakes up.' : 'Increase air density and run the reaction again.',
      };
    }

    return {
      id: exact.id,
      ...exact.result,
      intensity: clamp(exact.result.baseIntensity + environmentBoost(environment), 0, 100),
    };
  }

  return makeFallback(selection, environment);
}
