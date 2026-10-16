import { useState } from 'react';
import type { GameState, GameAction } from '../../core/types';
import { getOverdraftLimit } from '../../core';
import { Tap } from './Tap';

interface Props {
  state: GameState;
  send: (action: GameAction) => void;
  onClose: () => void;
}

export function BankModal({ state, send, onClose }: Props) {
  const [amount, setAmount] = useState(500);
  const [showingTutorial, setShowingTutorial] = useState(!state.bankTutorialShown);

  const maxWithdraw = state.player.bank;
  const maxDeposit = Math.max(0, state.player.cash);
  const overdraftLimit = getOverdraftLimit(state.player);

  const adjust = (delta: number) => {
    setAmount(prev => Math.max(1, Math.min(999999, prev + delta)));
  };

  const handleWithdraw = () => {
    const amt = Math.min(amount, maxWithdraw);
    if (amt < 1) return;
    send({ type: 'TRANSFER_FROM_BANK', amount: amt });
  };

  const handleDeposit = () => {
    const amt = Math.min(amount, maxDeposit);
    if (amt < 1) return;
    send({ type: 'TRANSFER_TO_BANK', amount: amt });
  };

  const handleTutorialDone = () => {
    send({ type: 'BANK_TUTORIAL_SHOWN' });
    setShowingTutorial(false);
  };

  const fmt = (n: number) => n.toLocaleString();

  return (
    <Tap
      as="div"
      className="modal-backdrop"
      onTap={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)' }}>
            {showingTutorial ? 'Banking & Overdrafts' : 'Banking'}
          </div>
          <Tap
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '4px 10px' }}
            onTap={onClose}
          >✕</Tap>
        </div>

        {showingTutorial ? (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 16 }}>
              <p style={{ marginBottom: 8 }}>Your overdraft limit scales with your peak net worth. The more you've earned, the more the bank lets you borrow:</p>
              <p style={{ marginBottom: 4 }}><span style={{ color: 'var(--accent)' }}>Tier 1</span> — under $10K peak: <span style={{ color: 'var(--danger)' }}>-$1,000</span></p>
              <p style={{ marginBottom: 4 }}><span style={{ color: 'var(--accent)' }}>Tier 2</span> — $10K to $50K: <span style={{ color: 'var(--danger)' }}>-$2,000</span></p>
              <p style={{ marginBottom: 4 }}><span style={{ color: 'var(--accent)' }}>Tier 3</span> — over $50K: <span style={{ color: 'var(--danger)' }}>-$5,000</span></p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>If your cash falls below your overdraft limit AND you've got no product anywhere to sell... game over.</p>
            </div>
            <Tap className="btn btn-primary" style={{ width: '100%' }} onTap={handleTutorialDone}>Got it</Tap>
          </div>
        ) : (
          <>
            {/* Balances */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Bank</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: state.player.bank <= 0 ? 'var(--danger)' : 'var(--success)' }}>
                  ${fmt(state.player.bank)}
                </div>
              </div>
              <div className="card" style={{ padding: '12px', textAlign: 'center', background: 'var(--bg)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Cash</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: state.player.cash < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  ${fmt(state.player.cash)}
                </div>
                {state.player.cash < 0 && (
                  <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 2 }}>Overdraft: -${fmt(overdraftLimit)}</div>
                )}
              </div>
            </div>

            {/* Overdraft info */}
            <div className="card" style={{ padding: '10px 14px', marginBottom: 16, background: 'var(--bg)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                Overdraft limit: <span style={{ color: 'var(--danger)' }}>-${fmt(overdraftLimit)}</span> — game over if your cash drops below this with no product to sell
              </div>
            </div>

            {/* Amount selector */}
            <div className="card" style={{ padding: 16, marginBottom: 16, background: 'var(--bg)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: 12 }}>Transfer Amount</div>

              {/* Quick amount buttons */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
                {[
                  { label: '$1', fn: () => setAmount(1) },
                  { label: '−100', fn: () => adjust(-100) },
                  { label: '+100', fn: () => adjust(100) },
                  { label: '−1K', fn: () => adjust(-1000) },
                  { label: '+1K', fn: () => adjust(1000) },
                ].map(b => (
                  <Tap key={b.label} className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 10px' }} onTap={b.fn}>{b.label}</Tap>
                ))}
              </div>

              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
                <Tap
                  className="btn btn-secondary"
                  style={{ width: 40, height: 40, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  disabled={amount <= 1}
                  onTap={() => adjust(-100)}
                >▼</Tap>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', minWidth: 100, textAlign: 'center' }}>
                  ${fmt(amount)}
                </div>
                <Tap
                  className="btn btn-secondary"
                  style={{ width: 40, height: 40, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  onTap={() => adjust(100)}
                >▲</Tap>
              </div>

              {/* All-bank / All-cash */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                <Tap className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 12px' }} disabled={maxWithdraw < 1} onTap={() => setAmount(maxWithdraw)}>
                  All Bank
                </Tap>
                <Tap className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 12px' }} disabled={maxDeposit < 1} onTap={() => setAmount(maxDeposit)}>
                  All Cash
                </Tap>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <Tap
                className="btn btn-primary"
                style={{ flex: 1 }}
                haptic="medium"
                disabled={maxWithdraw < 1 || amount < 1}
                onTap={handleWithdraw}
              >
                Withdraw
              </Tap>
              <Tap
                className="btn btn-secondary"
                style={{ flex: 1 }}
                haptic="medium"
                disabled={maxDeposit < 1 || amount < 1}
                onTap={handleDeposit}
              >
                Deposit
              </Tap>
            </div>

            {/* Preview */}
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              Balances after: Bank ${fmt(Math.max(0, state.player.bank - Math.min(amount, maxWithdraw)))} · Cash ${fmt(state.player.cash + Math.min(amount, maxWithdraw))}
            </div>
          </>
        )}
      </div>
    </Tap>
  );
}
