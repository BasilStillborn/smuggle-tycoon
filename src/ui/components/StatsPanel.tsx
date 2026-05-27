import { useState } from 'react';
import type { GameState, GameAction } from '../../core';
import { getCountry, getHeatLevel, getUsedCapacity, getRemainingCapacity, getInventoryValue, getQuantityRiskMultiplier, MAX_HEAT, getPlayerVisualTier, getOwnedAssets, getLocationLabel, getActiveOperationalBenefits } from '../../core';
import { HeatMeter } from './HeatMeter';

interface StatsPanelProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export function StatsPanel({ state, dispatch }: StatsPanelProps) {
  const [showInventory, setShowInventory] = useState(false);
  const country = getCountry(state.player.currentCountryId)!;
  const heatLevel = getHeatLevel(state.player);
  const used = getUsedCapacity(state.player);
  const remaining = getRemainingCapacity(state.player);
  const stashWeight = state.player.stash.reduce((sum, item) => {
    const g = state.goods.find(x => x.id === item.goodId);
    return sum + (g ? g.weight * item.quantity : 0);
  }, 0);
  const totalWeight = used + stashWeight;
  const invValue = getInventoryValue(state.player, state.currentMarketPrices);
  const stashValue = state.player.stash.reduce((sum, item) => {
    const g = state.goods.find(x => x.id === item.goodId);
    return sum + (g ? g.baseValuePerUnit * item.quantity : 0);
  }, 0);
  const totalValue = invValue + stashValue;
  const maxQty = state.player.inventory.reduce((m, i) => (i.quantity > m ? i.quantity : m), 0);
  const qRisk = getQuantityRiskMultiplier(Math.max(1, maxQty), 1);

  const riskColor = qRisk > 3 ? 'text-red-500' : qRisk > 2 ? 'text-orange-400' : 'text-gray-400';

  const ownedAssets = getOwnedAssets(state.player);

  const cashColor = state.player.cash < 0 ? 'text-retro-danger' : 'text-retro-success';
  const cashGlow = state.player.cash < -500 ? 'animate-pulse' : '';

  return (
    <div className="border border-retro-border bg-retro-panel p-3">
      <div className="text-retro-accent text-xs uppercase tracking-widest mb-3 border-b border-retro-border pb-1 glow-text">
        Agent Status
      </div>

      {/* Owned Assets window */}
      <div className="mb-3 border border-retro-border bg-[#0a0a0a] p-2">
        <div className="text-[10px] text-retro-accent uppercase tracking-widest mb-2">
          Owned Assets
        </div>
        {ownedAssets.length === 0 ? (
          <div className="text-[10px] text-gray-600 italic">None — buy at the Asset Shop</div>
        ) : (
          <div className="space-y-1 max-h-32 overflow-y-auto ui-scrollbar">
            {ownedAssets.map((asset) => (
              <div key={asset.id} className="flex justify-between text-[10px]">
                <span className="text-gray-300 truncate mr-2">{asset.name}</span>
                <span className="text-retro-accent shrink-0">+{asset.creditValue}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Heat Meter */}
      <button
        type="button"
        onClick={() => { if (!state.heatTutorialShown) dispatch({ type: 'HEAT_TUTORIAL' }); }}
        className="mb-3 p-2 border border-retro-border bg-[#0a0a0a] w-full text-left hover:bg-[#101010] transition-colors"
      >
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>HEAT</span>
          <span className={state.player.heat >= 50 ? 'text-orange-400' : ''}>{heatLevel.toUpperCase()}</span>
        </div>
        <HeatMeter heat={state.player.heat} maxHeat={MAX_HEAT} />
      </button>

      {/* Holdings — click to expand, shows inventory + stash */}
      <div className="mb-3 p-2 border border-retro-border bg-[#0a0a0a]">
        <button
          onClick={() => { if (!state.holdingsTutorialShown) { dispatch({ type: 'HOLDINGS_TUTORIAL' }); } setShowInventory(!showInventory); }}
          className="touch-target w-full flex justify-between text-[10px] text-gray-500 hover:text-gray-300 transition-colors text-left"
        >
          <span>HOLDINGS {showInventory ? '▼' : '▶'}</span>
          <span>{used.toFixed(3)}/{state.player.inventoryCapacity}kg</span>
        </button>
        {showInventory && (
        <>
        <div className="text-[9px] text-gray-600 mb-1 mt-2 space-y-0.5">
          <div>Available: {remaining.toFixed(3)}kg</div>
          <div>Est. value: <span className="text-retro-success">${totalValue.toLocaleString()}</span></div>
          <div>Risk: <span className={riskColor}>x{qRisk.toFixed(1)}</span></div>
        </div>
        {state.player.inventory.length === 0 && state.player.stash.length === 0 ? (
          <div className="text-[9px] text-gray-600 italic">You're carrying nothing, Angelo. Nothing at all.</div>
        ) : (
          <div className="space-y-0.5 max-h-20 overflow-y-auto ui-scrollbar">
            {state.player.inventory.map((item) => {
              const g = state.goods.find((x) => x.id === item.goodId);
              return (
                <div key={item.goodId} className="flex justify-between text-[9px]">
                  <span className="text-green-400">{g?.name ?? item.goodId}</span>
                  <span className="text-gray-400">{item.quantity}x</span>
                </div>
              );
            })}
            {state.player.stash.length > 0 && (
              <div className="text-[8px] text-gray-600 border-t border-retro-border pt-0.5 mt-0.5">STASHED — {stashWeight.toFixed(1)}/{state.player.stashCapacity}kg</div>
            )}
            {state.player.stash.map((item) => {
              const g = state.goods.find((x) => x.id === item.goodId);
              return (
                <div key={'stash-' + item.goodId} className="flex justify-between text-[9px]">
                  <span className="text-gray-500">{g?.name ?? item.goodId}</span>
                  <span className="text-gray-600">{item.quantity}x</span>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </div>

      {/* Stats list — compact */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between border-b border-retro-border border-dashed pb-0.5">
          <span className="text-gray-400">Location</span>
          <span className="text-[10px]">{getLocationLabel(country)}</span>
        </div>
        <div className="flex justify-between border-b border-retro-border border-dashed pb-0.5">
          <span className="text-gray-400">Turn</span>
          <span>{state.turn}</span>
        </div>
        <div className="flex justify-between border-b border-retro-border border-dashed pb-0.5">
          <span className="text-gray-400">Bank</span>
          <span className="text-retro-success text-[10px]">${state.player.bank.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b border-retro-border border-dashed pb-0.5">
          <span className="text-gray-400">Cash</span>
          <span className={`${cashColor} ${cashGlow} text-[10px]`}>${state.player.cash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b border-retro-border border-dashed pb-0.5">
          <span className="text-gray-400">Credibility</span>
          <span className="text-[10px]">{state.player.credibility}/100</span>
        </div>
        <div className="flex justify-between border-b border-retro-border border-dashed pb-0.5">
          <span className="text-gray-400">Reputation</span>
          <span className="text-[10px]">{state.player.reputation}/100</span>
        </div>
        <div className="flex justify-between border-b border-retro-border border-dashed pb-0.5">
          <span className="text-gray-400">Trips</span>
          <span className="text-[10px]">{state.player.totalTrips}</span>
        </div>
        <div className="flex justify-between border-b border-retro-border border-dashed pb-0.5">
          <span className="text-gray-400">Busts</span>
          <span className="text-retro-danger text-[10px]">{state.player.totalBusts}</span>
        </div>
      </div>

      {/* Operational Benefits — inline compact */}
      {(() => {
        const ops = getActiveOperationalBenefits(state.player);
        const hasAny = ops.inspectionReduction > 0 || ops.bustReduction > 0 || ops.fineReduction > 0 || ops.heatDecayBonus > 0;
        if (!hasAny) return null;
        return (
          <div className="mt-1 text-[8px] text-gray-600">
            Benefits: [
            {ops.inspectionReduction > 0 && <span> Inspect -{(ops.inspectionReduction * 100).toFixed(0)}%</span>}
            {ops.bustReduction > 0 && <span> Bust -{(ops.bustReduction * 100).toFixed(0)}%</span>}
            {ops.heatDecayBonus > 0 && <span> Decay +{(ops.heatDecayBonus * 100).toFixed(0)}%</span>}
            {ops.fineReduction > 0 && <span> Fine -{(ops.fineReduction * 100).toFixed(0)}%</span>}
            ]
          </div>
        );
      })()}

      {/* Contacts */}
      {state.player.unlockedContacts.length > 0 && (
        <div className="mt-1 text-[9px] text-purple-400/60">
          Contacts: {state.player.unlockedContacts.join(', ')}
        </div>
      )}
    </div>
  );
}
