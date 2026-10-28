/**
 * Haptic feedback utility designed specifically for deaf and hard-of-hearing users
 * Provides tactile confirmations, gesture detection alerts, and timing pulses.
 */

export type HapticPattern = 
  | 'tick'          // 15ms very light tap
  | 'signDetected'  // 60ms brisk affirmation
  | 'signComplete'  // 30ms, pause 30ms, 50ms double tap
  | 'startSigning'  // 80ms solid pulse
  | 'warning'       // 150ms, pause 80ms, 150ms attention pulse
  | 'success'       // 40ms, pause 40ms, 90ms rhythm
  | 'audioBeat';    // 25ms rhythm pulse

export function triggerHaptic(
  pattern: HapticPattern, 
  enabled: boolean = true, 
  strength: 'light' | 'medium' | 'strong' = 'medium'
): void {
  if (!enabled || typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  const multiplier = strength === 'light' ? 0.6 : strength === 'strong' ? 1.5 : 1.0;

  try {
    switch (pattern) {
      case 'tick':
        navigator.vibrate(Math.round(15 * multiplier));
        break;
      case 'signDetected':
        navigator.vibrate(Math.round(65 * multiplier));
        break;
      case 'signComplete':
        navigator.vibrate([
          Math.round(35 * multiplier), 
          30, 
          Math.round(55 * multiplier)
        ]);
        break;
      case 'startSigning':
        navigator.vibrate(Math.round(85 * multiplier));
        break;
      case 'warning':
        navigator.vibrate([
          Math.round(140 * multiplier), 
          80, 
          Math.round(160 * multiplier)
        ]);
        break;
      case 'success':
        navigator.vibrate([
          Math.round(40 * multiplier), 
          40, 
          Math.round(90 * multiplier)
        ]);
        break;
      case 'audioBeat':
        navigator.vibrate(Math.round(25 * multiplier));
        break;
    }
  } catch (err) {
    // Vibration blocked by browser permissions or unsupported device
    console.debug('Haptic feedback unavailable:', err);
  }
}
