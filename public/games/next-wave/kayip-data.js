/** Kayıp Telefon — contacts, apps, threads, clues, endings. */
export const APPS = ["messages", "contacts", "calls", "photos", "notes", "calendar", "files", "voice"];

export const CONTACTS = [
  { id: "c_leyla", name: "Leyla", relation: "kız kardeş", tone: "kısa, endişeli" },
  { id: "c_emre", name: "Emre", relation: "iş", tone: "resmi-yamuk" },
  { id: "c_ali", name: "Ali", relation: "eski ev arkadaşı", tone: "kapalı" },
  { id: "c_seda", name: "Seda", relation: "eski ilişki", tone: "mesafeli" },
  { id: "c_mert", name: "Mert", relation: "kuzen", tone: "lâubali" },
  { id: "c_naz", name: "Naz", relation: "yeni isim", tone: "dikkatli" },
  { id: "c_bank", name: "Banka Bildirim", relation: "servis", tone: "otomatik" },
  { id: "c_eczane", name: "Nöbetçi Eczane", relation: "servis", tone: "kısa" },
  { id: "c_patron", name: "Hakan Bey", relation: "üst", tone: "resmi" },
];

export const THREADS = [
  { id: "t1", contactId: "c_leyla", app: "messages", messages: ["nerdesin ya", "annem sordu", "telefonun cekmiyo belki", "yemege gelmicen dimi"] },
  { id: "t2", contactId: "c_emre", app: "messages", messages: ["dosya mailde", "müşteri 16:00ı bekliyo", "imza atmadan çıkarma", "bu maili iletme"] },
  { id: "t3", contactId: "c_ali", app: "messages", messages: ["bunu kimse bilmemeli", "cuma değil cumartesi", "adres aynı değil", "sil bunu"] },
  { id: "t4", contactId: "c_seda", app: "messages", messages: ["anahtarı bıraktım", "kutular sende kalsın", "konuşacak bişey yok"] },
  { id: "t5", contactId: "c_mert", app: "messages", messages: ["abi nakit lazım", "çarşamba netleşir", "annene söyleme"] },
  { id: "t6", contactId: "c_naz", app: "messages", messages: ["geldin mi", "kafede kimse olmasın", "foto atma"] },
  { id: "t7", contactId: "c_patron", app: "messages", messages: ["toplantı 09:30 kaydırma", "müşteri bekler", "bu maili dışarı taşıma"] },
  { id: "t8", contactId: "c_eczane", app: "messages", messages: ["ilac hazır", "son 1 gün"] },
];

export const DISCOVERABLES = [
  { id: "clue_0", app: "messages", title: "Leyla'nın son mesajı", text: "Yemek saatine gelmemiş. Aile arıyor.", tags: ["family"] },
  { id: "call_leyla", app: "calls", title: "Cevapsız: Leyla ×4", text: "Son 36 saatte dört arama, hiç açılmamış.", tags: ["family"], corroborates: ["clue_0"] },
  { id: "photo_cafe", app: "photos", title: "Foto: Kadıköy iskele, 23:14", text: "Tarih, takvimdeki 'Naz 21:00' ile uyuşmuyor.", tags: ["naz"], contradicts: ["cal_naz"] },
  { id: "cal_naz", app: "calendar", title: "Takvim: Naz — 21:00 Moda", text: "Not yok. Tekrar etmiyor.", tags: ["naz"] },
  { id: "note_pin", app: "notes", title: "Not: 4 haneli sayı", text: "Defter kilidi gibi. Yanında 'Ali cmt'.", tags: ["ali"], corroborates: ["t3"] },
  { id: "file_pdf", app: "files", title: "PDF: sözleşme taslağı", text: "Emre'nin 'iletme' dediği dosya yerelde duruyor.", tags: ["work"], corroborates: ["t2"] },
  { id: "voice_1", app: "voice", title: "Ses: 12 sn, gürültülü", text: "Bir isim: 'Seda'. Sonra kesiliyor.", tags: ["seda"] },
  { id: "call_emre", app: "calls", title: "Emre, 14:02, 48 sn", text: "İş araması. Sonrasında 'iletme' mesajı.", tags: ["work"] },
  { id: "photo_key", app: "photos", title: "Foto: kapı önü anahtar", text: "Seda'nın 'anahtarı bıraktım'ı ile örtüşür.", tags: ["seda"], corroborates: ["t4"] },
  { id: "note_debt", app: "notes", title: "Not: Mert 4.500", text: "Tarih yok. Mesajdaki nakit isteğiyle aynı kişi.", tags: ["mert"], corroborates: ["t5"] },
  { id: "cal_clinic", app: "calendar", title: "Takvim: Diş — perşembe 09:30", text: "Kimse hatırlatmamış. Telefon sahibi kaçırmış olabilir.", tags: ["body"] },
  { id: "file_scan", app: "files", title: "Tarama: kimlik", text: "Mahrem. İade etmeden bakmak baskıyı artırır.", tags: ["privacy"], pressure: 14 },
  { id: "voice_2", app: "voice", title: "Ses: 'cumartesi değil'", text: "Ali'nin mesajıyla çelişir — o cumartesi demişti.", tags: ["ali"], contradicts: ["t3"] },
  { id: "call_unknown", app: "calls", title: "Gizli numara, 02:11", text: "Cevapsız. Rehberde yok.", tags: ["unknown"] },
  { id: "photo_bag", app: "photos", title: "Foto: spor çantası, otogar", text: "Şehir dışına çıkış planı?", tags: ["travel"] },
  { id: "note_pass", app: "notes", title: "Not: mail şifre taslağı", text: "Yarım. Kullanmak hesabı ele geçirir.", tags: ["privacy"], pressure: 18 },
  { id: "cal_work", app: "calendar", title: "Takvim: teslim 16:00", text: "Emre'nin mesajıyla aynı saat.", tags: ["work"], corroborates: ["t2"] },
  { id: "file_chat", app: "files", title: "Dışa aktarılmış sohbet", text: "Naz konuşmasının kopyası. Silinmiş gibi duran satırlar var.", tags: ["naz"], pressure: 10 },
  { id: "bank_sms", app: "messages", title: "Banka: 2.400 TL outgoing", text: "Alıcı adı yok. Mert'in tutarı değil.", tags: ["money"] },
  { id: "contact_naz_note", app: "contacts", title: "Naz — not: 'iş değil'", text: "Rehber notu kısa. Aileye anlatılmamış.", tags: ["naz"] },
  { id: "photo_ticket", app: "photos", title: "Foto: otobüs bileti", text: "Tarih yarın. İsim telefon sahibi.", tags: ["travel"] },
  { id: "deleted_draft", app: "messages", title: "Taslak: Seda'ya", text: "'özür' yazılmış, gönderilmemiş.", tags: ["seda"] },
  { id: "call_patron", app: "calls", title: "Hakan Bey, 08:41, 12 sn", text: "Açılmamış. Sonra 'kaydırma' mesajı.", tags: ["work"], corroborates: ["t7"] },
  { id: "photo_eczane", app: "photos", title: "Foto: reçete kuyruğu", text: "Tarih dün gece. Aileye söylenmemiş.", tags: ["body"] },
  { id: "note_iban", app: "notes", title: "Not: IBAN + 'Naz'", text: "Banka SMS'indeki 2.400 ile aynı haneye bakıyor.", tags: ["money", "naz"], corroborates: ["bank_sms"] },
  { id: "cal_bus", app: "calendar", title: "Takvim: otogar 06:20", text: "Bilet fotoğrafıyla aynı gün.", tags: ["travel"], corroborates: ["photo_ticket"] },
  { id: "voice_3", app: "voice", title: "Ses: 'anneme söyleme'", text: "Leyla hattı değil. Mert'in tonuna yakın.", tags: ["mert"], corroborates: ["t5"] },
  { id: "file_map", app: "files", title: "Konum kaydı: Moda iskele", text: "Takvim 21:00, foto 23:14. Aralık açık.", tags: ["naz"], contradicts: ["cal_naz"] },
  { id: "deleted_ali", app: "messages", title: "Silinmiş: Ali 'cuma değil'", text: "Ses kaydıyla aynı cümle.", tags: ["ali"], corroborates: ["voice_2"] },
];

export const ENDINGS = {
  minimal: { id: "minimal", title: "Kilitli iade", text: "Telefonu olduğu gibi bırakırsın. Bildiğin az, karıştığın yok." },
  thorough: { id: "thorough", title: "Bilinçli müdahale", text: "Yeterince gördün. Sahibini veya aileyi, her şeyi dökmeden uyarabilirsin." },
  reckless: { id: "reckless", title: "Sızdırılmış hayat", text: "Çok derin indin. Bilgi sende, sonuç başkasında." },
  witness: { id: "witness", title: "Tanık iadesi", text: "Çelişkileri gördün, özel dosyaya girmedin. Aileye tek cümle yeter." },
};
