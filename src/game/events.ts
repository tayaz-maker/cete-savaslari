import { clamp, pick, randInt } from "@/lib/utils";
import { EVENT_CHANCE, ESTATE_MAP, HEALTH_MAX } from "./data";
import { energyMax, staminaMax } from "./formulas";
import type { LogEntry, Player, Rival } from "./types";

export type Slice = {
  player: Player;
  rivals: Rival[];
  logs: LogEntry[];
};

export type EventPatch = {
  player?: Player;
  rivals?: Rival[];
  text: string;
  kind?: LogEntry["kind"];
  money?: number;
};

function isNight(p: Player) {
  return p.saat >= 22 || p.saat < 5;
}

export function pickWorldEvent(s: Slice): EventPatch | null {
  if (s.player.durum !== "serbest") return null;
  if (s.player.eventCooldown > 0) return null;
  if (Math.random() > EVENT_CHANCE) return null;
  const pool = TABLE.filter((e) => e.ok(s));
  if (!pool.length) return null;
  const total = pool.reduce((a, e) => a + e.weight, 0);
  let roll = Math.random() * total;
  const picked =
    pool.find((e) => {
      roll -= e.weight;
      return roll <= 0;
    }) ?? pool[pool.length - 1];
  return picked.build(s);
}

type Ev = {
  weight: number;
  ok: (s: Slice) => boolean;
  build: (s: Slice) => EventPatch;
};

function p(s: Slice, patch: Partial<Player>, text: string, money?: number): EventPatch {
  return { player: { ...s.player, ...patch }, text, money };
}

const TABLE: Ev[] = [
  {
    weight: 3,
    ok: (s) => (s.player.jobsDone ?? 0) >= 5,
    build: (s) => {
      const m = randInt(1800, 9000);
      return p(
        s,
        { cash: s.player.cash + m },
        `Eski bir dost, Telegram'dan yazıp borcunu getirdi. +${m.toLocaleString("tr-TR")} ₺`,
        m,
      );
    },
  },
  {
    weight: 3,
    ok: () => true,
    build: (s) => {
      if (s.player.rusvet >= 6) {
        return p(
          s,
          { rusvet: s.player.rusvet - 6 },
          "E-5 üzerinde çevrilme. Ehliyet yerine selam, tanıdık çıktı. −6 rüşvet bütçesi.",
        );
      }
      const c = Math.max(200, Math.round(s.player.cash * 0.06));
      return p(
        s,
        { cash: Math.max(0, s.player.cash - c) },
        `Yolda çevirme. Nakit aldılar. −${c.toLocaleString("tr-TR")} ₺`,
        -c,
      );
    },
  },
  {
    weight: 2,
    ok: () => true,
    build: (s) =>
      p(s, { itibar: s.player.itibar + 4 }, "Mahallede bir kavgayı ayırdın. Esnaf gruplarında adın döndü. +4 itibar."),
  },
  {
    weight: 2,
    ok: () => true,
    build: (s) => {
      const h = randInt(6, 14);
      return p(
        s,
        { health: clamp(s.player.health - h, 8, HEALTH_MAX) },
        `Kimliği belirsiz biri araca taş attı, cam elini kesti. −${h} can.`,
      );
    },
  },
  {
    weight: 2,
    ok: (s) => s.player.properties.length > 0,
    build: (s) => {
      const id = pick(s.player.properties);
      const m = ESTATE_MAP[id];
      const c = m ? m.hourlyIncome * 2 : 800;
      return p(
        s,
        { cash: Math.max(0, s.player.cash - c) },
        `${m?.name ?? "Mekan"} zabıta ve sivil ekipten yem oldu. Ceza −${c.toLocaleString("tr-TR")} ₺`,
        -c,
      );
    },
  },
  {
    weight: 2,
    ok: (s) => isNight(s.player) && (s.player.buzz ?? 0) > 0,
    build: (s) => {
      const m = randInt(900, 4200);
      return p(
        s,
        { cash: s.player.cash + m },
        `Gece yarısı lounge çıkışı: masadan unutulan kart ve nakit. +${m.toLocaleString("tr-TR")} ₺`,
        m,
      );
    },
  },
  {
    weight: 2,
    ok: (s) => (s.player.usdt ?? 0) > 0,
    build: (s) => {
      if (Math.random() < 0.5) {
        const m = randInt(2500, 14000);
        return p(
          s,
          { cash: s.player.cash + m },
          `Kripto cüzdana yanlışlıkla düşen USDT'yi nakite çevirdin. +${m.toLocaleString("tr-TR")} ₺`,
          m,
        );
      }
      const m = Math.max(400, Math.round(s.player.cash * 0.08));
      return p(
        s,
        { cash: Math.max(0, s.player.cash - m) },
        `Sahte kurye kapıyı çaldı, "Trendyol iade" dedi. −${m.toLocaleString("tr-TR")} ₺`,
        -m,
      );
    },
  },
  {
    weight: 2,
    ok: () => true,
    build: (s) => {
      const eMax = energyMax(s.player.level, s.player.neighborhood);
      return p(
        s,
        { energy: clamp(s.player.energy - 5, 0, eMax) },
        "Ekipler drone kaldırmış. Köşe başı bir süre ölü. −5 mermi & takat.",
      );
    },
  },
  {
    weight: 2,
    ok: () => true,
    build: (s) => {
      const sMax = staminaMax(s.player.level);
      return p(
        s,
        {
          stamina: clamp(s.player.stamina + 4, 0, sMax),
          itibar: s.player.itibar + 2,
        },
        "Düğün konvoyu semti kilitledi. Polis meşgul, sen görünür oldun. +4 racon.",
      );
    },
  },
  {
    weight: 1,
    ok: (s) => !!s.player.equippedVehicle,
    build: (s) => {
      const c = randInt(1200, 6500);
      return p(
        s,
        { cash: Math.max(0, s.player.cash - c) },
        `HGS kaçak, EDS yedi. Plaka senin değil ama ceza geldi. −${c.toLocaleString("tr-TR")} ₺`,
        -c,
      );
    },
  },
  {
    weight: 2,
    ok: (s) => s.rivals.some((r) => r.hospitalTicks === 0),
    build: (s) => {
      const live = s.rivals.filter((r) => r.hospitalTicks === 0);
      const r = pick(live);
      return {
        rivals: s.rivals.map((x) =>
          x.id === r.id ? { ...x, bounty: x.bounty + 18000 } : x,
        ),
        text: `Sokak spekülasyonu: ${r.name} için 18.000 ₺ konuşuluyor. Liste ısındı.`,
        kind: "bounty",
      };
    },
  },
  {
    weight: 1,
    ok: (s) => s.player.cash >= 4000,
    build: (s) => {
      const m = randInt(1500, 5000);
      return p(
        s,
        {
          cash: s.player.cash - m,
          rusvet: s.player.rusvet + 8,
        },
        `Karakola kumanya + karton çay. Amirin hatırını aldın. −${m.toLocaleString("tr-TR")} ₺ · +8 rüşvet`,
        -m,
      );
    },
  },
  {
    weight: 1,
    ok: () => true,
    build: (s) =>
      p(
        s,
        { itibar: Math.max(0, s.player.itibar - 3) },
        "Instagram reels'ında suratın dönmüş. Mahalle gülüyor, racon incindi. −3 itibar.",
      ),
  },
];
