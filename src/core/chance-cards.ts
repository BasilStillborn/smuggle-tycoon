import type { EventEffects } from './types';

interface ChanceCard {
  text: string;
  effects: EventEffects;
  weight: number;
}

const CHANCE_CARDS: ChanceCard[] = [
  // Positive cards (75% of pool weight)
  { text: 'A friend paid back the $200 he owed you.', effects: { cashDelta: 200, heatDelta: 0, reputationDelta: 2, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Unexpected cash.' }, weight: 8 },
  { text: 'You found a $50 note in your jacket pocket.', effects: { cashDelta: 50, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Small find.' }, weight: 8 },
  { text: 'Your neighbour paid you $120 for looking after their flat.', effects: { cashDelta: 120, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Easy money.' }, weight: 7 },
  { text: 'You sold an old phone for $150.', effects: { cashDelta: 150, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Decluttering pays.' }, weight: 7 },
  { text: 'A tip-off from a contact earned you a $300 finder\'s fee.', effects: { cashDelta: 300, heatDelta: 0, reputationDelta: 3, credibilityDelta: 2, inventoryLost: false, message: 'Good luck. Information is valuable.' }, weight: 6 },
  { text: 'Your landlord forgot to cash your rent cheque. That\'s $400 extra this month.', effects: { cashDelta: 400, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Their mistake, your gain.' }, weight: 5 },
  { text: 'An old associate left a bag of cash at your door. $250.', effects: { cashDelta: 250, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Anonymous gift.' }, weight: 5 },
  { text: 'You won $180 on a scratch card.', effects: { cashDelta: 180, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Lady luck smiles.' }, weight: 6 },
  { text: 'A guy at the pub paid back the $90 he owed you.', effects: { cashDelta: 90, heatDelta: 0, reputationDelta: 1, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Debt repaid.' }, weight: 7 },
  { text: 'The tax office owes you a refund. $350.', effects: { cashDelta: 350, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Government mistake in your favour.' }, weight: 5 },
  { text: 'You picked up some freelance work. $220.', effects: { cashDelta: 220, heatDelta: 0, reputationDelta: 0, credibilityDelta: 2, inventoryLost: false, message: 'Good luck. Honest work for once.' }, weight: 6 },
  { text: 'Your grandmother sent you $100 for your birthday.', effects: { cashDelta: 100, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Family always comes through.' }, weight: 7 },
  { text: 'An old debt was repaid. $500.', effects: { cashDelta: 500, heatDelta: 0, reputationDelta: 2, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Money you had written off.' }, weight: 4 },
  { text: 'Found a watch worth $80 at a pawn shop. Flipped it same day.', effects: { cashDelta: 80, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Quick flip.' }, weight: 7 },
  { text: 'Your sports bet came in. $130.', effects: { cashDelta: 130, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Beginner\'s luck.' }, weight: 6 },
  // Negative cards (25% of pool weight)
  { text: 'Your car broke down. Recovery cost $80.', effects: { cashDelta: -80, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Car trouble.' }, weight: 5 },
  { text: 'You got a parking fine. $120.', effects: { cashDelta: -120, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Council revenue.' }, weight: 5 },
  { text: 'Your phone screen cracked. Repair cost $200.', effects: { cashDelta: -200, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Technology fails.' }, weight: 5 },
  { text: 'You had to bribe a traffic officer. $150.', effects: { cashDelta: -150, heatDelta: 10, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Another hand in your pocket.' }, weight: 4 },
  { text: 'A water pipe burst at your flat. Plumber cost $350.', effects: { cashDelta: -350, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Home repairs.' }, weight: 4 },
  { text: 'Someone stole your wallet. Lost $250.', effects: { cashDelta: -250, heatDelta: 0, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: 'Bad luck. Pickpocket.' }, weight: 4 },
  { text: 'You spilled coffee on a laptop. Replacement cost $400.', effects: { cashDelta: -400, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Expensive mistake.' }, weight: 3 },
  { text: 'A friend needed bail money. You\'ll probably never see it again. $100.', effects: { cashDelta: -100, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Loyalty costs.' }, weight: 5 },
  { text: 'Your boiler broke in winter. Emergency repair $300.', effects: { cashDelta: -300, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Heating emergency.' }, weight: 3 },
  { text: 'You dropped your stash in the street. Lost $180.', effects: { cashDelta: -180, heatDelta: 5, reputationDelta: 0, credibilityDelta: -2, inventoryLost: false, message: 'Bad luck. Clumsy moment.' }, weight: 4 },
  { text: 'Dentist visit. Root canal. $500.', effects: { cashDelta: -500, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Teeth are expensive.' }, weight: 3 },
];

export function getChanceCard(): ChanceCard | null {
  // 8% chance of triggering any card
  if (Math.random() > 0.08) return null;

  // Weighted random selection
  const totalWeight = CHANCE_CARDS.reduce((sum, c) => sum + c.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const card of CHANCE_CARDS) {
    roll -= card.weight;
    if (roll <= 0) return card;
  }
  return CHANCE_CARDS[CHANCE_CARDS.length - 1];
}
