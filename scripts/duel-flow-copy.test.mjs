/**
 * The match must be followable from the flow rail alone.
 *
 * Every event the engine logs needs a sentence, and every reason a card can
 * move for needs a phrase — otherwise a card leaves the board and the rail
 * says "Rakip: Etki", which is what made the game unreadable to a newcomer.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  DESTINATION,
  MOVE_REASON,
  eventStory,
  moveStory,
} from "../public/games/duel-core/flow-copy.js";

const NULLISH =
  /(?<![\p{L}\p{N}_])(null|undefined)(?![\p{L}\p{N}_])|(?<![\p{L}\p{N}_])NaN(?![\p{L}\p{N}_])|\[object Object\]/u;

const ctx = (over = {}) => ({
  lang: "tr",
  point: "OP",
  you: "Siz",
  foe: "Rakip",
  mine: false,
  name: "Örnek Kart",
  ...over,
});

/** Every reason string the engine can attach to a move or destroy. */
function emittedReasons() {
  const found = new Set();
  for (const file of readdirSync("public/games/duel-core").filter((f) => f.endsWith(".js"))) {
    const src = readFileSync(`public/games/duel-core/${file}`, "utf8");
    // ctx.move(uid, toZone, reason) — the reason is the second string, and
    // ctx.destroy(uid, reason) the first, so they are read separately rather
    // than by grabbing whichever quoted word comes first.
    for (const m of src.matchAll(/ctx\.move\([^;)]*?,\s*"[a-z-]+"\s*,\s*"([a-z-]+)"/g))
      found.add(m[1]);
    for (const m of src.matchAll(/ctx\.destroy\([^;)]*?,\s*"([a-z-]+)"/g)) found.add(m[1]);
    for (const m of src.matchAll(/reason: "([a-z-]+)"/g)) found.add(m[1]);
  }
  return [...found];
}

test("every reason a card can move for has a phrase, in both languages", () => {
  for (const reason of emittedReasons())
    for (const lang of ["tr", "en"])
      assert.ok(
        MOVE_REASON[lang][reason],
        `${lang}: no phrase for move reason "${reason}" — the card would leave unexplained`,
      );
});

test("the two languages describe the same set of reasons and destinations", () => {
  assert.deepEqual(Object.keys(MOVE_REASON.tr).sort(), Object.keys(MOVE_REASON.en).sort());
  assert.deepEqual(Object.keys(DESTINATION.tr).sort(), Object.keys(DESTINATION.en).sort());
});

test("a move reads as who, what, and why", () => {
  const told = moveStory({ event: "move", to: "grave", reason: "tribute", uid: "x" }, ctx());
  assert.match(told.head, /Rakip/);
  assert.match(told.head, /Örnek Kart/);
  assert.match(told.why, /adak/, "the reason is what stops a card simply vanishing");
});

test("banishing says the card is gone for good", () => {
  const told = moveStory({ event: "move", to: "banished", reason: "effect" }, ctx());
  assert.match(told.note, /geri dönmez/);
  const en = moveStory({ event: "move", to: "banished", reason: "effect" }, ctx({ lang: "en" }));
  assert.match(en.note, /not come back/);
});

test("the events that used to say nothing now say something", () => {
  for (const event of [
    "destroy",
    "summon",
    "auxiliary-summon",
    "tribute",
    "set",
    "set-activate",
    "flip",
    "spell",
    "equip",
    "token",
    "token-left",
    "direct-declared",
    "battle-kill",
    "summon-zone-lost",
    "attack-target-left",
    "reveal",
    "look",
  ])
    for (const lang of ["tr", "en"]) {
      const line = eventStory({ event, player: 1 }, ctx({ lang }));
      assert.ok(line && line.trim().length > 5, `${lang}/${event}: no sentence`);
      assert.ok(!NULLISH.test(line), `${lang}/${event}: nullish in "${line}"`);
    }
});

test("narration never leaks a nullish value when the card is unknown", () => {
  for (const lang of ["tr", "en"])
    for (const event of ["destroy", "summon", "spell", "flip"]) {
      const line = eventStory({ event, player: 0 }, ctx({ lang, name: "" }));
      assert.ok(!NULLISH.test(line), `${lang}/${event}: "${line}"`);
    }
  const told = moveStory({ event: "move", to: "hand" }, ctx({ name: "" }));
  assert.ok(!NULLISH.test(told.head + told.why + told.note));
});
