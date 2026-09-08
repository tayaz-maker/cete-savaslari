import { managementDesk, managementDeck } from "../shared/management-desk.js";

export function arrangeStateDesk(root, screen, text) {
  const layout = root.querySelector(".state-layout");
  const workspace = root.querySelector(".state-center");
  if (!workspace) return;
  const operations = root.querySelector(".topbar");
  const date = root.querySelector(".state-head");
  const advance = workspace.querySelector("#advance");
  if (operations && date) operations.insertBefore(date, operations.querySelector(".topbar__tools"));
  if (operations && advance) operations.append(advance);
  const budget = workspace.querySelector(".month-bar");
  if (budget) { budget.classList.add("desk-budget"); workspace.prepend(budget); }
  const changes = workspace.querySelector(".action-feedback .data-grid");
  if (changes) {
    const doc = root.ownerDocument;
    const table = doc.createElement("table");
    const head = doc.createElement("thead");
    const titles = doc.createElement("tr");
    for (const title of [text("Önce → Sonra (rapor)", "Before → After (reported)"), text("Rapor güveni", "Report confidence")]) {
      const th = doc.createElement("th"); th.scope = "col"; th.textContent = title; titles.append(th);
    }
    head.append(titles);
    const body = doc.createElement("tbody");
    for (const paragraph of [...changes.children]) {
      const row = doc.createElement("tr"), value = doc.createElement("td"), confidence = doc.createElement("td");
      const note = paragraph.querySelector("small");
      if (note) confidence.append(note);
      value.append(paragraph);
      row.append(value, confidence); body.append(row);
    }
    table.append(head, body); changes.replaceWith(table);
  }
  managementDeck(layout, [...workspace.querySelectorAll(screen === "economy" ? ".action-feedback" : ".action-feedback, .dashboard-grid")], text("DÖNEM / RAPOR DEFTERİ", "PERIOD / REPORT LEDGER"));
  const selector = ["home", "agenda", "policy"].includes(screen)
    ? ".decision-grid > .decision, .file"
    : screen === "history" ? ".card > p" : ".report-card, .file";
  managementDesk({ workspace, layout, key: `state:${screen}`, selector, text });
}
