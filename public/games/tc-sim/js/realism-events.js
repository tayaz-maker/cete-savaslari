import {
  getRelationship,
  getRelationshipStage,
  hasNpcMemory,
  scheduleSocialFollowup,
} from "./social.js?v=8";
import { getJobById, getPlayerLifeStage } from "./life.js?v=8";
import { createFavor, recordReputationEvidence } from "./depth3-systems.js?v=8";
import { createSecret, transferSecret } from "./depth2-systems.js?v=8";

const friendish = (state, id) =>
  ["friend", "close", "partner"].includes(getRelationshipStage(state, id));

const job = (state) => getJobById(state.career.jobId);
const jobId = (state) => state.career.jobId;
const retired = (state) => state.career.retirement?.status === "retired";
const partnered = (state) =>
  Boolean(state.social.currentPartnerNpcId) && !state.household.union?.separatedSince;
const single = (state) => !partnered(state);
const familyHome = (state) => state.household.homeId === "family";
const rented = (state) => state.household.homeId === "studio" || state.household.homeId === "shared";
const stageId = (state) => getPlayerLifeStage(state).id;
const midOrLate = (state) => ["midlife", "late_career", "retirement_transition"].includes(stageId(state));
const tightMoney = (state) => state.player.background?.economic === "tight" || state.finances.balance < 2800;
const sociable = (state) => (state.player.tendencies?.sociability || 50) >= 56;

const elifBond = (state) => {
  const r = getRelationship(state, "elif");
  return r && (r.romanceStatus === "interest" || r.romanceStatus === "partner" || r.closeness >= 48);
};

export const REALISM_EVENTS = [
  // ---- Job: market ----
  {
    id: "job_market_late_close",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 18,
    title: "Kasa kapanışı",
    text: "Müdür: \"Reyon bitmedi, yarım saat daha.\" Otobüs son sefer. Market zaten kapalı sayılır, ışıklar açık.",
    condition: (state) => jobId(state) === "market" && state.time.absoluteWeek >= 5 && !retired(state),
    choices: [
      {
        id: "stay",
        label: "Kal, kapat",
        effects: {
          money: 180,
          health: { energy: -10, stress: 4 },
          flags: { stayedLateMarket: true },
          memory: "Market kapanışında kaldın.",
          reason: "Geç kasa",
        },
      },
      {
        id: "leave",
        label: "Vardiyam bitti de",
        effects: {
          health: { stress: 3 },
          flags: { leftMarketOnTime: true },
          memory: "Market kapanışını geri çevirdin.",
        },
      },
    ],
  },
  {
    id: "job_market_missing_item",
    social3D: true,
    repeat: "once",
    title: "Reyon açığı",
    text: "Sayımda bir koli eksik. Müdür bakmadan: \"Dün sen kapattın.\" Fatura sende değil.",
    condition: (state) => jobId(state) === "market" && (state.career.weeksInRole || 0) >= 6 && state.time.absoluteWeek >= 8,
    choices: [
      {
        id: "own",
        label: "Ben bakayım de",
        effects: {
          health: { stress: 7 },
          flags: { ownedMarketGap: true },
          memory: "Market açığını üstüne aldın.",
        },
      },
      {
        id: "push",
        label: "Sayım listesini iste",
        effects: {
          health: { stress: 5 },
          flags: { challengedMarketGap: true },
          memory: "Market açığında liste istedin.",
        },
      },
    ],
  },

  // ---- Job: courier ----
  {
    id: "job_courier_rain",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Yağmur ve uygulama",
    text: "Yağmur başladı. Uygulama üç siparişi üst üste bağladı. Biri beşinci kata, asansör yok.",
    condition: (state) => jobId(state) === "courier" && state.time.absoluteWeek >= 4 && !retired(state),
    choices: [
      {
        id: "push",
        label: "Hepsini yetiştir",
        effects: {
          money: 220,
          health: { energy: -14, stress: 6 },
          flags: { pushedCourierRain: true },
          memory: "Yağmurda kurye siparişlerini yetiştirdin.",
          reason: "Ek teslimat",
        },
      },
      {
        id: "drop",
        label: "Birini geri çevir",
        effects: {
          health: { stress: 4 },
          flags: { droppedCourierOrder: true },
          memory: "Yağmurda bir teslimatı geri çevirdin.",
        },
      },
    ],
  },
  {
    id: "job_courier_dispute",
    social3D: true,
    repeat: "once",
    title: "Kapıda tartışma",
    text: "Alıcı poşeti açmadan: \"Bu eksik. Uygulamaya yazacağım.\" Sen mühürü kontrol ettin, açık değildi.",
    condition: (state) => jobId(state) === "courier" && (state.career.weeksInRole || 0) >= 5,
    choices: [
      {
        id: "photo",
        label: "Mühürü göster, çık",
        effects: {
          health: { stress: 5 },
          flags: { courierDisputeLogged: true },
          memory: "Teslimatta mühürü gösterip çıktın.",
        },
      },
      {
        id: "replace",
        label: "Kendi cebinden kapat",
        effects: {
          money: -180,
          health: { stress: 2 },
          flags: { courierPaidDispute: true },
          memory: "Teslimat tartışmasını kendi cebinden kapattın.",
          reason: "Teslimat",
        },
      },
    ],
  },

  // ---- Job: office ----
  {
    id: "job_office_meeting",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 20,
    title: "Toplantı odası",
    text: "Bir saatlik toplantı. Konu üç cümlelik bir tablo. Senin sıran en sonda, kimse bakmıyor.",
    condition: (state) => jobId(state) === "office" && state.time.absoluteWeek >= 6 && !retired(state),
    choices: [
      {
        id: "speak",
        label: "Kısaca müdahale et",
        effects: {
          health: { stress: 4 },
          flags: { spokeInOfficeMeeting: true },
          memory: "Ofis toplantısında söz aldın.",
        },
      },
      {
        id: "notes",
        label: "Not tut, çık",
        effects: {
          health: { energy: -4 },
          flags: { satThroughOfficeMeeting: true },
          memory: "Ofis toplantısını sessiz geçirdin.",
        },
      },
    ],
  },
  {
    id: "job_office_form",
    social3D: true,
    repeat: "once",
    title: "Performans formu",
    text: "İnsan kaynakları formu: \"Hedeflerinizi yazın.\" Üstteki kutu boş, seninkine bir cümle sığacak.",
    condition: (state) => jobId(state) === "office" && (state.career.weeksInRole || 0) >= 8,
    choices: [
      {
        id: "honest",
        label: "Olduğu gibi yaz",
        effects: {
          health: { stress: 3 },
          flags: { honestOfficeForm: true },
          memory: "Performans formunu olduğu gibi doldurdun.",
        },
      },
      {
        id: "polish",
        label: "Şişir, geç",
        effects: {
          health: { stress: 5 },
          flags: { polishedOfficeForm: true },
          memory: "Performans formunu şişirdin.",
        },
      },
    ],
  },

  // ---- Job: technician ----
  {
    id: "job_tech_part",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 18,
    title: "Yedek parça",
    text: "Müşteri evinde: \"Parçayı sen mi koyuyorsun, biz mi alıyoruz?\" Depoda yok. Piyasa fiyatı 740.",
    condition: (state) => jobId(state) === "technician" && state.time.absoluteWeek >= 8,
    choices: [
      {
        id: "advance",
        label: "Sen al, sonra kes",
        effects: {
          money: -740,
          flags: { advancedTechPart: true },
          memory: "Teknik serviste parçayı sen önden aldın.",
          reason: "Yedek parça",
        },
      },
      {
        id: "wait",
        label: "Depo gelsin de",
        effects: {
          health: { stress: 3 },
          flags: { delayedTechPart: true },
          memory: "Teknik serviste parçayı depoya bıraktın.",
        },
      },
    ],
  },
  {
    id: "job_tech_oncall",
    social3D: true,
    repeat: "once",
    title: "Pazar araması",
    text: "Pazar 11:40. İş telefonu: \"Klima durdu, çocuk evde. Gelebilir misin.\" Vardiya dışı.",
    condition: (state) => jobId(state) === "technician" && (state.career.weeksInRole || 0) >= 6,
    choices: [
      {
        id: "go",
        label: "Git",
        effects: {
          money: 380,
          health: { energy: -12 },
          flags: { tookTechOncall: true },
          memory: "Pazar günü teknik çağrıya gittin.",
          reason: "Servis",
        },
      },
      {
        id: "no",
        label: "Pazartesi de",
        effects: {
          flags: { refusedTechOncall: true },
          memory: "Pazar teknik çağrısını pazartesiye bıraktın.",
        },
      },
    ],
  },

  // ---- Job: specialist ----
  {
    id: "job_spec_deck",
    social3D: true,
    repeat: "once",
    title: "Sunum slaytı",
    text: "Hazırladığın slayt toplantıda başkasının adıyla açıldı. Müdür: \"Güzel olmuş.\" Senin adın yok.",
    condition: (state) => jobId(state) === "specialist" && (state.career.weeksInRole || 0) >= 6,
    choices: [
      {
        id: "after",
        label: "Toplantı bitince söyle",
        effects: {
          health: { stress: 6 },
          flags: { claimedSpecDeck: true },
          memory: "Sunumdaki adı toplantıdan sonra sordun.",
        },
      },
      {
        id: "file",
        label: "Dosyayı kendine sakla",
        effects: {
          health: { stress: 4 },
          flags: { filedSpecDeck: true },
          memory: "Sunum slaytını kendine sakladın.",
        },
      },
    ],
  },
  {
    id: "job_spec_dinner",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 22,
    title: "Müşteri yemeği",
    text: "Akşam 19:30. Müşteri yemeği. Sen yorgunsun. Müdür: \"Yüzün görünsün yeter.\" Hesap işten.",
    condition: (state) => jobId(state) === "specialist" && state.time.absoluteWeek >= 10 && !retired(state),
    choices: [
      {
        id: "go",
        label: "Git, erken kalk",
        effects: {
          health: { energy: -10, stress: 3 },
          flags: { attendedClientDinner: true },
          memory: "Müşteri yemeğine gittin.",
        },
      },
      {
        id: "skip",
        label: "Bugün yokum de",
        effects: {
          health: { stress: 2 },
          flags: { skippedClientDinner: true },
          memory: "Müşteri yemeğini geri çevirdin.",
        },
      },
    ],
  },

  // ---- Unemployment ----
  {
    id: "jobless_family_ask",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Başvuru sorusu",
    text: "Annen salonda: \"Bu hafta kaç yere yazdın.\" Sayı vermeni bekliyor. Sen üç ilana bakıp kapattın.",
    condition: (state) =>
      jobId(state) === null &&
      !state.career.pendingJob &&
      familyHome(state) &&
      state.time.absoluteWeek >= 4,
    choices: [
      {
        id: "number",
        label: "Sayı uydur",
        effects: {
          social: { anne: { trust: -3, tension: 4 } },
          health: { stress: 5 },
          npcMemory: { personId: "anne", text: "Başvuru sayısını yuvarladı.", type: "jobless_number" },
        },
      },
      {
        id: "true",
        label: "Üç, hepsi sessiz",
        effects: {
          social: { anne: { tension: 3 } },
          npcMemory: { personId: "anne", text: "Başvuruların dönmediğini söyledi.", type: "jobless_honest" },
        },
      },
    ],
  },
  {
    id: "jobless_silence",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 14,
    title: "Dönen yok",
    text: "İki haftadır kutu boş. Bir ilan \"değerlendirmedeyiz\" demişti, sonra kesildi.",
    condition: (state) => jobId(state) === null && !state.career.pendingJob && state.time.absoluteWeek >= 6,
    choices: [
      {
        id: "again",
        label: "Aynı ilanlara bir daha yaz",
        effects: {
          health: { energy: -6, stress: 4 },
          flags: { reappliedSameAds: true },
          memory: "Cevapsız ilanlara tekrar yazdın.",
        },
      },
      {
        id: "walk",
        label: "Dışarı çık, kafanı dağıt",
        effects: {
          money: -40,
          health: { stress: -3, energy: -3 },
          memory: "İş dönüşü olmayınca dışarı çıktın.",
          reason: "Çay",
        },
      },
    ],
  },
  {
    id: "jobless_mehmet_lead",
    social3D: true,
    repeat: "once",
    title: "Bir isim",
    text: "Mehmet: \"Depoda bir adam arıyorlar, temizlik değil ama yakın. İstersen söylerim.\" Net maaş yok.",
    condition: (state) =>
      jobId(state) === null &&
      friendish(state, "mehmet") &&
      state.time.absoluteWeek >= 8 &&
      !state.flags.askedMehmetJobLead,
    choices: [
      {
        id: "take",
        label: "Söyle",
        effects: {
          flags: { askedMehmetJobLead: true },
          npcMemory: { personId: "mehmet", text: "Depo işi için ismini verdi.", type: "job_lead_asked" },
        },
      },
      {
        id: "pass",
        label: "Bu değil",
        effects: {
          flags: { passedMehmetJobLead: true },
          npcMemory: { personId: "mehmet", text: "Depo işini istemedi.", type: "job_lead_passed" },
        },
      },
    ],
  },

  // ---- Education ----
  {
    id: "edu_shift_clash",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Kurs saati",
    text: "Kurs 19:00. İşten çıkış 18:40. Yol yetişmez. Öğretmen yoklama tutuyor.",
    condition: (state) =>
      Boolean(state.education.active) &&
      jobId(state) !== null &&
      state.time.absoluteWeek >= 5 &&
      !retired(state),
    choices: [
      {
        id: "course",
        label: "İşi erken bırak, kursa git",
        effects: {
          health: { energy: -8, stress: 3 },
          flags: { leftWorkForCourse: true },
          memory: "Kurs için işten erken çıktın.",
        },
      },
      {
        id: "work",
        label: "Kursa yazıl, gitme",
        effects: {
          health: { stress: 6 },
          flags: { missedCourseForWork: true },
          memory: "Kurs saatini işe verdin.",
        },
      },
    ],
  },
  {
    id: "edu_family_doubt",
    social3D: true,
    repeat: "once",
    title: "Ne işe yarayacak",
    text: "Baban televizyonu kapatmadan: \"O kağıt iş buldurur mu. Ben görmedim.\"",
    condition: (state) =>
      Boolean(state.education.active) &&
      familyHome(state) &&
      state.time.absoluteWeek >= 10,
    choices: [
      {
        id: "defend",
        label: "Bitirmeden bilinmez de",
        effects: {
          social: { baba: { tension: 5 } },
          npcMemory: { personId: "baba", text: "Eğitimi savundu.", type: "edu_defended" },
        },
      },
      {
        id: "quiet",
        label: "Geç",
        effects: {
          health: { stress: 4 },
          npcMemory: { personId: "baba", text: "Eğitim sorusunu geçiştirdi.", type: "edu_quiet" },
        },
      },
    ],
  },

  // ---- Housing ----
  {
    id: "house_lock_broken",
    social3D: true,
    repeat: "once",
    title: "Kilit dönmüyor",
    text: "Kapı kilidi ikinci turda takılıyor. Yönetici: \"Usta yarın bakacak.\" Yarın üçüncü kez ertelendi.",
    condition: (state) => rented(state) && state.time.absoluteWeek >= 8 && state.finances.balance >= 200,
    choices: [
      {
        id: "pay",
        label: "Kendi ustanı çağır",
        effects: {
          money: -450,
          flags: { paidBrokenLock: true },
          memory: "Kilit için kendi ustanı çağırdın.",
          reason: "Kilit",
        },
      },
      {
        id: "wait",
        label: "Yöneticinin ustasını bekle",
        effects: {
          health: { stress: 6 },
          flags: { waitedBrokenLock: true },
          memory: "Kilit tamirini yöneticiye bıraktın.",
        },
      },
    ],
  },
  {
    id: "house_neighbor_noise",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 20,
    title: "Üst kat",
    text: "Üstte saat 00:20. Sandalye. Sen sabah iştesin. Kapıya çıkınca koridor boş.",
    condition: (state) => rented(state) && state.time.absoluteWeek >= 6,
    choices: [
      {
        id: "note",
        label: "Kapıya not bırak",
        effects: {
          health: { stress: 3 },
          flags: { leftNoiseNote: true },
          memory: "Üst kata gürültü notu bıraktın.",
        },
      },
      {
        id: "endure",
        label: "Kulaklık tak",
        effects: {
          health: { energy: -6, stress: 4 },
          flags: { enduredNeighborNoise: true },
          memory: "Üst kat gürültüsüne katlandın.",
        },
      },
    ],
  },
  {
    id: "house_family_dropin",
    social3D: true,
    repeat: "once",
    title: "Kapı zili",
    text: "Annen elinde tencere: \"Yoldaydık, uğradık.\" Ev dağınık. Partnerin varsa odada.",
    condition: (state) =>
      state.household.homeId === "studio" &&
      state.time.absoluteWeek >= 10 &&
      state.relationships.anne >= 40,
    choices: [
      {
        id: "in",
        label: "Al içeri",
        effects: {
          social: { anne: { closeness: 4, tension: 2 } },
          flags: { letAnneIntoStudio: true },
          npcMemory: { personId: "anne", text: "Eve habersiz uğradı, içeri alındı.", type: "studio_dropin" },
        },
      },
      {
        id: "door",
        label: "Kapıda konuş",
        effects: {
          social: { anne: { tension: 6, closeness: -2 } },
          flags: { keptAnneAtDoor: true },
          npcMemory: { personId: "anne", text: "Eve alındı, kapıda konuşuldu.", type: "studio_door" },
        },
      },
    ],
  },

  // ---- Single life ----
  {
    id: "single_third_wheel",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 18,
    title: "Masa üç kişi",
    text: "Mehmet birini getirdi. İkisi aynı tarafta oturuyor. Sen hesaba bakıyorsun.",
    condition: (state) =>
      single(state) &&
      friendish(state, "mehmet") &&
      state.time.absoluteWeek >= 7 &&
      state.finances.balance >= 150,
    choices: [
      {
        id: "stay",
        label: "Kal, hesabı böl",
        effects: {
          money: -160,
          social: { mehmet: { closeness: 2 } },
          health: { stress: 2 },
          npcMemory: { personId: "mehmet", text: "Çift masasında kaldı.", type: "third_wheel_stayed" },
          reason: "Masa",
        },
      },
      {
        id: "leave",
        label: "Erken kalk",
        effects: {
          social: { mehmet: { tension: 2 } },
          npcMemory: { personId: "mehmet", text: "Çift gelince kalktı.", type: "third_wheel_left" },
        },
      },
    ],
  },
  {
    id: "single_quiet_sunday",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 22,
    title: "Pazar öğleden sonra",
    text: "Telefon sessiz. Dışarı çıkacak bir plan yok. Buzdolabında yoğurt var.",
    condition: (state) => single(state) && state.time.absoluteWeek >= 6 && !sociable(state),
    choices: [
      {
        id: "walk",
        label: "Yürü, dön",
        effects: {
          health: { energy: -4, stress: -4 },
          memory: "Plansız bir pazarı yürüyerek geçirdin.",
        },
      },
      {
        id: "home",
        label: "Evde kal",
        effects: {
          health: { energy: 3, stress: 2 },
          memory: "Plansız pazarı evde geçirdin.",
        },
      },
    ],
  },
  {
    id: "single_wedding_invite",
    social3D: true,
    repeat: "once",
    title: "Zarflı kart",
    text: "Kuzen düğünü. Kartta tek isim varsın. Hediye hanesi boş bırakılmış, herkes biliyor ne demek olduğunu.",
    condition: (state) =>
      single(state) &&
      state.time.absoluteWeek >= 16 &&
      state.finances.balance >= 400 &&
      !state.flags.cousinWeddingInviteSeen,
    choices: [
      {
        id: "go",
        label: "Git, zarf bırak",
        effects: {
          money: -900,
          health: { energy: -8 },
          flags: { cousinWeddingInviteSeen: true, wentSingleToWedding: true },
          memory: "Tek başına düğüne gidip zarf bıraktın.",
          reason: "Düğün",
        },
      },
      {
        id: "skip",
        label: "Mesaj at, gitme",
        effects: {
          flags: { cousinWeddingInviteSeen: true, skippedSingleWedding: true },
          social: { anne: { tension: 4 } },
          memory: "Tek isimli düğün davetini mesajla geçtin.",
        },
      },
    ],
  },

  // ---- Partner mundane ----
  {
    id: "partner_grocery_list",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Liste yarım",
    text: "Elif: \"Süt ve ekmek diye yazmıştım.\" Sen deterjan almışsın. Mutfakta ikisi de yok.",
    condition: (state) =>
      partnered(state) &&
      state.social.currentPartnerNpcId === "elif" &&
      state.household.homeId !== "family" &&
      state.time.absoluteWeek >= 12,
    choices: [
      {
        id: "go_back",
        label: "Geri dön, al",
        effects: {
          money: -90,
          health: { energy: -5 },
          social: { elif: { tension: -2 } },
          npcMemory: { personId: "elif", text: "Unutulan listeyi tamamladı.", type: "grocery_fixed" },
          reason: "Market",
        },
      },
      {
        id: "later",
        label: "Yarın bakılır de",
        effects: {
          social: { elif: { tension: 5 } },
          npcMemory: { personId: "elif", text: "Listeyi yarına bıraktı.", type: "grocery_delayed" },
        },
      },
    ],
  },
  {
    id: "partner_tired_evening",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 18,
    title: "Söz yok",
    text: "İkiniz de işten geldiniz. Elif telefonda. Sen ayakkabını çıkarıyorsun. Konuşulacak bir şey varmış gibi duruyor, yok da.",
    condition: (state) =>
      partnered(state) &&
      state.social.currentPartnerNpcId === "elif" &&
      jobId(state) !== null &&
      state.health.energy <= 55 &&
      state.time.absoluteWeek >= 14,
    choices: [
      {
        id: "ask",
        label: "Nasıldı de",
        effects: {
          social: { elif: { closeness: 3, tension: -2 } },
          health: { energy: -3 },
          npcMemory: { personId: "elif", text: "Yorgun akşamda hâl hatır sordu.", type: "tired_asked" },
        },
      },
      {
        id: "scroll",
        label: "Sen de telefona bak",
        effects: {
          social: { elif: { closeness: -2 } },
          npcMemory: { personId: "elif", text: "Yorgun akşamda konuşmadı.", type: "tired_scrolled" },
        },
      },
    ],
  },

  // ---- Family origin extras (not marriage hint) ----
  {
    id: "fam_bayram_travel",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 40,
    title: "Otobüs bileti",
    text: "Annen: \"Bayrama dayına gideceğiz. Biletleri ben bakayım mı.\" Gitmezsen konu evde kalır.",
    condition: (state) =>
      familyHome(state) &&
      state.time.absoluteWeek >= 18 &&
      state.time.weekOfMonth === 3,
    choices: [
      {
        id: "go",
        label: "Bileti sen al",
        effects: {
          money: -320,
          social: { anne: { closeness: 4, trust: 2 } },
          health: { energy: -8 },
          npcMemory: { personId: "anne", text: "Bayram yoluna kendi biletiyle geldi.", type: "bayram_went" },
          reason: "Yol",
        },
      },
      {
        id: "stay",
        label: "Bu bayram iş var",
        effects: {
          social: { anne: { tension: 6, closeness: -3 } },
          npcMemory: { personId: "anne", text: "Bayrama gelmedi.", type: "bayram_skipped" },
        },
      },
    ],
  },
  {
    id: "fam_aging_clinic",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 28,
    title: "Poliklinik sırası",
    text: "Babanın tansiyon kontrolü. Sıra uzun. Sen işten izin kopardın. O: \"Yalnız da giderdim.\"",
    condition: (state) =>
      midOrLate(state) &&
      state.relationships.baba >= 40 &&
      state.time.absoluteWeek >= 40,
    choices: [
      {
        id: "wait",
        label: "Sırada bekle",
        effects: {
          health: { energy: -8 },
          social: { baba: { closeness: 5, trust: 3 } },
          npcMemory: { personId: "baba", text: "Poliklinik sırasında yanında durdu.", type: "clinic_waited" },
        },
      },
      {
        id: "leave",
        label: "İşi bahane et, bırak",
        effects: {
          social: { baba: { tension: 5, closeness: -3 } },
          npcMemory: { personId: "baba", text: "Poliklinikte işi bahane etti.", type: "clinic_left" },
        },
      },
    ],
  },

  // ---- Weak ties / favors consumers ----
  {
    id: "weak_selin_favor",
    social3D: true,
    repeat: "once",
    title: "Selin'in kutusu",
    text: "Selin: \"Taşındım ya. Bir kutu kaldı, yarın öğleden sonra bakabilir misin.\" İş günü.",
    condition: (state) => {
      const selin = state.people.find((p) => p.id === "selin");
      return (
        state.time.absoluteWeek >= 76 &&
        Boolean(selin?.knownMilestones?.includes("selin-moved")) &&
        !state.flags.selinBoxFavor
      );
    },
    choices: [
      {
        id: "help",
        label: "Bak",
        effects: {
          health: { energy: -8 },
          flags: { selinBoxFavor: true },
          npcMemory: { personId: "selin", text: "Taşınma kutusuna geldi.", type: "selin_box_helped" },
        },
      },
      {
        id: "no",
        label: "O gün iş var",
        effects: {
          flags: { selinBoxFavor: true, refusedSelinBox: true },
          npcMemory: { personId: "selin", text: "Taşınma kutusuna gelmedi.", type: "selin_box_refused" },
        },
      },
    ],
  },
  {
    id: "weak_emre_notes",
    social3D: true,
    repeat: "once",
    title: "Emre'nin notu",
    text: "Emre: \"Sınav var. Eski defterin sende duruyor muydu.\" Sen kullanmıyorsun.",
    condition: (state) => {
      const emre = state.people.find((p) => p.id === "emre");
      return (
        state.time.absoluteWeek >= 40 &&
        Boolean(emre?.knownMilestones?.includes("emre-education")) &&
        !state.flags.emreNotesAsked
      );
    },
    choices: [
      {
        id: "send",
        label: "Fotoğrafını at",
        effects: {
          flags: { emreNotesAsked: true },
          npcMemory: { personId: "emre", text: "Eski notlarını gönderdi.", type: "emre_notes_sent" },
        },
      },
      {
        id: "lost",
        label: "Bulamadım de",
        effects: {
          flags: { emreNotesAsked: true, withheldEmreNotes: true },
          npcMemory: { personId: "emre", text: "Notları olmadığını söyledi.", type: "emre_notes_withheld" },
        },
      },
    ],
  },

  // ---- Money mundane ----
  {
    id: "money_shared_internet",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 24,
    title: "Fatura paylaşımı",
    text: "Paylaşımlı evin interneti 480. Ev arkadaşı: \"Bu ay senin sıran.\" Sen geçen ay da ödemiştin.",
    condition: (state) =>
      state.household.homeId === "shared" &&
      state.time.absoluteWeek >= 8 &&
      state.finances.balance >= 200,
    choices: [
      {
        id: "pay",
        label: "Öde, konuşma",
        effects: {
          money: -480,
          flags: { paidSharedInternet: true },
          memory: "Paylaşımlı ev internetini yine sen ödedin.",
          reason: "İnternet",
        },
      },
      {
        id: "split",
        label: "Bu ay bölünsün de",
        effects: {
          money: -240,
          health: { stress: 3 },
          flags: { splitSharedInternet: true },
          memory: "Paylaşımlı ev internetini böldün.",
          reason: "İnternet",
        },
      },
    ],
  },
  {
    id: "money_ask_mehmet_small",
    social3D: true,
    repeat: "once",
    title: "Kısa açık",
    text: "Ayın sonu. Kart limitine takıldın. Mehmet'e 400 yazmak kolay, sormak değil.",
    condition: (state) =>
      tightMoney(state) &&
      friendish(state, "mehmet") &&
      state.finances.balance < 600 &&
      state.time.absoluteWeek >= 10 &&
      !state.flags.askedMehmetSmall,
    choices: [
      {
        id: "ask",
        label: "İste",
        effects: {
          money: 400,
          flags: { askedMehmetSmall: true },
          social: { mehmet: { tension: 3 } },
          npcMemory: { personId: "mehmet", text: "Ay sonunda 400 istedi.", type: "asked_small_loan" },
          reason: "Kısa borç",
        },
      },
      {
        id: "cut",
        label: "İsteme, kıs",
        effects: {
          health: { stress: 6 },
          flags: { skippedMehmetSmall: true },
          memory: "Ay sonunu kısarak geçirdin.",
        },
      },
    ],
  },

  // ---- Body / overwork mundane ----
  {
    id: "body_skipped_lunch",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Öğle atlandı",
    text: "Öğleyi sandviçle geçirecektin. Müdür bir iş daha verdi. Saat 16:10, miden boş.",
    condition: (state) =>
      jobId(state) !== null &&
      !retired(state) &&
      state.health.energy <= 58 &&
      state.time.absoluteWeek >= 5,
    choices: [
      {
        id: "eat",
        label: "Çık, bir şey ye",
        effects: {
          money: -70,
          health: { energy: 4, stress: -2 },
          memory: "Atlanan öğleyi dışarıda kapattın.",
          reason: "Yemek",
        },
      },
      {
        id: "push",
        label: "Bitir, sonra bak",
        effects: {
          health: { energy: -8, stress: 5 },
          flags: { skippedLunchPush: true },
          memory: "Öğünü atlayıp işi bitirdin.",
        },
      },
    ],
  },
  {
    id: "body_pharmacy",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 20,
    title: "Eczane kuyruğu",
    text: "Başın iki gündür ağır. Eczacı: \"Basit bir şey, dinlen.\" Kutu 95.",
    condition: (state) => state.health.stress >= 48 && state.time.absoluteWeek >= 6 && state.finances.balance >= 95,
    choices: [
      {
        id: "buy",
        label: "Al, evde yat",
        effects: {
          money: -95,
          health: { stress: -4, energy: 3 },
          memory: "Baş ağrısı için eczaneye uğradın.",
          reason: "Eczane",
        },
      },
      {
        id: "skip",
        label: "Geçer de",
        effects: {
          health: { stress: 3, energy: -3 },
          memory: "Baş ağrısını geçiştirip eczaneye uğramadın.",
        },
      },
    ],
  },

  // ---- Midlife / retirement extras ----
  {
    id: "mid_plateau_desk",
    social3D: true,
    repeat: "once",
    title: "Aynı masa",
    text: "Üç yıldır aynı masa. Yeni gelen senin işini soruyor. Sen cevaplıyorsun, adın değişmiyor.",
    condition: (state) =>
      (stageId(state) === "midlife" || stageId(state) === "late_career") &&
      jobId(state) !== null &&
      (state.career.weeksInRole || 0) >= 80 &&
      !retired(state),
    choices: [
      {
        id: "teach",
        label: "Anlat, geç",
        effects: {
          health: { energy: -4 },
          flags: { taughtFromPlateau: true },
          memory: "Aynı masada yeni gelene işi anlattın.",
        },
      },
      {
        id: "ask",
        label: "Kendi yerini sor",
        effects: {
          health: { stress: 5 },
          flags: { askedFromPlateau: true },
          memory: "Aynı masada kendi yerini sordun.",
        },
      },
    ],
  },
  {
    id: "retire_morning",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 24,
    title: "Alarm yok",
    text: "Saat 08:10. Alarm kurmadın. Ev sessiz. Çay demleniyor. Gidecek bir yer yok.",
    condition: (state) => retired(state) && state.time.absoluteWeek >= 8,
    choices: [
      {
        id: "walk",
        label: "Dışarı çık",
        effects: {
          health: { energy: -3, stress: -5 },
          memory: "Emeklilik sabahını dışarıda geçirdin.",
        },
      },
      {
        id: "stay",
        label: "Evde otur",
        effects: {
          health: { energy: 4, stress: 2 },
          memory: "Emeklilik sabahını evde geçirdin.",
        },
      },
    ],
  },

  // ---- Chains ----
  {
    id: "rl_chn15_overtime",
    social3D: true,
    repeat: "once",
    title: "Akşam mesaisi",
    text: "İş: \"Bugün kalın.\" Annen: \"Yemek 19:30'da.\" İkisi aynı gün.",
    condition: (state) =>
      jobId(state) !== null &&
      familyHome(state) &&
      state.time.absoluteWeek >= 9 &&
      !state.flags.chn15Started &&
      !retired(state),
    choices: [
      {
        id: "work",
        label: "İşte kal",
        effects: {
          money: 280,
          social: { anne: { tension: 6, trust: -2 } },
          flags: { chn15Started: true, chn15ChoseWork: true },
          npcMemory: { personId: "anne", text: "Akşam yemeğine iş yüzünden gelmedi.", type: "chn15_missed_dinner" },
          reason: "Mesai",
        },
      },
      {
        id: "home",
        label: "Yemeğe git",
        effects: {
          social: { anne: { closeness: 3 } },
          flags: { chn15Started: true, chn15ChoseHome: true },
          npcMemory: { personId: "anne", text: "Mesaiye rağmen yemeğe oturdu.", type: "chn15_came_dinner" },
        },
      },
    ],
  },
  {
    id: "rl_chn15_comment",
    repeat: "once",
    title: "Sofrada boş tabak",
    text: "Annen ertesi gün: \"Yemek soğudu. Baban da sordu.\"",
    condition: () => false,
    choices: [
      {
        id: "own",
        label: "İşi seçtim de",
        effects: {
          social: { anne: { trust: 2, tension: -2 } },
          npcMemory: { personId: "anne", text: "Yemeği kaçırdığını inkâr etmedi.", type: "chn15_owned" },
        },
      },
      {
        id: "soft",
        label: "Geç kaldım de",
        effects: {
          social: { anne: { trust: -4, tension: 6 } },
          npcMemory: { personId: "anne", text: "Yemeği kaçırmayı yumuşattı.", type: "chn15_softened" },
        },
      },
    ],
  },
  {
    id: "rl_chn15_later",
    repeat: "once",
    title: "Bir sonraki davet",
    text: "Annen bir akraba yemeğini ayarlarken: \"Zaten iş çıkar. Sen gelme.\"",
    condition: () => false,
    choices: [
      {
        id: "insist",
        label: "Bu kez gelirim",
        effects: {
          social: { anne: { closeness: 3, tension: -2 } },
          npcMemory: { personId: "anne", text: "Sonraki davete gelmek istedi.", type: "chn15_insisted" },
        },
      },
      {
        id: "accept",
        label: "Peki",
        effects: {
          social: { anne: { closeness: -4, tension: 4 } },
          npcMemory: { personId: "anne", text: "Sonraki davetten düşürüldüğünü kabul etti.", type: "chn15_dropped" },
        },
      },
    ],
  },

  {
    id: "rl_chn16_repair",
    social3D: true,
    repeat: "once",
    title: "Su sesi",
    text: "Musluk gece damlıyor. Yönetici: \"Kayıt aldık.\" Üç gündür aynı cümle.",
    condition: (state) =>
      rented(state) &&
      state.time.absoluteWeek >= 11 &&
      !state.flags.chn16Started,
    choices: [
      {
        id: "wait",
        label: "Bekle",
        effects: {
          health: { stress: 5 },
          flags: { chn16Started: true, chn16Waited: true },
          memory: "Damlayan musluğu yöneticiye bıraktın.",
        },
      },
      {
        id: "fix",
        label: "Usta çağır",
        effects: {
          money: -380,
          flags: { chn16Started: true, chn16Fixed: true },
          memory: "Damlayan musluğu kendi ustanla kapattın.",
          reason: "Tesisat",
        },
      },
    ],
  },
  {
    id: "rl_chn16_neighbor",
    repeat: "once",
    title: "Alt kat",
    text: "Alt komşu kapıda: \"Tavanımız ıslandı. Sizin daire değil mi.\"",
    condition: () => false,
    choices: [
      {
        id: "admit",
        label: "Musluk bizdeydi",
        effects: {
          health: { stress: 4 },
          flags: { chn16Admitted: true },
          memory: "Alt kata damlayan musluğu kabul ettin.",
        },
      },
      {
        id: "deflect",
        label: "Yöneticiye sorun de",
        effects: {
          health: { stress: 6 },
          flags: { chn16Deflected: true },
          memory: "Alt katı yöneticiye yönlendirdin.",
        },
      },
    ],
  },
  {
    id: "rl_chn16_deposit",
    repeat: "once",
    title: "Depozito cümlesi",
    text: "Yönetici ay sonunda: \"Hasar kaydı var. Depozitodan konuşulur.\"",
    condition: () => false,
    choices: [
      {
        id: "argue",
        label: "Kayıt nerde de",
        effects: {
          health: { stress: 5 },
          flags: { chn16ArguedDeposit: true },
          memory: "Depozito kesintisine kayıt sordun.",
        },
      },
      {
        id: "eat",
        label: "Tartışma",
        effects: {
          health: { stress: 3 },
          flags: { chn16AteDeposit: true },
          memory: "Depozito konuşmasını yutkunup geçtin.",
        },
      },
    ],
  },

  {
    id: "rl_chn17_lead",
    social3D: true,
    repeat: "once",
    title: "Görüşme saati",
    text: "Mehmet'in verdiği isim aradı: \"Yarın 11. Gelmezsen geçersin.\" O saatte annen evde iş istiyor.",
    condition: (state) =>
      state.flags.askedMehmetJobLead &&
      jobId(state) === null &&
      !state.flags.chn17Started,
    choices: [
      {
        id: "go",
        label: "Görüşmeye git",
        effects: {
          health: { energy: -6, stress: 4 },
          flags: { chn17Started: true, chn17Went: true },
          npcMemory: { personId: "mehmet", text: "Verdiğim iş görüşmesine gitti.", type: "chn17_went" },
        },
      },
      {
        id: "skip",
        label: "Gitme",
        effects: {
          flags: { chn17Started: true, chn17Skipped: true },
          social: { mehmet: { trust: -6, tension: 6 } },
          npcMemory: { personId: "mehmet", text: "Verdiğim görüşmeye gitmedi.", type: "chn17_skipped" },
        },
      },
    ],
  },
  {
    id: "rl_chn17_result",
    repeat: "once",
    title: "Dönen arama",
    text: "İki gün sonra kısa mesaj: \"Kadroyu içeriden kapattık.\" Mehmet soracak.",
    condition: () => false,
    choices: [
      {
        id: "tell",
        label: "Mehmet'e yaz",
        effects: {
          social: { mehmet: { trust: 2 } },
          npcMemory: { personId: "mehmet", text: "Görüşmenin sonucunu söyledi.", type: "chn17_told" },
        },
      },
      {
        id: "hide",
        label: "Yazma",
        effects: {
          social: { mehmet: { tension: 4 } },
          npcMemory: { personId: "mehmet", text: "Görüşmenin sonucunu söylemedi.", type: "chn17_hid" },
        },
      },
    ],
  },
  {
    id: "rl_chn17_family",
    repeat: "once",
    title: "Evde haber",
    text: "Annen: \"O iş ne oldu. Mehmet ayarlamıştı.\"",
    condition: () => false,
    choices: [
      {
        id: "plain",
        label: "Olmadı de",
        effects: {
          social: { anne: { tension: 3 } },
          npcMemory: { personId: "anne", text: "Görüşmenin olmadığını söyledi.", type: "chn17_plain" },
        },
      },
      {
        id: "pad",
        label: "Başka yerler var de",
        effects: {
          social: { anne: { trust: -2, tension: 2 } },
          npcMemory: { personId: "anne", text: "Görüşmeyi başka kapılarla örttü.", type: "chn17_padded" },
        },
      },
    ],
  },

  {
    id: "rl_chn18_trip",
    social3D: true,
    repeat: "once",
    title: "Hafta sonu kaçışı",
    text: "Mehmet: \"Pazar sabah otobüs, akşam dönüş. 650. Gel.\" Kasada o para var, sonraki hafta yok.",
    condition: (state) =>
      friendish(state, "mehmet") &&
      single(state) &&
      state.time.absoluteWeek >= 12 &&
      state.finances.balance >= 650 &&
      !state.flags.chn18Started,
    choices: [
      {
        id: "go",
        label: "Git",
        effects: {
          money: -650,
          health: { energy: -8, stress: -4 },
          social: { mehmet: { closeness: 5 } },
          flags: { chn18Started: true, chn18Went: true },
          npcMemory: { personId: "mehmet", text: "Hafta sonu kaçışına geldi.", type: "chn18_went" },
          reason: "Yol",
        },
      },
      {
        id: "skip",
        label: "Bu ay yok",
        effects: {
          flags: { chn18Started: true, chn18Skipped: true },
          social: { mehmet: { tension: 3 } },
          npcMemory: { personId: "mehmet", text: "Hafta sonu kaçışına gelmedi.", type: "chn18_skipped" },
        },
      },
    ],
  },
  {
    id: "rl_chn18_story",
    repeat: "once",
    title: "Story",
    text: "Mehmet'in story'si: masa, çay, biri gülüyor. Sen evdesin. Yazısı yok.",
    condition: () => false,
    choices: [
      {
        id: "like",
        label: "Beğen, yazma",
        effects: {
          health: { stress: 3 },
          npcMemory: { personId: "mehmet", text: "Gitmediği kaçışın fotoğrafını beğendi.", type: "chn18_liked" },
        },
      },
      {
        id: "mute",
        label: "Geç",
        effects: {
          social: { mehmet: { closeness: -2 } },
          npcMemory: { personId: "mehmet", text: "Kaçış fotoğrafını görmezden geldi.", type: "chn18_muted" },
        },
      },
    ],
  },
  {
    id: "rl_chn18_next",
    repeat: "once",
    title: "Bir dahaki",
    text: "Mehmet bir ay sonra: \"Yine bakıyoruz. Sen de yoksun zaten.\"",
    condition: () => false,
    choices: [
      {
        id: "claim",
        label: "Bu kez varım",
        effects: {
          social: { mehmet: { closeness: 3 } },
          flags: { chn18ClaimedNext: true },
          npcMemory: { personId: "mehmet", text: "Sonraki kaçışa gelmek istedi.", type: "chn18_claimed" },
        },
      },
      {
        id: "leave",
        label: "Alıştıysan öyle kalsın",
        effects: {
          social: { mehmet: { closeness: -3, tension: 3 } },
          npcMemory: { personId: "mehmet", text: "Sonraki kaçıştan da çekildi.", type: "chn18_left" },
        },
      },
    ],
  },
];

export function applyRealismResolution(state, definition, choiceId) {
  const week = state.time.absoluteWeek;

  if (definition.id === "weak_selin_favor" && choiceId === "help") {
    createFavor(state, { personId: "selin", direction: "npc_owes", type: "help", sourceEvent: definition.id });
    recordReputationEvidence(state, "acquaintances", "helpful", 1, definition.id);
  }
  if (definition.id === "weak_emre_notes" && choiceId === "send") {
    createFavor(state, { personId: "emre", direction: "npc_owes", type: "help", sourceEvent: definition.id });
  }
  if (definition.id === "jobless_mehmet_lead" && choiceId === "take") {
    createFavor(state, { personId: "mehmet", direction: "player_owes", type: "help", dueWeeks: 6, sourceEvent: definition.id });
  }

  if (definition.id === "house_family_dropin" && choiceId === "in" && partnered(state) && state.social.currentPartnerNpcId === "elif") {
    const secret = createSecret(state, {
      id: "studio-dropin-elif",
      type: "privacy",
      summary: "Annen stüdyoya habersiz geldi",
      relatedPeople: ["anne", "elif"],
      knownBy: ["player", "anne"],
      hiddenFrom: [],
      sourceEvent: definition.id,
    });
    if (secret) transferSecret(state, secret.id, "elif");
  }

  if (definition.id === "rl_chn15_overtime" && choiceId === "work") {
    return { eventId: "rl_chn15_comment", dueWeek: week + 1, personId: "anne" };
  }
  if (definition.id === "rl_chn15_comment") {
    return { eventId: "rl_chn15_later", dueWeek: week + 6, personId: "anne" };
  }

  if (definition.id === "rl_chn16_repair" && choiceId === "wait") {
    return { eventId: "rl_chn16_neighbor", dueWeek: week + 2, personId: "anne" };
  }
  if (definition.id === "rl_chn16_neighbor") {
    return { eventId: "rl_chn16_deposit", dueWeek: week + 5, personId: "anne" };
  }

  if (definition.id === "rl_chn17_lead" && choiceId === "go") {
    return { eventId: "rl_chn17_result", dueWeek: week + 2, personId: "mehmet" };
  }
  if (definition.id === "rl_chn17_result" && familyHome(state)) {
    return { eventId: "rl_chn17_family", dueWeek: week + 2, personId: "anne" };
  }

  if (definition.id === "rl_chn18_trip" && choiceId === "skip") {
    return { eventId: "rl_chn18_story", dueWeek: week + 1, personId: "mehmet" };
  }
  if (definition.id === "rl_chn18_story") {
    return { eventId: "rl_chn18_next", dueWeek: week + 5, personId: "mehmet" };
  }

  return null;
}
