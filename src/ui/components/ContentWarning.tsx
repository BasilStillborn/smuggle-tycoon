import { useEffect, useState, useCallback } from 'react';

interface ContentWarningProps {
  onStart: () => void;
}

const DISCLAIMER_TEXT = 'This game is a work of fiction, it includes fictional characters and scenarios. However, much of the gameplay and dialogue is either racist, sexist, homophobic or antisemitic. As a result, we do not recommend this game is played by anyone, ever.';

export function ContentWarning({ onStart }: ContentWarningProps) {
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [buttonClickable, setButtonClickable] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 200);
    const buttonTimer = setTimeout(() => { setShowButton(true); setButtonClickable(true); }, 3000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleStart = useCallback(() => {
    onStart();
  }, [onStart]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)',
      }}
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full px-8 text-center">
        {/* Warning text */}
        <div
          className={`transition-opacity duration-[2000ms] ease-in ${showText ? 'opacity-100' : 'opacity-0'}`}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: '#e8e0d0',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          <div className="text-lg md:text-xl leading-relaxed">
            <p>{DISCLAIMER_TEXT}</p>
          </div>
        </div>

        {/* Button — fades in over 3s */}
        <div className={`transition-opacity duration-[3000ms] ease-in mt-12 ${showButton ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={buttonClickable ? handleStart : undefined}
            disabled={!buttonClickable}
            className={`touch-target border-2 px-10 py-4 text-sm transition-all duration-300 font-bold tracking-[0.2em] uppercase ${
              buttonClickable
                ? 'border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent cursor-pointer'
                : 'border-transparent text-transparent cursor-default'
            }`}
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            (I completely understand)
          </button>
        </div>
      </div>
    </div>
  );
}
