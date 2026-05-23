import { useState } from 'react';
import type { GameState, GameAction } from '../../core/types';
import { getOverdraftLimit } from '../../core';
import { audioManager } from '../../audio';

interface BankModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
}

export function BankModal({ state, dispatch, onClose }: BankModalProps) {
  const [amount, setAmount] = useState(500);
  const [showingTutorial, setShowingTutorial] = useState(!state.bankTutorialShown);

  const bankColor = state.player.bank <= 0 ? 'text-retro-danger' : 'text-retro-success';
  const cashColor = state.player.cash < 0 ? 'text-retro-danger' : 'text-retro-success';
  const maxWithdraw = state.player.bank;
  const maxDeposit = Math.max(0, state.player.cash);
  const overdraftLimit = getOverdraftLimit(state.player);

  const adjust = (delta: number) => {
    setAmount(prev => Math.max(1, Math.min(999999, prev + delta)));
  };

  const handleWithdraw = () => {
    const amt = Math.min(amount, maxWithdraw);
    if (amt < 1) return;
    audioManager.playSfx('click');
    dispatch({ type: 'TRANSFER_FROM_BANK', amount: amt });
  };

  const handleDeposit = () => {
    const amt = Math.min(amount, maxDeposit);
    if (amt < 1) return;
    audioManager.playSfx('click');
    dispatch({ type: 'TRANSFER_TO_BANK', amount: amt });
  };

  const handleTutorialDone = () => {
    dispatch({ type: 'BANK_TUTORIAL_SHOWN' });
    setShowingTutorial(false);
  };

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)' }}>
      <div className="relative z-10 border-2 border-retro-border bg-retro-panel max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-retro-border pb-2">
          <div className="text-retro-accent text-xs uppercase tracking-widest glow-text">
            {showingTutorial ? 'Banking & Overdrafts' : 'Banking'}
          </div>
          <button
            onClick={() => { audioManager.playSfx('click'); onClose(); }}
            className="text-gray-500 hover:text-gray-300 text-xs border border-retro-border px-2 py-0.5"
          >✕</button>
        </div>

        {showingTutorial ? (
          /* First-time tutorial */
          <div>
            <div className="text-xs text-gray-300 leading-relaxed space-y-2 mb-4">
              <p>Your overdraft limit scales with your peak net worth. The more you've earned, the more the bank lets you borrow:</p>
              <p><span className="text-retro-accent">Tier 1</span> — under $10K peak: <span className="text-retro-danger">-$1,000</span></p>
              <p><span className="text-retro-accent">Tier 2</span> — $10K to $50K: <span className="text-retro-danger">-$2,000</span></p>
              <p><span className="text-retro-accent">Tier 3</span> — over $50K: <span className="text-retro-danger">-$5,000</span></p>
              <p className="text-gray-400 text-[10px]">If your cash falls below your overdraft limit AND you've got no product anywhere to sell... game over. End of the road.</p>
            </div>
            <button
              onClick={handleTutorialDone}
              className="touch-target w-full border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-4 py-3 text-xs font-bold uppercase transition-colors"
            >Got it</button>
          </div>
        ) : (
          /* Normal banking */
          <>
            {/* Balances */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border border-retro-border bg-[#0a0a0a] p-3 text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bank</div>
                <div className={`text-lg font-bold ${bankColor} ${state.player.bank < 0 ? 'glow-text-danger' : 'glow-text-success'} tabular-nums`}>
                  ${fmt(state.player.bank)}
                </div>
              </div>
              <div className="border border-retro-border bg-[#0a0a0a] p-3 text-center">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Cash</div>
                <div className={`text-lg font-bold ${cashColor} ${state.player.cash < -500 ? 'animate-pulse' : ''} tabular-nums`}>
                  ${fmt(state.player.cash)}
                </div>
                {state.player.cash < 0 && (
                  <div className="text-[9px] text-retro-danger mt-0.5">Overdraft: /${fmt(overdraftLimit)}</div>
                )}
              </div>
            </div>

            {/* Overdraft info — permanent reference */}
            <div className="border border-retro-border bg-[#0a0a0a] p-2 mb-3 text-center">
              <div className="text-[9px] text-gray-500">
                Overdraft limit: <span className="text-retro-danger">-${fmt(overdraftLimit)}</span> — game over if your cash drops below this with no product to sell
              </div>
            </div>

            {/* Amount selector */}
            <div className="border border-retro-border bg-[#0a0a0a] p-4 mb-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 text-center">Transfer Amount</div>
              <div className="flex gap-1.5 justify-center mb-3">
                <button onClick={() => setAmount(1)} className="touch-target border border-retro-border bg-[#111] hover:bg-[#222] text-gray-500 px-2 py-1 text-[10px]">$1</button>
                <button onClick={() => adjust(-100)} className="touch-target border border-retro-border bg-[#111] hover:bg-[#222] text-gray-400 px-2 py-1 text-[10px]">−100</button>
                <button onClick={() => adjust(100)} className="touch-target border border-retro-border bg-[#111] hover:bg-[#222] text-gray-400 px-2 py-1 text-[10px]">+100</button>
                <button onClick={() => adjust(-1000)} className="touch-target border border-retro-border bg-[#111] hover:bg-[#222] text-gray-400 px-2 py-1 text-[10px]">−1K</button>
                <button onClick={() => adjust(1000)} className="touch-target border border-retro-border bg-[#111] hover:bg-[#222] text-gray-400 px-2 py-1 text-[10px]">+1K</button>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <button onClick={() => adjust(-100)} onDoubleClick={() => adjust(-1000)} disabled={amount <= 1}
                  className="touch-target w-10 h-10 border-2 border-retro-border bg-[#111] hover:bg-[#222] text-gray-300 hover:text-retro-accent text-lg flex items-center justify-center transition-colors disabled:opacity-20">▼</button>
                <div className="text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-retro-accent tabular-nums">${fmt(amount)}</div>
                </div>
                <button onClick={() => adjust(100)} onDoubleClick={() => adjust(1000)}
                  className="touch-target w-10 h-10 border-2 border-retro-border bg-[#111] hover:bg-[#222] text-gray-300 hover:text-retro-accent text-lg flex items-center justify-center transition-colors">▲</button>
              </div>
              <div className="flex gap-1.5 justify-center">
                <button onClick={() => setAmount(maxWithdraw)} disabled={maxWithdraw < 1}
                  className="touch-target border border-retro-border bg-[#111] hover:bg-[#222] text-gray-500 px-2 py-1 text-[10px] disabled:opacity-20">All Bank</button>
                <button onClick={() => setAmount(maxDeposit)} disabled={maxDeposit < 1}
                  className="touch-target border border-retro-border bg-[#111] hover:bg-[#222] text-gray-500 px-2 py-1 text-[10px] disabled:opacity-20">All Cash</button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-3">
              <button onClick={handleWithdraw} disabled={maxWithdraw < 1 || amount < 1}
                className="touch-target flex-1 border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-4 py-3 text-xs font-bold uppercase transition-colors disabled:opacity-30">WITHDRAW</button>
              <button onClick={handleDeposit} disabled={maxDeposit < 1 || amount < 1}
                className="touch-target flex-1 border-2 border-retro-border bg-[#111] hover:bg-[#222] text-gray-300 px-4 py-3 text-xs font-bold uppercase transition-colors disabled:opacity-30">DEPOSIT</button>
            </div>

            <div className="text-[9px] text-gray-600 text-center border-t border-retro-border pt-2">
              Withdraw: Bank → ${fmt(Math.max(0, state.player.bank - Math.min(amount, maxWithdraw)))} | Cash → ${fmt(state.player.cash + Math.min(amount, maxWithdraw))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
