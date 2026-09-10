import { PROPOSALS, RESIDENTS } from "../next-wave.js";
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

const root = document.body;
const money = (n) => new Intl.NumberFormat("tr-TR").format(Math.round(n));
let view = "menu";

function slotSummary(state) {
  return t(
    `${state.week}. hafta · ₺${money(state.finance.cash)} kasa · ${state.issues.filter((issue) => issue.status === "acik").length} açık mesele`,
    `Week ${state.week} · ₺${money(state.finance.cash)} cash · ${state.issues.filter((issue) => issue.status === "acik").length} open issues`,
  );
}

function menu(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header>${frontMenu(
    session,
    {
      kicker: t("YÖNETİCİ DOSYASI", "MANAGER FILE"),
      title: "YUNUS APARTMANI",
      pitch: t(
        "Bir bina, on altı daire, bitmeyen meseleler.",
        "One building, sixteen flats, issues that never end.",
      ),
      summary: slotSummary,
      help: t(
        "Meseleyi seç, dosyayı hazırla, Toplantı Gecesi'nde tek teklifi oylat ve haftayı kapat.",
        "Choose an issue, prepare its file, vote one proposal on Meeting Night, then close the week.",
      ),
    },
  )}</main>`;
  bindFrontMenu(root, session, {
    onNew: () => {
      view = "setup";
      session.render();
    },
  });
}

function setup(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header><section class="setup-shell card"><p class="eyebrow">${t("YÖNETİM DOSYASI", "MANAGEMENT FILE")}</p><h1>YUNUS APARTMANI</h1><p>${t("1978 yapımı, 16 daire. Anahtar, ilan panosu ve hesap defteri sana geçecek.", "Built in 1978, sixteen flats. The keys, notice board and ledger will pass to you.")}</p><div class="apt-metrics"><span class="pill">16 ${t("sakin", "residents")}</span><span class="pill">₺12.000 ${t("kasa", "cash")}</span><span class="pill">₺2.400 ${t("aidat", "dues")}</span><span class="pill">72/100 ${t("bina", "building")}</span><span class="pill">5 ${t("açık mesele", "open issues")}</span></div><div class="setup-actions"><button type="button" id="cancel-setup">${t("GERİ", "BACK")}</button><button type="button" id="confirm-start" class="primary">${t("YÖNETİMİ DEVRAL", "TAKE MANAGEMENT")}</button></div></section></main>`;
  root.querySelector("#cancel-setup").addEventListener("click", () => {
    session.cancelNew();
    view = "menu";
    session.render();
  });
  root.querySelector("#confirm-start").addEventListener("click", () => session.commitNew());
}

function issueCard(issue, state) {
  const people = (issue.parties || [])
    .map((id) => RESIDENTS.find((resident) => resident.id === id)?.name)
    .filter(Boolean);
  const prepared = (state.flags.prepared || []).includes(issue.id);
  const focused = state.flags.focusIssue === issue.id;
  return `<button type="button" class="issue ${focused ? "is-focus" : ""}" data-issue="${h(issue.id)}">
    <strong>${h(loc(issue.title || issue.type))}</strong>
    <small>${h(issue.system || t("ortak alan", "common area"))} · ${t("tahmini", "estimate")} ₺${money((issue.severity || 1) * 550)} · ${t("gecikme riski", "delay risk")} ${issue.severity || 1}/4</small>
    <small>${people.length ? h(people.join(" · ")) : t("Duyuru kutusundan geldi", "Filed through the notice box")} ${prepared ? `· ✓ ${t("hazırlandı", "prepared")}` : ""}</small>
  </button>`;
}

function draw(session) {
  const state = session.state;
  if (!state) {
    return view === "setup" ? setup(session) : menu(session);
  }

  const open = state.issues.filter((issue) => issue.status === "acik");
  const focus = open.find((issue) => issue.id === state.flags.focusIssue) || open[0];
  const residents = (focus?.parties || [])
    .map((id) => state.residents.find((resident) => resident.id === id))
    .filter(Boolean);
  const meetingDone = state.flags.meetingWeek === state.week;
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">APARTMAN · ${t("YÖNETİCİ DEFTERİ", "MANAGER LEDGER")}</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header>
    <section class="apt-head"><div><p class="eyebrow">${state.week}. ${t("HAFTA", "WEEK")}</p><h1>${t("Yönetici Masası", "Manager Desk")}</h1></div><div class="apt-metrics"><span class="pill metric">${t("Kasa", "Cash")} ₺${money(state.finance.cash)}</span><span class="pill metric">${t("Aidat", "Dues")} ₺${money(state.finance.dues)}</span><span class="pill">${t("Bina", "Building")} ${state.building.condition}/100</span></div></section>
    <section class="apt-board"><aside class="card"><p class="eyebrow">${t("BİNA", "BUILDING")}</p><div class="building-list">${state.building.parts.map((part) => `<div class="building-row"><span>${h(loc(part.name))}</span><b>${Math.round(part.condition)}</b><div class="meter"><i style="--value:${part.condition}%"></i></div></div>`).join("")}</div></aside>
      <section class="card desk"><p class="eyebrow">${t("BUGÜNÜN MESELELERİ", "TODAY'S ISSUES")}</p><div class="issue-list">${
        open
          .slice(0, 6)
          .map((issue) => issueCard(issue, state))
          .join("") ||
        `<p>${t("Açık mesele yok; haftayı kapatabilirsin.", "No open issue; you can close the week.")}</p>`
      }</div>
        ${focus ? `<div class="desk-actions"><button type="button" data-prepare="${h(focus.id)}" ${(state.flags.prepared || []).includes(focus.id) || (state.flags.prepared || []).length >= 2 ? "disabled" : ""}>${t("Dosyayı hazırla", "Prepare file")} · ${(state.flags.prepared || []).length}/2</button><span class="muted">${t("Toplantı gündemi", "Meeting agenda")}: ${h(loc(focus.title))}</span></div>` : ""}</section>
      <aside class="card notice-board"><p class="eyebrow">${t("DUYURU / ZİL DEFTERİ", "NOTICE / INTERCOM LOG")}</p><div class="resident-list">${(residents.length ? residents : state.residents.slice(0, 4)).map((resident) => `<div class="resident"><strong>${h(resident.name)}</strong><br>${resident.floor}. ${t("kat", "floor")} · ${resident.pays ? t("aidat tamam", "dues paid") : t("aidat gecikmiş", "dues late")} · ${t("memnuniyet", "satisfaction")} ${resident.satisfaction}${resident.memory?.length ? `<br>${t("Son hafıza", "Last memory")}: ${h(loc(resident.memory.at(-1)))}` : ""}</div>`).join("")}</div></aside></section>
    ${state.lastMeeting ? `<section class="card vote-result"><strong>${t("Son oylama", "Last vote")}: ${state.lastMeeting.yes}-${state.lastMeeting.no}</strong> · ${state.lastMeeting.accepted ? t("Kabul", "Passed") : t("Ret", "Rejected")} · ${h(loc(PROPOSALS.find((p) => p.id === state.lastMeeting.proposal)?.label || state.lastMeeting.proposal))}</section>` : ""}
    ${
      state.ui?.ledgerOpen
        ? `<section class="card"><p class="eyebrow">${t("YÖNETİCİ DEFTERİ", "MANAGER LEDGER")}</p>${
            state.history
              .slice(-8)
              .reverse()
              .map((row) => `<p>${h(loc(row.text || row.proposal || row.issue || row.type))}</p>`)
              .join("") || `<p>${t("Defter boş.", "Ledger is empty.")}</p>`
          }</section>`
        : ""
    }
    <div class="apt-footer-actions"><button type="button" id="history">${t("Defterden son kayıtlar", "Recent ledger")}</button><button type="button" id="meeting" class="primary" ${meetingDone || !focus ? "disabled" : ""}>${meetingDone ? t("Bu hafta toplantı yapıldı", "Meeting already held this week") : t("TOPLANTI GECESİ", "MEETING NIGHT")}</button><button type="button" id="advance">${t("HAFTAYI KAPAT", "CLOSE THE WEEK")}</button></div>
    <p class="notice">${h(session.notice)}</p><details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Yunus Apartmanı'nın yöneticisisin: kasaya, binaya ve sakinlere sen bakarsın. Her hafta listeden bir mesele seç, en fazla iki dosya hazırla, sonra Toplantı Gecesi'nde maliyet/risk dengesi taşıyan bir teklifi oylat — sakinler kendi memnuniyetine, etkisine ve geçmiş kararları hatırlayan hafızasına göre oy kullanır. Zaman yalnızca HAFTAYI KAPAT dediğinde ilerler: aidat tahsilatı, bina eskimesi ve ucuz yamalar gibi gecikmiş sonuçlar o anda işlenir. Kasa, aidat ve bina durumunu üst paneldeki göstergelerden, sakinlerin memnuniyetini ve hafızasını duyuru/zil defterinden takip et. Amacın binayı ayakta, kasayı dengede ve sakinleri idare edilebilir tutmak; resmi bir bitiş yok, istediğin kadar hafta yönetebilirsin. Her hamlen aktif kayıt slotuna otomatik işlenir; üç yerel slot birbirinden bağımsızdır.", "Choose an issue. Prepare up to two files. At Meeting Night choose a cost/risk proposal and see the residents' vote. Closing the week processes dues, wear and delayed consequences once.")}</p></details><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>
    ${state.ui?.meetingOpen ? `<div class="meeting-scene" role="dialog" aria-modal="true" aria-labelledby="meeting-title"><section class="meeting-paper"><p class="eyebrow">${t("GÜNDEM", "AGENDA")}</p><h2 id="meeting-title">${h(loc(focus?.title || t("Apartman bütçesi", "Building budget")))}</h2><p>${t("Hazırlanan dosya", "Prepared files")}: ${(state.flags.prepared || []).length}/2 · ${t("Sakinler salonda. Tek teklif oylanacak.", "Residents are in the room. One proposal will be voted.")}</p><div class="proposal-grid">${PROPOSALS.map((proposal) => `<button type="button" data-proposal="${h(proposal.id)}"><strong>${h(loc(proposal.label))}</strong><br><small>₺${money(proposal.cash || 0)} · ${t("bina", "condition")} ${proposal.condition >= 0 ? "+" : ""}${proposal.condition} · ${t("risk", "risk")} ${proposal.risk}</small></button>`).join("")}</div><button type="button" id="close-meeting">${t("Masaya dön", "Back to desk")}</button></section></div>` : ""}`;

  root
    .querySelectorAll("[data-issue]")
    .forEach((button) =>
      button.addEventListener("click", () => session.act(`focus:${button.dataset.issue}`)),
    );
  root
    .querySelector("[data-prepare]")
    ?.addEventListener("click", (event) =>
      session.act(`prepare:${event.currentTarget.dataset.prepare}`),
    );
  root
    .querySelector("#meeting")
    ?.addEventListener("click", () => session.setUI("meetingOpen", true));
  root
    .querySelector("#close-meeting")
    ?.addEventListener("click", () => session.setUI("meetingOpen", false));
  root.querySelectorAll("[data-proposal]").forEach((button) =>
    button.addEventListener("click", () => {
      if (session.act(`proposal:${button.dataset.proposal}`)) session.setUI("meetingOpen", false);
    }),
  );
  root.querySelector("#advance").addEventListener("click", () => session.act("advance"));
  root
    .querySelector("#history")
    .addEventListener("click", () => session.setUI("ledgerOpen", !state.ui?.ledgerOpen));
  bindSavePanel(root, session);
}

bootGame("apartman", draw);
