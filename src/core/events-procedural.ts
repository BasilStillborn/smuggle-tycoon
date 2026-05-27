import type { ChoiceEvent, PlayerState, DirectorState } from './types';
import { hasHighTierAsset, getAsset } from './assets';

function ownsAsset(player: PlayerState, assetId: string): boolean {
  return (player.ownedAssets ?? []).includes(assetId);
}

let _eventSeed = 0;
function nextId(): string {
  return `evt_$${++_eventSeed}_${Date.now().toString(36)}`;
}

function getReputationTier(player: PlayerState): number {
  if (player.reputation >= 75) return 3;
  if (player.reputation >= 45) return 2;
  if (player.reputation >= 20) return 1;
  return 0;
}

interface EventTemplate {
  weight: (player: PlayerState) => number;
  generate: (player: PlayerState, director: DirectorState) => ChoiceEvent;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  {
    weight: () => 10,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'Customs Officer Approaches',
      context: 'A customs officer eyes you from across the terminal. He\'s off-duty, but his stare says he knows. He walks over and mutters: "Busy day. Real busy. Might need to clear my head tonight, if you catch my drift."',
      choices: [
        {
          id: 'bribe',
          text: 'Slip him a fat envelope. $500 should buy his silence.',
          odds: 0.6 + player.reputation * 0.002,
          successEffects: { cashDelta: -500, heatDelta: -15, reputationDelta: 2, message: 'He pockets the cash, nods, and walks away. Heat drops.' },
          failEffects: { cashDelta: -500, heatDelta: 20, reputationDelta: -5, message: 'He takes the money, then radios his buddies. They move in. Heat spikes!' },
        },
        {
          id: 'bluff',
          text: 'Stare him down. You\'re just a tourist. Nothing to hide.',
          odds: 0.4 + player.reputation * 0.002,
          successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 3, message: 'He blinks first, mutters "Wrong guy," and moves on. Respect +1.' },
          failEffects: { cashDelta: -200, heatDelta: 25, reputationDelta: -5, message: 'He doesn\'t buy it. Strip search. They find trace residue. Heat skyrockets.' },
        },
        {
          id: 'walk_away',
          text: 'Turn around and leave. Abort whatever you were going to do.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: -2, message: 'You walk away clean. Smart, but you feel his eyes on your back the whole time.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
  {
    weight: (player) => player.currentCountryId === 'london' ? 0 : 10,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Back-Alley Deal',
      context: 'A scruffy contact named Mickey waves you into a damp alley. "Got something special," he hisses. "Product so pure it\'ll sing. But the price is steep, and the feds have been sniffing around my operation. Your call."',
      choices: [
        {
          id: 'buy_big',
          text: 'Buy the whole lot. $1,200. High risk, high reward.',
          odds: 0.5 + player.reputation * 0.002,
          successEffects: { cashDelta: -1200, heatDelta: 10, reputationDelta: 5, message: 'The product is pristine. You flip it fast for double. Profit surges!' },
          failEffects: { cashDelta: -1200, heatDelta: 30, reputationDelta: -10, message: 'It\'s a setup. Police swarm the alley. You barely escape. Money gone, heat through the roof.' },
        },
        {
          id: 'buy_small',
          text: 'Just a sample. $300. Test the waters.',
          odds: 0.75,
          successEffects: { cashDelta: -300, heatDelta: 5, reputationDelta: 2, message: 'Small batch, clean product. You move it slowly. Modest profit, no attention.' },
          failEffects: { cashDelta: -300, heatDelta: 10, reputationDelta: -3, message: 'The sample is cut to hell. Worthless. You flush it. Lesson learned.' },
        },
        {
          id: 'pass',
          text: 'Walk away. Too hot.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, message: 'You pass. Mickey shrugs. "Your loss." Could be. Could be not.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
  {
    weight: () => 8,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Informant\'s Offer',
      context: 'A nervous woman in a grey coat sits alone at your usual caf\u00e9. She slides a photo across the table: it\'s a cargo manifest. "DEA shipment," she whispers. "They\'re moving product \u2014 our product \u2014 through the port tonight. I can get you access, but it\'ll cost you. And if we get caught..."',
      choices: [
        {
          id: 'hijack',
          text: 'Pay $800 for the manifest. Hijack the shipment.',
          odds: 0.35 + getReputationTier(player) * 0.1,
          successEffects: { cashDelta: -800, heatDelta: 15, reputationDelta: 8, message: 'You intercept the truck. Jackpot! The cargo is worth triple what you paid. Reputation soars.' },
          failEffects: { cashDelta: -800, heatDelta: 40, reputationDelta: -15, message: 'It\'s a sting. Federal agents swarm. You barely make it out. Huge heat increase.' },
        },
        {
          id: 'tip_police',
          text: 'Tip off the police anonymously. Collect reward.',
          odds: 0.7,
          successEffects: { cashDelta: 500, heatDelta: -10, reputationDelta: -5, message: 'Police raid the port. You collect a $500 reward as a "concerned citizen." But word gets around you snitched.' },
          failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: -10, message: 'The tip is traced back to you. Heat spikes and the underworld brands you a rat.' },
        },
        {
          id: 'refuse',
          text: 'Refuse. You don\'t know her. You were never here.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 1, message: 'You walk. The woman vanishes into the crowd. Sometimes the smart play is no play.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
  {
    weight: () => 7,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'Port Security Lockdown',
      context: 'Sirens in the distance. Port security is locking down the docks. Trucks are being stopped, papers checked. A dockworker waves you over: "I can get you through the service gate, but my boys need compensation. And there\'s a chance they\'re watching that route too."',
      choices: [
        {
          id: 'pay_up',
          text: 'Pay $400 for safe passage through the service gate.',
          odds: 0.55 + player.reputation * 0.001,
          successEffects: { cashDelta: -400, heatDelta: -10, reputationDelta: 0, message: 'The dockworker guides you through. Clean air on the other side. Money well spent.' },
          failEffects: { cashDelta: -400, heatDelta: 25, reputationDelta: -5, message: 'They were watching the gate. You\'re detained, questioned, released with a warning. Heat soars.' },
        },
        {
          id: 'hide',
          text: 'Find a crate and wait it out. Let the lockdown pass.',
          odds: 0.8,
          successEffects: { cashDelta: 0, heatDelta: -8, reputationDelta: 0, message: 'You huddle in a shipping container for two hours. Boring, but safe. Heat dissipates.' },
          failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: -3, message: 'A guard does a routine sweep. You talk your way out, but they noted your face.' },
        },
        {
          id: 'rush',
          text: 'Make a run for it. Full sprint to the exit.',
          odds: 0.3 - player.heat * 0.002,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 3, message: 'You\'re fast. You\'re out before anyone registers. Adrenaline and swagger.' },
          failEffects: { cashDelta: -300, heatDelta: 35, reputationDelta: -8, message: 'Tackled at the gate. They find the goods. Heavy fine, heavy heat.' },
        },
      ],
    }),
  },
  {
    weight: () => 6,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Middleman\'s Dilemma',
      context: 'Your usual middleman, Roberto, has a problem. His nephew was picked up by the guardia. He needs $1,000 for a lawyer. "I know business has been good to you, patr\u00f3n. I\'m not asking for a gift \u2014 I\'m asking for an investment. I won\'t forget."',
      choices: [
        {
          id: 'help',
          text: 'Give him the $1,000. Loyalty matters.',
          odds: 0.7,
          successEffects: { cashDelta: -1000, heatDelta: 0, reputationDelta: 10, message: 'Roberto weeps with gratitude. "You will always have my loyalty," he swears. Reputation climbs.' },
          failEffects: { cashDelta: -1000, heatDelta: 5, reputationDelta: -5, message: 'Roberto takes the money and vanishes. You never see him again. Word is he fled north.' },
        },
        {
          id: 'loan',
          text: 'Lend $500. He pays you back double next job.',
          odds: 0.5 + player.reputation * 0.002,
          successEffects: { cashDelta: -500, heatDelta: 0, reputationDelta: 5, message: 'Roberto nods. "Fair enough." Next week, he delivers $1,000 worth of work. Trust built.' },
          failEffects: { cashDelta: -500, heatDelta: 0, reputationDelta: -3, message: 'Roberto takes the $500 but the nephew gets deported anyway. Bad luck all around.' },
        },
        {
          id: 'deny',
          text: 'Say no. You can\'t afford to be sentimental in this business.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: -5, message: 'Roberto says nothing, but his eyes go cold. You\'ve lost a contact today.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
  // Type B — requires tier 2+ asset
  {
    weight: (p) => hasHighTierAsset(p, 2) ? 8 : 0,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Gala Invitation',
      context: 'A cream-coloured envelope slides under your hotel door. Gold-embossed cardstock: "Mr. Vancourt requests the pleasure of your company at his annual charity gala. Black tie. Masks optional." Vancourt is the most connected man on the continent — and the most dangerous. This isn\'t a party. It\'s a recruitment.',
      choices: [
        {
          id: 'attend_confident',
          text: 'Attend in your finest. Your presence is the statement.',
          odds: 0.5 + player.reputation * 0.003,
          successEffects: { cashDelta: 5000, heatDelta: 0, reputationDelta: 12, message: 'Vancourt himself shakes your hand. "I\'ve heard of you." You leave with a new contact and a $5,000 retainer for "consulting."' },
          failEffects: { cashDelta: -2000, heatDelta: 15, reputationDelta: -8, message: 'You\'re out of your depth. A rival humiliates you in front of Vancourt. Reputation suffers.' },
        },
        {
          id: 'observe',
          text: 'Go in discreet. Watch. Listen. Don\'t engage.',
          odds: 0.8,
          successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 5, message: 'You blend in perfectly. Overheard: a major shipment moving through Naples next week. Intelligence gained.' },
          failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: -3, message: 'Security eyes you. You leave early. Nothing gained, nothing lost but the cab fare.' },
        },
        {
          id: 'skip',
          text: 'Skip it. Galas are where people get made.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: -3, reputationDelta: 0, message: 'You burn the invitation. Smart. You can\'t be caught at a party you never attended.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
  // Type B — requires tier 2+ asset
  {
    weight: (p) => hasHighTierAsset(p, 2) ? 7 : 0,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Yacht Proposition',
      context: 'A sleek 80-footer glides into the marina. A man in white linen waves you over. "They tell me you\'re the one who moves what can\'t be moved." He pours two glasses of Macallan 25. "I have a proposal. Twenty minutes. No strings." The name on the transom: "LIBERTY."',
      choices: [
        {
          id: 'accept_drink',
          text: 'Accept the drink. Hear him out.',
          odds: 0.45 + player.reputation * 0.003,
          successEffects: { cashDelta: 10000, heatDelta: 5, reputationDelta: 10, message: 'The deal is real. $10,000 up front for a single shipment through his network. Profit margins are enormous.' },
          failEffects: { cashDelta: -3000, heatDelta: 20, reputationDelta: -10, message: 'It\'s a setup. You barely escape the marina as police swarm. Someone talked.' },
        },
        {
          id: 'take_card',
          text: 'Take his card. You\'ll call when you\'re ready.',
          odds: 0.9,
          successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 3, message: 'He nods appreciatively. "Smart. A man who doesn\'t rush is a man who can be trusted." You have his number.' },
          failEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: -2, message: 'He smirks. "Pity. I thought you were the one." The door closes.' },
        },
        {
          id: 'walk',
          text: 'Walk. You don\'t know him. You don\'t trust him.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, message: 'You melt back into the crowd. Paranoia keeps you alive.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
  // Type B — requires tier 3 asset
  {
    weight: (p) => hasHighTierAsset(p, 3) ? 6 : 0,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Boardroom',
      context: 'Three men in suits sit across from you in a private hangar. One slides a tablet across the table. "We represent interests that would like to retain your services permanently. Not as a courier. As a partner. Fifty percent of a billion-dollar pipeline. All we need is your logistics network and your discretion."',
      choices: [
        {
          id: 'accept_partnership',
          text: 'Shake hands. You\'re in.',
          odds: 0.4 + player.reputation * 0.004,
          successEffects: { cashDelta: 50000, heatDelta: 10, reputationDelta: 15, message: 'You\'re now a partner in the largest undeclared transport network on earth. The money is staggering. So is the target on your back.' },
          failEffects: { cashDelta: -10000, heatDelta: 35, reputationDelta: -15, message: 'It\'s a cartel audition. When you hesitate, they take your cash as a "lesson." You\'re lucky to leave breathing.' },
        },
        {
          id: 'counter',
          text: 'Counter with a smaller deal. Test the waters.',
          odds: 0.6 + player.reputation * 0.002,
          successEffects: { cashDelta: 15000, heatDelta: 5, reputationDelta: 8, message: 'They respect the caution. A trial run: $15,000 for a single corridor. If it works, the real offer stands.' },
          failEffects: { cashDelta: 0, heatDelta: 15, reputationDelta: -5, message: 'They don\'t do trials. "You\'re either in or you\'re in the way." The door closes coldly.' },
        },
        {
          id: 'refuse_partnership',
          text: 'Decline. You work alone.',
          odds: 0.9,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 3, message: 'They respect independence. "If you change your mind, you know where to find us." You walk away clean.' },
          failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: -5, message: 'Declining was the wrong move. They won\'t forget your face.' },
        },
      ],
    }),
  },
  // Notoriety-dependent event — higher notoriety means higher stakes
  {
    weight: (p) => p.notoriety >= 15 ? 7 : 2,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Syndicate Summons',
      context: 'A black car pulls up beside you. The window rolls down. "Get in." The voice is calm. Final. You know the face — one of the Syndicate\'s top enforcers. They\'ve been watching you. Your reputation precedes you. Now they want to know: are you useful, or are you a problem?',
      choices: [
        {
          id: 'get_in',
          text: 'Get in the car. This is the big league.',
          odds: 0.3 + player.notoriety * 0.004,
          successEffects: { cashDelta: 15000, heatDelta: 15, reputationDelta: 10, message: 'The Syndicate has a job. High risk. High pay. You accept. $15,000 upfront. Your notoriety just doubled in the right circles.' },
          failEffects: { cashDelta: -5000, heatDelta: 30, reputationDelta: -12, message: 'They test you. You fail. They take $5,000 as a "misunderstanding fee" and dump you on a curb. Heat spikes.' },
        },
        {
          id: 'play_dumb',
          text: 'Play dumb. You don\'t know what they\'re talking about.',
          odds: 0.5 - player.notoriety * 0.002,
          successEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: -5, message: 'They study you for a long moment. "Keep it that way." The car drives off. You feel lucky to be alive.' },
          failEffects: { cashDelta: -2000, heatDelta: 15, reputationDelta: -8, message: 'They don\'t believe you. "We\'ll be watching." They know your face now.' },
        },
        {
          id: 'refuse_syndicate',
          text: 'Refuse. You work alone.',
          odds: 0.7,
          successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, message: '"Your choice." The car disappears. But they have your number now. Whether that\'s good or bad remains to be seen.' },
          failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: -5, message: 'Refusing was noted. Politely. But noted.' },
        },
      ],
    }),
  },
  // Asset-specific event — requires safehouse_network
  {
    weight: (p) => ownsAsset(p, 'safehouse_network') ? 6 : 0,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'Safehouse Compromise Alert',
      context: 'Your encrypted phone buzzes. "They know about the Bogota house. Get there before they do." Someone on your payroll has been talking. The safehouse network is only as strong as its weakest link. You have to move fast \u2014 secure the evidence, burn the location, or cut ties completely.',
      choices: [
        {
          id: 'secure_evac',
          text: 'Rush to secure and evacuate the safehouse. $1,200 for the cleanup crew.',
          odds: 0.55 + player.reputation * 0.002,
          successEffects: { cashDelta: -1200, heatDelta: -15, reputationDelta: 5, message: 'The crew scrubs the house clean. By the time they arrive, it\'s just an empty building. Your network holds.' },
          failEffects: { cashDelta: -1200, heatDelta: 20, reputationDelta: -8, message: 'Too late. The house is raided. They find ledgers linking back to you. Heat spikes.' },
        },
        {
          id: 'burn_safehouse',
          text: 'Burn it. Cut all ties. Lose the asset but save yourself.',
          odds: 0.7,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: -3, message: 'You torch the connection. The safehouse is gone, but so is the evidence. The network is weaker now.' },
          failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: -5, message: 'The fire draws attention. Investigators link the arson to known smugglers. Heat rises.' },
        },
      ],
    }),
  },
  // Asset-specific event — requires sports_car
  {
    weight: (p) => ownsAsset(p, 'sports_car') ? 5 : 0,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Street Race Challenge',
      context: 'A crowd has gathered at the industrial quarter. A rival dealer revs his engine. "That\'s a nice V8 you got there. Let\'s see if it\'s as fast as your mouth. Winner takes $3,000 and bragging rights. Loser walks." The street is alive with headlights and adrenaline.',
      choices: [
        {
          id: 'race',
          text: 'Race him. Your V8 against his import.',
          odds: 0.4 + player.notoriety * 0.003,
          successEffects: { cashDelta: 3000, heatDelta: 10, reputationDelta: 8, message: 'Your turbo kicks in at the halfway mark. You win by two car lengths. The crowd roars. Reputation through the roof.' },
          failEffects: { cashDelta: -1500, heatDelta: 15, reputationDelta: -5, message: 'He smokes you at the start. You lose the bet and the respect of the crowd. Your car is recognized now.' },
        },
        {
          id: 'bet_side',
          text: 'Bet $500 on yourself from the sidelines. Let someone else drive.',
          odds: 0.6,
          successEffects: { cashDelta: 1000, heatDelta: 5, reputationDelta: 3, message: 'Your driver wins. You collect your winnings. Not bad for keeping your hands clean.' },
          failEffects: { cashDelta: -500, heatDelta: 5, reputationDelta: -2, message: 'Your driver loses. Money gone. At least your face wasn\'t in the spotlight.' },
        },
        {
          id: 'refuse_race',
          text: 'Decline. You have nothing to prove to street punks.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, message: 'You drive away slowly. They jeer, but you don\'t care. Pride doesn\'t pay the bills.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
  // Notoriety-gated event — requires notoriety >= 20
  {
    weight: (p) => p.notoriety >= 20 ? 7 : 2,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Rival\'s Ultimatum',
      context: 'A message arrives via courier: a photo of your latest shipment, a map of your route, and a single sentence. "You\'re moving product in my territory. That\'s a tax I haven\'t collected. Meet me at the docks tonight. Bring $5,000, or next time my men don\'t just watch." Your reputation has grown enough to attract competitors.',
      choices: [
        {
          id: 'pay_tribute',
          text: 'Pay the $5,000. Pick your battles.',
          odds: 0.6,
          successEffects: { cashDelta: -5000, heatDelta: -10, reputationDelta: -3, message: 'You pay. The rival nods. "Smart." You keep your route, but word spreads that you can be squeezed.' },
          failEffects: { cashDelta: -5000, heatDelta: 15, reputationDelta: -8, message: 'He takes the money and tips off customs anyway. You\'ve been played. Heat soars.' },
        },
        {
          id: 'confront',
          text: 'Confront him. Show strength.',
          odds: 0.3 + player.notoriety * 0.005,
          successEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: 10, message: 'You walk into his operation alone. Cold. Calculated. By the time you leave, you own a piece of his territory. Respect earned.' },
          failEffects: { cashDelta: -2000, heatDelta: 25, reputationDelta: -10, message: 'He was ready. His men jump you. You escape but lose $2,000 and gain a bloody nose and a hotter profile.' },
        },
        {
          id: 'call_syndicate',
          text: 'Call in a Syndicate favor. Let them handle it.',
          odds: 0.5 + player.reputation * 0.002,
          successEffects: { cashDelta: -2000, heatDelta: 5, reputationDelta: 5, message: 'A Syndicate enforcer has a word with your rival. The problem disappears. Cost: $2,000 "processing fee."' },
          failEffects: { cashDelta: -2000, heatDelta: 15, reputationDelta: -5, message: 'The Syndicate declines to intervene. You\'re on your own, and you\'re out $2,000.' },
        },
      ],
    }),
  },
  // Elite event — requires asset tier 3 AND notable reputation
  {
    weight: (p) => hasHighTierAsset(p, 3) && p.reputation >= 50 ? 5 : 0,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Cartel Summit',
      context: 'An invitation arrives on handmade paper sealed with crimson wax. "You have been observed. Your operations show discipline. Your assets speak of success. The Council would like a conversation. Come alone. Come armed. Come ready to decide your future." The address is a private estate in the hills. This is not a negotiation. This is an evaluation.',
      choices: [
        {
          id: 'attend_summit',
          text: 'Attend the summit. This is how empires are built.',
          odds: 0.35 + player.reputation * 0.003,
          successEffects: { cashDelta: 25000, heatDelta: 15, reputationDelta: 15, message: 'The Council is impressed. You\'re offered a seat at the table. $25,000 retainer and a share of the regional pipeline. You\'ve arrived.' },
          failEffects: { cashDelta: -10000, heatDelta: 30, reputationDelta: -15, message: 'They test you. You falter. The exit is costly \u2014 $10,000 and a burned reputation. You\'re lucky to leave breathing.' },
        },
        {
          id: 'send_representative',
          text: 'Send a trusted lieutenant. Gauge the room.',
          odds: 0.6,
          successEffects: { cashDelta: 5000, heatDelta: 5, reputationDelta: 5, message: 'Your representative handles it well. The Council notes your caution. A smaller offer is extended. Respectable.' },
          failEffects: { cashDelta: -3000, heatDelta: 10, reputationDelta: -5, message: 'Your lieutenant is out of their depth. The Council is offended. A opportunity closes.' },
        },
        {
          id: 'decline_summit',
          text: 'Decline. You don\'t answer to councils.',
          odds: 0.7,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 3, message: 'You send a polite refusal. The Council respects independence. "When you\'re ready, the door remains open."' },
          failEffects: { cashDelta: 0, heatDelta: 10, reputationDelta: -5, message: 'Declining was noted. The Council does not forget.' },
        },
      ],
    }),
  },
  // Contact-dependent event — requires at least one unlocked contact
  {
    weight: (p) => p.unlockedContacts.length > 0 ? 6 : 0,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Regional Contact Calls In',
      context: 'Your phone rings. A voice you recognise from the network. "I\'ve got a tip. A shipment of uncut product moving through ' + player.unlockedContacts[0] + '. Untouched. Unprotected. But the window closes in six hours. You want in, you move now. You hesitate, it\'s gone."',
      choices: [
        {
          id: 'move_fast',
          text: 'Move on it immediately. $3,000 for the tip.',
          odds: 0.5 + player.reputation * 0.002,
          successEffects: { cashDelta: 20000, heatDelta: 15, reputationDelta: 8, message: 'Your contact was right. The shipment is pristine. You flip it for $20,000. The network expands.' },
          failEffects: { cashDelta: -3000, heatDelta: 25, reputationDelta: -10, message: 'The tip was bait. You walk into a federal operation. Escape with your skin but lose the money.' },
        },
        {
          id: 'tip_fee',
          text: 'Pay $1,000 for exclusive rights. Scout it first.',
          odds: 0.7,
          successEffects: { cashDelta: 10000, heatDelta: 5, reputationDelta: 5, message: 'You scout and find the shipment is real. Smaller than advertised, but $10,000 profit is nothing to sneeze at.' },
          failEffects: { cashDelta: -1000, heatDelta: 10, reputationDelta: -3, message: 'The shipment is guarded. You pull back. Tip money wasted, but you\'re alive.' },
        },
        {
          id: 'pass_tip',
          text: 'Pass. You don\'t trust unsolicited tips.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: 0, message: 'You ignore the tip. Your contact sounds disappointed. But paranoia keeps you free.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
  {
    weight: () => 5,
    generate: (player: PlayerState, director: DirectorState): ChoiceEvent => ({
      id: nextId(),
      title: 'The Cargo Hold Gambit',
      context: 'Your ship is docked but customs is doing a deep scan. A crew member approaches: "I can reroute your cargo through the auxiliary hold \u2014 the scanners there are old, they miss things. But if they catch us rerouting, they\'ll flag the whole ship. Decision\'s yours."',
      choices: [
        {
          id: 'reroute',
          text: 'Reroute the cargo. Increased risk, but your goods stay hidden.',
          odds: 0.5 - player.heat * 0.002,
          successEffects: { cashDelta: 0, heatDelta: 5, reputationDelta: 3, message: 'The cargo slips through undetected. You owe that crew member a drink. Reputation up.' },
          failEffects: { cashDelta: -600, heatDelta: 30, reputationDelta: -8, message: 'Flagged. Deep inspection. They find everything. Heavy fine, cargo seized, face burned.' },
        },
        {
          id: 'bribe_inspector',
          text: 'Bribe the lead inspector $700 to look the other way.',
          odds: 0.5 + player.reputation * 0.002 - director.enforcementAttention * 0.003,
          successEffects: { cashDelta: -700, heatDelta: 0, reputationDelta: 2, message: 'The inspector pockets the cash, stamps your papers. Professional courtesy.' },
          failEffects: { cashDelta: -700, heatDelta: 25, reputationDelta: -10, message: 'The inspector is a straight arrow. He arrests you on the spot. You talk your way out but lose the cash and gain heat.' },
        },
        {
          id: 'play_safe',
          text: 'Leave the cargo. You can rebuild. Getting caught ends everything.',
          odds: 1.0,
          successEffects: { cashDelta: 0, heatDelta: -5, reputationDelta: -2, message: 'You abandon the shipment and watch them tear it apart from a distance. Living to fight another day.' },
          failEffects: { cashDelta: 0, heatDelta: 0, reputationDelta: 0, message: '' },
        },
      ],
    }),
  },
];

export function generateProceduralEvent(
  player: PlayerState,
  director: DirectorState
): ChoiceEvent {
  const candidates = EVENT_TEMPLATES.flatMap((t) => {
    const count = t.weight(player);
    return Array.from({ length: count }, () => t.generate(player, director));
  });
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function resolveEventChoice(
  player: PlayerState,
  event: ChoiceEvent,
  choiceId: string
): { player: PlayerState; message: string; event: ChoiceEvent } {
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) return { player, message: 'Invalid choice.', event };

  const roll = Math.random();
  const success = roll < choice.odds;

  const effects = success ? choice.successEffects : choice.failEffects;
  if (effects.cashDelta === 0 && effects.heatDelta === 0 && effects.reputationDelta === 0 && effects.message === '') {
    return { player, message: 'You step back. Nothing happens.', event };
  }

  const updatedPlayer: PlayerState = {
    ...player,
    cash: Math.max(0, player.cash + effects.cashDelta),
    heat: Math.min(100, Math.max(0, player.heat + effects.heatDelta)),
    reputation: Math.min(100, Math.max(0, player.reputation + effects.reputationDelta)),
  };

  const outcomeLabel = success ? 'SUCCESS' : 'FAILURE';
  return {
    player: updatedPlayer,
    message: `[${outcomeLabel}] ${effects.message}`,
    event,
  };
}
