import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

/**
 * Hesap tabanlı bulut kaydı. Her fonksiyon authMiddleware üzerinden geçer,
 * yani satır her zaman `context.userId` — doğrulanmış oturumun sahibi —
 * üzerinden okunur/yazılır. Kimse başkasının kaydına isim bilerek giremez
 * (önceki tasarımın aksine).
 */

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

const MAX_STATE_BYTES = 512 * 1024;

const stateSchema = z.custom<SaveState>(
  (v) =>
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    JSON.stringify(v).length <= MAX_STATE_BYTES,
  { message: "state must be a JSON object under 512KB" },
);

const saveInput = z.object({
  state: stateSchema,
  progress: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});

export type CloudSave = { state: SaveState; progress: number };

/** Oturum sahibinin kaydını getir; yoksa null. */
export const loadSave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CloudSave | null> => {
    const sql = await getSql();
    const rows = await sql<{ state: SaveState; progress: number }>`
      select state, progress from saves where user_id = ${context.userId}
    `;
    const row = rows[0];
    return row ? { state: row.state, progress: Number(row.progress) } : null;
  });

/**
 * Kaydı yaz. Sunucudaki ilerleme daha büyükse dokunma ve mevcut kaydı geri ver
 * — böylece iki cihaz aynı anda yazarsa geride kalan öndekini ezemez.
 * Karşılaştırma tek SQL içinde yapılır (race yok).
 */
export const putSave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => saveInput.parse(d))
  .handler(async ({ data, context }): Promise<CloudSave | null> => {
    const sql = await getSql();
    const ident = await sql<{ verified: boolean; email: string }>`
      select "emailVerified" as verified, email from "user"
      where id = ${context.userId} limit 1
    `;
    const row0 = ident[0];
    if (
      row0 &&
      row0.verified === false &&
      row0.email &&
      !row0.email.endsWith("@cete-savaslari.local")
    ) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }
    await sql`
      insert into saves (user_id, state, progress, updated_at)
      values (${context.userId}, ${JSON.stringify(data.state)}::jsonb, ${data.progress}, now())
      on conflict (user_id) do update
        set state      = excluded.state,
            progress   = excluded.progress,
            updated_at = now()
      where saves.progress <= excluded.progress
    `;
    const rows = await sql<{ state: SaveState; progress: number }>`
      select state, progress from saves where user_id = ${context.userId}
    `;
    const row = rows[0];
    return row ? { state: row.state, progress: Number(row.progress) } : null;
  });

/** "Dosyayı yak": bulut kaydını da sil. */
export const dropSave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`delete from saves where user_id = ${context.userId}`;
    return { ok: true };
  });
