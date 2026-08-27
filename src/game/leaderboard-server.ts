import { createServerFn } from "@tanstack/react-start";

export type BoardRow = { name: string; score: number; hood: string };

const MOCK: BoardRow[] = [
  { name: "Piranha Orhan", score: 420, hood: "eyup" },
  { name: "Haydar Usta", score: 310, hood: "kadikoy" },
  { name: "Cemile Ablası", score: 240, hood: "tarlabasi" },
  { name: "Sultan Gazi", score: 180, hood: "sultangazi" },
  { name: "Kambur Rıza", score: 90, hood: "eyup" },
];

export const fetchLeaderboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<BoardRow[]> => {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const fromState = await sql<{ name: string; score: number; hood: string }>`
        select
          coalesce(state->'player'->>'name', 'Adsız') as name,
          coalesce((state->'player'->>'seasonScore')::numeric, 0) as score,
          coalesce(state->'player'->>'neighborhood', 'eyup') as hood
        from saves
        where state->'player' is not null
        order by coalesce((state->'player'->>'seasonScore')::numeric, 0) desc
        limit 20
      `.catch(() => [] as { name: string; score: number; hood: string }[]);
      if (fromState.length) return fromState.map((r) => ({ ...r, score: Number(r.score) }));
      const fromPayload = await sql<{ payload: string }>`
        select payload from game_saves limit 40
      `.catch(() => [] as { payload: string }[]);
      const rows: BoardRow[] = [];
      for (const r of fromPayload) {
        try {
          const j = JSON.parse(r.payload) as {
            player?: { name?: string; seasonScore?: number; neighborhood?: string };
          };
          if (!j.player?.name) continue;
          rows.push({
            name: j.player.name,
            score: Number(j.player.seasonScore ?? 0),
            hood: j.player.neighborhood ?? "eyup",
          });
        } catch {
          /* skip */
        }
      }
      rows.sort((a, b) => b.score - a.score);
      if (rows.length) return rows.slice(0, 20);
    } catch {
      /* preview / no db */
    }
    return MOCK;
  },
);
