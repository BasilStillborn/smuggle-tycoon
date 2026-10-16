import type { GameState } from '../../core';
import { getUsedCapacity, getOwnedAssets } from '../../core';
import { getSafehouseProgress } from '../visual/SafehouseState';
import { getCombinedVisuals, type VisualStateData } from '../visual/VisualState';
import { getScene } from '../visual/scenes';
import { getInventoryValue } from '../../core';

interface Props {
  state: GameState;
}

export function HubInfoWindow({ state }: Props) {
  const invValue = getInventoryValue(state.player, state.currentMarketPrices);
  const ownedAssets = getOwnedAssets(state.player);

  const visualData: VisualStateData = {
    cash: state.player.cash,
    inventoryValue: invValue,
    peakNetWorth: state.player.peakNetWorth,
    reputation: state.player.reputation,
    heat: state.player.heat,
    hasFunctionalAsset: ownedAssets.some((a) => a.class === 'functional'),
  };
  const visuals = getCombinedVisuals(visualData);
  const scene = getScene(visuals.wealth, visuals.fame);
  const safehouse = getSafehouseProgress(state.player.cash + state.player.bank, state.safehouseTier);
  const usedCapacity = getUsedCapacity(state.player);

  return (
    <div className="infowindow">
      <div className="infowindow__scene">
        <div className="infowindow__scene-name">{scene.name}</div>
        <div className="infowindow__scene-tags">
          <span>{visuals.wealth}</span>
          <span className="dot">·</span>
          <span>{visuals.fame}</span>
        </div>
      </div>

      <div className="infowindow__row">
        <span className="infowindow__key">Safehouse</span>
        <span className="infowindow__val">{safehouse.current.name}</span>
      </div>
      {safehouse.next && (
        <div className="infowindow__progress">
          <div className="infowindow__progress-track">
            <div className="infowindow__progress-fill" style={{ width: `${Math.round(safehouse.progress * 100)}%` }} />
          </div>
          <div className="infowindow__progress-labels">
            <span>{Math.round(safehouse.progress * 100)}% to {safehouse.next.name}</span>
            <span>${Math.max(0, safehouse.next.advanceAt - (state.player.cash + state.player.bank)).toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="infowindow__row">
        <span className="infowindow__key">Holdings</span>
        <span className="infowindow__val">
          {state.player.inventory.length + state.player.stash.length === 0
            ? 'Empty'
            : `${usedCapacity.toFixed(1)}kg · ${state.player.inventory.length + state.player.stash.length} item(s)`}
        </span>
      </div>

      <div className="infowindow__row">
        <span className="infowindow__key">Trips</span>
        <span className="infowindow__val">
          {state.player.totalTrips}
          {state.player.totalBusts > 0 && <span className="danger"> · {state.player.totalBusts} bust(s)</span>}
        </span>
      </div>
    </div>
  );
}
