import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function isHapticsEnabled(): boolean {
  return enabled;
}

const IMPACT: Record<'light' | 'medium' | 'heavy', ImpactStyle> = {
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy: ImpactStyle.Heavy,
};

export function haptic(style: HapticStyle = 'light'): void {
  if (!enabled) return;
  try {
    if (style === 'success') void Haptics.notification({ type: NotificationType.Success });
    else if (style === 'warning') void Haptics.notification({ type: NotificationType.Warning });
    else if (style === 'error') void Haptics.notification({ type: NotificationType.Error });
    else void Haptics.impact({ style: IMPACT[style] });
  } catch {
    /* haptics are best-effort */
  }
}

