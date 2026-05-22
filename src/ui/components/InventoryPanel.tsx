import { useState } from 'react';
import type { GameState, GameAction } from '../../core/types';
import { audioManager } from '../../audio';

interface InventoryPanelProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export function InventoryPanel({ state, dispatch }: InventoryPanelProps) {
  const isAtOrigin = state.player.currentCountryId === 'london';
  const canManage = isAtOrigin && (state.gamePhase === 'home' || state.gamePhase === 'selling');
  const hasInventory = state.player.inventory.length > 0;
  const hasStash = state.player.stash.length > 0;

  const [selectedGoodId, setSelectedGoodId] = useState<string | null>(null);
  const [retrieveQty, setRetrieveQty] = useState('');

  if (!hasInventory && !hasStash) return null;

  const selectedStashItem = selectedGoodId
    ? state.player.stash.find(s => s.goodId === selectedGoodId)
    : null;

  const handleSelectProduct = (goodId: string) => {
    if (selectedGoodId === goodId) {
      setSelectedGoodId(null);
      setRetrieveQty('');
    } else {
      const item = state.player.stash.find(s => s.goodId === goodId);
      setSelectedGoodId(goodId);
      setRetrieveQty(item ? String(item.quantity) : '');
    }
  };

  const handleRetrieve = () => {
    const qty = parseInt(retrieveQty, 10);
    if (!selectedGoodId || isNaN(qty) || qty <= 0) return;
    const item = state.player.stash.find(s => s.goodId === selectedGoodId);
    if (!item || qty > item.quantity) return;
    audioManager.playSfx('click');
    dispatch({ type: 'RETRIEVE_GOODS', goodId: selectedGoodId, quantity: qty });
    setSelectedGoodId(null);
    setRetrieveQty('');
  };

  return (
    <div className={`border border-retro-border bg-retro-panel p-3 ${!canManage ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="text-retro-accent text-xs uppercase tracking-widest mb-2 border-b border-retro-border pb-1 flex items-center gap-2">
        <span>Inventory</span>
        {!canManage && (
          <span className="text-[9px] text-gray-600 font-normal tracking-normal">— Return to London to manage</span>
        )}
      </div>

      {/* Stash All */}
      {hasInventory && (
        <div className="mb-2">
          <div className="text-[10px] text-gray-500 mb-1">
            Carrying:{' '}
            {state.player.inventory.map(i => {
              const g = state.goods.find(x => x.id === i.goodId);
              return (
                <span key={i.goodId} className="text-gray-400 ml-1">
                  {g?.name ?? i.goodId} x{i.quantity}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'STASH_GOODS' }); }}
            disabled={!canManage}
            className="touch-target w-full border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-3 py-2 text-xs transition-colors font-bold disabled:opacity-30"
          >
            Stash All
          </button>
        </div>
      )}

      {/* Stash */}
      {hasStash && (
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Stashed (click to select for retrieval):</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {state.player.stash.map(item => {
              const g = state.goods.find(x => x.id === item.goodId);
              const isSelected = selectedGoodId === item.goodId;
              return (
                <button
                  key={item.goodId}
                  onClick={() => { if (canManage) handleSelectProduct(item.goodId); }}
                  disabled={!canManage}
                  className={`touch-target border-2 px-3 py-2 text-xs transition-colors disabled:opacity-30 ${
                    isSelected
                      ? 'border-retro-accent bg-retro-accent/10 text-retro-accent'
                      : 'border-retro-border bg-[#111] hover:bg-[#222] text-gray-300'
                  }`}
                >
                  {g?.name ?? item.goodId} <span className="text-gray-500">x{item.quantity}</span>
                </button>
              );
            })}
          </div>

          {/* Retrieve controls — shown when a product is selected */}
          {selectedStashItem && (
            <div className="border border-retro-border bg-[#0a0a0a] p-2 flex items-center gap-2">
              <span className="text-[10px] text-gray-400 shrink-0">
                {state.goods.find(g => g.id === selectedGoodId)?.name ?? selectedGoodId}:
              </span>
              <input
                type="number"
                min={1}
                max={selectedStashItem.quantity}
                value={retrieveQty}
                onChange={(e) => setRetrieveQty(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRetrieve(); }}
                className="w-16 bg-black border border-retro-border text-gray-300 px-1 py-1 text-xs outline-none focus:border-retro-accent text-center"
              />
              <span className="text-[10px] text-gray-600">/ {selectedStashItem.quantity}</span>
              <button
                onClick={handleRetrieve}
                disabled={!retrieveQty || parseInt(retrieveQty) <= 0 || parseInt(retrieveQty) > selectedStashItem.quantity}
                className="touch-target ml-auto border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-3 py-1 text-xs transition-colors font-bold disabled:opacity-30"
              >
                Retrieve
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
