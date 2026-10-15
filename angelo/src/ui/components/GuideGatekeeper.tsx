import { audioManager } from '../../audio';

interface Props {
  onProceed: () => void;
  onClose: () => void;
}

export function GuideGatekeeper({ onProceed, onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)' }}>Guide</div>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { audioManager.playSfx('click'); onClose(); }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 16 }}>
          <p style={{ marginBottom: 8 }}>We explained all this to you at the start of the game. You fucking useless little prick. Now you want me to go through it all again for you?! Wasting my time! If you don't start paying attention you might as well fuck off out of here and go and play Sonic the Hedgehog on your Gameboy like a fucking child!</p>
          <p style={{ color: 'var(--accent)' }}>Now wake up or fuck off.</p>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { audioManager.playSfx('click'); onProceed(); }}>OK got it</button>
      </div>
    </div>
  );
}
