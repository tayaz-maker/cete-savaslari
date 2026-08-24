import { useEffect } from "react";
import { clockStamp } from "./clock";
import { dropSave, loadSave, putSave, type CloudSave } from "./save-server";
import { useGame } from "./store";
import type { Player } from "./types";

/**
 * Bulut kaydı senkronu — isim anahtarlı, giriş yok.
 *
 * Tasarım kuralları:
 * - Oyun asla senkrona bağımlı olmaz. Sunucu yoksa/patlarsa her çağrı sessizce
 *   yutulur ve oyun localStorage üzerinden aynen sürer (DATABASE_URL ayarlı
 *   değilken de durum budur).
 * - Çakışmada "daha ileri olan kazanır": ölçüt clockStamp, yani oyun içi geçen
 *   toplam dakika. Monoton arttığı için yeni açılmış bir kayıt saatlerce
 *   oynanmışın üstüne yazamaz.
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

/** Senkron hiçbir koşulda oyunu düşürmesin. */
async function quiet<T>(op: () => Promise<T>): Promise<T | null> {
  try {
    return await op();
  } catch {
    return null;
  }
}

/** İsimdeki bulut kaydını getir. Yoksa/erişilemezse null. */
export function fetchCloudSave(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return Promise.resolve(null);
  return quiet(() => loadSave({ data: { name: trimmed } }));
}

/** Mevcut durumu buluta yaz. Sunucu daha ileriyse yazmaz (SQL'de korunur). */
export function pushCloudSave(): Promise<CloudSave | null> {
  const s = slice();
  if (!s.player?.name) return Promise.resolve(null);
  return quiet(() =>
    putSave({
      data: {
        name: s.player!.name,
        state: s as unknown as Record<string, unknown>,
        progress: progressOf(s.player),
      },
    }),
  );
}

/** "Dosyayı yak" — bulut kaydını da sil. */
export function deleteCloudSave(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return Promise.resolve(null);
  return quiet(() => dropSave({ data: { name: trimmed } }));
}

/**
 * Yükleme aralığı. Oyun 2 saniyede bir tick attığı için "değişince gönder"
 * yaklaşımı saniyede bir istek demek olurdu; onun yerine sabit aralıkta
 * yoklayıp yalnızca ilerleme gerçekten değiştiyse gönderiyoruz.
 */
const PUSH_EVERY_MS = 10_000;

/**
 * Açılışta bir kez uzlaştır, sonra düzenli aralıkla yükle.
 *
 * Açılış: sunucudaki ilerleme yereldekinden büyükse onu benimse (başka cihazda
 * oynanmış), değilse yereli yukarı it. Bu sıra, telefonundaki uzun soluklu
 * kaydın yeni açılmış bir cihaz yüzünden kaybolmasını engeller.
 */
export function useSaveSync(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    // Son başarıyla gönderilen ilerleme; değişmediyse tekrar göndermeyiz.
    let pushed = -1;

    const push = async () => {
      const now = progressOf(useGame.getState().player);
      if (now === pushed) return;
      const res = await pushCloudSave();
      if (res) pushed = now;
    };

    const reconcile = async () => {
      const player = useGame.getState().player;
      if (!player?.name) return;
      const cloud = await fetchCloudSave(player.name);
      if (stopped) return;
      const local = progressOf(useGame.getState().player);
      if (cloud && cloud.progress > local) {
        useGame.getState().adoptCloudSave(cloud.state);
        pushed = cloud.progress;
        return;
      }
      await push();
    };

    void reconcile();

    const timer = setInterval(() => {
      if (!stopped) void push();
    }, PUSH_EVERY_MS);

    // Sekme kapanırken/arka plana geçerken son hâli kaçırma — telefonda
    // uygulamadan çıkış çoğu zaman yalnızca bunu tetikler.
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
  }, [active]);
}
