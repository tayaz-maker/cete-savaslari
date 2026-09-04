export const JOBS = [
  {
    id: "market",
    title: "Market Çalışanı",
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
    salary: 12800,
    load: 2,
    energy: -4,
    stress: 4,
    security: "Yüksek",
    zone: 2,
  },
];

export const HOMES = [
  { id: "family", title: "Aile Yanında", monthlyCost: 1500, privacy: 1, zone: 1, moveCost: 600 },
  { id: "shared", title: "Paylaşımlı Ev", monthlyCost: 3600, privacy: 2, zone: 2, moveCost: 2400 },
  {
    id: "studio",
    title: "Tek Başına Stüdyo",
    monthlyCost: 6200,
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
