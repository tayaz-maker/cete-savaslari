import { clamp, pick, randInt, uid } from "@/lib/utils";
import {
  BANK_RATE_PER_TICK,
  CLINIC_HEALTH_PER_TICK,
  CONTRACTS,
  ENERGY_PER_TICK,
  ESTATE_MAP,
  EVENT_COOLDOWN,
  HEALTH_MAX,
  HEALTH_PER_TICK,
  HEAT_MAX,
  HOSPITAL_THRESHOLD,
  HOOD_IDS,
  JAIL_TICKS,
  LIFE_KID_HOURLY,
  LOG_CAP,
  MARKET_START,
  SEASON_DAYS,
  STAMINA_PER_TICK,
  TICK_MINUTES,
  TICKS_PER_HOUR,
  crewWageHourly,
  estateIncomeHourly,
  koseWeekly,
  migrateHood,
  turfHaraçHourly,
  walkMarket,
} from "./data";
import { pickWorldEvent } from "./events";
import { energyMax, staminaMax } from "./formulas";
import type { LogEntry, Market, Player, Rival } from "./types";

export function clockStamp(p: Player) {
  return ((p.gun - 1) * 24 + p.saat) * 60 + p.dakika;
}

export function formatClock(p: Player) {
  return `GÜN ${p.gun} — ${pad(p.saat)}:${pad(p.dakika)}`;
}

export function formatStamp(at: number) {
  if (at > 1e11) {
    return new Date(at).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const m = ((at % 60) + 60) % 60;
  const h = Math.floor(at / 60) % 24;
  return `${pad(h)}:${pad(m)}`;
}

export function formatTicksAsMinutes(ticks: number) {
  return `${Math.max(0, ticks) * TICK_MINUTES} dk`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function pushLog(
  logs: LogEntry[],
  player: Player,
  kind: LogEntry["kind"],
  text: string,
  moneyDelta?: number,
): LogEntry[] {
  return [
    { id: uid(), at: clockStamp(player), kind, text, moneyDelta },
    ...logs,
  ].slice(0, LOG_CAP);
}

export function canAct(player: Player) {
  return (
    player.durum === "serbest" && player.health >= HOSPITAL_THRESHOLD
  );
}

export type WorldSlice = {
  player: Player;
  rivals: Rival[];
  logs: LogEntry[];
  market: Market;
};

export function applyTick(s: WorldSlice): WorldSlice {
  let p: Player = { ...s.player };
  let logs = s.logs;
  const prevUsdt = s.market?.usdt ?? MARKET_START.usdt;
  const market = walkMarket(s.market ?? MARKET_START);
  if (Math.abs(market.usdt - prevUsdt) / prevUsdt > 0.04) {
    logs = pushLog(
      logs,
      p,
      "invest",
      market.usdt > prevUsdt
        ? `USDT fırladı. ${prevUsdt.toFixed(1)} → ${market.usdt.toFixed(1)} ₺.`
        : `USDT çöktü. ${prevUsdt.toFixed(1)} → ${market.usdt.toFixed(1)} ₺.`,
    );
  }

  p.dakika += TICK_MINUTES;
  if (p.dakika >= 60) {
    p.dakika = 0;
    p.saat += 1;
  }
  const newDay = p.saat >= 24;
  if (newDay) {
    p.saat = 0;
    p.gun += 1;
    logs = pushLog(logs, p, "system", `Yeni gün. ${p.gun}. gün sokakta.`);
    const elapsed = p.gun - (p.seasonGun || 1);
    if (elapsed >= SEASON_DAYS) {
      logs = pushLog(
        logs,
        p,
        "system",
        `Sezon kapandı. Skor ${Math.round(p.seasonScore)}. Sokak unutur, sen unutma.`,
      );
      p.seasonScore = 0;
      p.seasonGun = p.gun;
    }
    if (!p.contractId || p.gun > (p.contractGun || 0) + 1) {
      const pool = CONTRACTS.filter((c) => c.id !== p.contractId);
      const c = pick(pool.length ? pool : CONTRACTS);
      p.contractId = c.id;
      p.contractGun = p.gun;
      logs = pushLog(
        logs,
        p,
        "contract",
        `${c.npc} aradı: ${c.text}`,
      );
    }
    if (p.senet && p.gun >= p.senet.dueGun) {
      const due = p.senet;
      p.senet = null;
      if (due.kind === "alacak") {
        p.bank += due.amount;
        logs = pushLog(
          logs,
          p,
          "bank",
          `Senet döndü. ${due.name} ${due.amount.toLocaleString("tr-TR")} ₺'yi kasaya yatırdı.`,
          due.amount,
        );
      } else {
        let left = due.amount;
        const fromCash = Math.min(p.cash, left);
        p.cash -= fromCash;
        left -= fromCash;
        const fromBank = Math.min(p.bank, left);
        p.bank -= fromBank;
        left -= fromBank;
        if (left > 0) {
          p.isi = clamp(p.isi + 22, 0, HEAT_MAX);
          p.itibar = Math.max(0, p.itibar - 8);
          logs = pushLog(
            logs,
            p,
            "bank",
            `Senet ödenmedi. ${due.name} faizle geldi. Emniyet yükseldi, itibar düştü. Kalan ${left.toLocaleString("tr-TR")} ₺ silindi.`,
          );
        } else {
          logs = pushLog(
            logs,
            p,
            "bank",
            `Borç kapatıldı. ${due.name} ${due.amount.toLocaleString("tr-TR")} ₺ kesti.`,
            -due.amount,
          );
        }
      }
    }
    if (p.kose > 0 && p.gun - (p.koseGun || p.gun) >= 7) {
      const pay = koseWeekly(p);
      p.koseGun = p.gun;
      const raid =
        Math.random() <
        (0.09 + p.isi / 450) * (p.crew.includes("gozcu") ? 0.7 : 1);
      if (raid) {
        p.isi = clamp(p.isi + 14, 0, HEAT_MAX);
        if (Math.random() < 0.35 && p.kose > 1) p.kose -= 1;
        if (Math.random() < 0.18 && p.durum === "serbest") {
          p.durum = "nezaret";
          p.durumTick = JAIL_TICKS;
        }
        logs = pushLog(
          logs,
          p,
          "invest",
          "Devriye köşeyi dağıttı. Haftalık yandı.",
        );
      } else {
        p.cash += pay;
        p.isi = clamp(p.isi + 4, 0, HEAT_MAX);
        logs = pushLog(
          logs,
          p,
          "invest",
          `Köşe haftalık getirdi. +${pay.toLocaleString("tr-TR")} ₺.`,
          pay,
        );
      }
    }
  }

  const eMax = energyMax(p.level, p.neighborhood);
  const sMax = staminaMax(p.level);

  const decay = p.crew.includes("gozcu") ? 5 : 3;
  if (p.durum !== "serbest") p.isi = clamp(p.isi - decay - 2, 0, HEAT_MAX);
  else p.isi = clamp(p.isi - decay, 0, HEAT_MAX);

  if (p.durum === "klinik") {
    p.health = clamp(p.health + CLINIC_HEALTH_PER_TICK, 0, HEALTH_MAX);
    p.durumTick -= 1;
    if (p.durumTick <= 0) {
      p.durum = "serbest";
      p.durumTick = 0;
      p.health = HEALTH_MAX;
      logs = pushLog(
        logs,
        p,
        "clinic",
        "Doktor sırtını sıvazladı: dikişler tuttu, kalk git. Klinikten çıktın.",
      );
    }
  } else if (p.durum === "nezaret") {
    p.durumTick -= 1;
    if (p.durumTick <= 0) {
      p.durum = "serbest";
      p.durumTick = 0;
      logs = pushLog(
        logs,
        p,
        "jail",
        "Nezarethanenin kapısı açıldı. Serbestsin.",
      );
    }
  } else {
    p.energy = clamp(p.energy + ENERGY_PER_TICK, 0, eMax);
    p.stamina = clamp(p.stamina + STAMINA_PER_TICK, 0, sMax);
    if (p.health > 0) {
      p.health = clamp(p.health + HEALTH_PER_TICK, 0, HEALTH_MAX);
    }
  }

  p.buzz = Math.max(0, (p.buzz ?? 0) - 1);
  p.high = Math.max(0, (p.high ?? 0) - 1);

  if (p.horse) {
    p.horse = {
      ...p.horse,
      form: clamp(p.horse.form - 0.35, 10, 100),
    };
  }

  if (p.relations) {
    const rel = { ...p.relations };
    let dumped: string | null = null;
    for (const id of Object.keys(rel)) {
      const close = p.girlfriend === id;
      rel[id] = clamp((rel[id] ?? 0) - (close ? 0.18 : 0.45), 0, 100);
      if (close && rel[id] <= 0) dumped = id;
    }
    p.relations = rel;
    if (dumped) {
      p.girlfriend = null;
      logs = pushLog(logs, p, "life", "Gönül soğudu. Sevgili gitti.");
    }
  }

  if (p.bank > 0) {
    const acc = (p.bankAcc ?? 0) + p.bank * BANK_RATE_PER_TICK;
    const add = Math.floor(acc);
    p.bank += add;
    p.bankAcc = acc - add;
  }

  if (p.durum === "serbest") {
    let income = 0;
    for (const id of p.properties) {
      const e = ESTATE_MAP[id];
      if (e) income += estateIncomeHourly(p, e);
    }
    income += turfHaraçHourly(p);
    income -= crewWageHourly(p);
    income -= (p.kids ?? 0) * LIFE_KID_HOURLY;
    income = Math.floor(income / TICKS_PER_HOUR);
    if (income > 0) p.cash += income;
    else if (income < 0) {
      const need = -income;
      if (p.cash >= need) p.cash -= need;
      else {
        const rest = need - p.cash;
        p.cash = 0;
        p.bank = Math.max(0, p.bank - rest);
      }
    }
  }

  const turf = { ...(p.turf ?? {}) };
  for (const h of HOOD_IDS) {
    const v = turf[h] ?? 0;
    if (v <= 0) {
      turf[h] = 0;
      continue;
    }
    if (h === p.neighborhood)
      turf[h] =
        Math.round(clamp(v + (p.crew.length ? 0.55 : 0.28), 0, 100) * 10) / 10;
    else turf[h] = Math.round(clamp(v - 0.05, 0, 100) * 10) / 10;
  }
  p.turf = turf;

  let rivals = s.rivals.map((r) => ({
    ...r,
    hood: migrateHood(r.hood),
  }));
  for (const r of rivals) {
    if (!r.alive) continue;
    if (r.hospitalTicks > 0) {
      r.hospitalTicks -= 1;
      if (r.hospitalTicks <= 0) {
        r.hospitalTicks = 0;
        r.health = 70;
      }
      continue;
    }
    r.health = clamp(r.health + 5, 0, 100);
    r.cash += r.level * randInt(80, 220);
    if ((p.turf[r.hood] ?? 0) > 28 && Math.random() < 0.05) {
      p.turf = {
        ...p.turf,
        [r.hood]: clamp((p.turf[r.hood] ?? 0) - 1.4, 0, 100),
      };
    }
    if (r.bounty > 0 && r.health > 0 && Math.random() < 0.35) {
      r.health -= randInt(18, 42);
      if (r.health <= 0) {
        r.health = 0;
        r.hospitalTicks = 12;
        p.itibar += 12;
        const payout = Math.round(r.bounty * 0.7);
        p.cash += payout;
        r.bounty = 0;
        logs = pushLog(
          logs,
          p,
          "bounty",
          `Ölüm listesi işledi: ${r.name} topuktan vuruldu, kliniğe kaldırıldı.`,
          payout,
        );
      }
    }
  }

  if (
    p.durum === "serbest" &&
    p.isi >= 55 &&
    p.cash > 400 &&
    Math.random() < (p.crew.includes("gozcu") ? 0.04 : 0.1)
  ) {
    const live = rivals.filter((r) => r.hospitalTicks === 0);
    if (live.length) {
      const r = pick(live);
      const take = Math.min(p.cash, Math.round(p.cash * 0.08) + randInt(200, 900));
      p.cash -= take;
      r.cash += take;
      p.health = clamp(p.health - randInt(4, 12), 1, HEALTH_MAX);
      logs = pushLog(
        logs,
        p,
        "pvp",
        `${r.name} emniyet yüksekken semti taradı. Cebinden ${take.toLocaleString("tr-TR")} ₺ kaptı.`,
        -take,
      );
    }
  }

  if (p.durum === "serbest") {
    p.eventCooldown = Math.max(0, (p.eventCooldown ?? 0) - 1);
    const hit = pickWorldEvent({ player: p, rivals, logs });
    if (hit) {
      if (hit.player) p = hit.player;
      if (hit.rivals) rivals = hit.rivals;
      p = { ...p, eventCooldown: EVENT_COOLDOWN };
      logs = pushLog(logs, p, hit.kind ?? "system", hit.text, hit.money);
    }
  } else {
    p.eventCooldown = Math.max(0, (p.eventCooldown ?? 0) - 1);
  }

  return { player: p, rivals, logs, market };
}

export function applyTicks(s: WorldSlice, n: number): WorldSlice {
  let cur = s;
  const steps = Math.max(0, Math.min(48, n));
  for (let i = 0; i < steps; i++) {
    try {
      cur = applyTick(cur);
    } catch {
      break;
    }
  }
  return cur;
}
