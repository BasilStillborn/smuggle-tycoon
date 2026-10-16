import { useCallback } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { audioManager } from '../../audio';
import type { SfxType } from '../../audio';
import { haptic, type HapticStyle } from '../../audio/haptics';

export interface TapOptions {
  /** Haptic weight for this interaction. Defaults to `light`. */
  haptic?: HapticStyle;
  /** Sound effect for this interaction. Defaults to `click`. */
  sfx?: SfxType;
  /** When true, no feedback fires and the action is skipped. */
  disabled?: boolean;
  /** Suppress the sound (still animates + haptics). For audio-unlock gestures. */
  silent?: boolean;
}

/** Fire the universal "Click": one sound + one haptic. */
export function fireTap(opts?: TapOptions): void {
  if (opts?.disabled) return;
  if (!opts?.silent) audioManager.playSfx(opts?.sfx ?? 'click');
  haptic(opts?.haptic ?? 'light');
}

/**
 * Factory for non-button elements (backdrops, rows) that still need the Click.
 * Call once per component, then wrap handlers: `onClick={tap(fn, { haptic: 'heavy' })}`.
 */
export function useTap() {
  return useCallback(
    (onTap: () => void, opts?: TapOptions) =>
      (event?: { preventDefault?: () => void }) => {
        if (opts?.disabled) return;
        event?.preventDefault?.();
        fireTap(opts);
        onTap();
      },
    [],
  );
}

interface TapProps extends TapOptions {
  onTap: () => void;
  className?: string;
  children: ReactNode;
  as?: 'button' | 'div';
  style?: CSSProperties;
  ariaLabel?: string;
  title?: string;
}

/**
 * The universal interaction primitive. Every tappable surface routes through
 * this so the Click is guaranteed by construction, never by memory.
 */
export function Tap({
  onTap,
  haptic: hapticStyle,
  sfx,
  disabled = false,
  silent = false,
  className,
  children,
  as = 'button',
  style,
  ariaLabel,
  title,
}: TapProps) {
  const handle = (event: { preventDefault?: () => void }) => {
    if (disabled) return;
    event.preventDefault?.();
    fireTap({ haptic: hapticStyle, sfx, disabled, silent });
    onTap();
  };

  const cls = `tap${className ? ` ${className}` : ''}${disabled ? ' is-disabled' : ''}`;

  if (as === 'div') {
    return (
      <div
        className={cls}
        onClick={handle}
        role="button"
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        title={title}
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={handle}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      style={style}
    >
      {children}
    </button>
  );
}
