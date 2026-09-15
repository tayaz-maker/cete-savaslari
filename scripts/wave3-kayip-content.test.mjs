import test from "node:test";
import assert from "node:assert/strict";
import { applyAction, normalize, DISCOVERABLES, createPhoneState, availableEvidence, PHONE_FACTS, PHONE_SIDE_SECRETS, ENDINGS, phoneThreads, evidenceSpec } from "../public/games/next-wave.js";
import {
  coverage,
  EXTRA_DISCOVERABLES,
  EXCLUSIVE_PAIRS,
  EXTRA_PATHS,
  EXTRA_SECRET_EVIDENCE,
  ALTERNATE_THREADS,
  SIDE_SECRET_ROUTES,
  SIDE_SECRET_STAGES,
  CONTACT_VOICES,
  MESSAGE_HEADS,
  THREAD_EXTRAS,
  ITEM_VARIANTS,
  itemAllowed,
} from "../public/games/next-wave/kayip-content.js";
import { CONTACTS, THREADS } from "../public/games/next-wave/kayip-data.js";

const copy = (value) => JSON.parse(JSON.stringify(value));
const discover = (state, ids) => ids.forEach((id) => applyAction("kayip-telefon", state, `discover:${id}`));
const closeCase = (state, decision = "return") => {
  applyAction("kayip-telefon", state, `decision:${decision}`);
  applyAction("kayip-telefon", state, "return");
  return state;
};
const RESTRAINED_FULL_SOLVE = [
  "photo_ticket", "cal_bus", "cal_naz", "photo_cafe",
  "file_pdf", "cal_work", "call_leyla", "voice_2", "deleted_ali",
];

test("Wave 3 content coverage: unique ids, floors met, voices distinct", () => {
  const cov = coverage();
  assert.ok(cov.extraDiscoverables >= 80, `extras ${cov.extraDiscoverables}`);
  assert.ok(cov.messagePieces >= 80, `messages ${cov.messagePieces}`);
  assert.ok(cov.notes >= 30, `notes ${cov.notes}`);
  assert.ok(cov.media >= 20, `media ${cov.media}`);
  assert.ok(cov.callsCalendarFilesVoice >= 15, `ccfv ${cov.callsCalendarFilesVoice}`);
  assert.ok(cov.daily >= 20, `daily ${cov.daily}`);
  assert.ok(cov.clueVariants >= 20, `variants ${cov.clueVariants}`);
  assert.ok(cov.misdirect >= 15, `misdirect ${cov.misdirect}`);
  assert.ok(cov.contradict >= 15, `contradict ${cov.contradict}`);
  assert.ok(cov.exclusive >= 6, `exclusive ${cov.exclusive}`);
  assert.ok(cov.seedSensitive >= 10, `seed ${cov.seedSensitive}`);
  assert.ok(cov.alternateThreads >= 10, `alts ${cov.alternateThreads}`);
  assert.equal(cov.voices, 9);
  assert.ok(cov.sideSecretRoutes >= 10);
  assert.equal(cov.sideSecretStages, 5);
  assert.ok(cov.extraPaths >= 10);
  assert.equal(new Set(DISCOVERABLES.map((x) => x.id)).size, DISCOVERABLES.length);
  assert.equal(new Set(EXTRA_DISCOVERABLES.map((x) => x.id)).size, EXTRA_DISCOVERABLES.length);
  const core = new Set(DISCOVERABLES.map((x) => x.id).filter((id) => !EXTRA_DISCOVERABLES.some((row) => row.id === id)));
  for (const item of EXTRA_DISCOVERABLES) assert.equal(core.has(item.id), false, `extra collides ${item.id}`);
  assert.equal(CONTACTS.length, 9);
  assert.equal(Object.keys(CONTACT_VOICES).length, 9);
  assert.equal(Object.keys(MESSAGE_HEADS).length, 8);
  assert.equal(Object.keys(THREAD_EXTRAS).length, 8);
  for (const heads of Object.values(MESSAGE_HEADS)) assert.equal(heads.length, 6);
  const voices = CONTACTS.map((c) => JSON.stringify(c.voice));
  assert.equal(new Set(voices).size, voices.length);
});

test("catalog references resolve: extra paths, secrets, exclusive, alts", () => {
  const ids = new Set(DISCOVERABLES.map((x) => x.id));
  for (const [fact, paths] of Object.entries(EXTRA_PATHS)) {
    assert.ok(PHONE_FACTS.some((row) => row.id === fact), fact);
    for (const path of paths) {
      assert.ok(path.length >= 2, `${fact} short`);
      for (const id of path) assert.ok(ids.has(id), `${fact} missing ${id}`);
    }
  }
  for (const [secret, extras] of Object.entries(EXTRA_SECRET_EVIDENCE)) {
    const row = PHONE_SIDE_SECRETS.find((x) => x.id === secret);
    assert.ok(row, secret);
    for (const id of extras) {
      assert.ok(ids.has(id), `${secret} missing ${id}`);
      assert.ok(row.evidence.includes(id), `${secret} not wired ${id}`);
    }
    assert.equal(row.threshold, 2);
  }
  for (const [family, pairIds] of Object.entries(EXCLUSIVE_PAIRS)) {
    assert.equal(pairIds.length, 2, family);
    assert.notEqual(pairIds[0], pairIds[1]);
    for (const id of pairIds) assert.ok(ids.has(id), `${family} ${id}`);
  }
  for (const thread of ALTERNATE_THREADS) {
    for (const id of thread.items) assert.ok(ids.has(id), `${thread.id} ${id}`);
  }
  for (const [secret, routes] of Object.entries(SIDE_SECRET_ROUTES)) {
    assert.ok(routes.length >= 2, secret);
    for (const route of routes) for (const id of route) assert.ok(ids.has(id), `${secret} route ${id}`);
  }
  for (const [secret, stages] of Object.entries(SIDE_SECRET_STAGES)) {
    assert.ok(Object.keys(stages).length >= 3, secret);
  }
  for (const item of EXTRA_DISCOVERABLES) {
    assert.ok(Array.isArray(item.title) && item.title.length === 2, item.id);
    assert.ok(Array.isArray(item.text) && item.text.length === 2, item.id);
    assert.notEqual(item.pressure, 8, item.id);
    assert.ok(!["file_scan", "note_pass", "lock_note"].includes(item.id));
  }
});

test("extra fact paths walk and original paths still hold", () => {
  for (const fact of PHONE_FACTS.filter((x) => x.critical)) {
    assert.ok(fact.paths.length >= 4, fact.id);
    for (const path of fact.paths) {
      const state = createPhoneState(71);
      discover(state, path);
      assert.ok(state.knownFacts.includes(fact.id), `${fact.id} ${path}`);
    }
  }
});

test("Leyla silence, Mert debt and Naz cafe chains walk", () => {
  const leyla = createPhoneState(12);
  discover(leyla, ["msg_leyla_seen", "note_draft_leyla", "call_mom_home", "photo_bag"]);
  assert.ok(leyla.knownFacts.includes("family-unaware"));
  const mert = createPhoneState(12);
  mert.caseLayout.activeSecrets = ["debt", "relationship", "work", "health", "account"];
  discover(mert, ["note_payday", "call_mert"]);
  assert.ok(mert.sideSecrets.includes("debt"));
  const naz = createPhoneState(12);
  discover(naz, ["call_naz_missed", "photo_cafe"]);
  assert.ok(naz.knownFacts.includes("naz-meeting"));
});

test("exclusive siblings never both appear in one run UI, discover-by-id still works", () => {
  for (let seed = 1; seed <= 20; seed += 1) {
    const state = createPhoneState(seed);
    const shown = new Set();
    for (const app of ["messages", "contacts", "calls", "photos", "notes", "calendar", "files", "voice"]) {
      for (const item of availableEvidence(state, app)) shown.add(item.id);
    }
    for (const [family, pairIds] of Object.entries(EXCLUSIVE_PAIRS)) {
      const visible = pairIds.filter((id) => shown.has(id));
      assert.equal(visible.length, 1, `seed ${seed} ${family} ${visible}`);
      const hidden = pairIds.find((id) => !shown.has(id));
      discover(state, [hidden]);
      assert.ok(state.discoveredItems.includes(hidden));
    }
  }
});

test("old save without exclusive derives from caseSeed and stays deterministic", () => {
  const fresh = createPhoneState(44);
  const raw = copy(fresh);
  delete raw.caseLayout.exclusive;
  const loaded = normalize("kayip-telefon", raw);
  assert.deepEqual(loaded.caseLayout.exclusive, fresh.caseLayout.exclusive);
  const again = normalize("kayip-telefon", copy(loaded));
  assert.deepEqual(again.caseLayout.exclusive, loaded.caseLayout.exclusive);
  assert.equal(JSON.stringify(again.caseLayout), JSON.stringify(loaded.caseLayout));
});

test("thread overlays stay out of the save and reload is identical", () => {
  const state = createPhoneState(5);
  const rendered = phoneThreads(state);
  assert.equal(rendered.length, 8);
  for (const thread of rendered) {
    const saved = state.threads.find((row) => row.id === thread.id);
    assert.ok(thread.messages.length > saved.messages.length, thread.id);
    assert.equal(saved.messages.length, THREADS.find((row) => row.id === thread.id).messages.length);
  }
  const encoded = JSON.stringify(state);
  assert.equal(encoded.includes("görüldü · yanıt yok"), false);
  const loaded = normalize("kayip-telefon", JSON.parse(encoded));
  assert.deepEqual(phoneThreads(loaded).map((x) => x.messages), rendered.map((x) => x.messages));
  const v = state.caseLayout.messageVariant;
  assert.ok(v >= 0 && v < 6);
});

test("seed-sensitive item variants are deterministic and do not change truth", () => {
  const a = createPhoneState(90);
  const b = createPhoneState(90);
  const c = createPhoneState(91);
  const specA = evidenceSpec(a, "photo_cafe");
  const specB = evidenceSpec(b, "photo_cafe");
  const specC = evidenceSpec(c, "photo_cafe");
  assert.deepEqual(specA.text, specB.text);
  assert.equal(specA.id, "photo_cafe");
  assert.ok(ITEM_VARIANTS.photo_cafe.some((row) => JSON.stringify(row.text) === JSON.stringify(specA.text)));
  const titles = new Set([JSON.stringify(specA.text), JSON.stringify(specC.text)]);
  const spread = new Set(Array.from({ length: 30 }, (_, i) => JSON.stringify(evidenceSpec(createPhoneState(i + 1), "photo_cafe").text)));
  assert.ok(spread.size >= 2, `flavor spread ${spread.size}`);
  assert.ok(titles.size >= 1);
});

test("restrained full solve pressure stays 72 and intimate list is frozen", () => {
  const state = createPhoneState(7);
  discover(state, RESTRAINED_FULL_SOLVE);
  assert.equal(state.privacyPressure, 72);
  applyAction("kayip-telefon", state, "theory:what:planned");
  applyAction("kayip-telefon", state, "theory:naz:confidant");
  applyAction("kayip-telefon", state, "theory:ali:lied");
  closeCase(state);
  assert.equal(state.flags.ending, "witness");
  assert.ok(Array.isArray(state.caseReport.traces));
  assert.ok(state.caseReport.traces.length >= 3);
  assert.equal(new Set(state.caseReport.traces.map((row) => row.id)).size, state.caseReport.traces.length);
});

test("save/load mid-investigation keeps overlay and exclusive", () => {
  const state = createPhoneState(18);
  discover(state, ["clue_0", "photo_ticket", "cal_bus", "note_pack"]);
  applyAction("kayip-telefon", state, "theory:what:planned");
  applyAction("kayip-telefon", state, "pin:photo_ticket");
  const mid = JSON.stringify(state);
  assert.ok(mid.length < 20000);
  assert.equal(mid.includes("NaN"), false);
  const loaded = normalize("kayip-telefon", JSON.parse(mid));
  assert.deepEqual(loaded.discoveredItems, state.discoveredItems);
  assert.deepEqual(loaded.caseLayout.exclusive, state.caseLayout.exclusive);
  assert.equal(loaded.hypotheses[0].status, "supported");
  discover(loaded, ["photo_bag"]);
  assert.ok(loaded.knownFacts.includes("planned-departure"));
});

test("max-content graph and report stay below the 20 KB save ceiling", () => {
  const state = createPhoneState(99173);
  discover(state, DISCOVERABLES.map((x) => x.id));
  const ids = state.discoveredItems;
  for (let i = 0; i < ids.length && state.evidenceLinks.length < 64; i += 1) {
    for (let j = i + 1; j < ids.length && state.evidenceLinks.length < 64; j += 1) {
      applyAction("kayip-telefon", state, `link:${ids[i]}:${ids[j]}`);
    }
  }
  ids.slice(0, 20).forEach((id) => applyAction("kayip-telefon", state, `pin:${id}`));
  ["what:planned", "naz:confidant", "ali:lied"].forEach((answer) => applyAction("kayip-telefon", state, `theory:${answer}`));

  const preEnding = JSON.stringify(state);
  assert.ok(Buffer.byteLength(preEnding) < 20_000, `pre-ending save ${Buffer.byteLength(preEnding)}`);
  closeCase(state, "expose");
  const postEnding = JSON.stringify(state);
  assert.ok(Buffer.byteLength(postEnding) < 20_000, `post-ending save ${Buffer.byteLength(postEnding)}`);
  assert.equal(state.discoveredItems.length, DISCOVERABLES.length);
  assert.equal(state.evidenceLinks.length, 64);
  assert.equal(state.pinnedItems.length, 20);
  assert.equal(state.hypotheses.length, 3);
  assert.equal(state.caseReport.traces.length, 10);
  assert.deepEqual(normalize("kayip-telefon", JSON.parse(postEnding)).caseReport, state.caseReport);
});

test("no delayed callbacks on the phone; delayed-once is N/A", () => {
  const state = createPhoneState(3);
  discover(state, DISCOVERABLES.map((x) => x.id));
  closeCase(state);
  assert.equal(state.delayedEffects, undefined);
  assert.equal(JSON.stringify(state).includes("callback"), false);
});

test("20 seeds x 12 strategies diverge, stay finite and bounded", () => {
  const endings = new Set(), theories = new Set(), secrets = new Set(), sizes = [];
  const shownSets = new Set();
  const strategies = ["early", "travel", "naz", "work", "ali", "family", "privacy", "broad", "wrong", "selective", "secrets", "daily"];
  for (let seed = 1; seed <= 20; seed += 1) for (const strategy of strategies) {
    const state = createPhoneState(seed);
    const extras = EXTRA_DISCOVERABLES.map((x) => x.id);
    const pools = {
      early: [],
      travel: ["photo_ticket", "cal_bus", "photo_bag", "note_pack", "cal_pack"],
      naz: ["cal_naz", "photo_cafe", "file_map", "call_naz_missed", "photo_naz_table"],
      work: ["file_pdf", "cal_work", "call_emre", "note_whistle", "file_mail_fwd"],
      ali: ["note_pin", "voice_2", "deleted_ali", "cal_ali_lie", "note_ali_times"],
      family: ["clue_0", "call_leyla", "photo_ticket", "cal_bus", "msg_leyla_seen", "note_draft_leyla"],
      privacy: ["note_pin", "file_scan", "note_pass", "lock_note"],
      broad: DISCOVERABLES.map((x) => x.id),
      wrong: ["photo_ticket", "cal_bus"],
      selective: ["clue_0", "photo_bag", "cal_naz", "photo_cafe", "file_pdf", "cal_work"],
      secrets: ["note_debt", "bank_sms", "deleted_draft", "photo_key", "cal_clinic", "photo_eczane", "file_chat", "contact_naz_note", "note_payday", "call_mert"],
      daily: extras.filter((id) => EXTRA_DISCOVERABLES.find((row) => row.id === id)?.tags?.includes("daily")).slice(0, 12),
    };
    discover(state, pools[strategy]);
    if (strategy === "wrong") applyAction("kayip-telefon", state, "theory:what:abduction");
    else if (strategy !== "early") applyAction("kayip-telefon", state, "theory:what:planned");
    closeCase(state, strategy === "wrong" ? "accuse-ali" : strategy === "family" ? "warn-family" : "return");
    endings.add(state.flags.ending);
    state.hypotheses.forEach((x) => theories.add(`${x.question}:${x.option}:${x.status}`));
    state.sideSecrets.forEach((x) => secrets.add(x));
    const encoded = JSON.stringify(state);
    sizes.push(encoded.length);
    assert.ok(!encoded.includes("NaN"));
    assert.ok(state.caseReport);
    assert.ok(Array.isArray(state.caseReport.traces));
    assert.ok(state.history.length <= 80);
    assert.ok(state.timeline.length <= 80);
    const threads = phoneThreads(state);
    const signature = [
      state.caseLayout.messageVariant,
      JSON.stringify(state.caseLayout.exclusive),
      threads.map((row) => Array.isArray(row.messages[0]) ? row.messages[0][0] : row.messages[0]).join("|"),
    ].join("::");
    shownSets.add(signature);
  }
  assert.ok(endings.size >= 4, JSON.stringify([...endings]));
  assert.ok(theories.size >= 2);
  assert.ok(secrets.size >= 3);
  assert.ok(Math.max(...sizes) < 20000, `save ${Math.max(...sizes)}`);
  assert.ok(shownSets.size >= 10, `ui diversity ${shownSets.size}`);
  assert.ok(Object.keys(ENDINGS).length === 5);
});

test("pair overlays never dump as comma-joined strings", () => {
  const state = createPhoneState(2);
  for (const thread of phoneThreads(state)) {
    for (const message of thread.messages) {
      if (Array.isArray(message)) {
        assert.equal(message.length, 2);
        assert.equal(typeof message[0], "string");
        assert.equal(typeof message[1], "string");
        assert.ok(!message[0].includes(message[1]));
      } else if (message && typeof message === "object") {
        assert.ok(Array.isArray(message.text) || typeof message.text === "string");
      } else {
        assert.equal(typeof message, "string");
        assert.equal(message.includes(","), false);
      }
    }
  }
  const spec = evidenceSpec(state, EXTRA_DISCOVERABLES[0].id);
  assert.equal(Array.isArray(spec.title), true);
  assert.equal(spec.title.length, 2);
});

test("itemAllowed hides inactive exclusive sibling", () => {
  const exclusive = { payee: "file_receipt_2400" };
  assert.equal(itemAllowed("file_receipt_2400", exclusive), true);
  assert.equal(itemAllowed("photo_mert_atm", exclusive), false);
  assert.equal(itemAllowed("clue_0", exclusive), true);
});

test("contact voices carry bilingual relation pairs", () => {
  for (const [id, voice] of Object.entries(CONTACT_VOICES)) {
    assert.ok(Array.isArray(voice.relation) && voice.relation.length === 2, id);
    assert.notEqual(voice.relation[0], voice.relation[1], id);
  }
  for (const contact of CONTACTS) {
    assert.ok(Array.isArray(contact.relation) && contact.relation.length === 2, contact.id);
  }
});

test("case report keeps actor traces, secret misleads and a hard cap of 10", () => {
  const leyla = createPhoneState(12);
  discover(leyla, ["clue_0", "call_leyla", "msg_leyla_seen", "photo_iban_blur", "photo_ticket", "cal_bus"]);
  closeCase(leyla);
  const ids = leyla.caseReport.traces.map((row) => row.id);
  assert.ok(ids.includes("actor:leyla"), JSON.stringify(ids));
  assert.ok(ids.includes("mislead:debt") || ids.includes("fact:planned-departure"));
  assert.ok(ids.includes("ending:thorough") || ids.includes("ending:witness") || ids.includes("ending:family") || ids.includes("ending:minimal") || ids.includes("ending:reckless"));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length <= 10);
  for (const row of leyla.caseReport.traces) {
    assert.ok(Array.isArray(row.text) && row.text.length === 2, row.id);
  }

  const naz = createPhoneState(8);
  discover(naz, ["cal_naz", "photo_cafe"]);
  closeCase(naz);
  const nazIds = naz.caseReport.traces.map((row) => row.id);
  assert.ok(nazIds.includes("actor:naz"));
  assert.equal(nazIds.includes("actor:ali"), false);
});
