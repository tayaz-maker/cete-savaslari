import { PROPOSALS, RESIDENTS } from "../next-wave.js";
import {
  bindSavePanel,
  bootGame,
  escapeHtml as h,
  savePanel,
  text as t,
} from "../next-wave/shared/runtime.js";

const root = document.body;
const money = (n) => new Intl.NumberFormat("tr-TR").format(Math.round(n));

function issueCard(issue, state) {
  const people = (issue.parties || [])
    .map((id) => RESIDENTS.find((resident) => resident.id === id)?.name)
    .filter(Boolean);
  const prepared = (state.flags.prepared || []).includes(issue.id);
  const focused = state.flags.focusIssue === issue.id;
  return `<button type="button" class="issue ${focused ? "is-focus" : ""}" data-issue="${h(issue.id)}">
    <strong>${h(issue.title || issue.type)}</strong>
    <small>${h(issue.system || t("ortak alan", "common area"))} · ${t("tahmini", "estimate")} ₺${money((issue.severity || 1) * 550)} · ${t("gecikme riski", "delay risk")} ${issue.severity || 1}/4</small>
    <small>${people.length ? h(people.join(" · ")) : t("Duyuru kutusundan geldi", "Filed through the notice box")} ${prepared ? `· ✓ ${t("hazırlandı", "prepared")}` : ""}</small>
  </button>`;
}

function draw(session) {
  const state = session.state;
  if (!state) {
    root.innerHTML = `<main class="game-root"><header class="topbar"><a href="/">${t("← Oyunlar", "← Games")}</a><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header>
      <section class="apt-head"><div><p class="eyebrow">${t("Yönetici odası · ilan panosu", "Manager office · notice board")}</p><h1>YUNUS APARTMANI</h1><p class="muted">${t("1978 yapımı · 16 daire · ilk gün kasada ₺12.000", "Built in 1978 · 16 flats · ₺12,000 opening cash")}</p></div></section>
      <section class="card"><h2>${t("Anahtar ve defter sende.", "The keys and ledger are yours.")}</h2><p>${t("Meseleleri önceliklendir, iki hazırlık yap, toplantıda teklifini oylat ve haftayı kapat.", "Prioritize issues, make two preparations, put a proposal to vote, then close the week.")}</p><button id="start" type="button">${t("YÖNETİME BAŞLA", "TAKE MANAGEMENT")}</button></section><p class="notice">${h(session.notice)}</p></main>`;
    root.querySelector("#start").addEventListener("click", () => session.start());
    bindSavePanel(root, session);
    return;
  }

  const open = state.issues.filter((issue) => issue.status === "acik");
  const focus = open.find((issue) => issue.id === state.flags.focusIssue) || open[0];
  const residents = (focus?.parties || [])
    .map((id) => state.residents.find((resident) => resident.id === id))
    .filter(Boolean);
  const meetingDone = state.flags.meetingWeek === state.week;
  root.innerHTML = `<main class="game-root"><header class="topbar"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">APARTMAN · ${t("YÖNETİCİ DEFTERİ", "MANAGER LEDGER")}</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header>
    <section class="apt-head"><div><p class="eyebrow">${state.week}. ${t("HAFTA", "WEEK")}</p><h1>${t("Yönetici Masası", "Manager Desk")}</h1></div><div class="apt-metrics"><span class="pill metric">${t("Kasa", "Cash")} ₺${money(state.finance.cash)}</span><span class="pill metric">${t("Aidat", "Dues")} ₺${money(state.finance.dues)}</span><span class="pill">${t("Bina", "Building")} ${state.building.condition}/100</span></div></section>
    <section class="apt-board"><aside class="card"><p class="eyebrow">${t("BİNA", "BUILDING")}</p><div class="building-list">${state.building.parts.map((part) => `<div class="building-row"><span>${h(part.name)}</span><b>${Math.round(part.condition)}</b><div class="meter"><i style="--value:${part.condition}%"></i></div></div>`).join("")}</div></aside>
      <section class="card desk"><p class="eyebrow">${t("BUGÜNÜN MESELELERİ", "TODAY'S ISSUES")}</p><div class="issue-list">${
        open
          .slice(0, 6)
          .map((issue) => issueCard(issue, state))
          .join("") ||
        `<p>${t("Açık mesele yok; haftayı kapatabilirsin.", "No open issue; you can close the week.")}</p>`
      }</div>
        ${focus ? `<div class="desk-actions"><button type="button" data-prepare="${h(focus.id)}" ${(state.flags.prepared || []).includes(focus.id) || (state.flags.prepared || []).length >= 2 ? "disabled" : ""}>${t("Dosyayı hazırla", "Prepare file")} · ${(state.flags.prepared || []).length}/2</button><span class="muted">${t("Toplantı gündemi", "Meeting agenda")}: ${h(focus.title)}</span></div>` : ""}</section>
      <aside class="card notice-board"><p class="eyebrow">${t("DUYURU / ZİL DEFTERİ", "NOTICE / INTERCOM LOG")}</p><div class="resident-list">${(residents.length ? residents : state.residents.slice(0, 4)).map((resident) => `<div class="resident"><strong>${h(resident.name)}</strong><br>${resident.floor}. ${t("kat", "floor")} · ${resident.pays ? t("aidat tamam", "dues paid") : t("aidat gecikmiş", "dues late")} · ${t("memnuniyet", "satisfaction")} ${resident.satisfaction}${resident.memory?.length ? `<br>${t("Son hafıza", "Last memory")}: ${h(resident.memory.at(-1))}` : ""}</div>`).join("")}</div></aside></section>
    ${state.lastMeeting ? `<section class="card vote-result"><strong>${t("Son oylama", "Last vote")}: ${state.lastMeeting.yes}-${state.lastMeeting.no}</strong> · ${state.lastMeeting.accepted ? t("Kabul", "Passed") : t("Ret", "Rejected")} · ${h(state.lastMeeting.proposal)}</section>` : ""}
    ${
      state.ui?.ledgerOpen
        ? `<section class="card"><p class="eyebrow">${t("YÖNETİCİ DEFTERİ", "MANAGER LEDGER")}</p>${
            state.history
              .slice(-8)
              .reverse()
              .map((row) => `<p>${h(row.text || row.proposal || row.issue || row.type)}</p>`)
              .join("") || `<p>${t("Defter boş.", "Ledger is empty.")}</p>`
          }</section>`
        : ""
    }
    <div class="apt-footer-actions"><button type="button" id="history">${t("Defterden son kayıtlar", "Recent ledger")}</button><button type="button" id="meeting" class="primary" ${meetingDone || !focus ? "disabled" : ""}>${meetingDone ? t("Bu hafta toplantı yapıldı", "Meeting already held this week") : t("TOPLANTI GECESİ", "MEETING NIGHT")}</button><button type="button" id="advance">${t("HAFTAYI KAPAT", "CLOSE THE WEEK")}</button></div>
    <p class="notice">${h(session.notice)}</p><details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Bir mesele seç. En fazla iki dosya hazırla. Toplantı Gecesi'nde maliyet/risk teklifini seç ve sakinlerin oyunu gör. Haftayı kapatınca aidat, bina eskimesi ve gecikmiş sonuçlar yalnız bir kez işlenir.", "Choose an issue. Prepare up to two files. At Meeting Night choose a cost/risk proposal and see the residents' vote. Closing the week processes dues, wear and delayed consequences once.")}</p></details><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>
    ${state.ui?.meetingOpen ? `<div class="meeting-scene" role="dialog" aria-modal="true" aria-labelledby="meeting-title"><section class="meeting-paper"><p class="eyebrow">${t("GÜNDEM", "AGENDA")}</p><h2 id="meeting-title">${h(focus?.title || t("Apartman bütçesi", "Building budget"))}</h2><p>${t("Hazırlanan dosya", "Prepared files")}: ${(state.flags.prepared || []).length}/2 · ${t("Sakinler salonda. Tek teklif oylanacak.", "Residents are in the room. One proposal will be voted.")}</p><div class="proposal-grid">${PROPOSALS.map((proposal) => `<button type="button" data-proposal="${h(proposal.id)}"><strong>${h(proposal.label)}</strong><br><small>₺${money(proposal.cash || 0)} · ${t("bina", "condition")} ${proposal.condition >= 0 ? "+" : ""}${proposal.condition} · ${t("risk", "risk")} ${proposal.risk}</small></button>`).join("")}</div><button type="button" id="close-meeting">${t("Masaya dön", "Back to desk")}</button></section></div>` : ""}`;

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
