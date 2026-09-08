// Presentation only: keep the original buttons and their gameplay listeners.
export function compactNavigation(nav, more = "Diğer bölümler", primaryCount = 4) {
  if (!nav || nav.classList.contains("compact-nav")) return;
  const buttons = Array.from(nav.querySelectorAll("button"));
  if (buttons.length <= primaryCount) return;
  nav.classList.add("compact-nav");
  const doc = nav.ownerDocument;
  const extra = doc.createElement("div");
  extra.className = "nav-secondary";
  extra.id = "game-secondary-navigation";
  const toggle = doc.createElement("button");
  toggle.type = "button";
  toggle.className = "nav-more";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", extra.id);
  const active = buttons.find((button) => button.classList.contains("is-active"));
  active?.setAttribute("aria-current", "page");
  const secondaryActive = buttons.indexOf(active) >= primaryCount;
  toggle.textContent = secondaryActive ? `${more} · ${active.textContent.trim()}` : more;
  if (secondaryActive) toggle.classList.add("is-active");
  buttons.slice(primaryCount).forEach((button) => extra.append(button));
  nav.append(toggle, extra);
  const close = () => {
    nav.classList.remove("is-expanded");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-expanded");
    nav.classList.toggle("is-expanded", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-expanded")) {
      close();
      toggle.focus();
      event.preventDefault();
    }
  });
  nav.addEventListener("click", (event) => {
    const target = event.target.closest("[data-view], [data-screen]");
    if (!target) return;
    const attribute = target.hasAttribute("data-view") ? "data-view" : "data-screen";
    const value = target.getAttribute(attribute);
    close();
    // Renderers replace their DOM on navigation. Restore keyboard focus without
    // calling an action twice, persisting UI state or adding a global listener.
    queueMicrotask(() => {
      const replacement = Array.from(doc.querySelectorAll(`[${attribute}]`))
        .find((button) => button.getAttribute(attribute) === value);
      const moreButton = replacement?.closest(".nav-secondary")
        ? replacement.closest(".compact-nav").querySelector(".nav-more") : null;
      const focusTarget = moreButton?.getClientRects().length ? moreButton : replacement;
      focusTarget?.focus({ preventScroll: true });
    });
  });
}
