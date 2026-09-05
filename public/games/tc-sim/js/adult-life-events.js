import {
  getRelationship,
  getRelationshipStage,
} from "./social.js?v=5";

const friendish = (state, id) =>
  ["friend", "close", "partner"].includes(getRelationshipStage(state, id));

const elifBond = (state) => {
  const r = getRelationship(state, "elif");
  return r && (r.romanceStatus === "interest" || r.romanceStatus === "partner" || r.closeness >= 48);
};

export const ADULT_LIFE_EVENTS = [
  {
    id: "life_mehmet_needed_you",
    social3D: true,
    repeat: "once",
    title: "Sıra sende",
    text: "Kurye işi yetişmedi, Mehmet'ten yarım saat istedin. İki saat sonra: \"Uykudaydım kanka.\"",
    condition: (state) => friendish(state, "mehmet") && state.time.absoluteWeek >= 8,
    choices: [
      {
        id: "swallow",
        label: "Boşver de",
        effects: {
          social: { mehmet: { trust: -3, tension: 4 } },
          npcMemory: { personId: "mehmet", text: "Sıkışınca dönmedi, konu kapanmış gibi yaptı.", type: "needed_you_swallowed" },
          memory: "Mehmet sıkışınca ortada yoktu.",
        },
      },
      {
        id: "say_it",
        label: "Açıkça söyle",
        effects: {
          social: { mehmet: { trust: -1, tension: 7 } },
          npcMemory: { personId: "mehmet", text: "Gelmediğim için yüzüme vurdu.", type: "needed_you_called_out" },
          flags: { toldMehmetHeVanished: true },
        },
      },
      {
        id: "keep_score",
        label: "İçine at, not düş",
        effects: {
          health: { stress: 5 },
          flags: { mehmetOwesAFavor: true },
          npcMemory: { personId: "mehmet", text: "O gün dönmedi, konu kapanmadı.", type: "needed_you_logged" },
        },
      },
    ],
  },
  {
    id: "life_mehmet_new_job",
    social3D: true,
    repeat: "once",
    title: "Maaş farkı",
    text: "Mehmet yeni işe girmiş. İlk mesajı kutlama değil: \"Yattı bu hafta, bir bakayım depozitoya.\" Senin kasa aynı.",
    condition: (state) => friendish(state, "mehmet") && state.time.absoluteWeek >= 14 && state.career.jobId !== null,
    choices: [
      {
        id: "congratulate",
        label: "İyi olmuş de, geç",
        effects: {
          social: { mehmet: { closeness: 3 } },
          npcMemory: { personId: "mehmet", text: "Yeni işimi kıskanmadan karşıladı.", type: "job_news_ok" },
        },
      },
      {
        id: "ask_in",
        label: "Benden de söz eder misin?",
        effects: {
          social: { mehmet: { tension: 3 } },
          flags: { askedMehmetForIn: true },
          npcMemory: { personId: "mehmet", text: "İşe girmemi istedi.", type: "asked_for_in" },
        },
      },
      {
        id: "go_quiet",
        label: "Bir şey yazma",
        effects: {
          social: { mehmet: { closeness: -4, tension: 5 } },
          npcMemory: { personId: "mehmet", text: "İyi haberi boş bıraktı.", type: "job_news_ignored" },
        },
      },
    ],
  },
  {
    id: "life_elif_weekend_alone",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 14,
    title: "Cumartesi boş",
    text: "Elif: \"Yarın dışarı çıkalım mı?\" Sen zaten yorgunsun. Mesaj üç saattir açık.",
    condition: (state) => elifBond(state) && state.time.absoluteWeek >= 8,
    choices: [
      {
        id: "go",
        label: "Çık, kısa tut",
        effects: {
          money: -220,
          health: { energy: -8, stress: -3 },
          social: { elif: { closeness: 5, tension: -3 } },
          npcMemory: { personId: "elif", text: "Yorgunken de geldi.", type: "weekend_showed" },
          reason: "Kısa çıkış",
        },
      },
      {
        id: "honest",
        label: "Bugün yokum de",
        effects: {
          social: { elif: { trust: 2, tension: 4 } },
          npcMemory: { personId: "elif", text: "Cumartesiyi açıkça reddetti.", type: "weekend_honest_no" },
        },
      },
      {
        id: "seen",
        label: "Görüldü bırak",
        effects: {
          social: { elif: { trust: -6, tension: 9 } },
          flags: { leftElifOnRead: true },
          npcMemory: { personId: "elif", text: "Mesajı gördü, yazmadı.", type: "weekend_seen" },
        },
      },
    ],
  },
  {
    id: "life_elif_shared_bill",
    social3D: true,
    repeat: "once",
    title: "Hesap bölünmedi",
    text: "İkiniz yediniz. Hesap 640. Elif telefonuna bakıyor. Garson bekliyor.",
    condition: (state) => elifBond(state) && state.time.absoluteWeek >= 9 && state.finances.balance >= 200,
    choices: [
      {
        id: "pay_all",
        label: "Hepsini kapat",
        effects: {
          money: -640,
          social: { elif: { closeness: 3, tension: 2 } },
          flags: { paidElifDinner: true },
          npcMemory: { personId: "elif", text: "Hesabı tek aldı.", type: "paid_whole_bill" },
          reason: "Akşam yemeği",
        },
      },
      {
        id: "split",
        label: "Bölelim de",
        effects: {
          money: -320,
          social: { elif: { trust: 1 } },
          npcMemory: { personId: "elif", text: "Hesabı böldük.", type: "split_bill" },
          reason: "Paylaşılan hesap",
        },
      },
      {
        id: "wait",
        label: "Bekle, o çıkarsın",
        effects: {
          social: { elif: { tension: 8, closeness: -3 } },
          health: { stress: 4 },
          npcMemory: { personId: "elif", text: "Hesapta sessiz kaldı.", type: "bill_staredown" },
        },
      },
    ],
  },
  {
    id: "life_anne_komsu_compare",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 18,
    title: "Komşunun oğlu",
    text: "Annen mutfakta: \"Üstteki çocuk bankaya girdi. Sen hâlâ aynı yerdesin.\"",
    condition: (state) =>
      state.household.homeId === "family" &&
      state.time.absoluteWeek >= 11 &&
      state.career.jobId !== null,
    choices: [
      {
        id: "deflect",
        label: "İşler öyle yürümüyor de",
        effects: {
          social: { anne: { tension: 5 } },
          health: { stress: 4 },
          npcMemory: { personId: "anne", text: "Komşu kıyasını savuşturdu.", type: "job_compare_deflect" },
        },
      },
      {
        id: "snap",
        label: "Kendi evimde bunları dinlemem",
        effects: {
          social: { anne: { closeness: -6, tension: 10 } },
          npcMemory: { personId: "anne", text: "Kıyaslayınca sesini yükseltti.", type: "job_compare_snap" },
        },
      },
      {
        id: "promise",
        label: "Bakıyorum, bu yaz toparlanır",
        effects: {
          social: { anne: { trust: -2, tension: 3 } },
          flags: { promisedAnneCareer: true },
          npcMemory: { personId: "anne", text: "İşi toparlayacağım dedi.", type: "job_compare_promise" },
        },
      },
    ],
  },
  {
    id: "life_anne_elif_dinner",
    social3D: true,
    repeat: "once",
    title: "Akşam yemeğine bir kişi",
    text: "Annen: \"Yarın evdeyiz. Şu arkadaşını da çağır, görelim.\" Elif'in adı geçmedi. Geçse daha kötü olabilir.",
    condition: (state) =>
      state.household.homeId === "family" &&
      elifBond(state) &&
      state.time.absoluteWeek >= 12,
    choices: [
      {
        id: "bring",
        label: "Elif'i çağır",
        effects: {
          social: { anne: { tension: 6 }, elif: { closeness: 4, trust: 3 } },
          flags: { familyMetElifDinner: true, familyKnowsElif: true },
          npcMemory: { personId: "elif", text: "Beni evine yemeğe aldı.", type: "met_family_dinner" },
          npcMemoryAnne: true,
        },
      },
      {
        id: "delay",
        label: "Henüz değil de",
        effects: {
          social: { anne: { tension: 4 }, elif: { tension: 3 } },
          flags: { hidElifFromDinner: true },
          npcMemory: { personId: "anne", text: "Arkadaşını eve getirmedi.", type: "hid_partner_dinner" },
        },
      },
      {
        id: "alone",
        label: "Yemeğe tek git",
        effects: {
          social: { anne: { closeness: 2 }, elif: { closeness: -2 } },
          npcMemory: { personId: "anne", text: "Yemeğe tek geldi.", type: "came_alone_dinner" },
        },
      },
    ],
  },
  {
    id: "life_baba_benzin",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Araba anahtarı",
    text: "Baban: \"Akşam alırsın. Depo yarım. Kendi işin için kullanıyorsan sen koyarsın.\"",
    condition: (state) => state.household.homeId === "family" && state.time.absoluteWeek >= 6,
    choices: [
      {
        id: "fill",
        label: "Doldur, konuşma",
        effects: {
          money: -900,
          social: { baba: { trust: 3, tension: -2 } },
          npcMemory: { personId: "baba", text: "Kullandığı gün depoyu doldurdu.", type: "filled_tank" },
          reason: "Benzin",
        },
      },
      {
        id: "half",
        label: "Bir miktar at",
        effects: {
          money: -350,
          social: { baba: { tension: 3 } },
          npcMemory: { personId: "baba", text: "Depoya az koydu.", type: "half_tank" },
          reason: "Benzin",
        },
      },
      {
        id: "refuse",
        label: "Binme",
        effects: {
          health: { energy: -6 },
          social: { baba: { closeness: -2 } },
          npcMemory: { personId: "baba", text: "Arabayı almadı.", type: "skipped_car" },
        },
      },
    ],
  },
  {
    id: "life_work_credit",
    social3D: true,
    repeat: "once",
    title: "İsim kaydı",
    text: "Toplantıda senin derlediğin liste başkasının ağzından çıktı. Müdür başını salladı. Senin adın geçmedi.",
    condition: (state) => state.career.jobId !== null && state.time.absoluteWeek >= 8,
    choices: [
      {
        id: "after",
        label: "Toplantı bitince söyle",
        effects: {
          health: { stress: 6 },
          flags: { claimedWorkCredit: true },
          memory: "Toplantıda adın geçmedi, sonra konuştun.",
        },
      },
      {
        id: "let_go",
        label: "Geç, notunu tut",
        effects: {
          health: { stress: 8 },
          flags: { swallowedWorkCredit: true },
          memory: "İşindeki listede adın yoktu, içine attın.",
        },
      },
      {
        id: "joke",
        label: "Orada şaka ile düzelt",
        effects: {
          health: { stress: 5 },
          flags: { jokedWorkCredit: true },
          memory: "Toplantıda şakayla kendi işini hatırlattın.",
        },
      },
    ],
  },
  {
    id: "life_saturday_shift",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 14,
    title: "Cumartesi yazısı",
    text: "İşten mesaj: \"Yarın bir kişi eksiğiz. Gelirsen iyi olur.\" Elif'le planın var mı yok mu, onlar sormadı.",
    condition: (state) => state.career.jobId !== null && state.time.absoluteWeek >= 6,
    choices: [
      {
        id: "go",
        label: "Git",
        effects: {
          money: 450,
          health: { energy: -10, stress: 4 },
          flags: { tookSaturdayShift: true },
          reason: "Cumartesi mesai",
          memory: "Cumartesi işe kaldın.",
        },
      },
      {
        id: "no",
        label: "Gelmem",
        effects: {
          flags: { refusedSaturdayShift: true },
          memory: "Cumartesi mesaiyi geri çevirdin.",
        },
      },
    ],
  },
  {
    id: "life_office_rumor",
    social3D: true,
    repeat: "once",
    title: "Çayda isim",
    text: "Çay ocağında sen yokken konuşulmuş. Dönünce konu kapanıyor. Biri: \"Bir şey yok, kadro işi.\"",
    condition: (state) => state.career.jobId !== null && state.time.absoluteWeek >= 13,
    choices: [
      {
        id: "ask",
        label: "Ne konuşuldu de",
        effects: {
          health: { stress: 7 },
          flags: { askedOfficeRumor: true },
          memory: "İş yerinde adının geçtiğini sordun.",
        },
      },
      {
        id: "ignore",
        label: "Çayı al, çık",
        effects: {
          health: { stress: 3 },
          flags: { ignoredOfficeRumor: true },
        },
      },
    ],
  },
  {
    id: "life_unexpected_bill",
    social3D: true,
    repeat: "once",
    title: "Kombi servisi",
    text: "Evde su sesi var. Annen: \"Servis 1.800 dedi, peşin. Sen de koyarsın.\"",
    condition: (state) =>
      state.household.homeId === "family" &&
      state.time.absoluteWeek >= 9 &&
      state.finances.balance >= 400,
    choices: [
      {
        id: "pay_share",
        label: "Payına düşeni ver",
        effects: {
          money: -900,
          social: { anne: { trust: 3 } },
          npcMemory: { personId: "anne", text: "Kombi için payını verdi.", type: "paid_boiler_share" },
          reason: "Kombi",
        },
      },
      {
        id: "pay_all",
        label: "Hepsini kapat, bitsin",
        effects: {
          money: -1800,
          social: { anne: { closeness: 4, trust: 2 } },
          npcMemory: { personId: "anne", text: "Kombiyi tek ödedi.", type: "paid_boiler_all" },
          reason: "Kombi",
        },
      },
      {
        id: "stall",
        label: "Bu hafta yok",
        effects: {
          social: { anne: { tension: 8, trust: -3 } },
          flags: { stalledBoilerBill: true },
          npcMemory: { personId: "anne", text: "Kombi parasını erteledi.", type: "stalled_boiler" },
        },
      },
    ],
  },
  {
    id: "life_meyhane_tab",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Masa uzadı",
    text: "Mehmet bir masa daha istedi. Hesap 1.100'e çıktı. Sabah işin var.",
    condition: (state) => friendish(state, "mehmet") && state.time.absoluteWeek >= 8 && state.finances.balance >= 300,
    choices: [
      {
        id: "stay",
        label: "Kal, hesabı böl",
        effects: {
          money: -550,
          health: { energy: -14, stress: -2 },
          social: { mehmet: { closeness: 4 } },
          flags: { lateNightWithMehmet: true },
          npcMemory: { personId: "mehmet", text: "Masa uzayınca kalktı.", type: "stayed_out_late" },
          reason: "Gece",
        },
      },
      {
        id: "leave",
        label: "Kalk, hesabını bırak",
        effects: {
          money: -400,
          social: { mehmet: { tension: 3 } },
          npcMemory: { personId: "mehmet", text: "Masa bitmeden kalktı.", type: "left_night_early" },
          reason: "Gece",
        },
      },
      {
        id: "cover",
        label: "Hepsini çek, çık",
        effects: {
          money: -1100,
          health: { energy: -8 },
          social: { mehmet: { closeness: 5, tension: -2 } },
          npcMemory: { personId: "mehmet", text: "Masanın hepsini ödedi.", type: "covered_tab" },
          reason: "Gece",
        },
      },
    ],
  },
  {
    id: "life_regret_text",
    social3D: true,
    repeat: "once",
    title: "Gece yarısı yazı",
    text: "01:20. Elif'e yarım cümle gönderdin. Silinmedi. Mavi tik yok daha.",
    condition: (state) =>
      elifBond(state) &&
      state.time.absoluteWeek >= 10 &&
      (state.flags.lateNightWithMehmet || state.health.stress >= 40),
    choices: [
      {
        id: "follow",
        label: "Düzeltmeye çalış",
        effects: {
          social: { elif: { tension: 6 } },
          flags: { sentRegretText: true },
          npcMemory: { personId: "elif", text: "Gece yarısı garip bir mesaj attı.", type: "regret_text" },
        },
      },
      {
        id: "leave",
        label: "Dokunma",
        effects: {
          health: { stress: 6 },
          flags: { leftRegretText: true },
          npcMemory: { personId: "elif", text: "Gece bir şey yazdı, üstüne gelmedi.", type: "regret_text_left" },
        },
      },
    ],
  },
  {
    id: "life_commitment_pace",
    social3D: true,
    repeat: "once",
    title: "Ne kadar ciddi",
    text: "Elif yürürken: \"Bunu ne sanıyorsun? Ben bir şey bekliyorum, sen beklemiyor olabilirsin.\"",
    condition: (state) => {
      const r = getRelationship(state, "elif");
      return r && r.romanceStatus === "partner" && state.time.absoluteWeek >= 16;
    },
    choices: [
      {
        id: "same",
        label: "Aynı yerdeyim de",
        effects: {
          social: { elif: { trust: 5, tension: -3 } },
          flags: { matchedElifPace: true },
          npcMemory: { personId: "elif", text: "Ciddiyeti kaçırmadı.", type: "pace_matched" },
        },
      },
      {
        id: "slow",
        label: "Acele etmeyelim",
        effects: {
          social: { elif: { trust: -3, tension: 8 } },
          flags: { slowedElifPace: true },
          npcMemory: { personId: "elif", text: "Ciddiyeti erteledi.", type: "pace_slowed" },
        },
      },
      {
        id: "dodge",
        label: "Şimdi değil",
        effects: {
          social: { elif: { trust: -5, tension: 10 } },
          flags: { dodgedElifPace: true },
          npcMemory: { personId: "elif", text: "Ciddi konuşmayı kaçırdı.", type: "pace_dodged" },
        },
      },
    ],
  },
  {
    id: "life_mehmet_secret",
    social3D: true,
    repeat: "once",
    title: "Bunu kimseye",
    text: "Mehmet kapıyı çekmeden: \"İşten çıkış konuşuluyor. Evde söyleme. Annen komşuya anlatır.\"",
    condition: (state) => friendish(state, "mehmet") && state.time.absoluteWeek >= 10,
    choices: [
      {
        id: "keep",
        label: "Tut",
        effects: {
          social: { mehmet: { trust: 5 } },
          flags: { keptMehmetJobSecret: true },
          npcMemory: { personId: "mehmet", text: "İş çıkışını evde söylemedi.", type: "kept_job_secret" },
        },
      },
      {
        id: "tell_anne",
        label: "Annen zaten soracak",
        effects: {
          social: { mehmet: { trust: -8, tension: 8 }, anne: { closeness: 2 } },
          flags: { leakedMehmetJobSecret: true },
          npcMemory: { personId: "mehmet", text: "Söylediğim şeyi evde konuştu.", type: "leaked_job_secret" },
        },
      },
      {
        id: "half",
        label: "İsim vermeden geçiştir",
        effects: {
          social: { mehmet: { trust: -2, tension: 4 } },
          npcMemory: { personId: "mehmet", text: "Sırrı yarım bıraktı.", type: "half_job_secret" },
        },
      },
    ],
  },
  {
    id: "life_elif_phone",
    social3D: true,
    repeat: "once",
    title: "Ekran açık kaldı",
    text: "Elif mutfakta. Telefonu masada, sohbet Mehmet'le açık. Son satır görünüyor: \"Ona söyleme.\"",
    condition: (state) => elifBond(state) && state.time.absoluteWeek >= 11,
    choices: [
      {
        id: "ask",
        label: "Ne söylemeyeyim de",
        effects: {
          social: { elif: { trust: -2, tension: 7 } },
          flags: { askedElifOpenChat: true },
          npcMemory: { personId: "elif", text: "Açık kalan sohbeti sordu.", type: "asked_open_chat" },
        },
      },
      {
        id: "leave",
        label: "Çevir, dokunma",
        effects: {
          social: { elif: { trust: 3 } },
          health: { stress: 4 },
          npcMemory: { personId: "elif", text: "Açık telefonu çevirdi.", type: "left_open_chat" },
        },
      },
      {
        id: "scroll",
        label: "Bir satır daha bak",
        effects: {
          social: { elif: { trust: -8, tension: 10 } },
          flags: { readElifChat: true },
          npcMemory: { personId: "elif", text: "Telefondaki sohbete bakmış.", type: "read_open_chat" },
        },
      },
    ],
  },
  {
    id: "life_work_mistake",
    social3D: true,
    repeat: "once",
    title: "Yanlış dosya",
    text: "Müşteriye giden mailde eski fiyat duruyor. Müdür fark etmeden: \"Bunu sen attın değil mi.\"",
    condition: (state) => state.career.jobId !== null && state.time.absoluteWeek >= 7,
    choices: [
      {
        id: "own",
        label: "Ben attım de",
        effects: {
          health: { stress: 7 },
          flags: { ownedWorkMistake: true },
          memory: "Yanlış fiyat mailini üstlendin.",
        },
      },
      {
        id: "share",
        label: "Beraber bakmıştık de",
        effects: {
          health: { stress: 5 },
          flags: { sharedWorkMistake: true },
          memory: "Yanlış maili ortak iş gibi anlattın.",
        },
      },
      {
        id: "fix",
        label: "Düzelt, sonra konuş",
        effects: {
          health: { energy: -6, stress: 4 },
          flags: { fixedWorkMistakeQuiet: true },
          memory: "Yanlış maili önce düzelttin.",
        },
      },
    ],
  },
  {
    id: "life_baba_ask_money",
    social3D: true,
    repeat: "once",
    title: "Kısa vadeli",
    text: "Baban televizyonu kapatmadan: \"Bu ay sıkıştım. 1.200. Bayrama kadar.\" Annen koridorda duruyor.",
    condition: (state) =>
      state.household.homeId === "family" &&
      state.time.absoluteWeek >= 12 &&
      state.finances.balance >= 600,
    choices: [
      {
        id: "give",
        label: "Ver, konuşma",
        effects: {
          money: -1200,
          social: { baba: { closeness: 4, trust: 2 } },
          npcMemory: { personId: "baba", text: "Sıkışınca 1.200 verdi.", type: "gave_baba_1200" },
          reason: "Baba",
        },
      },
      {
        id: "half",
        label: "Yarısını ver",
        effects: {
          money: -600,
          social: { baba: { tension: 4 } },
          npcMemory: { personId: "baba", text: "İstediğinin yarısını verdi.", type: "gave_baba_half" },
          reason: "Baba",
        },
      },
      {
        id: "no",
        label: "Bu ay yok",
        effects: {
          social: { baba: { closeness: -5, tension: 8, trust: -3 } },
          npcMemory: { personId: "baba", text: "Kısa vadeli isteği geri çevirdi.", type: "refused_baba_money" },
        },
      },
    ],
  },

  {
    id: "life_chn11_saturday_ask",
    social3D: true,
    repeat: "once",
    title: "Cumartesi kimde",
    text: "Elif: \"Yarın öğleden sonra boşalt. Bir yere gidelim.\" İş grubunda aynı gün için isim aranıyor.",
    condition: (state) =>
      elifBond(state) &&
      state.career.jobId !== null &&
      state.time.absoluteWeek >= 9 &&
      !state.flags.chn11Started,
    choices: [
      {
        id: "elif",
        label: "Elif'le kal",
        effects: {
          money: -180,
          social: { elif: { closeness: 6, trust: 3 } },
          flags: { chn11Started: true, chn11ChoseElif: true },
          npcMemory: { personId: "elif", text: "Cumartesiyi işe değil bana ayırdı.", type: "chn11_chose_elif" },
        },
      },
      {
        id: "work",
        label: "İşe yazıl",
        effects: {
          money: 450,
          social: { elif: { trust: -4, tension: 8 } },
          flags: { chn11Started: true, chn11ChoseWork: true },
          npcMemory: { personId: "elif", text: "Cumartesiyi işe verdi.", type: "chn11_chose_work" },
          reason: "Cumartesi mesai",
        },
      },
    ],
  },
  {
    id: "life_chn11_elif_waits",
    repeat: "once",
    title: "Mesaj yığını",
    text: "Elif akşam üç satır yazmış, sonra kesmiş: \"Tamam. İş tamam.\"",
    condition: () => false,
    choices: [
      {
        id: "call",
        label: "Ara",
        effects: {
          social: { elif: { trust: 2, tension: -2 } },
          npcMemory: { personId: "elif", text: "İşi seçtikten sonra aradı.", type: "chn11_called" },
        },
      },
      {
        id: "short",
        label: "\"Yorgunum\" yaz",
        effects: {
          social: { elif: { trust: -3, tension: 6 } },
          npcMemory: { personId: "elif", text: "İptalin üstüne kısa mesaj attı.", type: "chn11_short" },
        },
      },
    ],
  },
  {
    id: "life_chn11_elif_remembers",
    repeat: "once",
    title: "O cumartesi",
    text: "Elif, başka bir planı reddederken: \"Geçen de iş çıktı ya. Alıştım.\"",
    condition: () => false,
    choices: [
      {
        id: "own",
        label: "O günü üstlen",
        effects: {
          social: { elif: { trust: 4, tension: -4 } },
          npcMemory: { personId: "elif", text: "O cumartesiyi inkâr etmedi.", type: "chn11_owned" },
        },
      },
      {
        id: "rewrite",
        label: "Öyle hatırlamıyorum de",
        effects: {
          social: { elif: { trust: -8, tension: 10 } },
          npcMemory: { personId: "elif", text: "O cumartesiyi başka anlattı.", type: "chn11_rewrote" },
        },
      },
    ],
  },

  {
    id: "life_chn12_anne_asks",
    social3D: true,
    repeat: "once",
    title: "Bu kız ciddi mi",
    text: "Annen kapıyı aralık bırakmış: \"Bu Elif meselesi ne. Mahalle konuşuyor, sen konuşmuyorsun.\"",
    condition: (state) =>
      state.household.homeId === "family" &&
      elifBond(state) &&
      state.time.absoluteWeek >= 14 &&
      !state.flags.chn12Started,
    choices: [
      {
        id: "defend",
        label: "Ciddi, karışmayın",
        effects: {
          social: { anne: { tension: 8, trust: -2 }, elif: { trust: 4 } },
          flags: { chn12Started: true, chn12DefendedElif: true },
          npcMemory: { personId: "anne", text: "Kızı savundu.", type: "chn12_defended" },
        },
      },
      {
        id: "minimize",
        label: "Arkadaş, abartmayın",
        effects: {
          social: { anne: { tension: -2 }, elif: { trust: -6, tension: 8 } },
          flags: { chn12Started: true, chn12MinimizedElif: true },
          npcMemory: { personId: "anne", text: "Kızı küçülttü.", type: "chn12_minimized" },
        },
      },
    ],
  },
  {
    id: "life_chn12_elif_hears",
    repeat: "once",
    title: "Dolaylı cümle",
    text: "Elif: \"Annen birine arkadaşmışız demiş. Bana da öyle mi.\"",
    condition: () => false,
    choices: [
      {
        id: "admit",
        label: "Evde öyle konuştum",
        effects: {
          social: { elif: { trust: 3, tension: 6 } },
          npcMemory: { personId: "elif", text: "Aileye başka anlattığını kabul etti.", type: "chn12_admitted" },
        },
      },
      {
        id: "deny",
        label: "Öyle demedim",
        effects: {
          social: { elif: { trust: -7, tension: 11 } },
          flags: { chn12LiedToElif: true },
          npcMemory: { personId: "elif", text: "Aile cümlesini inkâr etti.", type: "chn12_denied" },
        },
      },
    ],
  },
  {
    id: "life_chn12_table",
    repeat: "once",
    title: "Masa sessiz",
    text: "Pazar sofrası. Annen Elif'e bakmıyor. Elif salatayı geçiriyor. Baban televizyonu açıyor.",
    condition: () => false,
    choices: [
      {
        id: "bridge",
        label: "Konuyu sen aç",
        effects: {
          health: { stress: 6 },
          social: { anne: { tension: -3 }, elif: { closeness: 3 } },
          npcMemory: { personId: "elif", text: "Sessiz sofrada arayı o kurdu.", type: "chn12_bridged" },
        },
      },
      {
        id: "endure",
        label: "Bitmesini bekle",
        effects: {
          health: { stress: 8 },
          social: { anne: { tension: 4 }, elif: { closeness: -4, tension: 6 } },
          npcMemory: { personId: "elif", text: "Sofrada kimseyi tutmadı.", type: "chn12_endured" },
        },
      },
    ],
  },

  {
    id: "life_chn13_night",
    social3D: true,
    repeat: "once",
    title: "Bir gece daha",
    text: "Mehmet: \"Bir yer daha.\" Saat 00:50. Sabah 08:00 iş. Elif'e 'erken yatacağım' demiştin.",
    condition: (state) =>
      friendish(state, "mehmet") &&
      state.career.jobId !== null &&
      state.time.absoluteWeek >= 8 &&
      !state.flags.chn13Started,
    choices: [
      {
        id: "stay",
        label: "Kal",
        effects: {
          money: -320,
          health: { energy: -16, stress: 6 },
          social: { mehmet: { closeness: 4 } },
          flags: { chn13Started: true, chn13StayedOut: true },
          npcMemory: { personId: "mehmet", text: "Sabah işi varken masada kaldı.", type: "chn13_stayed" },
          reason: "Gece",
        },
      },
      {
        id: "home",
        label: "Kalk",
        effects: {
          social: { mehmet: { tension: 2 } },
          flags: { chn13Started: true, chn13WentHome: true },
          npcMemory: { personId: "mehmet", text: "Gece yarısı kalktı.", type: "chn13_home" },
        },
      },
    ],
  },
  {
    id: "life_chn13_morning_work",
    repeat: "once",
    title: "Sabah yoklama",
    text: "İş yerinde ismin tahtada. Müdür bakmadan: \"Dün gece neredeydiniz, bugün buradasınız.\"",
    condition: () => false,
    choices: [
      {
        id: "own",
        label: "Geç kaldım de",
        effects: {
          health: { stress: 8 },
          flags: { chn13WorkMark: true },
          memory: "Gece dışarıda kalınca sabah işte görüldün.",
        },
      },
      {
        id: "cover",
        label: "Yol vardı de",
        effects: {
          health: { stress: 6 },
          flags: { chn13WorkLie: true },
          memory: "Sabah işte yol bahanesi uydurdun.",
        },
      },
    ],
  },
  {
    id: "life_chn13_elif_comment",
    repeat: "once",
    title: "Story saati",
    text: "Elif: \"Dün gece 1'de bir yerdeymişsin. Erken yatıyordun.\"",
    condition: () => false,
    choices: [
      {
        id: "true",
        label: "Mehmet'le kaldım",
        effects: {
          social: { elif: { trust: 3, tension: 5 } },
          npcMemory: { personId: "elif", text: "Geceyi saklamadı.", type: "chn13_told" },
        },
      },
      {
        id: "soft",
        label: "Erken dağıldık de",
        effects: {
          social: { elif: { trust: -6, tension: 9 } },
          flags: { chn13LiedToElif: true },
          npcMemory: { personId: "elif", text: "Geceyi yumuşattı.", type: "chn13_softened" },
        },
      },
    ],
  },

  {
    id: "life_chn14_promise",
    social3D: true,
    repeat: "once",
    title: "Pazar sözü",
    text: "Annen: \"Pazar günü dayına gideceğiz. Sen de var yazdım.\" Söz istemedi, yazdı.",
    condition: (state) =>
      state.household.homeId === "family" &&
      state.time.absoluteWeek >= 7 &&
      !state.flags.chn14Started,
    choices: [
      {
        id: "accept",
        label: "Olur",
        effects: {
          social: { anne: { closeness: 3 } },
          flags: { chn14Started: true, chn14Accepted: true },
          npcMemory: { personId: "anne", text: "Pazar dayıya geleceğini söyledi.", type: "chn14_accepted" },
        },
      },
      {
        id: "refuse",
        label: "Yazmasaydın",
        effects: {
          social: { anne: { tension: 7, closeness: -4 } },
          flags: { chn14Started: true, chn14Refused: true },
          npcMemory: { personId: "anne", text: "Pazar sözünü baştan reddetti.", type: "chn14_refused" },
        },
      },
    ],
  },
  {
    id: "life_chn14_due",
    repeat: "once",
    title: "Pazar sabahı",
    text: "Annen ayakkabıları çıkarmış. \"Hazır mısın.\" Sen uyanmış sayılmazsın.",
    condition: () => false,
    choices: [
      {
        id: "go",
        label: "Git",
        effects: {
          health: { energy: -8 },
          social: { anne: { trust: 6, tension: -4 } },
          flags: { chn14Went: true },
          npcMemory: { personId: "anne", text: "Pazar sözünü tuttu.", type: "chn14_went" },
        },
      },
      {
        id: "bail",
        label: "Başım ağrıyor de",
        effects: {
          social: { anne: { trust: -10, tension: 12 } },
          flags: { chn14Bailed: true },
          npcMemory: { personId: "anne", text: "Pazar sabahı vazgeçti.", type: "chn14_bailed" },
        },
      },
    ],
  },
  {
    id: "life_chn14_after",
    repeat: "once",
    title: "Dayının mesajı",
    text: "Annen telefonu uzatmadan: \"Dayın sordu, hasta mıydı. Ben bir şey demedim.\"",
    condition: () => false,
    choices: [
      {
        id: "call",
        label: "Dayını ara",
        effects: {
          social: { anne: { tension: -3 } },
          health: { stress: 3 },
          memory: "Pazar kaçınca dayını sen aradın.",
        },
      },
      {
        id: "leave",
        label: "Annen halletsin",
        effects: {
          social: { anne: { closeness: -5, tension: 6 } },
          memory: "Pazar kaçtı, dayıya sen dönmedin.",
        },
      },
    ],
  },
];

export function applyAdultLifeResolution(state, definition, choiceId) {
  const week = state.time.absoluteWeek;
  if (definition.id === "life_anne_elif_dinner" && choiceId === "bring") {
    const anne = state.people.find((p) => p.id === "anne");
    if (anne)
      anne.memories.push({
        id: `npc-anne-${week}-dinner`,
        type: "met_elif_dinner",
        week,
        year: state.time.year,
        text: "Kızı eve yemeğe getirdi.",
      });
  }

  if (definition.id === "life_chn11_saturday_ask" && choiceId === "work") {
    return { eventId: "life_chn11_elif_waits", dueWeek: week + 1, personId: "elif" };
  }
  if (definition.id === "life_chn11_elif_waits") {
    return { eventId: "life_chn11_elif_remembers", dueWeek: week + 8, personId: "elif" };
  }

  if (definition.id === "life_chn12_anne_asks" && choiceId === "minimize") {
    return { eventId: "life_chn12_elif_hears", dueWeek: week + 3, personId: "elif" };
  }
  if (definition.id === "life_chn12_anne_asks" && choiceId === "defend") {
    return { eventId: "life_chn12_table", dueWeek: week + 6, personId: "anne" };
  }
  if (definition.id === "life_chn12_elif_hears") {
    return { eventId: "life_chn12_table", dueWeek: week + 4, personId: "anne" };
  }

  if (definition.id === "life_chn13_night" && choiceId === "stay") {
    return { eventId: "life_chn13_morning_work", dueWeek: week + 1, personId: "mehmet" };
  }
  if (definition.id === "life_chn13_morning_work" && state.flags.chn13StayedOut && elifBond(state)) {
    return { eventId: "life_chn13_elif_comment", dueWeek: week + 2, personId: "elif" };
  }

  if (definition.id === "life_chn14_promise" && choiceId === "accept") {
    return { eventId: "life_chn14_due", dueWeek: week + 2, personId: "anne" };
  }
  if (definition.id === "life_chn14_due" && choiceId === "bail") {
    return { eventId: "life_chn14_after", dueWeek: week + 1, personId: "anne" };
  }
  return null;
}
