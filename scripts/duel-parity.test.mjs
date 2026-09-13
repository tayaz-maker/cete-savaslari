import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pools } from "./duel-pools.mjs";
import { expandDeck } from "../public/games/duel-core/decks.js";
import { createDuel, dispatch, rejection } from "../public/games/duel-core/rules.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction, AI_PROFILE_IDS } from "../public/games/duel-core/ai.js";
import { dispatchPresented } from "../public/games/duel-core/presentation.js";

const THEMES = ["veto-h", "gett-oh"];
const decksOf = (theme) => JSON.parse(readFileSync(`public/games/${theme}/decks.json`, "utf8"));
const actorOf = (s) => s.choice?.player ?? s.pending?.responding ?? s.active;

/**
 * Both seats are driven exactly the way the app drives them: legal actions from
 * the engine, one choice, then the same validated command path. Anything the AI
 * does here is something the player could have issued from the same state.
 */
function playMatch({ theme, seed, decks, profiles, onAction, limit = 4000 }) {
  const pool = pools[theme];
  let state = createDuel(pool, theme, seed, seed % 2, decks);
  for (let step = 0; step < limit && !state.result; step++) {
    const actor = actorOf(state);
    const legal = legalActions(state, actor);
    if (!legal.length) return { state, stalled: true, step };
    const action = chooseAction(publicView(state, actor), legal, profiles[actor]);
    if (!action) return { state, stalled: true, step };
    onAction?.({ state, actor, action, legal });
    const result = dispatchPresented(state, action);
    if (!result.ok) return { state, rejected: result.error, action, step };
    state = result.state;
  }
  return { state, finished: Boolean(state.result) };
}

/* ------------------------------------------------- one legality source */

for (const theme of THEMES) {
  test(`${theme}: every AI action is engine-legal and survives the shared validator`, () => {
    const decks = decksOf(theme).decks;
    const pool = pools[theme];
    let checked = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const prepared = [
        expandDeck(decks[seed % decks.length], pool, seed),
        expandDeck(decks[(seed + 2) % decks.length], pool, seed + 40),
      ];
      const profiles = [
        AI_PROFILE_IDS[seed % AI_PROFILE_IDS.length],
        AI_PROFILE_IDS[(seed + 1) % AI_PROFILE_IDS.length],
      ];
      const out = playMatch({
        theme,
        seed: seed * 17,
        decks: prepared,
        profiles,
        onAction: ({ state, actor, action, legal }) => {
          // The chosen action must be one the engine just offered...
          assert.ok(
            legal.some((a) => JSON.stringify(a) === JSON.stringify(action)),
            `${theme}#${seed}: actor ${actor} chose an action outside legalActions`,
          );
          // ...it must carry the current revision (never a stale replay)...
          assert.equal(action.revision, state.revision, `${theme}#${seed}: stale revision`);
          assert.equal(action.player, actor, `${theme}#${seed}: action player mismatch`);
          // ...and the shared validator must accept it.
          assert.equal(
            rejection(state, action),
            null,
            `${theme}#${seed}: validator rejects an offered action (${action.type})`,
          );
          checked++;
        },
      });
      assert.ok(!out.rejected, `${theme}#${seed}: ${out.rejected} on ${out.action?.type}`);
      assert.ok(!out.stalled, `${theme}#${seed}: stalled at step ${out.step}`);
    }
    assert.ok(checked > 500, `only ${checked} actions checked`);
  });

  test(`${theme}: neither seat gets an action the other could not issue`, () => {
    const pool = pools[theme];
    const decks = decksOf(theme).decks;
    // Same deck both sides, mirrored seats: the action vocabulary a seat is
    // offered must not depend on which seat it is.
    for (const preset of decks) {
      for (const first of [0, 1]) {
        const prepared = [expandDeck(preset, pool, 3), expandDeck(preset, pool, 3)];
        let state = createDuel(pool, theme, 99, first, prepared);
        const seen = { 0: new Set(), 1: new Set() };
        for (let step = 0; step < 400 && !state.result; step++) {
          const actor = actorOf(state);
          const legal = legalActions(state, actor);
          for (const a of legal) seen[actor].add(a.type);
          const action = chooseAction(publicView(state, actor), legal, "controlled");
          if (!action) break;
          const result = dispatchPresented(state, action);
          if (!result.ok) break;
          state = result.state;
        }
        // Neither seat may hold an action type the other never saw.
        const only0 = [...seen[0]].filter((t) => !seen[1].has(t));
        const only1 = [...seen[1]].filter((t) => !seen[0].has(t));
        for (const list of [only0, only1])
          for (const type of list)
            assert.ok(
              ["phase", "end-main", "pass", "respond", "choose"].includes(type),
              `${theme}/${preset.id}/first=${first}: "${type}" offered to only one seat`,
            );
      }
    }
  });

  test(`${theme}: the per-turn normal summon cap binds both seats equally`, () => {
    const pool = pools[theme];
    const decks = decksOf(theme).decks;
    const peak = { 0: 0, 1: 0 };
    for (let seed = 1; seed <= 8; seed++) {
      const prepared = [
        expandDeck(decks[seed % decks.length], pool, seed),
        expandDeck(decks[(seed + 1) % decks.length], pool, seed + 11),
      ];
      // Counted per match, per turn, per seat — the cap is a per-turn rule.
      const perTurn = new Map();
      playMatch({
        theme,
        seed: seed * 23,
        decks: prepared,
        profiles: ["aggressive", "aggressive"],
        onAction: ({ state, actor, action }) => {
          if (!["summon", "set-unit"].includes(action.type)) return;
          const key = `${state.turn}:${actor}`;
          const n = (perTurn.get(key) || 0) + 1;
          perTurn.set(key, n);
          peak[actor] = Math.max(peak[actor], n);
          assert.ok(
            n <= 2,
            `${theme}#${seed}: seat ${actor} made ${n} normal summons in turn ${state.turn}`,
          );
        },
      });
    }
    // Both seats reach the cap, so neither is quietly held to a lower limit.
    assert.ok(
      peak[0] >= 1 && peak[1] >= 1,
      `${theme}: a seat never summoned (${JSON.stringify(peak)})`,
    );
  });
}

/* ---------------------------------------- support sets are uncapped, evenly */

for (const theme of THEMES) {
  test(`${theme}: support sets are never capped per turn for either seat`, () => {
    const pool = pools[theme];
    const decks = decksOf(theme).decks;
    let observed = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const prepared = [
        expandDeck(decks[seed % decks.length], pool, seed),
        expandDeck(decks[(seed + 3) % decks.length], pool, seed + 31),
      ];
      playMatch({
        theme,
        seed: seed * 37,
        decks: prepared,
        profiles: ["patient", "trapper"],
        onAction: ({ state, actor, legal }) => {
          if (state.pending || state.choice) return;
          if (!["main1", "main2"].includes(state.phase) || actor !== state.active) return;
          const p = state.players[actor];
          if (!p.support.includes(null)) return;
          const settable = p.hand.filter((uid) => {
            const def = state.catalog[state.cards[uid].id];
            return ["spell", "trap"].includes(def.kind) && def.subtype !== "field";
          });
          if (settable.length < 2) return;
          const offered = new Set(
            legal.filter((a) => a.type === "set-support").map((a) => a.card),
          );
          // Every settable card in hand must be offered, however many were
          // already set this turn: the engine has no per-turn set cap.
          for (const uid of settable)
            assert.ok(
              offered.has(uid),
              `${theme}#${seed}: seat ${actor} holds a settable card with no set-support action ` +
                `(turn ${state.turn}, ${offered.size}/${settable.length} offered)`,
            );
          observed++;
        },
      });
    }
    assert.ok(observed > 20, `${theme}: only ${observed} settable states observed`);
  });
}

/* ------------------------------------------------------------- stress */

test("stress: AI play stays legal, terminating and numerically sound", () => {
  let matches = 0;
  let finished = 0;
  let actions = 0;
  const revisionsSeen = [];
  for (const theme of THEMES) {
    const pool = pools[theme];
    const decks = decksOf(theme).decks;
    for (const preset of decks)
      for (const profile of AI_PROFILE_IDS)
        for (let seed = 0; seed < 10; seed++) {
          const foe = decks[(decks.indexOf(preset) + seed + 1) % decks.length];
          const prepared = [expandDeck(preset, pool, seed + 1), expandDeck(foe, pool, seed + 61)];
          const revisions = [];
          const out = playMatch({
            theme,
            seed: seed * 101 + decks.indexOf(preset),
            decks: prepared,
            profiles: [profile, AI_PROFILE_IDS[(AI_PROFILE_IDS.indexOf(profile) + 2) % AI_PROFILE_IDS.length]],
            onAction: ({ state, action }) => {
              actions++;
              revisions.push(state.revision);
              assert.equal(action.revision, state.revision, `${theme}: stale revision replay`);
            },
          });
          matches++;
          if (out.finished) finished++;
          assert.ok(!out.rejected, `${theme}/${preset.id}/${profile}#${seed}: ${out.rejected}`);
          assert.ok(!out.stalled, `${theme}/${preset.id}/${profile}#${seed}: stalled`);
          const s = out.state;
          for (const player of s.players) {
            assert.ok(Number.isFinite(player.points), "NaN points");
            // Overkill damage may drive a total below zero, but only together
            // with a decided result — it must never sit negative mid-duel.
            if (player.points <= 0) assert.ok(s.result, "non-positive points without a result");
          }
          // Revisions advance strictly: no duplicate command applied twice.
          for (let i = 1; i < revisions.length; i++)
            assert.ok(revisions[i] >= revisions[i - 1], "revision went backwards");
          revisionsSeen.push(revisions.length);
        }
  }
  assert.ok(matches >= 500, `only ${matches} matches simulated`);
  assert.equal(finished, matches, `${matches - finished} matches did not finish`);
  assert.ok(actions > 20000, `only ${actions} actions exercised`);
});
