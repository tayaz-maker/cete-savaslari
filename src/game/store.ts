import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clamp, pick, randInt } from "@/lib/utils";
import {
  applyTicks,
  canAct,
  pushLog,
} from "./clock";
import {
  ALL_MISSIONS,
  CLINIC_TICKS,
  CLINIC_VOLUNTARY_TICKS,
  CONTRACT_MAP,
  CREW_MAP,
  ESTATE_MAP,
  HEALTH_MAX,
  HEAT_MAX,
  HORSE_NAMES,
  HORSE_PRICE,
  HORSE_TRAIN,
  ITEM_MAP,
  JAIL_TICKS,
  JOB_FLAVOR,
  LIFE_KID_MAX,
  MARKET_START,
  PARTNER_MAP,
  PVP_STAMINA_COST,
  RACE_FIELD,
  RISK_HEAT,
  RIVAL_CLINIC_TICKS,
  SAVE_KEY,
  SAVE_VERSION,
  SELL_RATE,
  SPOUSES,
  TICKS_PER_HOUR,
  TURF_STAMINA,
  holdingOf,
  hoodName,
  koseUpgradeCost,
  pickRaceWinner,
  estateLevel,
  hydratePlayer,
  jobEnergyCost,
  makeRivals,
  migrateHood,
  upgradeCost,
  turfPressCash,
} from "./data";
import {
  applyXp,
  energyMax,
  jailChance,
  jobSuccessChance,
  lakap,
  playerCombat,
  RISK_DMG,
  staminaMax,
} from "./formulas";
import type {
  CrewId,
  FamilyChoice,
  GambleKind,
  InvestId,
  LifeId,
  Market,
  NeighborhoodId,
  Player,
  RelAct,
  Rival,
} from "./types";
import type { LogEntry } from "./types";

interface GameState {
  version: number;
  player: Player | null;
  rivals: Rival[];
  logs: LogEntry[];
  hiz: 1 | 2 | 4;
  market: Market;
  createPlayer: (name: string, neighborhood: NeighborhoodId) => void;
  tick: (n?: number) => void;
  skipHour: () => void;
  toggleHiz: () => void;
  doJob: (missionId: string) => void;
  buyItem: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  buyEstate: (estateId: string) => void;
  attackRival: (rivalId: string) => void;
  putBounty: (rivalId: string, amount: number) => void;
  huntBounty: (rivalId: string) => void;
  depositBribe: (amount: number) => void;
  payBribe: () => void;
  treatClinic: () => void;
  hireCrew: (id: CrewId) => void;
  fireCrew: (id: CrewId) => void;
  pressTurf: (hood: NeighborhoodId) => void;
  bankMove: (amount: number, dir: "in" | "out") => void;
  writeSenet: (kind: "alacak" | "borc", rivalId?: string) => void;
  upgradeEstate: (estateId: string) => void;
  live: (id: LifeId) => void;
  gamble: (kind: GambleKind, stake: number, pick?: string) => void;
  betRace: (index: number, stake: number) => void;
  buyHorse: () => void;
  trainHorse: () => void;
  raceHorse: () => void;
  relate: (partnerId: string, act: RelAct) => void;
  resolveFamily: (choice: FamilyChoice) => void;
  tradeInvest: (id: InvestId, dir: "al" | "sat", units: number) => void;
  fundKose: () => void;
  resetGame: () => void;
}

function neighborhoodName(id: NeighborhoodId) {
  return hoodName(id);
}

function bumpRel(p: Player, id: string, d: number): Player {
  const relations = { ...(p.relations ?? {}) };
  relations[id] = clamp((relations[id] ?? 0) + d, 0, 100);
  return { ...p, relations };
}

function knockOut(
  player: Player,
  logs: LogEntry[],
): { player: Player; logs: LogEntry[] } {
  const fee = Math.round(player.cash * 0.15);
  const next: Player = {
    ...player,
    cash: Math.max(0, player.cash - fee),
    health: 1,
    durum: "klinik",
    durumTick: CLINIC_TICKS,
  };
  return {
    player: next,
    logs: pushLog(
      logs,
      next,
      "clinic",
      `Canın sıfırlandı. Mafya doktorunun gizli kliniğine kaldırıldın. Tedavi ${fee.toLocaleString("tr-TR")} ₺ — nakitinin yüzde 15'i.`,
      -fee,
    ),
  };
}

function maybeLevelNotes(player: Player, notes: string[], logs: LogEntry[]) {
  let next = logs;
  for (const n of notes) next = pushLog(next, player, "system", n);
  return next;
}

const emptyPersist = {
  version: SAVE_VERSION,
  player: null as Player | null,
  rivals: [] as Rival[],
  logs: [] as LogEntry[],
  hiz: 1 as 1 | 2 | 4,
  market: { ...MARKET_START },
};

function parseHiz(v: unknown): 1 | 2 | 4 {
  return v === 2 || v === 4 ? v : 1;
}

function loadPersistedSlice() {
  if (typeof window === "undefined") return { ...emptyPersist, market: { ...MARKET_START } };
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...emptyPersist, market: { ...MARKET_START } };
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    const s = (parsed.state ?? parsed) as Record<string, unknown>;
    const playerRaw = s.player as Player | null | undefined;
    const player =
      playerRaw && typeof playerRaw === "object"
        ? hydratePlayer({
            ...playerRaw,
            name: playerRaw.name || "İsimsiz",
            neighborhood: migrateHood(playerRaw.neighborhood),
          })
        : null;
    const rivals = Array.isArray(s.rivals)
      ? (s.rivals as Rival[]).map((r) => ({
          ...r,
          hospitalTicks: r.hospitalTicks ?? 0,
          hood: migrateHood(r.hood),
        }))
      : [];
    const logs = Array.isArray(s.logs) ? (s.logs as LogEntry[]) : [];
    const market =
      s.market && typeof s.market === "object"
        ? { ...MARKET_START, ...(s.market as Market) }
        : { ...MARKET_START };
    return {
      version: SAVE_VERSION,
      player,
      rivals,
      logs,
      hiz: parseHiz(s.hiz),
      market,
    };
  } catch {
    return { ...emptyPersist, market: { ...MARKET_START } };
  }
}

const bootSlice = loadPersistedSlice();

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let persistPending: { name: string; value: string } | null = null;

function flushPersist() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (!persistPending || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(persistPending.name, persistPending.value);
  } catch {
    /* quota */
  }
  persistPending = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushPersist);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) flushPersist();
  });
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...emptyPersist,
      ...bootSlice,
      createPlayer: (name, neighborhood) => {
        const trimmed = name.trim().slice(0, 24) || "İsimsiz";
        const level = 1;
        const player = hydratePlayer({
          name: trimmed,
          neighborhood,
          level,
          xp: 0,
          energy: energyMax(level, neighborhood),
          stamina: staminaMax(level),
          health: HEALTH_MAX,
          cash: 0,
          rusvet: 0,
          itibar: neighborhood === "eyup" ? 5 : 0,
          inventory: ["w101"],
          equippedWeapon: "w101",
          incomeMult: neighborhood === "kadikoy" ? 1.15 : 1,
          contractId: "c101",
          contractGun: 1,
        });
        set({
          player,
          rivals: makeRivals(),
          logs: pushLog(
            [],
            player,
            "system",
            `${trimmed}, ${lakap(1)} olarak ${neighborhoodName(neighborhood)} sokaklarına indi. Elinde kırık bir Efes şişesi, cebin bomboş. İş yapmadan ₺ basmaz.`,
          ),
          hiz: 1,
          market: { ...MARKET_START },
        });
      },
      tick: (n = 1) => {
        const s = get();
        if (!s.player) return;
        const steps = Math.max(1, Math.min(8, Math.floor(n)));
        try {
          const next = applyTicks(
            {
              player: s.player,
              rivals: s.rivals,
              logs: s.logs,
              market: s.market ?? MARKET_START,
            },
            steps,
          );
          set(next);
        } catch {
          /* tick kilitlenmesin */
        }
      },
      skipHour: () => {
        const s = get();
        if (!s.player) return;
        try {
          const next = applyTicks(
            {
              player: s.player,
              rivals: s.rivals,
              logs: s.logs,
              market: s.market ?? MARKET_START,
            },
            TICKS_PER_HOUR,
          );
          set({
            ...next,
            logs: pushLog(
              next.logs,
              next.player,
              "system",
              "Bir saat geçti. Sokak kendi işini gördü.",
            ),
          });
        } catch {
          /* skipHour kilitlenmesin */
        }
      },
      toggleHiz: () => {
        const cur = get().hiz;
        set({ hiz: cur === 1 ? 2 : cur === 2 ? 4 : 1 });
      },
      doJob: (missionId) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        if (!canAct(player)) return;
        const mission = ALL_MISSIONS.find((m) => m.id === missionId);
        if (!mission) return;
        const cost = jobEnergyCost(player, mission.energyCost);
        if (player.energy < cost) return;
        const missing = (mission.requiredItems ?? []).filter(
          (id) => !player.inventory.includes(id),
        );
        if (missing.length) return;

        let next = {
          ...player,
          energy: player.energy - cost,
        };
        let logs = s.logs;
        const chance = jobSuccessChance(player, mission.risk, mission.id);
        const success = Math.random() < chance;
        const flavor = JOB_FLAVOR[mission.id];
        const heatAdd =
          (RISK_HEAT[mission.risk] ?? 8) + (success ? 0 : 6);

        if (success) {
          const cash = randInt(mission.rewardCashMin, mission.rewardCashMax);
          const xp = applyXp(next, mission.xpGain);
          let bonus = 0;
          let contractNote = "";
          const c = next.contractId ? CONTRACT_MAP[next.contractId] : null;
          if (c && c.missionId === mission.id) {
            bonus = c.bonus;
            contractNote = ` ${c.npc} bonus ${bonus.toLocaleString("tr-TR")} ₺.`;
            next.contractId = null;
          }
          next = {
            ...next,
            cash: next.cash + cash + bonus,
            xp: xp.xp,
            level: xp.level,
            energy: xp.notes.length ? xp.energy : next.energy,
            stamina: xp.notes.length ? xp.stamina : next.stamina,
            itibar: next.itibar + Math.max(1, Math.round(mission.xpGain / 4)),
            health: clamp(next.health - randInt(0, 4), 1, HEALTH_MAX),
            isi: clamp(next.isi + heatAdd, 0, HEAT_MAX),
            seasonScore: next.seasonScore + mission.xpGain + Math.round(cash / 800),
            jobsDone: (next.jobsDone ?? 0) + 1,
          };
          logs = pushLog(
            logs,
            next,
            "job",
            `${mission.name} — ${pick(flavor?.win ?? ["İş bitti."])} +${(cash + bonus).toLocaleString("tr-TR")} ₺.${contractNote} Emniyet ${Math.round(next.isi)}.`,
            cash + bonus,
          );
          logs = maybeLevelNotes(next, xp.notes, logs);
          set({ player: next, logs });
          return;
        }

        const [d0, d1] = RISK_DMG[mission.risk];
        const dmg = randInt(d0, d1);
        next.health = next.health - dmg;
        next.itibar = Math.max(0, next.itibar - 2);
        next.isi = clamp(next.isi + heatAdd, 0, HEAT_MAX);
        next.jobsDone = (next.jobsDone ?? 0) + 1;
        const busted = Math.random() < jailChance(player, mission.risk);

        if (next.health <= 0) {
          const ko = knockOut(next, logs);
          next = ko.player;
          logs = ko.logs;
          logs = pushLog(
            logs,
            next,
            "job",
            `${mission.name} — ${pick(flavor?.lose ?? ["İş patladı."])} Yerde kaldın.`,
          );
          set({ player: next, logs });
          return;
        }

        if (busted) {
          next = {
            ...next,
            durum: "nezaret",
            durumTick: JAIL_TICKS,
          };
          logs = pushLog(
            logs,
            next,
            "jail",
            `${mission.name} — ${pick(flavor?.lose ?? ["Devriye köşeyi döndü."])} Polis yakaladı. Bir saat nezarethane. Zarfı Klinik'ten uzatabilirsin.`,
          );
          set({ player: next, logs });
          return;
        }

        logs = pushLog(
          logs,
          next,
          "job",
          `${mission.name} — ${pick(flavor?.lose ?? ["Kaçtın."])} −${dmg} can.`,
        );
        set({ player: next, logs });
      },
      buyItem: (itemId) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        const item = ITEM_MAP[itemId];
        if (!item) return;
        if (player.inventory.includes(itemId)) return;
        if (player.cash < item.price) return;
        const next: Player = {
          ...player,
          cash: player.cash - item.price,
          inventory: [...player.inventory, itemId],
          itibar: player.itibar + (item.itibarBonus ?? 0),
        };
        if (item.kind === "weapon" && !player.equippedWeapon)
          next.equippedWeapon = itemId;
        if (item.kind === "armor" && !player.equippedArmor)
          next.equippedArmor = itemId;
        if (item.kind === "vehicle" && !player.equippedVehicle)
          next.equippedVehicle = itemId;
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "shop",
            `${item.name} alındı.`,
            -item.price,
          ),
        });
      },
      sellItem: (itemId) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        const item = ITEM_MAP[itemId];
        if (!item || item.price <= 0) return;
        if (!player.inventory.includes(itemId)) return;
        const refund = Math.round(item.price * SELL_RATE);
        const next: Player = {
          ...player,
          cash: player.cash + refund,
          inventory: player.inventory.filter((id) => id !== itemId),
          itibar: Math.max(0, player.itibar - (item.itibarBonus ?? 0)),
          equippedWeapon:
            player.equippedWeapon === itemId ? null : player.equippedWeapon,
          equippedArmor:
            player.equippedArmor === itemId ? null : player.equippedArmor,
          equippedVehicle:
            player.equippedVehicle === itemId ? null : player.equippedVehicle,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "shop",
            `${item.name} elden çıkarıldı. +${refund.toLocaleString("tr-TR")} ₺`,
            refund,
          ),
        });
      },
      equipItem: (itemId) => {
        const s = get();
        const player = s.player;
        if (!player || !player.inventory.includes(itemId)) return;
        const item = ITEM_MAP[itemId];
        if (!item) return;
        const next = { ...player };
        if (item.kind === "weapon") next.equippedWeapon = itemId;
        if (item.kind === "armor") next.equippedArmor = itemId;
        if (item.kind === "vehicle") next.equippedVehicle = itemId;
        set({ player: next });
      },
      buyEstate: (estateId) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        const estate = ESTATE_MAP[estateId];
        if (!estate) return;
        if (player.properties.includes(estateId)) return;
        if (player.cash < estate.cost) return;
        const next = {
          ...player,
          cash: player.cash - estate.cost,
          properties: [...player.properties, estateId],
          itibar: player.itibar + (estate.prestige ?? 8 + estate.hourlyIncome / 500),
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "estate",
            `${estate.name} senin. Saatlik ${estate.hourlyIncome.toLocaleString("tr-TR")} ₺ akar.`,
            -estate.cost,
          ),
        });
      },
      attackRival: (rivalId) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        if (!canAct(player)) return;
        if (player.stamina < PVP_STAMINA_COST) return;
        const rival = s.rivals.find((r) => r.id === rivalId);
        if (!rival || rival.hospitalTicks > 0) return;

        let next = { ...player, stamina: player.stamina - PVP_STAMINA_COST };
        const you = playerCombat(next);
        const rAtk = rival.attack * (0.85 + Math.random() * 0.3);
        const yAtk = you.atk * (0.85 + Math.random() * 0.3);
        const win = yAtk >= rAtk;
        let logs = s.logs;
        const rivals = s.rivals.map((r) => ({ ...r }));
        const target = rivals.find((r) => r.id === rivalId);
        if (!target) return;
        const jamNote = you.jammed
          ? " Hayalet Canik tutukluk yaptı."
          : "";

        if (win) {
          const takePct = 0.1 + Math.random() * 0.12;
          const loot = Math.max(80, Math.round(target.cash * takePct));
          target.cash -= loot;
          target.health = Math.max(0, target.health - randInt(18, 40));
          next.cash += loot;
          next.itibar += 4;
          next.health = clamp(next.health - randInt(2, 10), 1, HEALTH_MAX);
          next.isi = clamp(next.isi + 6, 0, HEAT_MAX);
          next.seasonScore += 8;
          if (target.health <= 0) {
            target.hospitalTicks = RIVAL_CLINIC_TICKS;
            target.health = 0;
          }
          logs = pushLog(
            logs,
            next,
            "pvp",
            `${target.name} yere serildi. ${loot.toLocaleString("tr-TR")} ₺ gasp edildi.${jamNote}`,
            loot,
          );
          set({ player: next, rivals, logs });
          return;
        }

        const dmg = randInt(14, 36);
        next.health -= dmg;
        next.itibar = Math.max(0, next.itibar - 3);
        next.isi = clamp(next.isi + 10, 0, HEAT_MAX);
        const lost = Math.min(next.cash, Math.round(next.cash * 0.08));
        next.cash -= lost;
        target.cash += lost;
        logs = pushLog(
          logs,
          next,
          "pvp",
          `${target.name} raconu kesti. ${lost.toLocaleString("tr-TR")} ₺ kaptırdın.${jamNote}`,
          -lost,
        );
        if (next.health <= 0) {
          const ko = knockOut(next, logs);
          next = ko.player;
          logs = ko.logs;
        }
        set({
          player: next,
          rivals,
          logs,
        });
      },
      putBounty: (rivalId, amount) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        const cash = Math.round(amount);
        if (!Number.isFinite(cash) || cash < 500) return;
        if (player.cash < cash) return;
        const rivals = s.rivals.map((r) =>
          r.id === rivalId ? { ...r, bounty: r.bounty + cash } : r,
        );
        const name = s.rivals.find((r) => r.id === rivalId)?.name ?? "Hedef";
        const next = { ...player, cash: player.cash - cash };
        set({
          player: next,
          rivals,
          logs: pushLog(
            s.logs,
            next,
            "bounty",
            `${name} ölüm listesine yazıldı. Ödül ${cash.toLocaleString("tr-TR")} ₺. Saat ilerleyince sokak mermi kusar.`,
            -cash,
          ),
        });
      },
      huntBounty: (rivalId) => {
        const before = get();
        const target = before.rivals.find((r) => r.id === rivalId);
        // Zaten yerde olan hedefe saldırı işlemez; ödül bedavaya gitmesin.
        if (!target || target.hospitalTicks > 0 || target.health <= 0) return;
        if (target.bounty <= 0) return;
        get().attackRival(rivalId);
        const after = get();
        if (!after.player) return;
        const rival = after.rivals.find((r) => r.id === rivalId);
        if (!rival || rival.health > 0) return;
        if (rival.bounty <= 0) return;
        const payout = rival.bounty;
        const next = {
          ...after.player,
          cash: after.player.cash + payout,
          itibar: after.player.itibar + 6,
        };
        set({
          player: next,
          rivals: after.rivals.map((r) =>
            r.id === rivalId ? { ...r, bounty: 0 } : r,
          ),
          logs: pushLog(
            after.logs,
            next,
            "bounty",
            `Topuktan vurma emri tamam. ${rival.name} düştü. Ödül ${payout.toLocaleString("tr-TR")} ₺.`,
            payout,
          ),
        });
      },
      depositBribe: (amount) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        const n = Math.round(amount);
        if (!Number.isFinite(n) || n <= 0 || player.cash < n) return;
        const next = { ...player, cash: player.cash - n, rusvet: player.rusvet + n };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "system",
            `Rüşvet kasasına ${n.toLocaleString("tr-TR")} ₺ ayrıldı.`,
            -n,
          ),
        });
      },
      payBribe: () => {
        const s = get();
        const player = s.player;
        if (!player) return;
        const cost = player.durum === "nezaret" ? 3000 * player.level + 2000 : 0;
        if (!cost) return;
        const fromPool = Math.min(player.rusvet, cost);
        const rest = cost - fromPool;
        if (player.cash < rest) return;
        const next = {
          ...player,
          rusvet: player.rusvet - fromPool,
          cash: player.cash - rest,
          durum: "serbest" as const,
          durumTick: 0,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "jail",
            `Emniyet amiri zarfı aldı. Bu gece nezarethane yok. −${cost.toLocaleString("tr-TR")} ₺`,
            -cost,
          ),
        });
      },
      treatClinic: () => {
        const s = get();
        const player = s.player;
        if (!player) return;
        if (player.durum !== "serbest") return;
        if (player.health >= HEALTH_MAX) return;
        const fee = Math.round(player.cash * 0.15);
        if (player.cash < fee && fee > 0) return;
        const next: Player = {
          ...player,
          cash: Math.max(0, player.cash - fee),
          durum: "klinik",
          durumTick: CLINIC_VOLUNTARY_TICKS,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "clinic",
            `Kliniğe kendin gittin. Doktor peşin istedi: ${fee.toLocaleString("tr-TR")} ₺. 40 dakika.`,
            -fee,
          ),
        });
      },
      hireCrew: (id) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        if (player.crew.includes(id)) return;
        const def = CREW_MAP[id];
        if (!def) return;
        if (player.cash < def.hire) return;
        if (player.itibar < def.itibar) return;
        const next: Player = {
          ...player,
          cash: player.cash - def.hire,
          crew: [...player.crew, id],
          itibar: player.itibar + 2,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "crew",
            `${def.name} ekibe girdi. Saatlik ${def.wage.toLocaleString("tr-TR")} ₺ yer.`,
            -def.hire,
          ),
        });
      },
      fireCrew: (id) => {
        const s = get();
        const player = s.player;
        if (!player || !player.crew.includes(id)) return;
        const def = CREW_MAP[id];
        const next: Player = {
          ...player,
          crew: player.crew.filter((c) => c !== id),
          itibar: Math.max(0, player.itibar - 1),
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "crew",
            `${def?.name ?? "Adam"} defterden silindi.`,
          ),
        });
      },
      pressTurf: (hood) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        if (!canAct(player)) return;
        if (player.stamina < TURF_STAMINA) return;
        const cur = player.turf[hood] ?? 0;
        if (cur >= 100) return;
        const home = hood === player.neighborhood;
        const gain = (home ? 16 : 12) + Math.random() * 8;
        const after = Math.round(clamp(cur + gain, 0, 100) * 10) / 10;
        const loot = turfPressCash(hood, after);
        let extra = 0;
        let note = "";
        if (cur < 50 && after >= 50) {
          extra = 1800;
          note = " Yarı semt sende — haraç şişti.";
        } else if (cur < 75 && after >= 75) {
          extra = 2800;
          note = " Ağır el. Saldırı ve iş açıldı.";
        } else if (cur < 100 && after >= 100) {
          extra = 5200;
          note = " Semt kapandı. Haraç +%20.";
        }
        const xpGain = home ? 6 : 4;
        const grown = applyXp(
          { ...player, stamina: player.stamina - TURF_STAMINA },
          xpGain,
        );
        const next: Player = {
          ...player,
          stamina: grown.stamina,
          energy: grown.energy,
          xp: grown.xp,
          level: grown.level,
          cash: player.cash + loot + extra,
          isi: clamp(player.isi + 3, 0, HEAT_MAX),
          turf: {
            ...player.turf,
            [hood]: after,
          },
          itibar: player.itibar + (after >= 50 ? 3 : 2),
          seasonScore: player.seasonScore + 6,
        };
        const name = hoodName(hood);
        let logs = pushLog(
          s.logs,
          next,
          "turf",
          `${name} basıldı. Kontrol %${Math.round(after)}. Haraç ${loot.toLocaleString("tr-TR")} ₺ cebine.${note}`,
          loot + extra,
        );
        logs = maybeLevelNotes(next, grown.notes, logs);
        set({ player: next, logs });
      },
      bankMove: (amount, dir) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        const n = Math.round(amount);
        if (!Number.isFinite(n) || n <= 0) return;
        if (dir === "in") {
          if (player.cash < n) return;
          const next = { ...player, cash: player.cash - n, bank: player.bank + n };
          set({
            player: next,
            logs: pushLog(
              s.logs,
              next,
              "bank",
              `Kasaya ${n.toLocaleString("tr-TR")} ₺ indi. Sokak bunu gasp etmez.`,
              -n,
            ),
          });
          return;
        }
        if (player.bank < n) return;
        const next = { ...player, cash: player.cash + n, bank: player.bank - n };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "bank",
            `Kasadan ${n.toLocaleString("tr-TR")} ₺ çekildi. Cebin ısındı.`,
            n,
          ),
        });
      },
      writeSenet: (kind, rivalId) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        if (player.senet) return;
        if (kind === "borc") {
          const principal = Math.max(2000, Math.round(player.level * 3500));
          const next: Player = {
            ...player,
            cash: player.cash + principal,
            senet: {
              kind: "borc",
              name: "Tefeci Nuri",
              amount: Math.round(principal * 1.35),
              dueGun: player.gun + 2,
            },
            isi: clamp(player.isi + 4, 0, HEAT_MAX),
          };
          set({
            player: next,
            logs: pushLog(
              s.logs,
              next,
              "bank",
              `Tefeci Nuri ${principal.toLocaleString("tr-TR")} ₺ uzattı. İki güne ${next.senet!.amount.toLocaleString("tr-TR")} ₺.`,
              principal,
            ),
          });
          return;
        }
        const rival = s.rivals.find((r) => r.id === rivalId) ?? s.rivals[0];
        if (!rival) return;
        const principal = Math.min(player.cash, Math.max(1500, Math.round(rival.cash * 0.12)));
        if (principal < 1500) return;
        const next: Player = {
          ...player,
          cash: player.cash - principal,
          senet: {
            kind: "alacak",
            name: rival.name,
            amount: Math.round(principal * 1.25),
            dueGun: player.gun + 2,
            rivalId: rival.id,
          },
        };
        set({
          player: next,
          rivals: s.rivals.map((r) =>
            r.id === rival.id ? { ...r, cash: r.cash + principal } : r,
          ),
          logs: pushLog(
            s.logs,
            next,
            "bank",
            `${rival.name}'e ${principal.toLocaleString("tr-TR")} ₺ senet. İki güne ${next.senet!.amount.toLocaleString("tr-TR")} ₺ döner.`,
            -principal,
          ),
        });
      },
      upgradeEstate: (estateId) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        if (!player.properties.includes(estateId)) return;
        const estate = ESTATE_MAP[estateId];
        if (!estate) return;
        const lvl = estateLevel(player, estateId);
        if (lvl >= 2) return;
        const cost = upgradeCost(estate, lvl);
        if (player.cash < cost) return;
        const next: Player = {
          ...player,
          cash: player.cash - cost,
          upgrades: { ...player.upgrades, [estateId]: lvl + 1 },
          itibar: player.itibar + 3,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "estate",
            `${estate.name} kademe ${lvl + 1}. Saatlik gelir şişti.`,
            -cost,
          ),
        });
      },
      live: (id) => {
        const s = get();
        const player = s.player;
        if (!player) return;
        if (!canAct(player)) return;
        const eMax = energyMax(player.level, player.neighborhood);
        const sMax = staminaMax(player.level);
        let next: Player = { ...player };
        let text = "";
        let money = 0;

        if (id === "bira") {
          if (next.cash < 180) return;
          next.cash -= 180;
          next.stamina = clamp(next.stamina + 4, 0, sMax);
          next.health = clamp(next.health + 8, 1, HEALTH_MAX);
          next.buzz = Math.min(8, next.buzz + 2);
          next.isi = clamp(next.isi - 2, 0, HEAT_MAX);
          money = -180;
          text = "Soğuk bira. Can açıldı, racon gevşedi.";
        } else if (id === "raki") {
          if (next.cash < 850) return;
          next.cash -= 850;
          next.stamina = clamp(next.stamina + 7, 0, sMax);
          next.health = clamp(next.health + 12, 1, HEALTH_MAX);
          next.buzz = Math.min(10, next.buzz + 4);
          next.isi = clamp(next.isi - 4, 0, HEAT_MAX);
          money = -850;
          text = "Rakı masası. Kan yerine geldi, dil açıldı.";
        } else if (id === "esrar") {
          if (next.cash < 1100) return;
          next.cash -= 1100;
          next.energy = clamp(next.energy + 8, 0, eMax);
          next.health = clamp(next.health + 10, 1, HEALTH_MAX);
          next.stamina = clamp(next.stamina + 2, 0, sMax);
          next.high = Math.min(10, next.high + 5);
          next.isi = clamp(next.isi - 7, 0, HEAT_MAX);
          money = -1100;
          text = "Duman. Can doldu, emniyet düştü, mermi yerine geldi.";
        } else if (id === "pavyon") {
          if (next.cash < 4200) return;
          next.cash -= 4200;
          next.stamina = clamp(next.stamina + 5, 0, sMax);
          next.isi = clamp(next.isi + 6, 0, HEAT_MAX);
          next.itibar += 4;
          money = -4200;
          text =
            "Pavyon gecesi: sahne ışığı, rakı, kasa eridi. Adın masalarda döndü.";
          if (next.girlfriend) {
            const gid = next.girlfriend;
            next = bumpRel(next, gid, -16);
            const nm = PARTNER_MAP[gid]?.name ?? "o";
            if ((next.relations[gid] ?? 0) <= 8) {
              next.girlfriend = null;
              text += ` ${nm} haber aldı, bitti.`;
            } else text += ` ${nm} duydu.`;
          }
        } else if (id === "okey") {
          const stake = Math.min(next.cash, 800 + next.level * 400);
          if (stake < 400) return;
          const win = Math.random() < 0.46;
          if (win) {
            next.cash += stake;
            next.itibar += 1;
            money = stake;
            text = `Okey masası. Çift 7. +${stake.toLocaleString("tr-TR")} ₺`;
          } else {
            next.cash -= stake;
            next.isi = clamp(next.isi + 3, 0, HEAT_MAX);
            money = -stake;
            text = `Okey masası. Taş gelmedi. −${stake.toLocaleString("tr-TR")} ₺`;
          }
        } else if (id === "evlen") {
          if (next.married) return;
          if (next.cash < 18000 || next.itibar < 12) return;
          next.cash -= 18000;
          next.married = true;
          const gf = next.girlfriend ? PARTNER_MAP[next.girlfriend] : null;
          next.spouse = gf?.name ?? pick(SPOUSES);
          if (gf) next = bumpRel(next, gf.id, 12);
          next.girlfriend = null;
          next.itibar += 8;
          money = -18000;
          text = `${next.spouse} ile nikâh. Mahalle duymuş. Mekan geliri biraz şişer.`;
        } else if (id === "bosan") {
          if (!next.married) return;
          const fee = 6000 + next.kids * 4000;
          if (next.cash < fee) return;
          next.cash -= fee;
          const who = next.spouse;
          next.married = false;
          next.spouse = null;
          next.girlfriend = null;
          next.itibar = Math.max(0, next.itibar - 6);
          money = -fee;
          text = `${who} gitti. Avukat kesti, mahalle konuştu.`;
        } else if (id === "cocuk") {
          if (!next.married || next.kids >= LIFE_KID_MAX) return;
          if (next.cash < 8000) return;
          next.cash -= 8000;
          next.kids += 1;
          next.itibar += 5;
          money = -8000;
          text = `Çocuk ${next.kids}. Sünnet ileride, harcama şimdi.`;
        } else return;

        set({
          player: next,
          logs: pushLog(s.logs, next, "life", text, money),
        });
      },
      gamble: (kind, stake, choice) => {
        const s = get();
        const player = s.player;
        if (!player || !canAct(player)) return;
        const bet = Math.floor(stake);
        if (bet < 100 || player.cash < bet) return;
        let payout = 0;
        let text = "";
        if (kind === "slot") {
          const sym = ["7", "BAR", "ÜZÜM", "KIRAZ", "AT"];
          const a = pick(sym);
          const b = pick(sym);
          const c = pick(sym);
          if (a === b && b === c) payout = a === "7" ? bet * 12 : bet * 6;
          else if (a === b || b === c || a === c) payout = Math.round(bet * 1.5);
          text = `Slot ${a} ${b} ${c}. ${payout ? "Tuttu." : "Boş."}`;
        } else if (kind === "kazi") {
          const r = Math.random();
          if (r < 0.08) payout = bet * 12;
          else if (r < 0.22) payout = bet * 3;
          text = payout ? "Kazı kazan. Altın çizgi." : "Kazı kazan. Çizgi boş.";
        } else if (kind === "rulet") {
          const n = randInt(0, 36);
          const red = n !== 0 && n % 2 === 0;
          if (choice === "sayi") {
            const num = randInt(0, 36);
            if (num === n) payout = bet * 35;
            text = `Rulet ${n}. Sen ${num}. ${payout ? "Tek sayı tuttu." : "Yok."}`;
          } else {
            const wantRed = choice !== "siyah";
            if (n !== 0 && red === wantRed) payout = bet * 2;
            text = `Rulet ${n} ${n === 0 ? "yeşil" : red ? "kırmızı" : "siyah"}.`;
          }
        } else {
          const bust = Math.random() < 0.28;
          const dealerBust = Math.random() < 0.24;
          if (bust) {
            text = "Blackjack. 22. Yandın.";
          } else if (dealerBust) {
            payout = bet * 2;
            text = "Blackjack. Krupiye yandı.";
          } else {
            const you = randInt(17, 21);
            const they = randInt(17, 21);
            if (you > they) {
              payout = bet * 2;
              text = `Blackjack. ${you}–${they}. Masa senin.`;
            } else if (you === they) {
              payout = bet;
              text = `Blackjack. ${you}–${they}. Berabere, bahis döndü.`;
            } else text = `Blackjack. ${you}–${they}. Krupiye aldı.`;
          }
        }
        const next: Player = {
          ...player,
          cash: player.cash - bet + payout,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "life",
            `${text} ${payout ? `+${(payout - bet).toLocaleString("tr-TR")} ₺` : `−${bet.toLocaleString("tr-TR")} ₺`}`,
            payout - bet,
          ),
        });
      },
      betRace: (index, stake) => {
        const s = get();
        const player = s.player;
        if (!player || !canAct(player)) return;
        const horse = RACE_FIELD[index];
        const bet = Math.floor(stake);
        if (!horse || bet < 100 || player.cash < bet) return;
        const win = pickRaceWinner(RACE_FIELD);
        const winner = RACE_FIELD[win]!;
        const hit = win === index;
        const payout = hit ? Math.round(bet * horse.odds) : 0;
        const next: Player = {
          ...player,
          cash: player.cash - bet + payout,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "life",
            `Veliefendi: ${winner.name} birinci. ${hit ? `${horse.name} tuttu.` : `${horse.name} kaldı.`} ${
              hit
                ? `+${(payout - bet).toLocaleString("tr-TR")} ₺`
                : `−${bet.toLocaleString("tr-TR")} ₺`
            }`,
            payout - bet,
          ),
        });
      },
      buyHorse: () => {
        const s = get();
        const player = s.player;
        if (!player || !canAct(player) || player.horse) return;
        if (player.cash < HORSE_PRICE) return;
        const next: Player = {
          ...player,
          cash: player.cash - HORSE_PRICE,
          horse: { name: pick(HORSE_NAMES), speed: 18 + randInt(0, 8), form: 55 },
          itibar: player.itibar + 6,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "life",
            `${next.horse!.name} senin. Veliefendi defterine yazıldı.`,
            -HORSE_PRICE,
          ),
        });
      },
      trainHorse: () => {
        const s = get();
        const player = s.player;
        if (!player || !canAct(player) || !player.horse) return;
        if (player.cash < HORSE_TRAIN || player.energy < 5) return;
        const horse = {
          ...player.horse,
          speed: clamp(player.horse.speed + 2, 10, 80),
          form: clamp(player.horse.form + 10, 10, 100),
        };
        const next: Player = {
          ...player,
          cash: player.cash - HORSE_TRAIN,
          energy: player.energy - 5,
          horse,
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "life",
            `${horse.name} çalıştı. Hız ${Math.round(horse.speed)}, form ${Math.round(horse.form)}.`,
            -HORSE_TRAIN,
          ),
        });
      },
      raceHorse: () => {
        const s = get();
        const player = s.player;
        if (!player || !canAct(player) || !player.horse) return;
        if (player.energy < 6) return;
        const h = player.horse;
        const chance = clamp((h.speed / 90) * (h.form / 100), 0.08, 0.72);
        const win = Math.random() < chance;
        const prize = win ? randInt(12000, 38000) : 0;
        const horse = {
          ...h,
          form: clamp(h.form - (win ? 8 : 14), 10, 100),
        };
        const next: Player = {
          ...player,
          energy: player.energy - 6,
          cash: player.cash + prize,
          horse,
          itibar: player.itibar + (win ? 4 : 0),
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "life",
            win
              ? `${h.name} birinci. Kupa ve ${prize.toLocaleString("tr-TR")} ₺.`
              : `${h.name} geride kaldı. Form düştü.`,
            prize,
          ),
        });
      },
      relate: (partnerId, act) => {
        const s = get();
        const player = s.player;
        if (!player || !canAct(player)) return;
        const p = PARTNER_MAP[partnerId];
        if (!p) return;
        let next: Player = {
          ...player,
          relations: { ...(player.relations ?? {}) },
        };
        const aff = next.relations[partnerId] ?? 0;
        let text = "";
        let money = 0;

        if (act === "flort") {
          if (next.married) return;
          if (next.cash < 400 || next.stamina < 3) return;
          next.cash -= 400;
          next.stamina -= 3;
          next = bumpRel(next, partnerId, 9);
          money = -400;
          text = `${p.name} ile laf. Gönül ${Math.round(next.relations[partnerId] ?? 0)}.`;
          if (next.girlfriend && next.girlfriend !== partnerId) {
            next = bumpRel(next, next.girlfriend, -10);
          }
        } else if (act === "hediye") {
          if (next.cash < p.gift) return;
          next.cash -= p.gift;
          next = bumpRel(next, partnerId, 16);
          money = -p.gift;
          text = `${p.name} hediyeyi aldı. Gönül ${Math.round(next.relations[partnerId] ?? 0)}.`;
        } else if (act === "randevu") {
          if (next.cash < p.date || next.stamina < 4) return;
          next.cash -= p.date;
          next.stamina -= 4;
          next.itibar += 1;
          next = bumpRel(next, partnerId, 14);
          money = -p.date;
          text = `${p.name} ile akşam. Masa, muhabbet, hesap sende.`;
        } else if (act === "sevgili" || act === "baslat") {
          if (next.married || next.girlfriend) return;
          if (aff < 25) return;
          next.girlfriend = partnerId;
          next = bumpRel(next, partnerId, 8);
          next.itibar += 3;
          text = `${p.name} ile ilişki başladı. Mahalle duymuş.`;
        } else if (act === "gece") {
          if (next.girlfriend !== partnerId && aff < 55) return;
          if (next.stamina < 4) return;
          next.stamina -= 4;
          next.health = clamp(next.health + 6, 1, HEALTH_MAX);
          next = bumpRel(next, partnerId, 10);
          next.itibar += 1;
          text = `${p.name} ile gece. Sabah ağız kokusu, gönül ısındı.`;
          if (
            !next.pendingFamily &&
            next.kids < LIFE_KID_MAX &&
            Math.random() < (next.married && next.spouse === p.name ? 0.22 : 0.38)
          ) {
            next.pendingFamily = { partnerId, name: p.name };
            text += " Sabah haber: çocuk. Kapıda üç yol var.";
          }
        } else if (act === "evlen") {
          if (next.married) return;
          if (next.cash < 18000 || next.itibar < 12) return;
          if (next.girlfriend !== partnerId && aff < 50) return;
          next.cash -= 18000;
          next.married = true;
          next.spouse = p.name;
          next.girlfriend = null;
          next = bumpRel(next, partnerId, 12);
          next.itibar += 8;
          money = -18000;
          text = `${p.name} ile nikâh. Mahalle duymuş. Mekan geliri biraz şişer.`;
        } else if (act === "bitir") {
          if (next.girlfriend !== partnerId) return;
          next.girlfriend = null;
          next = bumpRel(next, partnerId, -30);
          next.itibar = Math.max(0, next.itibar - 2);
          text = `${p.name} ile bitti.`;
        } else return;

        set({
          player: next,
          logs: pushLog(s.logs, next, "life", text, money),
        });
      },
      resolveFamily: (choice) => {
        const s = get();
        const player = s.player;
        if (!player?.pendingFamily) return;
        const { partnerId, name } = player.pendingFamily;
        let next: Player = {
          ...player,
          pendingFamily: null,
          relations: { ...(player.relations ?? {}) },
        };
        let text = "";
        let money = 0;
        if (choice === "evlen") {
          if (!next.married) {
            if (next.cash < 18000) return;
            next.cash -= 18000;
            next.married = true;
            next.spouse = name;
            next.girlfriend = null;
            money = -18000;
          }
          if (next.kids < LIFE_KID_MAX) next.kids += 1;
          next.itibar += 10;
          next = bumpRel(next, partnerId, 14);
          text = `${name} ile nikâh. Çocuk ${next.kids}. Mahalle alkışladı, sen damat oldun, racon ağırlaştı.`;
        } else if (choice === "ustlen") {
          if (next.kids < LIFE_KID_MAX) next.kids += 1;
          next.itibar = Math.max(0, next.itibar - 3);
          next.stamina = Math.max(0, next.stamina - 2);
          next = bumpRel(next, partnerId, 6);
          text = `Gizledin. Çocuk ${next.kids}, masraf saatte kesilir, mahalle resmen duymadı, gayriresmen herkes biliyor.`;
        } else {
          next.itibar = Math.max(0, next.itibar - 10);
          next.stamina = Math.max(0, next.stamina - 6);
          next = bumpRel(next, partnerId, -40);
          if (next.girlfriend === partnerId) next.girlfriend = null;
          text = `Yoktun, duymadın, görmedin. ${name} kapıyı çarptı. İtibar ve racon yerlerde.`;
        }
        set({
          player: next,
          logs: pushLog(s.logs, next, "life", text, money),
        });
      },
      tradeInvest: (id, dir, units) => {
        const s = get();
        const player = s.player;
        if (!player || !canAct(player)) return;
        const qty = Math.floor(units * 100) / 100;
        if (qty <= 0) return;
        const market = s.market ?? MARKET_START;
        const price = market[id];
        if (!price) return;
        const have = holdingOf(player, id);
        if (dir === "al") {
          const cost = Math.round(qty * price);
          if (player.cash < cost) return;
          const next: Player = {
            ...player,
            cash: player.cash - cost,
            altin: player.altin + (id === "altin" ? qty : 0),
            usd: player.usd + (id === "usd" ? qty : 0),
            usdt: player.usdt + (id === "usdt" ? qty : 0),
            isi: clamp(player.isi + (id === "usdt" ? 3 : 0), 0, HEAT_MAX),
          };
          const label =
            id === "altin" ? "gram altın" : id === "usd" ? "dolar" : "USDT";
          set({
            player: next,
            logs: pushLog(
              s.logs,
              next,
              "invest",
              `${qty} ${label} alındı. ${price.toLocaleString("tr-TR")} ₺.`,
              -cost,
            ),
          });
          return;
        }
        const sell = Math.min(have, qty);
        if (sell <= 0) return;
        const gain = Math.round(sell * price);
        const next: Player = {
          ...player,
          cash: player.cash + gain,
          altin: id === "altin" ? player.altin - sell : player.altin,
          usd: id === "usd" ? player.usd - sell : player.usd,
          usdt: id === "usdt" ? player.usdt - sell : player.usdt,
        };
        const label =
          id === "altin" ? "gram altın" : id === "usd" ? "dolar" : "USDT";
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "invest",
            `${sell} ${label} satıldı. ${price.toLocaleString("tr-TR")} ₺.`,
            gain,
          ),
        });
      },
      fundKose: () => {
        const s = get();
        const player = s.player;
        if (!player || !canAct(player)) return;
        if (player.kose >= 3) return;
        const cost = koseUpgradeCost(player);
        if (player.cash < cost || cost <= 0) return;
        const nextLvl = player.kose + 1;
        const next: Player = {
          ...player,
          cash: player.cash - cost,
          kose: nextLvl,
          koseGun: player.kose === 0 ? player.gun : player.koseGun,
          isi: clamp(player.isi + 5, 0, HEAT_MAX),
        };
        set({
          player: next,
          logs: pushLog(
            s.logs,
            next,
            "invest",
            `Köşe ${nextLvl}. kademe. Haftalık döner.`,
            -cost,
          ),
        });
      },
      resetGame: () => {
        set({
          ...emptyPersist,
          rivals: [],
          logs: [],
          market: { ...MARKET_START },
        });
      },
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          try {
            const raw = window.localStorage.getItem(name);
            return raw ? (JSON.parse(raw) as { state: unknown; version: number }) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          try {
            persistPending = { name, value: JSON.stringify(value) };
          } catch {
            return;
          }
          const player = (value as { state?: { player?: unknown } })?.state
            ?.player;
          if (!player) {
            flushPersist();
            return;
          }
          if (persistTimer) return;
          persistTimer = setTimeout(flushPersist, 400);
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          window.localStorage.removeItem(name);
        },
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return {
          ...current,
          player: p.player
            ? hydratePlayer({
                ...p.player,
                name: p.player.name || "İsimsiz",
                neighborhood: migrateHood(p.player.neighborhood),
              })
            : current.player,
          rivals: Array.isArray(p.rivals) ? p.rivals : current.rivals,
          logs: Array.isArray(p.logs) ? p.logs : current.logs,
          hiz: parseHiz(p.hiz),
          version: SAVE_VERSION,
          market:
            p.market && typeof p.market === "object"
              ? { ...MARKET_START, ...p.market }
              : current.market,
        };
      },
      migrate: (persisted) => {
        try {
          const s = (persisted ?? {}) as Record<string, unknown>;
          const player = s.player as Player | null | undefined;
          if (player && typeof player === "object") {
            s.player = hydratePlayer({
              ...player,
              name: player.name || "İsimsiz",
              neighborhood: migrateHood(player.neighborhood),
            });
          }
          const rivals = s.rivals as Rival[] | undefined;
          if (Array.isArray(rivals)) {
            s.rivals = rivals.map((r) => ({
              ...r,
              hospitalTicks: r.hospitalTicks ?? 0,
              hood: migrateHood(r.hood),
            }));
          }
          s.hiz = parseHiz(s.hiz);
          s.version = SAVE_VERSION;
          if (!s.market || typeof s.market !== "object") s.market = { ...MARKET_START };
          return s;
        } catch {
          return { ...emptyPersist };
        }
      },
      partialize: (s) => ({
        version: s.version,
        player: s.player,
        rivals: s.rivals,
        logs: s.logs.slice(0, 40),
        hiz: s.hiz,
        market: s.market,
      }),
      skipHydration: true,
    },
  ),
);

