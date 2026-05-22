import type { ReactNode } from 'react';
import { getWealthTier, getFameTier, getScene, type WealthTier, type FameTier } from './scenes';

export interface VisualStateData {
  cash: number;
  inventoryValue: number;
  peakNetWorth: number;
  reputation: number;
  heat: number;
  hasFunctionalAsset?: boolean;
}

export function getCombinedVisuals(data: VisualStateData) {
  const currentNetWorth = data.cash + data.inventoryValue;
  const effectiveNetWorth = Math.max(currentNetWorth, data.peakNetWorth);
  let wealth = getWealthTier(effectiveNetWorth);
  if (data.hasFunctionalAsset) {
    const tierOrder: WealthTier[] = ['destitute', 'struggling', 'comfortable', 'wealthy', 'rich', 'elite'];
    const idx = tierOrder.indexOf(wealth);
    if (idx >= 0 && idx < tierOrder.length - 1) {
      wealth = tierOrder[idx + 1];
    }
  }
  const fame = getFameTier(data.reputation);
  const scene = getScene(wealth, fame);
  return { wealth, fame, scene, netWorth: currentNetWorth };
}

interface VisualStateProps {
  data: VisualStateData;
  children: ReactNode;
}

export function VisualState({ data, children }: VisualStateProps) {
  const { scene, netWorth } = getCombinedVisuals(data);

  return (
    <div className={`relative ${scene.bgClass} min-h-screen`}>
      {/* Scene overlay */}
      <div className={`${scene.overlayClass}`} />

      {/* Vignette edge effect */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.7)] z-30" />

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-20 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
