import { useState } from 'react';
import type { GameState, GameAction, TravelClass } from '../../core';
import { getCountry, getLocationLabel, getTicketCost } from '../../core';
import { audioManager } from '../../audio';

interface TravelPanelProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

const ORIGIN_COUNTRY = 'london';

export function TravelPanel({ state, dispatch }: TravelPanelProps) {
  const [selectedClass, setSelectedClass] = useState<TravelClass>('economy');
  const currentCountry = getCountry(state.player.currentCountryId)!;
  const headingToAirport = state.headingToAirport;
  const productSelected = state.selectedProductId !== null;
  const selectedProductName = productSelected ? state.goods.find(g => g.id === state.selectedProductId)?.name : null;

  return (
    <div className="border border-retro-border bg-retro-panel p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3 border-b border-retro-border pb-1">
        <div className="text-retro-accent text-xs uppercase tracking-widest glow-text">
          Destinations
        </div>
        {headingToAirport && (
          <button
            onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'CANCEL_AIRPORT' }); }}
            className="touch-target text-[9px] border border-retro-border px-1.5 py-0.5 hover:bg-[#222] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="text-xs text-gray-400 mb-3">
        Currently in: <span className="text-retro-text font-bold">{getLocationLabel(currentCountry)}</span>
        <div className="text-[10px] text-gray-600 mt-0.5">{currentCountry.region}</div>
      </div>

      {/* Product selection gate */}
      {!productSelected && !headingToAirport && (
        <div className="text-[10px] text-orange-400 mb-3 p-2 border border-orange-400/30 bg-[#1a0a00]">
          Select a product from the Market panel to choose a destination.
        </div>
      )}
      {productSelected && selectedProductName && (
        <div className="text-[10px] text-green-500 mb-3 p-2 border border-green-500/30 bg-[#0a1a0a]">
          Buying: {selectedProductName} — choose a destination to fly to.
        </div>
      )}

      {/* Flight class toggle */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => { audioManager.playSfx('click'); setSelectedClass('economy'); }}
          className={`touch-target flex-1 px-2 py-1 text-[10px] border transition-colors ${
            selectedClass === 'economy'
              ? 'border-retro-accent text-retro-accent bg-[#1a1a1a]'
              : 'border-retro-border text-gray-500 bg-[#111] hover:bg-[#222]'
          }`}
        >Economy</button>
        <button
          onClick={() => { audioManager.playSfx('click'); setSelectedClass('first_class'); }}
          className={`touch-target flex-1 px-2 py-1 text-[10px] border transition-colors ${
            selectedClass === 'first_class'
              ? 'border-retro-accent text-retro-accent bg-[#1a1a1a]'
              : 'border-retro-border text-gray-500 bg-[#111] hover:bg-[#222]'
          }`}
        >First Class</button>
      </div>

      {/* Destinations list — taller to show partial next option for scroll affordance */}
      <div className="space-y-1.5 mb-4 overflow-y-auto max-h-[220px]" style={{ scrollbarWidth: 'thin' }}>
        {state.world.filter(c => c.id !== ORIGIN_COUNTRY).map((country) => {
          const isCurrent = country.id === state.player.currentCountryId;
          const econPrice = getTicketCost(getCountry(state.player.currentCountryId)!, country, 'economy');
          const firstPrice = getTicketCost(getCountry(state.player.currentCountryId)!, country, 'first_class');
          const ticketPrice = selectedClass === 'first_class' ? firstPrice : econPrice;
          const canGo = !isCurrent && productSelected && state.player.cash >= ticketPrice;

          return (
            <button
              key={country.id}
              onClick={() => {
                if (canGo) audioManager.playSfx('click');
                dispatch({ type: 'CONFIRM_FLIGHT', toCountryId: country.id, travelClass: selectedClass });
              }}
              disabled={!canGo || isCurrent}
              className={`touch-target w-full text-left border-2 px-4 py-3 text-xs transition-colors ${
                isCurrent
                  ? 'border-retro-accent bg-[#1a1a1a] text-gray-500 cursor-default border-glow'
                  : canGo
                    ? 'border-retro-border bg-[#111] hover:bg-[#222] cursor-pointer'
                    : 'border-retro-border bg-[#111] text-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={isCurrent ? 'text-retro-accent font-bold' : ''}>
                  {getLocationLabel(country)}
                </span>
                <span className="text-gray-500 text-[10px]">{country.region}</span>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-gray-500">
                  Police: {Math.round((country.policeIntensity / 30) * 100)}%
                </span>
                <span className="text-[10px] text-retro-accent font-bold">
                  {`$${selectedClass === 'first_class' ? firstPrice : econPrice}`}
                </span>
              </div>
              {/* Show both class prices for reference */}
              <div className="flex justify-between mt-1 text-[9px] text-gray-600">
                <span>Econ {econPrice}</span>
                <span>First {firstPrice}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
