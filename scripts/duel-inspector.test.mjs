/**
 * Kart Ayrıntısı regression cover.
 *
 * Two defects live here. The nullish one was a rendering bug: `inspectBody`
 * returns an array with a `null` in every slot an optional field does not
 * fill, and the hover preview handed that array straight to
 * `replaceChildren`, which stringifies whatever it is given — one literal
 * "null" per empty slot. The explanation one was copy: every phase problem
 * read "Bu kart bu aşamada oynanamaz." whatever the board looked like.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { explainRejection } from "../public/games/duel-core/explain.js";
import { REJECTION_COPY, rejectionText } from "../public/games/duel-core/rejections.js";

const NULLISH =
  /(?<![\p{L}\p{N}_])(null|undefined)(?![\p{L}\p{N}_])|(?<![\p{L}\p{N}_])NaN(?![\p{L}\p{N}_])|\[object Object\]/u;

const PHASE_TR = {
  draw: "Çekiş",
  standby: "Hazırlık",
  main1: "Hamle 1",
  battle: "Savaş",
  main2: "Hamle 2",
  end: "Bitiş",
  unit: "Kadro",
};

const ctx = (over = {}) => ({
  lang: "tr",
  theme: "veto-h",
  point: "OP",
  unitWord: "Kadro",
  label: (key) => PHASE_TR[key] || key,
  state: {
    turn: 3,
    phase: "standby",
    players: [{ points: 8000, normalUsed: 1, units: [null, null, null, null, null], support: [] }],
  },
  card: { level: 4, series: [], attacksUsed: 0 },
  ...over,
});

test("the hover preview never hands a raw child list to the DOM", () => {
  // The fix is structural: both insertion paths go through one filter, so the
  // guard is that no call site spreads a nullable array into replaceChildren.
  const app = readFileSync("public/games/duel-core/app.js", "utf8");
  const raw = [...app.matchAll(/replaceChildren\(\s*\.\.\.([A-Za-z0-9_$.]+)\(/g)].map((m) => m[1]);
  for (const call of raw)
    assert.equal(
      call,
      "renderable",
      `replaceChildren(...${call}(…)) bypasses the child filter and will print "null"`,
    );
});

test("phase rejections name the current phase and the ones that would work", () => {
  const text = explainRejection("main-phase-only", ctx());
  assert.match(text, /Hazırlık/, "names where the player is");
  assert.match(text, /Hamle 1/, "names where it would work");
  assert.match(text, /Hamle 2/);
  assert.notEqual(text, rejectionText("main-phase-only", "tr"), "must beat the generic copy");
});

test("tribute rejections count the card's level against the board", () => {
  const text = explainRejection(
    "tributes-required",
    ctx({
      card: { level: 7, series: [] },
      state: {
        turn: 3,
        phase: "main1",
        players: [
          { points: 8000, normalUsed: 0, units: ["a", null, null, null, null], support: [] },
        ],
      },
    }),
  );
  assert.match(text, /Kademe 7/);
  assert.match(text, /2 adak/, "level 7 needs two tributes");
  assert.match(text, /1 Kadro/, "counts what is actually on the field");
});

test("cost rejections name the cost the player cannot pay", () => {
  const text = explainRejection(
    "insufficient-points",
    ctx({
      state: {
        turn: 2,
        phase: "main1",
        players: [{ points: 300, normalUsed: 0, units: [], support: [] }],
      },
    }),
  );
  assert.match(text, /300/);
  assert.match(text, /OP/);
});

test("a full board is named as full, and a board with room falls back", () => {
  const full = explainRejection(
    "unit-zone-required",
    ctx({
      state: {
        turn: 2,
        phase: "main1",
        players: [{ points: 8000, normalUsed: 0, units: ["a", "b", "c", "d", "e"], support: [] }],
      },
    }),
  );
  assert.match(full, /5 Kadro/);
  // With a free zone the code means something else, so no invented claim.
  const room = explainRejection("unit-zone-required", ctx());
  assert.equal(room, rejectionText("unit-zone-required", "tr"));
});

test("turn one is explained as turn one, not as the wrong phase", () => {
  const first = explainRejection(
    "battle-unavailable",
    ctx({
      state: { turn: 1, phase: "battle", players: [{ points: 8000, units: [], support: [] }] },
    }),
  );
  assert.match(first, /İlk turda/);
  const wrongPhase = explainRejection(
    "battle-unavailable",
    ctx({
      state: { turn: 4, phase: "main1", players: [{ points: 8000, units: [], support: [] }] },
    }),
  );
  assert.match(wrongPhase, /Savaş/);
  assert.match(wrongPhase, /Hamle 1/);
});

test("every explanation is non-empty, in both languages, for every engine code", () => {
  for (const code of Object.keys(REJECTION_COPY))
    for (const lang of ["tr", "en"]) {
      const text = explainRejection(code, ctx({ lang }));
      assert.ok(text && text.trim().length > 5, `${code}/${lang}: empty explanation`);
      assert.ok(!NULLISH.test(text), `${code}/${lang}: nullish in "${text}"`);
    }
});

test("an unknown code still produces readable copy rather than nullish", () => {
  for (const lang of ["tr", "en"]) {
    for (const code of [null, undefined, "not-a-real-code"]) {
      const text = explainRejection(code, ctx({ lang }));
      assert.ok(text && !NULLISH.test(text), `${String(code)}/${lang}: "${text}"`);
    }
  }
});
