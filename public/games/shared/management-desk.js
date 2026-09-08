// DOM-only presentation. The original content and action nodes retain their
// listeners; this module never receives a game state or a persistence callback.
const selections = new Map();
const resizeHandlers = new WeakMap();
const headerObservers = new WeakMap();

export function managementDesk({ workspace, layout, key, selector, text, searchSelector }) {
  if (!workspace || !layout) return;
  layout.classList.add("management-layout");
  workspace.classList.add("management-workspace");
  const doc = workspace.ownerDocument;
  headerObservers.get(doc)?.disconnect();
  const header = layout.parentElement.querySelector(".game-topbar, .topbar");
  if (header && doc.defaultView.ResizeObserver) {
    const observer = new doc.defaultView.ResizeObserver(() => layout.style.setProperty("--desk-top", `${header.getBoundingClientRect().height + 8}px`));
    observer.observe(header);
    headerObservers.set(doc, observer);
  }
  const make = (tag, className, content) => {
    const node = doc.createElement(tag);
    node.className = className;
    if (content) node.textContent = content;
    return node;
  };
  const candidates = [...workspace.querySelectorAll(selector)];
  const items = candidates.filter(node => !candidates.some(other => other !== node && other.contains(node)));
  if (!items.length) return;
  const inspector = make("aside", "management-inspector");
  inspector.setAttribute("aria-label", text("Ayrıntı ve işlemler", "Details and actions"));
  const heading = make("h2", "inspector-heading", text("AYRINTI / İŞLEMLER", "DETAILS / ACTIONS"));
  const close = make("button", "inspector-close", text("← Listeye dön", "← Back to list"));
  close.type = "button";
  const bank = make("div", "inspector-content");
  inspector.append(heading, close, bank);
  layout.append(inspector);
  const toolbar = make("div", "desk-toolbar");
  const label = make("label", "desk-search-label", text("Bu bölümde ara", "Search this section"));
  const input = make("input", "desk-search");
  input.type = "search";
  input.placeholder = text("Ad, açıklama veya koşul…", "Name, description or requirement…");
  label.append(input);
  const count = make("span", "desk-count");
  count.setAttribute("role", "status");
  toolbar.append(label, count);
  const head = workspace.querySelector(".workspace-head");
  if (head) head.after(toolbar); else workspace.prepend(toolbar);
  const empty = make("p", "desk-empty", text("Eşleşen kayıt yok. Aramayı temizleyin.", "No matching records. Clear the search."));
  empty.hidden = true;
  toolbar.after(empty);
  let active = null;
  let returnTo = null;
  const mobile = () => doc.defaultView.matchMedia("(max-width: 900px)").matches;
  const dismiss = () => {
    inspector.classList.remove("is-open");
    inspector.removeAttribute("role");
    inspector.removeAttribute("aria-modal");
    layout.querySelectorAll("[data-desk-inert]").forEach(node => { node.inert = false; delete node.dataset.deskInert; });
    returnTo?.focus({ preventScroll: true });
  };
  const previousResize = resizeHandlers.get(doc);
  if (previousResize) doc.defaultView.removeEventListener("resize", previousResize);
  let wasMobile = mobile();
  doc.querySelectorAll("details.management-deck").forEach(deck => { deck.open = !wasMobile; });
  const onResize = () => {
    if (!mobile() && inspector.classList.contains("is-open")) dismiss();
    if (wasMobile !== mobile()) {
      wasMobile = mobile();
      doc.querySelectorAll("details.management-deck").forEach(deck => { deck.open = !wasMobile; });
    }
  };
  resizeHandlers.set(doc, onResize);
  doc.defaultView.addEventListener("resize", onResize);
  close.addEventListener("click", dismiss);
  inspector.addEventListener("keydown", event => {
    if (!mobile() || !inspector.classList.contains("is-open")) return;
    if (event.key === "Escape") { event.preventDefault(); dismiss(); }
    if (event.key === "Tab") {
      const focusable = [...inspector.querySelectorAll("button:not(:disabled), input, select, textarea, a[href], summary")].filter(node => node.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && doc.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  const rows = items.map((node, index) => {
    const title = node.querySelector("h3, h2, strong, b")?.textContent?.trim() || node.textContent.trim().split("\n")[0].slice(0, 90);
    const full = (node.innerText || node.textContent).trim().replace(/\s*\n+\s*/g, " · ").replace(/[ \t]+/g, " ");
    const row = make("button", "desk-row");
    row.type = "button";
    row.dataset.deskRow = String(index);
    row.setAttribute("aria-expanded", "false");
    const titleNode = make("strong", "desk-row-title", title);
    const summary = make("span", "desk-row-summary", full.replace(title, "").trim());
    const arrow = make("span", "desk-row-arrow", "›");
    arrow.setAttribute("aria-hidden", "true");
    row.append(titleNode, summary, arrow);
    node.replaceWith(row);
    const detail = make("section", "desk-record");
    detail.hidden = true;
    detail.id = `desk-record-${index}`;
    row.setAttribute("aria-controls", detail.id);
    detail.append(node);
    if (node.matches("button[data-wealth-action]")) {
      node.append(make("span", "desk-action-label", node.disabled ? text("Şu anda kullanılamıyor", "Currently unavailable") : text("İşlemi uygula", "Apply transaction")));
    }
    bank.append(detail);
    const select = (open = true) => {
      if (active) { active.detail.hidden = true; active.row.setAttribute("aria-expanded", "false"); }
      active = { detail, row };
      detail.hidden = false;
      row.setAttribute("aria-expanded", "true");
      selections.set(key, index);
      if (open && mobile()) {
        returnTo = row;
        inspector.classList.add("is-open");
        inspector.setAttribute("role", "dialog");
        inspector.setAttribute("aria-modal", "true");
        [...layout.children].filter(child => child !== inspector && !child.inert).forEach(child => { child.inert = true; child.dataset.deskInert = ""; });
        close.focus();
      }
    };
    row.addEventListener("click", () => select());
    return { row, full, select };
  });
  rows[Math.min(selections.get(key) || 0, rows.length - 1)].select(false);
  const searchable = searchSelector ? [...workspace.querySelectorAll(searchSelector)].map(row => ({ row, full: row.textContent })) : rows;
  const filter = () => {
    const query = input.value.toLocaleLowerCase(doc.documentElement.lang || "tr");
    let visible = 0;
    searchable.forEach(({ row, full }) => {
      row.hidden = !full.toLocaleLowerCase(doc.documentElement.lang || "tr").includes(query);
      if (!row.hidden) visible++;
    });
    count.textContent = `${visible} / ${searchable.length}`;
    empty.hidden = visible !== 0;
  };
  input.addEventListener("input", filter);
  filter();
}

export function managementDeck(layout, nodes, title) {
  const records = nodes.filter(Boolean);
  if (!records.length) return;
  const deck = layout.ownerDocument.createElement("details");
  deck.className = "management-deck";
  deck.open = !layout.ownerDocument.defaultView.matchMedia("(max-width: 900px)").matches;
  const heading = layout.ownerDocument.createElement("summary");
  heading.textContent = title;
  deck.append(heading, ...records);
  layout.after(deck);
}
