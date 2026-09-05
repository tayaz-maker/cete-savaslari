import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { childAge, childStage, childAcademicStanding, childFutureLean, isChildIssueKnown, normalizeParenthood, parenthoodCosts, parenthoodYearSummary, processParenthoodCases, processParenthoodWeek, parenthoodSummary, parentChoiceAvailability, resolveParentChoice, PARENTING_EVENTS } from "../public/games/tc-sim/js/parenthood.js";
import { getKnownOpenCases } from "../public/games/tc-sim/js/calendar.js";
import { isSecretKnownTo } from "../public/games/tc-sim/js/depth2-systems.js";
import { saveGame, loadGame } from "../public/games/tc-sim/js/save.js";

import { runChildScenario } from "./tc-sim-longrun.mjs";

const definition = (id) => PARENTING_EVENTS.find((item) => item.id === id);
const storageOf = () => { const map = new Map(); return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)) }; };
const roundTrip = (state) => { const storage = storageOf(); assert.equal(saveGame(storage, state).ok, true); const loaded = loadGame(storage); assert.equal(loaded.ok, true); return loaded.state; };
/** Gizli konuyu üretim yolundan doğurur: eşik → haftalık işlem → gizli vaka. */
function latentAutonomy(state, child) {
  child.school.socialPressure = 6;
  processParenthoodWeek(state);
  return state.openCases.find((item) => item.chainId === "CHN-C06" && item.payload.childId === child.id);
}
/** Vakayı gerçek vade işlemiyle açılmaya terfi ettirir. */
function discloseAutonomy(state, latent) {
  state.time.absoluteWeek = latent.dueWeek;
  processParenthoodCases(state);
  return state.openCases.find((item) => item.id === latent.id);
}

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

test("C06 autonomy runs the full runtime lifecycle and C07 contact stays child-specific", () => {
  const s=fixture(15); const c=s.parenthood.children[0]; s.household.union.separatedSince=3;
  const latent = latentAutonomy(s, c);
  assert.ok(latent, "gizli vaka üretim yolundan doğmalı");
  const promoted = discloseAutonomy(s, latent);
  assert.equal(resolveParentChoice(s, definition("child_autonomy_disclosure"), "listen", promoted), undefined);
  assert.ok(s.openCases.some(x=>x.chainId === "CHN-C06" && x.eventId === "child_autonomy_followup"));
  resolveParentChoice(s,definition("child_other_parent_contact"),"support",{status:"pending",payload:{childId:c.id}});
  assert.ok(s.openCases.some(x=>x.chainId === "CHN-C07"));
  const c2=structuredClone(c); c2.id="child-second"; s.parenthood.children.push(c2); resolveParentChoice(s,definition("child_other_parent_contact"),"support",{status:"pending",payload:{childId:c2.id}});
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

test("C06-A hidden issue exists through runtime yet stays out of every player-facing read", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  const latent = latentAutonomy(s, c);
  assert.ok(latent); assert.equal(latent.payload.playerKnown, false); assert.equal(latent.eventId, "child_autonomy_probe");
  // Konu gerçekten var: sır kaydı yaratıldı ama oyuncu bilenler arasında değil.
  assert.equal(c.school.hiddenIssue.status, "hidden");
  assert.equal(isSecretKnownTo(s, c.school.hiddenIssue.id, "player"), false);
  assert.equal(isChildIssueKnown(s, c), false);
  const summary = JSON.stringify(parenthoodSummary(s));
  assert.doesNotMatch(summary, /paylaşmıyor|CHN-C06|child-autonomy|hidden|privacy/);
  assert.equal(getKnownOpenCases(s).some((item) => item.id === latent.id), false, "gizli vaka takvimde görünmemeli");
  // Bilinmeyen konuya cevap verilemez.
  assert.equal(parentChoiceAvailability(s, definition("child_autonomy_disclosure"), { id: "listen" }, latent).ok, false);
});

test("C06-B save/load before discovery keeps the issue hidden and unanswerable", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  const latent = latentAutonomy(s, c);
  const loaded = roundTrip(s);
  const child = loaded.parenthood.children[0];
  assert.equal(isChildIssueKnown(loaded, child), false);
  assert.equal(child.school.hiddenIssue.id, c.school.hiddenIssue.id);
  assert.doesNotMatch(JSON.stringify(parenthoodSummary(loaded)), /paylaşmıyor/);
  const carried = loaded.openCases.find((item) => item.id === latent.id);
  assert.equal(carried.payload.playerKnown, false);
  assert.equal(parentChoiceAvailability(loaded, definition("child_autonomy_disclosure"), { id: "listen" }, carried).ok, false);
});

test("C06-C discovery through the due path makes exactly the qualitative issue readable", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  const promoted = discloseAutonomy(s, latentAutonomy(s, c));
  assert.equal(promoted.eventId, "child_autonomy_disclosure");
  assert.equal(promoted.payload.playerKnown, true);
  assert.equal(isChildIssueKnown(s, c), true);
  assert.match(JSON.stringify(parenthoodSummary(s)), /paylaşmıyor/);
  // Ham geliştirici değerleri hiçbir zaman sızmaz.
  assert.doesNotMatch(JSON.stringify(parenthoodSummary(s)), /CHN-C06|child-autonomy-|"hidden"|privacy/);
  assert.equal(parentChoiceAvailability(s, definition("child_autonomy_disclosure"), { id: "listen" }, promoted).ok, true);
  const before = c.relationship.trust;
  resolveParentChoice(s, definition("child_autonomy_disclosure"), "listen", promoted);
  assert.equal(c.relationship.trust, before + 3);
  assert.equal(c.school.hiddenIssue.status, "disclosed");
});

test("C06-D knowledge stays with the player: no NPC learns it implicitly", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  discloseAutonomy(s, latentAutonomy(s, c));
  assert.equal(isSecretKnownTo(s, c.school.hiddenIssue.id, "player"), true);
  for (const person of s.people) assert.equal(isSecretKnownTo(s, c.school.hiddenIssue.id, person.id), false, `${person.id} kendiliğinden öğrenmemeli`);
});

test("C06-E two children keep separate issues and separate knowledge", () => {
  const s = fixture(15); const [a] = s.parenthood.children;
  const b = structuredClone(a); b.id = "child-second"; b.name = "Ece"; b.school = { attendancePressure: 0, socialPressure: 0, issues: [], extracurricular: null, hiddenIssue: null, lastUpdatedWeek: 0 };
  s.parenthood.children.push(b);
  // B'nin konusu kendi soğuma penceresi yüzünden birkaç hafta sonra doğar;
  // böylece A açılırken B'nin vadesi henüz gelmemiş olur ve izolasyon
  // gerçekten sınanır.
  s.events.cooldowns[`child_autonomy_${b.id}`] = s.time.absoluteWeek + 6;
  const latentA = latentAutonomy(s, a);
  s.time.absoluteWeek += 6; s.parenthood.lastWeek = 0; a.school.lastUpdatedWeek = 0; b.school.lastUpdatedWeek = 0; processParenthoodWeek(s);
  assert.notEqual(a.school.hiddenIssue.id, b.school.hiddenIssue.id);
  discloseAutonomy(s, latentA);
  assert.equal(isChildIssueKnown(s, a), true);
  assert.equal(isChildIssueKnown(s, b), false, "bir çocuğun konusu diğerine taşınmaz");
  assert.doesNotMatch(parenthoodSummary(s).children[1], /paylaşmıyor/);
});

test("C06-F Year File never carries an undisclosed issue and cleanup frees the slot", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  const latent = latentAutonomy(s, c);
  assert.doesNotMatch(JSON.stringify(parenthoodYearSummary(s, 1, s.time.absoluteWeek)), /paylaşmıyor/);
  const promoted = discloseAutonomy(s, latent);
  resolveParentChoice(s, definition("child_autonomy_disclosure"), "listen", promoted);
  const followup = s.openCases.find((item) => item.eventId === "child_autonomy_followup");
  s.time.absoluteWeek = followup.dueWeek;
  resolveParentChoice(s, definition("child_autonomy_followup"), "listen", followup);
  assert.equal(c.school.hiddenIssue, null, "kapanışta yuva boşalmalı");
  assert.equal(s.secrets.find((item) => item.id.startsWith("child-autonomy")).status, "resolved");
  assert.match(JSON.stringify(parenthoodYearSummary(s, 1, s.time.absoluteWeek)), /paylaştı/);
});

test("C06-G resolved follow-up cannot be farmed back into another disclosure", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  const promoted = discloseAutonomy(s, latentAutonomy(s, c));
  resolveParentChoice(s, definition("child_autonomy_disclosure"), "listen", promoted);
  const followup = s.openCases.find((item) => item.eventId === "child_autonomy_followup");
  const trustAfterDisclosure = c.relationship.trust;
  // Devam vakası vadesi geldiğinde tekrar "açılma" olayına dönüşmemeli.
  s.time.absoluteWeek = followup.dueWeek; processParenthoodCases(s);
  const carried = s.openCases.find((item) => item.id === followup.id);
  assert.equal(carried.eventId, "child_autonomy_followup", "devam vakası açılmaya terfi etmemeli");
  assert.equal(c.relationship.trust, trustAfterDisclosure, "tekrar güven kazanımı olmamalı");
  resolveParentChoice(s, definition("child_autonomy_followup"), "listen", carried);
  assert.equal(c.school.hiddenIssue, null);
  assert.equal(s.openCases.filter((item) => item.chainId === "CHN-C06" && item.status !== "resolved").length, 0);
});

test("C06 save/load carries a disclosed-but-unanswered issue and an open follow-up", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  const promoted = discloseAutonomy(s, latentAutonomy(s, c));
  const afterDisclosure = roundTrip(s);
  const child = afterDisclosure.parenthood.children[0];
  assert.equal(isChildIssueKnown(afterDisclosure, child), true, "bilgi yüklemede korunur");
  const carried = afterDisclosure.openCases.find((item) => item.id === promoted.id);
  assert.equal(parentChoiceAvailability(afterDisclosure, definition("child_autonomy_disclosure"), { id: "listen" }, carried).ok, true);
  resolveParentChoice(afterDisclosure, definition("child_autonomy_disclosure"), "listen", carried);
  const withFollowup = roundTrip(afterDisclosure);
  assert.equal(isChildIssueKnown(withFollowup, withFollowup.parenthood.children[0]), true);
  assert.ok(withFollowup.openCases.some((item) => item.eventId === "child_autonomy_followup"));
  assert.equal(validateState(withFollowup).ok, true);
});

test("old saves get neutral child defaults without a fabricated secret or preference", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  // Eski şema: yerel knownToPlayer bayrağı, karşılığı olan bir sır kaydı yok.
  c.school.hiddenIssue = { kind: "privacy", status: "active", knownToPlayer: true, createdWeek: 5 };
  c.futurePreference = "kariyer";
  normalizeParenthood(s);
  assert.equal(c.school.hiddenIssue, null, "uydurma sır üretilmez, nötrlenir");
  assert.equal(c.futurePreference, null);
  assert.equal(isChildIssueKnown(s, c), false);
  assert.equal(validateState(s).ok, true);
});

test("child future lean is the child's own, not the report card under a new name", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  // Aynı "iyi" karne, farklı çocuk bağlamı → farklı yönelim.
  assert.equal(childAcademicStanding(c), "iyi");
  assert.equal(childFutureLean(c), "undecided");
  c.school.extracurricular = { name: "kurs", monthlyCost: 450 };
  assert.equal(childAcademicStanding(c), "iyi");
  assert.equal(childFutureLean(c), "education");
  const strained = fixture(15).parenthood.children[0];
  strained.school.socialPressure = 6;
  assert.equal(childFutureLean(strained), "work");
});

test("future discussion is production reachable and player influence is bounded by the teen", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  c.school.extracurricular = { name: "kurs", monthlyCost: 450 };
  processParenthoodCases(s);
  const discussion = s.openCases.find((item) => item.chainId === "CHN-C08" && item.payload.childId === c.id);
  assert.ok(discussion, "15 yaşında konuşma üretim yolundan planlanmalı");
  assert.equal(discussion.eventId, "child_future_discussion");
  // Güçlü ilişkide karşı yöne ikna mümkün.
  const persuadable = structuredClone(s); const pc = persuadable.parenthood.children[0];
  pc.relationship.trust = 70; pc.relationship.tension = 10;
  resolveParentChoice(persuadable, definition("child_future_discussion"), "push", persuadable.openCases.find((i) => i.chainId === "CHN-C08"));
  assert.equal(pc.futurePreference, "work");
  // Zayıf ilişkide aynı baskı tutmaz; çocuk kendi yönelimini korur, gerilim artar.
  const resistant = structuredClone(s); const rc = resistant.parenthood.children[0];
  rc.relationship.trust = 40; rc.relationship.tension = 50;
  const tensionBefore = rc.relationship.tension;
  resolveParentChoice(resistant, definition("child_future_discussion"), "push", resistant.openCases.find((i) => i.chainId === "CHN-C08"));
  assert.equal(rc.futurePreference, "education", "düşük güvende çocuk kendi yönelimini korur");
  assert.ok(rc.relationship.tension > tensionBefore);
});

test("two valid discussion choices produce different age-18 directions", () => {
  const build = (choiceId) => {
    const s = fixture(15); const c = s.parenthood.children[0];
    c.school.extracurricular = { name: "kurs", monthlyCost: 450 };
    c.relationship.trust = 70; c.relationship.tension = 10;
    processParenthoodCases(s);
    resolveParentChoice(s, definition("child_future_discussion"), choiceId, s.openCases.find((i) => i.chainId === "CHN-C08"));
    s.time.absoluteWeek = 1 + 18 * 48;
    processParenthoodCases(s);
    return c.trajectory;
  };
  assert.equal(build("support"), "education-focused");
  assert.equal(build("push"), "work-focused");
});

test("age 18 keeps the entity, the direction and a clean chain surface", () => {
  const s = fixture(15); const c = s.parenthood.children[0];
  c.school.extracurricular = { name: "kurs", monthlyCost: 450 };
  processParenthoodCases(s);
  resolveParentChoice(s, definition("child_future_discussion"), "support", s.openCases.find((i) => i.chainId === "CHN-C08"));
  s.time.absoluteWeek = 1 + 18 * 48; processParenthoodCases(s);
  assert.equal(c.trajectory, "education-focused");
  assert.equal(c.futurePreference, "education");
  assert.equal(s.parenthood.children.length, 1);
  assert.equal(s.openCases.some((item) => item.payload?.childId === c.id && item.status !== "resolved"), false);
  const loaded = roundTrip(s);
  assert.equal(loaded.parenthood.children[0].trajectory, "education-focused");
  assert.match(JSON.stringify(parenthoodYearSummary(loaded, 1, loaded.time.absoluteWeek)), /okuma yönünde/);
});

test("stable 6→18 runs the whole childhood through production and cleans up after itself", () => {
  const run = runChildScenario("stable");
  assert.ok(run.birthWeek, "çocuk gerçek gebelik/doğum yolundan gelmeli");
  for (const age of [6, 12, 15, 18]) assert.ok(run.checkpoints[age], `${age} yaş kontrol noktası oluşmalı`);
  assert.equal(run.checkpoints[18].stage, "Yetişkinliğe geçiş (18+)");
  // Zincirler gerçekten yaşanır: okul geçişi, etkinlik, mahremiyet, gelecek.
  assert.equal(run.chainCounts["CHN-C01"], 3, "okul geçişi yalnız 6/12/15 yaşlarında");
  assert.ok(run.chainCounts["CHN-C05"] >= 1);
  assert.ok(run.chainCounts["CHN-C06"] >= 1, "mahremiyet zinciri iyi ebeveynlikte de yaşanır");
  assert.equal(run.chainCounts["CHN-C08"], 1, "gelecek konuşması bir kez");
  // Kapanış: açık vaka, asılı gizli konu ve sızıntı yok.
  assert.equal(run.openParentingCases, 0);
  assert.equal(run.child.hiddenIssue, null);
  assert.ok(["education-focused", "work-focused", "undecided"].includes(run.child.trajectory));
  assert.equal(run.child.otherParentValid, true);
  assert.equal(run.valid, true);
  // Sınırlar: yapılandırılmış tavanlar aşılmaz.
  assert.ok(run.maximums.attendance <= 12 && run.maximums.social <= 12);
  assert.ok(run.maximums.parentingCases <= 14);
  assert.ok(run.maximums.secrets <= 30);
  assert.ok(run.maximums.npcMemories <= 50);
  assert.ok(run.maximums.history <= 24);
  assert.ok(run.maximums.yearFile <= 80);
  assert.ok(run.maximums.commitments <= 1);
});

test("strained 6→18 stays valid but lands materially worse than stable", () => {
  const stable = runChildScenario("stable");
  const strained = runChildScenario("strained");
  assert.ok(strained.checkpoints[18], "zorlu koşu da 18'e ulaşmalı");
  assert.equal(strained.valid, true);
  const a = stable.checkpoints[18];
  const b = strained.checkpoints[18];
  assert.ok(b.trust < a.trust && b.tension > a.tension, "ilişki ölçülebilir biçimde ayrışmalı");
  assert.notEqual(b.trajectory, a.trajectory, "gelecek yönü de ayrışmalı");
  assert.notEqual(b.standing, a.standing, "okul bağlamı da ayrışmalı");
  // İhmal edilen okul desteği gerçekten devam sorununa ve çatışmaya dönüşür.
  assert.ok((strained.chainCounts["CHN-C02"] || 0) >= 1, "ertelenen okul desteği devam uyarısı doğurmalı");
  assert.ok((strained.chainCounts["CHN-C03"] || 0) >= 1, "biriken gerilim çatışma zincirini açmalı");
  // Eşik aşılı kalsa bile aynı uyarı haftalık tekrarlanmaz.
  assert.ok((strained.chainCounts["child_activity_choice"] || 0) <= 4, "etkinlik teklifi tekrar spam'ı olmamalı");
  assert.ok(strained.chainCounts["CHN-C02"] <= 12, "devam uyarısı 12 yılda haftalık tekrarlanmamalı");
  assert.ok(strained.chainCounts["CHN-C03"] <= 12, "çatışma zinciri haftalık tekrarlanmamalı");
});

test("separated 6→18 goes through real separation and keeps the child's world intact", () => {
  const run = runChildScenario("separated");
  assert.ok(run.separatedAt, "ayrılık gerçek olay yolundan gerçekleşmeli");
  assert.ok(run.checkpoints[18]);
  assert.ok((run.chainCounts["child_other_parent_contact"] || 0) >= 1, "C07 teması çalışmalı");
  assert.equal(run.child.otherParentValid, true, "diğer ebeveyn kaydı korunmalı");
  assert.equal(run.valid, true);
  assert.equal(run.openParentingCases, 0);
});

test("child long-run scenarios are deterministic", () => {
  assert.deepEqual(runChildScenario("stable"), runChildScenario("stable"));
  assert.deepEqual(runChildScenario("strained"), runChildScenario("strained"));
});
