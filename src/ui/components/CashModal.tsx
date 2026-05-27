import { audioManager } from '../../audio';

interface CashModalProps {
  onClose: () => void;
}

export function CashModal({ onClose }: CashModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)' }}>
      <div className="relative z-10 border-2 border-retro-border bg-retro-panel max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 border-b border-retro-border pb-2">
          <div className="text-retro-accent text-xs uppercase tracking-widest glow-text">
            Cash on Person
          </div>
          <button
            onClick={() => { audioManager.playSfx('click'); onClose(); }}
            className="text-gray-500 hover:text-gray-300 text-xs border border-retro-border px-2 py-0.5"
          >✕</button>
        </div>

        <div className="text-xs text-gray-300 leading-relaxed space-y-2 mb-4">
          <p>Listen here, you mug. That number in the green box is what you've got on your person right now. Every penny you're carrying on your worthless hide.</p>
          <p>You need enough to buy product, pay bribes when the feds get nosey, and get yourself through customs without having to sell your arse behind a petrol station. But don't get carried away — carrying too much makes you look suspicious. Customs see a wanker walking through with ten grand in his sock and they're going to have questions. Questions you don't have answers to.</p>
          <p>Golden rule, you spastic: take what you need for the deal plus a bit extra for the bribe envelope. Leave the rest in the bank. That way if you get turned over, you're not destitute.</p>
        </div>

        <button
          onClick={() => { audioManager.playSfx('click'); onClose(); }}
          className="touch-target w-full border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-4 py-3 text-xs font-bold uppercase transition-colors"
        >Got it</button>
      </div>
    </div>
  );
}
