import test from "node:test";
import assert from "node:assert/strict";
import { hydrateDevlet, tickDevlet, applyPolicy, implementationRate } from "../public/games/next-wave/devlet-sim.js";
import { POLICIES } from "../public/games/next-wave/devlet-data.js";
import { policyMetadata, previewPolicy } from "../public/games/next-wave/devlet-depth.js";

const finite = (n) => Number.isFinite(n);
const rawInstitutionHealth = (s) =>
  s.institutions.reduce((a, i) => a + i.capacity + i.professionalism - i.fatigue, 0) / (2 * s.institutions.length);

// A period transition pushes a raw catalog row into state.institutions — istikhbarat
// arrives in 2002 with no fatigue/budget/leadership/alignment/trust/memory and no
// cadre. For that turn institution health was NaN, which implementationAverage
// clamps to 0 while feeding crisis resilience and the bureaucracy group, and the
// missing cadre left every intelligence policy on the flat cadreFit fallback for
// the remaining 28 years of the campaign.
test("an institution added by a period transition is fully live from its first turn", () => {
  const s = hydrateDevlet("1923", { seed: 23, campaign: true });
  const pool = POLICIES["1923"];
  let transitions = 0;
  for (let turn = 0; turn < 1300 && !s.flags.campaignEnd; turn++) {
    const before = s.institutions.length;
    if (turn % 6 === 0) applyPolicy(s, pool[turn % pool.length].id);
    tickDevlet(s);
    if (s.institutions.length !== before) transitions++;
    for (const inst of s.institutions) {
      assert.ok(finite(inst.fatigue), `${inst.id} has no fatigue at turn ${s.time.turn}`);
      assert.ok(finite(inst.budget), `${inst.id} has no budget at turn ${s.time.turn}`);
      assert.ok(finite(inst.leadership) && finite(inst.alignment) && finite(inst.trust), `${inst.id} unnormalised`);
      assert.ok(Array.isArray(inst.memory), `${inst.id} has no memory array`);
      assert.ok(typeof inst.role === "string", `${inst.id} has no role`);
      assert.ok(
        s.devletDepth.cadres.some((c) => c.institution === inst.id),
        `${inst.id} has no cadre at turn ${s.time.turn}`,
      );
    }
    assert.ok(finite(rawInstitutionHealth(s)), `institution health went non-finite at turn ${s.time.turn}`);
    assert.ok(implementationRate(s) >= 0, "implementation rate must never go negative");
  }
  assert.ok(transitions > 0, "the grand campaign must actually cross a period boundary");
  assert.ok(s.institutions.some((i) => i.id === "istikhbarat"), "the later era adds istikhbarat");
});

test("intelligence policies are delivered by a real cadre, not the bare fallback", () => {
  const s = hydrateDevlet("2002", { seed: 7, campaign: true });
  for (let i = 0; i < 24; i++) tickDevlet(s);
  const intelligence = POLICIES["2002"].filter((p) => policyMetadata(p).institution === "istikhbarat");
  assert.ok(intelligence.length >= 1, "at least one policy maps to the intelligence institution");
  const cadre = s.devletDepth.cadres.find((c) => c.institution === "istikhbarat");
  assert.ok(cadre, "the intelligence institution owns a cadre");
  assert.ok(finite(cadre.competence) && finite(cadre.professionalism) && finite(cadre.expertise));
  for (const p of intelligence) {
    const preview = previewPolicy(s, p);
    assert.equal(preview.institution, "istikhbarat");
    assert.ok(preview.rate > 8, `${p.id} is stuck on the cadre-less floor`);
  }
});

test("adding an institution does not disturb the cadre roster of the others", () => {
  const s = hydrateDevlet("2002", { seed: 3, campaign: true });
  for (let i = 0; i < 12; i++) tickDevlet(s);
  const cadres = s.devletDepth.cadres;
  assert.equal(new Set(cadres.map((c) => c.institution)).size, cadres.length, "one cadre per institution");
  assert.ok(cadres.length <= 12, "the cadre roster stays bounded");
  for (const inst of s.institutions)
    assert.equal(cadres.filter((c) => c.institution === inst.id).length, 1, `${inst.id} must own exactly one cadre`);
});
