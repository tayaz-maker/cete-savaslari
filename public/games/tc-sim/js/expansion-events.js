import { addMemory, addNpcMemory, transact } from "./state.js?v=9";
import { applyRelationshipDelta, scheduleSocialFollowup } from "./social.js?v=9";
import { canRequestReferral, recordReferral, introducePeople } from "./network.js?v=9";
import { createFavor } from "./depth3-systems.js?v=9";

const weekOk = (state, key, every = 10) =>
  state.time.absoluteWeek >= 12 && (!state.flags[key] || state.time.absoluteWeek - state.flags[key] >= every);

export const EXPANSION_EVENTS = [
  {
    id: "net_referral_offer",
    expansion: true,
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Referans kapısı",
    text: "Tanıdığın, 'ben ararız' demeden önce senin yüzüne bakıyor. Bu iş ilanı değil; isim notu.",
    condition: (state) =>
      (state.people || []).some((p) => !["anne", "baba"].includes(p.id) && (state.relationships[p.id] || 0) >= 42 && (p.social?.trust || 0) >= 40) &&
      weekOk(state, "lastReferralEvent", 12),
    choices: [
      { id: "take", label: "Referansı kullan", effects: { flags: { lastReferralEvent: true }, memory: "Bir tanıdığın iş için ismini verdi." } },
      { id: "wait", label: "Şimdilik alma", effects: { health: { stress: 2 } } },
    ],
  },
  {
    id: "net_intro_chance",
    repeat: "cooldown",
    cooldownWeeks: 14,
    title: "Tanıştırma teklifi",
    text: "Biri, 'seni birine bağlayayım' diyor. Bağlamak iyilik de olur, borç da.",
    condition: (state) => (state.people || []).length > 8 && weekOk(state, "lastIntroEvent", 12),
    choices: [
      { id: "accept", label: "Tanışmayı kabul et", effects: { flags: { lastIntroEvent: true }, memory: "Yeni bir isim deftere düştü." } },
      { id: "decline", label: "Nazikçe geç", effects: { health: { stress: -1 } } },
    ],
  },
  {
    id: "net_npc_job_shift",
    repeat: "cooldown",
    cooldownWeeks: 20,
    title: "Birinin işi kaydı",
    text: "Çevrendeki biri iş değiştiriyor. Haber sana ancak yakınsan geliyor.",
    condition: (state) => (state.people || []).some((p) => p.lifeMilestones?.length) && state.time.absoluteWeek > 16,
    choices: [
      { id: "call", label: "Ara, sor", effects: { health: { energy: -3 }, memory: "Bir tanıdığının iş değişimini konuştun." } },
      { id: "ignore", label: "Geç", effects: {} },
    ],
  },
  {
    id: "fam_marriage_pressure",
    repeat: "cooldown",
    cooldownWeeks: 24,
    title: "Evlenme baskısı",
    text: "Evde cümle kurulmuyor, ima kuruluyor. 'Yaşın geçiyor' diye başlayan her şey aynı kapıya çıkar.",
    condition: (state) =>
      (state.flags.familyMods?.marriagePressure || 0) >= 2 &&
      !state.social?.currentPartnerNpcId &&
      state.player.age >= 22 &&
      state.time.absoluteWeek > 20,
    choices: [
      { id: "deflect", label: "Konuyu savuştur", effects: { health: { stress: 4 }, relationships: { anne: -3 } } },
      { id: "promise", label: "Bir süre sonra konuşuruz de", effects: { health: { stress: 2 }, memory: "Aileye evlilik için zaman istedin." } },
    ],
  },
  {
    id: "fam_elder_care",
    repeat: "cooldown",
    cooldownWeeks: 18,
    title: "Yaşlı bakım sırası",
    text: "Büyükanne ya da dede bu hafta yalnız kalamaz. Sıra sende gibi duruyor; başka kimse de gönüllü çıkmıyor.",
    condition: (state) =>
      (state.flags.familyMods?.elderCare || 0) >= 2 &&
      state.people.some((p) => ["nine", "dede"].includes(p.id) && p.available !== false) &&
      state.time.absoluteWeek > 18,
    choices: [
      {
        id: "stay",
        label: "Bu hafta sen bak",
        effects: { health: { energy: -8, stress: 3 }, money: -400, reason: "Bakım masrafı", memory: "Yaşlı bakımını üstlendin." },
      },
      { id: "pay", label: "Bakıcı ayır", effects: { money: -1800, reason: "Bakıcı", health: { stress: 2 } } },
    ],
  },
  {
    id: "fam_emergency_ask",
    repeat: "cooldown",
    cooldownWeeks: 20,
    title: "Aile acil para",
    text: "Telefondaki ses utanıyor ama sayı net. 'Bu ayı bağlayalım' cümlesi borç cümlesidir.",
    condition: (state) => state.household.livingWithFamily && state.finances.balance > 4000 && weekOk(state, "lastFamilyMoney", 16),
    choices: [
      { id: "give", label: "Ver", effects: { money: -2000, reason: "Aile acil destek", relationships: { anne: 5, baba: 3 }, flags: { lastFamilyMoney: true } } },
      { id: "refuse", label: "Bu ay yok", effects: { relationships: { anne: -6 }, health: { stress: 5 } } },
    ],
  },
  {
    id: "work_bad_boss",
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Kötü patron haftası",
    text: "Patron 'biz burada aileyiz' dedi. Arkasından cumartesi de gelmeni istedi. Aile dediği şeyin miras kısmı yok.",
    condition: (state) => Boolean(state.career?.jobId) && state.career.jobId !== null && state.time.absoluteWeek > 20,
    choices: [
      { id: "overtime", label: "Cumartesiyi yiyerek kal", effects: { health: { energy: -10, stress: 6 }, flags: { overtimeLastWeek: true } } },
      { id: "pushback", label: "Sınır koy", effects: { health: { stress: 4 }, memory: "Fazla mesaiye hayır dedin." } },
    ],
  },
  {
    id: "work_mentor",
    repeat: "cooldown",
    cooldownWeeks: 22,
    title: "Mentor çıkması",
    text: "Bir kıdemli, 'bu iş böyle yapılmaz' diyor. Öğretmek istiyor gibi; belki de kendini kanıtlamak.",
    condition: (state) => Boolean(state.career?.jobId) && (state.career.weeksInRole || 0) > 12,
    choices: [
      { id: "learn", label: "Dinle, not al", effects: { health: { energy: -3 }, memory: "İşte birinden gerçek bir şey öğrendin." } },
      { id: "skip", label: "Kendi bildiğini yap", effects: { health: { stress: 2 } } },
    ],
  },
  {
    id: "work_layoff_rumor",
    repeat: "cooldown",
    cooldownWeeks: 28,
    title: "İşten çıkarma fısıltısı",
    text: "Mutfakta üç kişi aynı anda susuyor. Liste yok ama kâğıt kokusu var.",
    condition: (state) => Boolean(state.career?.jobId) && state.health.stress > 40 && state.time.absoluteWeek > 16,
    choices: [
      { id: "search", label: "Sessizce iş ara", effects: { health: { stress: 3 }, flags: { hiddenJobSearch: true }, memory: "Hâlâ içerideyken dışarı bakmaya başladın." } },
      { id: "stay", label: "Yok say", effects: { health: { stress: 5 } } },
    ],
  },
  {
    id: "work_accident",
    repeat: "cooldown",
    cooldownWeeks: 40,
    title: "İş kazası eşiği",
    text: "Bir hareket yanlış, bir alet kayıyor. Rapor 'ucuz atlatıldı' diye yazılacak; beden öyle demiyor.",
    condition: (state) => ["courier", "factory", "construction", "electrician", "warehouse"].includes(state.career?.jobId) && state.time.absoluteWeek > 16,
    choices: [
      { id: "report", label: "Tutanağa yazdır", effects: { health: { health: -8, stress: 6 }, memory: "Kazayı kayda geçirdin." } },
      { id: "swallow", label: "Geçiştir", effects: { health: { health: -6, energy: -6 }, memory: "Kazayı yuttun; iz kaldı." } },
    ],
  },
  {
    id: "romance_wide_meet",
    repeat: "cooldown",
    cooldownWeeks: 12,
    title: "Yeni bir yüz",
    text: "Kalabalık çevrede bir bakış uzuyor. İsim henüz net değil; niyet daha net.",
    condition: (state) =>
      (state.flags.networkMode === "wide" || state.player?.background?.social === "broad") &&
      !state.social?.currentPartnerNpcId &&
      (state.people || []).some((p) => p.romanceEligible && p.social?.romanceStatus === "none"),
    choices: [
      { id: "approach", label: "Yanaş", effects: { health: { energy: -4, stress: -2 }, memory: "Yeni biriyle konuşmaya başladın." } },
      { id: "pass", label: "Geç", effects: {} },
    ],
  },
  {
    id: "romance_privacy",
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Mahremiyet yok",
    text: "Aile evinde kapı gerçek kapı değildir. Bir öpücük bile koridora sızar.",
    condition: (state) =>
      state.household.homeId === "family" &&
      Boolean(state.social?.currentPartnerNpcId) &&
      (state.flags.familyMods?.privacy ?? 2) <= 1,
    choices: [
      { id: "outside", label: "Dışarı kaç", effects: { money: -400, reason: "Dışarıda vakit", health: { energy: -5, stress: -3 } } },
      { id: "risk", label: "Evde kal", effects: { health: { stress: 6 }, relationships: { anne: -2 } } },
    ],
  },
  {
    id: "sex_protection",
    repeat: "cooldown",
    cooldownWeeks: 10,
    title: "Korunma konuşması",
    text: "Yatak hazır; kafa değil. Cümle kurulmazsa sonuç sistem kurar.",
    condition: (state) => Boolean(state.social?.currentPartnerNpcId) && state.player.age >= 18 && state.time.absoluteWeek > 16,
    choices: [
      { id: "protect", label: "Korunarak devam", effects: { flags: { lastProtectedSex: true }, health: { stress: -3 } } },
      { id: "risk", label: "Riske bırak", effects: { flags: { pregnancyRisk: true, stiRisk: true }, health: { stress: 4 }, memory: "Korunmasız bir gece oldu." } },
    ],
  },
  {
    id: "infidelity_tempt",
    repeat: "cooldown",
    cooldownWeeks: 22,
    title: "Başka teklif",
    text: "Partnerin yokken bir mesaj. 'Yalnız bu gece' cümlesi hiç yalnız bitmez.",
    condition: (state) => Boolean(state.social?.currentPartnerNpcId) && state.flags.paidEncounterWeek !== state.time.absoluteWeek && state.time.absoluteWeek > 20,
    choices: [
      { id: "refuse", label: "Kapa", effects: { health: { stress: 2 }, memory: "Sadakati seçtin." } },
      { id: "cheat", label: "Cevap ver", effects: { flags: { infidelityRisk: true }, health: { stress: 8 }, memory: "Başka birine alan açtın." } },
    ],
  },
  {
    id: "child_budget_shock",
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Çocuk faturası",
    text: "Bebek gülünce mutluluk yazılmaz. Yazılan şey bez, muayene, uyku.",
    condition: (state) => (state.parenthood?.children || []).some((c) => c.status === "active" || c.alive !== false),
    choices: [
      { id: "pay", label: "Öde ve uyu", effects: { money: -2200, reason: "Çocuk masrafı", health: { energy: -6 } } },
      { id: "borrow_family", label: "Aileden iste", effects: { relationships: { anne: -2 }, money: 1200, reason: "Aile çocuk desteği", health: { stress: 3 } } },
    ],
  },
  {
    id: "roommate_fight",
    repeat: "cooldown",
    cooldownWeeks: 14,
    title: "Ev arkadaşı gerilimi",
    text: "Lavabo, fatura, gece gelen ses. Paylaşımlı evde mahremiyet kira kadar pahalı.",
    condition: (state) => state.household.homeId === "shared" && state.time.absoluteWeek > 12,
    choices: [
      { id: "talk", label: "Konuş, sınır koy", effects: { health: { stress: 3, energy: -3 } } },
      { id: "endure", label: "Yut", effects: { health: { stress: 7 } } },
    ],
  },
  {
    id: "scam_call",
    repeat: "cooldown",
    cooldownWeeks: 18,
    title: "Dolandırıcı arıyor",
    text: "Resmi ton, acil para, 'anneniz bekliyor'. Kâğıt üstünde banka; seste acele.",
    condition: (state) => state.finances.balance > 2000 && state.time.absoluteWeek > 14,
    choices: [
      { id: "hang", label: "Kapat", effects: { health: { stress: 2 } } },
      { id: "pay", label: "Panikleyip gönder", effects: { money: -2500, reason: "Dolandırıcılık", health: { stress: 10 }, memory: "Sahte bir acil duruma para kaptırdın." } },
    ],
  },
  {
    id: "visa_talk",
    repeat: "cooldown",
    cooldownWeeks: 30,
    title: "Yurtdışı kapısı",
    text: "Bir tanıdık vize dosyası açmış. 'Sen de bak' diyor. Bakmak bile uykuyu yer.",
    condition: (state) =>
      ((state.education?.fields || []).includes("language") || state.player.age >= 23) &&
      state.time.absoluteWeek > 24,
    choices: [
      { id: "file", label: "Dosyayı yokla", effects: { money: -1800, reason: "Vize / tercüme", health: { stress: 5 }, memory: "Yurtdışı dosyasına baktın." } },
      { id: "stay", label: "Burada kal", effects: {} },
    ],
  },
  {
    id: "military_letter",
    repeat: "once",
    title: "Askerlik yazısı",
    text: "Zarf resmi. Erteleme cümlesi ayrı, yoklama cümlesi ayrı. İkisi de tarih taşır.",
    condition: (state) => state.military?.applicable && state.military.status === "pending" && state.time.absoluteWeek > 20,
    choices: [
      { id: "defer", label: "Erteleme yolunu ara", effects: { money: -600, reason: "Dilekçe / yol", health: { stress: 4 } } },
      { id: "accept", label: "Tarihi kabul et", effects: { health: { stress: 6 }, memory: "Askerlik tarihini kabul ettin." } },
    ],
  },
  {
    id: "market_hangover",
    repeat: "cooldown",
    cooldownWeeks: 8,
    title: "Gecenin faturası",
    text: "Sabah ağızda metal, hesapta delik. Keyif +10 yazılmıyor.",
    condition: (state) => (state.flags.alcoholWeeks || 0) > 0 && state.health.energy < 50,
    choices: [
      { id: "rest", label: "Yat, toparlan", effects: { health: { energy: 8, health: -2 } } },
      { id: "work", label: "İşe sürüklen", effects: { health: { energy: -6, stress: 5 } } },
    ],
  },
  {
    id: "illegal_close_call",
    repeat: "cooldown",
    cooldownWeeks: 20,
    title: "Yasadışı yakın geçiş",
    text: "Bir kontrol, bir bakış, bir susma. Yasal alışveriş gibi durmuyordu; çünkü değildi.",
    condition: (state) => (state.flags.illegalRisk || 0) >= 8,
    choices: [
      { id: "stop", label: "Bu işi kes", effects: { flags: { illegalRisk: 0 }, health: { stress: 3 }, memory: "Riskli alışkanlığı kestin." } },
      { id: "continue", label: "Devam et", effects: { health: { stress: 6 }, flags: { illegalRisk: true } } },
    ],
  },
  {
    id: "network_ask_help",
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Tanıdık yardım istiyor",
    text: "Mesaj kısa: 'sıkıştım'. Uzun hali borç, yatak ya da referans olabilir.",
    condition: (state) =>
      (state.people || []).some((p) => (state.relationships[p.id] || 0) >= 36 && !["anne", "baba"].includes(p.id)) &&
      state.time.absoluteWeek > 14,
    choices: [
      { id: "help", label: "Yardım et", effects: { money: -700, reason: "Tanıdık yardımı", health: { energy: -4 } } },
      { id: "no", label: "Bu hafta olmaz", effects: { health: { stress: 3 } } },
    ],
  },
  {
    id: "family_funeral",
    repeat: "once",
    title: "Uzak bir cenaze",
    text: "Telefon gece gelir. Ölüm komikleştirilmez. Yol, ev, yemek, suskunluk.",
    condition: (state) =>
      state.player.age >= 20 &&
      (state.flags.familyType === "extended" || state.flags.familyType === "stem") &&
      state.time.absoluteWeek > 30,
    choices: [
      { id: "go", label: "Git, dur", effects: { money: -1600, reason: "Cenaze yolu", health: { energy: -8, stress: 8 }, memory: "Bir cenazede durdun." } },
      { id: "send", label: "Para gönder, gideme", effects: { money: -800, reason: "Taziye", relationships: { anne: -4 }, health: { stress: 6 } } },
    ],
  },
  {
    id: "class_shift",
    repeat: "cooldown",
    cooldownWeeks: 36,
    title: "Sınıf kayması",
    text: "Eski mahalle seni başka tartıyor. Yeni masa da seni eski mahalleden tartıyor.",
    condition: (state) => state.finances.balance > 25000 || state.career?.jobId === "specialist" || state.career?.jobId === "developer",
    choices: [
      { id: "own", label: "Yeni düzeni sahiplen", effects: { health: { stress: 3 }, memory: "Sınıf atladığını hissettin; bazı kapılar kapandı." } },
      { id: "return", label: "Eski masaya dön", effects: { money: -400, reason: "Eski çevre", health: { stress: -3 } } },
    ],
  },
];

export function applyExpansionResolution(state, definition, choiceId) {
  if (!definition?.id) return null;
  if (definition.id === "net_referral_offer" && choiceId === "take") {
    const person = (state.people || []).find((p) => canRequestReferral(state, p.id).ok);
    if (person) {
      recordReferral(state, person.id, state.career?.pendingJob?.jobId || state.career?.jobId);
      createFavor(state, { personId: person.id, direction: "player_owes", type: "referral", dueWeeks: 10, sourceEvent: definition.id });
      addNpcMemory(state, person.id, "İş için referans verdi.", "favor_given");
    }
  }
  if (definition.id === "net_intro_chance" && choiceId === "accept") {
    const known = (state.people || []).filter((p) => (state.relationships[p.id] || 0) >= 35);
    if (known.length >= 2) introducePeople(state, known[0].id, known[1].id);
  }
  if (definition.id === "romance_wide_meet" && choiceId === "approach") {
    const target = (state.people || []).find((p) => p.romanceEligible && p.social?.romanceStatus === "none" && p.roleId !== "family");
    if (target) {
      target.social.romanceStatus = "interest";
      target.social.visibility = "introduced";
      applyRelationshipDelta(state, target.id, { closeness: 8, trust: 4 });
      addNpcMemory(state, target.id, "İlk ciddi bakış tutuldu.", "romance");
    }
  }
  if (definition.id === "sex_protection" && choiceId === "risk") {
    scheduleSocialFollowup(state, {
      eventId: "sex_consequence_callback",
      dueWeek: state.time.absoluteWeek + 6,
      personId: state.social.currentPartnerNpcId,
    });
  }
  if (definition.id === "network_ask_help" && choiceId === "help") {
    const person = (state.people || []).find((p) => (state.relationships[p.id] || 0) >= 36 && !["anne", "baba"].includes(p.id));
    if (person) {
      applyRelationshipDelta(state, person.id, { trust: 6, closeness: 3 });
      createFavor(state, { personId: person.id, direction: "npc_owes", type: "help", sourceEvent: definition.id });
    }
  }
  if (definition.id === "child_budget_shock" && choiceId === "borrow_family" && (state.flags.familyMoneyTaken || 0) >= 3) {
    transact(state, -1200, "Aile çocuk desteği geri alındı", "family");
    addMemory(state, "Aile kasasından para çifçiliği tutmadı.", "important");
  }
  if (definition.id === "child_budget_shock" && choiceId === "borrow_family") {
    state.flags.familyMoneyTaken = (state.flags.familyMoneyTaken || 0) + 1;
  }
  return null;
}

export const EXPANSION_CALLBACK_EVENTS = [
  {
    id: "sex_consequence_callback",
    repeat: "repeatable",
    title: "Gece geri döndü",
    text: "Korunmayan gecenin faturası gecikmeli gelir: korku, test, bazen daha sert bir gerçek.",
    condition: () => false,
    choices: [
      { id: "test", label: "Test yaptır", effects: { money: -900, reason: "Sağlık testi", health: { stress: 6, health: -2 }, flags: { pregnancyRisk: null, stiRisk: null } } },
      { id: "wait", label: "Bekle, yok say", effects: { health: { stress: 10 }, flags: { delayedHealthFear: true } } },
    ],
  },
];
