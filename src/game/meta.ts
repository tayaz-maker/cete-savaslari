import type { Player } from "./types";

export const ACHIEVEMENTS: { id: string; label: string }[] = [
  { id: "ilk_milyon", label: "İlk milyon" },
  { id: "is_100", label: "100 iş" },
  { id: "semt_hepsi", label: "Dört semt" },
  { id: "sezon_baba", label: "İstanbul'un babası" },
  { id: "seri_7", label: "7 günlük seri" },
];

export function unlockAchievements(p: Player): { player: Player; unlocked: string[] } {
  const have = new Set(p.achievements ?? []);
  const unlocked: string[] = [];
  const mark = (id: string) => {
    if (!have.has(id)) {
      have.add(id);
      unlocked.push(id);
    }
  };
  const nakit = p.cash + p.bank;
  if (nakit >= 1_000_000) mark("ilk_milyon");
  if ((p.jobsDone ?? 0) >= 100) mark("is_100");
  const turf = p.turf ?? { eyup: 0, tarlabasi: 0, kadikoy: 0, sultangazi: 0 };
  if (Object.values(turf).every((v) => v > 0)) mark("semt_hepsi");
  if (p.pendingSeasonCeremony?.title === "İstanbul'un babası") mark("sezon_baba");
  if ((p.streak ?? 0) >= 7) mark("seri_7");
  if (!unlocked.length) return { player: p, unlocked };
  return { player: { ...p, achievements: [...have] }, unlocked };
}

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function applyDailyStreak(p: Player): Player {
  const today = todayKey();
  if (p.streakDay === today) return p;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yest = todayKey(y);
  const cont = p.streakDay === yest;
  const streak = cont ? (p.streak || 0) + 1 : 1;
  const cash = 400 + streak * 150;
  const xp = 2 + Math.min(8, streak);
  return {
    ...p,
    streak,
    streakDay: today,
    cash: p.cash + cash,
    xp: p.xp + xp,
  };
}
