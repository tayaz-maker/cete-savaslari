import assert from "node:assert/strict";
import test from "node:test";
import { EVENT_DEFINITIONS, getChoiceEffectSummary } from "../public/games/tc-sim/js/events.js?v=5";

const allChoices = EVENT_DEFINITIONS.flatMap((event) => event.choices);

test("event seçimlerinin tamamı kısa görünür etki özeti üretir", () => {
  assert.ok(allChoices.length > 0);
  for (const choice of allChoices) {
    const summary = getChoiceEffectSummary(choice);
    assert.ok(summary.length > 0, `özet yok: ${choice.label}`);
    assert.ok(!/(flag|openCase|memory|eventId|npc_|personId)/i.test(summary), `iç state sızdı: ${summary}`);
  }
});

test("deterministik sayısal etkiler gerçek choice effects değerlerini gösterir", () => {
  const invitation = EVENT_DEFINITIONS.find((event) => event.id === "social_invitation");
  assert.match(getChoiceEffectSummary(invitation.choices[0]), /₺250 öde/);
  assert.match(getChoiceEffectSummary(invitation.choices[0]), /Enerji −5/);
  assert.match(getChoiceEffectSummary(invitation.choices[0]), /Güven \+3/);
});

test("yalnızca bağlam değiştiren veya boş etkiler spoiler üretmez", () => {
  assert.equal(getChoiceEffectSummary({ effects: {} }), "Sonucu belirsiz");
  assert.equal(getChoiceEffectSummary({ effects: { flags: { hiddenFuture: true } } }), "Bağlam değişir");
});
