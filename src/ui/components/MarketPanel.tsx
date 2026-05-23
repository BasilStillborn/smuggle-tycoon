import type { GameState, GameAction } from '../../core';
import { getCountry, getLocationLabel } from '../../core';
import { audioManager } from '../../audio';

interface MarketPanelProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

function getBestLocation(goodId: string): string {
  const locs: Record<string, string> = {
    cocaine: 'Medellín, Colombia',
    heroin: 'Kabul, Afghanistan',
    hashish: 'Amsterdam, Netherlands',
    weed: 'Amsterdam, Netherlands',
    meth: 'Barcelona, Spain',
    ecstasy: 'Barcelona, Spain',
  };
  return locs[goodId] ?? '';
}

export function MarketPanel({ state, dispatch }: MarketPanelProps) {
  const country = getCountry(state.player.currentCountryId)!;

  return (
    <div className="border border-retro-border bg-retro-panel p-3 h-full">
      <div className="flex items-center justify-between mb-3 border-b border-retro-border pb-1">
        <div className="text-retro-accent text-xs uppercase tracking-widest glow-text">
          Market Prices — {getLocationLabel(country)}
        </div>
        <div className="text-[10px] text-gray-500">{state.currentMarketPrices.length} goods</div>
      </div>

      {/* Action bar */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'VIEW_MARKET' }); }} className="touch-target flex-1 border border-retro-border bg-[#111] hover:bg-[#222] px-3 py-2 text-xs transition-colors">Refresh Prices</button>
        <button onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'WAIT' }); }} className="touch-target flex-1 border border-retro-border bg-[#111] hover:bg-[#222] px-3 py-2 text-xs transition-colors">Lie Low</button>
      </div>

      {/* Goods cards — clickable for product selection */}
      <div className="space-y-2">
        {state.currentMarketPrices.map((price) => {
          const g = state.goods.find((x) => x.id === price.goodId);
          const bestLoc = g ? getBestLocation(g.id) : '';
          const isSelected = state.selectedProductId === price.goodId;
          return (
            <button key={price.goodId} onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'SELECT_PRODUCT', goodId: isSelected ? null : price.goodId }); }}
              className={`touch-target w-full text-left border px-3 py-2 text-xs transition-colors ${
                isSelected
                  ? 'border-retro-accent bg-[#1a1a1a] border-glow'
                  : 'border-retro-border bg-[#0a0a0a] hover:bg-[#151515]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-200">{price.goodName}</span>
                <span className="text-[10px] text-gray-500">{g?.unitOfMeasure ?? ''}</span>
              </div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">Dealer: <span className="text-green-400">${price.buyPrice}</span>/{g?.unitOfMeasure ?? ''}</span>
                <span className={`text-gray-500`}>Retail: <span className="text-green-400">${price.sellPrice}</span>/{g?.unitOfMeasure ?? ''}</span>
                <span className={`${price.demand >= 70 ? 'text-green-400' : price.demand >= 40 ? 'text-gray-400' : 'text-red-400'}`}>Demand: {price.demand}%</span>
              </div>
              {bestLoc && <div className="text-[9px] text-retro-accent italic leading-tight">Best source: {bestLoc}</div>}
              {isSelected && <div className="text-[9px] text-green-500 mt-0.5">— Selected — ready to book a flight</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
