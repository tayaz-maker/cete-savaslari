export const draw = (count = 1, opponent = false) => ({ op: "draw", count, opponent });
export const points = (amount, opponent = false) => ({ op: "points", amount, opponent });
export const select = (key, selector, count = 1) => ({
  op: "select",
  key,
  selector,
  count,
  chooser: key === "discard" && selector.owner === "opponent" ? "opponent" : "own",
});
export const move = (to, count = 1, reason = "effect") => ({ op: "move", to, count, reason });
export const discard = (count = 1, opponent = false, random = false) => ({
  op: "discard",
  count,
  opponent,
  random,
});
export const flag = (name, value = true, opponent = false) => ({
  op: "flag",
  name,
  value,
  opponent,
});
export const modifier = (value, permanent = false) => ({ op: "modifier", value, permanent });
export const token = (count, attack, defense, tr, en) => ({
  op: "token",
  count,
  attack,
  defense,
  tr,
  en,
});
export const own = (zones = "units", filter = {}) => ({ owner: "own", zones, ...filter });
export const enemy = (zones = "units", filter = {}) => ({ owner: "opponent", zones, ...filter });
export const card = (name, text, action = [], traits = {}, triggers = []) => ({
  name,
  text,
  effects: action,
  traits,
  triggers,
});
export const on = (event, effects, options = {}) => ({ event, effects, ...options });
export const search = (key, filter = {}, count = 1) => [
  select(key, own("deck", filter), count),
  move("hand", count),
  { op: "shuffle" },
];
export const summon = (key, zones, filter = {}, count = 1) => [
  select(key, own(zones, { kind: "unit", ...filter }), count),
  { op: "summon", count },
];
export const set = (key, zones, filter = { kind: "trap" }) => [
  select(key, own(zones, filter)),
  { op: "set" },
];
export const buff = (value) => [select("unit", own()), modifier(value)];
