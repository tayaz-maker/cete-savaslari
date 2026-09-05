export const EDUCATION_LEVEL_RANKS = { lise: 1, onlisans: 2, lisans: 3 };

export const EDUCATION_LEVEL_LABELS = {
  lise: "Lise mezunu",
  onlisans: "Ön lisans mezunu",
  lisans: "Lisans mezunu",
};

export const EDUCATION_INTENSITY_LABELS = { full: "Tam zamanlı", part: "Yarı zamanlı" };

const INTENSITY_PROGRESS = { full: 3, part: 2 };

export const EDUCATION_FIELDS = [
  { id: "technical", label: "Teknik" },
  { id: "business", label: "İşletme" },
];

export const EDUCATION_PATHS = [
  {
    id: "vocational_course",
    displayName: "Mesleki Eğitim Kursu",
    summary: "Kısa süreli, çalışırken sürdürülebilir teknik program.",
    grantsLevel: null,
    grantsField: "technical",
    allowedIntensity: ["full", "part"],
    targetPoints: 78,
    enrollmentFee: 1200,
    monthlyTuition: 700,
    load: {
      full: { energy: -5, stress: 4, load: 2 },
      part: { energy: -3, stress: 2, load: 1 },
    },
  },
  {
    id: "university",
    displayName: "Üniversite",
    summary: "Uzun soluklu lisans programı; bitince yeni kariyer kapısı açar.",
    grantsLevel: "lisans",
    grantsField: "business",
    allowedIntensity: ["full", "part"],
    targetPoints: 312,
    enrollmentFee: 3000,
    monthlyTuition: 1500,
    load: {
      full: { energy: -7, stress: 5, load: 3 },
      part: { energy: -4, stress: 3, load: 2 },
    },
  },
];

export const CAREER_BANDS = [
  { id: "entry", label: "Başlangıç", minWeeks: 0 },
  { id: "experienced", label: "Deneyimli", minWeeks: 24 },
  { id: "senior", label: "Kıdemli", minWeeks: 72 },
];

export const JOB_FAMILY_LABELS = { hizmet: "Hizmet", ofis: "Ofis" };

export const getPathById = (pathId) => EDUCATION_PATHS.find((path) => path.id === pathId) || null;

export const getFieldLabel = (fieldId) =>
  EDUCATION_FIELDS.find((field) => field.id === fieldId)?.label || fieldId;

export const isEducationLevel = (level) =>
  typeof level === "string" && Object.hasOwn(EDUCATION_LEVEL_RANKS, level);

export const eduRank = (level) => EDUCATION_LEVEL_RANKS[level] || 0;

export const getEducationLevelLabel = (level) => EDUCATION_LEVEL_LABELS[level] || "Bilinmiyor";

export const getIntensityLabel = (intensity) => EDUCATION_INTENSITY_LABELS[intensity] || intensity;

export const getWeeklyProgressGain = (intensity) => INTENSITY_PROGRESS[intensity] || 0;

/**
 * Bir program tamamlandığında seviyenin ne olacağı. Seviye yalnız yukarı gider:
 * daha düşük seviye veren bir program mevcut diplomayı düşüremez.
 */
export function resolveCompletedLevel(currentLevel, grantsLevel) {
  if (!grantsLevel) return currentLevel;
  return eduRank(grantsLevel) > eduRank(currentLevel) ? grantsLevel : currentLevel;
}

/** Bir programın o yoğunlukta kaç hafta süreceği. Arayüz süreyi burada hesaplatır. */
export function getPathDurationWeeks(path, intensity) {
  const gain = getWeeklyProgressGain(intensity);
  return gain > 0 && path ? Math.ceil(path.targetPoints / gain) : 0;
}

export function getPathIntensityLoad(path, intensity) {
  return path?.load?.[intensity] || { energy: 0, stress: 0, load: 0 };
}

export function isValidActiveEducation(active) {
  if (!active || typeof active !== "object" || Array.isArray(active)) return false;
  const path = getPathById(active.pathId);
  if (!path) return false;
  if (!path.allowedIntensity.includes(active.intensity)) return false;
  return (
    Number.isInteger(active.progressPoints) &&
    active.progressPoints >= 0 &&
    active.progressPoints <= path.targetPoints
  );
}

export function getFamilyExperience(state, familyId) {
  const value = state?.career?.jobFamilyExperience?.[familyId];
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

export function getCareerBand(weeks) {
  const safe = Number.isInteger(weeks) && weeks >= 0 ? weeks : 0;
  let band = CAREER_BANDS[0];
  for (const candidate of CAREER_BANDS) if (safe >= candidate.minWeeks) band = candidate;
  return band;
}

export function getEducationWeeklyLoad(state) {
  const active = state?.education?.active;
  if (!active) return { energy: 0, stress: 0, load: 0 };
  return getPathIntensityLoad(getPathById(active.pathId), active.intensity);
}

export function getEducationProgress(state) {
  const active = state?.education?.active;
  const path = active ? getPathById(active.pathId) : null;
  if (!active || !path) return null;
  const gain = getWeeklyProgressGain(active.intensity);
  const remainingPoints = Math.max(0, path.targetPoints - active.progressPoints);
  return {
    path,
    intensity: active.intensity,
    points: active.progressPoints,
    targetPoints: path.targetPoints,
    percent: Math.min(100, Math.round((active.progressPoints / path.targetPoints) * 100)),
    remainingWeeks: gain > 0 ? Math.ceil(remainingPoints / gain) : 0,
    weeklyLoad: getPathIntensityLoad(path, active.intensity),
  };
}

export function isEligibleForJob(state, job) {
  if (!job) return { ok: false, reason: "İş tanımı bulunamadı." };
  if (state?.career?.retirement?.status === "retired")
    return { ok: false, reason: "Emeklilikten sonra normal iş teklifleri kapalı." };
  if (job.requiredEducation && eduRank(state.education?.level) < eduRank(job.requiredEducation))
    return {
      ok: false,
      reason: `${getEducationLevelLabel(job.requiredEducation)} olman gerekiyor.`,
    };
  if (job.requiredField && !(state.education?.fields || []).includes(job.requiredField))
    return { ok: false, reason: `${getFieldLabel(job.requiredField)} alanında eğitim gerekiyor.` };
  if (job.requiredExperienceWeeks) {
    const current = getFamilyExperience(state, job.family);
    if (current < job.requiredExperienceWeeks)
      return {
        ok: false,
        reason: `${JOB_FAMILY_LABELS[job.family] || job.family} alanında ${job.requiredExperienceWeeks} hafta deneyim gerekiyor (${current} hafta).`,
      };
  }
  return { ok: true, reason: "" };
}

export function describeJobRequirements(job) {
  const parts = [];
  if (job.requiredEducation) parts.push(getEducationLevelLabel(job.requiredEducation));
  if (job.requiredField) parts.push(`${getFieldLabel(job.requiredField)} alanı`);
  if (job.requiredExperienceWeeks)
    parts.push(
      `${JOB_FAMILY_LABELS[job.family] || job.family} alanında ${job.requiredExperienceWeeks} hafta deneyim`,
    );
  return parts.length ? parts.join(" · ") : "Gereksinim yok";
}
