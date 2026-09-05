const KEY = "cete-push";

export function pushPref() {
  if (typeof window === "undefined") return "unset";
  const v = window.localStorage.getItem(KEY);
  if (v === "0") return "off";
  if (v === "1") return "on";
  return "unset";
}

export function setPushPref(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, on ? "1" : "0");
}

export async function askPushOnce() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (pushPref() !== "unset") return;
  if (Notification.permission !== "default") {
    setPushPref(Notification.permission === "granted");
    return;
  }
  try {
    const perm = await Notification.requestPermission();
    setPushPref(perm === "granted");
  } catch {
    setPushPref(false);
  }
}

export function pingStreetIfHidden() {
  if (typeof document === "undefined") return;
  if (document.visibilityState !== "hidden") return;
  if (pushPref() !== "on") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const n = new Notification("Çete Savaşları", {
      body: "1 saatin doldu, sokak seni bekliyor.",
      data: { url: "/cete-savaslari" },
    });
    n.onclick = () => {
      window.focus();
      window.location.href = "/cete-savaslari";
    };
  } catch {
    /* ignore */
  }
}
