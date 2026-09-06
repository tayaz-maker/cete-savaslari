import { applyAction, create, normalize } from "../../next-wave.js";

const NS = "tariklab.nextwave.";

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function language() {
  return window.tlabI18n?.getLang?.() === "en" ? "en" : "tr";
}

export function text(tr, en) {
  return language() === "en" ? en : tr;
}

export function createActionGate(windowMs = 140, clock = () => performance.now()) {
  let blockedUntil = -1;
  return () => {
    const now = clock();
    if (now < blockedUntil) return false;
    blockedUntil = now + windowMs;
    return true;
  };
}

function readSlot(id, slot) {
  try {
    const raw = localStorage.getItem(`${NS}${id}.slot${slot}`);
    return raw === null ? null : normalize(id, JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePanel(session) {
  const summaries = session.slotSummaries();
  return `<details class="save-menu">
    <summary>${text("Kayıt", "Save")}</summary>
    <div class="save-popover">
      <p class="save-note">${text("Üç yerel kayıt birbirinden ayrıdır.", "Three local saves remain isolated.")}</p>
      ${summaries
        .map(
          (slot) => `<div class="save-row ${slot.active ? "is-active" : ""}">
            <button type="button" data-load-slot="${slot.number}">${text("Slot", "Slot")} ${slot.number} · ${slot.filled ? text("dolu", "occupied") : text("boş", "empty")}</button>
            <button type="button" data-save-slot="${slot.number}" ${session.state ? "" : "disabled"}>${text("Kaydet", "Save")}</button>
            <button type="button" class="danger" data-delete-slot="${slot.number}" ${slot.filled ? "" : "disabled"}>${text("Sil", "Delete")}</button>
          </div>`,
        )
        .join("")}
    </div>
  </details>`;
}

export function bindSavePanel(root, session) {
  root.querySelectorAll("[data-load-slot]").forEach((button) => {
    button.addEventListener("click", () => session.load(Number(button.dataset.loadSlot)));
  });
  root.querySelectorAll("[data-save-slot]").forEach((button) => {
    button.addEventListener("click", () => session.save(Number(button.dataset.saveSlot)));
  });
  root.querySelectorAll("[data-delete-slot]").forEach((button) => {
    button.addEventListener("click", () => {
      const slot = Number(button.dataset.deleteSlot);
      if (window.confirm(text(`Slot ${slot} silinsin mi?`, `Delete slot ${slot}?`)))
        session.remove(slot);
    });
  });
}

export function bootGame(id, draw) {
  let active = Math.min(3, Math.max(1, Number(localStorage.getItem(`${NS}${id}.active`)) || 1));
  let slots = [1, 2, 3].map((slot) => readSlot(id, slot));
  let state = slots[active - 1];
  const enterAction = createActionGate();
  let notice = "";
  let releaseLanguage = null;

  const persist = (slot = active) => {
    if (!state) return false;
    localStorage.setItem(`${NS}${id}.slot${slot}`, JSON.stringify(state));
    slots[slot - 1] = JSON.parse(JSON.stringify(state));
    notice = text(`Slot ${slot} kaydedildi.`, `Saved to slot ${slot}.`);
    return true;
  };

  const render = () => {
    draw(api);
    const host = document.querySelector("[data-lang-host]");
    if (host && window.tlabI18n) window.tlabI18n.mountLangToggle(host);
  };

  const guarded = (work) => {
    if (!enterAction()) {
      notice = text(
        "İşlem sürüyor; ikinci tıklama uygulanmadı.",
        "Action in progress; duplicate click ignored.",
      );
      render();
      return false;
    }
    work();
    return true;
  };

  const api = {
    id,
    get state() {
      return state;
    },
    get active() {
      return active;
    },
    get notice() {
      return notice;
    },
    clearNotice() {
      notice = "";
    },
    start(firstAction) {
      state = create(id);
      if (firstAction) applyAction(id, state, firstAction);
      slots[active - 1] = state;
      persist();
      render();
    },
    act(action) {
      if (!state) {
        notice = text("Önce yeni oyun başlat.", "Start a new game first.");
        render();
        return false;
      }
      return guarded(() => {
        applyAction(id, state, action);
        persist();
        render();
      });
    },
    setUI(key, value) {
      if (!state) return false;
      state.ui = state.ui || {};
      state.ui[key] = value;
      persist();
      render();
      return true;
    },
    save(slot = active) {
      if (!state) return false;
      active = slot;
      localStorage.setItem(`${NS}${id}.active`, String(active));
      persist(slot);
      render();
      return true;
    },
    load(slot) {
      active = slot;
      localStorage.setItem(`${NS}${id}.active`, String(active));
      state = readSlot(id, slot);
      slots[slot - 1] = state;
      notice = state
        ? text(`Slot ${slot} yüklendi.`, `Loaded slot ${slot}.`)
        : text(`Slot ${slot} boş.`, `Slot ${slot} is empty.`);
      render();
    },
    remove(slot) {
      localStorage.removeItem(`${NS}${id}.slot${slot}`);
      slots[slot - 1] = null;
      if (slot === active) state = null;
      notice = text(`Slot ${slot} silindi.`, `Deleted slot ${slot}.`);
      render();
    },
    slotSummaries() {
      return slots.map((value, index) => ({
        number: index + 1,
        filled: !!value,
        active: index + 1 === active,
      }));
    },
    render,
  };

  render();
  if (window.tlabI18n) releaseLanguage = window.tlabI18n.onLang(render);
  window.addEventListener("pagehide", () => releaseLanguage?.(), { once: true });
  return api;
}
