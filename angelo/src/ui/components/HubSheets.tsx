import type { GameState, GameAction } from '../../core';
import { STATUS_ASSETS, getOwnedAssets, getEffectiveRequiredNetWorth } from '../../core';
import { SAFEHOUSE_LEVELS, getSafehouseProgress } from '../visual/SafehouseState';
import { Tap } from './Tap';

interface SheetProps {
  state: GameState;
  send: (action: GameAction) => void;
}

export function SafehouseSheet({ state }: SheetProps) {
  const netWorth = state.player.cash + state.player.bank;
  const progress = getSafehouseProgress(netWorth, state.safehouseTier);

  return (
    <div className="sheet__content">
      <div className="sheet__intro">
        <div className="sheet__intro-title">{progress.current.name}</div>
        <div className="sheet__intro-sub">{progress.current.description}</div>
      </div>
      {progress.next && (
        <div className="infowindow__progress">
          <div className="infowindow__progress-track">
            <div className="infowindow__progress-fill" style={{ width: `${Math.round(progress.progress * 100)}%` }} />
          </div>
          <div className="infowindow__progress-labels">
            <span>{Math.round(progress.progress * 100)}% to {progress.next.name}</span>
            <span>${Math.max(0, progress.next.advanceAt - netWorth).toLocaleString()} needed</span>
          </div>
        </div>
      )}
      <div className="sheet__list">
        {SAFEHOUSE_LEVELS.map((level) => {
          const current = level.level === state.safehouseTier;
          return (
            <div key={level.level} className={`sheet__row${current ? ' is-current' : ''}`}>
              <div>
                <div className="sheet__row-name">{level.name}</div>
                <div className="sheet__row-sub">Stash {level.stashCapacity}kg · Carry {level.inventoryCapacity}kg</div>
              </div>
              <div className="sheet__row-meta">{current ? 'Current' : `$${level.advanceAt.toLocaleString()}`}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AssetsSheet({ state, send }: SheetProps) {
  const owned = new Set(getOwnedAssets(state.player).map((a) => a.id));
  const netWorth = state.player.cash + state.player.bank;
  const peak = state.player.peakNetWorth;

  return (
    <div className="sheet__content">
      <div className="sheet__intro">
        <div className="sheet__intro-title">Assets</div>
        <div className="sheet__intro-sub">Status, clout and capability. Buy with banked money.</div>
      </div>
      <div className="sheet__list">
        {STATUS_ASSETS.filter((a) => a.category !== 'storage').map((asset) => {
          const isOwned = owned.has(asset.id);
          const needNw = getEffectiveRequiredNetWorth(asset);
          const locked = !isOwned && (netWorth < needNw || peak < needNw);
          const affordable = state.player.bank >= asset.price;
          return (
            <div key={asset.id} className="sheet__row">
              <div>
                <div className="sheet__row-name">{asset.name}</div>
                <div className="sheet__row-sub">{asset.description}</div>
              </div>
              {isOwned ? (
                <Tap className="btn btn-secondary sheet__action" haptic="warning" onTap={() => send({ type: 'SELL_ASSET', assetId: asset.id })}>
                  Sell
                </Tap>
              ) : (
                <Tap
                  className="btn btn-secondary sheet__action"
                  disabled={locked || !affordable}
                  haptic="success"
                  onTap={() => send({ type: 'BUY_ASSET', assetId: asset.id })}
                >
                  {locked ? `$${needNw.toLocaleString()}+` : `$${asset.price.toLocaleString()}`}
                </Tap>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
