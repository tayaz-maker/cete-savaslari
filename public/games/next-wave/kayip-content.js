/** Kayıp Telefon — Wave 3 content expansion. Catalog only; deduction math stays frozen. */
const pair = (tr, en) => [tr, en];

const ev = (id, app, title, text, extra = {}) => ({
  id,
  app,
  title,
  text,
  pressure: extra.pressure ?? 4,
  tags: extra.tags || [],
  ...extra,
});

export const CONTACT_VOICES = {
  c_leyla: {
    bio: pair("Küçük kız kardeş. Aileye köprü. Cümleleri kısa, nokta yok.", "Younger sister. The family's bridge. Short lines, no periods."),
    lastContact: pair("dün 19:02", "yesterday 19:02"),
    voice: pair("küçük harf, endişeli, soru üstüne soru", "lowercase, worried, question after question"),
  },
  c_emre: {
    bio: pair("İş hattı. İmza ve saat konuşur. Türkçe klavye bozuk.", "Work line. Talks in signatures and hours. Broken Turkish keyboard."),
    lastContact: pair("bugün 14:02", "today 14:02"),
    voice: pair("iş-typo, eksik nokta, acele", "work-typos, missing dots, rushed"),
  },
  c_ali: {
    bio: pair("Eski ev arkadaşı. Emir cümlesi. Emoji yok.", "Old housemate. Imperatives. No emoji."),
    lastContact: pair("cuma 22:41", "Friday 22:41"),
    voice: pair("kısa emir, kapalı, sil bunu", "short commands, closed, delete this"),
  },
  c_seda: {
    bio: pair("Eski ilişki. Cümleleri tam. Soğuk nokta.", "Former relationship. Complete sentences. Cold periods."),
    lastContact: pair("12 gün önce", "12 days ago"),
    voice: pair("tam cümle, soğuk, emoji yok", "complete, cold, no emoji"),
  },
  c_mert: {
    bio: pair("Kuzen. Nakit ve 'abi'. Anneden saklanan şeyler.", "Cousin. Cash and 'abi'. Things kept from mum."),
    lastContact: pair("çarşamba 11:17", "Wednesday 11:17"),
    voice: pair("abi, nakit, lâubali", "abi, cash, casual"),
  },
  c_naz: {
    bio: pair("Yeni isim. Rehber notu kısa. Fotoğraf istemiyor.", "A new name. Short contact note. Does not want photos."),
    lastContact: pair("dün 20:51", "yesterday 20:51"),
    voice: pair("dikkatli, tam cümle, emoji yok", "careful, complete, no emoji"),
  },
  c_bank: {
    bio: pair("Otomatik bildirim. Şablon. İnsan yok.", "Automated alert. Template. No human."),
    lastContact: pair("dün 09:11", "yesterday 09:11"),
    voice: pair("BANKA şablonu, büyük harf, alıcı yok", "BANK template, caps, no payee"),
  },
  c_eczane: {
    bio: pair("Nöbetçi hat. Stok ve saat. Soru sormaz.", "Night pharmacy line. Stock and hours. Asks nothing."),
    lastContact: pair("dün 23:40", "yesterday 23:40"),
    voice: pair("kısa servis, reçete, son gün", "short service, prescription, last day"),
  },
  c_patron: {
    bio: pair("Üst. Toplantı saati kaymaz. Mail dışarı çıkmaz.", "Superior. Meeting time does not slide. Mail does not leave."),
    lastContact: pair("bugün 08:41", "today 08:41"),
    voice: pair("resmi, noktalı, sizli", "formal, punctuated, formal you"),
  },
};

export function withContactVoices(contacts) {
  return contacts.map((contact) => {
    const voice = CONTACT_VOICES[contact.id];
    return voice ? { ...contact, ...voice, id: contact.id, name: contact.name } : contact;
  });
}

export const EXCLUSIVE_PAIRS = {
  payee: ["file_receipt_2400", "photo_mert_atm"],
  nazcal: ["cal_naz_rename", "cal_naz_private"],
  nightphoto: ["photo_naz_table", "photo_cafe_crop"],
  aliday: ["cal_ali_lie", "note_ali_times"],
  naznote: ["contact_naz_work", "note_naz_job"],
  locker: ["note_lockers", "cal_bus_gate"],
};

export const EXTRA_PATHS = {
  "planned-departure": [["note_pack", "cal_pack"], ["photo_otogar_board", "cal_bus"]],
  "naz-meeting": [["photo_naz_table", "cal_naz"], ["call_naz_missed", "photo_cafe"]],
  "work-pressure": [["note_whistle", "file_mail_fwd"], ["call_hakan_second", "file_pdf"]],
  "family-unaware": [["note_draft_leyla", "call_mom_home"], ["msg_leyla_seen", "photo_bag"]],
  "ali-timeline-lie": [["cal_ali_lie", "voice_2"], ["note_ali_times", "deleted_ali"]],
};

export const EXTRA_SECRET_EVIDENCE = {
  debt: ["note_payday", "call_mert", "file_receipt_2400", "photo_mert_atm"],
  relationship: ["note_seda_unsent", "photo_keyring", "call_seda_old"],
  work: ["note_whistle", "file_mail_fwd", "call_hakan_second"],
  health: ["note_prescription", "cal_blood", "voice_self_note"],
  account: ["note_alias", "photo_screenshot_bank", "msg_unknown_hi"],
};

export const SIDE_SECRET_ROUTES = {
  debt: [["note_debt", "bank_sms"], ["note_payday", "call_mert"], ["voice_3", "file_receipt_2400"]],
  relationship: [["deleted_draft", "photo_key"], ["note_seda_unsent", "call_seda_old"], ["voice_1", "photo_keyring"]],
  work: [["file_pdf", "cal_work"], ["note_whistle", "file_mail_fwd"], ["call_hakan_second", "call_patron"]],
  health: [["cal_clinic", "photo_eczane"], ["note_prescription", "cal_blood"], ["voice_self_note", "photo_eczane_bag"]],
  account: [["file_chat", "contact_naz_note"], ["note_alias", "msg_unknown_hi"], ["photo_screenshot_bank", "call_unknown"]],
};

export const SIDE_SECRET_STAGES = {
  debt: { 1: ["note_payday"], 2: ["call_mert", "msg_mert_split"], 3: ["file_receipt_2400", "photo_mert_atm"] },
  relationship: { 1: ["deleted_draft"], 2: ["note_seda_unsent", "photo_keyring"], 3: ["call_seda_old", "voice_1"] },
  work: { 1: ["file_pdf"], 2: ["note_whistle", "file_mail_fwd"], 3: ["call_hakan_second"] },
  health: { 1: ["cal_clinic"], 2: ["note_prescription", "cal_blood"], 3: ["voice_self_note", "photo_eczane"] },
  account: { 1: ["call_unknown"], 2: ["msg_unknown_hi", "note_alias"], 3: ["photo_screenshot_bank", "file_chat"] },
};

export const ALTERNATE_THREADS = [
  { id: "leyla-silence", items: ["msg_leyla_seen", "note_draft_leyla", "call_mom_home"] },
  { id: "emre-mail", items: ["msg_emre_typo", "file_mail_fwd", "msg_emre_imza"] },
  { id: "ali-delete-ping", items: ["msg_ali_delete", "cal_ali_lie", "note_ali_times"] },
  { id: "seda-boxes", items: ["msg_seda_read", "note_seda_unsent", "photo_keyring"] },
  { id: "mert-atm", items: ["msg_mert_split", "call_mert", "photo_mert_atm"] },
  { id: "naz-cafe-silence", items: ["msg_naz_late", "call_naz_missed", "photo_naz_table"] },
  { id: "hakan-second", items: ["msg_hakan_fwd", "call_hakan_second", "note_whistle"] },
  { id: "bank-2400", items: ["msg_bank_fee", "file_receipt_2400", "photo_iban_blur"] },
  { id: "eczane-lastday", items: ["msg_eczane_muadil", "note_prescription", "photo_eczane_bag"] },
  { id: "unknown-hello", items: ["msg_unknown_hi", "note_alias", "call_unknown_2"] },
  { id: "otogar-locker", items: ["note_lockers", "photo_otogar_board", "cal_pack"] },
  { id: "empty-chair", items: ["msg_leyla_table", "photo_leyla_empty", "note_mom_bday"] },
];

export const MISDIRECT_IDS = [
  "photo_ticket_crop", "photo_night_bus", "call_unknown_2", "photo_keyring",
  "cal_deleted_lunch", "file_resume", "photo_ali_door", "msg_ali_where",
  "photo_iban_blur", "cal_naz_rename", "voice_1", "note_gym",
  "file_pdf_old_name", "photo_screenshot_map", "msg_bank_fee",
];

export const EXTRA_MOVABLE = {
  msg_leyla_seen: ["messages", "notes"],
  note_pack: ["notes", "files"],
  photo_otogar_board: ["photos", "files"],
  call_naz_missed: ["calls", "messages"],
  file_mail_fwd: ["files", "messages"],
  voice_self_note: ["voice", "notes"],
  msg_unknown_hi: ["messages", "calls"],
  note_alias: ["notes", "contacts"],
  cal_pack: ["calendar", "notes"],
  photo_screenshot_bank: ["photos", "files"],
};

export const EXTRA_DISCOVERABLES = [
  ev("msg_leyla_seen", "messages", pair("Leyla: görüldü, yanıt yok", "Leyla: seen, no reply"), pair("Mavi tik var. Cümle yok. Aile hâlâ masada bekliyor gibi.", "Blue ticks. No sentence. The family still seems to be waiting at the table."), { tags: ["family"], corroborates: ["clue_0"] }),
  ev("msg_leyla_taxi", "messages", pair("Leyla: taksi tutayim mi", "Leyla: should I get a taxi"), pair("küçük harf. soru. 'sen gelmiyosan ben geleyim' diye bitmemiş.", "lowercase. a question. 'if you're not coming I'll come' never finished."), { tags: ["family", "daily"] }),
  ev("msg_leyla_table", "messages", pair("Leyla: masa kuruldu", "Leyla: the table is set"), pair("senin tabak duruyo. annem kaldırmadı. yazmasan da duruyo.", "your plate is still there. mum didn't clear it. it stays even if you don't write."), { tags: ["family", "daily"] }),
  ev("msg_emre_typo", "messages", pair("Emre: müsteri 16yı bekliyo", "Emre: client waiting at 16"), pair("Sonra düzeltme: 'müşteri. 16:00. imza.' Üç ayrı balon. Acele.", "Then a correction: 'client. 16:00. signature.' Three bubbles. Rush."), { tags: ["work"], corroborates: ["t2"] }),
  ev("msg_emre_imza", "messages", pair("Emre: imza hani", "Emre: where's the signature"), pair("'atmadan cıkarma' yazmış, ı harfi yok. Sonra 'lütfen.' tek başına.", "'don't leave without signing' — missing ı. Then a lone 'please.'"), { tags: ["work"] }),
  ev("msg_ali_delete", "messages", pair("Ali: sildin mi", "Ali: did you delete it"), pair("Soru işareti yok. Emir gibi soru. 'sil bunu'dan 11 dk sonra.", "No question mark. A question that is an order. 11 minutes after 'delete this'."), { tags: ["ali"], corroborates: ["t3"] }),
  ev("msg_ali_where", "messages", pair("Ali: neredeyiz", "Ali: where are we"), pair("Birlikteymiş gibi duruyor. Adres mesajındaki 'aynı değil' ile sürtünüyor.", "Reads as if they are together. Rubs against the 'not the same address' line."), { tags: ["ali", "misdirect"], contradicts: ["t3"] }),
  ev("msg_seda_read", "messages", pair("Seda: okundu, sessizlik", "Seda: read, then silence"), pair("'Konuşacak bir şey yok'un altı boş. İki gün. Çizgi çekilmiş gibi.", "Nothing under 'there is nothing to talk about'. Two days. As if a line was drawn."), { tags: ["seda"] }),
  ev("msg_mert_split", "messages", pair("Mert: yarısını atayim", "Mert: I'll send half"), pair("abi küçük. rakam yok. 'annene söyleme' hâlâ üstte duruyor.", "abi is small. no number. 'don't tell your mum' is still sitting above it."), { tags: ["mert", "money"], corroborates: ["t5"] }),
  ev("msg_mert_annene", "messages", pair("Mert: ha söyleme diyorum", "Mert: I mean don't tell her"), pair("Aynı uyarı ikinci kez. Birinci şaka, ikinci değil.", "The same warning a second time. The first was a joke, the second is not."), { tags: ["mert"] }),
  ev("msg_naz_late", "messages", pair("Naz: geç kaldım galiba", "Naz: I may be late"), pair("Galiba. Emoji yok. 'kafede kimse olmasın' hâlâ silinmemiş.", "Maybe. No emoji. 'nobody at the cafe' is still not deleted."), { tags: ["naz"] }),
  ev("msg_naz_noname", "messages", pair("Naz: isim yazma", "Naz: don't write the name"), pair("Sohbete isim yok. Rehber notundaki 'iş değil' ile aynı terbiye.", "No name in the chat. The same care as the contact note 'not work'."), { tags: ["naz"], corroborates: ["contact_naz_note"] }),
  ev("msg_hakan_fwd", "messages", pair("Hakan Bey: bu maili taşımayın", "Mr Hakan: do not move this mail"), pair("Nokta var. Siz var. 'dışarı' kelimesi ayrı satırda.", "A period. Formal you. The word 'outside' sits on its own line."), { tags: ["work"], corroborates: ["t7"] }),
  ev("msg_bank_fee", "messages", pair("Banka: işlem ücreti 2,90", "Bank: fee 2.90"), pair("Şablon. 2.400'ün yanında cüce. Alıcı yine yok. Günlük gürültü gibi duruyor.", "Template. Tiny next to 2,400. Still no payee. Looks like daily noise."), { tags: ["money", "daily", "misdirect"] }),
  ev("msg_unknown_hi", "messages", pair("Bilinmeyen: merhaba", "Unknown: hello"), pair("'mrb abim müsait misiniz' — banka değil. Rehberde yok. Sahte hesap kokusu.", "'hi bro you free' — not the bank. Not in contacts. Smells like a false account."), { tags: ["unknown", "account"] }),
  ev("msg_eczane_muadil", "messages", pair("Eczane: muadil var onay?", "Pharmacy: generic available, ok?"), pair("Kısa servis. Reçete adı yok. 'son 1 gün' hâlâ üstte.", "Short service. No drug name. 'last 1 day' still sits above."), { tags: ["body", "daily"] }),

  ev("note_pack", "notes", pair("Not: çanta listesi", "Note: bag list"), pair("şarj. yedek çorap. bilet. diş fırçası yok. 'dönüş' satırı boş bırakılmış.", "charger. spare socks. ticket. no toothbrush. the 'return' line left blank."), { tags: ["travel"] }),
  ev("note_whistle", "notes", pair("Not: mail taslağı — İK", "Note: mail draft — HR"), pair("'bu sözleşmeyi görmem istendi' diye başlamış. Gönderilmemiş. İmza yok.", "Starts 'I was asked to see this contract'. Unsent. No signature."), { tags: ["work", "draft"] }),
  ev("note_draft_leyla", "notes", pair("Taslak: Leyla'ya", "Draft: to Leyla"), pair("'anne panik olmasın. bir iş. dönerim' — silinmiş, geri alınmış, yine duruyor.", "'don't let mum panic. a job. I'll be back' — deleted, undone, still there."), { tags: ["family", "draft"], contradicts: ["photo_ticket"] }),
  ev("note_payday", "notes", pair("Not: maaş günü hesap", "Note: payday arithmetic"), pair("4.500 bir yana. 2.400 bir yana. Kalan kira gibi durmuyor.", "4,500 on one side. 2,400 on the other. The remainder does not look like rent."), { tags: ["mert", "money"] }),
  ev("note_seda_unsent", "notes", pair("Taslak: Seda, uzun", "Draft: Seda, long"), pair("'özür'den sonra üç paragraf. Hiçbiri gönderilmemiş. Son satır: 'anahtar sende kalsın'.", "Three paragraphs after 'sorry'. None sent. Last line: 'keep the key'."), { tags: ["seda", "draft"] }),
  ev("note_prescription", "notes", pair("Not: eczane kuyruğu", "Note: pharmacy queue"), pair("ilaç adı yarım. doz yok. 'anneme söyleme' ayrı satır — Mert'in cümlesi değil, aynı refleks.", "drug name half-written. no dose. 'don't tell mum' on its own line — not Mert's sentence, the same reflex."), { tags: ["body"] }),
  ev("note_alias", "notes", pair("Not: ikinci isim", "Note: second name"), pair("Bir kullanıcı adı. Foto yok. 'Naz değil' diye bir çizik, sonra karalanmış.", "A username. No photo. A scratch that said 'not Naz', then scribbled out."), { tags: ["unknown", "account", "misdirect"], contradicts: ["contact_naz_note"] }),
  ev("note_ali_times", "notes", pair("Not: cuma / cmt", "Note: Fri / Sat"), pair("iki saat, iki gün, bir soru işareti. Ali'nin mesajındaki kesin dil burada yok.", "two hours, two days, one question mark. Ali's certain tone is not here."), { tags: ["ali"], exclusive: "aliday", branch: "note", corroborates: ["voice_2"] }),
  ev("note_naz_job", "notes", pair("Not: Naz — iş yazma", "Note: Naz — don't write work"), pair("Rehber notunun kopyası gibi. 'iş değil' tekrar. Aile cümlesi yok.", "Like a copy of the contact note. 'not work' again. No family sentence."), { tags: ["naz"], exclusive: "naznote", branch: "note" }),
  ev("note_shopping", "notes", pair("Not: süt, ekmek, sigara", "Note: milk, bread, cigarettes"), pair("Günlük liste. Bilet yok. Çanta yok. Hayat devam etmiş gibi duruyor.", "A daily list. No ticket. No bag. As if life was still continuing."), { tags: ["daily"] }),
  ev("note_wifi", "notes", pair("Not: cafe şifresi", "Note: cafe wifi"), pair("Moda. 8 haneli. İsim yok. Takvimdeki 21:00 ile aynı semt.", "Moda. 8 characters. No name. Same neighbourhood as the 21:00 calendar."), { tags: ["naz", "daily"] }),
  ev("note_bus_gate", "notes", pair("Not: peron 12", "Note: gate 12"), pair("kalemle. bilet fotoğrafındaki kalkışla aynı gün. dönüş peronu yok.", "in pencil. same day as the ticket photo. no return gate."), { tags: ["travel"] }),
  ev("note_mom_bday", "notes", pair("Not: anne doğum günü", "Note: mum's birthday"), pair("tarih gelecek hafta. hediye satırı boş. aile hâlâ bir masa bekliyor.", "date is next week. gift line empty. the family is still waiting for a table."), { tags: ["family", "daily"] }),
  ev("note_rent", "notes", pair("Not: kira 15", "Note: rent on the 15th"), pair("IBAN ev sahibi. 2.400 değil. Ayrı dünya.", "Landlord IBAN. Not 2,400. A different world."), { tags: ["money", "daily"] }),
  ev("note_gym", "notes", pair("Not: salonu iptal", "Note: cancel the gym"), pair("ayın sonu. kaçış değil, aidat. Yanlış yere plan gibi durabilir.", "end of the month. not an escape, a fee. Can look like a plan in the wrong place."), { tags: ["daily", "misdirect"] }),
  ev("note_taxi_plate", "notes", pair("Not: plaka 34", "Note: plate 34"), pair("gece. tek satır. 'iskele' yazılmış, silinmiş.", "night. one line. 'pier' written, then erased."), { tags: ["naz", "daily"] }),
  ev("note_pack_weight", "notes", pair("Not: çanta tartı", "Note: bag weight"), pair("12 kg. spor çantası fotoğrafıyla uyumlu. Dönüş için boşluk yok.", "12 kg. matches the sports-bag photo. No room for a return."), { tags: ["travel"] }),
  ev("note_hakan_slot", "notes", pair("Not: 09:30 kaydırma", "Note: 09:30 slide"), pair("'kaydırma' diye yazmış Hakan. Burada 'kaydırırım' diye bir çizik var.", "Hakan wrote 'do not slide'. Here a scratch says 'I'll slide it'."), { tags: ["work"], contradicts: ["t7"] }),
  ev("note_naz_time", "notes", pair("Not: 21 sonra 23?", "Note: 21 then 23?"), pair("Takvim 21:00. Foto 23:14. Soru burada, cevap yok.", "Calendar 21:00. Photo 23:14. The question lives here, no answer."), { tags: ["naz"], contradicts: ["cal_naz"] }),
  ev("note_self_sorry", "notes", pair("Not: özür — kime?", "Note: sorry — to whom?"), pair("tek kelime. Seda taslağı değil. Nokta yok. İsim yok.", "one word. not the Seda draft. no period. no name."), { tags: ["daily", "draft"] }),
  ev("note_lockers", "notes", pair("Not: emanet 408", "Note: locker 408"), pair("otogar. şifre değil, numara. peron notuyla aynı gün. kardeş satır bu run'da yok.", "station. not a password, a number. same day as the gate note. its sibling line is absent this run."), { tags: ["travel"], exclusive: "locker", branch: "note" }),
  ev("note_blood_fasting", "notes", pair("Not: aç gel", "Note: come fasting"), pair("perşembe 09:30 diş değil. kan. Aile takviminde yok.", "Thursday 09:30 is not the dentist. blood. not on the family calendar."), { tags: ["body"] }),
  ev("note_seda_key", "notes", pair("Not: yedek anahtar", "Note: spare key"), pair("'Seda bıraktı' — fotoğraftaki kapı önüyle aynı cümle, daha yorgun.", "'Seda left it' — the same sentence as the doorstep photo, more tired."), { tags: ["seda"] }),
  ev("note_work_hours", "notes", pair("Not: mesai 19:40", "Note: overtime 19:40"), pair("teslim 16:00'dan sonra. Ofis boşalmış. Mail hâlâ duruyor.", "after the 16:00 deadline. office emptied. the mail is still sitting there."), { tags: ["work", "daily"] }),
  ev("note_deleted_list", "notes", pair("Not: silinecekler", "Note: to delete"), pair("ali cmt. naz foto. banka sms. liste yarım. silinmemiş.", "ali sat. naz photo. bank sms. list half-done. not deleted."), { tags: ["ali", "naz"] }),
  ev("note_charger", "notes", pair("Not: şarj otogarda", "Note: charger at the station"), pair("unutulmuş gibi. ya da bırakılmış. çanta listesinde şarj zaten var.", "as if forgotten. or left. the bag list already has a charger."), { tags: ["travel", "daily"] }),
  ev("note_alarm", "notes", pair("Not: 05:40 alarm", "Note: 05:40 alarm"), pair("otogar 06:20. beş dakika pay. Dönüş alarmı yok.", "station 06:20. five minutes slack. no return alarm."), { tags: ["travel", "daily"] }),
  ev("note_receipt_blur", "notes", pair("Not: 2400 kime", "Note: 2400 to whom"), pair("soru. cevap yok. IBAN satırı Naz'ı gösteriyor, ATM fotoğrafı başka yere bakıyor.", "a question. no answer. the IBAN line points at Naz, the ATM photo looks elsewhere."), { tags: ["money", "naz", "misdirect"] }),
  ev("note_pnr", "notes", pair("Not: PNR kenar", "Note: PNR margin"), pair("üç harf, dört rakam. bilet fotoğrafının kenarı. dönüş kodu yok.", "three letters, four digits. the ticket photo's margin. no return code."), { tags: ["travel", "draft"] }),
  ev("note_empty_plate", "notes", pair("Not: tabak duruyor", "Note: the plate is still there"), pair("Leyla'ya yazılmamış. 'söyleyeceğim' diye bir satır, üstü çizili.", "not written to Leyla. a line that said 'I'll tell her', struck through."), { tags: ["family", "draft"] }),

  ev("photo_otogar_board", "photos", pair("Foto: sefer panosu", "Photo: departure board"), pair("06:20 satırı işaretli. Dönüş saati kadraj dışında. Bilet fotoğrafıyla aynı gün.", "06:20 line marked. return time out of frame. same day as the ticket photo."), { tags: ["travel"], corroborates: ["photo_ticket"], when: pair("05:51", "05:51"), where: pair("Harem otogar", "Harem station") }),
  ev("photo_naz_table", "photos", pair("Foto: iki fincan, Moda", "Photo: two cups, Moda"), pair("İsim yok. Yüz yok. Saat 21:40. Takvim 21:00 demişti. Kırpılmış kare, gece karesi değil.", "No name. No face. 21:40. The calendar said 21:00. A cropped frame, not the late-night one."), { tags: ["naz"], exclusive: "nightphoto", branch: "table", corroborates: ["cal_naz"], when: pair("21:40", "21:40"), where: pair("Moda", "Moda") }),
  ev("photo_cafe_crop", "photos", pair("Foto: masa kenarı kırpık", "Photo: cropped table edge"), pair("İskele 23:14 karesinin kardeşi. Bu run'da gece karesi duruyor, iki fincan durmuyor.", "Sibling of the 23:14 pier frame. This run keeps the night crop, not the two cups."), { tags: ["naz"], exclusive: "nightphoto", branch: "crop", contradicts: ["cal_naz"], when: pair("23:14", "23:14"), where: pair("Kadıköy iskele", "Kadıköy pier") }),
  ev("photo_mert_atm", "photos", pair("Foto: ATM fişi, Mert", "Photo: ATM slip, Mert"), pair("2.400. Alıcı buradan kuzen gibi duruyor. IBAN notundaki Naz ile aynı anda durmaz.", "2,400. From here the payee looks like the cousin. Does not sit beside the Naz IBAN note."), { tags: ["mert", "money"], exclusive: "payee", branch: "atm", when: pair("çarşamba 11:21", "Wednesday 11:21"), where: pair("Ümraniye", "Ümraniye") }),
  ev("photo_keyring", "photos", pair("Foto: iki anahtar, tek halka", "Photo: two keys, one ring"), pair("Seda'nın 'anahtarı bıraktım'ı. Birlikte yaşıyorlarmış gibi durabilir. Kapı önü karesinden ayrı.", "Seda's 'I left the key'. Can look as if they still live together. Separate from the doorstep frame."), { tags: ["seda", "misdirect"], corroborates: ["t4"], when: pair("12 gün önce", "12 days ago") }),
  ev("photo_screenshot_bank", "photos", pair("Ekran: hesap adı uyuşmuyor", "Screen: account name mismatch"), pair("Görünen isim rehberdeki hiçbirine benzemiyor. Sahte hesap izi. Naz değil.", "The visible name matches nobody in the contacts. A false-account trace. Not Naz."), { tags: ["account", "unknown"], when: pair("dün 09:12", "yesterday 09:12") }),
  ev("photo_bag_open", "photos", pair("Foto: çanta içi", "Photo: bag interior"), pair("spor çanta açık. bilet köşesi görünüyor. diş fırçası yok. dönüş yok.", "sports bag open. ticket corner visible. no toothbrush. no return."), { tags: ["travel"], corroborates: ["photo_bag"] }),
  ev("photo_bus_seat", "photos", pair("Foto: koltuk 17", "Photo: seat 17"), pair("boş koltuk. perde inik. tarih yok. prova gibi durabilir.", "empty seat. curtain down. no date. can look like a rehearsal."), { tags: ["travel", "daily"] }),
  ev("photo_moda_rain", "photos", pair("Foto: yağmur, Moda", "Photo: rain, Moda"), pair("ışık erken. 21:00 değil. Yanlış geceye bağlanabilir.", "early light. not 21:00. can be pinned to the wrong night."), { tags: ["naz", "daily", "misdirect"] }),
  ev("photo_desk_late", "photos", pair("Foto: masa, 19:44", "Photo: desk, 19:44"), pair("sözleşme taslağı kadrajda. kahve soğumuş. teslim saati geçmiş.", "contract draft in frame. coffee cold. deadline gone."), { tags: ["work", "daily"], corroborates: ["file_pdf"], when: pair("19:44", "19:44") }),
  ev("photo_eczane_bag", "photos", pair("Foto: eczane poşeti", "Photo: pharmacy bag"), pair("kuyruk karesinden ayrı. etiket okunaksız. aileye götürülmemiş gibi.", "separate from the queue frame. label unreadable. as if it never went to the family."), { tags: ["body"] }),
  ev("photo_ticket_crop", "photos", pair("Foto: bilet kırpığı", "Photo: ticket crop"), pair("saat görünüyor, yön okunaksız. dönüş bileti sanılabilir. tam kare başka yerde.", "the hour is visible, the direction is not. can be read as a return ticket. the full frame lives elsewhere."), { tags: ["travel", "misdirect"], contradicts: ["photo_ticket"] }),
  ev("photo_ali_door", "photos", pair("Foto: kapı, zil silik", "Photo: door, bell worn"), pair("Ali'nin binası gibi durabilir. Numara yok. Gece. Yanlış adrese bağlanır.", "Can look like Ali's building. No number. Night. Pins to the wrong address."), { tags: ["ali", "misdirect"] }),
  ev("photo_leyla_empty", "photos", pair("Foto: boş sandalye", "Photo: empty chair"), pair("aile masası. tabak duruyor. Leyla'nın 'masa kuruldu'su ile aynı oda gibi.", "family table. plate waiting. same room as Leyla's 'the table is set'."), { tags: ["family"], corroborates: ["msg_leyla_table"] }),
  ev("photo_iban_blur", "photos", pair("Foto: IBAN bulanık", "Photo: IBAN blurred"), pair("Naz yazısı okunuyor, rakamlar değil. 2.400'ü ona bağlamak kolay, kanıt değil.", "the word Naz is readable, the digits are not. easy to pin 2,400 on her, not proof."), { tags: ["money", "naz", "misdirect"] }),
  ev("photo_night_bus", "photos", pair("Foto: gece otogar", "Photo: station at night"), pair("06:20 değil. önceki bir sefer gibi duruyor. 'çoktan gitti' yanılgısı.", "not 06:20. looks like an earlier trip. the 'already gone' misread."), { tags: ["travel", "misdirect"], contradicts: ["cal_bus"] }),
  ev("photo_screenshot_map", "photos", pair("Ekran: konum geçmişi", "Screen: location history"), pair("Moda 21:12, iskele 23:09. Takvim tek saat göstermişti. Harita dosyasından ayrı kare.", "Moda 21:12, pier 23:09. the calendar showed one hour. a separate frame from the map file."), { tags: ["naz"], contradicts: ["cal_naz"] }),
  ev("photo_whiteboard", "photos", pair("Foto: ofis tahtası", "Photo: office board"), pair("'teslim 16:00' ve bir isim silinmiş. Emre'nin saati. Kaçan değil, sıkışan.", "'deadline 16:00' and a name erased. Emre's hour. not a flight — a squeeze."), { tags: ["work"], corroborates: ["cal_work"] }),
  ev("photo_plant", "photos", pair("Foto: pencere önü saksı", "Photo: pot at the window"), pair("sulama notu yok. ev hâlâ duruyor. kaçış stüdyo fotoğrafı değil.", "no watering note. the flat is still there. not a flight-studio shot."), { tags: ["daily"] }),
  ev("photo_receipt_tear", "photos", pair("Foto: yırtık fiş", "Photo: torn slip"), pair("2400'ün son iki hanesi. kime ait olduğu yırtıkta kalmış.", "the last two digits of 2400. who it belongs to stayed in the tear."), { tags: ["money", "misdirect"] }),

  ev("call_naz_missed", "calls", pair("Cevapsız: Naz, 21:06", "Missed: Naz, 21:06"), pair("Bir çalma. Açılmamış. Takvim 21:00. Fotoğraf daha geç.", "One ring. not answered. calendar 21:00. the photo is later."), { tags: ["naz"], corroborates: ["cal_naz"], contradicts: ["photo_cafe"], when: pair("21:06", "21:06"), duration: pair("cevapsız", "missed") }),
  ev("call_mom_home", "calls", pair("Cevapsız: Ev, 19:40", "Missed: Home, 19:40"), pair("Rehberde 'Ev'. Leyla değil, ev hattı. Aile hâlâ arıyor, plan yok.", "Saved as 'Home'. not Leyla, the house line. family still calling, no plan."), { tags: ["family"], corroborates: ["call_leyla"], when: pair("19:40", "19:40"), duration: pair("cevapsız", "missed") }),
  ev("call_mert", "calls", pair("Mert, 11:18, 41 sn", "Mert, 11:18, 41s"), pair("ATM saatinden hemen önce. 'abi' sesi notta yok, sürede var.", "just before the ATM hour. the 'abi' voice is not in a note, it is in the duration."), { tags: ["mert", "money"], when: pair("11:18", "11:18"), duration: pair("41 sn", "41s") }),
  ev("call_seda_old", "calls", pair("Seda, 12 gün önce, 6 sn", "Seda, 12 days ago, 6s"), pair("Açılmış gibi. Konuşulmamış gibi. Taslaktaki özür gitmemiş.", "looks answered. sounds unsaid. the sorry in the draft never left."), { tags: ["seda"], when: pair("12 gün önce", "12 days ago"), duration: pair("6 sn", "6s") }),
  ev("call_hakan_second", "calls", pair("Hakan Bey, 09:02, 22 sn", "Mr Hakan, 09:02, 22s"), pair("08:41 açılmamıştı. İkinci arama kısa. Mail yasağı bu aradan sonra.", "08:41 was missed. the second call is short. the mail ban comes after this gap."), { tags: ["work"], corroborates: ["call_patron"], when: pair("09:02", "09:02"), duration: pair("22 sn", "22s") }),
  ev("call_unknown_2", "calls", pair("Gizli numara, 02:14", "Private number, 02:14"), pair("02:11'in kardeşi. Üç dakika. Rehberde yok. Tehdit gibi durur, spam da olabilir.", "sibling of 02:11. three minutes. not in contacts. looks like a threat, may be spam."), { tags: ["unknown", "misdirect"], corroborates: ["call_unknown"] }),
  ev("call_leyla_morning", "calls", pair("Leyla, 08:03, cevapsız", "Leyla, 08:03, missed"), pair("×4 listesinin dışında beşinci. Sabah. 'yemege gelmicen' henüz yazılmamış.", "a fifth outside the ×4 list. morning. 'you're not coming to dinner' not yet written."), { tags: ["family", "daily"] }),

  ev("cal_pack", "calendar", pair("Takvim: çanta 22:00", "Calendar: bag at 22:00"), pair("Dün gece. Tekrar etmiyor. Otogar 06:20'den önce. Dönüş yok.", "last night. does not repeat. before the 06:20 station. no return."), { tags: ["travel"], corroborates: ["photo_bag"] }),
  ev("cal_ali_lie", "calendar", pair("Takvim: Ali — cuma 23:00", "Calendar: Ali — Friday 23:00"), pair("Ali mesajda cumartesi demişti. Takvim cuma diyor. İkisi birden doğru olamaz.", "Ali's message said Saturday. the calendar says Friday. both cannot be true."), { tags: ["ali"], exclusive: "aliday", branch: "cal", contradicts: ["t3"] }),
  ev("cal_blood", "calendar", pair("Takvim: laboratuvar 09:10", "Calendar: lab 09:10"), pair("Diş 09:30'un on dakika öncesi. Aynı sabah, ayrı kapı. Aile yok.", "ten minutes before the dentist at 09:30. same morning, different door. no family."), { tags: ["body"], corroborates: ["cal_clinic"] }),
  ev("cal_naz_rename", "calendar", pair("Takvim: 'iş' diye kaydedilmiş", "Calendar: saved as 'work'"), pair("Başlık değişmiş. Naz adı yok. Gizli görüşme iş gibi durabilir.", "title changed. Naz's name gone. a private meeting can look like work."), { tags: ["naz", "misdirect"], exclusive: "nazcal", branch: "rename" }),
  ev("cal_naz_private", "calendar", pair("Takvim: özel — Moda", "Calendar: private — Moda"), pair("İsim yok, semt var. 21:00. Kardeş başlık bu run'da durmuyor.", "no name, a neighbourhood. 21:00. the sibling title does not sit in this run."), { tags: ["naz"], exclusive: "nazcal", branch: "private", corroborates: ["cal_naz"] }),
  ev("cal_deleted_lunch", "calendar", pair("Takvim: silindi — aile öğle", "Calendar: deleted — family lunch"), pair("Başlık duruyor, saat yok. Aileyi kestiler sanılabilir. Taşınmış öğle de olabilir.", "title remains, no hour. can look like they cut the family. may just be a moved lunch."), { tags: ["family", "misdirect", "daily"] }),
  ev("cal_bus_gate", "calendar", pair("Takvim: peron 12, 06:05", "Calendar: gate 12, 06:05"), pair("otogar 06:20'den önce. emanet notu bu run'da yok. aynı lojistik, başka kâğıt.", "before the 06:20 station. the locker note is absent this run. same logistics, another slip."), { tags: ["travel"], exclusive: "locker", branch: "cal", corroborates: ["cal_bus"] }),

  ev("file_mail_fwd", "files", pair("Dosya: iletilmiş mail", "File: forwarded mail"), pair("Emre 'iletme' demişti. Yerelde bir iletim taslağı var. Dışarı çıkmamış.", "Emre said do not forward. a forward draft sits locally. it did not leave."), { tags: ["work"], corroborates: ["file_pdf"], contradicts: ["t2"] }),
  ev("file_receipt_2400", "files", pair("PDF: 2.400 dekont", "PDF: 2,400 receipt"), pair("Alıcı satırı bu kopyada dolu: bir şahıs adı, Naz değil. ATM karesiyle aynı anda durmaz.", "payee line filled on this copy: a personal name, not Naz. does not sit with the ATM frame."), { tags: ["money"], exclusive: "payee", branch: "file" }),
  ev("file_resume", "files", pair("Dosya: güncellenmiş CV", "File: updated CV"), pair("tarih geçen ay. ani kaçış gibi durabilir. iş başvurusu da olabilir.", "dated last month. can look like a sudden flight. may just be a job application."), { tags: ["work", "misdirect", "daily"] }),
  ev("file_pdf_old_name", "files", pair("PDF: eski tarihli ad", "PDF: old dated filename"), pair("dosya adı 2024. içerik bu haftanın teslimi. saat çelişkisi, içerik aynı.", "filename 2024. contents are this week's deadline. a time mismatch, same content."), { tags: ["work"], contradicts: ["cal_work"] }),
  ev("file_screenshot_chat", "files", pair("Dosya: sohbet ekranı", "File: chat screenshot"), pair("Naz hattı. silinmiş satır 'saat kaydı' diye bitiyor. dışa aktarımdan ayrı kare.", "Naz's line. a deleted row ends on 'hour record'. a separate frame from the export."), { tags: ["naz"], corroborates: ["file_chat"] }),
  ev("file_map_night", "files", pair("Konum: 23:09 iskele", "Location: 23:09 pier"), pair("takvim 21:00. foto 23:14. bu kayıt ikisinin arasında. aralık hâlâ açık.", "calendar 21:00. photo 23:14. this pin sits between. the gap is still open."), { tags: ["naz"], contradicts: ["cal_naz"] }),

  ev("voice_self_note", "voice", pair("Ses: kendi kendine, 7 sn", "Voice: to self, 7s"), pair("'perşembe aç gel' — eczane kuyruğu değil, laboratuvar. isim yok.", "'Thursday come fasting' — not the pharmacy queue, the lab. no name."), { tags: ["body"], duration: pair("7 sn", "7s") }),
  ev("voice_bus_announce", "voice", pair("Ses: peron anonsu", "Voice: gate announcement"), pair("06:something. şehir adı kesik. bilet fotoğrafını doğrular, yönü değil.", "06:something. city name cut. confirms the ticket photo, not the direction."), { tags: ["travel"], corroborates: ["cal_bus"] }),
  ev("voice_hakan_hold", "voice", pair("Ses: santral müziği, 9 sn", "Voice: hold music, 9s"), pair("Hakan hattı gibi. Konuşma yok. Baskı, kanıt değil.", "sounds like Hakan's line. no speech. pressure, not proof."), { tags: ["work"] }),
  ev("voice_mert_abi", "voice", pair("Ses: 'abi bak'", "Voice: 'abi look'"), pair("Mert. nakit cümlesi yarım. 'annene' diye başlıyor, kesiliyor.", "Mert. cash sentence half-done. starts 'to your mum', then cuts."), { tags: ["mert"], corroborates: ["t5"] }),
  ev("voice_leyla_kitchen", "voice", pair("Ses: mutfak, Leyla", "Voice: kitchen, Leyla"), pair("tabak sesi. 'geliyo musun' küçük harf gibi duruyor. cevap yok.", "plate noise. 'are you coming' sounds like lowercase. no answer."), { tags: ["family", "daily"] }),

  ev("contact_naz_work", "contacts", pair("Naz — not: iş yazma", "Naz — note: don't write work"), pair("Rehber kartının kardeş cümlesi. 'iş değil' yerine yasak. Aynı sır, başka etiket.", "sibling sentence of the contact card. a ban instead of 'not work'. same secret, other label."), { tags: ["naz"], exclusive: "naznote", branch: "contact" }),
  ev("contact_ali_note", "contacts", pair("Ali — not: cuma?", "Ali — note: Friday?"), pair("Soru işareti rehberde. Mesajda yok. Zaman yalanı burada şüphe, orada emir.", "a question mark in contacts. none in the messages. the timeline lie is a doubt here, an order there."), { tags: ["ali"], corroborates: ["note_pin"], contradicts: ["t3"] }),
];

export const MESSAGE_HEADS = {
  t1: [
    pair("nerdesin ya", "where are you ya"),
    pair("Dün de aradım. Müsait olunca dön.", "Called yesterday too. Call when free."),
    pair("annem yine sordu", "mum asked again"),
    pair("yemege gelmicen dimi. cevap versene", "you're not coming to dinner are you. just answer"),
    pair("telefonun cekmiyo belki ama bildirim gidiyo", "maybe no signal but the delivery goes through"),
    pair("lütfen bi ses ver", "please just a sound"),
  ],
  t2: [
    pair("dosya mailde", "file's in the mail"),
    pair("müşteri 16:00ı bekliyo", "client waiting at 16:00"),
    pair("Toplantı saati yine değişti.", "The meeting time changed again."),
    pair("imza atmadan cıkarma lütfen", "dont leave without signing please"),
    pair("bu maili İLETME", "do NOT forward this mail"),
    pair("hakan sordu. cevap verdim. sen verme.", "hakan asked. I answered. you don't."),
  ],
  t3: [
    pair("bunu kimse bilmemeli", "nobody should know this"),
    pair("cuma değil cumartesi", "not Friday Saturday"),
    pair("adres aynı değil. yazma.", "address is not the same. don't write it."),
    pair("sil bunu.", "delete this."),
    pair("saat değişti. soru sorma.", "the hour changed. don't ask."),
    pair("görüşürüz. telden değil.", "we'll talk. not on the phone."),
  ],
  t4: [
    pair("Anahtarı bıraktım.", "I left the key."),
    pair("Kutular sende kalsın. İstemiyorum.", "Keep the boxes. I don't want them."),
    pair("Konuşacak bir şey yok.", "There is nothing to talk about."),
    pair("Kapıya not bıraktım. Okursun.", "I left a note at the door. You'll read it."),
    pair("Numaramı kaydetmene gerek yok artık.", "You don't need to keep my number anymore."),
    pair("İyi yolculuklar. Cümle değil, kapanış.", "Safe travels. Not a sentence. A closing."),
  ],
  t5: [
    pair("abi nakit lazım", "abi I need cash"),
    pair("çarşamba netleşir inş", "Wednesday it becomes clear inş"),
    pair("annene söyleme ha", "don't tell your mum ha"),
    pair("atmdeyim. 5 dk.", "at the atm. 5 min."),
    pair("o 2400 ayrı. karıştırma.", "that 2400 is separate. don't mix them."),
    pair("abi bak bu sefer net", "abi look this time it's clear"),
  ],
  t6: [
    pair("Geldin mi.", "Are you here."),
    pair("Kafede kimse olmasın.", "Nobody at the cafe."),
    pair("Foto atma. Lütfen.", "Don't send a photo. Please."),
    pair("Saat kaydı. 21 değil.", "Hour record. Not 21."),
    pair("İsim yazma sohbete.", "Don't write the name in the chat."),
    pair("Bittiğinde silersin.", "You delete it when it's done."),
  ],
  t7: [
    pair("Toplantı 09:30. Kaydırmayın.", "Meeting 09:30. Do not slide it."),
    pair("Müşteri bekler. Siz de bekleyin.", "The client waits. So do you."),
    pair("Bu maili dışarı taşımayın.", "Do not carry this mail outside."),
    pair("İmza eksik görünüyor.", "The signature appears to be missing."),
    pair("Bugün ofiste olmanızı bekliyorum.", "I expect you in the office today."),
    pair("Konu kapanmadı. Yarın 09:30.", "The matter is not closed. Tomorrow 09:30."),
  ],
  t8: [
    pair("ilac hazır", "medicine ready"),
    pair("son 1 gün", "last 1 day"),
    pair("reçete bekliyor", "prescription waiting"),
    pair("nöbetçi kapanış 00:00", "night desk closes 00:00"),
    pair("muadil var. onay?", "generic in stock. ok?"),
    pair("stok bitti, yarına", "out of stock, tomorrow"),
  ],
};

export const THREAD_EXTRAS = {
  t1: [
    { text: pair("okumuşsun ya", "you saw it ya") },
    { text: pair("görüldü · yanıt yok", "seen · no reply"), sys: true },
    { text: pair("taksi tutayim mi", "should I get a taxi"), variants: [0, 1, 2] },
    { text: pair("masa kurduk senin için", "we set a place for you"), variants: [2, 3, 4] },
    { text: pair("abiyle konuşma. bana yaz.", "don't talk to him. write to me."), variants: [1, 5] },
    { text: pair("saat 9u geçti", "it's past 9") },
    { text: pair("annem sordu yine. ne diyim", "mum asked again. what do I say"), variants: [0, 3, 5] },
    { text: pair("yemeği kaldırıyorlar", "they're clearing the food"), variants: [3, 4] },
    { text: pair("cekmiyosa bile bi tik bırak", "even if there's no signal leave a tick"), variants: [4, 5] },
    { text: pair("lütfen", "please") },
  ],
  t2: [
    { text: pair("müsteri bekliyo. nokta.", "client waiting. period.") },
    { text: pair("düzeltme: müşteri. 16:00.", "correction: client. 16:00."), variants: [0, 1, 3] },
    { text: pair("imza atmadan cıkarma", "dont leave without signing") },
    { text: pair("bu maili iletme. büyük harf etmiyorum, ciddili.", "don't forward this mail. I'm not shouting, I'm serious."), variants: [2, 4, 5] },
    { text: pair("hakan 08:41 aramış. sen açmadın.", "hakan called 08:41. you didn't pick up."), variants: [4, 5] },
    { text: pair("teslim bugün. yarın değil.", "delivery today. not tomorrow.") },
    { text: pair("klavye bozuk kusura bakma", "keyboard's broken sorry"), variants: [0, 2] },
    { text: pair("pdf yerelde duruyor dimi", "the pdf is local right"), variants: [1, 3, 4] },
    { text: pair("görüldü", "seen"), sys: true },
    { text: pair("cevap yoksa ben kapatamam bu işi", "if there's no answer I can't close this") },
  ],
  t3: [
    { text: pair("sil bunu", "delete this") },
    { text: pair("sildin mi", "did you delete it"), variants: [0, 3, 4] },
    { text: pair("cuma değil.", "not Friday."), variants: [1, 2] },
    { text: pair("adres yazma. harita da atma.", "don't write the address. don't send a map either."), variants: [2, 5] },
    { text: pair("telden konuşmayalım.", "let's not talk on the phone.") },
    { text: pair("saat değişti", "the hour changed"), variants: [4, 5] },
    { text: pair("kimseye söyleme. leyla dahil.", "tell no one. including leyla."), variants: [0, 1] },
    { text: pair("mesaj silindi", "message deleted"), sys: true },
    { text: pair("neredeyiz", "where are we"), variants: [2, 5] },
    { text: pair("tamam.", "ok.") },
  ],
  t4: [
    { text: pair("Kutular sende kalsın.", "Keep the boxes.") },
    { text: pair("Anahtarı kapının sağına bıraktım.", "I left the key to the right of the door."), variants: [0, 3] },
    { text: pair("Okundu", "Read"), sys: true },
    { text: pair("İki gündür yazmıyorum. Bu da bir cevap.", "I have not written in two days. That is also an answer."), variants: [2, 4] },
    { text: pair("Özür beklemene gerek yok.", "You do not need to wait for an apology."), variants: [1, 5] },
    { text: pair("Numaramı kaydetmene gerek yok.", "You do not need to save my number.") },
    { text: pair("Yolun açıksa açsın.", "If the road is open, let it be."), variants: [4, 5] },
    { text: pair("Konuşacak bir şey yok.", "There is nothing to talk about.") },
    { text: pair("İyi akşamlar.", "Good evening."), variants: [0, 2, 3] },
  ],
  t5: [
    { text: pair("abi nakit", "abi cash") },
    { text: pair("4.5 değil ha. ayrı.", "not 4.5 ha. separate."), variants: [0, 4] },
    { text: pair("atmdeyim", "at the atm"), variants: [3, 4, 5] },
    { text: pair("annene söyleme. cidden.", "don't tell your mum. seriously.") },
    { text: pair("çarşamba netleşir", "Wednesday it becomes clear") },
    { text: pair("yarısını atayim mi", "should I send half"), variants: [0, 1, 5] },
    { text: pair("o 2400 karışmasın", "don't mix that 2400"), variants: [4, 5] },
    { text: pair("ses kaydı geldi dimi kusura bakma", "the voice note arrived right sorry"), variants: [2, 3] },
    { text: pair("abi?", "abi?"), variants: [1, 5] },
    { text: pair("görüldü", "seen"), sys: true },
  ],
  t6: [
    { text: pair("Geldin mi.", "Are you here.") },
    { text: pair("Kafede kimse yok şimdilik.", "Nobody at the cafe for now."), variants: [1, 2] },
    { text: pair("Foto atma.", "Don't send a photo.") },
    { text: pair("Saat 21 değil.", "The hour is not 21."), variants: [3, 4] },
    { text: pair("İsim yazma.", "Don't write the name.") },
    { text: pair("Geç kaldım galiba.", "I may be late."), variants: [0, 5] },
    { text: pair("Bittiğinde silersin.", "You delete it when it's done.") },
    { text: pair("Konum atma.", "Don't send a location."), variants: [1, 3] },
    { text: pair("görüldü · yanıt gecikti", "seen · reply delayed"), sys: true },
    { text: pair("Tamam.", "Alright."), variants: [2, 4, 5] },
  ],
  t7: [
    { text: pair("Toplantı kaymıyor.", "The meeting is not sliding.") },
    { text: pair("Müşteri bekler.", "The client waits.") },
    { text: pair("Bu maili dışarı taşımayın.", "Do not carry this mail outside.") },
    { text: pair("İmza eksik görünüyor.", "The signature appears to be missing."), variants: [3, 4] },
    { text: pair("08:41 sizi aradım.", "I called you at 08:41."), variants: [0, 5] },
    { text: pair("Bugün ofiste olun.", "Be in the office today."), variants: [4, 5] },
    { text: pair("Konu kapanmadı.", "The matter is not closed.") },
    { text: pair("Yarın 09:30.", "Tomorrow 09:30."), variants: [2, 5] },
    { text: pair("iletilmedi", "not delivered"), sys: true, variants: [1, 3] },
  ],
  t8: [
    { text: pair("ilac hazır", "medicine ready") },
    { text: pair("son 1 gün", "last 1 day") },
    { text: pair("muadil var. onay?", "generic in stock. ok?"), variants: [0, 4] },
    { text: pair("reçete bekliyor", "prescription waiting"), variants: [2, 3] },
    { text: pair("nöbetçi 00:00 kapanır", "night desk closes 00:00"), variants: [3, 5] },
    { text: pair("stok bitti", "out of stock"), variants: [5] },
    { text: pair("adı yazmayın lütfen", "please don't write the name"), variants: [1, 4] },
    { text: pair("teslim alındı", "picked up"), sys: true, variants: [0, 2] },
  ],
};

export const ITEM_VARIANTS = {
  photo_cafe: [
    { text: pair("Tarih, takvimdeki 'Naz 21:00' ile uyuşmuyor.", "The time does not match the calendar's 'Naz 21:00'.") },
    { text: pair("Işık gece. Saat 23:14. Takvim 21:00 demişti.", "Night light. 23:14. The calendar had said 21:00.") },
    { text: pair("Kadıköy iskele. İki siluet. Yüz yok. Saat geç.", "Kadıköy pier. Two silhouettes. No faces. The hour is late.") },
  ],
  cal_naz: [
    { text: pair("Not yok. Tekrar etmiyor.", "No note. It does not repeat.") },
    { text: pair("Tek satır. 21:00 Moda. Başka hafta yok.", "One line. 21:00 Moda. No other week.") },
    { text: pair("Başlık kısa. Alarm kapalı. Kimseye hatırlatılmamış.", "Short title. Alarm off. Nobody was reminded.") },
  ],
  photo_ticket: [
    { text: pair("Tarih yarın. İsim telefon sahibi.", "Date is tomorrow. The name is the phone's owner.") },
    { text: pair("Tek yön. PNR kısa. Dönüş hanesi boş.", "One way. Short PNR. Return field empty.") },
    { text: pair("Peron okunaksız. Tarih yarın. İsim var, yüz yok.", "Gate unreadable. Date tomorrow. A name, no face.") },
  ],
  file_pdf: [
    { text: pair("Emre'nin 'iletme' dediği dosya yerelde duruyor.", "The file Emre said not to forward is sitting locally.") },
    { text: pair("Sözleşme taslağı. Filigran 'KOPYALAMA'. Mail kuyruğunda değil.", "Contract draft. watermark 'DO NOT COPY'. not in the mail queue.") },
    { text: pair("İmza sayfası boş. Teslim 16:00 notu kenarda.", "Signature page empty. a 16:00 deadline note in the margin.") },
  ],
  voice_2: [
    { text: pair("Ali'nin mesajıyla çelişir — o cumartesi demişti.", "Contradicts Ali's message — he had said Saturday.") },
    { text: pair("Kendi sesi değil. 'cuma' kelimesi net. Mesaj cumartesi diyor.", "Not their own voice. the word 'Friday' is clear. the message says Saturday.") },
    { text: pair("12 saniyeden uzun. 'cumartesi değil' diye kesiliyor.", "Longer than 12 seconds. it cuts on 'not Saturday'.") },
  ],
  clue_0: [
    { text: pair("Yemek saatine gelmemiş. Aile arıyor.", "Did not arrive for dinner. The family is calling.") },
    { text: pair("Leyla'nın son balonu açık. Masa bekliyor.", "Leyla's last bubble is open. The table is waiting.") },
    { text: pair("Kız kardeş kısa yazmış. Anne arkada duruyor.", "The sister wrote short. The mother is standing behind it.") },
  ],
  bank_sms: [
    { text: pair("Alıcı adı yok. Mert'in tutarı değil.", "No payee name. Not Mert's amount.") },
    { text: pair("2.400 TL. Şablon. IBAN notu başka bir isme bakıyor.", "2,400 TL. Template. the IBAN note looks at another name.") },
    { text: pair("Outgoing. Saat 09:11. ATM fişi ayrı bir yerde olabilir.", "Outgoing. 09:11. an ATM slip may live somewhere else.") },
  ],
  photo_bag: [
    { text: pair("Şehir dışına çıkış planı?", "A plan to leave the city?") },
    { text: pair("Spor çanta. Otogar zemini. Dönüş eşyası yok.", "Sports bag. station floor. no return things.") },
    { text: pair("Fermuar açık. Bilet köşesi kadrajda olabilir.", "Zip open. a ticket corner may be in frame.") },
  ],
  deleted_ali: [
    { text: pair("Ses kaydıyla aynı cümle.", "The same sentence as the voice note.") },
    { text: pair("Silinmiş balon. 'cuma değil' hâlâ gölgede duruyor.", "Deleted bubble. 'not Friday' still sits in the shadow.") },
    { text: pair("Geri getirilmiş taslak. Ali'nin emri tam değil.", "A restored draft. Ali's order is not complete.") },
  ],
  call_leyla: [
    { text: pair("Son 36 saatte dört arama, hiç açılmamış.", "Four calls in 36 hours, none picked up.") },
    { text: pair("×4. Hepsi akşam. Sabah beşincisi ayrı listede.", "×4. all evening. a fifth in the morning sits on another list.") },
    { text: pair("Cevapsız kuyruğu. Aile, iş değil.", "A missed-call queue. family, not work.") },
  ],
  note_debt: [
    { text: pair("Tarih yok. Mesajdaki nakit isteğiyle aynı kişi.", "No date. the same person as the cash ask in the messages.") },
    { text: pair("4.500. Mert. 2.400 ayrı satırda durmuyor, durması gerekirdi.", "4,500. Mert. 2,400 does not sit on a separate line, and it should.") },
    { text: pair("Kuzen borcu. Anneden saklanan şeylerin listesi değil, tek satır.", "Cousin debt. not a list of things hidden from mum — one line.") },
  ],
  contact_naz_note: [
    { text: pair("Rehber notu kısa. Aileye anlatılmamış.", "Short contact note. not told to the family.") },
    { text: pair("'iş değil' — üç harf gibi duruyor, üç hayat gibi.", "'not work' — looks like three letters, feels like three lives.") },
    { text: pair("Yeni isim, eski not yok. Aile rehberinde bu kart yok.", "A new name, no old note. this card is not in the family book.") },
  ],
};

const FACT_TRACE = {
  "planned-departure": pair("Bilet, saat ve çanta aynı yöne bakıyor. Ayrılık rastgele durmuyor.", "Ticket, hour and bag face the same way. The departure does not look random."),
  "naz-meeting": pair("Naz hattı iş gibi durmuyor. Saatler kayıyor, isim yazılmıyor.", "Naz's line does not read as work. Hours slip, names are not written."),
  "work-pressure": pair("Teslim saati, iletilmemiş mail, ikinci arama. Ofis bırakılmış gibi.", "Deadline, unsent mail, a second call. The office looks left behind."),
  "family-unaware": pair("Masa kurulmuş. Ev aramış. Plan evde yok.", "The table was set. Home called. The plan is not in the house."),
  "ali-timeline-lie": pair("Ali'nin günü mesajda bir, takvimde başka. Silinen cümle sesle aynı.", "Ali's day is one thing in the message, another on the calendar. The deleted line matches the voice."),
};

const MISSED_TRACE = {
  "planned-departure": pair("Çıkış planı yarım kaldı. Bilet ve saat bir araya gelmedi.", "The exit plan stayed half-built. Ticket and hour never met."),
  "naz-meeting": pair("Naz hattı açık duruyor, bağlanmadı. Saat çelişkisi tartılmadı.", "Naz's line stayed open and unjoined. The hour clash was not weighed."),
  "work-pressure": pair("Ofis baskısı dosyada iz bıraktı, rapora girmedi.", "Office pressure left a trace in the file and did not enter the report."),
  "family-unaware": pair("Aile hâlâ masada. Bu dosyada yoklar.", "The family is still at the table. They are not in this file."),
  "ali-timeline-lie": pair("Ali'nin saati yoklanmadı. Yalan da korunma da açık duruyor.", "Ali's hour was not tested. Lie and protection both remain open."),
};

const SECRET_TRACE = {
  debt: pair("Nakit hattı ayrı duruyor. 2.400 bir yere, 4.500 başka yere bakıyor.", "The cash line sits apart. 2,400 looks one way, 4,500 another."),
  relationship: pair("Seda kapanmış bir kapı. Anahtar duruyor, cümle durmuyor.", "Seda is a closed door. The key remains, the sentence does not."),
  work: pair("İş sırrı mailde. İletilmemiş, silinmemiş.", "The work secret is in the mail. Not forwarded, not deleted."),
  health: pair("Reçete ve laboratuvar aile takviminde yok. Beden sessiz tutulmuş.", "Prescription and lab are not on the family calendar. The body was kept quiet."),
  account: pair("Rehberde olmayan bir isim var. Naz değil. Sahte hesap izi.", "There is a name that is not in the contacts. Not Naz. A false-account trace."),
};

const ENDING_TRACE = {
  minimal: pair("Kilit yoklanmadan iade. Bilgi az, karışma yok.", "Returned before the lock was tested. Little known, nothing entangled."),
  thorough: pair("Yeterince görüldü. Her şey dökülmedi. Müdahale bilinçli kaldı.", "Enough was seen. Not everything was poured out. The intervention stayed conscious."),
  witness: pair("Çelişkiler okundu, özel dosyaya girilmedi. Tek cümle yeter.", "The contradictions were read, the intimate files were not. One sentence is enough."),
  family: pair("Seyahat ve suskunluk aileye yeter. Şifreye ve kimliğe dokunulmadı.", "Travel and silence are enough for the family. Password and ID were not touched."),
  reckless: pair("Derin inildi. Bilgi sende. Sonuç başkasında.", "You went deep. The knowledge is yours. The consequence is someone else's."),
};

const DECISION_TRACE = {
  return: pair("Karar: sessiz iade.", "Decision: quiet return."),
  "warn-family": pair("Karar: aileyi uyar.", "Decision: warn the family."),
  "accuse-ali": pair("Karar: Ali'yi işaretle.", "Decision: point at Ali."),
  expose: pair("Karar: bulunanları aç.", "Decision: open what was found."),
  protect: pair("Karar: gerçeği sakla.", "Decision: keep the truth."),
};

const SEED_NOTES = [
  pair("Kadıköy hattı bu dosyada daha uzun duruyor.", "The Kadıköy line sits longer in this file."),
  pair("Moda ışığı bu kopyada erken kesiliyor.", "Moda light cuts early in this copy."),
  pair("Otogar sabahı bu tohumda daha net.", "The station morning is clearer in this seed."),
];

export function itemAllowed(id, exclusive) {
  if (!exclusive) return true;
  for (const [family, ids] of Object.entries(EXCLUSIVE_PAIRS)) {
    if (!ids.includes(id)) continue;
    if (exclusive[family] && exclusive[family] !== id) return false;
  }
  return true;
}

export function reportTraces(s, ending) {
  const traces = [];
  const push = (id, text) => traces.push({ id, text });
  if (!s.knownFacts.length && s.privacyPressure < 20) {
    push("ending:minimal", ENDING_TRACE.minimal);
    push("privacy-low", pair("Mahremiyet neredeyse dokunulmamış.", "Privacy was almost untouched."));
    push(`decision:${s.decision}`, DECISION_TRACE[s.decision] || DECISION_TRACE.return);
    return traces;
  }
  for (const fact of Object.keys(FACT_TRACE)) {
    if (s.knownFacts.includes(fact)) push(`fact:${fact}`, FACT_TRACE[fact]);
    else push(`missed:${fact}`, MISSED_TRACE[fact]);
  }
  for (const secret of s.sideSecrets || []) {
    if (SECRET_TRACE[secret]) push(`secret:${secret}`, SECRET_TRACE[secret]);
  }
  if ((s.contradiction || []).length) {
    push("contradiction", pair("En az bir çift birbirini tutmuyor. Saatler kayıyor.", "At least one pair does not hold. The hours slip."));
  }
  if (s.privacyPressure >= 60) push("privacy-high", pair("Mahremiyet bedeli yüksek. İade artık temiz değil.", "The privacy cost is high. The return is no longer clean."));
  else if (s.privacyPressure < 20) push("privacy-low", pair("Az bakıldı. Az taşındı.", "Little was looked at. Little was carried."));
  else push("privacy-mid", pair("Bakıldı. Her kilit açılmadı.", "It was looked at. Not every lock was opened."));
  if (ENDING_TRACE[ending]) push(`ending:${ending}`, ENDING_TRACE[ending]);
  push(`decision:${s.decision}`, DECISION_TRACE[s.decision] || DECISION_TRACE.return);
  const seedNote = SEED_NOTES[(Number(s.caseSeed) || 0) % SEED_NOTES.length];
  push("seed-note", seedNote);
  const seen = new Set();
  return traces.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  }).slice(0, 12);
}

export function overlayThreadMessages(thread, variant) {
  const v = ((Number(variant) || 0) % 6 + 6) % 6;
  const heads = MESSAGE_HEADS[thread.id];
  const extras = THREAD_EXTRAS[thread.id] || [];
  const messages = (thread.messages || []).map((message) => message);
  if (heads?.[v] && messages.length) messages[0] = heads[v];
  for (const extra of extras) {
    if (extra.variants && !extra.variants.includes(v)) continue;
    messages.push(extra.sys ? { text: extra.text, sys: true } : extra.text);
  }
  return messages;
}

export function coverage() {
  const extras = EXTRA_DISCOVERABLES;
  const byApp = (app) => extras.filter((item) => item.app === app).length;
  const tagged = (tag) => extras.filter((item) => (item.tags || []).includes(tag)).length;
  const heads = Object.values(MESSAGE_HEADS).reduce((n, arr) => n + arr.length, 0);
  const extraMsgs = Object.values(THREAD_EXTRAS).reduce((n, arr) => n + arr.length, 0);
  const variants = Object.values(ITEM_VARIANTS).reduce((n, arr) => n + arr.length, 0);
  const secretRoutes = Object.values(SIDE_SECRET_ROUTES).reduce((n, rows) => n + rows.length, 0);
  const staged = Object.values(SIDE_SECRET_STAGES).filter((row) => Object.keys(row).length >= 3).length;
  return {
    extraDiscoverables: extras.length,
    messagePieces: heads + extraMsgs + byApp("messages"),
    notes: byApp("notes"),
    media: byApp("photos"),
    callsCalendarFilesVoice: byApp("calls") + byApp("calendar") + byApp("files") + byApp("voice"),
    daily: tagged("daily"),
    clueVariants: variants,
    misdirect: tagged("misdirect") + MISDIRECT_IDS.length,
    contradict: extras.filter((item) => item.contradicts).length,
    exclusive: Object.keys(EXCLUSIVE_PAIRS).length,
    seedSensitive: Object.keys(ITEM_VARIANTS).length + 6,
    alternateThreads: ALTERNATE_THREADS.length,
    voices: Object.keys(CONTACT_VOICES).length,
    sideSecretRoutes: secretRoutes,
    sideSecretStages: staged,
    extraPaths: Object.values(EXTRA_PATHS).reduce((n, rows) => n + rows.length, 0),
  };
}
