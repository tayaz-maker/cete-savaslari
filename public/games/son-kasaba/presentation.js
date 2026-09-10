import {
  BUILDINGS,
  COHORTS,
  GROUPS,
  NPCS,
  INVESTORS,
  EVENTS,
  IDENTITIES,
  ENDINGS,
  ROLE_TEXT,
} from "./data.js";
import { youngPopulation, indicators, economy, actionInfo, CIVIC_ACTIONS } from "./sim.js";
import { escapeHtml as h, text as t, language } from "../next-wave/shared/runtime.js";
export const tr = (p) => t(p[0], p[1]);
export const number = (n) => Math.round(n).toLocaleString(language() === "en" ? "en-GB" : "tr-TR");
export const NAV = [
  ["center", "KASABA MERKEZİ", "TOWN CENTRE"],
  ["agenda", "GÜNDEM", "AGENDA"],
  ["budget", "BÜTÇE", "BUDGET"],
  ["services", "HİZMETLER", "SERVICES"],
  ["business", "İŞLETMELER", "BUSINESSES"],
  ["population", "NÜFUS / GÖÇ", "POPULATION / MIGRATION"],
  ["people", "İNSANLAR", "PEOPLE"],
  ["groups", "GRUPLAR", "GROUPS"],
  ["investors", "YATIRIMCILAR", "INVESTORS"],
  ["files", "DOSYALAR", "FILES"],
  ["history", "GEÇMİŞ", "HISTORY"],
  ["report", "AY RAPORU", "MONTHLY REPORT"],
];
export const LABELS = {
  budget: ["Bütçe", "Budget"],
  debt: ["Borç", "Debt"],
  road: ["Yol", "Road"],
  supply: ["Stok", "Supply"],
  prices: ["Fiyat endeksi", "Price index"],
  rent: ["Kira baskısı", "Rent pressure"],
  water: ["Su", "Water"],
  energy: ["Enerji altyapısı", "Power network"],
  jobs: ["İş imkânı", "Jobs"],
  trust: ["Halk güveni", "Public trust"],
  health: ["Sağlık hizmeti", "Healthcare"],
  school: ["Eğitim hizmeti", "Education"],
  services: ["Hizmet kalitesi", "Service quality"],
  social: ["Sosyal hayat", "Social life"],
  pollution: ["Kirlilik", "Pollution"],
  reputation: ["İtibar", "Reputation"],
  localIdentity: ["Yerel kimlik", "Local identity"],
  inequality: ["Eşitsizlik", "Inequality"],
  company: ["Şirket kontrolü", "Company control"],
  production: ["Üretim", "Production"],
  agriculture: ["Tarım", "Agriculture"],
  tourism: ["Turizm", "Tourism"],
  enterprise: ["Girişim", "Enterprise"],
};
const band = (v, inverse = false) => {
  const n = inverse ? 100 - v : v;
  return n < 30
    ? t("Kritik", "Critical")
    : n < 50
      ? t("Kırılgan", "Fragile")
      : n < 70
        ? t("İdare ediyor", "Holding up")
        : t("Güçlü", "Strong");
};
function meter(label, value, inverse = false) {
  return `<div class="town-meter"><span>${h(label)}</span><strong>${number(value)}/100 · ${band(value, inverse)}</strong><meter min="0" max="100" value="${value}" aria-label="${h(label)}"></meter></div>`;
}
export function button(s, cmd, label) {
  const a = actionInfo(s, cmd);
  return `<button type="button" data-command="${h(cmd)}" ${a.reason ? "disabled" : ""}><strong>${h(label || tr(a.label))}</strong><small>${t("1 karar", "1 decision")} · ${number(a.cost)} TL${a.reason ? ` · ${h(tr(a.reason))}` : ""}</small></button>`;
}
const effects = (e) =>
  Object.entries(e)
    .map(
      ([k, v]) =>
        `${tr(LABELS[k] || [k, k])} ${v > 0 ? "+" : ""}${number(v)}${["budget", "debt"].includes(k) ? " TL" : ""}`,
    )
    .join(" · ");
function civic(s, ids) {
  return `<div class="town-actions">${CIVIC_ACTIONS.filter((a) => ids.includes(a.id))
    .map((a) => `<article>${button(s, `civic:${a.id}`)}<p>${h(effects(a.effects))}</p></article>`)
    .join("")}</div>`;
}
function agenda(s, limit = 10) {
  const rows = s.events.filter((e) => e.status === "open").slice(0, limit);
  return (
    rows
      .map((e) => {
        const d = EVENTS.find((d) => d.id === e.id);
        return `<article class="agenda-card"><p class="eyebrow">${t("SON YANIT", "REPLY BY")} · ${t("AY", "MONTH")} ${e.expires}</p><h3>${h(tr(d.title))}</h3><p>${h(tr(d.text))}</p><div class="town-actions">${d.choices.map((c) => `<div>${button(s, `event:${e.id}:${c.id}`, tr(c.label))}<p class="effect-preview">${h(effects(c.effects))}${c.delay ? ` · ${t("Takip dosyası açılır; sonuç sonraki aylarda gelir.", "Opens a follow-up file; consequences arrive in later months.")}` : ""}</p></div>`).join("")}</div></article>`;
      })
      .join("") ||
    `<p class="empty">${t("Şu an açık talep yok. Hizmetlere ve gelecek ayın bütçesine bakabilirsin.", "No open requests. You can review services and next month's budget.")}</p>`
  );
}
function buildingCards(s, ids) {
  return `<div class="town-grid">${BUILDINGS.filter((d) => ids.includes(d.id))
    .map((d) => {
      const b = s.buildings.find((b) => b.id === d.id);
      return `<article><div class="card-title"><h3>${h(tr(d.name))}</h3><span class="stamp">${b.open ? t("AÇIK", "OPEN") : t("KAPALI", "CLOSED")}</span></div><p>${h(tr(ROLE_TEXT[d.role]))}</p>${meter(t("Fiziksel durum", "Condition"), b.condition)}<p>${t("Aylık bakım", "Monthly maintenance")}: ${number(d.upkeep * (b.open ? 1 : 0.15))} TL</p><div class="town-actions">${button(s, `repair:${d.id}`, t("Onar · durum +30", "Repair · condition +30"))}${button(s, `toggle:${d.id}`, b.open ? t("Geçici kapat", "Temporarily close") : t("Yeniden aç", "Reopen"))}</div><small>${t("Kapalı bina hizmet/gelir vermez; koruma gideri %15 sürer.", "Closed buildings provide no services or income; 15% preservation costs remain.")}</small></article>`;
    })
    .join("")}</div>`;
}
const lineRows = (rows, labels) =>
  Object.entries(rows)
    .map(
      ([k, v]) =>
        `<div class="money-row"><span>${h(tr(labels[k]))}</span><strong>${number(v)} TL</strong></div>`,
    )
    .join("");
const INCOME = {
  local: ["Yerel vergi", "Local tax"],
  business: ["İşletme vergileri", "Business tax"],
  tourism: ["Turizm", "Tourism"],
  production: ["Üretim", "Production"],
  agriculture: ["Tarım", "Agriculture"],
  support: ["Belediye desteği", "Municipal support"],
  donations: ["Dayanışma bağışları", "Community donations"],
};
const COSTS = {
  staff: ["Personel", "Staff"],
  maintenance: ["Bina bakımı", "Building maintenance"],
  infrastructure: ["Yol / altyapı", "Roads / infrastructure"],
  energy: ["Enerji", "Energy"],
  interest: ["Borç faizi", "Debt interest"],
  health: ["Sağlık", "Healthcare"],
  education: ["Eğitim", "Education"],
};
function report(s) {
  const r = s.report;
  if (!r)
    return `<p>${t("İlk ayı kapattığında gelir, gider, göç ve karar sonuçları burada görünecek.", "Close the first month to see income, costs, migration and consequences here.")}</p>`;
  return `${s.ended ? `<article class="final-file"><p class="eyebrow">${t("24 AYLIK YÖNETİM DOSYASI", "24-MONTH ADMINISTRATION FILE")}</p><h2>${h(tr(ENDINGS[s.ending.id]))}</h2>${s.ending.reasons.map((r) => `<p>${h(tr(r))}</p>`).join("")}<p>${t("Kasaba hayatta kaldı mı, yoksa sadece adı mı kaldı?", "Did the town survive, or only its name?")}</p></article>` : ""}<h3>${t("Kapanan ay", "Closed month")} ${r.month}</h3><div class="town-grid"><article><h3>${t("Bütçe", "Budget")}</h3><p>${number(r.before.budget)} → ${number(r.after.budget)} TL</p><p>${t("Gelir", "Income")} ${number(r.finance.totalIncome)} TL · ${t("Gider", "Costs")} ${number(r.finance.totalCosts)} TL</p><p>${t("Borç", "Debt")}: ${number(r.before.debt)} → ${number(r.after.debt)} TL</p></article><article><h3>${t("Kim kaldı?", "Who stayed?")}</h3><p>${number(r.before.population)} → ${number(r.after.population)} ${t("kişi", "people")}</p>${r.cohorts.map((c) => `<div class="money-row"><span>${h(tr(COHORTS.find((x) => x.id === c.id).name))}</span><b>${c.delta > 0 ? "+" : ""}${c.delta}</b></div>`).join("")}</article></div><p>${t("Halk güveni", "Public trust")}: ${number(r.before.trust)} → ${number(r.after.trust)} · ${h(tr(IDENTITIES[r.after.identity]))}</p><p>${t("Bütçe farkı ay sonu nakdidir; önceki karar harcamaları karar tarihinde deftere işlenir. Gecikmiş ödemeler ayrıca sonuç akışında görünür.", "The budget change covers month-end cash; decision costs are recorded when made. Delayed payments appear separately in the consequence feed.")}</p>`;
}
export function townPanel(s) {
  const screen = s.ui.screen,
    i = indicators(s),
    m = s.metrics;
  if (screen === "center")
    return `<section class="town-lead"><p class="eyebrow">${s.month <= 8 ? t("BOŞALAN KASABA", "THE EMPTYING TOWN") : s.month <= 16 ? t("SON FIRSATLAR", "LAST CHANCES") : t("KASABANIN YOLU", "THE TOWN'S PATH")}</p><h2>${t("Bu ay neyi ayakta tutacağız?", "What will we keep alive this month?")}</h2><p>${t("Üç kararın var. Yol, iş ve hizmetler insanların kalma kararını birlikte etkiler. Her talebi aynı ay çözemeyeceksin.", "You have three decisions. Roads, jobs and services jointly affect who stays. You cannot solve every request in one month.")}</p></section><div class="town-grid metrics">${[
      ["jobs", i.jobs],
      ["services", i.services],
      ["trust", m.trust],
      ["localIdentity", m.localIdentity],
      ["inequality", m.inequality],
      ["reputation", m.reputation],
    ]
      .map(([k, v]) => `<article>${meter(tr(LABELS[k]), v, k === "inequality")}</article>`)
      .join(
        "",
      )}</div><h3>${t("Masadaki talepler", "Requests on your desk")}</h3>${agenda(s, 2)}<h3>${t("Doğrudan belediye işleri", "Direct municipal work")}</h3>${civic(s, ["road", "water", "support", "festival"])}<details><summary>${t("Göstergeleri nasıl okumalı?", "How should I read the indicators?")}</summary><p>${t("İş, güven, hizmet ve kimlik 0–100 endeksleridir; nüfus kişi, para TL'dir. Eşitsizlik, kira ve kirlilikte düşük iyidir. Fiyat endeksi 100 başlangıç seviyesidir. Yüksek fiyat, işsizlik ve hizmet kaybı farklı haneleri farklı hızda göçe iter. Nüfus grupları birbirinden ayrıdır; aynı kişi iki kez sayılmaz.", "Jobs, trust, services and identity are 0–100 indices; population is people and money is TL. Lower inequality, rent pressure and pollution are better. The starting price index is 100. High prices, unemployment and service loss drive different households away at different rates. Population groups are separate; no person is counted twice.")}</p></details>`;
  if (screen === "agenda") return agenda(s);
  if (screen === "budget") {
    const e = economy(s);
    return `<h2>${t("Gelecek ayın hesabı", "Next month's accounts")}</h2><p>${t("Tahmin mevcut hizmetlerden hesaplanır. Açık bina bakım gideri sürer. Altı aylık yatırım vergi indirimi işletme gelirini azaltır. Borç faizi aylık %1,2; nakit açığı borca eklenir.", "Forecasts use current services. Open buildings retain maintenance costs. Six months of investor tax relief reduce business income. Debt interest is 1.2% monthly; a cash shortfall becomes debt.")}</p><div class="town-grid"><article><h3>${t("Gelir", "Income")} · ${number(e.totalIncome)} TL</h3>${lineRows(e.income, INCOME)}</article><article><h3>${t("Gider", "Costs")} · ${number(e.totalCosts)} TL</h3>${lineRows(e.costs, COSTS)}</article></div>${civic(s, ["loan", "repay"])}`;
  }
  if (screen === "services")
    return `<h2>${t("Açık tutmanın bedeli", "The cost of keeping things open")}</h2>${civic(s, ["road", "water", "energy", "cleanup"])}${buildingCards(s, ["hall", "pharmacy", "clinic", "school", "bus"])}`;
  if (screen === "business")
    return `<h2>${t("Kasabanın çalışan kapıları", "The town's working doors")}</h2>${civic(s, ["support", "festival", "housing"])}${buildingCards(s, ["market", "fuel", "hotel", "workshop", "cafe", "factory", "farms", "heritage"])}`;
  if (screen === "population")
    return `<h2>${t("Herkes aynı sebeple gitmiyor", "People leave for different reasons")}</h2><p>${t("Son ay net göç", "Last month's net migration")}: ${s.report?.migration ?? 0} ${t("kişi", "people")} · ${t("Genç/eğitimli nüfus", "Young/educated population")}: ${youngPopulation(s)}</p><div class="town-grid">${COHORTS.map(
      (c) => {
        const p = s.cohorts.find((x) => x.id === c.id);
        return `<article><h3>${h(tr(c.name))}</h3><strong class="population-number">${p.count}</strong><p>${t("Son ay", "Last month")}: ${p.lastDelta > 0 ? "+" : ""}${p.lastDelta}</p><p>${t("Başlıca etkenler", "Main drivers")}: ${Object.keys(
          c.weights,
        )
          .map((k) => tr(LABELS[k]))
          .join(", ")}</p></article>`;
      },
    ).join(
      "",
    )}</div><p>${t("Öğretmen", "Teacher")}: ${s.npcs.find((n) => n.id === "elif").present ? t("Elif kasabada", "Elif is in town") : t("Elif ayrıldı; okulu onarıp açmak geri dönüş yoludur.", "Elif left; repair and reopen the school to bring her back.")}</p>`;
  if (screen === "people")
    return `<div class="town-grid">${NPCS.map((d) => {
      const n = s.npcs.find((n) => n.id === d.id);
      return `<article><h3>${h(tr(d.name))}</h3><p>${h(tr(d.goal))}</p><p>${t("Bağlantısı", "Connected to")}: ${h(tr(NPCS.find((p) => p.id === d.relation).name))}</p>${meter(t("Sana güveni", "Trust in you"), n.trust)}${meter(t("Kasabaya bağlılık", "Town loyalty"), n.loyalty)}<p>${n.present ? t("Kasabada", "In town") : t("Ayrıldı", "Left town")}</p><p>${n.memory.length ? h(tr(n.memory.at(-1).text)) : t("Henüz ortak karar anısı yok.", "No shared decision memory yet.")}</p>${button(s, `talk:${d.id}`)}</article>`;
    }).join("")}</div>`;
  if (screen === "groups")
    return `<p>${t("Her grubun önceliği farklı. Etki ağırlığı genel halk güvenine yansır. İki grubun güveni en az 35 ise üç aylık ortak bakım koalisyonu kurabilirsin. Koalisyon bina yıpranmasını ayda 1 azaltır.", "Each group has different priorities. Influence weights contribute to public trust. Two groups with trust of at least 35 can form a three-month maintenance coalition. A coalition reduces monthly building wear by 1.")}</p><div class="town-grid">${GROUPS.map(
      (d) => {
        const g = s.groups.find((g) => g.id === d.id);
        return `<article><h3>${h(tr(d.name))}</h3><p>${h(tr(d.goal))}</p>${meter(t("Güven", "Trust"), g.trust)}<p>${t("Etki ağırlığı", "Influence")}: ${g.influence}</p></article>`;
      },
    ).join(
      "",
    )}</div><h3>${t("Ortak iş teklifleri", "Joint projects")}</h3><div class="town-actions">${[
      ["workers", "green"],
      ["young", "elders"],
      ["trades", "newcomers"],
      ["farmers", "staff"],
    ]
      .map(([a, b]) =>
        button(
          s,
          `coalition:${a}:${b}`,
          `${tr(GROUPS.find((g) => g.id === a).name)} + ${tr(GROUPS.find((g) => g.id === b).name)}`,
        ),
      )
      .join("")}</div>${s.coalitions
      .filter((c) => c.until >= s.month)
      .map(
        (c) =>
          `<p>${t("Ortak bakım sürüyor; son ay", "Shared maintenance active; last month")} ${c.until}</p>`,
      )
      .join("")}`;
  if (screen === "investors")
    return `<h2>${t("Gelen paranın bir sahibi var", "The money has an owner")}</h2><p>${t("Levent’in konsorsiyumu bu teklifleri getirir. Kabul kalıcı arazi/ekonomi kontrolü verir, altı ay vergi indirimi açar ve üç ay sonra kira/dağılım etkisi doğurur. 5.000 TL'lik pazarlık hibeyi %20 azaltır; kontrol ve zararları %35 düşürür. Pazarlık aynı ay kabul edilemez.", "Levent’s consortium brings these offers. Accepting grants lasting land/economic control, six months of tax relief and rent/distribution effects after three months. Negotiating costs 5,000 TL and reduces the grant by 20%, control and harms by 35%. You cannot accept in the same month as negotiation.")}</p>${INVESTORS.map(
      (d) => {
        const o = s.investors.find((o) => o.id === d.id),
          f = o.negotiated ? 0.65 : 1;
        return `<article class="investor-file"><p class="eyebrow">${t("TEKLİF DOSYASI", "OFFER FILE")} · ${t("En erken ay", "Earliest month")} ${d.month}</p><h3>${h(tr(d.name))}</h3><p>${t("Hibe", "Grant")}: ${number(d.grant * (o.negotiated ? 0.8 : 1))} TL · ${t("İş endeksi", "Jobs index")} +${d.jobs} · ${t("Kontrol", "Control")} +${Math.round(d.control * f)}%</p><p>${h(effects(Object.fromEntries(Object.entries(d.effects).map(([k, v]) => [k, v < 0 || ["pollution", "inequality", "rent"].includes(k) ? Math.round(v * f) : v]))))}</p><p>${o.status === "unseen" ? t("Henüz masada değil; dönem ve en az 25 itibar gerekir.", "Not yet available; requires the period and reputation of at least 25.") : o.status === "accepted" ? t("İmzalandı", "Signed") : o.status === "rejected" ? t("Reddedildi", "Rejected") : o.negotiated ? t("Pazarlıklı teklif", "Negotiated offer") : t("Görüşmeye açık", "Open for discussion")}</p><div class="town-actions">${button(s, `investor:${d.id}:accept`, t("Kabul et", "Accept"))}${button(s, `investor:${d.id}:negotiate`, t("Pazarlık yap", "Negotiate"))}${button(s, `investor:${d.id}:reject`, t("Reddet", "Reject"))}</div></article>`;
      },
    ).join("")}`;
  if (screen === "files")
    return `<h2>${t("Bugün kapanmayan işler", "Files that do not close today")}</h2><p>${t("Gecikmiş sonuçlar kayıtla birlikte taşınır; ay başında bir kez uygulanır.", "Delayed outcomes persist in your save and apply once at the start of their month.")}</p>${s.pending.map((p) => `<article><h3>${h(tr(EVENTS.find((e) => e.id === p.source)?.title || INVESTORS.find((i) => i.id === p.source)?.name || ["Takip dosyası", "Follow-up file"]))}</h3><p>${t("Beklenen ay", "Expected month")}: ${p.due}</p></article>`).join("") || `<p>${t("Bekleyen dosya yok.", "No pending files.")}</p>`}${s.openCases
      .slice(-8)
      .reverse()
      .map(
        (c) =>
          `<article><span class="stamp">${t("KAPANDI", "CLOSED")}</span><p>${h(tr(c.text))}</p></article>`,
      )
      .join("")}`;
  if (screen === "report") return report(s);
  return `<h2>${t("Kasaba defteri", "Town ledger")}</h2>${history(s, 100)}`;
}
export function history(s, n = 6) {
  return (
    s.history
      .slice(-n)
      .reverse()
      .map(
        (r) =>
          `<article class="history-row"><small>${t("AY", "MONTH")} ${r.month}</small><p>${h(tr(r.text))}</p></article>`,
      )
      .join("") ||
    `<p>${t("İlk imzanı bekliyor. Kararlar, göç ve gecikmiş sonuçlar ay bilgisiyle bu deftere yazılır.", "Waiting for your first signature. Decisions, migration and delayed consequences are recorded here with their month.")}</p>`
  );
}
export function help() {
  return `<details class="town-help"><summary>${t("Nasıl oynanır?", "How to play?")}</summary><p>${t("24 ay boyunca her ay üç karar ver. Önce gündemi ve bütçeyi oku, sonra hizmet, iş, insan veya yatırım için kaynak ayır. Ayı kapatmak gelir/gideri, göçü, bina yıpranmasını ve takip sonuçlarını işler; kullanılmayan haklar kaybolur ve sonraki aya taşınmaz. Kapatılan hizmet para kazandırmaz; yalnız gideri azaltır. İş, sağlık ve okul ailelerin kalmasını etkiler. Çıkar gruplarının sana güveni halk güvenine yansır; yeterince güvenen iki grup ortak bakım koalisyonu kurup bina yıpranmasını yavaşlatabilir. Büyük yatırım hızlı para verir ama kontrol, çevre ve kira bedeli taşır; sonucu birkaç ay sonra görürsün. Ay raporunda bütçe, nüfus ve güvendeki değişimi ay ay takip et. Üç kayıt bağımsızdır; dolu slotun üzerine yazmak onay ister. Yedi final nüfus, hizmet, gençler, güven, bütçe, şirket kontrolü ve eşitsizlikten hesaplanır. Sonuç yalnız zenginlik değildir.", "For 24 months, make three decisions each month. Read the agenda and budget, then allocate resources to services, jobs, people or investment. Closing the month processes income/costs, migration, wear and follow-ups; unused actions expire. Closing services does not earn money, only reduces costs. Jobs, health and schools affect whether families stay. Major investment brings quick money but costs control, environment and rent pressure. Three saves are independent; overwriting an occupied slot requires confirmation. Seven endings use population, services, young people, trust, budget, company control and inequality. Success is not wealth alone.")}</p></details>`;
}
