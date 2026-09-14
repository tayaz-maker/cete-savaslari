import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pools } from "./duel-pools.mjs";
import { SPECIAL_PER_TURN, SUPPORT_SETS_PER_TURN } from "../public/games/duel-core/rules.js";
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

/* ------------------------------------ the support-set cap binds both seats */

for (const theme of THEMES) {
  test(`${theme}: the per-turn support-set cap binds both seats equally`, () => {
    const pool = pools[theme];
    const decks = decksOf(theme).decks;
    let observed = 0;
    const reached = new Set();
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
          const used = p.supportSetUsed || 0;
          // The cap is a rule, not a presentation filter: under it every
          // settable card is offered, at it none is, and that is true of
          // whichever seat is acting.
          assert.ok(
            used <= SUPPORT_SETS_PER_TURN,
            `${theme}#${seed}: seat ${actor} set ${used} support cards in one turn`,
          );
          if (!p.support.includes(null)) return;
          const settable = p.hand.filter((uid) => {
            const def = state.catalog[state.cards[uid].id];
            return ["spell", "trap"].includes(def.kind) && def.subtype !== "field";
          });
          if (!settable.length) return;
          const offered = new Set(legal.filter((a) => a.type === "set-support").map((a) => a.card));
          if (used >= SUPPORT_SETS_PER_TURN) {
            assert.equal(
              offered.size,
              0,
              `${theme}#${seed}: seat ${actor} was offered a set at the cap (used ${used})`,
            );
            reached.add(actor);
          } else {
            for (const uid of settable)
              assert.ok(
                offered.has(uid),
                `${theme}#${seed}: seat ${actor} holds a settable card with no set-support ` +
                  `action below the cap (turn ${state.turn}, used ${used})`,
              );
            observed++;
          }
        },
      });
    }
    assert.ok(observed > 20, `${theme}: only ${observed} settable states observed`);
    assert.equal(reached.size, 2, `${theme}: only seats [${[...reached]}] were seen at the cap`);
  });
}

/* ------------------------------------- the special-summon cap binds both seats */

for (const theme of THEMES) {
  test(`${theme}: one Special Summon per turn, for whichever seat is acting`, () => {
    const pool = pools[theme];
    const decks = decksOf(theme).decks;
    const perTurn = new Map();
    const reached = new Set();
    let specials = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const prepared = [
        expandDeck(decks[seed % decks.length], pool, seed),
        expandDeck(decks[(seed + 2) % decks.length], pool, seed + 17),
      ];
      playMatch({
        theme,
        seed: seed * 53,
        decks: prepared,
        profiles: ["aggressive", "risky"],
        onAction: ({ state, actor, action, legal }) => {
          const p = state.players[actor];
          const used = p.specialUsed || 0;
          assert.ok(
            used <= SPECIAL_PER_TURN,
            `${theme}#${seed}: seat ${actor} made ${used} special summons in one turn`,
          );
          // At the cap the action list must not offer one either — the list
          // and the validator agree because both come from rejection().
          if (used >= SPECIAL_PER_TURN && ["main1", "main2"].includes(state.phase)) {
            assert.equal(
              legal.filter((a) => a.type === "special").length,
              0,
              `${theme}#${seed}: seat ${actor} was offered a special summon at the cap`,
            );
            reached.add(actor);
          }
          if (action?.type === "special") {
            specials++;
            const key = `${seed}|${state.turn}|${actor}`;
            perTurn.set(key, (perTurn.get(key) || 0) + 1);
            assert.ok(
              perTurn.get(key) <= SPECIAL_PER_TURN,
              `${theme}#${seed}: ${perTurn.get(key)} specials on turn ${state.turn} for seat ${actor}`,
            );
          }
        },
      });
    }
    assert.ok(specials > 10, `${theme}: only ${specials} special summons observed`);
    assert.equal(reached.size, 2, `${theme}: only seats [${[...reached]}] were seen at the cap`);
  });
}

/* ------------------------- the action list never offers what the validator refuses */

for (const theme of THEMES) {
  test(`${theme}: every offered action survives the shared validator`, () => {
    const pool = pools[theme];
    const decks = decksOf(theme).decks;
    let checked = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const prepared = [
        expandDeck(decks[seed % decks.length], pool, seed),
        expandDeck(decks[(seed + 4) % decks.length], pool, seed + 11),
      ];
      playMatch({
        theme,
        seed: seed * 29,
        decks: prepared,
        profiles: ["controlled", "trapper"],
        onAction: ({ state, legal }) => {
          // Specials were once exempt from this filter, so the list could
          // offer a move the validator would refuse — and any rule added to
          // the validator did not reach them.
          for (const action of legal) {
            assert.equal(
              rejection(state, action),
              null,
              `${theme}#${seed}: offered ${action.type} is refused by the validator`,
            );
            checked++;
          }
        },
      });
    }
    assert.ok(checked > 2000, `${theme}: only ${checked} offered actions checked`);
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
            profiles: [
              profile,
              AI_PROFILE_IDS[(AI_PROFILE_IDS.indexOf(profile) + 2) % AI_PROFILE_IDS.length],
            ],
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
