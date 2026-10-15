import { audioManager } from '../../audio';

interface Props {
  onClose: () => void;
}

export function CashModal({ onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)' }}>Cash on Person</div>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { audioManager.playSfx('click'); onClose(); }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 16 }}>
          <p style={{ marginBottom: 8 }}>Listen here, you mug. That number in the green box is what you've got on your person right now. Every penny you're carrying on your worthless hide.</p>
          <p style={{ marginBottom: 8 }}>You need enough to buy product, pay bribes when the feds get nosey, and get yourself through customs without having to sell your arse behind a petrol station. But don't get carried away — carrying too much makes you look suspicious. Customs see a wanker walking through with ten grand in his sock and they're going to have questions. Questions you don't have answers to.</p>
          <p>Golden rule, you spastic: take what you need for the deal plus a bit extra for the bribe envelope. Leave the rest in the bank. That way if you get turned over, you're not destitute.</p>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { audioManager.playSfx('click'); onClose(); }}>Got it</button>
      </div>
    </div>
  );
}
