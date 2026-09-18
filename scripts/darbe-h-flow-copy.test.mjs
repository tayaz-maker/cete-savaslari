import test from "node:test";
import assert from "node:assert/strict";
import { eventStory, moveStory } from "../public/games/duel-core/flow-copy.js";
import { flowWords, themeMeta } from "../public/games/duel-core/theme-meta.js";

const ctx = (theme, lang) => ({
  lang,
  point: themeMeta(theme).point,
  you: lang === "en" ? "You" : "Sen",
  foe: lang === "en" ? "Opponent" : "Rakip",
  mine: true,
  name: "X",
  words: flowWords(theme, lang),
});

// The match rail is shared, but two of its nouns belong to the theme. It used to
// print VETO-H!'s "Atılan Kartlar" and the shared "adak" for every sibling, so a
// DARBE-H! match narrated its own Arşiv as a campaign discard pile and its paraf
// as a religious offering.
test("the match rail uses each theme's own words for the grave and the tribute", () => {
  const darbeTr = ctx("darbe-h", "tr");
  const graveTr = moveStory({ event: "move", to: "grave", reason: "tribute" }, darbeTr);
  assert.match(graveTr.head, /Arşiv’e gönderdin/);
  assert.doesNotMatch(graveTr.head, /Atılan Kartlar/);
  assert.match(graveTr.why, /paraf/);
  assert.doesNotMatch(graveTr.why, /adak/);
  assert.match(eventStory({ event: "tribute" }, darbeTr), /paraf olarak verildi/);

  const darbeEn = ctx("darbe-h", "en");
  const graveEn = moveStory({ event: "move", to: "grave", reason: "tribute" }, darbeEn);
  assert.match(graveEn.head, /sent to the archive/);
  assert.doesNotMatch(graveEn.head, /graveyard/);
  assert.match(eventStory({ event: "tribute" }, darbeEn), /a countersignature/);
});

test("VETO-H! and GETT-OH! rail text is unchanged", () => {
  for (const theme of ["veto-h", "gett-oh"]) {
    const tr = ctx(theme, "tr");
    const move = moveStory({ event: "move", to: "grave", reason: "tribute" }, tr);
    assert.equal(move.head, "Sen “X” kartını Atılan Kartlar’a gönderdin.");
    assert.equal(move.why, "Sebep: adak olarak verildi.");
    assert.equal(eventStory({ event: "tribute" }, tr), "“X” adak olarak verildi.");

    const en = ctx(theme, "en");
    const moveEn = moveStory({ event: "move", to: "grave", reason: "tribute" }, en);
    assert.equal(moveEn.head, "You sent to the graveyard “X”.");
    assert.equal(moveEn.why, "Reason: given as a tribute.");
    assert.equal(eventStory({ event: "tribute" }, en), "“X” was given as a tribute.");
  }
});

test("a caller that supplies no theme words still gets the historical wording", () => {
  const bare = { lang: "tr", you: "Sen", foe: "Rakip", mine: true, name: "X" };
  const move = moveStory({ event: "move", to: "grave", reason: "tribute" }, bare);
  assert.equal(move.head, "Sen “X” kartını Atılan Kartlar’a gönderdin.");
  assert.equal(move.why, "Sebep: adak olarak verildi.");
});

test("every sibling theme declares both rail words in both languages", () => {
  for (const theme of ["veto-h", "gett-oh", "darbe-h"]) {
    for (const lang of ["tr", "en"]) {
      const words = flowWords(theme, lang);
      assert.ok(words.graveTo && typeof words.graveTo === "string", `${theme}/${lang} graveTo`);
      assert.ok(words.tribute && typeof words.tribute === "string", `${theme}/${lang} tribute`);
    }
  }
});
