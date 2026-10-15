import React, { useMemo, useState } from 'react';
import type { GameState, GameAction } from '../../core';
import {
  getCountry,
  getHeatLevel,
  getUsedCapacity,
  getRemainingCapacity,
  getInventoryValue,
  getQuantityRiskMultiplier,
  MAX_HEAT,
  getOwnedAssets,
  getLocationLabel,
  getActiveOperationalBenefits,
} from '../../core';
import { getSafehouseProgress } from '../visual/SafehouseState';
import { getCombinedVisuals, type VisualStateData } from '../visual/VisualState';
import { getScene, type WealthTier, type FameTier } from '../visual/scenes';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onOpenBank: () => void;
  onOpenBriefing: () => void;
  onEndRun: () => void;
}

export const DashboardPanel: React.FC<Props> = ({ state, dispatch, onOpenBank, onOpenBriefing, onEndRun }) => {
  const [showHoldings, setShowHoldings] = useState(false);

  const invValue = getInventoryValue(state.player, state.currentMarketPrices);
  const netWorth = state.player.cash + state.player.bank + invValue;
  const heatLevel = getHeatLevel(state.player);
  const country = getCountry(state.player.currentCountryId)!;
  const safehouse = getSafehouseProgress(state.player.cash + state.player.bank, state.safehouseTier);
  const ownedAssets = getOwnedAssets(state.player);
  const recentLog = state.gameLog.slice(-6);

  const visualData: VisualStateData = {
    cash: state.player.cash,
    inventoryValue: invValue,
    peakNetWorth: state.player.peakNetWorth,
    reputation: state.player.reputation,
    heat: state.player.heat,
    hasFunctionalAsset: ownedAssets.some(a => a.class === 'functional'),
  };
  const visuals = getCombinedVisuals(visualData);
  const scene = getScene(visuals.wealth, visuals.fame);

  const statCards = [
    { label: 'Cash', value: `$${state.player.cash.toLocaleString()}`, color: state.player.cash < 0 ? 'var(--danger)' : 'var(--accent)' },
    { label: 'Bank', value: `$${state.player.bank.toLocaleString()}`, color: state.player.bank <= 0 ? 'var(--danger)' : 'var(--success)' },
    { label: 'Net Worth', value: `$${netWorth.toLocaleString()}`, color: 'var(--accent)' },
    { label: 'Turn', value: String(state.turn), color: 'var(--text)' },
    { label: 'Credibility', value: `${state.player.credibility}/100`, color: state.player.credibility >= 50 ? 'var(--accent)' : 'var(--text-muted)' },
    { label: 'Reputation', value: `${state.player.reputation}/100`, color: state.player.reputation >= 50 ? 'var(--accent)' : 'var(--text-muted)' },
    { label: 'Trips', value: String(state.player.totalTrips), color: 'var(--text)' },
    { label: 'Busts', value: String(state.player.totalBusts), color: state.player.totalBusts > 0 ? 'var(--danger)' : 'var(--text-muted)' },
  ];

  return (
    <div className="page" style={{ paddingBottom: 16 }}>
      {/* Scene-based ambient header */}
      <div
        style={{
          padding: '16px 0 8px',
          marginBottom: 12,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
          {scene.name} · {getLocationLabel(country)}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>◆ Angelo</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>
            {visuals.wealth} · {visuals.fame}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(var(--stat-min, 120px), 1fr))',
          gap: 8,
          marginBottom: 12,
        }}
      >
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Heat bar */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Heat</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: state.player.heat >= 50 ? 'var(--danger)' : state.player.heat >= 25 ? 'var(--accent)' : 'var(--text-muted)' }}>
            {heatLevel.toUpperCase()} · {state.player.heat}%
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(state.player.heat, 100)}%`,
              height: '100%',
              borderRadius: 4,
              background: state.player.heat >= 75 ? 'var(--danger)' : state.player.heat >= 40 ? 'var(--accent)' : 'var(--success)',
              transition: 'width 0.4s ease, background 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Safehouse progress */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Safehouse
          </span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{safehouse.current.name}</span>
        </div>
        {safehouse.next && (
          <>
            <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
              <div
                style={{
                  width: `${Math.round(safehouse.progress * 100)}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 3,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{Math.round(safehouse.progress * 100)}% to {safehouse.next.name}</span>
              <span>${Math.max(0, safehouse.next.advanceAt - (state.player.cash + state.player.bank)).toLocaleString()} needed</span>
            </div>
          </>
        )}
      </div>

      {/* Holdings expandable */}
      <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
        <button
          onClick={() => setShowHoldings(!showHoldings)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'var(--text)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span>Holdings {showHoldings ? '▲' : '▼'}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {getUsedCapacity(state.player).toFixed(2)}/{state.player.inventoryCapacity}kg
          </span>
        </button>
        {showHoldings && (
          <div style={{ padding: '0 14px 10px', fontSize: 12 }}>
            {state.player.inventory.length === 0 && state.player.stash.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty</div>
            ) : (
              <>
                {state.player.inventory.map(item => {
                  const g = state.goods.find(x => x.id === item.goodId);
                  return (
                    <div key={item.goodId} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span style={{ color: 'var(--success)' }}>{g?.name ?? item.goodId}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x</span>
                    </div>
                  );
                })}
                {state.player.stash.map(item => {
                  const g = state.goods.find(x => x.id === item.goodId);
                  return (
                    <div key={'stash-' + item.goodId} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{g?.name ?? item.goodId} (stashed)</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={onOpenBank}>Bank</button>
        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={onOpenBriefing}>Briefing</button>
        <button className="btn btn-danger" style={{ flex: 1, fontSize: 13 }} onClick={onEndRun}>End Run</button>
      </div>

      {/* Activity feed */}
      <div className="card" style={{ padding: '10px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Activity
        </div>
        {recentLog.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No activity yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentLog.map((entry, i) => (
              <div key={i} style={{ fontSize: 11, color: entry.includes('BUSTED') ? 'var(--danger)' : entry.includes('SUCCESS') ? 'var(--success)' : 'var(--text-dim)', lineHeight: 1.4 }}>
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
