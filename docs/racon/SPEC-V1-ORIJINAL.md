# RACON MANAGER — Grok Build Prompt
# Proje: tariklab.com
# Yapıştırıldığı yer: Grok Build / Grok App Builder (tek seferde tüm prompt)
# Dil: Oyun arayüzü ve metinler TÜRKÇE. Kod değişken adları İngilizce.

---

Sen kıdemli bir oyun programcısı ve UI tasarımcısısın. tariklab.com için **Racon Manager** adlı tek sayfalık (SPA) tarayıcı oyunu üreteceksin.

Bu bir Football Manager kopyası DEĞİL. Football Manager’ın **ekran omurgasını** alır (üst şerit + sol nav + orta sahne + sağ bağlam + İlerlet). Ligini, fikstürünü, 11’li sahayı, 40 attribute’u ALMAZ.

Tek cümle: Mahalleye adsız girersin. İş yaparak ad, ad ile adam, adam ile sokak, sokak ile heat, heat ile memur, memur ile dosya birikir. Takvim boş başlar. Maç fikstürü yoktur.

## 0) SERT KURALLAR (ihlal etme)

1. Haftalık otomatik maç sistemi YOK. Yeni oyunda hazır fikstür YOK. Takvim boştur; sadece oyuncu planı, yükümlülük ve husumet/dosya motoru doldurur.
2. 90+ husumet “haftalık rastgele maç” AÇMAZ. Tehdit/fırsat yazar. Çatışma ancak oyuncu kabul ederse veya tehdidi ertelerken bedel öderse yürür.
3. Boş GÜN meşrudur (maç yok). Boş BASINÇ meşru değildir: yevmiye, dosya tozu, rakip büyümesi, küs adam her İlerlet’te işler.
4. Tek “şöhret” barı YOK. Dört itibar: Korku, Saygı, Nam, Racon. Dosya % ayrı motordur, itibar değildir.
5. Korku ve Saygı aynı anda tavan yapamaz (soft cap: ikisi birden 70+ olamaz; artan diğerini yer).
6. Ekran YATAY zorunlu. Dikeyde yalnızca “Telefonu yan çevir” kilit ekranı. Masaüstü ve yatay telefon AYNI üç sütun.
7. Hover’a bağlı bilgi YOK. Dokunma hedefleri minimum 40px. `100vh` kullanma; `#app` flex column, orta sahne `overflow:auto`. Çift İlerlet kilitli (re-entry guard).
8. Şiddetin bedeli var: her ölüm dosya parçası + husumet + olası yükümlülük (cenaze/bakım) üretir.
9. Racon ihlal etiketleri: `kadin`, `cocuk`, `okul`, `cenaze`, `ispiyon`, `masada_yalan`. Bu etiketli iş Racon düşürür.
10. Kayıt anahtarı: `racon_v1` (localStorage). Eski `cete_hanedan_v2` okunmaz, üzerine yazılmaz.
11. Dış API, hesap, sunucu, ses paketi, 3D, yeşil futbol sahası, neon, mor “portal”, emoji yağmuru YOK.
12. Faz 1 oynanabilir çekirdek TAMAMLANACAK. Faz 2–5 kapılarının UI’si görünsün ama “bu aşamada kilitli” desin; mimari onları kabul edecek şekilde yazılsın (tek store, tek event bus).

## 1) GÖRSEL DİL (TLab / FM omurgası)

```
Zemin:        #080706
Yüzey:        #141210
Yüzey-2:      #1c1916
Çizgi:        #2a2622
Yazı:         #f0e6d4
Yazı soluk:   #8a8074
Vurgu krem:   #c4a574
Dosya kırmızı:#8b2e1f
Hasım:        #8b2e1f
Saygı:        #6b8f71
Heat/uyarı:   #b8860b
```

Font: sistem + `ui-sans-serif`, başlıklar biraz daha sıkı tracking (`0.12em` üst şerit). Kart köşe 10–12px. Grain + hafif vignette (mevcut TLab hissi). Futbol yeşili YOK.

Üst şerit ~44px: `RACON MANAGER` · semt · hafta · dosya% · kasa TL · gecikmiş rozet · **İLERLET**.
Sol nav ~200px (dar ekranda ikon+yazı, çok darda yalnızca ikon): Olaylar, Takvim, Adamlar, Harita, İşler, Emniyet, Husumet, Kasa.
Orta: tek sahne.
Sağ ~240px: dört itibar barı + unvan (`SERSERİ · FATİH`) + bu haftanın 3 satır özeti. 900px altında sağ panel drawer (alt veya sağdan açılan).

## 2) FAZ 1 KAPSAMI (bunu gerçekten inşa et)

Harita: TEK mahalle, 4 sokak (ör. Fatih: Fevzi Paşa, Akşemsettin, Çarşamba, Macar Kardeşler).
Kadro: oyuncu + 3 başlangıç adamı (zayıf).
İş tipleri (rutin): `tahsilat`, `kepenk`, `tek_arac`.
Büyük operasyon (tek): `bakkal_soygunu` — kupa iskeleti, nadir, hazırlık ister.
Rakipler: TEK rakip ekip (“Kartallar”). Başta ilişki YOK (soluk).
Emniyet: tek heat/dosya barı + henüz isimsiz “karakol dikkati”. İsimli polis kartı Faz 3 — UI’de kilitli kapı.
Olay motoru (çekirdek kural): onların sokağında iş yap → 2 tur sonra Göz tehdidi takvime düşer. Tekrarlanırsa Sürtüşme. 3. ihlalde Hasım tehdidi (pusu teklifi — kabul/ertele).
Kayıt / yeni oyun / sil.

Faz 1’de OLMAYACAK ama nav’da kilitli duracak: çoklu mahalle, alt ekip, aklama, savcı, masa/oturum sahnesinin tam diplomasisi, hanedan finali.

## 3) VERİ MODELİ (TypeScript şekli — buna uy)

```ts
type Stage = "serseri" | "delikanli" | "kabadayi" | "agabey" | "baba" | "aile_reisi" | "hanedan";

type RelBand = "yok" | "goz" | "surtusme" | "hasim" | "belali" | "kan";

interface Stats {
  kabadayilik: number; // 1-20
  silah: number;
  sogukkan: number;
  kurnazlik: number;
  agiz: number;
  sadakat: number;
  gizlilik: number;
  direksiyon: number;
  hesap: number;
}

interface Man {
  id: string;
  ad: string;
  lakap?: string;
  rol: "kirici" | "tetikci" | "gozcu" | "sofor" | "agiz" | "muhasebeci" | "muhbir" | "ayakci";
  stats: Stats;
  gonul: number;       // 0-100 hak yendi mi
  yevmiye: number;
  durum: "hazir" | "yorgun" | "yarali" | "hapis" | "olu";
  yaraTur?: number;
  bag?: string;        // "karakol kuzeni" vb.
  yorgunluk: number;   // 0-100
}

interface Cop { // Faz 3'te dolar; şimdi dizi boş olabilir
  id: string;
  ad: string;
  birim: "karakol" | "ilce" | "organize" | "savcilik";
  acgoz: number;
  risk: number;
  baglilik: number;
  kilitli: boolean;
}

interface Rival {
  id: string;
  ad: string;          // "Kartallar"
  husumet: number;     // 0-100
  band: RelBand;
  agresiflik: number;
  streetsClaimed: string[];
}

interface Street {
  id: string;
  ad: string;
  sahip: "sen" | "rakip" | "bos";
  heat: number;        // sokak heat 0-100
}

interface EvidencePiece {
  id: string;
  kind: "kamera" | "iz" | "tanik" | "sinyal" | "ihbar";
  streetId: string;
  week: number;
  weight: number;
}

interface CalItem {
  id: string;
  week: number;
  day: 1|2|3|4|5|6|7;  // 1=Pzt
  strip: "plan" | "yukumluluk" | "tehdit";
  title: string;
  body: string;
  ref?: { jobId?: string; rivalId?: string; manId?: string };
  status: "bekler" | "kabul" | "ertelendi" | "bitti" | "kacirildi";
}

interface Job {
  id: string;
  kind: "tahsilat" | "kepenk" | "tek_arac" | "bakkal_soygunu";
  streetId: string;
  prepLeft: number;     // 0 ise koşulabilir
  assigned: string[];   // man ids
  tags: string[];       // racon etiketleri
  phase: "idle" | "prep" | "running" | "done";
}

interface Rep {
  korku: number;   // 0-100
  saygi: number;
  nam: number;
  racon: number;
}

interface SaveState {
  kind: "racon_v1";
  week: number;
  day: 1|2|3|4|5|6|7;
  stage: Stage;
  lakap: string;
  streetHome: string;
  kasa: number;
  dosya: number;         // 0-100 türetilmiş + saklanan
  evidence: EvidencePiece[];
  rep: Rep;
  men: Man[];
  rivals: Rival[];
  streets: Street[];
  cops: Cop[];
  calendar: CalItem[];
  jobs: Job[];
  inbox: { id: string; title: string; body: string; week: number; read: boolean; href?: string }[];
  defter: string[];      // kısa kronik satırları
  flags: Record<string, boolean | number>;
  savedAt: number;
}
```

Yeni oyun varsayılanı:
- stage `serseri`, week 1 day 1, kasa 18000, dosya 0
- rep: korku 5, saygi 8, nam 2, racon 70
- 3 adam (ayakçı / şoför / gözcü karışımı, stat 4–9)
- Kartallar husumet 0 band `yok`, 1 sokağa “bos” değil “rakip” iddiası yok — 1 sokak `bos`, 1 sokak rakibe yakın soluk
- calendar `[]`, inbox tek satır: “Mahalle duruyor.”

## 4) İLERLET MOTORU (her tık)

Re-entry guard. Sıra:

1. Günün yükümlülükleri kaçırıldı mı? Kaçırılan: saygı −, racon − (türe göre), inbox.
2. Aktif iş `running` ise bir tick çöz (aşağıda iş motoru). Bitmediyse gün yine de ilerleyebilir — iş çok turlu olabilir.
3. Yevmiye (yalnızca haftanın 7. günü): her canlı adam `yevmiye` kadar kasa yer. Ödenemezse gönül −15, durum “küs” bayrağı.
4. Yorgunluk −8 (işte olmayanlara). İşte olanlara +12, 80+ ise durum `yorgun`.
5. Dosya: mevcut parçaların ağırlığı + nam*0.05 + o haftaki gürültü. Taban her hafta +1 “toz”.
6. Rakip AI: senin 2 haftadır dokunmadığın `bos` sokağa %40 yürüme. Yürürse inbox + harita.
7. Husumet band güncelle (0 yok, 15 göz, 40 sürtüşme, 70 hasım, 85 belalı, 90 kan). Kan’da haftalık rastgele MAÇ yok; 1 tehdit kâğıdı şansı.
8. Olay üret (en fazla 0–2 yeni CalItem/Inbox). Kaynakler: husumet, dosya≥40 uyarı, dosya≥75 “sivil araç”, gönül<30 ihanet riski kâğıdı, rakip yürüyüşü.
9. Gün +1; gün 8 olursa hafta +1 gün 1.
10. Kademe kapılarını kontrol et (aşağı).
11. Kaydet.

İlerlet, bekleyen tehdit varken onay modalı: “Ertelenecek tehdit var. Bedeli olsun mu?” Evet = status `ertelendi`, husumet +8 veya dosya +6.

## 5) İŞ MOTORU (rutin = lig maçı)

Akış tick’leri: `kesif` → `yaklasma` → `temas` → `tepki` → `kacis` → `iz`.

Her tick 1–2 Türkçe satır (“Hasan kepenge yaklaştı”, “İçeride iki kişi, biri bağırıyor”).
Kritik tick’te (`temas` / `tepki`) oyuncu 4 talimat: Sessiz / Sıkıştır / Çekil / Ateş.
Sadakat <40 ve talimat `cekil` veya `sessiz` ise % (50-sadakat) dinlemez.

Çıktı 5 kalem:
- para (kasa+)
- yara/ölüm (adam durum)
- tanık (0–2) → evidence `tanik`
- delil (gizlilik düşükse `kamera`/`iz`)
- heat (sokak.heat + dosya)

Racon etiketi varsa (`okul` semt şartı rastgele %8): racon −8, inbox.

`bakkal_soygunu` aynı motor + 2 ekstra tick ve zorunlu 3 adam (kırıcı/gözcü/şoför). Başarı yüksek ganimet + nam + dosya. Başarısızlık yara veya hapis riski.

İş planlama: İşler ekranından sokak + tür + adam seç. `prepLeft` tahsilat 0, kepenk 1, tek_arac 1, soygun 2. Hazırlık bitmeden koşma. Plan takvime `strip:"plan"` düşer.

## 6) DÖRT İTİBAR

Her iş sonrası küçük delta. Örnek:
- sessiz tahsilat: saygi +2, nam +1, korku 0, dosya +2
- ateş: korku +6, saygi −3, nam +5, dosya +10, racon 0 (etiket yoksa)
- çekil başarısız: korku −2, saygi −2

Soft cap korku/saygı: birini artırırken diğeri 70+ ise diğerinden 1 düş.

Racon 40 altına inince rakipler masaya oturmaz (Faz 5 kapısı) ve Hasım ittifak şansı doğar (Faz 2). Faz 1’de yalnızca inbox: “Raconun konuşuluyor.”

## 7) KADEME KAPILARI (Faz 1’de 1→2 açılsın, sonrası kontrol edilsin)

Unvan Inbox cümlesiyle gelir. XP yok.

- serseri → delikanli: 3 tamamlanmış iş + ≥2 canlı adam + ev sokağında heat<80
- delikanli → kabadayi: 1 sokak `sahip:"sen"` + kasa≥40000 + nam≥20 + dosya<70 (Faz 1 sonu hedefi; olursa açılsın)
- kabadayi+ : kapı mesajı, içerik kilit

Geri düşme Faz 1’de yok (flag). Mimari `stageDown()` boş fonksiyon.

## 8) EKRANLAR

**Olaylar (home):** okunmamış üstte. Satır tıklayınca orta panelde kâğıt + 1–3 eylem (Git / Ertele / Dosyala).

**Takvim:** haftanın 7 sütunu, 3 şerit rengi (plan krem, yükümlülük soluk, tehdit kırmızı). Boş hücre boş kalsın.

**Adamlar:** liste + kâğıt. 9 bar. Durum hapı. İki adam karşılaştır (max 2).

**Harita:** 4 sokak kartı/ızgara, sahip rengi. Tık → sağda sahip, heat, “bu sokakta iş planla”.

**İşler:** plan form + kuyruk. Running iş varsa “İş günü” butonu orta sahneyi motora alır.

**Emniyet:** dosya % bar, evidence listesi (parça adı, hafta). “Polis tanıdıkları — kilitli (Ağabey)”.

**Husumet:** Kartallar kâğıdı, band kelimesi, 0–100 gizli tutulabilir — oyuncu kelime görsün. “Masa — kilitli”.

**Kasa:** bakiye, yevmiye toplamı, son 8 hareket (defterden).

**Dikey kilit:** ortada `RACON MANAGER` + “Telefonu yan çevir”.

## 9) METİN TONU

Kısa, kuru, mahalle. “Beklenen goller” yok. “Racon”, “heat”, “yevmiye”, “dosya”, “Göz”, “Hasım”.
Inbox örnekleri:
- “Mahalle duruyor.”
- “Kartallar Fevzi Paşa’da göründü.”
- “Hasan kepengi erken kapattı. Gönül ince.”
- “Karakol sivil araç sordu. Dosya 41.”

## 10) TEKNİK

- Tek HTML+CSS+JS veya React tek bundle. Bağımlılık asgari.
- localStorage `racon_v1` JSON. Bozuk JSON yedek `racon_v1_bak` + toparlama.
- “Yedek al” düz metin export / import (HANEDAN’daki gibi `RACON/1` başlıklı).
- Erişilebilir: butonlar button, İlerlet `type=button`, focus ring.
- 360×640 dikey = kilit. 844×390 ve 1280×800 yatay = tam UI.
- Performans: 60 tick animasyonu isteme; satır yazımı 120–180ms.

## 11) KABUL KRİTERİ (Faz 1 bitti sayılır)

- Yeni oyun → takvim boş, inbox tek satır.
- 3 rutin iş planlanıp tick tick çözülüyor; kasa/dosya/itibar değişiyor.
- Rakip sokağında 2 iş → Göz tehdidi takvime düşüyor.
- Tehdit ertelenince husumet artıyor; kabul edilince mini çatışma (iş motoru) çıkıyor.
- Hafta sonu yevmiye kesiliyor.
- Kayıt çık-gir korunuyor.
- Yatay üç sütun; dikey kilit.
- Çift İlerlet çift gün yemiyor.
- Hiçbir yerde lig tablosu / fikstür / “sıradaki maç” yazmıyor.

## 12) İSİM / MENÜ

Oyun adı: **Racon Manager**.
Ana menü: Yeni Oyun (lakap + semt sabit Fatih Faz 1) · Devam · Yedek · Sil.
Kart alt yazısı kullanılacaksa: “Adamlar ölür. İsim kalır.”

Şimdi bu spesifikasyona göre oynanabilir Faz 1’i üret. Faz 2–5’i yorum ve kilitli kapı olarak bırak, kodu onların verisini kabul edecek şekilde yaz. Tahmin etme; yukarıdaki sayılar ve isimler kanoniktir.
