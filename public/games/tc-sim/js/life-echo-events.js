/**
 * Hayat → TC SIM değer aktarımı ("life echo").
 *
 * Hayat'ın kendi Uzun Gölge alt sistemi taşınmadı. Değerli olan fikir —
 * bugünkü kararın yıllar sonra bağlamlı biçimde geri dönmesi — TC SIM'in
 * hâlihazırdaki openCase + NPC hafızası + gecikmeli olay mimarisine
 * yazıldı. Ayrı ekran, ayrı menü, ayrı `shadows[]` dizisi yok.
 *
 * Buradaki her zincir, TC SIM'de gerçekten karşılığı olmayan bir durumdur:
 * kardeş yükümlülüğü (motorda siblingDuty katsayısı vardı, kişi yoktu),
 * eski kefalet (repoda hiç geçmiyordu), oyuncunun kendi sessizliğini
 * bozması (mevcut olay yalnız karşı taraf arayınca tetikleniyordu),
 * işyerinde temsil, ve başka şehir teklifi.
 */
import { addMemory, addNpcMemory, adjustHealth, transact } from "./state.js?v=9";
import {
  applyRelationshipDelta,
  markMeaningfulContact,
  scheduleSocialFollowup,
} from "./social.js?v=9";
import { materializeCast } from "./network.js?v=9";

export const SIBLING_ID = "kardes";

const getPerson = (state, id) => (state.people || []).find((person) => person.id === id) || null;
const hasSibling = (state) => Boolean(getPerson(state, SIBLING_ID));
const week = (state) => state.time.absoluteWeek;
/** Aile tipi katsayısı; eski kayıtlarda alan yoksa nötr 1 kabul edilir. */
const siblingDuty = (state) => state.flags.familyMods?.siblingDuty ?? 1;

/** Bu zincire ait, çözülmemiş bir openCase var mı. */
const chainOpen = (state, chainId) =>
  (state.openCases || []).some((item) => item.payload?.lifeEchoChain === chainId && item.status !== "resolved");

/** Zincir daha önce sonuna kadar işlemiş mi (tekrar çiftlemesini önler). */
const chainDone = (state, chainId) => Boolean(state.flags.lifeEchoDone?.[chainId]);

const markChainDone = (state, chainId) => {
  state.flags.lifeEchoDone = { ...(state.flags.lifeEchoDone || {}), [chainId]: week(state) };
};

/**
 * Gecikmeli dönüş. Hayat'ın "3–5 mevsim sonra" sayıları doğrudan taşınmadı;
 * her zincir kendi doğal ölçeğine göre haftaya çevrildi (bkz. handoff §22).
 */
function echoFollowup(state, { chainId, eventId, dueWeeks, personId = null, ...payload }) {
  return scheduleSocialFollowup(state, {
    id: `life-echo-${chainId}-${week(state)}`,
    eventId,
    dueWeek: week(state) + dueWeeks,
    // Kişisi olmayan zincirlerde açıkça null: `undefined` JSON turunda anahtarı
    // tamamen düşürür ve kaydedilmiş dosya ile canlı dosya eşitliğini bozar.
    personId: personId ?? null,
    lifeEchoChain: chainId,
    ...payload,
  });
}

/**
 * Kardeşi olmayan eski kayıtlara kişiyi ekler. Aile tiplerinin householdSize
 * ve siblingDuty değerleri zaten bir kardeşi varsayıyordu; burada yapılan,
 * o kişiyi modellemek — hayata yeni biri doğurmak değil. Kayıt sürümü
 * yükseltilmez: kişi mevcut şemayla, mevcut materializeCast ile üretilir.
 */
export function ensureLifeEchoState(state) {
  if (!state || !Array.isArray(state.people) || !state.time) return false;
  if (hasSibling(state)) return false;
  const person = materializeCast(
    {
      id: SIBLING_ID, name: "Deniz", age: 23, gender: "woman",
      occupation: "Çağrı merkezi görevlisi", education: "lise", income: "low",
      hood: "Bağcılar", rel: "single", family: "sibling",
      traits: ["inatçı", "esprili", "gururlu"], lifestyle: ["vardiya", "telefon"],
      ambition: "kendi düzenini kurmak", stress: 52, reliability: 62, generosity: 66,
      style: "senli benli", sector: "cagri", relationType: "Kardeş", roleId: "family",
      tags: ["family"], trust: 66, romance: false,
      favors: ["emergency", "childcare"], edges: ["anne", "baba"],
    },
    // Geçmişe dönük temas cezası doğmasın diye son görüşme "şimdi" sayılır.
    week(state),
  );
  state.people.push(person);
  if (!(SIBLING_ID in state.relationships)) state.relationships[SIBLING_ID] = 58;
  return true;
}

export const LIFE_ECHO_EVENTS = [
  {
    // Hayat: care-sibling ("Kardeşin işi tutmadı"). TC SIM'de kardeş rolü yoktu.
    id: "le_sibling_crisis",
    en: {"title": "Your sibling is out of work", "text": "Deniz called. The call centre shut down; rent will not come together this month. Her voice is close enough to ask, too proud to.", "choices": {"host": "Open your door", "send_money": "Send money", "refuse": "Say you can't this time"}},
    lifeEcho: true,
    repeat: "cooldown",
    cooldownWeeks: 72,
    title: "Kardeşinin işi bitti",
    text: "Deniz aradı. Çağrı merkezi kapanmış; kira bu ay dönmüyor. Sesi, isteyecek kadar yakın ama isteyemeyecek kadar gururlu.",
    condition: (state) =>
      hasSibling(state) &&
      week(state) >= 56 &&
      !chainOpen(state, "sibling_crisis") &&
      !chainDone(state, "sibling_crisis") &&
      state.finances.balance >= 500,
    choices: [
      {
        id: "host",
        label: "Odanı aç",
        effects: {
          health: { energy: -6, stress: 8 },
          social: { kardes: { closeness: 10, trust: 8, tension: 2 } },
          npcMemory: { personId: SIBLING_ID, text: "Kapısını açtı.", type: "sibling_crisis_hosted" },
          memory: "Kardeşini bir süreliğine evine aldın.",
          importance: "important",
        },
      },
      {
        id: "send_money",
        label: "Para gönder",
        effects: {
          money: -3000,
          reason: "Kardeşe destek",
          health: { stress: 4 },
          social: { kardes: { closeness: 5, trust: 6 } },
          npcMemory: { personId: SIBLING_ID, text: "Para gönderdi.", type: "sibling_crisis_funded" },
          memory: "Kardeşine ₺3.000 gönderdin.",
        },
      },
      {
        id: "refuse",
        label: "Bu kez yapamayacağını söyle",
        effects: {
          health: { stress: 6 },
          social: { kardes: { closeness: -8, trust: -6, tension: 10 } },
          npcMemory: { personId: SIBLING_ID, text: "Bu kez yardım etmedi.", type: "sibling_crisis_refused" },
          memory: "Kardeşine bu kez hayır dedin.",
          importance: "important",
        },
      },
    ],
  },
  {
    // Hayat: old-debt ("Eski kefalet — İsim unutulmamış"). Repoda kefalet yoktu.
    id: "le_old_guarantee",
    en: {"title": "An old guarantee", "text": "Years ago you signed your name under someone's paper; it was a favour. The borrower never paid. The name was not forgotten, and the file is looking at you.", "choices": {"pay": "Close it, be done", "negotiate": "Put it on instalments", "refuse": "Refuse the signature"}},
    lifeEcho: true,
    repeat: "once",
    title: "Eski kefalet",
    text: "Yıllar önce bir kâğıdın altına isim atmıştın; hatır işiydi. Borçlu ödememiş. İsim unutulmamış, dosya sana bakıyor.",
    condition: (state) =>
      week(state) >= 72 &&
      state.player.age >= 26 &&
      !chainOpen(state, "old_guarantee") &&
      !chainDone(state, "old_guarantee"),
    choices: [
      {
        id: "pay",
        label: "Kapat, bitsin",
        effects: {
          money: -7500,
          reason: "Eski kefalet kapatıldı",
          health: { stress: -4 },
          memory: "Eski kefaleti ödeyip dosyayı kapattın.",
          importance: "important",
        },
      },
      {
        id: "negotiate",
        label: "Taksite bağla",
        effects: {
          money: -1500,
          reason: "Kefalet ilk taksiti",
          health: { stress: 8 },
          memory: "Eski kefaleti taksite bağladın.",
        },
      },
      {
        id: "refuse",
        label: "İmzayı tanıma",
        effects: {
          health: { stress: 12 },
          memory: "Eski kefaleti tanımadın; dosya avukata gitti.",
          importance: "important",
        },
      },
    ],
  },
  {
    // Hayat: regret-call ("Aranmayan numara"). Mevcut former_contact_reconnect
    // yalnız karşı taraf yazınca tetikleniyor; bu, sessizliği oyuncunun bozması.
    id: "le_regret_call",
    en: {"title": "The number you never called", "text": "You stop while scrolling the contacts. You did not fall out; you just never called, they never called, and the years piled up in between.", "choices": {"call": "Call", "text": "Write and leave it", "let_go": "Close the contacts"}},
    lifeEcho: true,
    repeat: "cooldown",
    cooldownWeeks: 60,
    title: "Aranmayan numara",
    text: "Rehberi kaydırırken duruyorsun. Küs değilsiniz; sadece sen aramadın, o da aramadı ve arada yıllar birikti.",
    condition: (state) =>
      week(state) >= 88 &&
      !chainOpen(state, "regret_call") &&
      !chainDone(state, "regret_call") &&
      (state.people || []).some(
        (person) =>
          person.roleId !== "family" &&
          person.available !== false &&
          (state.relationships[person.id] || 0) >= 30 &&
          week(state) - (person.social?.lastMeaningfulContactWeek ?? week(state)) >= 60,
      ),
    choices: [
      {
        id: "call",
        label: "Ara",
        effects: {
          health: { energy: -3, stress: -3 },
          memory: "Yıllar sonra eski bir numarayı aradın.",
          importance: "important",
        },
      },
      {
        id: "text",
        label: "Yazıp bırak",
        effects: { health: { stress: -1 }, memory: "Eski bir numaraya kısa bir mesaj bıraktın." },
      },
      {
        id: "let_go",
        label: "Rehberi kapat",
        effects: { health: { stress: 3 }, memory: "Aramayı bir kez daha erteledin." },
      },
    ],
  },
  {
    // Hayat: union-talk ("Temsilci / sessiz kal"). TC SIM'de işyeri temsili yoktu.
    id: "le_workplace_voice",
    en: {"title": "Someone has to speak", "text": "The shift list changed again with no notice. Everyone grumbles, nobody signs. For a while now the eyes have been on you.", "choices": {"speak": "Put your name forward", "quiet_organize": "Gather it quietly", "stay_quiet": "Keep quiet, do your job"}},
    lifeEcho: true,
    repeat: "cooldown",
    cooldownWeeks: 80,
    title: "Konuşan biri lazım",
    text: "Vardiya listesi yine haber verilmeden değişti. Herkes söyleniyor, kimse imza atmıyor. Gözler bir süredir sende.",
    condition: (state) =>
      Boolean(state.career.jobId) &&
      state.career.weeksInRole >= 24 &&
      state.health.stress >= 45 &&
      // İlk yıl (48 hafta) kalibre edilmiş taban akıştır; zincirler onun dışında başlar.
      week(state) >= 60 &&
      !chainOpen(state, "workplace_voice") &&
      !chainDone(state, "workplace_voice"),
    choices: [
      {
        id: "speak",
        label: "Adını ortaya koy",
        effects: {
          health: { stress: 10, energy: -4 },
          memory: "İşyerinde grubun adına konuşan sen oldun.",
          importance: "important",
        },
      },
      {
        id: "quiet_organize",
        label: "Sessizce topla",
        effects: { health: { stress: 5, energy: -3 }, memory: "İtirazı imzasız bir dilekçeye taşıdın." },
      },
      {
        id: "stay_quiet",
        label: "Sus, işine bak",
        effects: { health: { stress: 4 }, memory: "Bu kez sen de susmayı seçtin." },
      },
    ],
  },
  {
    // Hayat: second-city / city-return. TC SIM'in konut sistemi şehir içi;
    // şehir değiştirmenin ağ ve aile bedeli yoktu. Yeni şehir sistemi kurulmadı:
    // bu bir fırsat olayı ve sonucudur.
    id: "le_second_city",
    en: {"title": "A job in another city", "text": "The offer is plain: same work, better money, another city. Your family is here, your contacts are here. Nobody there knows you — which is also the good part.", "choices": {"go": "Go", "negotiate": "Try to run it from here", "stay": "Stay"}},
    lifeEcho: true,
    repeat: "once",
    title: "Başka şehirde iş",
    text: "Teklif net: aynı iş, daha iyi para, başka şehir. Ailen burada, tanıdıkların burada. Orada seni kimse tanımıyor — iyi tarafı da bu.",
    condition: (state) =>
      Boolean(state.career.jobId) &&
      week(state) >= 96 &&
      // Teklif ya iyi performansa ya da uzun kıdeme gelir; ikisi de yoksa gelmez.
      (state.career.performance >= 40 || state.career.weeksInRole >= 52) &&
      !chainOpen(state, "second_city") &&
      !chainDone(state, "second_city"),
    choices: [
      {
        id: "go",
        label: "Git",
        effects: {
          money: 12000,
          reason: "Şehir değişikliği ödemesi",
          health: { stress: 12, energy: -6 },
          memory: "İş için şehir değiştirdin.",
          importance: "important",
        },
      },
      {
        id: "negotiate",
        label: "Buradan yürütmeyi dene",
        effects: { health: { stress: 6 }, memory: "Şehir değiştirmeden yürütmeyi önerdin." },
      },
      {
        id: "stay",
        label: "Kal",
        effects: {
          health: { stress: -2 },
          memory: "Teklifi geri çevirip burada kaldın.",
          importance: "important",
        },
      },
    ],
  },
];

/**
 * Gecikmeli dönüşler. `condition: () => false` — organik havuzda hiç aranmazlar;
 * yalnız processDueOpenCases vadesi gelen openCase'i kuyruğa aldığında açılırlar.
 */
export const LIFE_ECHO_CALLBACK_EVENTS = [
  {
    id: "le_sibling_crisis_return",
    en: {"title": "Word from your sibling", "text": "That stretch of Deniz's life is behind her. How it closed depends on what you did that day.", "choices": {"acknowledge": "Talk", "brief": "Keep it short"}},
    lifeEcho: true,
    repeat: "repeatable",
    title: "Kardeşinden haber",
    text: "Deniz'in o dönemi geride kaldı. Nasıl kapandığı, o gün ne yaptığına göre değişiyor.",
    condition: () => false,
    choices: [
      { id: "acknowledge", label: "Konuş", effects: { health: { stress: -2 } } },
      { id: "brief", label: "Kısa kes", effects: { health: { stress: 1 } } },
    ],
  },
  {
    id: "le_old_guarantee_return",
    en: {"title": "The guarantee, continued", "text": "The file moved. What your signature was worth that day is in front of you today.", "choices": {"settle": "Do what is required", "delay": "Hold it off a while longer"}},
    lifeEcho: true,
    repeat: "repeatable",
    title: "Kefaletin devamı",
    text: "Dosya hareket etti. O gün attığın imzanın karşılığı bugün önüne geliyor.",
    condition: () => false,
    choices: [
      { id: "settle", label: "Gereğini yap", effects: {} },
      { id: "delay", label: "Bir süre daha beklet", effects: { health: { stress: 6 } } },
    ],
  },
  {
    id: "le_regret_call_return",
    en: {"title": "What that call was worth", "text": "Time has passed. Whether you opened the contacts that day decides who is calling, or not calling, today.", "choices": {"meet": "Meet", "pass": "Pass this time"}},
    lifeEcho: true,
    repeat: "repeatable",
    title: "O aramanın karşılığı",
    text: "Aradan zaman geçti. O gün rehberi açıp açmadığın, bugün kimin arayıp aramadığını belirliyor.",
    condition: () => false,
    choices: [
      { id: "meet", label: "Görüş", effects: { health: { energy: -3, stress: -3 } } },
      { id: "pass", label: "Bu sefer geç", effects: { health: { stress: 2 } } },
    ],
  },
  {
    id: "le_workplace_voice_return",
    en: {"title": "The price of speaking", "text": "Something shifted at work after that shift argument. Which way depends on whether you opened your mouth that day.", "choices": {"accept": "Accept it", "push": "Push further"}},
    lifeEcho: true,
    repeat: "repeatable",
    title: "Konuşmanın faturası",
    text: "O vardiya tartışmasının ardından işyerinde bir şey değişti. Yönü, o gün ağzını açıp açmadığına bağlı.",
    condition: () => false,
    choices: [
      { id: "accept", label: "Kabul et", effects: {} },
      { id: "push", label: "Üstüne git", effects: { health: { stress: 6 } } },
    ],
  },
  {
    id: "le_second_city_return",
    en: {"title": "After the city decision", "text": "Enough time has passed; the real cost and the real return of that decision are visible now.", "choices": {"settle": "Settle in", "reconsider": "Think again"}},
    lifeEcho: true,
    repeat: "repeatable",
    title: "Şehir kararının ardından",
    text: "Aradan yeterince zaman geçti; o kararın gerçek bedeli ve karşılığı şimdi görünüyor.",
    condition: () => false,
    choices: [
      { id: "settle", label: "Düzenini kur", effects: { health: { stress: -3 } } },
      { id: "reconsider", label: "Yeniden düşün", effects: { health: { stress: 4 } } },
    ],
  },
];

/** Zincirlerin durum etkisi ve gecikmeli dönüş kaydı. */
export function applyLifeEchoResolution(state, definition, choiceId, sourceCase = null) {
  const id = definition?.id;
  if (!id || !definition.lifeEcho) return null;

  if (id === "le_sibling_crisis") {
    markMeaningfulContact(state, SIBLING_ID);
    // Aile tipi yükümlülüğü ne kadar yüksekse dönüş o kadar erken gelir.
    const duty = siblingDuty(state);
    echoFollowup(state, {
      chainId: "sibling_crisis",
      eventId: "le_sibling_crisis_return",
      dueWeeks: choiceId === "refuse" ? 40 - duty * 4 : 24 - duty * 4,
      personId: SIBLING_ID,
      outcome: choiceId,
    });
    if (choiceId === "host") state.flags.siblingHosted = week(state);
  }

  if (id === "le_old_guarantee") {
    echoFollowup(state, {
      chainId: "old_guarantee",
      eventId: "le_old_guarantee_return",
      dueWeeks: choiceId === "pay" ? 36 : choiceId === "negotiate" ? 24 : 20,
      outcome: choiceId,
    });
  }

  if (id === "le_regret_call") {
    const target = (state.people || []).find(
      (person) =>
        person.roleId !== "family" &&
        person.available !== false &&
        (state.relationships[person.id] || 0) >= 30 &&
        week(state) - (person.social?.lastMeaningfulContactWeek ?? week(state)) >= 60,
    );
    if (target) {
      if (choiceId === "call") {
        markMeaningfulContact(state, target.id);
        applyRelationshipDelta(state, target.id, { closeness: 6, trust: 4, tension: -2 });
        addNpcMemory(state, target.id, "Yıllar sonra aradı.", "regret_call_made");
      } else if (choiceId === "text") {
        applyRelationshipDelta(state, target.id, { closeness: 2, trust: 1 });
        addNpcMemory(state, target.id, "Yıllar sonra kısa bir mesaj yazdı.", "regret_call_texted");
      } else {
        addNpcMemory(state, target.id, "Arayabilecekken aramadı.", "regret_call_skipped");
      }
      // Pişmanlık en uzun gecikmeli zincirdir (Hayat'ta regret/second-chance gecikmesi en yüksekti).
      echoFollowup(state, {
        chainId: "regret_call",
        eventId: "le_regret_call_return",
        dueWeeks: choiceId === "let_go" ? 72 : 56,
        personId: target.id,
        outcome: choiceId,
      });
    }
  }

  if (id === "le_workplace_voice") {
    if (choiceId === "speak") state.flags.workplaceVoice = "named";
    else if (choiceId === "quiet_organize") state.flags.workplaceVoice = "anonymous";
    else state.flags.workplaceVoice = "silent";
    echoFollowup(state, {
      chainId: "workplace_voice",
      eventId: "le_workplace_voice_return",
      dueWeeks: choiceId === "speak" ? 14 : choiceId === "quiet_organize" ? 20 : 26,
      outcome: choiceId,
    });
  }

  if (id === "le_second_city") {
    if (choiceId === "go") {
      state.flags.secondCity = week(state);
      // Şehir değiştirmenin gerçek bedeli: buradaki zayıf bağlar seyrekleşir,
      // aile mesafesi açılır. Yeni sistem değil, mevcut alanların kullanımı.
      for (const person of state.people || []) {
        if (person.roleId === "family") {
          applyRelationshipDelta(state, person.id, { closeness: -4, tension: 2 });
        } else if (person.contactCategory === "weak" && person.available !== false) {
          person.dormant = true;
        }
      }
      addMemory(state, "Şehir değiştirdin; buradaki bağların çoğu seyrekleşti.", "important");
    }
    echoFollowup(state, {
      chainId: "second_city",
      eventId: "le_second_city_return",
      dueWeeks: choiceId === "go" ? 40 : 30,
      outcome: choiceId,
    });
  }

  // Dönüş halkaları: sonucu, zinciri açan seçime göre uygula ve zinciri kapat.
  if (id === "le_sibling_crisis_return") {
    const outcome = sourceCase?.payload?.outcome;
    if (outcome === "host") {
      transact(state, 2200, "Kardeşin katkısı", "social");
      applyRelationshipDelta(state, SIBLING_ID, { closeness: 8, trust: 10, tension: -4 });
      addNpcMemory(state, SIBLING_ID, "Kapını açtığın dönemi unutmadı.", "sibling_repaid");
      addMemory(state, "Deniz işe girdi; kaldığı dönemin karşılığını bıraktı.", "important");
    } else if (outcome === "send_money") {
      transact(state, 1800, "Kardeşin geri ödemesi", "social");
      applyRelationshipDelta(state, SIBLING_ID, { closeness: 3, trust: 5 });
      addMemory(state, "Deniz gönderdiğin paranın bir kısmını geri verdi.", "normal");
    } else {
      applyRelationshipDelta(state, SIBLING_ID, { closeness: -4, trust: -3, tension: 6 });
      addNpcMemory(state, SIBLING_ID, "O dönem yalnız kaldığını hatırlıyor.", "sibling_resentment");
      addMemory(state, "Deniz o dönemi kendi başına atlattı; arada bir mesafe kaldı.", "important");
    }
    markChainDone(state, "sibling_crisis");
  }

  if (id === "le_old_guarantee_return") {
    const outcome = sourceCase?.payload?.outcome;
    if (outcome === "pay") {
      adjustHealth(state, { stress: -6 });
      addMemory(state, "Kapattığın kefalet dosyası temiz döndü.", "normal");
    } else if (outcome === "negotiate") {
      transact(state, -1500, "Kefalet taksiti", "debt");
      addMemory(state, "Kefalet taksitleri sürüyor.", "normal");
    } else {
      transact(state, -4000, "Kefalet icra kesintisi", "debt");
      adjustHealth(state, { stress: 10 });
      addMemory(state, "Tanımadığın imza icraya döndü; kesinti yapıldı.", "important");
    }
    markChainDone(state, "old_guarantee");
  }

  if (id === "le_regret_call_return") {
    const personId = sourceCase?.payload?.personId;
    const outcome = sourceCase?.payload?.outcome;
    if (personId && getPerson(state, personId)) {
      if (outcome === "call") {
        applyRelationshipDelta(state, personId, { closeness: 8, trust: 6 });
        markMeaningfulContact(state, personId);
        addMemory(state, "Yıllar sonra açtığın hat kapanmadı.", "important");
      } else if (outcome === "text") {
        applyRelationshipDelta(state, personId, { closeness: 2, trust: 2 });
        addMemory(state, "O mesaj karşılıksız kalmadı ama eskisi gibi de olmadı.", "normal");
      } else {
        const person = getPerson(state, personId);
        if (person) person.dormant = true;
        addMemory(state, "Aramadığın numara sessizce defterden düştü.", "important");
      }
    }
    markChainDone(state, "regret_call");
  }

  if (id === "le_workplace_voice_return") {
    const outcome = sourceCase?.payload?.outcome;
    if (outcome === "speak") {
      state.career.performance = Math.max(0, Math.min(100, state.career.performance - 4));
      transact(state, 900, "Vardiya farkı ödemesi", "career");
      addMemory(state, "Vardiya düzeni düzeldi; adın da yönetimin defterine geçti.", "important");
    } else if (outcome === "quiet_organize") {
      transact(state, 500, "Vardiya farkı ödemesi", "career");
      addMemory(state, "İmzasız dilekçe kısmen işe yaradı.", "normal");
    } else {
      adjustHealth(state, { stress: 6 });
      addMemory(state, "Vardiya düzeni aynı kaldı; susmanın da bir bedeli oldu.", "normal");
    }
    markChainDone(state, "workplace_voice");
  }

  if (id === "le_second_city_return") {
    const outcome = sourceCase?.payload?.outcome;
    if (outcome === "go") {
      transact(state, 4000, "Yeni şehirde düzen", "career");
      adjustHealth(state, { stress: -4 });
      addMemory(state, "Yeni şehirde düzen oturdu; buradaki bazı isimler geri gelmedi.", "important");
    } else if (outcome === "negotiate") {
      addMemory(state, "Uzaktan yürütme düzeni kısmen kabul edildi.", "normal");
    } else {
      adjustHealth(state, { stress: 2 });
      addMemory(state, "Kalma kararının karşılığı: yakınlık durdu, kariyer yavaşladı.", "normal");
    }
    markChainDone(state, "second_city");
  }

  return null;
}

/** Test/QA yardımcıları. */
export const LIFE_ECHO_CHAINS = [
  "sibling_crisis",
  "old_guarantee",
  "regret_call",
  "workplace_voice",
  "second_city",
];
