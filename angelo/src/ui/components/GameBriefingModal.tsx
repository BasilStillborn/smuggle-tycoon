import { audioManager } from '../../audio';

interface Props {
  onClose: () => void;
}

export function GameBriefingModal({ onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)' }}>Game Briefing</div>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { audioManager.playSfx('click'); onClose(); }}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 12 }}>You have <span style={{ color: 'var(--success)' }}>$5,000</span> in the bank.</p>

          <p style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>1. Withdraw cash</span> — use the Bank option in the menu.
            Every dollar you carry is product money and bribe money at customs.
          </p>
          <p style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>2. Pick a product</span> in the Market tab.
            Colombia is best for cocaine. Afghanistan for heroin. Netherlands for weed/hash. Spain for meth/ecstasy.
          </p>
          <p style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>3. Book a flight</span> to your destination.
            You need enough cash for the ticket + minimum product + $500 customs reserve.
          </p>
          <p style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>4. Meet a dealer</span> — each country has three.
            Select how much to buy. Beginner's luck gives you 100% success on your first three deals.
          </p>
          <p style={{ marginBottom: 8 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>5. Fly home through customs</span> — bribe the officer,
            bluff your way past, or walk straight through. Keep $500 spare for bribes.
          </p>
          <p style={{ marginBottom: 16 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>6. Stash your goods</span> in the Inventory panel.
            Retrieve them when you're ready to sell.
          </p>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
            <div style={{ color: 'var(--accent)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>The Kingpins</div>
            <p style={{ marginBottom: 4 }}><span style={{ color: 'var(--accent)' }}>Quentin</span> — gay as a rainbow. Minimum <span style={{ color: 'var(--success)' }}>$750</span> stash.</p>
            <p style={{ marginBottom: 4 }}><span style={{ color: 'var(--accent)' }}>Sergio</span> — Albanian car wash in Barking. Minimum <span style={{ color: 'var(--success)' }}>$2,000</span> stash.</p>
            <p style={{ marginBottom: 4 }}><span style={{ color: 'var(--accent)' }}>Avi</span> — Hatton Garden jeweller. Minimum <span style={{ color: 'var(--success)' }}>$5,000</span> stash.</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Each kingpin pays a different rate. Build up your stash before calling.</p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ color: 'var(--accent)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tips</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Fly first class for credibility bonuses. Buy assets — a gold watch or tailored suit gives street cred. Check the Market panel before booking — demand changes with each flight. High heat draws more customs attention.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
