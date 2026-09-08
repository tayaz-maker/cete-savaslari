import { managementDesk, managementDeck } from "../shared/management-desk.js";

export function arrangeStateDesk(root, screen, text) {
  const layout = root.querySelector(".state-layout");
  const workspace = root.querySelector(".state-center");
  if (!workspace) return;
  managementDeck(layout, [...workspace.querySelectorAll(screen === "economy" ? ".action-feedback" : ".action-feedback, .dashboard-grid")], text("DÖNEM / RAPOR DEFTERİ", "PERIOD / REPORT LEDGER"));
  const selector = ["home", "agenda", "policy"].includes(screen)
    ? ".decision-grid > .decision, .file"
    : screen === "history" ? ".card > p" : ".report-card, .file";
  managementDesk({ workspace, layout, key: `state:${screen}`, selector, text });
}
