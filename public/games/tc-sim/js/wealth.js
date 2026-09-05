const TIERS = {
  modest: { label: "Mütevazı", monthly: 0 },
  comfortable: { label: "Rahat", monthly: 1200 },
  comfort: { label: "Konforlu", monthly: 3000 },
  high: { label: "Yüksek", monthly: 6500 },
};
export const LIFESTYLE_TIERS = TIERS;
export const WEALTH_LIMITS = {
  subscriptions: 8,
  durables: 10,
  properties: 3,
  debts: 4,
  investments: 5,
};
export const SUBSCRIPTIONS = {
  streaming: { label: "Film ve dizi", monthly: 180 },
  music: { label: "Müzik", monthly: 90 },
  gym: { label: "Spor salonu", monthly: 650 },
  hobby: { label: "Hobi kulübü", monthly: 420 },
  cleaning: { label: "Ev temizliği", monthly: 900 },
  dating: { label: "Tanışma uygulaması", monthly: 240 },
};
export const DURABLES = {
  phone: { label: "Standart telefon", price: 9000, resale: 0.42 },
  computer: { label: "Yeterli bilgisayar", price: 18000, resale: 0.48 },
  entertainment: { label: "Ev eğlence sistemi", price: 12000, resale: 0.38 },
  bed: { label: "Kaliteli yatak", price: 8500, resale: 0.3 },
  office: { label: "Ev çalışma düzeni", price: 11000, resale: 0.35 },
};
export const VEHICLES = {
  used: { label: "Ekonomik ikinci el", price: 180000, monthly: 3200, resale: 0.68 },
  standard: { label: "Standart otomobil", price: 360000, monthly: 5200, resale: 0.7 },
  premium: { label: "Konforlu otomobil", price: 720000, monthly: 9200, resale: 0.66 },
};
export const INVESTMENTS = {
  deposit: { label: "Mevduat", monthlyRates: [0.008, 0.009, 0.007, 0.01] },
  gold: { label: "Altın", monthlyRates: [0.018, -0.012, 0.01, 0.004, -0.006, 0.015] },
  fx: { label: "Döviz sepeti", monthlyRates: [0.012, -0.008, 0.006, 0.01, -0.004] },
  fund: { label: "Karma fon", monthlyRates: [0.014, -0.01, 0.018, -0.006, 0.009] },
  equity: { label: "Hisse sepeti", monthlyRates: [0.025, -0.025, 0.018, -0.012, 0.03, -0.02] },
};
export const SPENDING = {
  coffee: { label: "Kahve molası", cost: 180, energy: 1, stress: -2, category: "Günlük yaşam" },
  takeaway: { label: "Paket yemek", cost: 350, energy: 1, stress: -2, category: "Günlük yaşam" },
  dinner: {
    label: "İyi bir akşam yemeği",
    cost: 1200,
    energy: -5,
    stress: -6,
    category: "Günlük yaşam",
  },
  haircut: {
    label: "Saç ve kişisel bakım",
    cost: 650,
    energy: -2,
    stress: -3,
    category: "Kişisel bakım",
  },
  clothing: {
    label: "Günlük kıyafet yenileme",
    cost: 2200,
    energy: -4,
    stress: -3,
    category: "Kişisel bakım",
  },
  workwear: { label: "İş kıyafeti", cost: 3500, energy: -4, stress: -2, category: "Kişisel bakım" },
  repair: {
    label: "Evde küçük onarım",
    cost: 1400,
    energy: -7,
    stress: -3,
    category: "Ev kolaylığı",
  },
  cleaning: {
    label: "Tek seferlik ev temizliği",
    cost: 900,
    energy: 3,
    stress: -4,
    category: "Ev kolaylığı",
  },
  gift: { label: "Anlamlı hediye", cost: 1500, energy: -3, stress: -2, category: "Hediye" },
  cafe: {
    label: "Kafe ve arkadaş buluşması",
    cost: 450,
    energy: -5,
    stress: -5,
    category: "Eğlence",
  },
  cinema: { label: "Sinema / gösteri", cost: 700, energy: -4, stress: -7, category: "Eğlence" },
  theatre: { label: "Tiyatro / stand-up", cost: 1100, energy: -6, stress: -8, category: "Eğlence" },
  concert: {
    label: "Konser / canlı müzik",
    cost: 1800,
    energy: -10,
    stress: -9,
    category: "Eğlence",
  },
  homefilm: {
    label: "Evde film ve müzik akşamı",
    cost: 220,
    energy: 1,
    stress: -5,
    category: "Ev eğlencesi",
  },
  gaming: { label: "Oyun akşamı", cost: 250, energy: -2, stress: -6, category: "Ev eğlencesi" },
  reading: { label: "Kitap ve sakin akşam", cost: 300, energy: 2, stress: -6, category: "Hobi" },
  hobby: { label: "Hobi dersi / atölye", cost: 750, energy: -5, stress: -8, category: "Hobi" },
  sports: { label: "Yüzme / spor etkinliği", cost: 650, energy: -8, stress: -8, category: "Hobi" },
  nightlife: {
    label: "Bar / gece hayatı",
    cost: 1800,
    energy: -14,
    stress: -7,
    category: "18+ sosyal yaşam",
  },
  romantic: {
    label: "Romantik akşam",
    cost: 2600,
    energy: -8,
    stress: -8,
    category: "18+ sosyal yaşam",
  },
  privateweekend: {
    label: "Özel hafta sonu",
    cost: 9500,
    energy: -8,
    stress: -14,
    category: "18+ sosyal yaşam",
    time: 2,
  },
  daytrip: { label: "Günübirlik gezi", cost: 2500, energy: -10, stress: -10, category: "Seyahat" },
  weekend: {
    label: "Hafta sonu kaçamağı",
    cost: 7500,
    energy: -8,
    stress: -14,
    category: "Seyahat",
    time: 2,
  },
  vacation: {
    label: "Yurt içi tatil",
    cost: 22000,
    energy: -6,
    stress: -18,
    category: "Seyahat",
    time: 2,
  },
  international: {
    label: "Yurt dışı tatil",
    cost: 65000,
    energy: -8,
    stress: -20,
    category: "Seyahat",
    time: 2,
  },
};

const integer = (v, fallback = 0) => (Number.isFinite(v) ? Math.max(0, Math.round(v)) : fallback);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uniqueBy = (items, key) => [...new Map(items.map((x) => [x[key], x])).values()];
export function neutralWealth() {
  return {
    lifestyle: "modest",
    lifestyleChangedWeek: null,
    subscriptions: [],
    durables: [],
    vehicle: null,
    properties: [],
    debts: [],
    investments: [],
    cooldowns: {},
    lastProcessedMonth: null,
  };
}
export function normalizeWealth(state) {
  const raw = state.wealth && typeof state.wealth === "object" ? state.wealth : {};
  const base = neutralWealth();
  const now = state.time?.absoluteWeek || 1;
  const subscriptions = uniqueBy(
    (Array.isArray(raw.subscriptions) ? raw.subscriptions : [])
      .filter((x) => SUBSCRIPTIONS[x?.id])
      .map((x) => ({
        id: x.id,
        startedWeek: integer(x.startedWeek, now),
        lastBilledMonth: Number.isInteger(x.lastBilledMonth) ? x.lastBilledMonth : null,
      })),
    "id",
  ).slice(0, WEALTH_LIMITS.subscriptions);
  const durables = uniqueBy(
    (Array.isArray(raw.durables) ? raw.durables : [])
      .filter((x) => DURABLES[x?.id])
      .map((x) => ({
        id: x.id,
        price: integer(x.price, DURABLES[x.id].price),
        acquiredWeek: integer(x.acquiredWeek, now),
      })),
    "id",
  ).slice(0, WEALTH_LIMITS.durables);
  const investments = uniqueBy(
    (Array.isArray(raw.investments) ? raw.investments : [])
      .filter((x) => INVESTMENTS[x?.id])
      .map((x) => ({
        id: x.id,
        value: integer(x.value),
        basis: integer(x.basis),
        lastMonth: Number.isInteger(x.lastMonth) ? x.lastMonth : null,
      }))
      .filter((x) => x.value > 0),
    "id",
  ).slice(0, WEALTH_LIMITS.investments);
  const properties = uniqueBy(
    (Array.isArray(raw.properties) ? raw.properties : [])
      .filter(
        (x) => typeof x?.id === "string" && ["owner", "rental", "vacant"].includes(x.occupancy),
      )
      .map((x) => ({
        id: x.id,
        homeId: typeof x.homeId === "string" ? x.homeId : "apartment",
        occupancy: x.occupancy,
        purchasePrice: integer(x.purchasePrice),
        currentValue: integer(x.currentValue, x.purchasePrice),
        monthlyRent: integer(x.monthlyRent),
        maintenance: integer(x.maintenance),
        mortgageId: typeof x.mortgageId === "string" ? x.mortgageId : null,
        acquiredWeek: integer(x.acquiredWeek, now),
      })),
    "id",
  ).slice(0, WEALTH_LIMITS.properties);
  const debts = uniqueBy(
    (Array.isArray(raw.debts) ? raw.debts : [])
      .filter(
        (x) => typeof x?.id === "string" && ["mortgage", "vehicle", "personal"].includes(x.type),
      )
      .map((x) => ({
        id: x.id,
        type: x.type,
        principal: integer(x.principal),
        monthlyPayment: integer(x.monthlyPayment),
        linkedAssetId: typeof x.linkedAssetId === "string" ? x.linkedAssetId : null,
        startWeek: integer(x.startWeek, now),
      }))
      .filter((x) => x.principal > 0),
    "id",
  ).slice(0, WEALTH_LIMITS.debts);
  state.wealth = {
    ...base,
    lifestyle: TIERS[raw.lifestyle] ? raw.lifestyle : "modest",
    lifestyleChangedWeek: Number.isInteger(raw.lifestyleChangedWeek)
      ? raw.lifestyleChangedWeek
      : null,
    subscriptions,
    durables,
    vehicle:
      raw.vehicle && VEHICLES[raw.vehicle.tier]
        ? {
            tier: raw.vehicle.tier,
            purchasePrice: integer(raw.vehicle.purchasePrice, VEHICLES[raw.vehicle.tier].price),
            currentValue: integer(raw.vehicle.currentValue),
            acquiredWeek: integer(raw.vehicle.acquiredWeek, now),
            loanId: typeof raw.vehicle.loanId === "string" ? raw.vehicle.loanId : null,
          }
        : null,
    properties,
    debts,
    investments,
    cooldowns:
      raw.cooldowns && typeof raw.cooldowns === "object" && !Array.isArray(raw.cooldowns)
        ? Object.fromEntries(Object.entries(raw.cooldowns).filter(([, v]) => Number.isInteger(v)))
        : {},
    lastProcessedMonth: Number.isInteger(raw.lastProcessedMonth) ? raw.lastProcessedMonth : null,
  };
  return state.wealth;
}
export function validateWealth(state) {
  const w = state.wealth;
  if (!w) return true;
  if (
    !TIERS[w.lifestyle] ||
    w.subscriptions.length > 8 ||
    w.durables.length > 10 ||
    w.properties.length > 3 ||
    w.debts.length > 4 ||
    w.investments.length > 5
  )
    return false;
  if (
    new Set(w.subscriptions.map((x) => x.id)).size !== w.subscriptions.length ||
    new Set(w.durables.map((x) => x.id)).size !== w.durables.length ||
    new Set(w.properties.map((x) => x.id)).size !== w.properties.length ||
    new Set(w.debts.map((x) => x.id)).size !== w.debts.length ||
    new Set(w.investments.map((x) => x.id)).size !== w.investments.length
  )
    return false;
  if (
    w.investments.some((x) => !INVESTMENTS[x.id] || x.value < 0 || x.basis < 0) ||
    w.debts.some((x) => x.principal < 0) ||
    w.properties.some((x) => !["owner", "rental", "vacant"].includes(x.occupancy))
  )
    return false;
  return !w.vehicle || Boolean(VEHICLES[w.vehicle.tier]);
}
function ledger(state, amount, reason, category = "wealth") {
  amount = Math.round(amount);
  state.finances.balance += amount;
  state.finances.ledger.push({ week: state.time.absoluteWeek, amount, reason, category });
  if (state.finances.ledger.length > 120)
    state.finances.ledger.splice(0, state.finances.ledger.length - 120);
}
function weekly(state, id) {
  if (state.lifetime?.death) return "Bu yaşam tamamlandı.";
  if (state.events.active) return "Önce açık olayı sonuçlandır.";
  if (state.weekly.used >= 2) return "Bu haftanın aktivite hakkı bitti.";
  if (state.weekly.selectedIds.includes(id)) return "Bu hafta zaten yapıldı.";
  return null;
}
function mark(state, id, cost = 1) {
  state.weekly.used += cost;
  state.weekly.selectedIds.push(id);
}
export function setLifestyle(state, id) {
  normalizeWealth(state);
  if (!TIERS[id]) return { ok: false, reason: "Yaşam standardı geçersiz." };
  if (state.wealth.lifestyle === id) return { ok: false, reason: "Bu düzende yaşıyorsun." };
  if (
    TIERS[id].monthly > TIERS[state.wealth.lifestyle].monthly &&
    state.wealth.lifestyleChangedWeek &&
    state.time.absoluteWeek - state.wealth.lifestyleChangedWeek < 12
  )
    return { ok: false, reason: "Yaşam düzenini yeniden yükseltmek için 12 hafta beklemelisin." };
  const increase = Math.max(0, TIERS[id].monthly - TIERS[state.wealth.lifestyle].monthly);
  if (state.finances.balance < increase)
    return { ok: false, reason: "Yeni yaşam düzenine geçiş için yeterli paran yok." };
  if (increase) ledger(state, -increase, "Yaşam standardı geçişi", "lifestyle");
  state.wealth.lifestyle = id;
  state.wealth.lifestyleChangedWeek = state.time.absoluteWeek;
  return { ok: true, message: `Yaşam standardı ${TIERS[id].label} oldu.` };
}
export function spendLifestyle(state, id) {
  normalizeWealth(state);
  const x = SPENDING[id];
  if (!x) return { ok: false, reason: "Harcama geçersiz." };
  const action = `wealth-spend:${id}`,
    blocked = weekly(state, action);
  if (blocked) return { ok: false, reason: blocked };
  const time = x.time || 1;
  if (state.weekly.used + time > 2)
    return { ok: false, reason: "Bu deneyim için haftanın kalan zamanı yetmiyor." };
  if (state.finances.balance < x.cost) return { ok: false, reason: "Yeterli paran yok." };
  const last = state.wealth.cooldowns[id] || 0;
  if (last && state.time.absoluteWeek - last < 4)
    return { ok: false, reason: "Bu deneyimi yeniden planlamak için biraz beklemelisin." };
  ledger(state, -x.cost, x.label, "lifestyle");
  state.health.energy = clamp(state.health.energy + x.energy, 0, 100);
  state.health.stress = clamp(state.health.stress + x.stress, 0, 100);
  state.wealth.cooldowns[id] = state.time.absoluteWeek;
  mark(state, action, time);
  return { ok: true, message: `${x.label} gerçekleşti.` };
}
export function toggleSubscription(state, id) {
  normalizeWealth(state);
  const x = SUBSCRIPTIONS[id];
  if (!x) return { ok: false, reason: "Abonelik geçersiz." };
  const i = state.wealth.subscriptions.findIndex((s) => s.id === id);
  if (i >= 0) {
    state.wealth.subscriptions.splice(i, 1);
    return { ok: true, message: `${x.label} aboneliği kapatıldı.` };
  }
  if (state.wealth.subscriptions.length >= 8)
    return { ok: false, reason: "Abonelik sınırına ulaştın." };
  if (state.finances.balance < x.monthly)
    return { ok: false, reason: "İlk dönem ücreti için yeterli paran yok." };
  const month = Math.floor((state.time.absoluteWeek - 1) / 4);
  ledger(state, -x.monthly, `${x.label} ilk dönem aboneliği`, "subscription");
  state.wealth.subscriptions.push({
    id,
    startedWeek: state.time.absoluteWeek,
    lastBilledMonth: month,
  });
  return { ok: true, message: `${x.label} aboneliği başladı; ilk dönem ücreti işlendi.` };
}
export function buyDurable(state, id) {
  normalizeWealth(state);
  const x = DURABLES[id],
    action = `wealth-durable:${id}`;
  if (!x) return { ok: false, reason: "Ürün geçersiz." };
  const blocked = weekly(state, action);
  if (blocked) return { ok: false, reason: blocked };
  if (state.finances.balance < x.price) return { ok: false, reason: "Yeterli paran yok." };
  const old = state.wealth.durables.find((d) => d.id === id);
  if (old) ledger(state, Math.round(old.price * x.resale), `${x.label} ikinci el satışı`);
  else if (state.wealth.durables.length >= 10)
    return { ok: false, reason: "Dayanıklı eşya sınırına ulaştın." };
  ledger(state, -x.price, x.label, "asset");
  state.wealth.durables = state.wealth.durables.filter((d) => d.id !== id);
  state.wealth.durables.push({ id, price: x.price, acquiredWeek: state.time.absoluteWeek });
  mark(state, action);
  return { ok: true, message: `${x.label} alındı.` };
}
export function tradeInvestment(state, id, amount) {
  normalizeWealth(state);
  const x = INVESTMENTS[id];
  amount = Math.round(amount);
  if (!x || !Number.isFinite(amount) || amount === 0)
    return { ok: false, reason: "Yatırım işlemi geçersiz." };
  const key = `investment:${state.time.absoluteWeek}:${id}`;
  if (state.wealth.cooldowns[key])
    return { ok: false, reason: "Aynı yatırım sınıfında haftada bir işlem yapabilirsin." };
  const pos = state.wealth.investments.find((p) => p.id === id);
  if (amount > 0) {
    const cost = Math.ceil(amount * 1.01);
    if (state.finances.balance < cost) return { ok: false, reason: "Yeterli paran yok." };
    if (!pos && state.wealth.investments.length >= 5)
      return { ok: false, reason: "Yatırım sınıfı sınırına ulaştın." };
    ledger(state, -cost, `${x.label} alımı ve işlem farkı`, "investment");
    if (pos) {
      pos.value += amount;
      pos.basis += cost;
    } else state.wealth.investments.push({ id, value: amount, basis: cost, lastMonth: null });
  } else {
    if (!pos || pos.value < Math.abs(amount)) return { ok: false, reason: "Satılacak tutar yok." };
    const proceeds = Math.floor(Math.abs(amount) * 0.99);
    ledger(state, proceeds, `${x.label} satışı`, "investment");
    pos.value -= Math.abs(amount);
    pos.basis = Math.max(0, pos.basis - Math.abs(amount));
    if (!pos.value) state.wealth.investments = state.wealth.investments.filter((p) => p !== pos);
  }
  state.wealth.cooldowns[key] = 1;
  return { ok: true, message: `${x.label} işlemi tamamlandı.` };
}
export function buyVehicle(state, tier, financed = false) {
  normalizeWealth(state);
  const x = VEHICLES[tier],
    blocked = weekly(state, "wealth-vehicle");
  if (!x) return { ok: false, reason: "Araç geçersiz." };
  if (financed && state.wealth.debts.length >= WEALTH_LIMITS.debts)
    return { ok: false, reason: "Yeni borç için kayıt sınırına ulaştın." };
  if (blocked) return { ok: false, reason: blocked };
  if (state.wealth.vehicle) return { ok: false, reason: "Önce mevcut aracı satmalısın." };
  const down = financed ? Math.ceil(x.price * 0.35) : x.price;
  if (state.finances.balance < down)
    return { ok: false, reason: "Peşinat için yeterli paran yok." };
  ledger(state, -down, `${x.label} alımı`, "vehicle");
  const id = `vehicle-${state.time.absoluteWeek}`;
  state.wealth.vehicle = {
    tier,
    purchasePrice: x.price,
    currentValue: Math.round(x.price * x.resale),
    acquiredWeek: state.time.absoluteWeek,
    loanId: financed ? `${id}-loan` : null,
  };
  if (financed)
    state.wealth.debts.push({
      id: `${id}-loan`,
      type: "vehicle",
      principal: x.price - down,
      monthlyPayment: Math.ceil((x.price - down) / 36),
      linkedAssetId: id,
      startWeek: state.time.absoluteWeek,
    });
  mark(state, "wealth-vehicle");
  return { ok: true, message: `${x.label} alındı.` };
}
export function sellVehicle(state) {
  normalizeWealth(state);
  if (!state.wealth.vehicle) return { ok: false, reason: "Satılacak araç yok." };
  const v = state.wealth.vehicle,
    debt = state.wealth.debts.find((d) => d.id === v.loanId),
    net = v.currentValue - (debt?.principal || 0);
  if (net < 0 && state.finances.balance < Math.abs(net))
    return { ok: false, reason: "Satışın borcu kapatması için nakit farkını karşılayamıyorsun." };
  ledger(state, net, "Araç satışı ve borç kapama", "vehicle");
  if (debt) state.wealth.debts = state.wealth.debts.filter((d) => d !== debt);
  state.wealth.vehicle = null;
  return { ok: true, message: "Araç satıldı; bağlı borç kapatıldı." };
}
export function buyProperty(state, kind = "owner", mortgage = false) {
  normalizeWealth(state);
  if (!["owner", "rental"].includes(kind))
    return { ok: false, reason: "Konut kullanımı geçersiz." };
  if (mortgage && state.wealth.debts.length >= WEALTH_LIMITS.debts)
    return { ok: false, reason: "Yeni borç için kayıt sınırına ulaştın." };
  if (
    state.wealth.properties.some((p) => p.occupancy === kind) ||
    state.wealth.properties.length >= 3
  )
    return { ok: false, reason: "Bu konut türü zaten var veya mülk sınırına ulaştın." };
  const price = kind === "owner" ? 480000 : 420000,
    down = mortgage ? Math.ceil(price * 0.3) : price;
  if (state.finances.balance < down)
    return { ok: false, reason: "Peşinat için yeterli paran yok." };
  const blocked = weekly(state, "wealth-property");
  if (blocked) return { ok: false, reason: blocked };
  const id = `property-${state.time.absoluteWeek}-${kind}`,
    loanId = mortgage ? `${id}-mortgage` : null;
  ledger(state, -down, kind === "owner" ? "Oturulan ev alımı" : "Kiralık mülk alımı", "property");
  state.wealth.properties.push({
    id,
    homeId: "apartment",
    occupancy: kind,
    purchasePrice: price,
    currentValue: price,
    monthlyRent: kind === "rental" ? 4200 : 0,
    maintenance: kind === "owner" ? 1000 : 850,
    mortgageId: loanId,
    acquiredWeek: state.time.absoluteWeek,
  });
  if (loanId)
    state.wealth.debts.push({
      id: loanId,
      type: "mortgage",
      principal: price - down,
      monthlyPayment: Math.ceil((price - down) / 120),
      linkedAssetId: id,
      startWeek: state.time.absoluteWeek,
    });
  mark(state, "wealth-property");
  return { ok: true, message: kind === "owner" ? "Kendi evin alındı." : "Kiralık mülk alındı." };
}
export function sellProperty(state, id) {
  normalizeWealth(state);
  const p = state.wealth.properties.find((x) => x.id === id);
  if (!p) return { ok: false, reason: "Mülk bulunamadı." };
  const debt = state.wealth.debts.find((d) => d.id === p.mortgageId),
    net = p.currentValue - (debt?.principal || 0);
  if (net < 0 && state.finances.balance < Math.abs(net))
    return {
      ok: false,
      reason: "Satışın konut borcunu kapatması için nakit farkını karşılayamıyorsun.",
    };
  ledger(state, net, "Mülk satışı ve borç kapama", "property");
  state.wealth.properties = state.wealth.properties.filter((x) => x !== p);
  if (debt) state.wealth.debts = state.wealth.debts.filter((d) => d !== debt);
  return { ok: true, message: "Mülk satıldı; bağlı borç kapatıldı." };
}
export function setPropertyOccupancy(state, id, occupancy) {
  normalizeWealth(state);
  if (!["rental", "vacant"].includes(occupancy))
    return { ok: false, reason: "Kullanım durumu geçersiz." };
  const p = state.wealth.properties.find((item) => item.id === id && item.occupancy !== "owner");
  if (!p) return { ok: false, reason: "Bu mülkün kullanım durumu değiştirilemez." };
  if (p.occupancy === occupancy) return { ok: false, reason: "Mülk zaten bu durumda." };
  const action = `property-occupancy:${id}`,
    blocked = weekly(state, action);
  if (blocked) return { ok: false, reason: blocked };
  p.occupancy = occupancy;
  mark(state, action);
  return {
    ok: true,
    message:
      occupancy === "rental"
        ? "Mülk kiraya ayrıldı; gelir sonraki ay kapanışında işler."
        : "Mülk boş bırakıldı; kira geliri durdu.",
  };
}
export function getWealthMonthlySummary(state) {
  const w = normalizeWealth(state),
    rental = w.properties
      .filter((p) => p.occupancy === "rental")
      .reduce((n, p) => n + p.monthlyRent, 0),
    maintenance = w.properties.reduce((n, p) => n + p.maintenance, 0),
    subscriptions = w.subscriptions.reduce((n, s) => n + SUBSCRIPTIONS[s.id].monthly, 0),
    vehicle = w.vehicle ? VEHICLES[w.vehicle.tier].monthly : 0,
    debt = w.debts.reduce((n, d) => n + Math.min(d.principal, d.monthlyPayment), 0);
  return {
    income: rental,
    expenses: TIERS[w.lifestyle].monthly + maintenance + subscriptions + vehicle + debt,
    lifestyle: TIERS[w.lifestyle].monthly,
    subscriptions,
    vehicle,
    maintenance,
    debt,
    rental,
  };
}
export function processWealthMonthEnd(state) {
  normalizeWealth(state);
  const month = Math.floor((state.time.absoluteWeek - 1) / 4);
  if (state.wealth.lastProcessedMonth === month) return false;
  const s = getWealthMonthlySummary(state),
    w = state.wealth;
  const subscriptionDue = w.subscriptions
    .filter((item) => item.lastBilledMonth !== month)
    .reduce((sum, item) => sum + SUBSCRIPTIONS[item.id].monthly, 0);
  if (s.rental) ledger(state, s.rental, "Kiralık mülk geliri", "property");
  for (const [amount, label] of [
    [s.lifestyle, "Yaşam standardı"],
    [subscriptionDue, "Abonelikler"],
    [s.vehicle, "Araç giderleri"],
    [s.maintenance, "Mülk bakımı"],
  ])
    if (amount) ledger(state, -amount, label, "lifestyle");
  for (const item of w.subscriptions) item.lastBilledMonth = month;
  for (const d of [...w.debts]) {
    const pay = Math.min(d.principal, d.monthlyPayment);
    if (pay) {
      ledger(state, -pay, `${d.type === "mortgage" ? "Konut" : "Araç"} borcu ödemesi`, "debt");
      d.principal -= pay;
    }
    if (!d.principal) w.debts = w.debts.filter((x) => x !== d);
  }
  for (const p of w.investments) {
    if (p.lastMonth === month) continue;
    const rates = INVESTMENTS[p.id].monthlyRates;
    const rate = rates[month % rates.length];
    p.value = Math.max(0, Math.round(p.value * (1 + rate)));
    p.lastMonth = month;
  }
  for (const p of w.properties)
    p.currentValue = Math.round(p.currentValue * (1 + (month % 6 === 0 ? 0.004 : 0.001)));
  if (w.vehicle) w.vehicle.currentValue = Math.max(0, Math.round(w.vehicle.currentValue * 0.994));
  w.lastProcessedMonth = month;
  return true;
}
export function netWorth(state) {
  const w = normalizeWealth(state),
    cash = Math.round(state.finances.balance),
    investments = w.investments.reduce((n, p) => n + p.value, 0),
    property = w.properties.reduce((n, p) => n + p.currentValue, 0),
    vehicle = w.vehicle ? w.vehicle.currentValue : 0,
    durables = w.durables.reduce((n, d) => n + Math.round(d.price * DURABLES[d.id].resale), 0),
    debt = w.debts.reduce((n, d) => n + d.principal, 0);
  return {
    cash,
    investments,
    property,
    vehicle,
    durables,
    debt,
    total: cash + investments + property + vehicle + durables - debt,
  };
}

/** Player-facing controls read the same gates before attempting a mutation. */
export function getWealthActionAvailability(state, action, value) {
  normalizeWealth(state);
  const w = state.wealth;
  const weekBlocked = (id, time = 1) => weekly(state, id) || (state.weekly.used + time > 2 ? "Bu işlem için haftanın kalan zamanı yetmiyor." : null);
  if (action === "lifestyle") {
    if (!TIERS[value]) return { ok: false, reason: "Yaşam standardı geçersiz." };
    if (w.lifestyle === value) return { ok: false, reason: "Bu düzende yaşıyorsun." };
    const increase = Math.max(0, TIERS[value].monthly - TIERS[w.lifestyle].monthly);
    if (increase && w.lifestyleChangedWeek && state.time.absoluteWeek - w.lifestyleChangedWeek < 12)
      return { ok: false, reason: "Yaşam düzenini yeniden yükseltmek için 12 hafta beklemelisin." };
    return state.finances.balance < increase ? { ok: false, reason: `Geçiş için ₺${increase.toLocaleString("tr-TR")} gerekiyor.` } : { ok: true };
  }
  if (action === "spend") {
    const item = SPENDING[value]; if (!item) return { ok: false, reason: "Harcama geçersiz." };
    const blocked = weekBlocked(`wealth-spend:${value}`, item.time || 1); if (blocked) return { ok: false, reason: blocked };
    const last = w.cooldowns[value] || 0; if (last && state.time.absoluteWeek - last < 4) return { ok: false, reason: "Bu deneyimi yeniden planlamak için biraz beklemelisin." };
    return state.finances.balance < item.cost ? { ok: false, reason: `Bu işlem için ₺${item.cost.toLocaleString("tr-TR")} gerekiyor.` } : { ok: true };
  }
  if (action === "subscription") {
    const item = SUBSCRIPTIONS[value]; if (!item) return { ok: false, reason: "Abonelik geçersiz." };
    if (w.subscriptions.some(entry => entry.id === value)) return { ok: true };
    if (w.subscriptions.length >= WEALTH_LIMITS.subscriptions) return { ok: false, reason: "Abonelik sınırına ulaştın." };
    return state.finances.balance < item.monthly ? { ok: false, reason: `İlk dönem için ₺${item.monthly.toLocaleString("tr-TR")} gerekiyor.` } : { ok: true };
  }
  if (action === "durable") {
    const item = DURABLES[value]; if (!item) return { ok: false, reason: "Ürün geçersiz." };
    const blocked = weekBlocked(`wealth-durable:${value}`); if (blocked) return { ok: false, reason: blocked };
    return state.finances.balance < item.price ? { ok: false, reason: `Bu ürün için ₺${item.price.toLocaleString("tr-TR")} gerekiyor.` } : { ok: true };
  }
  if (action === "invest-buy" || action === "invest-sell") {
    const position = w.investments.find(item => item.id === value); if (!INVESTMENTS[value]) return { ok: false, reason: "Yatırım sınıfı geçersiz." };
    if (w.cooldowns[`investment:${state.time.absoluteWeek}:${value}`]) return { ok: false, reason: "Aynı yatırım sınıfında haftada bir işlem yapabilirsin." };
    if (action === "invest-buy") return state.finances.balance < 5050 ? { ok: false, reason: "Alım ve işlem farkı için ₺5.050 gerekiyor." } : { ok: true };
    return (position?.value || 0) < 5000 ? { ok: false, reason: "Satılabilir değer ₺5.000 altında." } : { ok: true };
  }
  if (action.startsWith("vehicle-")) {
    if (action === "vehicle-sell") return w.vehicle ? { ok: true } : { ok: false, reason: "Satılacak araç yok." };
    const item = VEHICLES[value]; if (!item) return { ok: false, reason: "Araç geçersiz." };
    if (w.vehicle) return { ok: false, reason: "Önce mevcut aracı satmalısın." };
    const blocked = weekBlocked("wealth-vehicle"); if (blocked) return { ok: false, reason: blocked };
    const financed = action === "vehicle-finance"; if (financed && w.debts.length >= WEALTH_LIMITS.debts) return { ok: false, reason: "Yeni borç için kayıt sınırına ulaştın." };
    const due = financed ? Math.ceil(item.price * .35) : item.price;
    return state.finances.balance < due ? { ok: false, reason: `Bu alım için ₺${due.toLocaleString("tr-TR")} gerekiyor.` } : { ok: true };
  }
  if (action === "property-sell") return w.properties.some(item => item.id === value) ? { ok: true } : { ok: false, reason: "Mülk bulunamadı." };
  if (action === "property-rent" || action === "property-vacant") {
    const property = w.properties.find(item => item.id === value && item.occupancy !== "owner");
    const occupancy = action === "property-rent" ? "rental" : "vacant";
    if (!property) return { ok: false, reason: "Bu mülkün kullanım durumu değiştirilemez." };
    if (property.occupancy === occupancy) return { ok: false, reason: "Mülk zaten bu durumda." };
    const blocked = weekBlocked(`property-occupancy:${value}`); return blocked ? { ok: false, reason: blocked } : { ok: true };
  }
  if (action === "property-owner" || action === "property-rental") {
    const kind = action === "property-owner" ? "owner" : "rental", financed = value === "mortgage";
    if (w.properties.some(item => item.occupancy === kind) || w.properties.length >= WEALTH_LIMITS.properties) return { ok: false, reason: "Bu konut türü zaten var veya mülk sınırına ulaştın." };
    if (financed && w.debts.length >= WEALTH_LIMITS.debts) return { ok: false, reason: "Yeni borç için kayıt sınırına ulaştın." };
    const blocked = weekBlocked("wealth-property"); if (blocked) return { ok: false, reason: blocked };
    const price = kind === "owner" ? 480000 : 420000, due = financed ? Math.ceil(price * .3) : price;
    return state.finances.balance < due ? { ok: false, reason: `Bu alım için ₺${due.toLocaleString("tr-TR")} gerekiyor.` } : { ok: true };
  }
  return { ok: false, reason: "İşlem kullanılamıyor." };
}

export function applyWealthAction(state, action, value) {
  const availability = getWealthActionAvailability(state, action, value);
  if (!availability.ok) return availability;
  const operations = {
    lifestyle: () => setLifestyle(state, value), spend: () => spendLifestyle(state, value), subscription: () => toggleSubscription(state, value), durable: () => buyDurable(state, value),
    "invest-buy": () => tradeInvestment(state, value, 5000), "invest-sell": () => tradeInvestment(state, value, -5000), "vehicle-cash": () => buyVehicle(state, value, false), "vehicle-finance": () => buyVehicle(state, value, true),
    "vehicle-sell": () => sellVehicle(state), "property-owner": () => buyProperty(state, "owner", value === "mortgage"), "property-rental": () => buyProperty(state, "rental", value === "mortgage"),
    "property-sell": () => sellProperty(state, value), "property-rent": () => setPropertyOccupancy(state, value, "rental"), "property-vacant": () => setPropertyOccupancy(state, value, "vacant"),
  };
  return operations[action]?.() || { ok: false, reason: "İşlem kullanılamıyor." };
}
