import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../../core';
import { getHeatLevel } from '../../core';

type HeatLevel = 'low' | 'medium' | 'high' | 'critical';

const LEVEL_RANK: Record<HeatLevel, number> = { low: 0, medium: 1, high: 2, critical: 3 };
const LEVEL_LABEL: Record<HeatLevel, string> = { low: 'Cold', medium: 'Warm', high: 'Hot', critical: 'Critical' };

interface Props {
  state: GameState;
}

/** Live tension meters — mirrors engine state exactly, adds no mechanics. */
export function StatusStrip({ state }: Props) {
  const heat = state.player.heat;
  const credibility = state.player.credibility;
  const reputation = state.player.reputation;
  const level = getHeatLevel(state.player) as HeatLevel;

  const [easing, setEasing] = useState(false);
  const prevRank = useRef(LEVEL_RANK[level]);

  useEffect(() => {
    const rank = LEVEL_RANK[level];
    if (rank < prevRank.current) {
      setEasing(true);
      const t = setTimeout(() => setEasing(false), 900);
      prevRank.current = rank;
      return () => clearTimeout(t);
    }
    prevRank.current = rank;
  }, [level]);

  const [dropping, setDropping] = useState(false);
  const prevCred = useRef(credibility);

  useEffect(() => {
    if (credibility < prevCred.current) {
      setDropping(true);
      const t = setTimeout(() => setDropping(false), 700);
      prevCred.current = credibility;
      return () => clearTimeout(t);
    }
    prevCred.current = credibility;
  }, [credibility]);

  const pct = (n: number) => `${Math.max(0, Math.min(100, n))}%`;

  return (
    <div className="status">
      <div className={`status__meter status__meter--heat is-${level}${easing ? ' is-easing' : ''}`}>
        <div className="status__row">
          <span className="status__key">Heat</span>
          <span className="status__val">{LEVEL_LABEL[level]}</span>
        </div>
        <div className="status__track"><div className="status__fill" style={{ width: pct(heat) }} /></div>
      </div>

      <div className={`status__meter status__meter--cred${dropping ? ' is-dropping' : ''}`}>
        <div className="status__row">
          <span className="status__key">Credibility</span>
          <span className="status__val">{credibility}</span>
        </div>
        <div className="status__track"><div className="status__fill" style={{ width: pct(credibility) }} /></div>
      </div>

      <div className="status__meter status__meter--rep">
        <div className="status__row">
          <span className="status__key">Reputation</span>
          <span className="status__val">{reputation}</span>
        </div>
        <div className="status__track"><div className="status__fill" style={{ width: pct(reputation) }} /></div>
      </div>
    </div>
  );
}
