import { audioManager } from '../../audio';

interface Props {
  onClose: () => void;
}

export function PeakWealthModal({ onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)' }}>Peak Total Wealth</div>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => { audioManager.playSfx('click'); onClose(); }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 16 }}>
          <p style={{ marginBottom: 8 }}>This number, right here. This is the one that matters. The leaderboard doesn't care how much you've got in your pocket right now, or what you've got stashed under your floorboards. It tracks your peak — the absolute best you've ever been.</p>
          <p style={{ marginBottom: 8 }}>When Angelo's run is over — whether he goes out in a blaze of glory or gets tasered in a Colombian shithouse — this is the number that gets carved into the scoreboard for all the world to see.</p>
          <p style={{ marginBottom: 8 }}>Every other cunt who plays this game gets judged by the same metric. Legends are made here. Bottle jobs are forgotten. The leaderboard remembers everything.</p>
          <p style={{ color: 'var(--accent)' }}>So keep pushing it higher. Or don't. See if I care.</p>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { audioManager.playSfx('click'); onClose(); }}>Got it</button>
      </div>
    </div>
  );
}
