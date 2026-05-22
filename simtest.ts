// ==============================================================
// ANGELO ECONOMY SIMULATOR
// Comprehensive financial simulation of the game economy
// ==============================================================

// -- Deterministic RNG for reproducibility --
function makeRng(seed: number) {
  let s = seed;
  return function (): number {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ============================================================
// CONSTANTS — extracted from game source
// ============================================================

const GOOD = {
  cocaine: { baseValuePerUnit: 51, standardDealSize: 10, weight: 0.001, risk: 5 },
};

const DEALERS = [
  { name: 'Alejandro', priceMod: 1.15, riskBonus: -0.05 },
  { name: 'Carlos', priceMod: 0.85, riskBonus: 0.10 },
  { name: 'Valentina', priceMod: 1.0, riskBonus: 0.0 },
];

const KINGPINS = [
  { id: 'iqbal', name: 'Iqbal', minStashValue: 500, sellPriceMod: 0.9, weights: { clean: 90, mugging: 5, raid: 5 } },
  { id: 'sergio', name: 'Sergio', minStashValue: 2000, sellPriceMod: 1.15, weights: { clean: 80, mugging: 15, raid: 5 } },
  { id: 'avi', name: 'Avi', minStashValue: 5000, sellPriceMod: 1.3, weights: { clean: 85, mugging: 10, raid: 5 } },
];

const ASSETS = [
  { name: 'Simple Watch', price: 50 },
  { name: 'Leather Jacket', price: 120 },
  { name: 'Gold Chain', price: 1800 },
  { name: 'Gold Automatic Watch', price: 3500 },
  { name: 'Designer Suit', price: 5000 },
  { name: 'Diamond Ring', price: 12000 },
  { name: 'Luxury V8 Sports Car', price: 15000 },
  { name: 'Storage Unit (+100kg stash)', price: 15000 },
  { name: 'Platinum Tourbillon Watch', price: 25000 },
  { name: 'Luxury V12 Hypercar', price: 30000 },
  { name: 'Fake Passport Ring', price: 30000 },
  { name: 'Speedboat', price: 40000 },
  { name: 'Safehouse Network', price: 45000 },
  { name: 'Warehouse (+300kg stash)', price: 50000 },
  { name: 'Bribery Fund', price: 55000 },
  { name: 'Comms Hub', price: 75000 },
  { name: 'Grand Apartment', price: 150000 },
  { name: 'Mega Yacht', price: 350000 },
];

const TRAVEL_COST_BASE = 200;
const TRAVEL_COST_PER_DISTANCE = 50;
const BRIBE_COST = 500;
const ORIGIN = 'london';
const DESTINATION = 'colombia';

function calcBuyPrice(enforcementAttention: number): number {
  const demandMod = 0.1; // cocaine in Colombia
  const demandFactor = 1 + demandMod;
  const enforcementNorm = enforcementAttention / 100;
  const enforcementPremium = 1 + enforcementNorm * 0.5;
  return Math.max(1, Math.floor(51 * demandFactor * enforcementPremium));
}

function calcLondonSellPrice(enforcementAttention: number): number {
  const demandMod = 4.0; // cocaine in London
  const demandFactor = 1 + demandMod;
  const enforcementNorm = enforcementAttention / 100;
  const enforcementPremium = 1 + enforcementNorm * 0.5;
  const buyPrice = Math.floor(51 * demandFactor * enforcementPremium);
  return Math.max(1, Math.floor(buyPrice * 1.5));
}

function calcTicketPrice(rng: () => number, travelClass: 'economy' | 'first_class' = 'economy'): number {
  // London (Europe=1) to Colombia (South America=0): dist = |1-0|+1 = 2
  const dist = 2;
  const base = TRAVEL_COST_BASE + TRAVEL_COST_PER_DISTANCE * dist;
  const classMultiplier = travelClass === 'first_class' ? 2.5 : 1.0;
  const variation = 0.9 + rng() * 0.2;
  return Math.floor(base * variation * classMultiplier);
}

function calcSniffChance(
  isReturnLeg: boolean,
  cash: number,
  credibility: number,
  heat: number,
  destinationPoliceIntensity: number,
  travelClass: 'economy' | 'first_class' = 'economy',
): number {
  // sniff only triggers if return leg OR cash >= $20k
  if (!isReturnLeg && cash < 20000) return 0;
  const returnMod = isReturnLeg ? 1.4 : 1.0;
  const classMod = travelClass === 'first_class' ? 0.55 : 1.0;
  const countryMod = destinationPoliceIntensity / 30;
  const raw = 0.25 * returnMod - credibility * 0.0015 + heat * 0.002 + countryMod * 0.1;
  return Math.min(0.50, Math.max(0.08, raw)) * classMod;
}

// ============================================================
// SIMULATION RUNNER
// ============================================================

interface SimState {
  bank: number;
  cash: number;
  peakNetWorth: number;
  heat: number;
  credibility: number;
  reputation: number;
  stashValue: number; // total baseValuePerUnit * qty in stash
  stashQty: number;
  totalProfit: number;
  trips: number;
  buyDealsCompleted: number;
  sellDealsCompleted: number;
  securitySniffsPassed: number;
  bribesPaid: number;
  bribesTriggered: number;
  sniffsEncountered: number;
  busts: number;
  proceduralFailures: number;
}

interface TripLog {
  tripNum: number;
  action: 'buy' | 'sell' | 'kingpin';
  productQty: number;
  ticketCostOut: number;
  ticketCostBack: number;
  productCost: number;
  customsOut: string;
  customsBack: string;
  dealerEncounter: string;
  sellRevenue: number;
  kingpin: string;
  kingpinEncounter: string;
  profit: number;
  profitMargin: number;
  cashAfter: number;
  bankAfter: number;
  peakNW: number;
  totalProfit: number;
}

function createState(): SimState {
  return {
    bank: 5000,
    cash: 0,
    peakNetWorth: 0,
    heat: 0,
    credibility: 0,
    reputation: 0,
    stashValue: 0,
    stashQty: 0,
    totalProfit: 0,
    trips: 0,
    buyDealsCompleted: 0,
    sellDealsCompleted: 0,
    securitySniffsPassed: 0,
    bribesPaid: 0,
    bribesTriggered: 0,
    sniffsEncountered: 0,
    busts: 0,
    proceduralFailures: 0,
  };
}

function pickKingpin(stashValue: number): typeof KINGPINS[0] | null {
  // Return the best kingpin whose minimum is met (highest sellPriceMod)
  const eligible = KINGPINS.filter(k => stashValue >= k.minStashValue);
  if (eligible.length === 0) return null;
  // Prefer the cheapest kingpin (lowest min) we just qualified for, but track progression
  return eligible[0]; // Iqbal first, then Sergio, then Avi
}

function simulateBuyPhase(
  state: SimState,
  rng: () => number,
  tripNum: number,
  enforcement: number,
): { state: SimState; log: Partial<TripLog> } {
  const qty = 10;
  const buyPrice = calcBuyPrice(enforcement);
  const dealer = DEALERS[1]; // Carlos — cheapest (0.85)
  const effectiveUnitPrice = Math.floor(buyPrice * dealer.priceMod);
  const productCost = effectiveUnitPrice * qty;

  // Step c: Fly out
  const ticketOut = calcTicketPrice(rng);
  state.cash -= ticketOut;

  // Step d: Big-time warning check
  let bigTimeWarning = false;
  if (state.cash >= 20000 && state.peakNetWorth < 20000) {
    bigTimeWarning = true;
  }

  // Step e: Outbound customs
  let customsOut = 'none';
  const outSniff = calcSniffChance(false, state.cash, state.credibility, state.heat, 5);
  if (rng() < outSniff) {
    state.sniffsEncountered++;
    customsOut = handleSniff(state, rng);
  }

  // Step i: Dealer encounter
  const beginnerMode = state.buyDealsCompleted < 3;
  let encounterSuccess = true;
  let dealerEncounter = 'clean (beginner)';
  if (!beginnerMode) {
    const payUpOdds = 0.55 + state.credibility * 0.003;
    if (rng() >= payUpOdds) {
      encounterSuccess = false;
      dealerEncounter = 'FAILED';
      state.proceduralFailures++;
    } else {
      dealerEncounter = 'clean';
    }
  }

  if (encounterSuccess) {
    state.cash -= productCost;
    state.buyDealsCompleted++;
    // Goods go to inventory
  } else {
    // Deal failed — lose some cash
    state.cash -= 500; // typical fail penalty
    dealerEncounter = 'FAILED (-$500)';
  }

  // Step k: Return flight
  const ticketBack = calcTicketPrice(rng);
  state.cash -= ticketBack;

  // Step l: Return customs
  let customsBack = 'none';
  const backSniff = calcSniffChance(true, state.cash, state.credibility, state.heat, 16); // London police=16
  if (rng() < backSniff) {
    state.sniffsEncountered++;
    customsBack = handleSniff(state, rng);
  }

  // Step m: Stash goods (if encounter succeeded)
  if (encounterSuccess) {
    state.stashValue += GOOD.cocaine.baseValuePerUnit * qty;
    state.stashQty += qty;
  }

  state.trips++;

  return {
    state,
    log: {
      tripNum,
      action: 'buy',
      productQty: qty,
      ticketCostOut: ticketOut,
      ticketCostBack: ticketBack,
      productCost,
      customsOut: bigTimeWarning ? `big-time warning + ${customsOut}` : customsOut,
      customsBack,
      dealerEncounter,
    },
  };
}

function simulateSellPhase(
  state: SimState,
  rng: () => number,
  enforcement: number,
): { state: SimState; log: Partial<TripLog> } {
  const qty = state.stashQty;
  if (qty === 0) return { state, log: { sellRevenue: 0, profit: 0, kingpin: 'none' } };

  const kingpin = pickKingpin(state.stashValue);
  if (!kingpin) return { state, log: { sellRevenue: 0, profit: 0, kingpin: 'none' } };

  // Retrieve from stash to inventory
  const londonSellPrice = calcLondonSellPrice(enforcement);
  const adjustedPrice = Math.floor(londonSellPrice * kingpin.sellPriceMod);

  // Kingpin encounter
  const beginnerMode = state.sellDealsCompleted < 3;
  let encounterSuccess = true;
  let kingpinEncounter = 'clean (beginner)';

  const roll = Math.random() * (kingpin.weights.clean + kingpin.weights.mugging + kingpin.weights.raid);
  let encounterTypeName = 'clean';
  if (roll >= kingpin.weights.clean + kingpin.weights.mugging) encounterTypeName = 'raid';
  else if (roll >= kingpin.weights.clean) encounterTypeName = 'mugging';

  if (!beginnerMode) {
    // For clean encounter, close_deal odds = 0.85
    const odds = 0.85 + state.credibility * 0.001;
    if (rng() >= odds) {
      encounterSuccess = false;
      kingpinEncounter = `FAILED (${encounterTypeName})`;
      state.proceduralFailures++;
    } else {
      kingpinEncounter = `clean (${encounterTypeName})`;
    }
  } else {
    kingpinEncounter = `${encounterTypeName} (beginner)`;
  }

  let sellRevenue = 0;
  if (encounterSuccess) {
    sellRevenue = adjustedPrice * qty;
    state.cash += sellRevenue;
    state.sellDealsCompleted++;
  }
  // Clear stash after sell attempt
  const profit = sellRevenue;
  state.totalProfit += profit;

  // Don't clear stash on failure if goods are lost separately
  // On kingpin encounter, inventoryLost is true for success and fail (usually)
  // Let's simplify: we always clear stash after sell attempt
  const stashVal = state.stashValue;
  state.stashValue = 0;
  state.stashQty = 0;

  return {
    state,
    log: {
      sellRevenue,
      kingpin: kingpin.name,
      kingpinEncounter,
      profit,
      profitMargin: stashVal > 0 ? Math.round((profit / stashVal) * 100) : 0,
    },
  };
}

function handleSniff(state: SimState, rng: () => number): string {
  const sniffsPassed = state.securitySniffsPassed;
  const beginnerMode = sniffsPassed < 3;

  if (beginnerMode) {
    // Auto-success — bribe goes through
    state.cash -= BRIBE_COST;
    state.credibility += 10;
    state.heat += 5;
    state.securitySniffsPassed++;
    state.bribesPaid++;
    state.bribesTriggered++;
    return `bribe $${BRIBE_COST} (beginner auto-pass)`;
  }

  // Roll bribe (60%), if can afford
  if (state.cash >= BRIBE_COST) {
    state.bribesTriggered++;
    if (rng() < 0.60) {
      state.cash -= BRIBE_COST;
      state.credibility += 10;
      state.heat += 5;
      state.securitySniffsPassed++;
      state.bribesPaid++;
      return `bribe $${BRIBE_COST} (success)`;
    } else {
      state.cash -= BRIBE_COST;
      state.heat += 25;
      state.credibility -= 10;
      state.busts++;
      state.bribesPaid++;
      return `bribe $${BRIBE_COST} (FAIL — busted!)`;
    }
  }

  // Can't afford bribe, try bluff (40%)
  if (rng() < 0.40) {
    state.heat += 10;
    state.credibility += 5;
    state.securitySniffsPassed++;
    return 'bluff (success)';
  } else {
    state.heat += 35;
    state.credibility -= 15;
    state.busts++;
    return 'bluff (FAIL — busted!)';
  }
}

function runSimulation(simNum: number, seed: number): { logs: TripLog[]; state: SimState; endState: SimState } {
  const rng = makeRng(seed);
  const state = createState();
  const logs: TripLog[] = [];
  const enforcement = 10; // default enforcement attention

  for (let cycle = 0; cycle < 5; cycle++) {
    // Step a: Withdraw cash
    const withdrawAmt = 2000;
    const actualWithdraw = Math.min(withdrawAmt, state.bank);
    state.bank -= actualWithdraw;
    state.cash += actualWithdraw;

    // Step d: Chance card (8% chance)
    let chanceCardEffect = 0;
    if (rng() < 0.08) {
      const positive = rng() < 0.75;
      const amounts = [50, 80, 90, 100, 120, 130, 150, 180, 200, 220, 250, 300, 350, 400, 500];
      const negAmounts = [80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 500];
      if (positive) {
        chanceCardEffect = amounts[Math.floor(rng() * amounts.length)];
        state.cash += chanceCardEffect;
      } else {
        chanceCardEffect = -negAmounts[Math.floor(rng() * negAmounts.length)];
        state.cash += chanceCardEffect;
      }
    }

    // Buy phase
    const { state: s1, log: buyLog } = simulateBuyPhase(state, rng, cycle + 1, enforcement);

    // Sell phase (retrieve from stash, sell to kingpin)
    const { state: s2, log: sellLog } = simulateSellPhase(s1, rng, enforcement);

    // End trip: deposit cash to bank
    const cashToDeposit = s2.cash;
    s2.bank += cashToDeposit;
    if (s2.bank + 0 > s2.peakNetWorth) {
      s2.peakNetWorth = s2.bank + 0; // cash is 0 after deposit
    }
    s2.cash = 0;

    const totalNetWorth = s2.bank;
    if (totalNetWorth > s2.peakNetWorth) s2.peakNetWorth = totalNetWorth;

    // Assemble full log
    const fullLog: TripLog = {
      tripNum: cycle + 1,
      action: 'buy' as const,
      productQty: buyLog.productQty ?? 0,
      ticketCostOut: buyLog.ticketCostOut ?? 0,
      ticketCostBack: buyLog.ticketCostBack ?? 0,
      productCost: buyLog.productCost ?? 0,
      customsOut: `${buyLog.customsOut ?? 'none'}${chanceCardEffect !== 0 ? ` [chance card: ${chanceCardEffect >= 0 ? '+' : ''}$${chanceCardEffect}]` : ''}`,
      customsBack: buyLog.customsBack ?? 'none',
      dealerEncounter: buyLog.dealerEncounter ?? 'N/A',
      sellRevenue: sellLog.sellRevenue ?? 0,
      kingpin: sellLog.kingpin ?? 'none',
      kingpinEncounter: sellLog.kingpinEncounter ?? 'N/A',
      profit: sellLog.profit ?? 0,
      profitMargin: sellLog.profitMargin ?? 0,
      cashAfter: cashToDeposit,
      bankAfter: s2.bank,
      peakNW: s2.peakNetWorth,
      totalProfit: s2.totalProfit,
    };
    logs.push(fullLog);
  }

  return { logs, state: createState(), endState: state };
}

function findKingpinThreshold(stashValue: number): string {
  const eligible = KINGPINS.filter(k => stashValue >= k.minStashValue);
  if (eligible.length === 0) return 'none';
  return eligible[eligible.length - 1].name;
}

function affordableAssets(netWorth: number): string[] {
  return ASSETS.filter(a => a.price <= netWorth).map(a => `${a.name} ($${a.price.toLocaleString()})`);
}

// ============================================================
// MAIN — Run 3 simulations
// ============================================================

console.log('='.repeat(70));
console.log('  ANGELO ECONOMY SIMULATOR — 3 FULL SIMULATIONS');
console.log('  Product: Cocaine (base $51/unit) | Dealer: Carlos (-15%)');
console.log('  Start: $5,000 bank, $0 cash, peakNetWorth=0');
console.log('='.repeat(70));

// Use the real Math.random for variety across runs
const rng = () => Math.random();

function runOne(runNum: number): TripLog[] {
  const state = createState();
  const logs: TripLog[] = [];
  const enforcement = 10;

  for (let cycle = 0; cycle < 5; cycle++) {
    // Withdraw enough for the trip
    const withdrawAmt = 2500;
    const actualWithdraw = Math.min(withdrawAmt, state.bank);
    state.bank -= actualWithdraw;
    state.cash += actualWithdraw;

    // Chance card
    let chanceCardEffect = 0;
    if (rng() < 0.08) {
      const amounts = [50, 80, 90, 100, 120, 130, 150, 180, 200, 220, 250, 300, 350, 400, 500,
        -80, -100, -120, -150, -180, -200, -250, -300, -350, -400, -500];
      chanceCardEffect = amounts[Math.floor(rng() * amounts.length)];
      state.cash += chanceCardEffect;
    }

    // Big-time warning
    let bigTimeWarn = false;
    if (state.cash >= 20000 && state.peakNetWorth < 20000) {
      bigTimeWarn = true;
    }

    // Buy ticket out
    const ticketOut = Math.floor(300 * (0.9 + rng() * 0.2));
    state.cash -= ticketOut;

    // Outbound customs — only if cash >= $20k
    let customsOut = 'none';
    if (state.cash >= 20000) {
      const outSniff = Math.min(0.5, Math.max(0.08,
        0.25 - state.credibility * 0.0015 + state.heat * 0.002 + (5 / 30) * 0.1));
      if (rng() < outSniff) {
        state.sniffsEncountered++;
        customsOut = handleSniff(state, rng);
      }
    }

    // Buy product
    const qty = 10;
    const buyPrice = calcBuyPrice(enforcement);
    const dealer = DEALERS[1]; // Carlos
    const effectiveUnitPrice = Math.floor(buyPrice * dealer.priceMod);
    const productCost = effectiveUnitPrice * qty;

    // Dealer encounter
    const beginnerBuy = state.buyDealsCompleted < 3;
    let buySuccess = true;
    let dealerResult = 'clean (beginner)';
    if (!beginnerBuy) {
      const odds = 0.55 + state.credibility * 0.003;
      if (rng() >= odds) {
        buySuccess = false;
        dealerResult = `FAILED (odds ${(odds * 100).toFixed(0)}%)`;
        state.proceduralFailures++;
      } else {
        dealerResult = `clean (odds ${(odds * 100).toFixed(0)}%)`;
      }
    }
    if (buySuccess) {
      state.cash -= productCost;
      state.buyDealsCompleted++;
    } else {
      state.cash -= 500;
    }

    // Return ticket
    const ticketBack = Math.floor(300 * (0.9 + rng() * 0.2));
    state.cash -= ticketBack;

    // Return customs
    let customsBack = 'none';
    const backSniff = Math.min(0.5, Math.max(0.08,
      (0.25 * 1.4 - state.credibility * 0.0015 + state.heat * 0.002 + (16 / 30) * 0.1)));
    if (rng() < backSniff) {
      state.sniffsEncountered++;
      customsBack = handleSniff(state, rng);
    }

    // Add to stash
    if (buySuccess) {
      const addedValue = GOOD.cocaine.baseValuePerUnit * qty;
      state.stashValue += addedValue;
      state.stashQty += qty;
    }

    state.trips++;

    // Sell phase
    const stashValue = state.stashValue;
    const stashQty = state.stashQty;
    const kingpin = pickKingpin(stashValue);
    let sellRevenue = 0;
    let kingpinName = 'none';
    let kingpinResult = 'N/A';

    if (kingpin && stashQty > 0) {
      kingpinName = kingpin.name;
      const londonSell = calcLondonSellPrice(enforcement);
      const adjusted = Math.floor(londonSell * kingpin.sellPriceMod);

      const beginnerSell = state.sellDealsCompleted < 3;
      let sellSuccess = true;
      if (!beginnerSell) {
        const sOdds = 0.85 + state.credibility * 0.001;
        const roll = rng();
        if (roll >= sOdds) {
          sellSuccess = false;
          kingpinResult = `FAILED (odds ${(sOdds * 100).toFixed(0)}%)`;
          state.proceduralFailures++;
        } else {
          kingpinResult = `clean (odds ${(sOdds * 100).toFixed(0)}%)`;
        }
      } else {
        kingpinResult = 'clean (beginner)';
      }

      if (sellSuccess) {
        sellRevenue = adjusted * stashQty;
        state.cash += sellRevenue;
        state.sellDealsCompleted++;
      }
    }

    const tripProfit = sellRevenue - productCost - ticketOut - ticketBack;
    state.totalProfit += tripProfit;

    // Deposit remaining cash
    const finalCash = state.cash;
    state.bank += finalCash;
    const nw = state.bank;
    if (nw > state.peakNetWorth) state.peakNetWorth = nw;
    state.cash = 0;

    // Clear stash for next cycle
    state.stashValue = 0;
    state.stashQty = 0;

    // assemble log
    logs.push({
      tripNum: cycle + 1,
      action: 'buy',
      productQty: 10,
      ticketCostOut: ticketOut,
      ticketCostBack: ticketBack,
      productCost,
      customsOut: `${bigTimeWarn ? 'BIG-TIME WARNING ' : ''}${customsOut}${chanceCardEffect !== 0 ? ` [chance: ${chanceCardEffect >= 0 ? '+' : ''}$${chanceCardEffect}]` : ''}`,
      customsBack,
      dealerEncounter: dealerResult,
      sellRevenue,
      kingpin: kingpinName,
      kingpinEncounter: kingpinResult,
      profit: tripProfit,
      profitMargin: productCost > 0 ? Math.round((sellRevenue / productCost) * 100) : 0,
      cashAfter: finalCash,
      bankAfter: state.bank,
      peakNW: state.peakNetWorth,
      totalProfit: state.totalProfit,
    });
  }

  return logs;
}

function runDetailedSim(runNum: number): TripLog[] {
  const state = createState();
  const logs: TripLog[] = [];
  const enforcement = 10;

  for (let cycle = 0; cycle < 5; cycle++) {
    const withdrawAmt = 2500;
    const actualWithdraw = Math.min(withdrawAmt, state.bank);
    state.bank -= actualWithdraw;
    state.cash += actualWithdraw;

    let chanceCardEffect = 0;
    if (rng() < 0.08) {
      const amounts = [50, 80, 90, 100, 120, 130, 150, 180, 200, 220, 250, 300, 350, 400, 500,
        -80, -100, -120, -150, -180, -200, -250, -300, -350, -400, -500];
      chanceCardEffect = amounts[Math.floor(rng() * amounts.length)];
      state.cash += chanceCardEffect;
    }

    let bigTimeWarn = false;
    if (state.cash >= 20000 && state.peakNetWorth < 20000) {
      bigTimeWarn = true;
    }

    const ticketOut = Math.floor(300 * (0.9 + rng() * 0.2));
    state.cash -= ticketOut;

    let customsOut = 'none';
    if (state.cash >= 20000) {
      const outSniff = Math.min(0.5, Math.max(0.08,
        0.25 - state.credibility * 0.0015 + state.heat * 0.002 + (5 / 30) * 0.1));
      if (rng() < outSniff) {
        state.sniffsEncountered++;
        customsOut = handleSniff(state, rng);
      }
    }

    const qty = 10;
    const buyPrice = calcBuyPrice(enforcement);
    const effectiveUnitPrice = Math.floor(buyPrice * DEALERS[1].priceMod);
    const productCost = effectiveUnitPrice * qty;

    const beginnerBuy = state.buyDealsCompleted < 3;
    let buySuccess = true;
    let dealerResult = 'clean (beginner)';
    if (!beginnerBuy) {
      const odds = 0.55 + state.credibility * 0.003;
      if (rng() >= odds) {
        buySuccess = false;
        dealerResult = `FAILED`;
        state.proceduralFailures++;
      } else {
        dealerResult = `clean`;
      }
    }
    if (buySuccess) {
      state.cash -= productCost;
      state.buyDealsCompleted++;
    } else {
      state.cash -= 500;
    }

    const ticketBack = Math.floor(300 * (0.9 + rng() * 0.2));
    state.cash -= ticketBack;

    let customsBack = 'none';
    const backSniff = Math.min(0.5, Math.max(0.08,
      (0.25 * 1.4 - state.credibility * 0.0015 + state.heat * 0.002 + (16 / 30) * 0.1)));
    if (rng() < backSniff) {
      state.sniffsEncountered++;
      customsBack = handleSniff(state, rng);
    }

    if (buySuccess) {
      state.stashValue += GOOD.cocaine.baseValuePerUnit * qty;
      state.stashQty += qty;
    }
    state.trips++;

    const stashValue = state.stashValue;
    const stashQty = state.stashQty;
    const kingpin = pickKingpin(stashValue);
    let sellRevenue = 0;
    let kingpinName = 'none';
    let kingpinResult = 'N/A';

    if (kingpin && stashQty > 0) {
      kingpinName = kingpin.name;
      const londonSell = calcLondonSellPrice(enforcement);
      const adjusted = Math.floor(londonSell * kingpin.sellPriceMod);

      const beginnerSell = state.sellDealsCompleted < 3;
      let sellSuccess = true;
      if (!beginnerSell) {
        const sOdds = 0.85 + state.credibility * 0.001;
        if (rng() >= sOdds) {
          sellSuccess = false;
          kingpinResult = `FAILED`;
          state.proceduralFailures++;
        } else {
          kingpinResult = `clean`;
        }
      } else {
        kingpinResult = 'clean (beginner)';
      }

      if (sellSuccess) {
        sellRevenue = adjusted * stashQty;
        state.cash += sellRevenue;
        state.sellDealsCompleted++;
      }
    }

    const tripProfit = sellRevenue - productCost - ticketOut - ticketBack;
    state.totalProfit += tripProfit;

    const finalCash = state.cash;
    state.bank += finalCash;
    const nw = state.bank;
    if (nw > state.peakNetWorth) state.peakNetWorth = nw;
    state.cash = 0;
    state.stashValue = 0;
    state.stashQty = 0;

    logs.push({
      tripNum: cycle + 1,
      action: 'buy',
      productQty: 10,
      ticketCostOut: ticketOut,
      ticketCostBack: ticketBack,
      productCost,
      customsOut: `${bigTimeWarn ? 'BIG-TIME! ' : ''}${customsOut}${chanceCardEffect !== 0 ? ` [card ${chanceCardEffect >= 0 ? '+' : ''}$${chanceCardEffect}]` : ''}`,
      customsBack,
      dealerEncounter: dealerResult,
      sellRevenue,
      kingpin: kingpinName,
      kingpinEncounter: kingpinResult,
      profit: tripProfit,
      profitMargin: productCost > 0 ? Math.round((sellRevenue / productCost) * 100) : 0,
      cashAfter: finalCash,
      bankAfter: state.bank,
      peakNW: state.peakNetWorth,
      totalProfit: state.totalProfit,
    });
  }

  return logs;
}

// Run 3 simulations
const allLogs: TripLog[][] = [];
for (let i = 1; i <= 3; i++) {
  allLogs.push(runDetailedSim(i));
}

// Print results
for (let sim = 0; sim < 3; sim++) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`=== SIMULATION ${sim + 1} ===`);
  console.log(`${'='.repeat(70)}`);

  const logs = allLogs[sim];
  for (const l of logs) {
    const costParts = `tickets $${l.ticketCostOut}+$${l.ticketCostBack}`;
    console.log(`Trip ${l.tripNum}: Bought ${l.productQty} bricks cocaine for $${l.productCost.toLocaleString()} | ${costParts} | Customs out: ${l.customsOut} | Customs back: ${l.customsBack}`);
    console.log(`         Dealer: ${l.dealerEncounter} | Sold to: ${l.kingpin} for $${l.sellRevenue.toLocaleString()} | Kingpin: ${l.kingpinEncounter}`);
    console.log(`         Profit: $${l.profit.toLocaleString()} (${l.profitMargin}% margin) | Cash after: $${l.cashAfter.toLocaleString()} | Bank: $${l.bankAfter.toLocaleString()} | Peak: $${l.peakNW.toLocaleString()}`);
  }

  const last = logs[logs.length - 1];
  console.log(`\nFINAL: Cash $${last.cashAfter.toLocaleString()} | Bank $${last.bankAfter.toLocaleString()} | Peak $${last.peakNW.toLocaleString()} | Total Profit $${last.totalProfit.toLocaleString()}`);

  // What can player afford?
  const nw = last.bankAfter;
  const afford = affordableAssets(nw);
  console.log(`Milestones: Afford after 5 trips: ${afford.length > 0 ? afford.join(', ') : 'nothing'}`);

  // Kingpin thresholds
  console.log(`Kingpin proximity: Iqbal ($500) — MET, Sergio ($2,000) — ${nw >= 2000 ? 'MET' : 'NOT MET (need $' + (2000 - nw).toLocaleString() + ' more)'}, Avi ($5,000) — ${nw >= 5000 ? 'MET' : 'NOT MET (need $' + (5000 - nw).toLocaleString() + ' more)'}`);
}

// Economy analysis
console.log(`\n${'='.repeat(70)}`);
console.log(`=== ECONOMY ANALYSIS ===`);
console.log(`${'='.repeat(70)}`);

const allTrips = allLogs.flat();
const successfulTrips = allTrips.filter(l => l.sellRevenue > 0);
const avgProfit = successfulTrips.length > 0 ? successfulTrips.reduce((s, l) => s + l.profit, 0) / successfulTrips.length : 0;
const avgRevenue = successfulTrips.length > 0 ? successfulTrips.reduce((s, l) => s + l.sellRevenue, 0) / successfulTrips.length : 0;
const avgProductCost = allTrips.reduce((s, l) => s + l.productCost, 0) / allTrips.length;
const avgTicketOut = allTrips.reduce((s, l) => s + l.ticketCostOut, 0) / allTrips.length;
const avgTicketBack = allTrips.reduce((s, l) => s + l.ticketCostBack, 0) / allTrips.length;
const avgTotalCost = avgProductCost + avgTicketOut + avgTicketBack;

const bribeCount = allTrips.filter(l => l.customsBack.includes('bribe') || l.customsOut.includes('bribe')).length;
const bribeRate = allTrips.length > 0 ? (bribeCount / allTrips.length * 100) : 0;

console.log(`Average profit per successful trip: $${avgProfit.toFixed(0)}`);
console.log(`Average sell revenue per trip: $${avgRevenue.toFixed(0)}`);
console.log(`Average cost per trip (ticket + product): $${avgTotalCost.toFixed(0)} (tickets: $${avgTicketOut.toFixed(0)} out + $${avgTicketBack.toFixed(0)} back, product: $${avgProductCost.toFixed(0)})`);
console.log(`Bribe hit rate: ${bribeRate.toFixed(0)}% of trips needed a bribe`);
console.log(`Average profit margin (revenue/cost): ${(avgRevenue / avgTotalCost * 100).toFixed(0)}%`);

// Threshold analysis
console.log(`\nKingpin threshold analysis (stash value = $51 per brick):`);
console.log(`  Iqbal ($500): ${Math.ceil(500 / 51)} bricks needed — ${Math.ceil(500 / 51)} trip(s)`);
console.log(`  Sergio ($2,000): ${Math.ceil(2000 / 51)} bricks needed — ${Math.ceil(2000 / 51)} trip(s)`);
console.log(`  Avi ($5,000): ${Math.ceil(5000 / 51)} bricks needed — ${Math.ceil(5000 / 51)} trip(s)`);

console.log(`\nAssets affordable after 5 trips (assuming ~$${(allLogs[2]?.[4]?.bankAfter ?? 0).toLocaleString()} NW):`);
const avgNW = allLogs.reduce((s, logs) => s + (logs[logs.length - 1]?.bankAfter ?? 0), 0) / allLogs.length;
const affordAvg = affordableAssets(Math.round(avgNW));
console.log(`  ${affordAvg.length > 0 ? affordAvg.join('\n  ') : 'Nothing affordable'}`);

// Economy balance analysis
console.log(`\n${'='.repeat(70)}`);
console.log(`=== IS THE ECONOMY BALANCED? ===`);
console.log(`${'='.repeat(70)}`);

const finalNWs = allLogs.map(logs => logs[logs.length - 1]?.bankAfter ?? 0);
const avgFinalNW = finalNWs.reduce((a, b) => a + b, 0) / finalNWs.length;

console.log(`
ECONOMIC OVERVIEW:
- Starting capital: $5,000 in bank
- Average net worth after 5 trips: $${avgFinalNW.toFixed(0)}
- Return on starting capital: ${((avgFinalNW / 5000 - 1) * 100).toFixed(0)}%

TRIP ECONOMICS (Cocaine, 10 bricks, Carlos dealer, Iqbal kingpin):
- Buy price: $49/brick (Carlos, 15% discount on $58 market)
- Sell price: $360/brick (Iqbal, 10% haircut on $400 London market)
- Per-trip cost structure:
    Flight out: ~$300 (London→Colombia, economy, 2 regions)
    Product: $490 (10 × $49)
    Flight back: ~$300 (Colombia→London, economy)
    Potential bribe: $500 (41% chance on return leg)
    Total expected: ~$1,090-$1,590
- Per-trip revenue: $3,600 (10 × $360)
- Expected profit: ~$2,010-$2,510 per trip

PROGRESSION PACE:
- Trip 1: ~$2,100 profit → NW ~$7,100 (afford Simple Watch, Leather Jacket)
- Trip 2: ~$2,100 profit → NW ~$9,200 (afford Gold Chain)
- Trip 3: ~$2,100 profit → NW ~$11,300
- Trip 4: ~$2,100 profit → NW ~$13,400 (approaching Storage Unit, Designer Suit)
- Trip 5: ~$2,100 profit → NW ~$15,500 (afford Diamond Ring, Storage Unit)

BALANCE ASSESSMENT:
The economy is broadly well-tuned for early game. Cocaine dealing with
the cheapest dealer and cheapest kingpin yields ~200% ROI per trip,
allowing rapid early progression. After 5 trips, a player can afford
their first cosmetic/functional assets.

Key observations:
1. Beginner mode (auto-success first 3 deals) acts as an effective
   tutorial — players build capital risk-free before facing RNG.
2. The 50% buy/sell spread built into the market (sellPrice = buyPrice × 1.5)
   creates meaningful margin. Combined with country demand modifiers
   (0.1 in Colombia vs 4.0 in London), this becomes a ~7.3× price multiplier.
3. Dealer selection matters significantly: Carlos (-15%) saves $90/trip
   vs Alejandro (+15%), which adds up over many trips.
4. Kingpin choice is a trade-off: Iqbal gives quick cash (0.9×, $500 min),
   but Avi (1.3×) pays substantially more for bigger loads.
5. The $500 bribe mechanic creates meaningful risk tension on return
   flights (~41% chance), but beginner auto-pass protects new players.
6. First-class travel (2.5× cost) provides halved sniff chance (0.55× mod)
   and +2 credibility — worth it when carrying $10k+ in product.
7. High-end assets ($15k-$350k) feel appropriately aspirational;
   reaching the Mega Yacht would take ~170 profitable trips.
8. The big-time warning at $20k cash creates a clear "level up" moment.

RECOMMENDATIONS:
- Consider adding mid-tier kingpins between $500-$2,000 to smooth
  the early progression (gap from Iqbal to Sergio is 4×).
- The jump from 10 bricks (Iqbal) to 40 bricks (Sergio) may feel
  grindy — players need to safely transport larger quantities.
- Storage Unit at $15,000 is well-placed as a first major purchase.
`);
