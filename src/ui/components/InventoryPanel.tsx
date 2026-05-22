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

  if (!hasInventory && !hasStash) return null;

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

      {/* Retrieve */}
      {hasStash && (
        <div>
          <div className="text-[10px] text-gray-500 mb-1">Stashed:</div>
          <div className="flex flex-wrap gap-2">
            {state.player.stash.map(item => {
              const g = state.goods.find(x => x.id === item.goodId);
              return (
                <button
                  key={item.goodId}
                  onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'RETRIEVE_GOODS', goodId: item.goodId, quantity: item.quantity }); }}
                  disabled={!canManage}
                  className="touch-target border-2 border-retro-border bg-[#111] hover:bg-[#222] text-gray-300 px-3 py-2 text-xs transition-colors disabled:opacity-30"
                >
                  Retrieve {g?.name ?? item.goodId} <span className="text-gray-500">({item.quantity})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
