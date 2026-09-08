import { LIFE_ACTIONS, lifeReason, PEOPLE } from "../next-wave/hayat-life.js";
import { MAJORS } from "../next-wave.js";
import { CHAPTERS } from "../next-wave/hayat-data.js";
import {
  bindFrontMenu,
  bindSavePanel,
  bootGame,
  escapeHtml as h,
  frontMenu,
  loc,
  savePanel,
  text as t,
} from "../next-wave/shared/runtime.js";

const shadowLabel = {
  education: ["Eğitim", "Education"],
  career: ["Kariyer", "Career"],
  family: ["Aile", "Family"],
  romance: ["İlişki", "Romance"],
  friendship: ["Dostluk", "Friendship"],
  housing: ["Barınma", "Housing"],
  money: ["Para", "Money"],
  duty: ["Yükümlülük", "Duty"],
  body: ["Beden", "Body"],
  ambition: ["Hırs", "Ambition"],
  network: ["Çevre", "Network"],
  regret: ["Pişmanlık", "Regret"],
  migration: ["Göç", "Migration"],
  "health-habit": ["Alışkanlık", "Habit"],
  civic: ["Yurttaşlık", "Civic"],
  skill: ["Beceri", "Skill"],
  "kin-money": ["Aile parası", "Family money"],
  lease: ["Kira", "Lease"],
  tempo: ["Tempo", "Pace"],
  "return-home": ["Dönüş", "Return"],
  "second-chance": ["İkinci şans", "Second chance"],
};

function labelShadow(category) {
  const row = shadowLabel[category];
  return row ? t(row[0], row[1]) : loc(category);
}

const screens = [
 ["actions","EYLEMLER","ACTIONS"], ["me","BEN","ME"], ["work","İŞ","WORK"], ["path","EĞİTİM","EDUCATION"],
 ["money","FİNANS","FINANCE"], ["market","MARKET","MARKET"], ["people","İNSANLAR","PEOPLE"], ["home","EV","HOME"],
 ["family","İLİŞKİLER / AİLE","RELATIONSHIPS / FAMILY"], ["body","BEDEN","BODY"], ["decisions","DÖNÜM NOKTASI","TURNING POINT"], ["shadows","UZUN GÖLGE","LONG SHADOW"], ["history","GEÇMİŞ","HISTORY"]
];
const root = document.body;
let view = "menu";
let draftName = "";

function currentEvent(state) {
  if (state.flags.majorTurn === state.turn) {
    const last = state.decisionsLog.at(-1);
    const decided = MAJORS.find((event) => event.id === last?.event);
    if (decided) return decided;
  }
  const used = new Set((state.decisionsLog || []).map((decision) => decision.event));
  const fresh = MAJORS.filter((event) => event.chapter === state.chapter && !used.has(event.id));
  const pool = fresh.length ? fresh : MAJORS.filter((event) => event.chapter === state.chapter);
  return pool[state.turn % Math.max(1, pool.length)] || MAJORS[0];
}

function choicesFor(event) {
  const alternates = {
    work: ["work", "school", "stay"],
    education: [event.choice, "work", "delay"],
    housing: [event.choice, "stay", "move"],
    family: [event.choice, "help", "delay"],
    romance: [event.choice, "commit", "free"],
    money: [event.choice, "save", "give"],
  };
  return [...new Set(alternates[event.domain] || [event.choice, "ambition", "slow"])].slice(0, 3);
}

const choiceCopy = {
  ambition: [
    "Yüklen",
    "Para artar; enerji ve zaman daralır",
    "Push ahead",
    "Money rises; energy and time narrow",
  ],
  work: [
    "Şimdi işe gir",
    "Gelir şimdi, başka yol kapanabilir",
    "Take the work",
    "Income now; another path may close",
  ],
  school: [
    "Öğrenime devam",
    "Para ve enerji gider; ileride kapı bırakır",
    "Keep studying",
    "Costs money and energy; leaves a later door",
  ],
  stay: ["Olduğun yerde kal", "Güvenli; hareket alanı dar", "Stay", "Safer; less room to move"],
  move: ["Yola çık", "Bağlar gerilir; yeni yol açılır", "Move", "Ties strain; a new route opens"],
  give: ["El uzat", "Nakit azalır; bağ güçlenir", "Give", "Cash falls; the bond strengthens"],
  help: ["Yanında dur", "Kendi planın gecikir", "Show up", "Your own plan slips"],
  delay: ["Ertele", "Bugün ucuz; gölgesi belirsiz", "Delay", "Cheap today; uncertain shadow"],
  commit: [
    "Bağlan",
    "Esneklik azalır; bağ derinleşir",
    "Commit",
    "Less flexibility; a deeper bond",
  ],
  free: [
    "Mesafeyi koru",
    "Söz yok; güven de sınırlı",
    "Keep distance",
    "No promise; limited trust",
  ],
  save: ["Biriktir", "Bugünü kıs; yarına alan aç", "Save", "Cut today; make room for tomorrow"],
  slow: [
    "Yavaşla",
    "Unvan bekler; beden nefes alır",
    "Slow down",
    "Status waits; the body breathes",
  ],
};

function setup(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header><section class="setup-shell card"><p class="eyebrow">${t("YENİ HAYAT", "NEW LIFE")}</p><h1>HAYAT</h1><p>${t("18 yaşındasın. Önündeki yol kararlarınla biçimlenecek; bazı kararlar yıllar sonra Uzun Gölge olarak dönecek.", "You are 18. Decisions will shape your path; some return years later as a Long Shadow.")}</p><label for="player-name">${t("Adın", "Your name")}</label><input id="player-name" maxlength="28" autocomplete="off" value="${h(draftName)}" placeholder="${t("Adını yaz", "Enter your name")}"><div class="setup-summary"><span>${t("Başlangıç yaşı", "Starting age")} <b>18</b></span><span>${t("Nakit", "Cash")} <b>₺1.000</b></span><span>${t("Enerji / Beden", "Energy / Health")} <b>80 / 90</b></span></div><div class="setup-actions"><button id="cancel-setup" class="secondary" type="button">${t("GERİ", "BACK")}</button><button id="confirm-start" type="button" ${draftName.trim() ? "" : "disabled"}>${t("HAYATA BAŞLA", "BEGIN LIFE")}</button></div></section></main>`;
  const input = root.querySelector("#player-name");
  input.addEventListener("input", () => {
    draftName = input.value;
    root.querySelector("#confirm-start").disabled = !draftName.trim();
  });
  root.querySelector("#cancel-setup").addEventListener("click", () => {
    session.cancelNew();
    view = "menu";
    draw(session);
  });
  root.querySelector("#confirm-start").addEventListener("click", () => {
    if (!draftName.trim()) return;
    session.commitNew({
      configure: (state) => {
        state.playerName = draftName.trim().slice(0, 28);
        state.ui = { ...state.ui, screen: "actions" };
      },
    });
  });
}

function actionCards(state, filter = () => true) {
 return `<div class="choice-grid">${LIFE_ACTIONS.filter(filter).map(a=>{const reason=lifeReason(state,a.id);return `<button type="button" class="choice" data-life-action="${a.id}" ${reason?"disabled":""}><strong>${h(t(...a.label))}</strong><small>${t("1 hak", "1 action")} · ₺${a.cost} · ${t("Enerji","Energy")} ${a.energy>0?"+":""}${a.energy} · ${t("Stres","Stress")} ${a.stress>0?"+":""}${a.stress}${a.income?` · ${t("Gelir","Income")} +₺${Math.round(a.income*(state.life.job==="qualified"?1.5:1))}`:""}${a.health?` · ${t("Beden","Health")} +${a.health}`:""}</small>${reason?`<small>${h(t(...reason))}</small>`:""}</button>`}).join("")}</div>`;
}
function historyRows(state, count=12) {
 return state.history.slice(-count).reverse().map(row=>`<div><small>${row.age??""} · ${t("Dönem","Passage")} ${row.turn??"—"}</small><span>${h(row.en?t(row.text,row.en):loc(row.title||row.text||t("Karar kaydedildi","Decision recorded")))}</span></div>`).join("") || `<p>${t("Hayatın ilk adımını bekliyor.","Waiting for your first step.")}</p>`;
}
const jobName=s=>s.life.job===null?t("İş arıyor","Looking for work"):s.life.job==="qualified"?t("Nitelikli çalışan","Skilled employee"):t("Mağaza yardımcısı","Shop assistant");
const homeName=s=>s.life.home==="family"?t("Aile evi","Family home"):t("Paylaşımlı ev","Shared flat");
function panel(state) {
 const screen=state.ui?.screen||"actions",l=state.life,r=state.resources;
 let body="";
 if(screen==="actions") body=`<p>${t("Bir dönem hayatının bir mevsimini özetler. İki farklı ana eylem seç; dört dönem bir yıl eder. Kullanmadığın haklar sonraki döneme taşınmaz.","A passage represents a season of your life. Choose two different main actions; four passages make a year. Unused actions do not carry over.")}</p>${actionCards(state,a=>["work","search","friend","date","family","study","rest","exercise","groceries","hobby"].includes(a.id))}`;
 else if(screen==="me") body=`<h3>${h(state.playerName)}</h3><p>${h(jobName(state))} · ${h(homeName(state))} · ${t("Bölüm","Chapter")} ${h(loc(CHAPTERS.find(c=>c.id===state.chapter)?.name))}</p><p>${t("Yaşam yolu","Life path")}: ${state.decisionsLog.length} ${t("büyük karar","major decisions")} · ${state.shadows.filter(s=>s.status==="resolved").length} ${t("dönen gölge","returned shadows")}</p><div class="result-feed">${historyRows(state,5)}</div>`;
 else if(screen==="work") body=`<h3>${h(jobName(state))}</h3><p>${t("Gelir işe gittiğinde kazanılır; otomatik maaş yok. İş zamanı ve stres bedeli taşır.","Income is earned when you work; there is no automatic salary. Work costs time and adds stress.")}</p><p>${t("Deneyim","Experience")}: ${l.experience}/4 · ${t("Kurs becerisi","Course skill")}: ${l.skill}/3</p>${actionCards(state,a=>a.panel==="work")}`;
 else if(screen==="path") body=`<p>${l.skill>=3?t("Kurs tamamlandı. Nitelikli işlere başvurabilirsin.","Course complete. You can apply for skilled work."):l.course?t(`Kurs ilerlemesi: ${l.course.progress}/3. Her çalışma bir adım, kitapla iki adım.`,`Course progress: ${l.course.progress}/3. Each study action adds one step, or two with a book.`):t("Üç çalışmada tamamlanan meslek kursu; işe başvuruda yeni kapı açar.","A vocational course completed in three study actions; opens a new job route.")}</p>${actionCards(state,a=>a.panel==="path")}`;
 else if(screen==="money") body=`<div class="management-grid"><article>${t("Nakit","Cash")}<b>₺${r.money}</b></article><article>${t("Birikim","Savings")}<b>₺${l.savings}</b></article><article>${t("Borç","Debt")}<b>₺${l.debt}</b></article></div><p>${t("Dönem sonu temel gider","End-of-passage essentials")}: ₺${(l.home==="shared"?280:120)+(l.married?70:0)} + ${t("borcun %2 faizi. Ödenemeyen tutar borca eklenir.","2% debt interest. Unpaid costs become debt.")}</p>${actionCards(state,a=>a.panel==="money")}<div class="result-feed">${historyRows(state,8)}</div>`;
 else if(screen==="people") body=`<div class="management-grid">${PEOPLE.map(p=>{const n=l.people.find(x=>x.id===p.id);return `<article><h3>${h(p.name)}</h3><p>${t(...p.role)} · ${t("Yakınlık","Closeness")} ${n.value}/100</p><p>${n.memory.length?h(t(n.memory.at(-1).tr,n.memory.at(-1).en)):t("Henüz özel bir anı yok.","No shared memory yet.")}</p></article>`}).join("")}</div>${actionCards(state,a=>a.panel==="people")}`;
 else if(screen==="home") body=`<h3>${homeName(state)}</h3><p>${l.home==="family"?t("Dönem gideri 120 TL. Daha az mahremiyet, daha düşük gider.","120 TL per passage. Less privacy, lower costs."):t("Dönem gideri 280 TL. Ayrı yaşam alanı; daha yüksek sorumluluk.","280 TL per passage. Independent space and greater responsibility.")}</p>${actionCards(state,a=>a.panel==="home")}`;
 else if(screen==="family") body=`<p>${l.married?t("Ece ile evli; ortak gider +70 TL/dönem.","Married to Ece; shared costs +70 TL per passage."):l.partner?t("Ece ile ilişkide.","In a relationship with Ece."):t("Şu anda partner yok. Görüşmeler yakınlığı güçlendirir.","No partner currently. Spending time together builds closeness.")}</p>${actionCards(state,a=>a.panel==="family")}`;
 else if(screen==="body") body=`<p>${t("Enerji","Energy")} ${r.energy}/100 · ${t("Beden","Health")} ${r.health}/100 · ${t("Stres","Stress")} ${l.stress}/100</p><p>${t("Stres 75 üzerindeyse dönem sonunda beden 4 azalır. Her dönem enerji 16 toparlanır.","Stress above 75 costs 4 health at passage end. Each passage restores 16 energy.")}</p>${actionCards(state,a=>a.panel==="body")}`;
 else if(screen==="market") body=`<p>${t("Küçük tüketimler zaman ve nakit harcar. Çalışma kitabı kalıcıdır: kurs çalışmasını iki kat ilerletir.","Small purchases cost time and cash. The study book is permanent: it doubles course progress.")}</p>${actionCards(state,a=>a.panel==="market")}`;
 else if(screen==="decisions") {
  const event=currentEvent(state),due=state.turn===1||state.turn%3===0,decided=state.flags.majorTurn===state.turn;
  body=!due?`<p>${t("Şu anda büyük bir dönüm noktası yok. Normal hayat eylemleriyle devam et.","No major turning point right now. Continue with everyday life actions.")}</p>`:`<p class="eyebrow">${t("ÖZEL DÖNÜM NOKTASI · 1 HAK","SPECIAL TURNING POINT · 1 ACTION")}</p><h3>${h(loc(event.title))}</h3><p>${h(loc(event.text))}</p>${decided?`<p>${t("Karar kaydedildi. Normal eylemlerine dönebilirsin.","Decision recorded. You can return to everyday actions.")}</p>`:`<div class="choice-grid">${choicesFor(event).map(choice=>{const c=choiceCopy[choice]||["Bu yolu seç","Sonucu şimdi, gölgesi sonra","Choose this path","Result now; shadow later"];const cost=["give","help","return"].includes(choice)?200:choice==="school"?150:0;return `<button type="button" class="choice" data-choice="${choice}" ${l.used.length>=2||r.money<cost||state.age>=36?"disabled":""}><strong>${h(t(c[0],c[2]))}</strong><small>${h(t(c[1],c[3]))} · ₺${cost} · ${t("1 hak","1 action")}</small></button>`}).join("")}</div>`}`;
 } else if(screen==="shadows") body=state.shadows.map(s=>`<article class="shadow"><h3>${h(labelShadow(s.category))}</h3><p>${t("Kaynak yaş","Source age")}: ${s.createdAt} · ${s.status==="open"?t("Açık · dönüş zamanı gizli","Open · return time hidden"):t("Sonuçlandı","Resolved")}</p>${s.text?`<p>${h(loc(s.text))}</p>`:""}</article>`).join("")||`<p>${t("Henüz gölge yok. Büyük kararlar ileride iz bırakabilir.","No shadows yet. Major decisions can leave a later mark.")}</p>`;
 else body=`<div class="result-feed">${historyRows(state,60)}</div>`;
 return `<section class="active-panel"><p class="eyebrow">${h(t(...(screens.find(x=>x[0]===screen)||screens[0]).slice(1)))}</p><h2>${screen==="actions"?t("Bugün hangi hayata emek vereceksin?","Which part of life will you work on?"):h(t(...(screens.find(x=>x[0]===screen)||screens[0]).slice(1)))}</h2>${state.age>=36?`<p class="result-card">${t("Hayat dosyası tamamlandı. Kararlarını ve dönen gölgelerini geçmişte inceleyebilirsin.","Life file complete. Review your decisions and returned shadows in history.")}</p>`:""}${body}</section>`;
}

function draw(session) {
  const state = session.state;
  if (!state) {
    if (view === "setup") return setup(session);
    root.innerHTML = frontMenu(session, {
      title: "HAYAT",
      eyebrow: t("BİR YAŞAM YÖNETİM OYUNU", "A LIFE MANAGEMENT GAME"),
      pitch: t(
        "İş, insanlar, ev ve beden: iki eylemle hayatına yön ver. Büyük kararların gölgeleri yıllar sonra döner.",
        "Work, people, home and health: shape life with two actions. Major choices cast shadows years later.",
      ),
      slotSummary: (s) =>
        `${h(s.playerName || t("İsimsiz", "Unnamed"))} · ${s.age} ${t("yaş", "years")} · ${t("Bölüm", "Chapter")} ${s.chapter}`,
    });
    bindFrontMenu(root, session, {
      onNew: () => {
        draftName = "";
        view = "setup";
        draw(session);
      },
    });
    return;
  }
  const screen = state.ui?.screen || "actions";
  const renderedTurn = state.turn;
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar","← Games")}</a><span class="topbar__title">HAYAT</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="life-hud"><div><p class="eyebrow">${h(state.playerName)}</p><h1>${state.age} ${t("YAŞ","YEARS")}</h1><small>${h(jobName(state))} · ${h(homeName(state))}</small></div><div class="hud-metrics"><span>₺${state.resources.money}</span><span>${t("Enerji","Energy")} ${state.resources.energy}</span><span>${t("Beden","Health")} ${state.resources.health}</span><span>${t("Stres","Stress")} ${state.life.stress}</span></div></section><section class="life-management"><nav class="life-nav" aria-label="${t("Hayat bölümleri","Life sections")}">${screens.map(x=>`<button type="button" data-screen="${x[0]}" class="${screen===x[0]?"is-active":""}">${t(x[1],x[2])}</button>`).join("")}</nav><div class="life-center"><div class="passage-bar"><strong>${t("Dönem","Passage")} ${state.turn} · ${state.life.used.length}/2 ${t("hak kullanıldı","actions used")}</strong><button id="next" type="button" ${state.age>=36?"disabled":""}>${t("DÖNEMİ İLERLET","ADVANCE PASSAGE")}</button></div>${panel(state)}<p class="notice" role="status">${h(session.notice)}</p><details class="life-help"><summary>${t("Nasıl oynanır?","How to play?")}</summary><p>${t("Eylemlerden iki farklı iş seç. İş para kazandırır; dinlenme enerji verir. Kurs, iş ve insanlar birbirini açar. Büyük dönüm noktası ara sıra gelir; bir hakkını kullanır ve yıllar sonra Uzun Gölge bırakabilir. Dört dönem bir yıl eder. Dönem sonu giderleri ödenir; para yetmezse borç oluşur. Kullanılmayan haklar kaybolur. Üç kayıt bağımsızdır.","Choose two different everyday actions. Work earns money; rest restores energy. Courses, jobs and people open new paths. Major turning points appear occasionally, cost one action and may return years later as a Long Shadow. Four passages make a year. Essentials are charged at passage end; unpaid costs become debt. Unused actions expire. Three saves are independent.")}</p></details></div><details class="result-feed live-log" open><summary>${t("HAYAT AKIŞI","LIFE FEED")}</summary>${historyRows(state,8)}</details></section><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>`;
  root.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>session.setUI("screen",b.dataset.screen)));
  root.querySelectorAll("[data-life-action]").forEach(b=>b.addEventListener("click",()=>session.act(`act:${b.dataset.lifeAction}@${renderedTurn}`)));
  root.querySelectorAll("[data-choice]").forEach(button=>button.addEventListener("click",()=>session.act(`choose:${button.dataset.choice}@${renderedTurn}`)));
  root.querySelector("#next")?.addEventListener("click",()=>session.act(`advance@${renderedTurn}`));
  bindSavePanel(root,session);
}
bootGame("hayat",draw);
