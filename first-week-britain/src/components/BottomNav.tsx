import type { WindowId } from './AppDashboard';

type AppLocale = 'en' | 'zh';

type BottomNavProps = {
  onHome: () => void;
  onSetup: () => void;
  onOpenWindow: (windowId: WindowId) => void;
  locale?: AppLocale;
};

const copy: Record<AppLocale, { aria: string; home: string; setup: string; help: string; join: string }> = {
  en: {
    aria: 'Mobile app navigation',
    home: 'Home',
    setup: 'Setup',
    help: 'Help',
    join: 'Join',
  },
  zh: {
    aria: '手机应用导航',
    home: '首页',
    setup: '设置',
    help: '求助',
    join: '加入',
  },
};

function BottomNav({ onHome, onSetup, onOpenWindow, locale = 'en' }: BottomNavProps) {
  const t = copy[locale];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-britain-ink/10 bg-britain-paper/95 px-3 py-2 shadow-card backdrop-blur md:hidden" aria-label={t.aria}>
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        <button type="button" onClick={onHome} className="focus-ring rounded-2xl px-2 py-3 text-xs font-black text-britain-ink hover:bg-white">
          {t.home}
        </button>
        <button type="button" onClick={onSetup} className="focus-ring rounded-2xl px-2 py-3 text-xs font-black text-britain-ink hover:bg-white">
          {t.setup}
        </button>
        <button type="button" onClick={() => onOpenWindow('emergency')} className="focus-ring rounded-2xl px-2 py-3 text-xs font-black text-britain-ink hover:bg-white">
          {t.help}
        </button>
        <button type="button" onClick={() => onOpenWindow('waitlist')} className="focus-ring rounded-2xl bg-britain-red px-2 py-3 text-xs font-black text-white">
          {t.join}
        </button>
      </div>
    </nav>
  );
}

export default BottomNav;
