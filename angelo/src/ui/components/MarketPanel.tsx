import React from 'react';
import type { GameState, GameAction } from '../../core';
import { getCountry, getLocationLabel, KINGPIN_POOL } from '../../core';
import { audioManager } from '../../audio';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
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

export const MarketPanel: React.FC<Props> = ({ state, dispatch }) => {
  const country = getCountry(state.player.currentCountryId)!;
  const atHome = state.player.currentCountryId === 'london';

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 className="page-title">Market</h2>
        <p className="page-subtitle">{getLocationLabel(country)} · {state.currentMarketPrices.length} goods</p>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1, fontSize: 14 }}
          onClick={() => {
            audioManager.playSfx('click');
            dispatch({ type: state.marketRefreshTutorialShown ? 'VIEW_MARKET' : 'MARKET_REFRESH_TUTORIAL' });
          }}
        >
          Refresh Prices
        </button>
        <button
          className="btn btn-secondary"
          style={{ flex: 1, fontSize: 14 }}
          onClick={() => {
            audioManager.playSfx('click');
            dispatch({ type: state.lieLowTutorialShown ? 'WAIT' : 'LIE_LOW_TUTORIAL' });
          }}
        >
          Lie Low
        </button>
      </div>

      {/* Goods list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state.currentMarketPrices.map((price) => {
          const g = state.goods.find((x) => x.id === price.goodId);
          const bestLoc = g ? getBestLocation(g.id) : '';
          const isSelected = state.selectedProductId === price.goodId;
          const buyers = KINGPIN_POOL.filter(k => k.buys.includes(price.goodId));

          return (
            <div
              key={price.goodId}
              className={`card-highlight${isSelected ? ' card-selected' : ''}`}
              style={{
                padding: '14px 16px',
                cursor: 'pointer',
              }}
              onClick={() => {
                audioManager.playSfx('click');
                dispatch({ type: 'SELECT_PRODUCT', goodId: (isSelected && atHome) ? null : price.goodId });
              }}
            >
              {/* Top row: name + unit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                  {price.goodName}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 6 }}>
                  {g?.unitOfMeasure ?? ''}
                </span>
              </div>

              {/* Price row */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  Dealer: <span style={{ color: 'var(--success)', fontWeight: 600 }}>${price.buyPrice}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  Retail: <span style={{ color: 'var(--success)', fontWeight: 600 }}>${price.sellPrice}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  Demand:{' '}
                  <span
                    style={{
                      fontWeight: 600,
                      color: price.demand >= 70 ? 'var(--success)' : price.demand >= 40 ? 'var(--text)' : 'var(--danger)',
                    }}
                  >
                    {price.demand}%
                  </span>
                </div>
              </div>

              {/* Buyers */}
              {buyers.length > 0 ? (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                  Buys: {buyers.map(k => `${k.name} ($${(k.minStashValue / 1000).toFixed(0)}K min)`).join(', ')}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 2 }}>No London buyers for this product</div>
              )}

              {/* Best source */}
              {bestLoc && (
                <div style={{ fontSize: 11, color: 'var(--accent)', fontStyle: 'italic' }}>Best source: {bestLoc}</div>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--success)',
                    borderTop: '1px solid var(--accent-dim)',
                    paddingTop: 8,
                  }}
                >
                  {atHome ? 'Selected — ready to book a flight' : 'Selected — selling on return'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
