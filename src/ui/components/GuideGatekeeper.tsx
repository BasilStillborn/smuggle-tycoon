import { audioManager } from '../../audio';

interface GuideGatekeeperProps {
  onProceed: () => void;
  onClose: () => void;
}

export function GuideGatekeeper({ onProceed, onClose }: GuideGatekeeperProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)' }}>
      <div className="relative z-10 border-2 border-retro-border bg-retro-panel max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 border-b border-retro-border pb-2">
          <div className="text-retro-accent text-xs uppercase tracking-widest glow-text">Guide</div>
          <button
            onClick={() => { audioManager.playSfx('click'); onClose(); }}
            className="text-gray-500 hover:text-gray-300 text-xs border border-retro-border px-2 py-0.5"
          >✕</button>
        </div>

        <div className="text-xs text-gray-300 leading-relaxed space-y-2 mb-4">
          <p>We explained all this to you at the start of the game. You fucking useless little prick. Now you want me to go through it all again for you?! Wasting my time! If you don't start paying attention you might as well fuck off out of here and go and play Sonic the Hedgehog on your Gameboy like a fucking child!</p>
          <p className="text-retro-accent">Now wake up or fuck off.</p>
        </div>

        <button
          onClick={() => { audioManager.playSfx('click'); onProceed(); }}
          className="touch-target w-full border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-4 py-3 text-xs font-bold uppercase transition-colors"
        >OK got it</button>
      </div>
    </div>
  );
}
