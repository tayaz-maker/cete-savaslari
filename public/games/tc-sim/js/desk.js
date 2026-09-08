import { managementDesk, managementDeck } from "../../shared/management-desk.js";

// Only public rendered nodes cross this boundary: no hidden people data,
// simulation state, action dispatch or save function is passed to the desk.
export function arrangeLifeDesk(view, text) {
  const layout = document.querySelector(".game-body");
  const workspace = layout?.querySelector(".workspace");
  if (!workspace) return;
  const operations = document.querySelector(".game-topbar");
  const week = workspace.querySelector(".week-control");
  if (week && operations) operations.append(week);
  const selectors = {
    career: ".option-card",
    education: ".option-card",
    home: ".option-card",
    market: ".wealth-grid > button",
    finance: ".wealth-grid > *, .open-case",
    people: ".person-detail",
    relationships: ".panel",
    dashboard: ".overview-grid > .panel, .agenda-panel, .people-panel, .cases-panel",
    body: ".panel",
    calendar: ".panel",
    character: ".panel",
    history: ".memory",
    yearbook: ".open-case",
  };
  const history = [...workspace.querySelectorAll(".history-panel, .career-history")];
  if (view === "finance") {
    const panels = [...workspace.querySelectorAll(".panel")];
    // Existing transaction and investment reports keep their full entries,
    // amounts and cost basis. No fictitious running balance is reconstructed.
    history.push(...panels.filter(panel => panel.querySelector(".history")));
  }
  managementDeck(layout, history, text("KAYIT / HESAP DÖKÜMÜ", "RECORD / ACCOUNT LEDGER"));
  managementDesk({ workspace, layout, key: `life:${view}`, selector: selectors[view] || ".panel", text, searchSelector: view === "people" ? ".person-select" : undefined });
}
