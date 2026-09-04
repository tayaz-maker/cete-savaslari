import { SAVE_VERSION, createNewGame, validateState } from "./state.js";
import { getHomeById, getJobById } from "./life.js";
import { PRESENT_DAY_ERA_ID, getEraById } from "./eras.js";

export const SAVE_KEY = "tc-sim-save";
export const BACKUP_KEY = "tc-sim-save-backup";

function mergeLegacy(raw) {
  const base = createNewGame({
    name: raw?.player?.name || "Deniz",
    gender: raw?.player?.gender,
    profile: "balanced",
    seed: raw?.meta?.rngState || 20270101,
    now: raw?.meta?.createdAt || new Date().toISOString(),
  });
  const merged = {
    ...base,
    ...raw,
    meta: { ...base.meta, ...(raw.meta || {}), saveVersion: SAVE_VERSION },
    player: { ...base.player, ...(raw.player || {}) },
    time: { ...base.time, ...(raw.time || {}) },
    finances: {
      ...base.finances,
      balance: Number.isFinite(raw?.finances?.balance)
        ? raw.finances.balance
        : base.finances.balance,
      otherMonthlyIncome: Math.max(
        0,
        (Number.isFinite(raw?.finances?.monthlyIncome) ? raw.finances.monthlyIncome : 9000) - 9000,
      ),
      otherMonthlyExpenses: Math.max(
        0,
        (Number.isFinite(raw?.finances?.monthlyExpenses) ? raw.finances.monthlyExpenses : 6500) -
          1500,
      ),
      ledger: Array.isArray(raw?.finances?.ledger) ? raw.finances.ledger : [],
    },
    career: {
      jobId: getJobById(raw?.career?.jobId)
        ? raw.career.jobId
        : raw?.career?.status === "unemployed"
          ? null
          : "market",
      pendingJob: null,
    },
    household: {
      homeId: getHomeById(raw?.household?.homeId) ? raw.household.homeId : "family",
      livingWithFamily: getHomeById(raw?.household?.homeId)
        ? raw.household.homeId === "family"
        : raw?.household?.livingWithFamily !== false,
    },
    world: { eraId: PRESENT_DAY_ERA_ID },
    health: { ...base.health, ...(raw.health || {}) },
    events: { ...base.events, ...(raw.events || {}) },
    weekly: { ...base.weekly, ...(raw.weekly || {}) },
  };
  for (const key of ["people", "memories", "openCases", "yearlyHistory"])
    if (!Array.isArray(merged[key])) merged[key] = base[key];
  if (!merged.flags || typeof merged.flags !== "object") merged.flags = {};
  if (!merged.relationships || typeof merged.relationships !== "object")
    merged.relationships = base.relationships;
  return merged;
}

function migrateV2(raw) {
  return {
    ...raw,
    meta: { ...raw.meta, saveVersion: SAVE_VERSION },
    world: { eraId: getEraById(raw?.world?.eraId) ? raw.world.eraId : PRESENT_DAY_ERA_ID },
  };
}

function normalizeCurrentEra(raw) {
  return {
    ...raw,
    world: {
      ...(raw.world || {}),
      eraId: getEraById(raw?.world?.eraId) ? raw.world.eraId : PRESENT_DAY_ERA_ID,
    },
  };
}

export function migrateState(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return { ok: false, error: "Kayıt nesne değil." };
  const version = raw.meta?.saveVersion ?? 0;
  if (!Number.isInteger(version) || version < 0 || version > SAVE_VERSION)
    return { ok: false, error: "Desteklenmeyen kayıt sürümü." };
  let state = raw;
  if (version < 2) state = mergeLegacy(raw);
  else if (version === 2) state = migrateV2(raw);
  else state = normalizeCurrentEra(raw);
  const validation = validateState(state);
  return validation.ok
    ? { ok: true, state, migrated: version !== SAVE_VERSION }
    : { ok: false, error: validation.errors.join("; ") };
}

export function deserializeState(text) {
  if (typeof text !== "string" || !text) return { ok: false, error: "Kayıt boş." };
  try {
    return migrateState(JSON.parse(text));
  } catch {
    return { ok: false, error: "Kayıt okunamadı." };
  }
}

export function saveGame(storage, state) {
  const validation = validateState(state);
  if (!validation.ok)
    return { ok: false, message: `Kayıt doğrulanamadı: ${validation.errors.join("; ")}` };
  try {
    const current = storage.getItem(SAVE_KEY);
    if (current && deserializeState(current).ok) storage.setItem(BACKUP_KEY, current);
    const copy = structuredClone(state);
    copy.meta.updatedAt = new Date().toISOString();
    const serialized = JSON.stringify(copy);
    storage.setItem(SAVE_KEY, serialized);
    return { ok: true, message: "Oyun kaydedildi.", bytes: new Blob([serialized]).size };
  } catch {
    return {
      ok: false,
      message: "Tarayıcı kaydı yazılamadı. Mevcut oyun açık kalmaya devam ediyor.",
    };
  }
}

export function loadGame(storage) {
  const primary = deserializeState(storage.getItem(SAVE_KEY));
  if (primary.ok)
    return {
      ...primary,
      source: "primary",
      message: primary.migrated ? "Eski kayıt güncellenerek açıldı." : "Kayıt yüklendi.",
    };
  const backup = deserializeState(storage.getItem(BACKUP_KEY));
  if (backup.ok)
    return { ...backup, source: "backup", message: "Ana kayıt bozuktu; son sağlam yedek açıldı." };
  return {
    ok: false,
    source: "none",
    message:
      storage.getItem(SAVE_KEY) || storage.getItem(BACKUP_KEY)
        ? "Kayıt bozuk; yeni oyun güvenle başlatılabilir."
        : "Henüz kayıt yok.",
  };
}

export function clearSaves(storage) {
  try {
    storage.removeItem(SAVE_KEY);
    storage.removeItem(BACKUP_KEY);
    return true;
  } catch {
    return false;
  }
}
