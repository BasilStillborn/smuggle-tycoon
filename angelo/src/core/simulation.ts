import { createGameState, gameReducer, getStatusReport } from './game-engine';
import { getGoodQuantity } from './inventory';

function runSimulation() {
  const log: string[] = [];
  const out = (msg?: string) => { const line = msg ?? ''; log.push(line); console.log(line); };

  out('=== ANGELO: THE CHRONICLES OF CRIME — ENGINE SIMULATION ===\n');

  out('[1] INITIALIZING GAME STATE');
  let state = createGameState();
  out(`  Bank: $${state.player.bank}`);
  out(`  Cash on hand: $${state.player.cash}`);
  out(`  Starting location: ${state.player.currentCountryId}`);
  out(`  Inventory capacity: ${state.player.inventoryCapacity}kg`);
  out(`  Director: Tension=$${state.director.tension} Boredom=${state.director.boredom} Attn=${state.director.enforcementAttention}\n`);

  out('[2] STARTING FIRST TRIP (Withdraw $2,500)');
  state = gameReducer(state, { type: 'START_TRIP', amount: 2500 });
  out(`  $${state.lastEventMessage}`);
  out(`  Bank: $${state.player.bank} — Cash: ${state.player.cash}\n`);

  out('[3] VIEWING MARKET PRICES');
  state = gameReducer(state, { type: 'VIEW_MARKET' });
  const priceLines = state.lastEventMessage.split('\n');
  priceLines.forEach(l => out(`  $${l}`));
  out();

  out('[4] BUYING HASHISH (entry-level good)');
  const hashishPrice = state.currentMarketPrices.find(p => p.goodId === 'hashish')!;
  out(`  Hashish buy price: $${hashishPrice.buyPrice}/bundle`);
  const maxUnits = Math.min(20, Math.floor(state.player.cash / hashishPrice.buyPrice));
  const qty = Math.max(1, maxUnits);
  if (qty >= 1) {
    const cashBefore = state.player.cash;
    state = gameReducer(state, { type: 'BUY', goodId: 'hashish', quantity: qty });
    out(`  $${state.lastEventMessage}`);
    out(`  Cash: $${cashBefore} — ${state.player.cash}`);
  }
  out();

  out('[5] TRAVELING TO NETHERLANDS');
  const cashBeforeTravel = state.player.cash;
  state = gameReducer(state, { type: 'TRAVEL', toCountryId: 'netherlands', travelClass: 'economy' });
  out(`  $${state.lastEventMessage}`);
  out(`  Cash: $${cashBeforeTravel} — ${state.player.cash}`);
  out(`  Location: ${state.player.currentCountryId}`);
  if (state.pendingEvent) {
    out(`  ** SECURITY SNIFF TRIGGERED: $${state.pendingEvent.title}`);
  }
  out();

  out('[6] VIEWING NEW MARKET');
  state = gameReducer(state, { type: 'VIEW_MARKET' });
  const newPriceLines = state.lastEventMessage.split('\n');
  newPriceLines.forEach(l => out(`  $${l}`));
  out();

  out('[7] SELLING GOODS');
  const cashBeforeSell = state.player.cash;
  const sellHashish = state.currentMarketPrices.find(p => p.goodId === 'hashish')!;
  if (sellHashish) {
    const owned = getGoodQuantity(state.player, 'hashish');
    if (owned > 0) {
      state = gameReducer(state, { type: 'SELL', goodId: 'hashish', quantity: owned });
      out(`  $${state.lastEventMessage}`);
    } else {
      out(`  No hashish to sell.`);
    }
  }
  out(`  Cash: $${cashBeforeSell} — ${state.player.cash}\n`);

  out('[8] RETURNING TO BASE');
  state = gameReducer(state, { type: 'END_TRIP' });
  out(`  $${state.lastEventMessage}`);
  out(`  Bank: $${state.player.bank}  Cash: ${state.player.cash}\n`);

  out('[9] FINAL STATUS REPORT');
  out(getStatusReport(state));
  out();

  out('=== SIMULATION COMPLETE ===');
  out(`Final bank: $${state.player.bank}`);
  out(`Total turns: $${state.turn}`);

  return log;
}

runSimulation();
