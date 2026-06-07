import type { WindowId } from './AppDashboard';

type BottomNavProps = {
  onHome: () => void;
  onSetup: () => void;
  onOpenWindow: (windowId: WindowId) => void;
};

function BottomNav({ onHome, onSetup, onOpenWindow }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-britain-ink/10 bg-britain-paper/95 px-3 py-2 shadow-card backdrop-blur md:hidden" aria-label="Mobile app navigation">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        <button type="button" onClick={onHome} className="focus-ring rounded-2xl px-2 py-3 text-xs font-black text-britain-ink hover:bg-white">
          Home
        </button>
        <button type="button" onClick={onSetup} className="focus-ring rounded-2xl px-2 py-3 text-xs font-black text-britain-ink hover:bg-white">
          Setup
        </button>
        <button type="button" onClick={() => onOpenWindow('emergency')} className="focus-ring rounded-2xl px-2 py-3 text-xs font-black text-britain-ink hover:bg-white">
          Help
        </button>
        <button type="button" onClick={() => onOpenWindow('waitlist')} className="focus-ring rounded-2xl bg-britain-red px-2 py-3 text-xs font-black text-white">
          Join
        </button>
      </div>
    </nav>
  );
}

export default BottomNav;
