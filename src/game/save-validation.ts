import { z } from "zod";
import { hydratePlayer } from "./data";

const number = z.number().finite().min(0).max(Number.MAX_SAFE_INTEGER);
const nullableText = z.string().nullable();
const defaults = hydratePlayer({ name: "", neighborhood: "eyup" });
const fields: Record<string, z.ZodType> = {};
for (const [key, value] of Object.entries(defaults)) {
  if (typeof value === "number") fields[key] = number.optional();
  else if (typeof value === "string") fields[key] = z.string().optional();
  else if (typeof value === "boolean") fields[key] = z.boolean().optional();
  else if (Array.isArray(value)) fields[key] = z.array(z.string()).optional();
}
const player = z.object({
  ...fields,
  name: z.string(),
  neighborhood: z.string(),
  durum: z.enum(["serbest", "nezaret", "klinik"]).optional(),
  level: number.min(1).optional(),
  gun: number.min(1).optional(),
  saat: number.max(23).optional(),
  dakika: number.max(59).optional(),
  equippedWeapon: nullableText.optional(), equippedArmor: nullableText.optional(), equippedVehicle: nullableText.optional(),
  spouse: nullableText.optional(), girlfriend: nullableText.optional(), refFrom: nullableText.optional(), contractId: nullableText.optional(),
  turf: z.record(z.string(), number).optional(),
  crewBusy: z.record(z.string(), number).optional(),
  upgrades: z.record(z.string(), number.max(2)).optional(),
  relations: z.record(z.string(), number.max(100)).optional(),
  horse: z.object({ name: z.string(), speed: number, form: number }).nullable().optional(),
  senet: z.object({ kind: z.enum(["alacak", "borc"]), name: z.string(), amount: number, dueGun: number, rivalId: z.string().optional() }).nullable().optional(),
  pendingFamily: z.object({ partnerId: z.string(), name: z.string() }).nullable().optional(),
  pendingSeasonCeremony: z.object({ score: number, title: z.string(), bonus: number }).nullable().optional(),
});
const rival = z.object({
  id: z.string(), name: z.string(), title: z.string(), hood: z.string(),
  level: number, cash: number, health: number, attack: number, defense: number,
  alive: z.boolean(), bounty: number, hospitalTicks: number.optional(), revengeTicks: number.optional(),
});
const slice = z.object({
  player: player.nullable(),
  rivals: z.array(rival).optional(),
  logs: z.array(z.object({ id: z.string(), at: number, kind: z.string(), text: z.string(), moneyDelta: z.number().finite().optional() })).optional(),
  market: z.object({ altin: number.positive().optional(), usd: number.positive().optional(), usdt: number.positive().optional() }).optional(),
  savedAt: number.optional(),
  hiz: number.optional(),
});

// Validate before touching live state; missing historical fields hydrate normally.
export function validateSaveSlice(value: unknown): asserts value is Record<string, unknown> {
  slice.parse(value);
}
