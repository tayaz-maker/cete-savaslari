const KEY = "cete-haptic";

export function hapticEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) !== "0";
}

export function setHaptic(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, on ? "1" : "0");
}

export function haptic(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !hapticEnabled()) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

export function hapticOk() {
  haptic(20);
}

export function hapticFail() {
  haptic([40, 20, 40]);
}

export function hapticWin() {
  haptic([15, 15, 15]);
}
