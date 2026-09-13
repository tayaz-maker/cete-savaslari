/**
 * Player-facing text guards.
 *
 * Nothing nullish may ever reach the screen as the words "null", "undefined"
 * or "[object Object]". Template literals bypass the DOM helper's own child
 * filtering, so every interpolated value and every joined list goes through
 * here first. `0` is meaningful in a card game and is always kept.
 */

/** A value safe to interpolate: strings and finite numbers only. */
export function plain(value) {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  return typeof value === "string" ? value : "";
}

/** Localized `{tr, en}` record, or a plain string, resolved for one language. */
export function localized(value, lang = "tr") {
  if (value && typeof value === "object" && !Array.isArray(value))
    return plain(value[lang] ?? value.tr ?? value.en);
  return plain(value);
}

/** Joins a list, dropping nullish and blank entries. Returns "" when empty. */
export function joinText(list, separator = ", ") {
  if (!Array.isArray(list)) return "";
  return list
    .map((entry) => plain(entry).trim())
    .filter(Boolean)
    .join(separator);
}

/** Builds "a · b · c" from parts, skipping any that resolve to nothing. */
export function detailLine(parts, separator = " · ") {
  return joinText(parts, separator);
}
