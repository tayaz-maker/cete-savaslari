import { useEffect } from "react";
import { clockStamp } from "./clock";
import { dropSave, loadSave, putSave, type CloudSave } from "./sb-save";
import { useGame } from "./store";
import type { Player } from "./types";

/**
 * Bulut kaydı senkronu — yalnızca oturum açıkken çalışır. Oturum yoksa (misafir
 * oynanış) tüm çağrılar no-op'tur ve oyun sadece localStorage üzerinden sürer;
 * bu, useSaveSync'in `signedIn` argümanıyla tamamen kapatılmasıyla sağlanır.
 *
 * Tasarım kuralları:
 * - Oyun asla senkrona bağımlı olmaz. Sunucu hatası her çağrıda sessizce
 *   yutulur (`quiet()`).
 * - Çakışmada "daha ileri olan kazanır": ölçüt clockStamp, yani oyun içi geçen
 *   toplam dakika (monoton artar).
 */

/** Oyun içi geçen toplam dakika; kayıtlar arası "kim daha ileri" ölçütü. */
export function progressOf(player: Player | null) {
  return player ? Math.max(0, clockStamp(player)) : 0;
}

/** store'un kalıcı dilimi — persist partialize ile aynı şekil. */
function slice() {
  const s = useGame.getState();
  return {
    version: s.version,
    player: s.player,
    rivals: s.rivals,
    logs: s.logs.slice(0, 40),
    hiz: s.hiz,
    market: s.market,
  };
}

async function quiet<T>(op: () => Promise<T>): Promise<T | null> {
  try {
    return await op();
  } catch {
    return null;
  }
}

/** Oturum sahibinin bulut kaydını getir. Yoksa/erişilemezse null. */
export function fetchCloudSave() {
  return quiet(() => loadSave());
}

/** Mevcut durumu buluta yaz. Sunucu daha ileriyse yazmaz (SQL'de korunur). */
export function pushCloudSave(): Promise<CloudSave | null> {
  const s = slice();
  if (!s.player) return Promise.resolve(null);
  return quiet(() =>
    putSave({
      state: s as unknown as import("./sb-save").SaveState,
      progress: progressOf(s.player),
    }),
  );
}

/** Bulut kaydını sil (yalnızca oturum sahibinin kendi satırı). */
export function deleteCloudSave() {
  return quiet(() => dropSave());
}

/**
 * Bulutla yereli tek seferlik uzlaştırma: sunucudaki ilerleme yereldekinden
 * büyükse onu benimse (başka cihazda oynanmış), değilse yereli yukarı it.
 *
 * Hem düzenli senkron döngüsü hem de giriş/kayıt anındaki "az önce oturum
 * açtım, taze cihazda hiç oyuncu yok" durumu (account-panel.tsx) BUNU çağırır
 * — GameShell henüz monte olmamışken bile (o zaman `useSaveSync`'in effect'i
 * hiç çalışmamış olur) kaydın gelmesi gereken tek yer burası.
 *
 * @returns benimsenen ilerleme varsa onun değeri, yoksa (push edildiyse ya da
 *   başarısız olduysa) gönderilen ilerleme.
 */
export async function reconcileOnce(): Promise<number> {
  const cloud = await fetchCloudSave();
  const local = progressOf(useGame.getState().player);
  if (cloud && cloud.progress > local) {
    useGame.getState().adoptCloudSave(cloud.state);
    return cloud.progress;
  }
  const res = await pushCloudSave();
  return res ? local : -1;
}

const PUSH_EVERY_MS = 10_000;

/** Oturum açıkken: açılışta bir kez uzlaştır, sonra düzenli aralıkla yükle. */
export function useSaveSync(signedIn: boolean) {
  useEffect(() => {
    if (!signedIn) return;
    let stopped = false;
    let pushed = -1;

    const push = async () => {
      const now = progressOf(useGame.getState().player);
      if (now === pushed) return;
      const res = await pushCloudSave();
      if (res) pushed = now;
    };

    void reconcileOnce().then((p) => {
      if (!stopped && p >= 0) pushed = p;
    });

    const timer = setInterval(() => {
      if (!stopped) void push();
    }, PUSH_EVERY_MS);

    const onHide = () => {
      if (document.visibilityState === "hidden") void push();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      void pushCloudSave();
    };
  }, [signedIn]);
}
