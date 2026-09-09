/**
 * Hayat → TC SIM değer aktarımının davranış testleri.
 *
 * Kapsam (handoff §55, §56, §53, §28):
 *  - her taşınan zincir gerçekten tetiklenebilir (ölü içerik yok),
 *  - gecikmeli dönüş tam bir kez ateşlenir ve durumu doğru değiştirir,
 *  - kaydet/yükle turu zinciri bozmaz, çift ateşleme üretmez,
 *  - tekrar eden "çiftlik" (farming) döngüsü yok,
 *  - kardeşi olmayan eski kayıtlar kişiyi kazanır, kayıt sürümü artmaz.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, SAVE_VERSION, validateState } from "../public/games/tc-sim/js/state.js?v=9";
import {
  EVENT_DEFINITIONS,
  enqueueEvent,
  activateNextEvent,
  resolveEvent,
  processDueOpenCases,
  getEventDefinition,
} from "../public/games/tc-sim/js/events.js?v=9";
import {
  LIFE_ECHO_EVENTS,
  LIFE_ECHO_CALLBACK_EVENTS,
  LIFE_ECHO_CHAINS,
  SIBLING_ID,
  ensureLifeEchoState,
} from "../public/games/tc-sim/js/life-echo-events.js?v=9";
import { FAMILY_TYPES, NETWORK_CAST } from "../public/games/tc-sim/js/network.js?v=9";
import { advanceWeek } from "../public/games/tc-sim/js/time.js?v=9";

const newGame = (options = {}) =>
  createNewGame({ name: "Test", seed: 12345, familyType: "nuclear", networkMode: "normal", ...options });

/** Bir olayı doğrudan kuyruğa alıp verilen seçimle çözer. */
function playEvent(state, eventId, choiceId) {
  state.events.active = null;
  state.events.queue = [];
  assert.ok(enqueueEvent(state, eventId), `${eventId} kuyruğa alınamadı`);
  const active = activateNextEvent(state);
  assert.equal(active.eventId, eventId, `${eventId} aktive edilemedi`);
  const result = resolveEvent(state, choiceId);
  assert.ok(result.ok, `${eventId}/${choiceId} çözülemedi: ${result.message}`);
  return result;
}

/**
 * Vadesi gelene kadar haftayı ilerletip zincirin dönüş halkasını yakalar ve
 * aktive eder; dönen olay resolveEvent ile çözülmeye hazırdır.
 */
function runToCallback(state, expectedEventId, maxWeeks = 200) {
  for (let i = 0; i < maxWeeks; i += 1) {
    state.time.absoluteWeek += 1;
    state.events.active = null;
    state.events.queue = [];
    processDueOpenCases(state);
    const queued = state.events.queue.find((item) => item.eventId === expectedEventId);
    if (!queued) continue;
    // Yalnız beklenen halkayı bırak; aynı hafta sıraya giren başka olay
    // testin sırasını kaydırmasın.
    state.events.queue = [queued];
    const active = activateNextEvent(state);
    assert.equal(active?.eventId, expectedEventId, "dönüş halkası aktive edilemedi");
    return active;
  }
  return null;
}

test("taşınan her zincir kayıtlı ve benzersiz", () => {
  assert.equal(LIFE_ECHO_EVENTS.length, 5);
  assert.equal(LIFE_ECHO_CALLBACK_EVENTS.length, 5);
  const ids = EVENT_DEFINITIONS.map((event) => event.id);
  assert.equal(ids.length, new Set(ids).size, "olay kimlikleri benzersiz olmalı");
  for (const event of [...LIFE_ECHO_EVENTS, ...LIFE_ECHO_CALLBACK_EVENTS]) {
    assert.ok(getEventDefinition(event.id), `${event.id} EVENT_DEFINITIONS içinde yok`);
    assert.ok(event.title && event.text, `${event.id} başlık/metin eksik`);
    assert.ok(event.choices.length >= 2, `${event.id} en az iki seçenek taşımalı`);
  }
  // Dönüş halkaları organik havuzda aranmamalı; yalnız openCase ile açılır.
  for (const event of LIFE_ECHO_CALLBACK_EVENTS) {
    assert.equal(event.condition(newGame()), false, `${event.id} organik havuza sızıyor`);
  }
});

test("kardeş her aile tipinde ve her çevre modunda var", () => {
  assert.ok(NETWORK_CAST.some((row) => row.id === SIBLING_ID), "kardeş kadroda yok");
  for (const family of Object.keys(FAMILY_TYPES)) {
    for (const mode of ["tight", "normal", "wide"]) {
      const state = newGame({ familyType: family, networkMode: mode });
      assert.ok(
        state.people.some((person) => person.id === SIBLING_ID),
        `${family}/${mode} kardeşsiz başladı`,
      );
      assert.ok(validateState(state).ok, `${family}/${mode} durumu geçersiz`);
    }
  }
});

test("aile tipinin siblingDuty katsayısı artık motora taşınıyor", () => {
  // Alan FAMILY_TYPES içinde tanımlıydı ama hiçbir yere aktarılmıyordu.
  for (const [id, def] of Object.entries(FAMILY_TYPES)) {
    const state = newGame({ familyType: id });
    assert.equal(state.flags.familyMods.siblingDuty, def.siblingDuty, `${id} siblingDuty taşınmadı`);
  }
});

test("kardeş krizi: her seçim ulaşılabilir ve gecikmeli dönüş bir kez gelir", () => {
  for (const choice of ["host", "send_money", "refuse"]) {
    const state = newGame();
    state.time.absoluteWeek = 60;
    assert.ok(
      getEventDefinition("le_sibling_crisis").condition(state),
      `${choice}: olay tetiklenebilir olmalı`,
    );
    const balanceBefore = state.finances.balance;
    playEvent(state, "le_sibling_crisis", choice);

    if (choice === "send_money") {
      assert.equal(state.finances.balance, balanceBefore - 3000, "para gönderimi işlenmedi");
    }
    const opened = state.openCases.filter((item) => item.payload?.lifeEchoChain === "sibling_crisis");
    assert.equal(opened.length, 1, `${choice}: tam bir openCase açılmalı`);
    assert.equal(opened[0].payload.outcome, choice);

    const queued = runToCallback(state, "le_sibling_crisis_return");
    assert.ok(queued, `${choice}: dönüş halkası hiç gelmedi`);
    const balanceAtReturn = state.finances.balance;
    resolveEvent(state, "acknowledge");

    if (choice === "host") {
      assert.equal(state.finances.balance, balanceAtReturn + 2200, "ev açma karşılığı işlenmedi");
    } else if (choice === "refuse") {
      assert.ok(
        state.people.find((p) => p.id === SIBLING_ID).memories.some((m) => m.type === "sibling_resentment"),
        "reddin hafıza izi yok",
      );
    }
    // Zincir kapandı: aynı dönüş bir daha kuyruğa girmemeli.
    assert.equal(state.flags.lifeEchoDone.sibling_crisis > 0, true);
    const again = runToCallback(state, "le_sibling_crisis_return", 60);
    assert.equal(again, null, `${choice}: dönüş halkası ikinci kez ateşlendi`);
  }
});

test("eski kefalet: reddin gecikmeli bedeli gerçekten kesiliyor", () => {
  const state = newGame();
  state.time.absoluteWeek = 80;
  state.player.age = 27;
  assert.ok(getEventDefinition("le_old_guarantee").condition(state));
  playEvent(state, "le_old_guarantee", "refuse");
  const queued = runToCallback(state, "le_old_guarantee_return");
  assert.ok(queued, "kefalet dönüşü gelmedi");
  const before = state.finances.balance;
  resolveEvent(state, "settle");
  assert.equal(state.finances.balance, before - 4000, "icra kesintisi uygulanmadı");
  assert.ok(state.flags.lifeEchoDone.old_guarantee);
});

test("pişmanlık araması: uzun sessizlik gerektirir, arama hafızaya yazılır", () => {
  const state = newGame();
  state.time.absoluteWeek = 100;
  // Kimse uzun süredir sessiz değilken tetiklenmemeli.
  for (const person of state.people) person.social.lastMeaningfulContactWeek = 99;
  assert.equal(getEventDefinition("le_regret_call").condition(state), false);

  const target = state.people.find((p) => p.roleId !== "family");
  target.social.lastMeaningfulContactWeek = 10;
  state.relationships[target.id] = 45;
  assert.ok(getEventDefinition("le_regret_call").condition(state), "uzun sessizlikte tetiklenmeli");

  playEvent(state, "le_regret_call", "call");
  assert.ok(
    target.memories.some((m) => m.type === "regret_call_made"),
    "arama NPC hafızasına yazılmadı",
  );
  const queued = runToCallback(state, "le_regret_call_return");
  assert.ok(queued, "pişmanlık dönüşü gelmedi");
  resolveEvent(state, "meet");
  assert.ok(state.flags.lifeEchoDone.regret_call);
});

test("işyerinde temsil: iş şartına bağlı ve sonucu kariyere dokunuyor", () => {
  const idle = newGame();
  idle.time.absoluteWeek = 60;
  idle.career.jobId = null;
  assert.equal(getEventDefinition("le_workplace_voice").condition(idle), false, "işsizken tetiklenmemeli");

  const state = newGame();
  state.time.absoluteWeek = 60;
  state.career.jobId = state.career.jobId || "market_kasiyer";
  state.career.weeksInRole = 30;
  state.health.stress = 55;
  assert.ok(getEventDefinition("le_workplace_voice").condition(state));
  playEvent(state, "le_workplace_voice", "speak");
  assert.equal(state.flags.workplaceVoice, "named");
  const performanceBefore = state.career.performance;
  const queued = runToCallback(state, "le_workplace_voice_return");
  assert.ok(queued, "temsil dönüşü gelmedi");
  resolveEvent(state, "accept");
  assert.ok(state.career.performance <= performanceBefore, "konuşmanın kariyer bedeli yok");
  assert.ok(state.flags.lifeEchoDone.workplace_voice);
});

test("başka şehir: gitmek ağın zayıf bağlarını gerçekten seyreltir", () => {
  const state = newGame({ networkMode: "wide" });
  state.time.absoluteWeek = 110;
  state.career.jobId = state.career.jobId || "market_kasiyer";
  state.career.performance = 60;
  const weakBefore = state.people.filter((p) => p.contactCategory === "weak" && !p.dormant).length;
  assert.ok(weakBefore > 0, "test için zayıf bağ gerekli");
  assert.ok(getEventDefinition("le_second_city").condition(state));
  playEvent(state, "le_second_city", "go");
  const weakAfter = state.people.filter((p) => p.contactCategory === "weak" && !p.dormant).length;
  assert.ok(weakAfter < weakBefore, "şehir değişiminin ağ bedeli yok");
  const queued = runToCallback(state, "le_second_city_return");
  assert.ok(queued, "şehir dönüşü gelmedi");
  resolveEvent(state, "settle");
  assert.ok(state.flags.lifeEchoDone.second_city);
});

test("zincirler tekrar çiftliğine dönüşmüyor", () => {
  const state = newGame();
  state.time.absoluteWeek = 60;
  playEvent(state, "le_sibling_crisis", "send_money");
  // Zincir açıkken aynı olay yeniden tetiklenemez.
  assert.equal(getEventDefinition("le_sibling_crisis").condition(state), false, "açık zincir yeniden tetiklendi");
  const queued = runToCallback(state, "le_sibling_crisis_return");
  assert.ok(queued);
  resolveEvent(state, "acknowledge");
  // Zincir kapandıktan sonra da bir daha açılmaz.
  state.events.cooldowns.le_sibling_crisis = 0;
  assert.equal(getEventDefinition("le_sibling_crisis").condition(state), false, "kapanan zincir yeniden açıldı");
});

test("kaydet/yükle turu zinciri ve vadesini bozmuyor", () => {
  const state = newGame();
  state.time.absoluteWeek = 60;
  playEvent(state, "le_sibling_crisis", "host");
  const roundTrip = JSON.parse(JSON.stringify(state));
  assert.ok(validateState(roundTrip).ok, "tur sonrası durum geçersiz");
  const live = runToCallback(state, "le_sibling_crisis_return");
  const reloaded = runToCallback(roundTrip, "le_sibling_crisis_return");
  assert.ok(live && reloaded, "iki tarafta da dönüş gelmeli");
  assert.equal(live.eventId, reloaded.eventId);
  assert.equal(state.time.absoluteWeek, roundTrip.time.absoluteWeek, "vade haftası kaymış");
});

test("kardeşsiz eski kayıt kişiyi kazanır, kayıt sürümü artmaz", () => {
  const legacy = newGame();
  legacy.time.absoluteWeek = 40;
  // Kardeşin hiç modellenmediği eski bir kaydı taklit et.
  legacy.people = legacy.people.filter((person) => person.id !== SIBLING_ID);
  delete legacy.relationships[SIBLING_ID];
  assert.equal(legacy.people.some((p) => p.id === SIBLING_ID), false);

  assert.equal(ensureLifeEchoState(legacy), true, "kardeş eklenmedi");
  assert.equal(ensureLifeEchoState(legacy), false, "ikinci çağrı kişiyi çiftlemeli değil");
  assert.equal(legacy.people.filter((p) => p.id === SIBLING_ID).length, 1);
  assert.equal(legacy.meta.saveVersion, SAVE_VERSION, "kayıt sürümü değişmemeli");
  assert.ok(validateState(legacy).ok, `eski kayıt geçersizleşti: ${validateState(legacy).errors.join(";")}`);
  // Son temas geçmişte kalıp anında ceza doğurmamalı.
  const sibling = legacy.people.find((p) => p.id === SIBLING_ID);
  assert.equal(sibling.social.lastMeaningfulContactWeek, 40);
});

test("zincir listesi ile kayıtlı olaylar örtüşüyor", () => {
  assert.deepEqual(
    [...LIFE_ECHO_CHAINS].sort(),
    ["old_guarantee", "regret_call", "second_city", "sibling_crisis", "workplace_voice"],
  );
});

test("taşınan içeriğin tamamı TR/EN taşır ve TR kanonik kalır", () => {
  for (const event of [...LIFE_ECHO_EVENTS, ...LIFE_ECHO_CALLBACK_EVENTS]) {
    assert.ok(event.en?.title?.trim(), `${event.id}: EN başlık yok`);
    assert.ok(event.en?.text?.trim(), `${event.id}: EN metin yok`);
    assert.notEqual(event.en.title, event.title, `${event.id}: EN başlık TR ile aynı`);
    for (const choice of event.choices) {
      const label = event.en.choices?.[choice.id];
      assert.ok(label?.trim(), `${event.id}/${choice.id}: EN seçenek etiketi yok`);
      // Ham kimlik sızmamalı (handoff §58).
      assert.doesNotMatch(label, /^le_|_return$/, `${event.id}/${choice.id}: ham kimlik sızdı`);
    }
    // TR kanonik metin bozulmamış olmalı.
    assert.ok(event.title.trim() && event.text.trim(), `${event.id}: TR metin eksik`);
  }
});

test("uzun simülasyon: 10 yıl boyunca kararlı, taşınan içerik havuzu ele geçirmiyor", () => {
  for (const profile of [
    { familyType: "nuclear", networkMode: "tight" },
    { familyType: "extended", networkMode: "wide" },
    { familyType: "single", networkMode: "normal" },
  ]) {
    const state = newGame(profile);
    const label = `${profile.familyType}/${profile.networkMode}`;
    let resolved = 0;
    let lifeEchoResolved = 0;

    for (let i = 0; i < 520; i += 1) {
      if (state.events.active) {
        const definition = getEventDefinition(state.events.active.eventId);
        const choice = definition.choices[i % definition.choices.length];
        const before = state.events.active.occurrenceId;
        const outcome = resolveEvent(state, choice.id);
        if (outcome.ok) {
          resolved += 1;
          if (definition.lifeEcho) lifeEchoResolved += 1;
        }
        assert.notEqual(state.events.active?.occurrenceId, before, `${label}: olay takıldı`);
      }
      advanceWeek(state);
      assert.ok(Number.isFinite(state.finances.balance), `${label}: bakiye NaN`);
      assert.ok(Number.isFinite(state.health.stress), `${label}: stres NaN`);
    }

    assert.ok(state.time.absoluteWeek > 400, `${label}: zaman ilerlemedi`);
    assert.ok(validateState(state).ok, `${label}: uzun koşu sonunda durum geçersiz`);
    // openCases sınırsız büyümemeli.
    assert.ok(state.openCases.length < 400, `${label}: openCases şişti (${state.openCases.length})`);
    // Vadesi geçmiş ama hiç ateşlenmemiş zincir kalmamalı.
    const stuck = state.openCases.filter(
      (item) => item.payload?.lifeEchoChain && item.status === "pending" && item.dueWeek < state.time.absoluteWeek - 8,
    );
    assert.equal(stuck.length, 0, `${label}: takılı life-echo dosyası var`);
    // Taşınan içerik havuzu ele geçirmemeli...
    assert.ok(resolved > 0, `${label}: hiç olay çözülmedi`);
    assert.ok(
      lifeEchoResolved / resolved <= 0.25,
      `${label}: taşınan içerik olay havuzunu ele geçirdi (${lifeEchoResolved}/${resolved})`,
    );
    // ...ama ölü de olmamalı: on yıllık koşuda beş zincirin tamamı organik
    // olarak açılıp kapanmalı (handoff §55: ölü içerik yok).
    const closed = Object.keys(state.flags.lifeEchoDone || {}).sort();
    assert.deepEqual(
      closed,
      ["old_guarantee", "regret_call", "second_city", "sibling_crisis", "workplace_voice"],
      `${label}: bazı zincirler organik oyunda hiç açılmadı (${closed.join(",") || "hiçbiri"})`,
    );
    // Kayıt sınırlı kalmalı.
    assert.ok(JSON.stringify(state).length < 1_500_000, `${label}: kayıt şişti`);
  }
});
