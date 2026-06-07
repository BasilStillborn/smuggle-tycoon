import { useEffect, type ReactNode } from 'react';

type InfoWindowProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
};

function InfoWindow({ title, subtitle, children, onClose }: InfoWindowProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-britain-ink/55 p-0 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-labelledby="info-window-title">
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-britain-paper shadow-card sm:h-auto sm:max-h-[88vh] sm:rounded-[2rem]">
          <div className="border-b border-britain-ink/10 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-britain-red">App window</p>
                <h2 id="info-window-title" className="mt-1 font-serif text-2xl font-black leading-tight tracking-tight text-britain-ink sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-2 text-sm font-bold leading-6 text-britain-ink/60">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-britain-ink text-xl font-black text-white transition hover:bg-britain-navy"
                aria-label="Close window"
              >
                ×
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoWindow;
