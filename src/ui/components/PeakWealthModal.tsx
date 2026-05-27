import { audioManager } from '../../audio';

interface PeakWealthModalProps {
  onClose: () => void;
}

export function PeakWealthModal({ onClose }: PeakWealthModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)' }}>
      <div className="relative z-10 border-2 border-retro-border bg-retro-panel max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 border-b border-retro-border pb-2">
          <div className="text-retro-accent text-xs uppercase tracking-widest glow-text">
            Peak Total Wealth
          </div>
          <button
            onClick={() => { audioManager.playSfx('click'); onClose(); }}
            className="text-gray-500 hover:text-gray-300 text-xs border border-retro-border px-2 py-0.5"
          >✕</button>
        </div>

        <div className="text-xs text-gray-300 leading-relaxed space-y-2 mb-4">
          <p>This number, right here. This is the one that matters. The leaderboard doesn't care how much you've got in your pocket right now, or what you've got stashed under your floorboards. It tracks your peak — the absolute best you've ever been.</p>
          <p>When Angelo's run is over — whether he goes out in a blaze of glory or gets tasered in a Colombian shithouse — this is the number that gets carved into the scoreboard for all the world to see.</p>
          <p>Every other cunt who plays this game gets judged by the same metric. Legends are made here. Bottle jobs are forgotten. The leaderboard remembers everything.</p>
          <p className="text-retro-accent">So keep pushing it higher. Or don't. See if I care.</p>
        </div>

        <button
          onClick={() => { audioManager.playSfx('click'); onClose(); }}
          className="touch-target w-full border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-4 py-3 text-xs font-bold uppercase transition-colors"
        >Got it</button>
      </div>
    </div>
  );
}
