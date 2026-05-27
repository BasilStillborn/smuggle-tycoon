import { useEffect, useState, useCallback } from 'react';
import { audioManager } from '../../audio';

interface UniversalIntroProps {
  onStart: () => void;
}

const EXPOSITION_TEXT = [
  "It's the early 1990s, after falling asleep in the office and then getting caught stealing,",
  'Angelo is fired from his job as a security guard.. he sees no other option but to turn to a life of crime',
  'He cashes out his savings and heads into the street,',
  'the dark seedy underworld.',
  '',
];

export function UniversalIntro({ onStart }: UniversalIntroProps) {
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [buttonClickable, setButtonClickable] = useState(false);

  useEffect(() => {
    audioManager.init();

    // Fade in text block over 4 seconds
    const textTimer = setTimeout(() => setShowText(true), 200);
    // Button appears with text at same time, fades in over 3s
    const buttonTimer = setTimeout(() => { setShowButton(true); setButtonClickable(true); }, 7000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(buttonTimer);
      audioManager.stopMusic();
    };
  }, []);

  const handleStart = useCallback(async () => {
    await audioManager.resumeAudioFromUserGesture();
    audioManager.playMenuMusic();
    await new Promise((r) => setTimeout(r, 300));
    audioManager.playSfx('click');
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
        {/* 80s retro movie title style */}
        <div
          className={`transition-opacity duration-[4000ms] ease-in ${showText ? 'opacity-100' : 'opacity-0'}`}
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: '#e8e0d0',
            letterSpacing: '0.15em',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          <div className="text-xl md:text-2xl leading-relaxed space-y-2">
            {EXPOSITION_TEXT.map((line, i) => (
              <div key={i} className={line === '' ? 'h-6' : ''}>
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Start button — fades in over 3s alongside text */}
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
              (This is his story)
            </button>
          </div>
        </div>
    </div>
  );
}
