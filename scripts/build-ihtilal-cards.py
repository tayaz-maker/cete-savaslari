#!/usr/bin/env python3
"""Author the İHTİLAL dosya catalog and emit public/games/ihtilal/cards.js."""
from pathlib import Path

# Each row: (tr, en, type, desk, cost, seal, delay, family, exclusive, chain, step, ops, flavor_tr, flavor_en)
# types: acik | artci | karsi | heyet | muhurluk
# desks: sicil | kasa | manset | koridor | nobet | any
# ops: semicolon-separated tokens  push.desk.n | pull.desk.n.self/opp | steal.desk.n | seal.n | heat.n | ink.n | draw.n | mill.n | hukum.n | protect.desk | unlock.desk | discard.n | peek

ROWS = [
    # --- Kalemci exclusive: sicil-hatti (12) ---
    ("Nüfus Paftası", "Census Folio", "acik", "sicil", 1, 0, 0, "sicil-hatti", "kalemci", "pafta-ac", 1, "push.sicil.2", "Pafta açılınca isimler yerinden oynar.", "When the folio opens, names shift their places."),
    ("Sicil Hulasası", "Record Abstract", "acik", "sicil", 2, 0, 0, "sicil-hatti", "kalemci", "pafta-ac", 2, "push.sicil.2;draw.1", "Hulasada üç satır eksik kalır; eksik satır işe yarar.", "Three lines are missing from the abstract; the gap is useful."),
    ("Kıdem Cetveli", "Seniority Ledger", "acik", "sicil", 2, 1, 0, "sicil-hatti", "kalemci", "sicil-hulasas", 1, "push.sicil.1;seal.1", "Kıdem yazılınca itiraz geç gelir.", "Once seniority is written, objection arrives late."),
    ("Terfi Askısı", "Promotion Hold", "artci", "sicil", 1, 0, 2, "sicil-hatti", "kalemci", "sicil-hulasas", 2, "push.sicil.2;pull.manset.1.opp", "Askıdaki isim henüz masaya inmemiştir.", "The name on hold has not yet reached the desk."),
    ("Görev Notu", "Duty Note", "acik", "sicil", 1, 0, 0, "sicil-hatti", "kalemci", None, 0, "push.sicil.1;ink.1", "Kısa not, uzun dosyayı keser.", "A short note cuts a long file."),
    ("İzin Defteri", "Leave Register", "acik", "sicil", 2, 0, 0, "sicil-hatti", "kalemci", None, 0, "pull.sicil.1.opp;draw.1", "İzinli sayılan kalem cevap veremez.", "A clerk marked on leave cannot answer."),
    ("Yemin Zabtı", "Oath Minute", "muhurluk", "sicil", 2, 2, 0, "sicil-hatti", "kalemci", None, 0, "push.sicil.3;hukum.1", "Yemin zabtı mühür ister, ağız yetmez.", "The oath minute wants a seal, not a mouth."),
    ("Tebligat Pulu", "Service Stamp", "acik", "sicil", 1, 0, 0, "sicil-hatti", "kalemci", None, 0, "push.sicil.1;heat.1", "Pul yapışınca dosya yürür.", "Once the stamp sticks, the file walks."),
    ("Şahıs Föyü", "Person Dossier", "heyet", "sicil", 2, 0, 0, "sicil-hatti", "kalemci", "imza-sirkuler", 1, "push.sicil.1;push.koridor.1", "Föy tek masaya sığmaz.", "The dossier does not fit a single desk."),
    ("Arşiv Fişi", "Archive Slip", "artci", "sicil", 1, 0, 1, "sicil-hatti", "kalemci", None, 0, "push.sicil.1;peek", "Fiş kaybolursa dosya da kaybolmuş sayılır.", "If the slip vanishes, the file is treated as gone."),
    ("Nakil Pusulası", "Transfer Chit", "acik", "sicil", 2, 0, 0, "sicil-hatti", "kalemci", None, 0, "steal.sicil.1;heat.1", "Nakil, ismi masadan masaya taşır.", "Transfer carries the name from desk to desk."),
    ("Memuriyet Cüzdanı", "Service Booklet", "karsi", "sicil", 1, 0, 0, "sicil-hatti", "kalemci", None, 0, "protect.sicil;pull.sicil.1.opp", "Cüzdan açılınca karşı iddia durur.", "When the booklet opens, the counter-claim stops."),
    # --- Hesapçı exclusive: kasa-defteri (12) ---
    ("Ödenek Cetveli", "Appropriation Roll", "acik", "kasa", 1, 0, 0, "kasa-defteri", "hesapci", "cetvel-kirma", 1, "push.kasa.2", "Cetvelde kalem kalem durur; toplam ayrı konuşur.", "The roll lists line by line; the total speaks separately."),
    ("Avans Bordrosu", "Advance Sheet", "acik", "kasa", 2, 0, 0, "kasa-defteri", "hesapci", "cetvel-kirma", 2, "push.kasa.2;ink.1", "Avans yazılınca geri dönüş gecikir.", "Once the advance is written, return is delayed."),
    ("Mühürlü Makbuz", "Sealed Receipt", "muhurluk", "kasa", 2, 2, 0, "kasa-defteri", "hesapci", "kasa-mutabakat", 1, "push.kasa.2;seal.2", "Makbuz mühürsüzse kasa onu görmez.", "Without a seal the till does not see the receipt."),
    ("Tahakkuk Fişi", "Accrual Slip", "acik", "kasa", 1, 0, 0, "kasa-defteri", "hesapci", "kasa-mutabakat", 2, "push.kasa.1;seal.1", "Tahakkuk, henüz paranın konuşmadığı yerdir.", "Accrual is where the money has not yet spoken."),
    ("Bütçe Kalemi", "Budget Line", "acik", "kasa", 2, 0, 0, "kasa-defteri", "hesapci", "icmal-defter", 1, "push.kasa.1;pull.kasa.1.opp", "Kalem açılır, başka kalem kapanır.", "A line opens and another line closes."),
    ("Dondurulmuş Ödenek", "Frozen Appropriation", "artci", "kasa", 2, 0, 2, "kasa-defteri", "hesapci", "icmal-defter", 2, "pull.kasa.2.opp;heat.-1", "Dondurulmuş ödenek ısınmayı bekler.", "A frozen appropriation waits to warm."),
    ("Vize Edilmiş Fatura", "Visaed Invoice", "acik", "kasa", 1, 1, 0, "kasa-defteri", "hesapci", None, 0, "push.kasa.1;heat.-1", "Vize, faturanın yürüyüş iznidir.", "The visa is the invoice's walking permit."),
    ("Kasa Tutanağı", "Till Minute", "heyet", "kasa", 2, 0, 0, "kasa-defteri", "hesapci", "tediye-emri", 1, "push.kasa.1;push.nobet.1", "Tutanak iki kalemin ortak elidir.", "The minute is the joint hand of two pens."),
    ("Mutabakat", "Reconciliation", "acik", "kasa", 2, 0, 0, "kasa-defteri", "hesapci", "tediye-emri", 2, "push.kasa.2;draw.1", "Mutabakat, anlaşmazlığı rakama çevirir.", "Reconciliation turns a dispute into a figure."),
    ("Sayman Zabtı", "Accountant Minute", "karsi", "kasa", 1, 0, 0, "kasa-defteri", "hesapci", None, 0, "protect.kasa;seal.1", "Sayman imzası karşı hamleyi durdurur.", "The accountant's signature stops the counter-move."),
    ("Teminat Mektubu", "Guarantee Letter", "muhurluk", "kasa", 3, 2, 0, "kasa-defteri", "hesapci", None, 0, "push.kasa.3;protect.kasa", "Teminat, henüz ödenmemiş bir vaattir.", "A guarantee is a promise not yet paid."),
    ("Reddiye", "Refusal Slip", "acik", "kasa", 1, 0, 0, "kasa-defteri", "hesapci", None, 0, "pull.kasa.1.opp;mill.1", "Reddiye, kalemi masadan kaldırır.", "The refusal lifts the pen from the desk."),
    # --- Manşetçi exclusive: manset-dizgi (12) ---
    ("Manşet Provası", "Headline Proof", "acik", "manset", 1, 0, 0, "manset-dizgi", "mansetci", "manset-prova", 1, "push.manset.2", "Prova, henüz halka inmemiş bir cümledir.", "A proof is a sentence that has not yet reached the public."),
    ("Tekzip Taslağı", "Correction Draft", "acik", "manset", 2, 0, 0, "manset-dizgi", "mansetci", "manset-prova", 2, "push.manset.1;pull.manset.1.opp", "Tekzip, dünün manşetini bugüne bağlar.", "A correction binds yesterday's headline to today."),
    ("Askı Şerhi", "Hold Annotation", "artci", "manset", 1, 0, 2, "manset-dizgi", "mansetci", "dizgi-hata", 1, "push.manset.2;heat.2", "Şerh düşünce sayı beklemeye alınır.", "Once annotated, the issue is held."),
    ("Dizgi Hataları", "Typesetting Faults", "acik", "manset", 1, 0, 0, "manset-dizgi", "mansetci", "dizgi-hata", 2, "pull.manset.2.opp;heat.1", "Hata, rakibin cümlesini bozar.", "A fault breaks the opponent's sentence."),
    ("Resmi İlan", "Official Notice", "acik", "manset", 2, 1, 0, "manset-dizgi", "mansetci", "ikinci-baski", 1, "push.manset.2;seal.1", "İlan, gazeteyi resmi kılar.", "The notice makes the paper official."),
    ("Ajans Bülteni", "Agency Bulletin", "acik", "manset", 1, 0, 0, "manset-dizgi", "mansetci", "ikinci-baski", 2, "push.manset.1;draw.1", "Bülten gelir; manşet seçilir.", "The bulletin arrives; the headline is chosen."),
    ("Baskı Durdurma", "Stop Press", "karsi", "manset", 2, 0, 0, "manset-dizgi", "mansetci", None, 0, "protect.manset;pull.manset.2.opp", "Makine durunca cümle yarım kalır.", "When the press stops, the sentence is left half-done."),
    ("Sarı Bant", "Yellow Band", "artci", "manset", 1, 0, 1, "manset-dizgi", "mansetci", None, 0, "push.manset.1;heat.2", "Sarı bant, okunacak yeri işaretler.", "The yellow band marks what will be read."),
    ("Başyazı Taslağı", "Leader Draft", "heyet", "manset", 2, 0, 0, "manset-dizgi", "mansetci", None, 0, "push.manset.1;push.koridor.1", "Başyazı, koridordan geçer sonra basılır.", "The leader walks the corridor before it prints."),
    ("Fotoğraf Altı", "Caption Line", "acik", "manset", 1, 0, 0, "manset-dizgi", "mansetci", None, 0, "push.manset.1;mill.1", "Alt yazı, görüntüyü başka yere çeker.", "The caption pulls the image somewhere else."),
    ("Matbaa Nöbeti", "Press Watch", "acik", "manset", 2, 0, 0, "manset-dizgi", "mansetci", None, 0, "push.manset.1;push.nobet.1", "Gece baskısı ayrı bir nöbettir.", "The night press is a watch of its own."),
    ("Dağıtım Listesi", "Distribution List", "muhurluk", "manset", 2, 2, 0, "manset-dizgi", "mansetci", None, 0, "push.manset.3;heat.2", "Liste kimdeyse sayı oraya gider.", "Whoever holds the list, the issue goes there."),
    # --- Koridorcu exclusive: imza-zinciri (12) ---
    ("Üç İmza Eksik", "Three Signatures Short", "acik", "koridor", 1, 0, 0, "imza-zinciri", "koridorcu", "uc-imza", 1, "push.koridor.2", "Eksik imza, dosyayı koridorda tutar.", "A missing signature keeps the file in the corridor."),
    ("Paraf Zinciri", "Initials Chain", "acik", "koridor", 2, 0, 0, "imza-zinciri", "koridorcu", "uc-imza", 2, "push.koridor.2;draw.1", "Paraf yürür; imza sonra gelir.", "Initials walk; the signature comes later."),
    ("Kapı Aralığı", "Door Gap", "acik", "koridor", 1, 0, 0, "imza-zinciri", "koridorcu", "uc-imza", 3, "push.koridor.1;peek", "Aralıktan bakmak da bir bilgidir.", "Looking through the gap is also information."),
    ("Bekleme Koltuğu", "Waiting Chair", "artci", "koridor", 1, 0, 2, "imza-zinciri", "koridorcu", "paraf-bekler", 1, "push.koridor.2;ink.1", "Koltuk dolunca sıra değişir.", "When the chair fills, the order changes."),
    ("Dış Yazı", "Outgoing Paper", "acik", "koridor", 2, 0, 0, "imza-zinciri", "koridorcu", "paraf-bekler", 2, "push.koridor.1;push.manset.1", "Dış yazı, koridoru sokağa bağlar.", "Outgoing paper ties the corridor to the street."),
    ("İç Yazı", "Internal Paper", "acik", "koridor", 1, 0, 0, "imza-zinciri", "koridorcu", "havale-zincir", 1, "push.koridor.1;push.sicil.1", "İç yazı, isimleri yerinde tutar.", "Internal paper keeps the names in place."),
    ("Havale", "Referral Slip", "acik", "koridor", 2, 0, 0, "imza-zinciri", "koridorcu", "havale-zincir", 2, "steal.koridor.1;heat.1", "Havale, dosyayı başka ele verir.", "Referral puts the file in another hand."),
    ("Tevzi Pusulası", "Dispatch Chit", "acik", "koridor", 1, 0, 0, "imza-zinciri", "koridorcu", "tevzi-pusula", 1, "push.koridor.1;mill.1", "Tevzi, kimin okuyacağını seçer.", "Dispatch chooses who will read it."),
    ("Paraf Bekler", "Awaiting Initials", "artci", "koridor", 2, 0, 1, "imza-zinciri", "koridorcu", "tevzi-pusula", 2, "push.koridor.2;pull.koridor.1.opp", "Bekleyen paraf, rakibi yorar.", "Waiting initials tire the opponent."),
    ("Elden Teslim", "Hand Delivery", "karsi", "koridor", 1, 0, 0, "imza-zinciri", "koridorcu", None, 0, "protect.koridor;draw.1", "Elden giden dosya kaybolmaz.", "A file delivered by hand does not vanish."),
    ("Üst Yazı", "Cover Note", "heyet", "koridor", 2, 1, 0, "imza-zinciri", "koridorcu", None, 0, "push.koridor.1;push.any.1", "Üst yazı, bütün masaları selamlar.", "The cover note greets every desk."),
    ("İmzaya Gider", "Sent for Signature", "muhurluk", "koridor", 2, 2, 0, "imza-zinciri", "koridorcu", None, 0, "push.koridor.3;seal.1", "İmzaya giden dosya geri dönünce ağırlaşır.", "A file sent for signature returns heavier."),
    # --- Nöbetçi exclusive: gece-defteri (12) ---
    ("Gece Defteri", "Night Ledger", "acik", "nobet", 1, 0, 0, "gece-defteri", "nobetci", "gece-devri", 1, "push.nobet.2", "Gece yazılan, sabah okunur.", "What is written at night is read at dawn."),
    ("Nöbet Tutanağı", "Watch Minute", "acik", "nobet", 2, 0, 0, "gece-defteri", "nobetci", "gece-devri", 2, "push.nobet.2;heat.-1", "Tutanak, ısının düştüğü saati kaydeder.", "The minute records the hour heat fell."),
    ("Anahtar Teslimi", "Key Handover", "acik", "nobet", 1, 0, 0, "gece-defteri", "nobetci", "nobet-teslim", 1, "push.nobet.1;protect.nobet", "Anahtar kimin elindeyse kapı onundur.", "Whoever holds the key holds the door."),
    ("Lamba Söndü", "Lamp Out", "artci", "nobet", 1, 0, 2, "gece-defteri", "nobetci", "nobet-teslim", 2, "push.nobet.2;peek", "Lamba sönünce kimse bakmaz sandılar.", "When the lamp went out they thought no one was looking."),
    ("Mühür Kesesi", "Seal Pouch", "muhurluk", "nobet", 2, 2, 0, "gece-defteri", "nobetci", "muhur-kesesi", 1, "seal.2;push.nobet.1", "Kese açılmadan mühür konuşmaz.", "Until the pouch opens, the seal does not speak."),
    ("Sabah Teslimi", "Dawn Handover", "acik", "nobet", 2, 0, 0, "gece-defteri", "nobetci", "muhur-kesesi", 2, "push.nobet.1;push.sicil.1", "Sabah teslimi geceyi sicile bağlar.", "Dawn handover binds the night to the register."),
    ("Nöbet Değişimi", "Watch Change", "heyet", "nobet", 2, 0, 0, "gece-defteri", "nobetci", "yangin-defter", 1, "push.nobet.1;push.kasa.1", "Değişimde kasa da sayılır.", "At the changeover the till is counted too."),
    ("Kapı Kilidi", "Door Lock", "karsi", "nobet", 1, 0, 0, "gece-defteri", "nobetci", None, 0, "protect.nobet;pull.nobet.1.opp", "Kilit, karşı dosyayı dışarıda bırakır.", "The lock leaves the opposing file outside."),
    ("Yangın Defteri", "Fire Ledger", "artci", "nobet", 2, 0, 1, "gece-defteri", "nobetci", "yangin-defter", 2, "push.nobet.1;heat.-2", "Yangın defteri ısının düşmesini ister.", "The fire ledger wants the heat to fall."),
    ("Jeneratör Notu", "Generator Note", "acik", "nobet", 1, 0, 0, "gece-defteri", "nobetci", None, 0, "push.nobet.1;ink.1", "Not, ışığın kimde kaldığını yazar.", "The note writes who still has the light."),
    ("Gece Ziyareti", "Night Visit", "acik", "nobet", 2, 0, 0, "gece-defteri", "nobetci", None, 0, "steal.nobet.1;heat.1", "Ziyaret, nöbeti başka ele kaydırır.", "The visit shifts the watch to another hand."),
    ("Nöbet Telefonu", "Watch Telephone", "acik", "nobet", 1, 0, 0, "gece-defteri", "nobetci", None, 0, "push.nobet.1;draw.1", "Telefon çalınca defter açılır.", "When the telephone rings, the ledger opens."),
    # --- Heyetçi exclusive: heyet-cizelgesi (12) ---
    ("Heyet Kararı", "Board Ruling", "heyet", "any", 2, 1, 0, "heyet-cizelgesi", "heyetci", "heyet-ara", 1, "push.any.2;hukum.1", "Karar, tek masaya sığmaz.", "A ruling does not fit a single desk."),
    ("Komisyon Zabtı", "Commission Minute", "heyet", "any", 2, 0, 0, "heyet-cizelgesi", "heyetci", "heyet-ara", 2, "push.any.1;draw.1", "Zabıt, beş kalemin ortak cümlesidir.", "The minute is the shared sentence of five pens."),
    ("Ortak İmza", "Joint Signature", "heyet", "any", 1, 0, 0, "heyet-cizelgesi", "heyetci", "karar-ozet", 1, "push.koridor.1;push.any.1", "Ortak imza, koridoru kısaltır.", "A joint signature shortens the corridor."),
    ("Ara Karar", "Interim Ruling", "artci", "any", 2, 0, 2, "heyet-cizelgesi", "heyetci", "karar-ozet", 2, "push.any.2;seal.1", "Ara karar, asıl hükmü bekletir.", "The interim ruling holds the main one."),
    ("Kurul Gündemi", "Board Agenda", "acik", "any", 1, 0, 0, "heyet-cizelgesi", "heyetci", None, 0, "push.any.1;peek", "Gündem, hangi dosyanın konuşacağını seçer.", "The agenda chooses which file will speak."),
    ("Muhalefet Şerhi", "Dissent Note", "karsi", "any", 1, 0, 0, "heyet-cizelgesi", "heyetci", None, 0, "pull.any.1.opp;heat.1", "Şerh, kararı tek ağız olmaktan çıkarır.", "The note stops the ruling from being one mouth."),
    ("Oybirliği Zabtı", "Unanimity Minute", "muhurluk", "any", 3, 2, 0, "heyet-cizelgesi", "heyetci", None, 0, "push.any.2;hukum.1;seal.1", "Oybirliği nadirdir; mühür ister.", "Unanimity is rare; it wants a seal."),
    ("Ertelenen Madde", "Deferred Item", "artci", "any", 1, 0, 3, "heyet-cizelgesi", "heyetci", None, 0, "push.any.2;ink.1", "Ertelenen madde unutulmaz, bekler.", "A deferred item is not forgotten; it waits."),
    ("Gündem Dışı", "Off Agenda", "acik", "any", 2, 0, 0, "heyet-cizelgesi", "heyetci", None, 0, "steal.any.1;heat.2", "Gündem dışı gelen, sırayı bozar.", "What arrives off agenda breaks the order."),
    ("Raportör Notu", "Rapporteur Note", "acik", "any", 1, 0, 0, "heyet-cizelgesi", "heyetci", None, 0, "push.any.1;draw.1", "Raportör, beş masayı bir cümlede toplar.", "The rapporteur gathers five desks in one sentence."),
    ("Ek Süre", "Extra Time", "acik", "any", 1, 1, 0, "heyet-cizelgesi", "heyetci", None, 0, "ink.2;heat.-1", "Ek süre, mürekkebi uzatır.", "Extra time stretches the ink."),
    ("Dosya Birleştirme", "File Joinder", "heyet", "any", 2, 0, 0, "heyet-cizelgesi", "heyetci", None, 0, "push.sicil.1;push.kasa.1", "Birleşen dosya iki masayı konuşturur.", "A joined file makes two desks speak."),
    # --- Shared family: kirmizi-bant (8) ---
    ("Kırmızı Bant", "Red Band", "muhurluk", "any", 2, 2, 0, "kirmizi-bant", None, "aski-alma", 1, "protect.any;seal.1", "Kırmızı bant, dosyayı acele ettirmez.", "The red band does not hurry the file."),
    ("Askıya Alma", "Suspension Slip", "artci", "any", 1, 0, 2, "kirmizi-bant", None, "aski-alma", 2, "pull.any.1.opp;heat.-1", "Askıya alınan dosya ısınmaz.", "A suspended file does not heat."),
    ("Kırmızı Prova", "Red Proof", "acik", "manset", 2, 1, 0, "kirmizi-bant", None, None, 0, "push.manset.1;protect.manset", "Kırmızı prova basılmaz, bekler.", "A red proof is not printed; it waits."),
    ("Bant Kesildi", "Band Cut", "karsi", "any", 2, 0, 0, "kirmizi-bant", None, None, 0, "unlock.any;heat.2", "Kesilen bant, kilidi tartışmaya açar.", "A cut band opens the lock to argument."),
    ("Mühür Üstü Bant", "Band Over Seal", "muhurluk", "kasa", 2, 2, 0, "kirmizi-bant", None, None, 0, "protect.kasa;seal.2", "Bant, mührün üstüne gelir.", "The band arrives over the seal."),
    ("Gizli Değil Ama", "Not Secret, But", "acik", "koridor", 1, 0, 0, "kirmizi-bant", None, None, 0, "push.koridor.1;peek", "Gizli olmayan da okunmaz bazen.", "What is not secret is sometimes still unread."),
    ("Evrak Sırası", "Paper Queue", "artci", "koridor", 1, 0, 1, "kirmizi-bant", None, None, 0, "push.koridor.1;mill.1", "Sıra, acele edeni cezalandırır.", "The queue punishes the one in a hurry."),
    ("Kilit Teslim Zabtı", "Lock Handover Minute", "heyet", "nobet", 2, 1, 0, "kirmizi-bant", None, None, 0, "push.nobet.1;protect.nobet", "Kilit teslimi tutanağa geçer.", "The lock handover enters the minute."),
    # --- Shared family: zeyilname (8) ---
    ("Zeyilname", "Addendum", "heyet", "any", 2, 0, 0, "zeyilname", None, None, 0, "push.any.1;draw.1", "Zeyil, bitmiş sanılan cümleyi uzatır.", "An addendum stretches a sentence thought finished."),
    ("Zeyil Taslağı", "Addendum Draft", "acik", "sicil", 1, 0, 0, "zeyilname", None, None, 0, "push.sicil.1;ink.1", "Taslak, asıl metni bekletir.", "The draft holds the main text."),
    ("Zeyil Reddi", "Addendum Refusal", "karsi", "any", 1, 0, 0, "zeyilname", None, None, 0, "pull.any.1.opp;discard.1", "Reddedilen zeyil, dosyayı eski haline çeker.", "A refused addendum pulls the file back."),
    ("Zeyil Mühürü", "Addendum Seal", "muhurluk", "kasa", 2, 2, 0, "zeyilname", None, None, 0, "push.kasa.2;seal.1", "Zeyil mühürlenince asıl metin değişmiş sayılır.", "Once sealed, the addendum is treated as the text."),
    ("Gecikmiş Zeyil", "Late Addendum", "artci", "any", 1, 0, 3, "zeyilname", None, None, 0, "push.any.2;heat.1", "Gecikmiş zeyil, kapandı sanılanı açar.", "A late addendum opens what was thought closed."),
    ("Zeyil Dağıtımı", "Addendum Circulation", "acik", "manset", 2, 0, 0, "zeyilname", None, None, 0, "push.manset.1;push.koridor.1", "Zeyil dolaşınca manşet değişir.", "When the addendum circulates, the headline changes."),
    ("Zeyil Özeti", "Addendum Digest", "acik", "koridor", 1, 0, 0, "zeyilname", None, None, 0, "push.koridor.1;peek", "Özet, uzun zeyili koridorda tutar.", "The digest keeps the long addendum in the corridor."),
    ("Zeyil İmzası", "Addendum Signature", "acik", "nobet", 2, 1, 0, "zeyilname", None, None, 0, "push.nobet.1;seal.1", "Gece atılan zeyil imzası sabah ağırdır.", "An addendum signed at night is heavy at dawn."),
    # --- Shared family: dis-yazi (8) ---
    ("Harici Yazı", "External Minute", "acik", "koridor", 1, 0, 0, "dis-yazi", None, None, 0, "push.koridor.1;push.manset.1", "Harici yazı içeriği dışarı taşır.", "An external minute carries the inside outward."),
    ("Cevap Yazısı", "Reply Paper", "karsi", "koridor", 1, 0, 0, "dis-yazi", None, None, 0, "protect.koridor;pull.koridor.1.opp", "Cevap yazısı, gelen yazıyı durdurur.", "A reply paper stops the incoming one."),
    ("Tehir Yazısı", "Deferral Paper", "artci", "any", 1, 0, 2, "dis-yazi", None, None, 0, "pull.any.1.opp;heat.-1", "Tehir, ısının düşmesini ister.", "Deferral wants the heat to fall."),
    ("İade Yazısı", "Return Paper", "acik", "sicil", 2, 0, 0, "dis-yazi", None, None, 0, "steal.sicil.1;mill.1", "İade, ismi sahibine geri verir.", "Return gives the name back to its owner."),
    ("Duyuru Yazısı", "Notice Paper", "acik", "manset", 2, 0, 0, "dis-yazi", None, None, 0, "push.manset.2;heat.1", "Duyuru, koridoru manşete çevirir.", "A notice turns the corridor into a headline."),
    ("Tediye Yazısı", "Payment Paper", "acik", "kasa", 2, 1, 0, "dis-yazi", None, None, 0, "push.kasa.2;seal.1", "Tediye yazısı kasayı yürütür.", "A payment paper walks the till."),
    ("Nöbet Yazısı", "Watch Paper", "acik", "nobet", 1, 0, 0, "dis-yazi", None, None, 0, "push.nobet.1;ink.1", "Nöbet yazısı geceyi resmi kılar.", "A watch paper makes the night official."),
    ("Toplu Yazı", "Circular Paper", "heyet", "any", 2, 0, 0, "dis-yazi", None, None, 0, "push.any.1;draw.1", "Toplu yazı beş masaya birden düşer.", "A circular falls on all five desks at once."),
]

# Shared desk files to reach 180. Unique titles + unique flavor.
SHARED = [
    # sicil remainder
    ("Tahkikat Özeti", "Inquiry Digest", "acik", "sicil", 2, 0, 0, None, None, None, 0, "push.sicil.1;mill.1", "Özet, tahkikatı kısaltır; kısaltmak da bir hükümdür.", "The digest shortens the inquiry; shortening is also a ruling."),
    ("Hizmet Belgesi", "Service Certificate", "acik", "sicil", 1, 0, 0, None, None, None, 0, "push.sicil.1;seal.1", "Belge, ismi resmi kılar.", "The certificate makes the name official."),
    ("Disiplin Zabtı", "Discipline Minute", "artci", "sicil", 2, 0, 2, None, None, None, 0, "pull.sicil.2.opp;heat.1", "Zabıt, rakip ismi askıya alır.", "The minute puts the opposing name on hold."),
    ("İstifa Sureti", "Resignation Copy", "acik", "sicil", 1, 0, 0, None, None, None, 0, "pull.sicil.1.opp;draw.1", "İstifa sureti, kadroyu incelttir.", "A resignation copy thins the roster."),
    ("Vekalet Şerhi", "Proxy Annotation", "acik", "sicil", 2, 0, 0, None, None, None, 0, "steal.sicil.1;ink.1", "Vekalet, imzayı başka ele verir.", "A proxy puts the signature in another hand."),
    ("Eski Fotoğraf", "Old Photograph", "acik", "sicil", 1, 0, 0, None, None, None, 0, "peek;push.sicil.1", "Eski fotoğraf, yeni isimle konuşur.", "An old photograph speaks with a new name."),
    ("İmza Sirküleri", "Signature Circular", "heyet", "sicil", 2, 1, 0, None, None, "imza-sirkuler", 2, "push.sicil.1;push.koridor.1", "Sirküler, kimin imzalayacağını ilan eder.", "The circular announces who will sign."),
    ("Kimlik Sureti", "Identity Copy", "karsi", "sicil", 1, 0, 0, None, None, None, 0, "protect.sicil;heat.-1", "Suret, iddiayı belgeye çeker.", "The copy pulls the claim back to paper."),
    ("Adres Tashihi", "Address Correction", "acik", "sicil", 1, 0, 0, None, None, None, 0, "push.sicil.1;heat.-1", "Tashih, yanlış kapıyı kapatır.", "Correction closes the wrong door."),
    ("Nüfus Askısı", "Registry Hold", "artci", "sicil", 2, 0, 1, None, None, None, 0, "push.sicil.2;pull.manset.1.opp", "Askı, manşetin ismi kullanmasını geciktirir.", "A hold delays the headline's use of the name."),
    ("Soyadı Tashihi", "Surname Correction", "acik", "sicil", 2, 0, 0, None, None, None, 0, "push.sicil.1;discard.1", "Tashih, eski satırı çizer.", "Correction strikes the old line."),
    ("Sicil Numarası", "Registry Number", "acik", "sicil", 1, 0, 0, None, None, None, 0, "push.sicil.1", "Numara, isimden daha az unutulur.", "A number is forgotten less than a name."),
    ("Emeklilik Föyü", "Retirement Dossier", "acik", "sicil", 2, 0, 0, None, None, None, 0, "pull.sicil.1.opp;seal.1", "Emeklilik, kadroyu sessizce boşaltır.", "Retirement empties the roster quietly."),
    ("Vefat Kaydı", "Death Entry", "muhurluk", "sicil", 2, 2, 0, None, None, None, 0, "pull.sicil.2.opp;hukum.1", "Kayıt düşünce isim dosyadan düşer.", "Once entered, the name leaves the file."),
    ("Velayet Notu", "Custody Note", "artci", "sicil", 1, 0, 3, None, None, None, 0, "push.sicil.2;heat.1", "Not, ileride konuşacak bir bağ bırakır.", "The note leaves a tie that will speak later."),
    ("Evlilik Beyanı", "Marriage Declaration", "acik", "sicil", 1, 0, 0, None, None, None, 0, "push.sicil.1;push.koridor.1", "Beyan, iki ismi aynı satıra yazar.", "The declaration writes two names on one line."),
    ("Müstafi Kaydı", "Resigned Entry", "acik", "sicil", 2, 0, 0, None, None, None, 0, "mill.2;pull.sicil.1.opp", "Müstafi, kadrodan sessiz çıkar.", "The resigned leave the roster without a sound."),
    ("Yemin Sureti", "Oath Copy", "acik", "sicil", 1, 1, 0, None, None, None, 0, "push.sicil.1;seal.1", "Suret, yeminin karbonudur.", "The copy is the carbon of the oath."),
    # kasa remainder
    ("Mahsup Fişi", "Offset Slip", "acik", "kasa", 1, 0, 0, None, None, None, 0, "push.kasa.1;pull.kasa.1.opp", "Mahsup, iki kalemi birbirine bağlar.", "An offset binds two lines to each other."),
    ("Günlük Kasa", "Daily Till", "acik", "kasa", 1, 0, 0, None, None, None, 0, "push.kasa.1;heat.-1", "Günlük kasa, gecenin hesabını sabaha bırakmaz.", "The daily till does not leave the night's account until morning."),
    ("Veznedar Notu", "Cashier Note", "acik", "kasa", 2, 0, 0, None, None, None, 0, "push.kasa.1;draw.1", "Not, saymanın görmediğini yazar.", "The note writes what the accountant did not see."),
    ("Damga Pulu", "Revenue Stamp", "acik", "kasa", 1, 0, 0, None, None, None, 0, "push.kasa.1;seal.1", "Pul yapışmadan evrak yürümez.", "Without the stamp the paper does not walk."),
    ("Avans Mahsubu", "Advance Offset", "artci", "kasa", 2, 0, 2, None, None, None, 0, "push.kasa.2;pull.kasa.1.opp", "Mahsup gecikince avans borç olur.", "When the offset delays, the advance becomes a debt."),
    ("Yedek Ödenek", "Reserve Appropriation", "acik", "kasa", 2, 1, 0, None, None, None, 0, "push.kasa.2;ink.1", "Yedek, asıl kalem bitince konuşur.", "The reserve speaks when the main line is spent."),
    ("Kesin Hesap", "Final Account", "muhurluk", "kasa", 3, 2, 0, None, None, None, 0, "push.kasa.3;hukum.1", "Kesin hesap, itirazı kapatır.", "The final account closes objection."),
    ("Harcırah Bordrosu", "Per Diem Sheet", "acik", "kasa", 1, 0, 0, None, None, None, 0, "push.kasa.1;push.koridor.1", "Harcırah, kalemi yola çıkarır.", "Per diem puts the pen on the road."),
    ("Tediye Emri", "Payment Order", "heyet", "kasa", 2, 1, 0, None, None, "tediye-emri", 3, "push.kasa.2;seal.1", "Emir, kasayı yürüyüşe geçirir.", "The order puts the till in motion."),
    ("Tahsilat Makbuzu", "Collection Receipt", "acik", "kasa", 2, 0, 0, None, None, None, 0, "push.kasa.2;heat.-1", "Tahsilat, ısının parasını keser.", "Collection cuts the cost of heat."),
    ("Açık Kalem Notu", "Open Line Note", "artci", "kasa", 1, 0, 1, None, None, None, 0, "push.kasa.1;peek", "Açık kalem, kapanmayı bekler.", "An open line waits to close."),
    ("Döviz Tahsisi", "Currency Allocation", "acik", "kasa", 2, 0, 0, None, None, None, 0, "push.kasa.1;heat.2", "Tahsis, kasayı gerer.", "Allocation tightens the till."),
    ("İhale Cetveli", "Tender Roll", "acik", "kasa", 2, 0, 0, None, None, None, 0, "push.kasa.1;mill.1", "Cetvel, kimlerin el kaldırdığını gösterir.", "The roll shows whose hand went up."),
    ("Sayman İmzasız", "Unsigned Accountant", "karsi", "kasa", 1, 0, 0, None, None, None, 0, "protect.kasa;discard.1", "İmzasız kâğıt, karşı iddiayı düşürür.", "Unsigned paper drops the counter-claim."),
    ("Kasa Farkı", "Till Difference", "acik", "kasa", 1, 0, 0, None, None, None, 0, "pull.kasa.1.opp;heat.1", "Fark, rakibin kalemini sallar.", "The difference shakes the opponent's line."),
    ("İcmal Defteri", "Summary Ledger", "heyet", "kasa", 2, 0, 0, None, None, "icmal-defter", 3, "push.kasa.1;push.any.1", "İcmal, beş masanın rakamını tek sayfada toplar.", "The summary gathers five desks on one page."),
    ("Ödenek İadesi", "Appropriation Return", "artci", "kasa", 2, 0, 3, None, None, None, 0, "push.kasa.2;seal.1", "İade, harcanmamış kalemi geri getirir.", "Return brings the unspent line back."),
    ("Vesait Bordrosu", "Vehicle Sheet", "acik", "kasa", 1, 0, 0, None, None, None, 0, "push.kasa.1;push.nobet.1", "Vesait, gece de sayılır.", "Vehicles are counted at night as well."),
    # manset remainder
    ("Gazete Kupürü", "Press Cutting", "acik", "manset", 1, 0, 0, None, None, None, 0, "push.manset.1;peek", "Kupür, dünün cümlesini bugüne taşır.", "A cutting carries yesterday's sentence into today."),
    ("Manşet Değişikliği", "Headline Change", "acik", "manset", 2, 0, 0, None, None, None, 0, "steal.manset.1;heat.1", "Değişiklik, rakibin cümlesini senin yapar.", "A change makes the opponent's sentence yours."),
    ("Rotatif Notu", "Rotary Note", "artci", "manset", 1, 0, 2, None, None, None, 0, "push.manset.2;heat.2", "Makine ısınınca sayı erken çıkar.", "When the machine heats, the issue comes early."),
    ("Kurul Notu", "Board Note", "acik", "manset", 2, 1, 0, None, None, None, 0, "push.manset.1;push.any.1", "Kurul notu, manşeti resmi dile çevirir.", "A board note turns the headline into official speech."),
    ("Okur Mektubu", "Reader Letter", "acik", "manset", 1, 0, 0, None, None, None, 0, "push.manset.1;mill.1", "Mektup, ajansın duymadığını basar.", "The letter prints what the agency did not hear."),
    ("İlan Tarifesi", "Notice Tariff", "acik", "manset", 1, 1, 0, None, None, None, 0, "push.manset.1;seal.1", "Tarife, ilanı pahalı kılar.", "The tariff makes the notice expensive."),
    ("Kapak Provası", "Cover Proof", "muhurluk", "manset", 2, 2, 0, None, None, None, 0, "push.manset.3;heat.1", "Kapak, sayıdan önce hükmü ilan eder.", "The cover announces the ruling before the issue."),
    ("Gece Baskısı", "Night Edition", "heyet", "manset", 2, 0, 0, None, None, None, 0, "push.manset.1;push.nobet.1", "Gece baskısı, nöbetle manşeti birleştirir.", "The night edition joins watch and headline."),
    ("Ajans Düzeltisi", "Agency Correction", "karsi", "manset", 1, 0, 0, None, None, None, 0, "protect.manset;pull.manset.1.opp", "Düzeltı, yanlış cümleyi yolda yakalar.", "The correction catches the wrong sentence on the road."),
    ("Başlık Puntosu", "Headline Point Size", "acik", "manset", 1, 0, 0, None, None, None, 0, "push.manset.1;heat.1", "Punto büyüyünce cümle ağırlaşır.", "When the point size grows, the sentence grows heavy."),
    ("Resmi Yalanlama", "Official Denial", "acik", "manset", 2, 0, 0, None, None, None, 0, "pull.manset.2.opp;heat.2", "Yalanlama, rakip manşeti boşaltır.", "A denial empties the opposing headline."),
    ("Dağıtılmayan Sayı", "Unissued Copy", "artci", "manset", 2, 0, 1, None, None, None, 0, "pull.manset.1.opp;mill.1", "Dağıtılmayan sayı, okunmamış hükümdür.", "An unissued copy is an unread ruling."),
    ("Manşet Kavgası", "Headline Dispute", "acik", "manset", 2, 0, 0, None, None, None, 0, "push.manset.2;heat.2", "Kavga, ısınmayı kabul ederek yürür.", "The dispute walks by accepting the heat."),
    ("Matbaa Mürekkebi", "Press Ink", "acik", "manset", 1, 0, 0, None, None, None, 0, "ink.2;push.manset.1", "Mürekkep bitince sayı susar.", "When the ink runs out, the issue falls silent."),
    ("İkinci Baskı", "Second Edition", "artci", "manset", 2, 0, 2, None, None, "ikinci-baski", 3, "push.manset.2;draw.1", "İkinci baskı, birinciyi düzeltir.", "The second edition corrects the first."),
    ("Kupür Arşivi", "Cutting Archive", "acik", "manset", 1, 0, 0, None, None, None, 0, "peek;draw.1", "Arşiv, eski manşeti yeni dosyaya bağlar.", "The archive binds an old headline to a new file."),
    ("İlan Metni", "Notice Text", "acik", "manset", 1, 0, 0, None, None, None, 0, "push.manset.1", "Metin kısa, etkisi uzun olur.", "The text is short; its effect is long."),
    ("Dizgi Taslağı", "Typesetting Draft", "acik", "manset", 2, 0, 0, None, None, None, 0, "push.manset.1;discard.1", "Taslak, fazla kelimeyi düşürür.", "The draft drops the extra words."),
    # koridor remainder
    ("Havluya Asılan", "Hung on the Towel", "acik", "koridor", 1, 0, 0, None, None, None, 0, "push.koridor.1;heat.1", "Havluya asılan dosya unutulmuş sayılmaz.", "A file hung on the towel is not treated as forgotten."),
    ("Ziyaretçi Defteri", "Visitor Ledger", "acik", "koridor", 1, 0, 0, None, None, None, 0, "push.koridor.1;peek", "Defter, kimlerin geçtiğini yazar.", "The ledger writes who passed."),
    ("Randevu Cetveli", "Appointment Roll", "acik", "koridor", 2, 0, 0, None, None, None, 0, "push.koridor.1;ink.1", "Cetvel, sırayı resmi kılar.", "The roll makes the order official."),
    ("Koridor Fısıltısı", "Corridor Whisper", "artci", "koridor", 1, 0, 2, None, None, None, 0, "push.koridor.2;heat.1", "Fısıltı, sabah tutanağa döner.", "The whisper turns into a minute at dawn."),
    ("İkinci Kat Çayı", "Second-Floor Tea", "acik", "koridor", 1, 0, 0, None, None, None, 0, "push.koridor.1;draw.1", "Çay molası, imzayı gevşetir.", "The tea break loosens the signature."),
    ("Antekağıt", "Scratch Sheet", "acik", "koridor", 1, 0, 0, None, None, None, 0, "peek;mill.1", "Antekağıt, henüz resmi olmayan cümledir.", "A scratch sheet is a sentence not yet official."),
    ("Kapı Çalındı", "Door Knocked", "acik", "koridor", 2, 0, 0, None, None, None, 0, "steal.koridor.1;heat.1", "Kapı çalınca sıra bozulur.", "When the door is knocked, the order breaks."),
    ("Danışma Notu", "Enquiry Note", "karsi", "koridor", 1, 0, 0, None, None, None, 0, "protect.koridor;heat.-1", "Danışma, acele dosyayı yavaşlatır.", "Enquiry slows a hurried file."),
    ("Kalem Arkadaşı", "Fellow Clerk", "acik", "koridor", 2, 0, 0, None, None, None, 0, "push.koridor.1;draw.1", "Arkadaş, parafı hızlandırır.", "A fellow clerk speeds the initials."),
    ("Şerh Düşüldü", "Annotation Entered", "acik", "koridor", 1, 0, 0, None, None, None, 0, "push.koridor.1;pull.koridor.1.opp", "Şerh, karşı cümleyi keser.", "The annotation cuts the opposing sentence."),
    ("Ek-1", "Annex 1", "heyet", "koridor", 2, 0, 0, None, None, None, 0, "push.koridor.1;push.any.1", "Ek, asıl yazıyı başka masaya taşır.", "The annex carries the main paper to another desk."),
    ("Dağıtım Yerine", "In Lieu of Circulation", "artci", "koridor", 1, 0, 1, None, None, None, 0, "push.koridor.1;mill.1", "Yerine yazılan, asıl dağıtımı bekletir.", "What is written in lieu holds the real circulation."),
    ("Dosya Takibi", "File Tracking", "acik", "koridor", 1, 0, 0, None, None, None, 0, "peek;push.koridor.1", "Takip, kaybolan evrakı masaya döndürür.", "Tracking returns a lost paper to the desk."),
    ("Bekleyen Paraf", "Pending Initials", "acik", "koridor", 2, 0, 0, None, None, None, 0, "push.koridor.2", "Bekleyen paraf, koridoru doldurur.", "Pending initials fill the corridor."),
    ("Koridor Nöbeti", "Corridor Watch", "acik", "koridor", 2, 0, 0, None, None, None, 0, "push.koridor.1;push.nobet.1", "Koridor da bir nöbettir.", "The corridor is also a watch."),
    ("Müdür Yardımcısı Notu", "Deputy Note", "muhurluk", "koridor", 2, 2, 0, None, None, None, 0, "push.koridor.2;seal.1", "Not, imzayı vekâleten taşır.", "The note carries the signature by deputy."),
    ("Havale Sureti", "Referral Copy", "acik", "koridor", 1, 0, 0, None, None, None, 0, "push.koridor.1;heat.-1", "Suret, asıl havaleyi soğutur.", "The copy cools the original referral."),
    ("Sıra Numarası", "Queue Number", "acik", "koridor", 1, 0, 0, None, None, None, 0, "push.koridor.1;ink.1", "Numara, kapı önünü düzene sokar.", "The number puts the doorway in order."),
    # nobet remainder
    ("Arşiv Kapısı", "Archive Door", "acik", "nobet", 1, 0, 0, None, None, None, 0, "push.nobet.1;peek", "Kapı açılınca eski dosya uyanır.", "When the door opens, an old file wakes."),
    ("Mesai Dışı Giriş", "After-Hours Entry", "artci", "nobet", 2, 0, 2, None, None, None, 0, "push.nobet.2;heat.2", "Mesai dışı giriş ısınmayı kabul eder.", "After-hours entry accepts the heat."),
    ("Nöbet Listesi", "Watch Roster", "acik", "nobet", 1, 0, 0, None, None, None, 0, "push.nobet.1;draw.1", "Liste, kimin uyanık kalacağını yazar.", "The roster writes who stays awake."),
    ("Gece Evrakı", "Night Papers", "acik", "nobet", 2, 0, 0, None, None, None, 0, "push.nobet.1;push.koridor.1", "Gece evrakı sabah koridora çıkar.", "Night papers enter the corridor at dawn."),
    ("İzinsiz Işık", "Unauthorised Light", "acik", "nobet", 1, 0, 0, None, None, None, 0, "push.nobet.1;heat.1", "Işık, bakılmaması gereken yeri gösterir.", "Light shows the place that should not be looked at."),
    ("Nöbetçi Kalem", "Watch Clerk", "heyet", "nobet", 2, 0, 0, None, None, None, 0, "push.nobet.1;push.any.1", "Nöbetçi kalem, beş masayı tek başına tutar.", "The watch clerk holds five desks alone."),
    ("Sabaha Kalan", "Left Until Dawn", "artci", "nobet", 1, 0, 1, None, None, None, 0, "push.nobet.1;ink.1", "Sabaha kalan dosya uykusuzdur.", "A file left until dawn does not sleep."),
    ("Devredilen Mühür", "Handed Seal", "muhurluk", "nobet", 2, 2, 0, None, None, None, 0, "seal.2;push.nobet.1", "Devredilen mühür, geceyi resmi kılar.", "A handed seal makes the night official."),
    ("Nöbet Raporu", "Watch Report", "acik", "nobet", 2, 0, 0, None, None, None, 0, "push.nobet.2;heat.-1", "Rapor, ısının düştüğünü kaydeder.", "The report records that heat fell."),
    ("Kapalı Kasa", "Closed Till", "karsi", "nobet", 1, 0, 0, None, None, None, 0, "protect.kasa;protect.nobet", "Kapalı kasa, gece dokunulmaz.", "A closed till is not touched at night."),
    ("Gece Çağrısı", "Night Call", "acik", "nobet", 2, 0, 0, None, None, None, 0, "steal.nobet.1;draw.1", "Çağrı, nöbeti başka odaya alır.", "The call takes the watch to another room."),
    ("Nöbet Defteri Eksik", "Incomplete Watch Ledger", "acik", "nobet", 1, 0, 0, None, None, None, 0, "pull.nobet.1.opp;mill.1", "Eksik sayfa, rakip nöbeti zayıflatır.", "A missing page weakens the opposing watch."),
    ("Tutanak Sureti", "Minute Copy", "acik", "nobet", 1, 0, 0, None, None, None, 0, "push.nobet.1;seal.1", "Suret, tutanağı çoğaltır.", "The copy multiplies the minute."),
    ("Sabah Sayımı", "Dawn Count", "heyet", "nobet", 2, 0, 0, None, None, None, 0, "push.nobet.1;push.kasa.1", "Sayım, gece ile kasayı karşılaştırır.", "The count compares the night with the till."),
    ("Nöbet İmzası", "Watch Signature", "acik", "nobet", 1, 1, 0, None, None, None, 0, "push.nobet.1;seal.1", "İmza, nöbeti kapatır.", "The signature closes the watch."),
    ("Bekçi Çayı", "Keeper's Tea", "acik", "nobet", 1, 0, 0, None, None, None, 0, "push.nobet.1;heat.-1", "Çay, ısınmayı düşürür; nöbeti tutar.", "Tea lowers the heat and holds the watch."),
    ("Devriye Çizelgesi", "Round Chart", "artci", "nobet", 2, 0, 3, None, None, "gece-devri", 3, "push.nobet.2;peek", "Çizelge, üç tur sonra konuşur.", "The chart speaks after three rounds."),
    ("Anahtar Askısı", "Key Hook", "acik", "nobet", 1, 0, 0, None, None, None, 0, "protect.nobet;push.nobet.1", "Askıdaki anahtar, kapıyı kimsenin sanmasına izin vermez.", "A key on the hook lets no one assume the door."),
    # any / heyet remainder
    ("Usul İtirazı", "Procedural Objection", "karsi", "any", 1, 0, 0, None, None, None, 0, "pull.any.1.opp;heat.1", "Usul, esastan önce konuşur.", "Procedure speaks before the substance."),
    ("Esas Hakkında", "On the Merits", "acik", "any", 2, 0, 0, None, None, None, 0, "push.any.2", "Esas, usul bittikten sonra yürür.", "The merits walk after procedure is done."),
    ("Ara Müzekkere", "Interim Memorandum", "artci", "any", 1, 0, 2, None, None, None, 0, "push.any.1;seal.1", "Müzekkere, kararı bekletir.", "The memorandum holds the ruling."),
    ("Kurul Mührü", "Board Seal", "muhurluk", "any", 3, 3, 0, None, None, None, 0, "hukum.1;seal.2;push.any.1", "Kurul mührü, hükmü ağırlaştırır.", "The board seal weights the ruling."),
    ("Yetki Devri", "Delegation", "heyet", "any", 2, 1, 0, None, None, None, 0, "steal.any.1;ink.1", "Devir, imzayı başka masaya taşır.", "Delegation carries the signature to another desk."),
    ("Yeniden Görüşme", "Rehearing Note", "acik", "any", 2, 0, 0, None, None, None, 0, "unlock.any;heat.2", "Yeniden görüşme, kilitli dosyayı açar.", "A rehearing opens a locked file."),
    ("Üye Listesi", "Member List", "acik", "any", 1, 0, 0, None, None, None, 0, "push.any.1;draw.1", "Liste, heyetin kimlerden kurulduğunu yazar.", "The list writes who the board is made of."),
    ("Yedek Üye", "Alternate Member", "acik", "any", 1, 0, 0, None, None, None, 0, "push.any.1;ink.1", "Yedek, asıl üye susunca konuşur.", "The alternate speaks when the sitting member is silent."),
    ("Tutanak Eksik", "Incomplete Minute", "acik", "any", 1, 0, 0, None, None, None, 0, "mill.1;pull.any.1.opp", "Eksik tutanak, rakip hükmü zayıflatır.", "An incomplete minute weakens the opposing ruling."),
    ("Kapalı Oturum Notu", "Closed Session Note", "artci", "any", 2, 0, 1, None, None, None, 0, "push.any.1;peek", "Kapalı oturum, koridoru dışarıda bırakır.", "A closed session leaves the corridor outside."),
    ("Karar Özeti", "Ruling Digest", "heyet", "any", 2, 0, 0, None, None, "karar-ozet", 3, "push.any.1;hukum.1", "Özet, uzun zabtı hükme çevirir.", "The digest turns a long minute into a ruling."),
    ("İstişare Notu", "Consultation Note", "acik", "any", 1, 0, 0, None, None, None, 0, "peek;heat.-1", "İstişare, ısınmadan önce konuşur.", "Consultation speaks before the heat."),
    ("Fezleke Taslağı", "Summary Draft", "acik", "any", 2, 1, 0, None, None, None, 0, "push.any.1;seal.1", "Fezleke, dağınık evrakı tek cümlede toplar.", "The summary gathers scattered paper into one sentence."),
    ("Toplu Paraf", "Collective Initials", "heyet", "any", 2, 0, 0, None, None, None, 0, "push.koridor.2;push.any.1", "Toplu paraf, koridoru kısaltır.", "Collective initials shorten the corridor."),
    ("Gündem Maddesi", "Agenda Item", "acik", "any", 1, 0, 0, None, None, None, 0, "push.any.1", "Madde, heyetin ne konuşacağını seçer.", "The item chooses what the board will speak."),
    ("Ek Gündem", "Added Agenda", "artci", "any", 1, 0, 3, None, None, None, 0, "push.any.2;heat.1", "Ek madde, üç tur sonra masaya düşer.", "The added item falls on the desk after three turns."),
    ("Müzekkere Sureti", "Memorandum Copy", "acik", "any", 1, 0, 0, None, None, None, 0, "push.any.1;mill.1", "Suret, asıl müzekkereyi çoğaltır.", "The copy multiplies the memorandum."),
    ("Ara Karar Sureti", "Interim Copy", "karsi", "any", 2, 0, 0, None, None, None, 0, "protect.any;pull.any.1.opp", "Suret, karşı hükmü bekletir.", "The copy holds the opposing ruling."),
]


def parse_ops(s):
    ops = []
    if not s:
        return ops
    for tok in s.split(";"):
        p = tok.split(".")
        op = p[0]
        if op == "push":
            ops.append({"op": "push", "desk": p[1], "n": int(p[2])})
        elif op == "pull":
            ops.append({"op": "pull", "desk": p[1], "n": int(p[2]), "who": p[3]})
        elif op == "steal":
            ops.append({"op": "steal", "desk": p[1], "n": int(p[2])})
        elif op == "seal":
            ops.append({"op": "seal", "n": int(p[1])})
        elif op == "heat":
            ops.append({"op": "heat", "n": int(p[1])})
        elif op == "ink":
            ops.append({"op": "ink", "n": int(p[1])})
        elif op == "draw":
            ops.append({"op": "draw", "n": int(p[1])})
        elif op == "mill":
            ops.append({"op": "mill", "n": int(p[1])})
        elif op == "hukum":
            ops.append({"op": "hukum", "n": int(p[1])})
        elif op == "protect":
            ops.append({"op": "protect", "desk": p[1]})
        elif op == "unlock":
            ops.append({"op": "unlock", "desk": p[1]})
        elif op == "discard":
            ops.append({"op": "discard", "n": int(p[1])})
        elif op == "peek":
            ops.append({"op": "peek"})
        else:
            raise SystemExit(f"unknown op {tok}")
    return ops


def row_to_card(i, row):
    (tr, en, typ, desk, cost, seal, delay, family, exclusive, chain, step, ops, ftr, fen) = row
    card = {
        "id": f"ITL-{i:03d}",
        "title": {"tr": tr, "en": en},
        "type": typ,
        "desk": desk,
        "cost": cost,
        "seal": seal,
        "delay": delay,
        "family": family,
        "exclusive": exclusive,
        "once": typ == "muhurluk",
        "effect": parse_ops(ops),
        "flavor": {"tr": ftr, "en": fen},
        "a11y": {
            "tr": f"{tr}. {ftr}",
            "en": f"{en}. {fen}",
        },
    }
    if chain:
        card["chain"] = {"id": chain, "step": step}
    if delay and delay > 0 and typ != "artci":
        card["type"] = "artci"
    return card


def main():
    all_rows = ROWS + SHARED
    if len(all_rows) < 180:
        raise SystemExit(f"expected 180+ rows, got {len(all_rows)}")
    trs = [r[0] for r in all_rows]
    ens = [r[1] for r in all_rows]
    if len(set(trs)) != len(all_rows):
        from collections import Counter
        c = Counter(trs)
        raise SystemExit(f"dup TR: {[k for k,v in c.items() if v>1]}")
    if len(set(ens)) != len(all_rows):
        from collections import Counter
        c = Counter(ens)
        raise SystemExit(f"dup EN: {[k for k,v in c.items() if v>1]}")
    cards = [row_to_card(i + 1, r) for i, r in enumerate(all_rows)]
    delayed = sum(1 for c in cards if c["delay"] > 0 or c["type"] == "artci")
    chains = {c["chain"]["id"] for c in cards if c.get("chain")}
    families = {c["family"] for c in cards if c["family"]}
    print(f"cards={len(cards)} delayed={delayed} chains={len(chains)} families={len(families)}")
    if delayed < 30:
        raise SystemExit("need 30+ delayed")
    if len(chains) < 20:
        raise SystemExit("need 20+ chains")
    if len(families) < 8:
        raise SystemExit("need 8+ families")
    import json
    out = Path("/workspace/cete-savaslari/public/games/ihtilal/cards.js")
    body = json.dumps(cards, ensure_ascii=False, indent=2)
    out.write_text(
        "/** Authored İHTİLAL dosya catalog. Unique ids, titles, effects. */\n"
        f"export const CARDS = {body};\n\n"
        "export const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));\n"
        "export function cardOf(id) { return CARD_BY_ID[id] || null; }\n",
        encoding="utf-8",
    )
    print("wrote", out, "bytes", out.stat().st_size)


if __name__ == "__main__":
    main()
