import { useState } from 'react';
import type { GameState, GameAction } from '../../core';
import {
  STATUS_ASSETS,
  canAffordAsset,
  getAsset,
  KINGPIN_POOL,
  getClassShortLabel,
  getClassDescription,
  getEffectiveRequiredNetWorth,
} from '../../core';
import { audioManager } from '../../audio';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'watch', label: 'Watches' },
  { key: 'jewelry', label: 'Jewelry' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'vehicle', label: 'Vehicles' },
  { key: 'property', label: 'Properties' },
] as const;

export const KingpinsPanel: React.FC<Props> = ({ state, dispatch }) => {
  const [category, setCategory] = useState<string>('all');
  const [showAssets, setShowAssets] = useState(false);

  const owned = state.player.ownedAssets ?? [];

  const filtered = category === 'all'
    ? STATUS_ASSETS
    : STATUS_ASSETS.filter((a) => a.category === category);

  return (
    <div className="page">
      <h2 className="page-title">Kingpins & Assets</h2>
      <p className="page-subtitle">London buyers and status assets</p>

      {/* Kingpin profiles */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
          London Buyers
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {KINGPIN_POOL.map((kp) => (
            <div key={kp.id} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
                {kp.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 6 }}>
                {kp.location}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 8 }}>
                {kp.description}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                <span style={{ color: 'var(--success)' }}>
                  Buys: {kp.buys.join(', ')}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Min: ${kp.minStashValue.toLocaleString()}
                </span>
                <span style={{ color: 'var(--accent)' }}>
                  ×{kp.sellPriceMod}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Assets */}
      <div
        className="card"
        style={{ overflow: 'hidden' }}
      >
        <button
          onClick={() => setShowAssets(!showAssets)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'var(--text)',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <span>Status Assets {owned.length > 0 && `(${owned.length})`}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{showAssets ? '▲' : '▼'}</span>
        </button>

        {!showAssets && (
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10, lineHeight: 1.4 }}>
              Luxury items: watches, jewelry, clothes, cars, property. Boost credibility and unlock contacts.
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => {
                audioManager.playSfx('click');
                if (!state.assetTutorialShown) {
                  dispatch({ type: 'ASSET_TUTORIAL' });
                }
                setShowAssets(true);
              }}
            >
              Browse Assets ▼
            </button>
          </div>
        )}

        {showAssets && (
          <div style={{ padding: '0 16px 14px' }}>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: 12 }}
              onClick={() => { audioManager.playSfx('click'); setShowAssets(false); }}
            >
              ▲ Hide Assets
            </button>

            {/* Category filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  className="btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    borderRadius: 8,
                    background: category === c.key ? 'var(--accent)' : 'var(--bg)',
                    color: category === c.key ? '#000' : 'var(--text-muted)',
                    border: 'none',
                    fontWeight: 600,
                  }}
                  onClick={() => { audioManager.playSfx('click'); setCategory(c.key); }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Asset grid */}
            {filtered.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                No assets in this category.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {filtered.map((asset) => {
                const isOwned = owned.includes(asset.id);
                const canBuy = canAffordAsset(state.player, asset);
                const classLabel = getClassShortLabel(asset.class);
                const classDescr = getClassDescription(asset.class);
                const reqRep = asset.requiredReputation > 0 ? `Rep ${asset.requiredReputation}+` : null;
                const reqNw = `NW $${getEffectiveRequiredNetWorth(asset).toLocaleString()}+`;

                return (
                  <div
                    key={asset.id}
                    className={`card-highlight${isOwned ? ' card-selected' : ''}`}
                    style={{
                      padding: '12px 14px',
                      opacity: isOwned || canBuy ? 1 : 0.5,
                    }}
                  >
                    {/* Top row: name + badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: isOwned ? 'var(--accent)' : 'var(--text)' }}>
                        {asset.name}
                      </span>
                      <span className="badge" style={{ background: asset.class === 'cosmetic' ? 'var(--bg)' : asset.class === 'functional' ? 'rgba(168,85,247,0.15)' : 'rgba(251,146,60,0.15)', color: asset.class === 'cosmetic' ? 'var(--text-muted)' : asset.class === 'functional' ? '#a855f7' : '#fb923c', fontSize: 10 }}>
                        {classLabel}
                      </span>
                      <span className="badge" style={{ background: 'var(--bg)', fontSize: 10 }}>
                        Tier {asset.visualTier}
                      </span>
                      {isOwned && (
                        <span className="badge" style={{ background: 'var(--success-dim)', color: 'var(--success)', fontSize: 10 }}>
                          OWNED
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4, lineHeight: 1.4 }}>
                      {asset.description}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 6 }}>
                      {classDescr}
                    </div>

                    {/* Details row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>${asset.price.toLocaleString()}</span>
                        {reqRep && <span>{reqRep}</span>}
                        <span>{reqNw}</span>
                      </div>

                      {/* Action button */}
                      {isOwned ? (
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: 12, padding: '6px 14px' }}
                          onClick={() => {
                            audioManager.playSfx('click');
                            if (!state.assetSellTutorialShown) {
                              dispatch({ type: 'ASSET_SELL_TUTORIAL' });
                            }
                            dispatch({ type: 'SELL_ASSET', assetId: asset.id });
                          }}
                        >
                          Sell ${Math.floor(asset.price * (asset.class === 'cosmetic' ? 0.5 : asset.class === 'functional' ? 0.4 : 0.3)).toLocaleString()}
                        </button>
                      ) : (
                        <button
                          className="btn"
                          style={{
                            fontSize: 12,
                            padding: '6px 14px',
                            background: canBuy ? 'var(--accent)' : 'var(--bg)',
                            color: canBuy ? '#000' : 'var(--text-muted)',
                            border: canBuy ? 'none' : '1px solid var(--border-light)',
                            cursor: canBuy ? 'pointer' : 'not-allowed',
                          }}
                          disabled={!canBuy}
                          onClick={() => {
                            if (canBuy) {
                              audioManager.playSfx('click');
                              dispatch({ type: 'BUY_ASSET', assetId: asset.id });
                            }
                          }}
                        >
                          Buy ${asset.price.toLocaleString()}
                        </button>
                      )}
                    </div>

                    {/* Asset-specific info */}
                    {asset.class === 'functional' && asset.regionContacts && (
                      <div style={{ fontSize: 10, color: '#a855f7', marginTop: 4 }}>
                        Contacts: {asset.regionContacts.join(', ')}
                      </div>
                    )}
                    {asset.class === 'operational' && asset.operationalBenefits && (
                      <div style={{ fontSize: 10, color: '#fb923c', marginTop: 4 }}>
                        Benefits: {[
                          asset.operationalBenefits.inspectionReduction ? `-${(asset.operationalBenefits.inspectionReduction * 100).toFixed(0)}% inspect` : null,
                          asset.operationalBenefits.bustReduction ? `-${(asset.operationalBenefits.bustReduction * 100).toFixed(0)}% bust` : null,
                          asset.operationalBenefits.fineReduction ? `-${(asset.operationalBenefits.fineReduction * 100).toFixed(0)}% fine` : null,
                          asset.operationalBenefits.heatDecayBonus ? `+${(asset.operationalBenefits.heatDecayBonus * 100).toFixed(0)}% decay` : null,
                        ].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
