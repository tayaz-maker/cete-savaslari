const KEY = "cete-analytics";
const CAP = 50;

export type TrackProps = Record<string, string | number | boolean | null | undefined>;

function readBuf(): { name: string; at: number; props?: TrackProps }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function track(name: string, props?: TrackProps) {
  if (typeof window === "undefined") return;
  const row = { name, at: Date.now(), props };
  const next = [row, ...readBuf()].slice(0, CAP);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  const plausible = (window as unknown as { plausible?: (n: string, o?: { props?: TrackProps }) => void }).plausible;
  if (typeof plausible === "function") {
    try {
      plausible(name, props ? { props } : undefined);
    } catch {
      /* no-op */
    }
  }
}
