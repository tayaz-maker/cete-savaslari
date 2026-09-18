import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { pools } from "./duel-pools.mjs";
import { primitives } from "../public/games/duel-core/effects.js";
import {
  deserialize,
  loadDuel,
  saveDuel,
  saveKey,
  serialize,
} from "../public/games/duel-core/save.js";
import {
  HISTORY_KEY,
  SETTINGS_KEY,
  loadSettings,
  saveSettings,
  settingsKey,
} from "../public/games/duel-core/prefs.js";
import {
  ONBOARDING_KEY,
  markOnboardingSeen,
  onboardingKey,
  onboardingSeen,
  resetOnboarding,
} from "../public/games/duel-core/onboarding.js";
import { createDuel, dispatch } from "../public/games/duel-core/rules.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction, AI_PROFILE_IDS } from "../public/games/duel-core/ai.js";
import { expandDeck, DECK_COPY, deckIds } from "../public/games/duel-core/decks.js";
import { themeMeta } from "../public/games/duel-core/theme-meta.js";

const NULLISH = /(?<![\p{L}\p{N}_])(null|undefined)(?![\p{L}\p{N}_])|(?<![\p{L}\p{N}_])NaN(?![\p{L}\p{N}_])|\[object Object\]/u;
const BAN = /silah|suikast|tank|tutukla|işkence|sabotaj|dinleme cihaz|ele geçir|infaz|cinayet|darbe plan|gözaltı|bomba|mermi|tevkif|ordu birlik/i;

const effectSig = (card) =>
  JSON.stringify({
    kind: card.kind,
    subtype: card.subtype,
    effects: card.effects,
    triggers: card.triggers,
    traits: card.traits,
  });

function memStore(seed = []) {
  const mem = new Map(seed);
  return {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, v),
    removeItem: (k) => mem.delete(k),
    mem,
  };
}

test("DARBE-H! has 300 unique bilingual cards on the shared schema", () => {
  const pool = pools["darbe-h"];
  assert.equal(pool.length, 300);
  assert.equal(new Set(pool.map((c) => c.id)).size, 300);
  assert.equal(new Set(pool.map((c) => c.name.tr)).size, 300);
  assert.equal(new Set(pool.map((c) => c.name.en)).size, 300);
  const kinds = { unit: 0, spell: 0, trap: 0 };
  for (const [i, c] of pool.entries()) {
    assert.equal(c.id, `DRB-${String(i + 1).padStart(3, "0")}`);
    assert.ok(c.name.tr.length > 2 && c.name.en.length > 2);
    assert.ok(c.text.tr.length > 4 && c.text.en.length > 4);
    assert.doesNotMatch(c.name.tr + c.text.tr + c.name.en + c.text.en, NULLISH);
    assert.doesNotMatch(c.name.tr + c.text.tr, BAN);
    kinds[c.kind]++;
    const inspect = (value) => {
      if (!value || typeof value !== "object") return;
      if (value.op) assert.equal(typeof primitives[value.op], "function", `${c.id} ${value.op}`);
      for (const nested of Object.values(value)) inspect(nested);
    };
    inspect({ effects: c.effects, costs: c.costs, triggers: c.triggers, traits: c.traits });
  }
  assert.equal(kinds.unit, 170);
  assert.equal(kinds.spell, 79);
  assert.equal(kinds.trap, 51);
  assert.equal(pool.filter((c) => c.deckLocation === "auxiliary").length, 12);
  assert.equal(themeMeta("darbe-h").name, "DARBE-H!");
  assert.equal(themeMeta("darbe-h").point, "KP");
  assert.equal(themeMeta("darbe-h").prefix, "DRB");
});

test("DARBE-H! is not a card-for-card VETO or GETT reskin", () => {
  const darbe = pools["darbe-h"];
  const veto = pools["veto-h"];
  const gett = pools["gett-oh"];
  const dSig = darbe.map(effectSig);
  const vSig = veto.map(effectSig);
  const gSig = gett.map(effectSig);
  const unique = new Set(dSig);
  const counts = {};
  for (const s of dSig) counts[s] = (counts[s] || 0) + 1;
  const largest = Math.max(...Object.values(counts));
  let vetoExact = 0,
    gettExact = 0;
  for (let i = 0; i < 300; i++) {
    if (dSig[i] === vSig[i]) vetoExact++;
    if (dSig[i] === gSig[i]) gettExact++;
  }
  const vSet = new Set(vSig);
  const gSet = new Set(gSig);
  const sharedV = dSig.filter((s) => vSet.has(s)).length;
  const sharedG = dSig.filter((s) => gSet.has(s)).length;
  console.log(
    JSON.stringify({
      cards: 300,
      uniqueFullSignatures: unique.size,
      largestDuplicateFamily: largest,
      exactIndexMatchVeto: vetoExact,
      exactIndexMatchGett: gettExact,
      sharedEffectSignaturesVeto: sharedV,
      sharedEffectSignaturesGett: sharedG,
    }),
  );
  assert.ok(unique.size >= 80, unique.size);
  assert.ok(largest <= 24, largest);
  assert.ok(vetoExact < 20, vetoExact);
  assert.ok(gettExact < 20, gettExact);
  assert.ok(sharedV < 180, sharedV);
  assert.ok(sharedG < 180, sharedG);
  assert.doesNotMatch(JSON.stringify(darbe.map((c) => c.name)), /Sandık|Ballot|Kadıköy|Racon/);
  assert.doesNotMatch(JSON.stringify(darbe.map((c) => c.name)), /Sicil|Manşet|Kalemci|Hüküm/);
});

test("five crisis decks exist and isolate from sibling identities", () => {
  assert.deepEqual(deckIds("darbe-h").sort(), ["istisare", "karargah", "muhtira", "tebligat", "zeyilname"].sort());
  assert.equal(DECK_COPY["darbe-h"].muhtira.name.tr, "Muhtıra");
  assert.equal(DECK_COPY["veto-h"].halkci.name.tr, "Halkçı");
  const presets = JSON.parse(readFileSync("public/games/darbe-h/decks.json", "utf8"));
  assert.equal(presets.theme, "darbe-h");
  assert.equal(presets.decks.length, 5);
  const pool = pools["darbe-h"];
  for (const d of presets.decks) {
    const n = d.cards.reduce((s, e) => s + e.count, 0);
    assert.equal(n, 40, d.id);
    for (const e of d.cards) assert.ok(pool.some((c) => c.id === e.id), e.id);
  }
});

test("DARBE-H! saves reject VETO/GETT/İHTİLAL and do not share keys", () => {
  const pool = pools["darbe-h"];
  const state = createDuel(pool, "darbe-h", 9);
  const store = memStore();
  assert.equal(saveKey("darbe-h"), "tariklab.darbe-h.duel");
  assert.notEqual(saveKey("darbe-h"), saveKey("veto-h"));
  assert.equal(saveDuel(store, state).ok, true);
  assert.ok(store.getItem("tariklab.darbe-h.duel"));
  assert.equal(store.getItem("tariklab.veto-h.duel"), null);
  const loaded = loadDuel(store, pool, "darbe-h");
  assert.equal(loaded.ok, true);
  assert.equal(loaded.state.theme, "darbe-h");
  const vetoRaw = serialize(createDuel(pools["veto-h"], "veto-h", 3));
  assert.equal(deserialize(vetoRaw, pool, "darbe-h").ok, false);
  const envelope = JSON.parse(serialize(state));
  envelope.payload = JSON.stringify({ ...JSON.parse(envelope.payload), theme: "ihtilal" });
  assert.equal(deserialize(JSON.stringify(envelope), pool, "darbe-h").ok, false);
});

test("DARBE-H! settings and onboarding never read the shared duel keys", () => {
  const store = memStore([[SETTINGS_KEY, JSON.stringify({ uiScale: 125, aiProfile: "gambler" })]]);
  store.setItem(ONBOARDING_KEY, "done");
  assert.equal(settingsKey("darbe-h"), "tariklab.darbe-h.settings.v1");
  assert.equal(onboardingKey("darbe-h"), "tariklab.darbe-h.onboarding.v1");
  assert.equal(HISTORY_KEY("darbe-h"), "tariklab.darbe-h.history.v1");
  const settings = loadSettings(store, "darbe-h");
  assert.equal(settings.uiScale, 100, "no shared-key fallback for a new sibling");
  assert.equal(onboardingSeen(store, "darbe-h"), false, "shared onboarding does not mark DARBE");
  markOnboardingSeen(store, "darbe-h");
  resetOnboarding(store, "veto-h");
  assert.equal(onboardingSeen(store, "darbe-h"), true);
  saveSettings(store, { uiScale: 80 }, "darbe-h");
  saveSettings(store, { uiScale: 110 }, "veto-h");
  assert.equal(loadSettings(store, "darbe-h").uiScale, 80);
  assert.equal(loadSettings(store, "veto-h").uiScale, 110);
});

test("DARBE-H! AI plays legal public actions and finishes a fixture", () => {
  const pool = pools["darbe-h"];
  const presets = JSON.parse(readFileSync("public/games/darbe-h/decks.json", "utf8")).decks;
  let state = createDuel(pool, "darbe-h", 21, 0, [
    expandDeck(presets[0], pool, 21),
    expandDeck(presets[1], pool, 22),
  ]);
  const view = publicView(state, 1);
  const hidden = Object.values(view.cards).filter((c) => c.owner === 0 && c.zone === "hand");
  for (const c of hidden) assert.equal(c.name, undefined);
  let guard = 0;
  while (!state.result && guard++ < 4000) {
    const actor = state.choice?.player ?? state.pending?.responding ?? state.active;
    const legal = legalActions(state, actor);
    assert.ok(legal.length, `soft-lock t${state.turn}`);
    const pick = chooseAction(publicView(state, actor), legal, AI_PROFILE_IDS[actor % 5]);
    const res = dispatch(state, pick);
    assert.equal(res.ok, true);
    state = res.state;
  }
  assert.ok(state.result);
  assert.ok(Number.isFinite(state.players[0].points));
});

test("DARBE-H! sources do not call Math.random", () => {
  for (const file of ["app.js", "designs.js"]) {
    const src = readFileSync(new URL(`../public/games/darbe-h/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(src, /Math\.random/);
  }
  assert.doesNotMatch(readFileSync(new URL("../public/games/darbe-h/index.html", import.meta.url), "utf8"), /startApp\("veto-h"|startApp\("gett-oh"|ihtilal/);
});

test("VETO-H! and GETT-OH! presentation verbs stay byte-identical after the third sibling", () => {
  const v = themeMeta("veto-h");
  const g = themeMeta("gett-oh");
  assert.equal(v.battleEnter.tr, "Tartışmaya Geç");
  assert.equal(v.battleEnter.en, "Enter Debate");
  assert.equal(v.tributeSummon.tr, "İstifa ile Çağır");
  assert.equal(v.tributeSummon.en, "Summon by Resignation");
  assert.equal(v.activateTrap.tr, "Skandalı Aç");
  assert.equal(v.setVerb.tr, "Set Et");
  assert.equal(g.battleEnter.tr, "Kapışmaya Geç");
  assert.equal(g.battleEnter.en, "Enter Clash");
  assert.equal(g.tributeSummon.tr, "Adam Yakarak Sür");
  assert.equal(g.tributeSummon.en, "Tribute Crew");
  assert.equal(g.setVerb.tr, "Setle");
  assert.equal(g.directAttack.tr, "Kapıya Dayan");
  assert.equal(g.activateSpell.tr, "Raconu Aç");
  assert.equal(themeMeta("darbe-h").battleEnter.tr, "Krize Geç");
  assert.notEqual(themeMeta("darbe-h").setVerb.tr, g.setVerb.tr);
});
