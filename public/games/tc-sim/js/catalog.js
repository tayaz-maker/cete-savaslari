export const JOBS = [
  {
    id: "market",
    title: "Market Çalışanı",
    family: "hizmet",
    salary: 9000,
    load: 2,
    energy: -5,
    stress: 3,
    security: "Orta",
    zone: 1,
  },
  {
    id: "courier",
    title: "Kurye",
    family: "hizmet",
    salary: 11200,
    load: 3,
    energy: -8,
    stress: 5,
    security: "Düşük",
    zone: 3,
  },
  {
    id: "office",
    title: "Ofis Asistanı",
    family: "ofis",
    salary: 12800,
    load: 2,
    energy: -4,
    stress: 4,
    security: "Yüksek",
    zone: 2,
  },
  {
    id: "technician",
    title: "Teknik Servis Uzmanı",
    family: "hizmet",
    salary: 15500,
    load: 2,
    energy: -6,
    stress: 4,
    security: "Orta",
    zone: 2,
    requiredField: "technical",
    requiredExperienceWeeks: 24,
  },
  {
    id: "specialist",
    title: "Kurumsal Uzman Yardımcısı",
    family: "ofis",
    salary: 19000,
    load: 3,
    energy: -5,
    stress: 6,
    security: "Yüksek",
    zone: 2,
    requiredEducation: "lisans",
    requiredField: "business",
  },
];

export const HOMES = [
  { id: "family", title: "Aile Yanında", monthlyCost: 1500, privacy: 1, zone: 1, moveCost: 600 },
  { id: "shared", title: "Paylaşımlı Ev", monthlyCost: 4200, privacy: 2, zone: 2, moveCost: 2400 },
  {
    id: "studio",
    title: "Tek Başına Stüdyo",
    monthlyCost: 7600,
    privacy: 3,
    zone: 3,
    moveCost: 5200,
  },
];

export const getJobById = (id) => JOBS.find((item) => item.id === id) || null;
export const getHomeById = (id) => HOMES.find((item) => item.id === id) || null;

export function getCommuteLoad(homeId, jobId) {
  if (jobId === null) return 0;
  const home = getHomeById(homeId);
  const job = getJobById(jobId);
  if (!home || !job) return 0;
  return Math.abs(home.zone - job.zone) + ((home.zone + job.zone) % 2);
}
