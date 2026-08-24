import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

/**
 * İsim tabanlı bulut kaydı. Giriş sistemi yok: ismi bilen kayda erişir, bu
 * bilinçli bir tercih (bkz. migrations/0002_saves.sql). Buraya kişisel veri
 * yazılmaz.
 *
 * DATABASE_URL ayarlı değilken db.ts bellek içi PGLite'a düşer; o hâlde bu
 * fonksiyonlar hata vermeden çalışır ama kalıcı olmaz. Çağıran taraf
 * (save-sync.ts) her çağrıyı yutar, böylece senkron çalışmasa da oyun
 * localStorage üzerinden sorunsuz sürer.
 */

/** "  Troy " -> "troy". Aynı ismin her yazımı aynı kaydı açsın. */
export function nameKey(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
}

/** Sunucu fonksiyonu sınırından geçebilen JSON değerleri. */
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

/** store'un kalıcı dilimi, JSON hâliyle. */
export type SaveState = { [key: string]: Json };

const nameInput = z.object({ name: z.string().trim().min(1).max(24) });

/**
 * Dilimin derin şekli burada doğrulanmaz — gelen kayıt zaten istemcide
 * normalizeSlice/hydratePlayer'dan geçiyor. Burada sadece nesne olduğu ve
 * makul boyutta kaldığı garanti edilir.
 */
const MAX_STATE_BYTES = 512 * 1024;

const stateSchema = z.custom<SaveState>(
  (v) =>
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    JSON.stringify(v).length <= MAX_STATE_BYTES,
  { message: "state must be a JSON object under 512KB" },
);

const saveInput = nameInput.extend({
  state: stateSchema,
  progress: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});

export type CloudSave = {
  name: string;
  state: SaveState;
  progress: number;
};

/** İsimdeki kaydı getir; yoksa null. */
export const loadSave = createServerFn({ method: "POST" })
  .validator((d: unknown) => nameInput.parse(d))
  .handler(async ({ data }): Promise<CloudSave | null> => {
    const sql = await getSql();
    const rows = await sql<{
      name: string;
      state: SaveState;
      progress: number;
    }>`
      select name, state, progress from saves where name_key = ${nameKey(data.name)}
    `;
    const row = rows[0];
    return row
      ? { name: row.name, state: row.state, progress: Number(row.progress) }
      : null;
  });

/**
 * Kaydı yaz. Sunucudaki ilerleme daha büyükse dokunma ve mevcut kaydı geri ver
 * — bu, başka cihazda ilerlemiş bir oyunun zayıf bir kaydın altında kalmasını
 * engeller. Karşılaştırma tek SQL içinde yapılır ki iki cihaz aynı anda
 * yazdığında araya girme olmasın.
 */
export const putSave = createServerFn({ method: "POST" })
  .validator((d: unknown) => saveInput.parse(d))
  .handler(async ({ data }): Promise<CloudSave | null> => {
    const sql = await getSql();
    const key = nameKey(data.name);
    await sql`
      insert into saves (name_key, name, state, progress, updated_at)
      values (${key}, ${data.name.trim()}, ${JSON.stringify(data.state)}::jsonb, ${data.progress}, now())
      on conflict (name_key) do update
        set state      = excluded.state,
            name       = excluded.name,
            progress   = excluded.progress,
            updated_at = now()
      where saves.progress <= excluded.progress
    `;
    const rows = await sql<{
      name: string;
      state: SaveState;
      progress: number;
    }>`
      select name, state, progress from saves where name_key = ${key}
    `;
    const row = rows[0];
    return row
      ? { name: row.name, state: row.state, progress: Number(row.progress) }
      : null;
  });

/** "Dosyayı yak": bulut kaydını da sil. Yalnızca tek isme dokunur. */
export const dropSave = createServerFn({ method: "POST" })
  .validator((d: unknown) => nameInput.parse(d))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`delete from saves where name_key = ${nameKey(data.name)}`;
    return { ok: true };
  });
