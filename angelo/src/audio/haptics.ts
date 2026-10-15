type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function isHapticsEnabled(): boolean {
  return enabled;
}

export function haptic(style: HapticStyle = 'light'): void {
  if (!enabled) return;
  try {
    const cap = (globalThis as any)?.Capacitor;
    const H = cap?.Plugins?.Haptics;
    if (H) {
      if (style === 'success') void H.notification({ type: 'SUCCESS' });
      else if (style === 'warning') void H.notification({ type: 'WARNING' });
      else if (style === 'error') void H.notification({ type: 'ERROR' });
      else void H.impact({ style: style.toUpperCase() });
      return;
    }
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (nav && typeof nav.vibrate === 'function') {
      const ms = style === 'heavy' ? 30 : style === 'medium' ? 18 : 10;
      nav.vibrate(ms);
    }
  } catch {
    /* haptics are best-effort */
  }
}
