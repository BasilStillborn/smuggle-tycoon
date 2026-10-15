import type { EventEffects } from './types';

interface ChanceCard {
  text: string;
  effects: EventEffects;
}

const CHANCE_CARDS: ChanceCard[] = [
  // ── Positive cards ──────────────────────────────────────
  { text: "That prick Tony paid you back the $200 he owed you.", effects: { cashDelta: 200, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Unexpected cash.' } },
  { text: "A little old lady dropped her purse at the ATM. Oh well, her loss.", effects: { cashDelta: 50, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Small find.' } },
  { text: "Your neighbour paid you $120 for looking after their disabled dog.", effects: { cashDelta: 120, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Easy money.' } },
  { text: "Some prat leaves his e-bike outside the Co-op. As you steal it he chases you, you call him a cunt and speed off.", effects: { cashDelta: 1000, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Hot wheels.' } },
  { text: "You weighed in that sack of copper you stole from your last construction job.", effects: { cashDelta: 300, heatDelta: 0, reputationDelta: 3, credibilityDelta: 2, inventoryLost: false, message: 'Good luck. Scrap value.' } },
  { text: "Your landlord forgot to cash your rent cheque. That's $400 extra this month.", effects: { cashDelta: 400, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Their mistake, your gain.' } },
  { text: "You get in a row with a taxi driver — you threaten to call the police and tell them he called you the N-word (Nigger) if he doesn't shut up and drop you where you want to go.", effects: { cashDelta: 250, heatDelta: 0, reputationDelta: 0, credibilityDelta: 2, inventoryLost: false, message: 'Good luck. Free ride.' } },
  { text: "You won $180 on a scratch card.", effects: { cashDelta: 180, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Lady luck smiles.' } },
  { text: "A guy at the pub paid back the $90 he owed you.", effects: { cashDelta: 90, heatDelta: 0, reputationDelta: 1, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Debt repaid.' } },
  { text: "The tax office owes you a refund. Funny that — you've not paid a penny tax in your life, you lazy prick.", effects: { cashDelta: 350, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Government mistake in your favour.' } },
  { text: "A fight breaks out in a shop and the shop owner gets knocked out. You quickly stick your hand in the till and grab what you can.", effects: { cashDelta: 200, heatDelta: 5, reputationDelta: 0, credibilityDelta: 2, inventoryLost: false, message: 'Good luck. Till snatch.' } },
  { text: "An elderly relative dies and leaves you an inheritance. Took them long enough — thought the old cunt was never going to die.", effects: { cashDelta: 1000, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Inheritance.' } },
  { text: "You're offered a job doing some labouring. The guy pays you up front... so obviously you take the money and don't turn up.", effects: { cashDelta: 500, heatDelta: 0, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: 'Good luck. Easy money.' } },
  { text: "You're in Poundland and a little old lady squeezes past you. You slip her purse out her bag and hurry out the shop. Nice one.", effects: { cashDelta: 80, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Sticky fingers.' } },
  { text: "Your elderly Jewish neighbor asks you to fit a TV stand for him in his flat. He's happy with the work and gives you $20. When he leaves the room you rob the rest of the cash out the biscuit tin.", effects: { cashDelta: 130, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Good luck. Biscuit tin bonus.' } },

  // ── Negative cards ──────────────────────────────────────
  { text: "You bring some sweaty tart back from the bar, but when she leaves in the morning she takes your wallet. Cunt.", effects: { cashDelta: -80, heatDelta: 0, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: 'Bad luck. Morning regret.' } },
  { text: "You get in a fight with a tranny cos he thinks you misgendered him. Fined.", effects: { cashDelta: -120, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Culture war.' } },
  { text: "You borrowed $200 off your stepdad ages ago and now the prick wants it back. Bad timing.", effects: { cashDelta: -200, heatDelta: 0, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Family debt.' } },
  { text: "A racist cop pulls you over for speeding while on the phone.", effects: { cashDelta: -450, heatDelta: 10, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Police revenue.' } },
  { text: "You get caught stealing a bottle of vodka from Tesco. The racist security guard asks you to put it back. You try to run but he catches and restrains you.", effects: { cashDelta: -350, heatDelta: 3, reputationDelta: 0, credibilityDelta: -2, inventoryLost: false, message: 'Bad luck. Tesco thief.' } },
  { text: "You bump into some woman on the tube wearing a niqab. Next thing you know your wallet has gone.", effects: { cashDelta: -250, heatDelta: 0, reputationDelta: 0, credibilityDelta: -3, inventoryLost: false, message: 'Bad luck. Pickpocket.' } },
  { text: "A guy you owe money to catches up with you. Asks for the $400 and threatens to tell people he saw you on Grindr if you don't pay up.", effects: { cashDelta: -400, heatDelta: 0, reputationDelta: -2, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Debt collector.' } },
  { text: "A friend needed bail money. You'll probably never see the little cunt again.", effects: { cashDelta: -100, heatDelta: 5, reputationDelta: 0, credibilityDelta: 0, inventoryLost: false, message: 'Bad luck. Loyalty costs.' } },
  { text: "You're out walking your XL bully dog. It tries to attack some children and their parents call the police. Fucking racist cunts.", effects: { cashDelta: -180, heatDelta: 5, reputationDelta: 0, credibilityDelta: -2, inventoryLost: false, message: 'Bad luck. Dog trouble.' } },
  { text: "You go into a betting shop and put $500 on the roulette trying to show off to the bird in there. You lose the money and she still thinks you're a prick.", effects: { cashDelta: -500, heatDelta: 0, reputationDelta: 0, credibilityDelta: -2, inventoryLost: false, message: 'Bad luck. Gambling.' } },
];

export function getChanceCard(): ChanceCard | null {
  // 8% chance of triggering any card
  if (Math.random() > 0.08) return null;

  // 50/50 split: good cards (cash up) vs bad cards (cash down)
  const goodCards = CHANCE_CARDS.filter((card) => card.effects.cashDelta > 0);
  const badCards = CHANCE_CARDS.filter((card) => card.effects.cashDelta < 0);

  if (goodCards.length === 0) throw new Error('No Good chance cards configured (cashDelta > 0).');
  if (badCards.length === 0) throw new Error('No Bad chance cards configured (cashDelta < 0).');

  const pool = Math.random() < 0.5 ? goodCards : badCards;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
