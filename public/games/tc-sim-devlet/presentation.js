// Read-only player view. Never reads actual values, including the actual-backed
// inflation stored in yearDigest. Presentation thresholds do not affect simulation.
import { POLICIES, EVENTS, PERIODS } from "../next-wave/devlet-data.js";
import { HELP_SECTIONS } from "./help.js";
import { implementationRate } from "../next-wave/devlet-sim.js";
import { escapeHtml as h, helpPanel, loc, text as t } from "../next-wave/shared/runtime.js";

const names = {
  us: ["ABD", "United States"],
  nato: ["NATO", "NATO"],
  eu: ["Avrupa Birliği", "European Union"],
  ru: ["Rusya", "Russia"],
  ir: ["İran", "Iran"],
  gulf: ["Körfez ülkeleri", "Gulf states"],
  gr: ["Yunanistan", "Greece"],
  cy: ["Kıbrıs dosyası", "Cyprus dossier"],
  quake: ["Deprem hazırlığı", "Earthquake readiness"],
  education: ["Eğitim", "Education"],
  pension: ["Emeklilik", "Pensions"],
  housing: ["Konut", "Housing"],
  energy: ["Enerji", "Energy"],
  water: ["Su", "Water"],
  migration: ["Göç", "Migration"],
  infra: ["Altyapı", "Infrastructure"],
  legal: ["Hukuk", "Justice"],
  region: ["Bölgesel hizmetler", "Regional services"],
};
export const displayName = (key) =>
  names[key] ? t(...names[key]) : t("Diğer dosya", "Other dossier");
const number = (v) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : 0);
export function band(value, kind = "strength") {
  const rows = {
    strength: [
      ["Çok zayıf", "Very weak"],
      ["Zayıf", "Weak"],
      ["Orta", "Moderate"],
      ["Güçlü", "Strong"],
      ["Çok güçlü", "Very strong"],
    ],
    confidence: [
      ["Çok düşük", "Very low"],
      ["Düşük", "Low"],
      ["Orta", "Moderate"],
      ["Yüksek", "High"],
      ["Çok yüksek", "Very high"],
    ],
    tension: [
      ["Sakin", "Calm"],
      ["Düşük", "Low"],
      ["Belirgin", "Elevated"],
      ["Yüksek", "High"],
      ["Kritik", "Critical"],
    ],
    foreign: [
      ["Çok gergin", "Very strained"],
      ["Gergin", "Strained"],
      ["Dengeli", "Balanced"],
      ["Yakın", "Close"],
      ["Çok yakın", "Very close"],
    ],
    treasury: [
      ["Çok dar", "Very tight"],
      ["Dar", "Tight"],
      ["Dengeli", "Balanced"],
      ["Rahat", "Comfortable"],
      ["Geniş", "Ample"],
    ],
  };
  // Treasury is a 0–220 simulation index, not TL or a percentage.
  const cut = kind === "treasury" ? [20, 45, 90, 150] : [20, 40, 60, 80];
  return t(...rows[kind][cut.filter((n) => value >= n).length]);
}
const meter = (value, kind = "strength") =>
  `<div class="metric-line"><span>${h(band(value, kind))}</span><b>${number(value)} / 100</b></div><meter min="0" max="100" value="${number(value)}" aria-label="${h(band(value, kind))}">${number(value)}</meter>`;
const detail = (title, copy) =>
  `<details class="metric-help"><summary>${title}</summary><p>${copy}</p></details>`;
const confidence = (s, key) => Math.round((s.known?.[key]?.confidence || 0) * 100);
const policies = (s) => POLICIES[s.eraId] || POLICIES["2002"];
const policyOf = (id) =>
  Object.values(POLICIES)
    .flat()
    .find((p) => p.id === id);
const eventOf = (id) =>
  Object.values(EVENTS)
    .flat()
    .find((e) => e.id === id);
const policyName = (id) => loc(policyOf(id)?.name || t("Kayda alınan karar", "Recorded decision"));
const fileName = (f) =>
  loc(
    f.title ||
      eventOf(f.id)?.title ||
      t("İzlemeye alınan kamu dosyası", "Public dossier under review"),
  );
const status = (key) =>
  t(
    ...({
      open: ["Açık — izleniyor", "Open — under review"],
      sleeping: ["Beklemede — yeniden gündeme gelebilir", "Dormant — may return"],
      reopened: ["Yeniden açıldı", "Reopened"],
      closed: ["Kapandı", "Closed"],
    }[key] || ["İzleniyor", "Under review"]),
  );
export function visibleSnapshot(s) {
  return {
    time: { ...s.time },
    reported: { ...s.reported },
    confidence: Object.fromEntries(
      ["inflation", "treasury", "unemployment"].map((k) => [k, confidence(s, k)]),
    ),
    files: (s.files || []).map((f) => ({ ...f })),
    pending: (s.flags.pendingPolicies || []).map((p) => ({ id: p.id, rate: p.rate })),
    events: (s.events || []).map((e) => e.id),
  };
}
export function reportCards(s) {
  return `<div class="dashboard-grid">${["treasury", "inflation", "unemployment"]
    .map((key) => {
      const title =
        key === "treasury"
          ? t("Hazine alanı", "Treasury room")
          : key === "inflation"
            ? t("Enflasyon raporu", "Inflation report")
            : t("İşsizlik raporu", "Unemployment report");
      const copy =
        key === "treasury"
          ? t(
              "Harcanabilir kamu alanını temsil eden oyun endeksi; TL veya yüzde değildir. Karar maliyetleri bu alanı daraltır. Motor ölçeği 0–220; masandaki sayı raporlanan tahmindir.",
              "A simulation index of fiscal room, not currency or a percentage. Decision costs reduce this room. The engine scale is 0–220; the figure on your desk is a reported estimate.",
            )
          : t(
              "Raporlanan oran; düşük olması genellikle daha az ekonomik baskı demektir. Sahadaki kesin değer değildir.",
              "A reported rate; lower generally means less economic pressure. It is not the exact field value.",
            );
      return `<article class="report-card"><h3>${title}</h3><strong>${key === "treasury" ? h(band(s.reported[key], "treasury")) : `%${number(s.reported[key])}`}</strong>${key === "treasury" ? `<p>${t("Raporlanan endeks", "Reported index")}: ${number(s.reported[key])}</p>` : ""}<p class="confidence">${t("Rapor güvenilirliği", "Report reliability")}: ${band(confidence(s, key), "confidence")} · %${confidence(s, key)}</p>${detail(t("Bu sayı ne demek?", "What does this mean?"), copy + " " + t("Güven yüzdesi doğrulanmış doğruluk oranı değil, bilgi belirsizliğinin oyun göstergesidir. Düşükse kararı daha temkinli değerlendir.", "Confidence is a simulation indicator of uncertainty, not a measured accuracy rate. Lower confidence calls for caution."))}</article>`;
    })
    .join(
      "",
    )}<article class="report-card"><h3>${t("Kurumların uygulama gücü", "Institutional delivery strength")}</h3><strong>${band(implementationRate(s))}</strong>${meter(implementationRate(s))}${detail(t("Kararlar sahaya nasıl iner?", "How do decisions reach the field?"), t("Ortalama kapasite, kurumsal aşınma, toplumsal gerilim, kurum yaklaşımı ve bilgi kalitesi birlikte etkiler. Bu genel göstergedir; her kararın kendi uygulama oranı vardır.", "Average capacity, institutional wear, social tension, institutional approach and information quality contribute. This is an overall indicator; each decision has its own delivery rate."))}</article></div>`;
}
export function decisionCards(s, pool = policies(s)) {
  return `<div class="decision-grid">${pool
    .map((p) => {
      const selected = (s.flags.decisionIds || []).includes(p.id),
        remaining = s.flags.decisionsRemaining ?? 2;
      const inst = s.institutions.find((i) => i.id === p.inst),
        rate = Math.max(
          0,
          Math.min(
            100,
            ((inst?.capacity ?? 50) / Math.max(30, p.capacityNeed)) * 70 - s.entropy * 0.1,
          ),
        );
      return `<button type="button" class="decision ${selected ? "is-picked" : ""}" data-policy="${h(p.id)}" ${selected || remaining <= 0 || s.flags.campaignEnd ? "disabled" : ""}><strong>${h(loc(p.name))}</strong><span>${h(loc(p.intent))}</span><small>${t("Sorumlu kurum", "Responsible institution")}: ${h(loc(inst?.name || t("Merkez idare", "Central administration")))} · ${t("Beklenen uygulama", "Expected delivery")}: ${band(rate)} (%${Math.round(rate)}) · ${t("Hazine maliyeti", "Treasury cost")}: ${p.cost} ${t("endeks puanı", "index points")}</small><b>${selected ? t("Seçildi — ay sonunda uygulanacak", "Selected — delivery at month end") : remaining <= 0 ? t("Bu ay iki karar kullanıldı", "Both decisions used this month") : t("Bu ayın kararına ekle", "Choose for this month")}</b></button>`;
    })
    .join("")}</div>`;
}
export function feedbackHtml(s, feedback) {
  if (!feedback) return "";
  if (feedback.kind === "policy" && (s.flags.decisionIds || []).includes(feedback.id))
    return `<section class="card action-feedback" role="status"><h2>${t("Karar alındı", "Decision recorded")}</h2><p>${h(policyName(feedback.id))}</p><p>${t("Ay sonunda uygulanacak. Kalan karar", "Delivery is due at month end. Decisions left")}: ${s.flags.decisionsRemaining}</p></section>`;
  if (feedback.kind !== "month" || s.time.turn <= feedback.before.time.turn) return "";
  const b = feedback.before,
    changed = s.files.filter(
      (f) => !b.files.some((old) => old.id === f.id && old.status === f.status),
    );
  return `<section class="card action-feedback" role="status"><h2>${t("Ay sonu raporu", "Month-end report")} · ${s.time.year}/${s.time.month}</h2><p>${b.pending.length ? b.pending.map((p) => `${h(policyName(p.id))} · ${t("uygulama oranı", "delivery rate")} %${Math.round(p.rate)}`).join("<br>") : t("Bu ay yeni politika seçilmedi; mevcut kurumlar ve gündem işledi.", "No new policy was selected; existing institutions and events continued.")}</p><div class="data-grid">${["treasury", "inflation", "unemployment"].map((k) => `<p>${t(...{ treasury: ["Hazine endeksi", "Treasury index"], inflation: ["Enflasyon raporu", "Inflation report"], unemployment: ["İşsizlik raporu", "Unemployment report"] }[k])}: ${number(b.reported[k])} → <b>${number(s.reported[k])}</b><br><small>${t("Rapor güveni", "Report confidence")}: %${b.confidence[k]} → %${confidence(s, k)}</small></p>`).join("")}</div><p>${t("Yeni gündem", "New agenda")}: ${
    s.events
      .filter((e) => !b.events.includes(e.id))
      .map((e) => h(loc(e.title)))
      .join(" · ") || t("Yeni olay kaydı yok", "No new event recorded")
  }</p><p>${t("Dosya değişiklikleri", "Dossier changes")}: ${changed.map((f) => `${h(fileName(f))} — ${status(f.status)}`).join(" · ") || t("Yok", "None")}</p><small>${t("Değişimler raporlara aittir; karar, kurum ve olay etkileri birlikte işler.", "Changes belong to reports; decisions, institutions and events act together.")}</small></section>`;
}
export function helpHtml() {
  return helpPanel(HELP_SECTIONS, [
    t("30 saniyede oyun", "The game in 30 seconds"),
    t("30 saniyede oyun", "The game in 30 seconds"),
  ]);
}
export function screenHtml(
  s,
  { screen = s.ui?.screen || "home", formOf = loc, feedback = null } = {},
) {
  const wrap = (title, body) => `<section class="card"><h2>${title}</h2>${body}</section>`;
  if (screen === "home" || screen === "agenda") {
    const issues = [];
    if (s.reported.inflation > 30)
      issues.push(
        t(
          "Fiyatlar baskı yaratıyor; fiyat istikrarı kararlarını değerlendir.",
          "Prices are under pressure; consider price-stability decisions.",
        ),
      );
    if (s.reported.treasury < 45)
      issues.push(
        t(
          "Hazine alanı dar; maliyetli kararları dikkatle seç.",
          "Fiscal room is tight; choose costly decisions carefully.",
        ),
      );
    if (implementationRate(s) < 55)
      issues.push(
        t(
          "Uygulama gücü sınırlı; kararların tamamı sahaya inmeyebilir.",
          "Delivery strength is limited; decisions may only partly reach the field.",
        ),
      );
    if (s.heat > 55)
      issues.push(t("Toplumsal gerilim yükselmiş durumda.", "Social tension is elevated."));
    const ranked = policies(s)
      .slice()
      .sort((a, b) =>
        s.reported.treasury < 45
          ? a.cost - b.cost
          : s.reported.inflation > 30
            ? a.inflation - b.inflation
            : a.capacityNeed - b.capacityNeed,
      );
    return `<details class="loop-guide" open><summary>${t("Bu ay nasıl oynanır?", "How to play this month")}</summary><p>${t("Gündemi oku → iki karar seç → ayı ilerlet → uygulama ve raporları incele.", "Read the agenda → choose two decisions → advance the month → review delivery and reports.")}</p></details>${feedbackHtml(s, feedback)}${reportCards(s)}${wrap(
      t("Bu ay ne oluyor?", "What is happening this month?"),
      `<ul>${(issues.length ? issues : [t("Acil baskı yok; uzun vadeli kurum ve hizmet ihtiyaçlarını değerlendir.", "No urgent pressure; consider long-term institutional and service needs.")]).map((x) => `<li>${x}</li>`).join("")}</ul>${s.events
        .slice(-2)
        .map((e) => `<p>${h(loc(e.title))}</p>`)
        .join("")}`,
    )}${wrap(t("Bu ayın kararları", "This month's decisions"), `<p>${t("Raporlarına göre sıralanan seçenekler. Diğer seçenekler Politika ekranında.", "Options ordered by your reports. Other choices are on the Policy screen.")}</p>${decisionCards(s, ranked.slice(0, 4))}<button type="button" data-open-policy>${t("Tüm politikaları incele", "Browse all policies")}</button>`)}${wrap(
      t("Açık dosyalar", "Open dossiers"),
      s.files
        .filter((f) => f.status !== "closed")
        .slice(-3)
        .map((f) => `<p>${h(fileName(f))} · ${status(f.status)}</p>`)
        .join("") || t("Henüz açık dosya yok.", "No open dossiers yet."),
    )}`;
  }
  if (screen === "policy")
    return wrap(
      t("Politika masası", "Policy desk"),
      feedbackHtml(s, feedback) +
        `<p>${t("İki farklı karar seçebilirsin. Tahmini uygulama oranı, sorumlu kurumun kapasitesi ve kurumsal aşınmadan hesaplanır.", "Choose two different decisions. Expected delivery uses the responsible institution's capacity and institutional wear.")}</p>` +
        decisionCards(s),
    );
  if (screen === "economy")
    return wrap(
      t("Raporlanan ekonomi", "Reported economy"),
      reportCards(s) +
        `<h3>${t("Ertelenmiş politika yükü", "Deferred policy burden")}</h3><p>${t("0–100 endeks; yüksek değer birikmiş ihtiyacın büyüklüğünü gösterir.", "0–100 index; higher means greater accumulated needs.")}</p><div class="data-grid">${Object.entries(
          s.policyDebt,
        )
          .map(
            ([k, v]) =>
              `<article class="report-card"><h3>${displayName(k)}</h3>${meter(v, "tension")}</article>`,
          )
          .join(
            "",
          )}<article class="report-card"><h3>${t("Bilgi kalitesi", "Information quality")}</h3>${meter(s.infoQuality)}<p>${t("Yüksek kalite rapor üretimini ve uygulama gücünü destekler.", "Higher quality supports reporting and delivery.")}</p></article><article class="report-card"><h3>${t("Söylenti baskısı", "Rumor pressure")}</h3>${meter(s.rumor, "tension")}<p>${t("Yüksek baskı bilgi kalitesini ve rapor güvenini aşındırır.", "Higher pressure erodes information quality and confidence.")}</p></article></div>`,
    );
  if (screen === "foreign")
    return wrap(
      t("Dış ilişkiler", "Foreign relations"),
      `<p>${t("Senaryo ilişki endeksi, 0–100: düşük daha gergin, yüksek daha yakın; 50 başlangıç orta noktasıdır. Bu ekrandaki sıralama karar almaz veya yeni etki üretmez.", "Scenario relationship index, 0–100: lower is strained, higher is closer; 50 is the starting midpoint. Sorting this view creates no decisions or effects.")}</p><div class="data-grid">${Object.entries(
        s.foreign,
      )
        .sort((a, b) => a[1] - b[1])
        .map(
          ([k, v]) =>
            `<article class="report-card"><h3>${displayName(k)}</h3>${meter(v, "foreign")}</article>`,
        )
        .join("")}</div>`,
    );
  if (screen === "regions") {
    const lowest = s.regions.slice().sort((a, b) => a.impl - b.impl)[0],
      hottest = s.regions.slice().sort((a, b) => b.heat - a.heat)[0];
    return wrap(
      t("Bölgesel durum", "Regional situation"),
      `<p>${t("Dikkat", "Attention")}: ${h(loc(lowest.name))} — ${t("en düşük uygulama hazırlığı", "lowest delivery readiness")}; ${h(loc(hottest.name))} — ${t("en yüksek toplumsal gerilim", "highest social tension")}.</p>${detail(t("Bu göstergeler nasıl okunur?", "How should these indicators be read?"), t("Uygulama hazırlığı ve toplumsal gerilim 0–100 endekslerdir. İlki yüksekse hazırlık güçlü, ikincisi yüksekse baskı fazladır. Mevcut motor bu bölgesel başlangıç göstergelerini her ay güncellemez; o ayki gerçek uygulama sonucu olarak okunmamalıdır.", "Readiness and social tension are 0–100 indices. Higher readiness is stronger; higher tension means more pressure. The current engine does not update these regional starting indicators every month; they are not this month's delivered outcomes."))}<div class="data-grid">${s.regions
        .slice()
        .sort((a, b) => a.impl - b.impl)
        .map(
          (r) =>
            `<article class="report-card"><h3>${h(loc(r.name))}</h3><p>${t("Politika uygulama hazırlığı", "Policy delivery readiness")}</p>${meter(r.impl)}<p>${t("Toplumsal gerilim", "Social tension")}</p>${meter(r.heat, "tension")}</article>`,
        )
        .join("")}</div>`,
    );
  }
  if (screen === "institutions")
    return wrap(
      t("Kurumlar", "Institutions"),
      `<p>${t("Kapasite: kararları uygulama becerisi. Özerklik: kurumun senaryodaki bağımsızlık endeksi. İkisi de 0–100; mevcut kararlarda uygulama oranına doğrudan kapasite girer.", "Capacity: ability to deliver decisions. Autonomy: the institution's scenario independence index. Both use 0–100; capacity directly enters decision delivery rates.")}</p><div class="data-grid">${s.institutions
        .map((i) => {
          const last = s.implementationLog
            .filter((row) => policyOf(row.policy)?.inst === i.id)
            .at(-1);
          return `<article class="report-card"><h3>${h(loc(i.name))}</h3><p>${t("Kapasite", "Capacity")}</p>${meter(i.capacity)}<p>${t("Özerklik", "Autonomy")}</p>${meter(i.autonomy ?? 0)}<small>${t("Son ilgili karar", "Last relevant decision")}: ${last ? `${h(policyName(last.policy))} · %${Math.round(last.rate)}` : t("Henüz yok", "None yet")}</small></article>`;
        })
        .join(
          "",
        )}</div><p>${t("Kurumsal aşınma", "Institutional wear")}: ${number(s.entropy)}/100 · ${t("Yüksek değer uygulamayı zorlaştırır.", "Higher values weaken delivery.")}</p>`,
    );
  if (screen === "society")
    return wrap(
      t("Toplum", "Society"),
      `<p>${t("Memnuniyet ve devlete güven 0–100 göstergeleridir; yüksek değer daha olumludur. Güncel toplam gerilim ayrıca izlenir.", "Satisfaction and trust in the state are 0–100 indicators; higher is more positive. Overall tension is tracked separately.")}</p><p>${t("Toplumsal gerilim", "Social tension")}: ${band(s.heat, "tension")} · ${number(s.heat)}/100</p><div class="data-grid">${s.cohorts
        .slice()
        .sort((a, b) => a.mood - b.mood)
        .map(
          (c) =>
            `<article class="report-card"><h3>${h(loc(c.name))}</h3><p>${t("Memnuniyet", "Satisfaction")}</p>${meter(c.mood)}<p>${t("Devlete güven", "Trust in the state")}</p>${meter(c.trust)}${c.pressure ? `<p>${h(loc(c.pressure))}</p>` : ""}</article>`,
        )
        .join("")}</div>`,
    );
  if (screen === "files")
    return wrap(
      t("Kamu dosyaları", "Public dossiers"),
      s.files
        .map(
          (f) =>
            `<article class="file"><h3>${h(fileName(f))}</h3><p>${status(f.status)} · ${f.year || s.time.year}</p><p>${t("Gecikmiş veya tartışmalı bir mesele; yeni gelişmeler aylık raporda görünür.", "A delayed or contested issue; new developments appear in monthly reports.")}</p></article>`,
        )
        .join("") ||
        t(
          "Henüz dosya yok. Gecikmiş meseleler burada birikir.",
          "No dossiers yet. Delayed issues accumulate here.",
        ),
    );
  if (screen === "history")
    return wrap(
      t("Karar geçmişi", "Decision history"),
      s.history
        .slice(-20)
        .reverse()
        .map(
          (row) =>
            `<p>${row.year || ""} · ${row.type === "policy" ? `${t("Karar", "Decision")}: ${h(policyName(row.policy))}` : row.type === "file-return" ? `${t("Dosya yeniden açıldı", "Dossier reopened")}: ${h(fileName(row))}` : row.type === "period-transition" ? `${t("Yeni dönem", "New period")}: ${h(loc(PERIODS[row.era]?.name || ""))}` : t("Devletin kuruluş tercihleri kayda alındı.", "The state's founding choices were recorded.")}</p>`,
        )
        .join("") ||
        t("İlk kararın burada kayda geçecek.", "Your first decision will be recorded here."),
    );
  if (screen === "year")
    return wrap(
      t("Yıl dosyası", "Year file"),
      s.yearDigest
        .slice()
        .reverse()
        .map(
          (r) =>
            `<article class="report-card"><h3>${r.year}</h3><p>${t("Toplumsal gerilim", "Social tension")}: ${number(r.heat)}/100 · ${band(r.heat, "tension")}</p><p>${t("Kurumsal aşınma", "Institutional wear")}: ${number(r.entropy)}/100</p><p>${h(formOf(r.form))}</p></article>`,
        )
        .join("") ||
        t(
          "İlk yıl kapanınca kurum ve toplum özeti burada görünür.",
          "The first year-end will add an institutional and social summary here.",
        ),
    );
  const p = PERIODS[s.eraId];
  return wrap(
    t("Dönem dosyası", "Period file"),
    `<h3>${h(loc(p?.name || ""))}</h3><p>${h(loc(p?.theme || ""))}</p><p>${t("Devlet biçimi", "State form")}: ${h(formOf(s.form))}</p><p>${t("Kampanya", "Campaign")}: ${s.scenario.campaign ? t("Büyük kampanya", "Grand campaign") : t("Dönem", "Period")}</p>`,
  );
}
