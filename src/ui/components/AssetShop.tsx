import { useState } from 'react';
import type { GameState, GameAction } from '../../core';
import { STATUS_ASSETS, canAffordAsset, getAsset, getClassShortLabel, getClassDescription } from '../../core';
import { audioManager } from '../../audio';

interface AssetShopProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'watch', label: 'Watches' },
  { key: 'jewelry', label: 'Jewelry' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'vehicle', label: 'Vehicles' },
  { key: 'property', label: 'Properties' },
] as const;

export function AssetShop({ state, dispatch }: AssetShopProps) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState<string>('all');

  const owned = state.player.ownedAssets ?? [];

  const filtered = category === 'all'
    ? STATUS_ASSETS
    : STATUS_ASSETS.filter((a) => a.category === category);

  const ownedCount = owned.length;

  return (
    <div className="border border-retro-border bg-retro-panel p-3 mt-4">
      <div
        className="flex items-center justify-between text-left border-b border-retro-border pb-2 mb-2"
      >
        <div className="text-retro-accent text-xs uppercase tracking-widest glow-text">
          Status Assets {ownedCount > 0 && <span className="text-gray-500">({ownedCount})</span>}
        </div>
        <span className="text-gray-500 text-[10px]">{expanded ? '▼' : '▶'}</span>
      </div>

      {!expanded && (
        <>
          <div className="text-[9px] text-gray-500 mb-2">
            Luxury items: watches, jewelry, clothes, cars, property. Boost credibility and unlock contacts.
          </div>
          <button
            onClick={() => { audioManager.playSfx('click'); setExpanded(true); }}
            className="touch-target w-full border-2 border-retro-accent/30 bg-[#0a0a0a] hover:bg-[#111] hover:border-retro-accent/60 px-3 py-2 transition-colors"
          >
            <span className="text-retro-accent text-[10px] font-bold">▼ Browse Assets</span>
          </button>
        </>
      )}

      {expanded && (
      <>
      <button
        onClick={() => { audioManager.playSfx('click'); setExpanded(false); }}
        className="touch-target w-full border border-retro-border bg-[#111] hover:bg-[#222] px-3 py-1 mb-3 text-[10px] text-gray-500 transition-colors"
      >
        ▲ Hide Assets
      </button>

      <div className="flex flex-wrap gap-1 mb-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => { audioManager.playSfx('click'); setCategory(c.key); }}
            className={`touch-target px-2 py-1 text-[10px] border transition-colors ${
              category === c.key
                ? 'border-retro-accent text-retro-accent bg-[#1a1a1a]'
                : 'border-retro-border text-gray-500 bg-[#111] hover:bg-[#222]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-gray-600 text-[10px] italic">No assets in this category.</div>
        )}
        {filtered.map((asset) => {
          const isOwned = owned.includes(asset.id);
          const canBuy = canAffordAsset(state.player, asset);
          const tierLabel = `Tier ${asset.visualTier}`;
          const tierColor = asset.visualTier === 1 ? 'text-gray-500' : asset.visualTier === 2 ? 'text-blue-400' : 'text-retro-accent';
          const classLabel = getClassShortLabel(asset.class);
          const classColor = asset.class === 'cosmetic' ? 'text-gray-500' : asset.class === 'functional' ? 'text-purple-400' : 'text-orange-400';
          const classDescr = getClassDescription(asset.class);
          const reqRep = `Reputation: ${asset.requiredReputation > 0 ? `${asset.requiredReputation}+` : '—'}`;
          const reqNw = `Net Worth: $${asset.requiredNetWorth.toLocaleString()}+`;

          return (
            <div
              key={asset.id}
              className={`border px-3 py-2 text-xs flex items-center gap-3 ${
                isOwned
                  ? 'border-retro-accent/30 bg-[#151510]'
                  : canBuy
                    ? 'border-retro-border bg-[#111]'
                    : 'border-retro-border bg-[#111] opacity-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-bold text-[10px] ${isOwned ? 'text-retro-accent' : ''}`}>{asset.name}</span>
                  <span className={`text-[9px] ${classColor}`}>{classLabel}</span>
                  <span className={`text-[9px] ${tierColor}`}>{tierLabel}</span>
                  {isOwned && <span className="text-[9px] text-retro-success font-bold">OWNED</span>}
                </div>
                <div className="text-[9px] text-gray-500 mb-0.5">{asset.description}</div>
                <div className="text-[8px] text-gray-600 italic mb-1">{classDescr}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9px] text-gray-600">
                  <span className="text-retro-accent font-bold">${asset.price.toLocaleString()}</span>
                  <span className="text-gray-500">{reqRep}</span>
                  <span className="text-gray-500">{reqNw}</span>
                </div>
                {asset.class === 'functional' && asset.regionContacts && (
                  <div className="text-[8px] text-purple-500/60 mt-0.5">
                    Contacts: {asset.regionContacts.join(', ')}
                  </div>
                )}
                {asset.class === 'operational' && asset.operationalBenefits && (
                  <div className="text-[8px] text-orange-500/60 mt-0.5">
                    Benefits: {[
                      asset.operationalBenefits.inspectionReduction ? `-${(asset.operationalBenefits.inspectionReduction * 100).toFixed(0)}% inspect` : null,
                      asset.operationalBenefits.bustReduction ? `-${(asset.operationalBenefits.bustReduction * 100).toFixed(0)}% bust` : null,
                      asset.operationalBenefits.fineReduction ? `-${(asset.operationalBenefits.fineReduction * 100).toFixed(0)}% fine` : null,
                      asset.operationalBenefits.heatDecayBonus ? `+${(asset.operationalBenefits.heatDecayBonus * 100).toFixed(0)}% decay` : null,
                    ].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                {isOwned ? (
                  <>
                    <span className="border border-retro-border text-gray-600 px-3 py-2 text-[10px] self-center">OWNED</span>
                    {(() => {
                      const payoutRatio = asset.class === 'cosmetic' ? 0.5 : asset.class === 'functional' ? 0.4 : 0.3;
                      const sellPrice = Math.floor(asset.price * payoutRatio);
                      return (
                        <button
                          onClick={() => {
                            audioManager.playSfx('click');
                            if (!state.assetSellTutorialShown) {
                              dispatch({ type: 'ASSET_SELL_TUTORIAL' });
                            }
                            dispatch({ type: 'SELL_ASSET', assetId: asset.id });
                          }}
                          className="touch-target border border-retro-danger/50 bg-[#1a0000] hover:bg-[#2a0000] text-retro-danger px-2 py-2 text-[10px] transition-colors"
                        >
                          Sell ${sellPrice}
                        </button>
                      );
                    })()}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (canBuy) {
                        audioManager.playSfx('click');
                        dispatch({ type: 'BUY_ASSET', assetId: asset.id });
                      }
                    }}
                    disabled={!canBuy}
                    className={`touch-target border px-3 py-2 text-[10px] transition-colors ${
                      canBuy
                        ? 'border-retro-accent text-retro-accent bg-[#111] hover:bg-[#222]'
                        : 'border-retro-border text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Buy ${asset.price}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}
