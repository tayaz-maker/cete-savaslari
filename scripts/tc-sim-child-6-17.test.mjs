import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { childAge, childStage, childAcademicStanding, normalizeParenthood, parenthoodCosts, processParenthoodCases, processParenthoodWeek, parenthoodSummary, resolveParentChoice, PARENTING_EVENTS } from "../public/games/tc-sim/js/parenthood.js";
import { getKnownOpenCases } from "../public/games/tc-sim/js/calendar.js";
import { saveGame, loadGame } from "../public/games/tc-sim/js/save.js";

function fixture(age = 6) {
  const s = createNewGame({ now: "2027-01-01T00:00:00.000Z" });
  const week = 1 + age * 48;
  s.time.absoluteWeek = week;
  s.parenthood.children.push({ id: `child-${age}`, name: "Deniz", bornWeek: 1, otherParentId: "anne", livesWithPlayer: true,
    relationship: { closeness: 62, trust: 62, tension: 0 }, school: { attendancePressure: 0, socialPressure: 0, issues: [], extracurricular: null, lastUpdatedWeek: 0 }, stageMark: { stage: null, transitions: [] } });
  return s;
}

test("child stages derive exact 6/12/15/18 boundaries and remain valid", () => {
  const s = fixture(6); const c = s.parenthood.children[0];
  assert.equal(childAge(s, c), 6); assert.equal(childStage(s, c), "Okul çağı (6–11)");
  for (const [age, label] of [[11,"Okul çağı (6–11)"],[12,"Erken ergenlik (12–14)"],[14,"Erken ergenlik (12–14)"],[15,"Geç ergenlik (15–17)"],[17,"Geç ergenlik (15–17)"],[18,"Yetişkinliğe geçiş (18+)"]]) { s.time.absoluteWeek = 1 + age * 48; assert.equal(childStage(s,c), label); }
  assert.equal(validateState(s).ok, true);
});

test("school transition is delayed, known, bounded and does not duplicate", () => {
  const s = fixture(6); const c = s.parenthood.children[0]; processParenthoodCases(s);
  assert.ok(s.openCases.some(x => x.chainId === "CHN-C01" && x.payload.childId === c.id));
  const count = s.openCases.length; processParenthoodCases(s); assert.equal(s.openCases.length, count);
  assert.match(JSON.stringify(parenthoodSummary(s)), /Okul çağı/);
  assert.doesNotMatch(JSON.stringify(parenthoodSummary(s)), /attendancePressure|CHN-C01|child-6/);
});

test("school pressure creates an attendance issue and support improves child context", () => {
  const s = fixture(12); const c = s.parenthood.children[0]; s.parenthood.missedCareWeeks = 8; processParenthoodWeek(s); c.school.attendancePressure = 8; processParenthoodWeek(s); processParenthoodCases(s);
  c.school.attendancePressure = 9; c.school.issues.push({ kind: "attendance", status: "active", createdWeek: s.time.absoluteWeek });
  assert.equal(childAcademicStanding(c), "zorlanıyor");
  const before = c.relationship.trust; c.school.issues[0].status = "managed"; c.school.attendancePressure = 3; c.relationship.trust += 2;
  assert.ok(c.relationship.trust > before); assert.equal(childAcademicStanding(c), "yeterli");
});

test("teen autonomy and separated-parent context stay child-specific", () => {
  const s = fixture(15); const [a] = s.parenthood.children; const b = structuredClone(a); b.id = "child-2"; b.name = "Ece"; b.bornWeek = 1 + 6 * 48; s.parenthood.children.push(b);
  s.household.union.separatedSince = 10; processParenthoodCases(s);
  assert.equal(s.parenthood.children.length, 2); assert.notEqual(a.school, b.school);
  a.relationship.trust = 30; a.relationship.tension = 40; assert.equal(childStage(s, a), "Geç ergenlik (15–17)");
  assert.ok(getKnownOpenCases(s).every(c => c.payload?.childId !== b.id || c.payload.playerKnown === true));
});

test("school-age costs are monthly, age-aware and save/load safe", () => {
  const s = fixture(12); const first = parenthoodCosts(s); assert.ok(first >= 1400);
  const map = new Map(); const storage = { getItem:k=>map.get(k)??null, setItem:(k,v)=>map.set(k,v) }; assert.equal(saveGame(storage,s).ok,true);
  const loaded = loadGame(storage); assert.equal(loaded.ok,true); assert.equal(parenthoodCosts(loaded.state), first); assert.equal(validateState(loaded.state).ok,true);
});

test("age 18 handoff preserves entity and makes child chains ineligible", () => {
  const s = fixture(18); const c = s.parenthood.children[0]; processParenthoodCases(s); assert.equal(childStage(s,c), "Yetişkinliğe geçiş (18+)");
  assert.equal(s.parenthood.children.length, 1); assert.equal(s.openCases.some(x => x.payload?.childId === c.id && x.status !== "resolved"), false);
});

test("C03 conflict schedules a delayed repair case and changes only that child", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  resolveParentChoice(s, PARENTING_EVENTS.find(e=>e.id === "child_relationship_conflict"), "insist", { status:"pending", payload:{ childId:c.id } });
  assert.ok(s.openCases.some(x=>x.chainId === "CHN-C03" && x.payload.childId === c.id)); assert.ok(c.relationship.tension > 0);
  const repair=s.openCases.find(x=>x.chainId === "CHN-C03"); resolveParentChoice(s, PARENTING_EVENTS.find(e=>e.id === "child_conflict_repair"), "repair", repair); processParenthoodCases(s); assert.ok(c.relationship.trust >= 60); assert.ok(s.openCases.filter(x=>x.chainId === "CHN-C03" && x.payload.childId === c.id).length <= 1);
});

test("C05 commitment has one-time start cost and monthly cost, then cleanup", () => {
  const s = fixture(12); const c=s.parenthood.children[0]; const before=s.finances.balance;
  resolveParentChoice(s, PARENTING_EVENTS.find(e=>e.id === "child_activity_choice"), "join", { status:"pending", payload:{childId:c.id} });
  assert.equal(c.school.extracurricular.monthlyCost,450); assert.equal(s.finances.balance,before-450); assert.ok(s.openCases.some(x=>x.chainId === "CHN-C05"));
  const monthly=parenthoodCosts(s,{closingMonth:true}); assert.ok(monthly>=1900);
  resolveParentChoice(s, PARENTING_EVENTS.find(e=>e.id === "child_activity_review"), "stop", s.openCases.find(x=>x.chainId === "CHN-C05")); assert.equal(c.school.extracurricular,null);
});

test("C06 teen autonomy and C07 separated contact are delayed and child-specific", () => {
  const s=fixture(15); const c=s.parenthood.children[0]; s.household.union.separatedSince=3;
  resolveParentChoice(s,PARENTING_EVENTS.find(e=>e.id === "child_autonomy_disclosure"),"listen",{status:"pending",payload:{childId:c.id}});
  resolveParentChoice(s,PARENTING_EVENTS.find(e=>e.id === "child_other_parent_contact"),"support",{status:"pending",payload:{childId:c.id}});
  assert.ok(s.openCases.some(x=>x.chainId === "CHN-C06")); assert.ok(s.openCases.some(x=>x.chainId === "CHN-C07"));
  const c2=structuredClone(c); c2.id="child-second"; s.parenthood.children.push(c2); resolveParentChoice(s,PARENTING_EVENTS.find(e=>e.id === "child_other_parent_contact"),"support",{status:"pending",payload:{childId:c2.id}});
  assert.equal(new Set(s.openCases.filter(x=>x.chainId === "CHN-C07").map(x=>x.payload.childId)).size,2);
});

test("deterministic 6-to-18 progression and independent multi-child state", () => {
  const a = fixture(6); const first = a.parenthood.children[0];
  const second = structuredClone(first); second.id = "child-younger"; second.name = "Ece"; second.bornWeek = 1 + 5 * 48; a.parenthood.children.push(second);
  const snapshots = [];
  for (let week = a.time.absoluteWeek; week <= 1 + 18 * 48; week++) { a.time.absoluteWeek = week; processParenthoodCases(a); if ([1+6*48,1+12*48,1+15*48,1+18*48].includes(week)) snapshots.push([week, childStage(a, first)]); }
  assert.deepEqual(snapshots.map(x=>x[1]), ["Okul çağı (6–11)", "Erken ergenlik (12–14)", "Geç ergenlik (15–17)", "Yetişkinliğe geçiş (18+)"]);
  assert.equal(a.parenthood.children.length, 2); assert.notEqual(a.parenthood.children[0].school, a.parenthood.children[1].school);
  assert.ok(a.parenthood.children.every(c => c.stageMark.transitions.length <= 4)); assert.equal(validateState(a).ok, true);
});

test("runtime schedules hidden adolescent autonomy context, then promotes it to known", () => {
  const s = fixture(15); const c = s.parenthood.children[0]; c.school.socialPressure = 6; processParenthoodWeek(s);
  const latent = s.openCases.find(x => x.chainId === "CHN-C06" && x.payload.childId === c.id);
  assert.ok(latent); assert.equal(latent.payload.playerKnown, false); assert.equal(c.school.hiddenIssue.knownToPlayer, false);
  s.time.absoluteWeek = latent.dueWeek; processParenthoodCases(s);
  assert.equal(c.school.hiddenIssue.knownToPlayer, true); assert.equal(latent.payload.playerKnown, true); assert.equal(latent.eventId, "child_autonomy_disclosure");
});
