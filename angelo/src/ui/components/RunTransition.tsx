import { useEffect, useState } from 'react';
import type { RunTransitionInfo } from '../flow/useGameFlow';

interface Props {
  info: RunTransitionInfo;
  onDone: () => void;
}

/** Full-screen cinematic beat used only at the run's high-stakes hinges. */
export function RunTransition({ info, onDone }: Props) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const hold = setTimeout(() => setLeaving(true), 850);
    const done = setTimeout(() => onDone(), 1150);
    return () => {
      clearTimeout(hold);
      clearTimeout(done);
    };
  }, [onDone, info.nonce]);

  return (
    <div className={`run-transition run-transition--${info.tone}${leaving ? ' is-leaving' : ''}`}>
      <div className="run-transition__inner">
        {info.eyebrow && <div className="run-transition__eyebrow">{info.eyebrow}</div>}
        <div className="run-transition__label">{info.label}</div>
        {info.sub && <div className="run-transition__sub">{info.sub}</div>}
      </div>
    </div>
  );
}
