# RACON MANAGER — Grok Build istem paketi
# Proje: tariklab.com · Hedef dosya: public/games/racon/index.html
# Oyun metinleri TÜRKÇE, kod adları İngilizce.

Bu dosya Grok Build'e **blok blok** yapıştırılmak üzere yazıldı. Grok Build tek
seferde 300 satırlık spec aldığında motoru yazıp ekranları savsaklıyor: kutular
yerli yerinde durur ama görsel dil dağılır (gradient, emoji ikon, mor vurgu,
hover ipucu). Bu paket tasarımı tarif etmiyor — **dikte ediyor**. Blok 0 ve
Blok 1'deki CSS harfi harfine yapıştırılacak; Grok'a bırakılan tek şey içeriği
o iskelete oturtmak.

## Nasıl kullanılır (usage bütçesi dar ise)

| Sıra | Blok | Zorunlu mu | Not |
|---|---|---|---|
| 1 | **Blok 0 — Bağlam + Görsel Yasa** | Zorunlu | Kod yazdırma, "anladım" dedirt |
| 2 | **Blok 1 — Kabuk, layout, 8 ekran iskeleti** | Zorunlu | Oyunun görsel omurgası burada biter |
| 3 | **Blok 2 — Veri modeli, kayıt, yeni oyun** | Zorunlu | |
| 4 | **Blok 3 — İlerlet motoru + Takvim/Olaylar** | Zorunlu | Faz 1 burada oynanır hale gelir |
| 5 | **Blok 4 — İş motoru + iş sahnesi** | Zorunlu | |
| 6 | **Blok 5 — Husumet, Emniyet, Kasa, Harita, kademe** | Zorunlu | |
| 7 | **Blok 6 — Cila + kendi kendine test + kabul** | Şiddetle önerilir | Ucuz, en çok hatayı burası yakalar |

Usage çok darsa: Blok 0 + Blok 1'i birleştirme, ayrı gönder — ekran kalitesinin
tamamı o ikisinden geliyor. Birleştirmen gerekiyorsa Blok 2+3 veya Blok 4+5'i
birleştir, Blok 1'i asla.

Tek seferde göndermek zorundaysan: **Blok 0 + Blok 1 + "sonra kalanları
sırayla isteyeceğim"** yaz, ardından tek mesajda Blok 2–6'yı arka arkaya
yapıştır. Blok 1'in CSS'i mutlaka ilk mesajda olmalı.

Her blok sonunda şu cümleyi ekle (Grok'un "sonra hallederim" demesini keser):

```text
Bu bloğu bitirmeden bir sonrakine geçme. Bitirdiğinde sadece şunu yaz:
(1) hangi dosya/bölümleri yazdın, (2) ekranda ne görünüyor, (3) bir sonraki
blokta senden ne beklemem gerektiği. Ekran görüntüsü tarifini bir tel çerçeve
gibi metinle çiz.
```

---

## Blok 0 · Bağlam + Görsel Yasa (ilk mesaj — kod yazdırma)

```text
tariklab.com için "Racon Manager" adlı tek sayfalık tarayıcı oyunu
üreteceğiz. Dosya: public/games/racon/index.html — tek HTML, stil + mantık
içinde, bağımlılık yok, build adımı yok.

Bu bir Football Manager kopyası DEĞİL. Football Manager'ın sadece EKRAN
OMURGASINI alıyoruz: üst şerit + sol nav + orta sahne + sağ bağlam paneli +
tek "İlerlet" düğmesi. Ligi, fikstürü, futbol sahasını, 40 attribute'u
ALMIYORUZ. Oyunda maç yok, lig tablosu yok, "sıradaki maç" yok.

Oyunun tek cümlesi: Mahalleye adsız girersin. İş yaparak ad, ad ile adam,
adam ile sokak, sokak ile heat, heat ile memur, memur ile dosya birikir.
Takvim boş başlar; onu oyuncunun planı, yükümlülükler ve husumet doldurur.

=== GÖRSEL YASA — bu bölüm pazarlığa kapalı ===

Estetik: 1970'ler İstanbul mahallesi + eski bir dosya klasörü. Kararmış
kahve/kurum tonları, krem yazı, tütün rengi vurgu. Kirli, sakin, sert.
Referans hissi: sararmış karbon kağıdı, damgalı evrak, karakol defteri.

RENK PALETİ — sadece bunlar, başka renk üretme:
  --bg:        #080706   /* zemin */
  --surface:   #141210   /* kart, panel */
  --surface-2: #1c1916   /* iç kutu, satır hover-yok vurgusu */
  --line:      #2a2622   /* çizgi, kenarlık */
  --ink:       #f0e6d4   /* yazı */
  --ink-dim:   #8a8074   /* soluk yazı */
  --accent:    #c4a574   /* krem vurgu, seçili, başlık altı */
  --danger:    #8b2e1f   /* dosya, hasım, tehdit */
  --respect:   #6b8f71   /* saygı */
  --heat:      #b8860b   /* heat, uyarı, gecikmiş */

YASAK LİSTESİ (Grok'un varsayılan alışkanlıkları — hiçbiri olmayacak):
- Emoji YOK. Hiçbir yerde. İkonlar inline SVG, 18x18, stroke=currentColor,
  stroke-width=1.5, fill=none, köşeli/keskin. Ek B'deki set kullanılacak.
- Gradient YOK. linear-gradient / radial-gradient sadece iki yerde serbest:
  (1) sayfa geneline binen çok hafif vignette, (2) itibar barlarının dolgusu
  düz renk kalacak — yani pratikte gradient yok.
- Mavi, mor, camgöbeği, neon, futbol yeşili YOK. Renk kodunu paletten
  kopyalamadıysan kullanma.
- box-shadow ile "glow" YOK. Gölge kullanacaksan
  `box-shadow: 0 1px 0 #00000055` gibi düz, sert, tek piksel olsun.
- border-radius en fazla 10px; hap/pill düğme (999px) sadece durum
  etiketlerinde (`hazır`, `yorgun`, `yaralı`) serbest.
- Hover'a bağlı bilgi YOK. title="" ipucu YOK. Bilgi ya ekranda yazar ya
  tıklayınca açılır. Telefonda hover yok, oyunun yarısı görünmez olur.
- Animasyon: sadece opacity/transform, 120–180ms. Kayan, zıplayan,
  yanıp sönen hiçbir şey yok. Konfeti, parıltı, "level up" efekti yok.
- Font: sistem yığını. Google Fonts / dış font YOK.
  --font: ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif
  Başlıklarda letter-spacing 0.10–0.14em, text-transform: uppercase.
  Türkçe büyük harf için mutlaka toLocaleUpperCase("tr-TR") kullan —
  düz toUpperCase() "İlerlet"i bozar, "Gazi"yi "GAZI" yapar.
- Doku: body üzerine çok hafif grain (SVG feTurbulence data-uri, opacity
  0.04) + kenarlardan içeri inset vignette. Abartma, okunurluğu bozma.

DÜZEN YASASI:
- Ekran YATAY zorunlu. Dikeyde tam ekran kilit: ortada "RACON MANAGER" ve
  "Telefonu yan çevir". Masaüstü ve yatay telefon AYNI üç sütun düzenini
  kullanır — mobil için ayrı bir tasarım YOK, sadece ölçüler küçülür.
- 100vh KULLANMA. #app { height: 100dvh; display:flex; flex-direction:column }
  Orta sahne overflow:auto, diğer sütunlar kendi içinde scroll eder.
  Sayfanın kendisi asla scroll etmez (body { overflow:hidden }).
- Dokunma hedefi minimum 40px yükseklik. Nav satırı 44px, İlerlet 40px.
- Yazı boyutu tabanı 13px; 12px altına inme. Sayı/istatistik için
  font-variant-numeric: tabular-nums.

METİN TONU: Kısa, kuru, mahalle ağzı. Şiirsel değil. "Beklenen goller",
"XP", "seviye atladın" gibi oyunlaştırma dili YOK. Sözlük: racon, heat,
yevmiye, dosya, gönül, husumet, Göz, Sürtüşme, Hasım, Belalı, Kan.
Örnek satırlar: "Mahalle duruyor." / "Kartallar Fevzi Paşa'da göründü." /
"Hasan kepengi erken kapattı. Gönül ince." / "Karakol sivil araç sordu.
Dosya 41."

TEKNİK ZEMİN:
- Tek HTML dosyası. Bağımlılık yok. Modern tarayıcı JS (const/let, ok
  fonksiyon, template literal) serbest.
- Bütün durum tek nesnede: S. Her mutasyondan sonra
  localStorage["racon_v1"]. Eski "cete_hanedan_v2" anahtarı OKUNMAZ,
  ÜZERİNE YAZILMAZ.
- Tek olay yolu: her eylem `act(code, payload)` fonksiyonundan geçer,
  düğmeler `data-act` ile bağlanır. Render tek fonksiyondan: `render()`
  aktif ekranı çizer. Global başka giriş noktası açma.
- Rastgelelik tek yerden: `rng()` — seed'li mulberry32. S.seed kaydedilir.
  Math.random() doğrudan çağırma; testi imkânsız hale getiriyor.

Şimdilik kod YAZMA. Sadece "anladım" de ve şu üçünü tek cümleyle özetle:
(1) oyunun türü ne değil, (2) paletten üç renk kodu, (3) 100vh yerine ne
kullanacaksın. Sonra bir sonraki mesajı bekle.
```

---

## Blok 1 · Kabuk, layout ve 8 ekranın iskeleti  ← EN ÖNEMLİ BLOK

```text
Şimdi public/games/racon/index.html dosyasını oluştur. Bu blokta SADECE
kabuk, düzen ve ekran iskeletleri var. Oyun mantığı yazma; ekranları sabit
(hardcoded) örnek veriyle doldur ki düzeni görebilelim.

=== 1. AŞAĞIDAKİ CSS'İ AYNEN KULLAN (değiştirme, yeniden adlandırma) ===

:root{
  --bg:#080706; --surface:#141210; --surface-2:#1c1916; --line:#2a2622;
  --ink:#f0e6d4; --ink-dim:#8a8074; --accent:#c4a574; --danger:#8b2e1f;
  --respect:#6b8f71; --heat:#b8860b;
  --font: ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif;
  --top:44px; --nav:200px; --side:240px; --r:10px;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);
  font:13px/1.45 var(--font);overflow:hidden;
  -webkit-text-size-adjust:100%;}
#app{height:100dvh;display:flex;flex-direction:column;position:relative}

/* ÜST ŞERİT */
.top{height:var(--top);flex:0 0 var(--top);display:flex;align-items:center;
  gap:14px;padding:0 12px;background:var(--surface);
  border-bottom:1px solid var(--line)}
.top .brand{letter-spacing:.14em;text-transform:uppercase;font-weight:600;
  color:var(--accent);font-size:12px;white-space:nowrap}
.top .meta{display:flex;gap:14px;align-items:center;color:var(--ink-dim);
  font-size:12px;font-variant-numeric:tabular-nums;overflow:hidden}
.top .meta b{color:var(--ink);font-weight:600}
.top .spacer{flex:1}

/* GÖVDE: üç sütun */
.body{flex:1;display:flex;min-height:0}
.nav{flex:0 0 var(--nav);background:var(--surface);
  border-right:1px solid var(--line);overflow:auto;padding:6px 0}
.stage{flex:1;min-width:0;overflow:auto;padding:14px 16px}
.side{flex:0 0 var(--side);background:var(--surface);
  border-left:1px solid var(--line);overflow:auto;padding:12px}

/* NAV */
.navbtn{width:100%;height:44px;display:flex;align-items:center;gap:10px;
  padding:0 12px;background:none;border:0;border-left:2px solid transparent;
  color:var(--ink-dim);font:inherit;text-align:left;cursor:pointer;
  text-transform:uppercase;letter-spacing:.08em;font-size:12px}
.navbtn[aria-current="page"]{color:var(--ink);background:var(--surface-2);
  border-left-color:var(--accent)}
.navbtn:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.navbtn .dot{margin-left:auto;width:6px;height:6px;border-radius:50%;
  background:var(--danger)}   /* bekleyen iş rozeti */

/* KART / KAĞIT */
.card{background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r);padding:12px;margin-bottom:10px}
.card h3{margin:0 0 8px;font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--accent);font-weight:600}
.hr{height:1px;background:var(--line);margin:10px -12px}
.dim{color:var(--ink-dim)}
.num{font-variant-numeric:tabular-nums}

/* SATIR LİSTESİ */
.row{display:flex;align-items:center;gap:10px;min-height:44px;
  padding:6px 10px;border-bottom:1px solid var(--line);
  background:none;border-left:0;border-right:0;border-top:0;width:100%;
  color:inherit;font:inherit;text-align:left;cursor:pointer}
.row[aria-selected="true"]{background:var(--surface-2);
  box-shadow:inset 2px 0 0 var(--accent)}
.row .unread{width:6px;height:6px;border-radius:50%;background:var(--accent);
  flex:0 0 6px}

/* DÜĞMELER */
.btn{min-height:40px;padding:0 14px;background:var(--surface-2);
  color:var(--ink);border:1px solid var(--line);border-radius:8px;
  font:inherit;cursor:pointer;letter-spacing:.04em}
.btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.btn[disabled]{opacity:.4;cursor:not-allowed}
.btn.primary{background:var(--accent);color:#171310;border-color:var(--accent);
  font-weight:600;text-transform:uppercase;letter-spacing:.10em}
.btn.ghost{background:none}
.btn.danger{border-color:var(--danger);color:#d9a599}

/* DURUM HAPI */
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;
  letter-spacing:.06em;border:1px solid var(--line);color:var(--ink-dim)}
.pill.ok{color:var(--respect);border-color:#33473a}
.pill.warn{color:var(--heat);border-color:#4a3a12}
.pill.bad{color:#d9a599;border-color:#4a201a}

/* BAR (itibar, heat, dosya, gönül) */
.bar{height:6px;background:#0f0d0b;border:1px solid var(--line);
  border-radius:3px;overflow:hidden}
.bar>i{display:block;height:100%;background:var(--accent)}
.bar.red>i{background:var(--danger)} .bar.green>i{background:var(--respect)}
.bar.heat>i{background:var(--heat)}
.barrow{margin-bottom:10px}
.barrow .lbl{display:flex;justify-content:space-between;font-size:11px;
  letter-spacing:.10em;text-transform:uppercase;color:var(--ink-dim);
  margin-bottom:4px}
.barrow .lbl b{color:var(--ink);font-weight:600}

/* DOKU */
#grain{position:fixed;inset:0;pointer-events:none;opacity:.04;z-index:9;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E")}
#vig{position:fixed;inset:0;pointer-events:none;z-index:8;
  box-shadow:inset 0 0 160px 40px #000}

/* DAR EKRAN */
@media (max-width:1100px){ :root{--nav:64px} .navbtn span{display:none}
  .navbtn{justify-content:center;padding:0} }
@media (max-width:900px){ .side{position:absolute;right:0;top:var(--top);
  bottom:0;width:260px;transform:translateX(100%);transition:transform .15s;
  z-index:6;border-left:1px solid var(--line)}
  .side.open{transform:none} }
/* DİKEY KİLİT */
#rotate{display:none}
@media (orientation:portrait){ #app{display:none}
  #rotate{display:flex;height:100dvh;flex-direction:column;
  align-items:center;justify-content:center;gap:14px;text-align:center;
  padding:24px} }

=== 2. HTML İSKELETİ ===

<div id="rotate"> RACON MANAGER · "Telefonu yan çevir" </div>
<div id="app">
  <header class="top">…</header>
  <div class="body">
    <nav class="nav">8 düğme</nav>
    <main class="stage" id="stage"></main>
    <aside class="side" id="side"></aside>
  </div>
</div>
<div id="grain"></div><div id="vig"></div>

ÜST ŞERİT içeriği, soldan sağa:
  RACON MANAGER │ FATİH │ H1 · PZT │ DOSYA 12% │ ₺18.000 │ [!2 gecikmiş] │
  ───boşluk─── │ [ İLERLET ]
- Dosya %: değer 40+ ise --heat, 75+ ise --danger renginde.
- Gecikmiş rozeti sadece gecikmiş yükümlülük varsa görünür, .pill.bad.
- İLERLET: .btn.primary, sağa yaslı, type="button", genişlik min 120px.
  Tıklandığında 400ms kilitlenir (re-entry guard) ve disabled görünür.

SOL NAV, tam bu sıra ve tam bu yazımla:
  Olaylar · Takvim · Adamlar · Harita · İşler · Emniyet · Husumet · Kasa
Her satır: [ikon 18px] [YAZI] [opsiyonel kırmızı nokta].
Dar ekranda yalnız ikon kalır (yazıyı gizle, aria-label bırak).

SAĞ PANEL (her ekranda aynı, sabit):
  1) Unvan bloğu: büyük harf "SERSERİ · FATİH", altında lakap.
  2) Dört itibar barı, bu sırayla: KORKU (accent), SAYGI (green),
     NAM (accent), RACON (accent; 40 altındaysa red). Her barın sağında sayı.
  3) "BU HAFTA" başlığı + en fazla 3 satır kuru özet.
  4) 900px altında bu panel sağdan açılan drawer olur; üst şeritte
     onu açan bir düğme belirir.

=== 3. HER EKRANIN TEL ÇERÇEVESİ (bunlara uy) ===

OLAYLAR (açılış ekranı) — iki bölme, sol liste / sağ kâğıt:
+----------------------------+---------------------------------+
| • Kartallar Fevzi Paşa'da  |  KAĞIT BAŞLIĞI                  |
|   göründü.          H1·SAL |  ─────────────────────────────  |
| • Mahalle duruyor.  H1·PZT |  İki üç satır kuru metin.       |
|   (okunmuş, soluk)         |                                 |
|                            |  [ Git ] [ Ertele ] [ Dosyala ] |
+----------------------------+---------------------------------+
Sol liste .row, okunmamışların başında .unread noktası ve üstte sıralı.
Seçili satır aria-selected. Sağ bölme boşken: "Kâğıt seç." (dim, ortalı).

TAKVİM — 7 sütunlu ızgara, üstte gün adları PZT…PAZ:
+------+------+------+------+------+------+------+
| PZT  | SAL  | ÇAR  | PER  | CUM  | CMT  | PAZ  |
| ▌plan|      | ▌teh |      | ▌yük |      | ▌yük |
| tahsi|      | Göz  |      |yevmiye|     |cenaze|
+------+------+------+------+------+------+------+
- Hücre min-height 120px, içi dikey akan küçük şeritler.
- Şerit = sol kenarında 3px renkli çubuk olan minik kutu:
  plan → --accent, yükümlülük → --ink-dim, tehdit → --danger.
- BOŞ HÜCRE BOŞ KALIR. "Etkinlik yok" yazma, dolgu üretme.
- Bugünün sütunu: üstte 2px --accent çizgi. Geçmiş günler opacity .55.
- Şeride tıklayınca sağ panel yerine ORTA sahnede altta kâğıt açılır.

ADAMLAR — solda liste, sağda kâğıt:
| Hasan "Kısa"   ayakçı   [hazır]  |   HASAN "KISA"  · AYAKÇI
| Muharrem       şoför    [yorgun] |   ────────────────────
| Sabri          gözcü    [hazır]  |   9 bar alt alta:
|                                  |   KABADAYILIK ▓▓▓░░░  7
| [ Karşılaştır (2) ]              |   SİLAH       ▓▓░░░░  4 …
|                                  |   GÖNÜL 62 · YEVMİYE ₺450
|                                  |   YORGUNLUK ▓▓▓ 38
|                                  |   Bağ: karakol kuzeni
Karşılaştırma: en fazla 2 adam seçilir, kâğıt iki sütuna bölünür, farklı
olan değerin yüksek olanı --accent, düşük olanı --ink-dim.

HARİTA — 2x2 sokak kartı ızgarası (4 sokak), kart yüksekliği ~150px:
+---------------------+---------------------+
| FEVZİ PAŞA          | AKŞEMSETTİN         |
| sahip: SEN          | sahip: —            |
| heat ▓▓▓░░░ 34      | heat ░░░░░░ 6       |
+---------------------+---------------------+
Sahip rengi kartın sol kenarında 3px şerit: sen → --accent,
rakip → --danger, boş → --line. Tıklanınca sağ panelin altına sokak
kâğıdı + "Bu sokakta iş planla" düğmesi.

İŞLER — üstte plan formu, altta kuyruk:
  [ Sokak ▼ ] [ İş türü ▼ ] [ Adam seç: Hasan ✓ Sabri ✓ ]  [ Planla ]
  Hazırlık: ▓▓ 2 tur   Beklenen: para ~₺6.000 · dosya +2 · tanık riski düşük
  ─────────────────────────────────────────────────────────
  KUYRUK
  tahsilat · Fevzi Paşa · hazır          [ İş günü ]
  bakkal soygunu · Çarşamba · hazırlık 1 [ ... ]
İş türü seçilince beklenen çıktılar KELİMEYLE yazılır (sayı vaat etme):
"para: iyi · gürültü: az · dosya: az". Adam seçimi 40px yüksek satır +
onay kutusu; select değil, çünkü telefonda çoklu seçim berbat.

İŞ SAHNESİ (Blok 4'te dolacak, iskeleti şimdi kur) — orta sahne tamamen
sahneye döner:
  KEŞİF ─ YAKLAŞMA ─ TEMAS ─ TEPKİ ─ KAÇIŞ ─ İZ      ← adım şeridi,
                     ^ aktif olan --accent, geçmiş dolu, gelecek soluk
  ───────────────────────────────────────────────────
  Hasan kepenge yaklaştı.
  İçeride iki kişi var, biri bağırıyor.
  ───────────────────────────────────────────────────
  TALİMAT:  [ Sessiz ] [ Sıkıştır ] [ Çekil ] [ Ateş ]
Satırlar tek tek yazılır (120–180ms arayla append, harf harf değil).
Talimat düğmeleri sadece TEMAS ve TEPKİ adımında görünür, diğerlerinde
yerlerini "[ Devam ]" alır.

EMNİYET — üstte tek büyük dosya barı (yüzde ile), altında delil listesi:
  DOSYA  ▓▓▓▓▓░░░░░  41%
  ─────────────────────────
  kamera · Fevzi Paşa · H2 · ağırlık 3
  tanık  · Çarşamba   · H3 · ağırlık 2
  ─────────────────────────
  [ POLİS TANIDIKLARI — KİLİTLİ (Ağabey) ]   ← .btn[disabled], kilit ikonu

HUSUMET — tek rakip kâğıdı:
  KARTALLAR
  Durum: SÜRTÜŞME            ← sayı gösterme, kelime göster
  Tuttukları: Macar Kardeşler
  Son: "Fevzi Paşa'da göründüler." (H3)
  [ MASA — KİLİTLİ ]

KASA — bakiye büyük, altında haftalık yevmiye toplamı, altında son 8
hareket (tarih · açıklama · ±tutar, tutar sağa yaslı tabular-nums).

=== 4. BU BLOKTA AYRICA ===
- Ekran geçişi: nav düğmesi → S.screen = "olaylar" | ... → render().
  Ekran state'i kayda da yazılır ama açılışta hep "olaylar" gelir.
- Dikey kilit ekranı çalışsın (telefonu döndürünce gerçekten değişsin).
- Ana menü: oyun ilk açılışta ortada tek kart —
  RACON MANAGER / "Adamlar ölür. İsim kalır." /
  [ Yeni Oyun ] [ Devam ] [ Yedek ] [ Sil ]
  Yeni Oyun: lakap girişi (tek input, 16 karakter) + semt sabit "Fatih".
- Bütün ekranları sabit örnek veriyle doldur ki düzeni görelim.

Bitince: hangi ekranları çizdin, 1280x800 ve 844x390'da nasıl duruyor,
tel çerçeve olarak yaz. Kod mantığına Blok 2'de geçeceğiz.
```

---

## Blok 2 · Veri modeli, kayıt, yeni oyun

```text
Şimdi veri modelini ve kaydı kur. Aşağıdaki şekil KANONİK; alan adlarını
değiştirme, alan ekleyebilirsin ama çıkaramazsın.

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

Ek zorunlu alanlar (orijinalde eksikti, ekle):
  SaveState.seed: number          // rng için, yeni oyunda Date.now()
  SaveState.screen: string        // aktif ekran
  Man.kus?: boolean               // yevmiye ödenmeyince true
  Job.tickIndex?: number          // iş motoru nerede kaldı
  SaveState.busy?: boolean        // İlerlet re-entry guard (kaydedilmez)

YENİ OYUN VARSAYILANI (kanonik sayılar, tahmin etme):
- stage "serseri", week 1, day 1, kasa 18000, dosya 0
- rep: korku 5, saygi 8, nam 2, racon 70
- 3 adam: bir ayakçı, bir şoför, bir gözcü. Statlar 4–9 arası,
  gonul 55–70, yevmiye 300–500, durum "hazir", yorgunluk 0.
  İsimler mahalleli olsun: Hasan "Kısa", Muharrem, Sabri gibi.
- Sokaklar (Fatih): Fevzi Paşa, Akşemsettin, Çarşamba, Macar Kardeşler.
  Biri streetHome ve sahip "sen"; biri sahip "bos"; ikisi "bos" ama
  Kartallar'a yakın olanı soluk gösterilir (flags ile işaretle).
- Kartallar: husumet 0, band "yok", agresiflik orta, streetsClaimed []
- calendar [], jobs [], evidence [], cops [], defter []
- inbox: tek satır → "Mahalle duruyor."

KAYIT:
- localStorage["racon_v1"], her act() sonunda yaz (debounce 200ms).
- Yazmadan önce mevcut geçerli kaydı "racon_v1_bak" içine kopyala.
- Okurken JSON.parse try/catch. Bozuksa yedeği dene; o da bozuksa
  ana menüde "Kayıt okunamadı, yedek de bozuk." satırı göster,
  kaydın üzerine YAZMA.
- migrate(save): eksik alanlara varsayılan koyan tek fonksiyon. Her yeni
  alan buraya varsayılanıyla eklenir. Eski kayıtla açan oyuncuda oyun
  çökmeyecek. Bu kural sonraki bütün bloklarda geçerli.
- "cete_hanedan_v2" anahtarına DOKUNMA.
- Yedek al / yedek yükle: düz metin, ilk satırı "RACON/1", sonrası base64
  JSON. Yedek ekranı bir textarea + [Kopyala] + [Yükle] düğmesi.
- Sil: iki adımlı onay ("Sil" → "Emin misin? Bu kayıt gider.").

rng: mulberry32(S.seed). Her çağrıda S.seed ilerler ve kaydedilir; böylece
aynı kayıttan devam eden aynı sonucu almaz ama oyun tekrarlanabilir kalır.

Bu blokta ekran değişmiyor; Blok 1'deki sabit örnek verinin yerini gerçek
S nesnesi alacak. Bitince yeni oyun açılıp kaydedilebiliyor, sayfa
yenilenince kalıyor olmalı.
```

---

## Blok 3 · İlerlet motoru + Takvim/Olaylar

```text
İLERLET motorunu yaz. Tek düğme, tek fonksiyon: advance().

Re-entry guard: S.busy true iken düğme disabled; işlem bitince false.
Çift tıklama iki gün yememeli.

Bekleyen "tehdit" varsa İlerlet önce onay modalı açar:
  "Ertelenecek tehdit var. Bedeli olsun mu?"  [ Ertele ] [ Vazgeç ]
  Ertele → o CalItem.status = "ertelendi", ve husumet +8 VEYA dosya +6
  (rng ile biri). Vazgeç → gün ilerlemez, modal kapanır.

Sıra (tam bu sırayla):
 1. Günün yükümlülükleri kaçırıldı mı → status "kacirildi",
    saygi −3, racon −2 (cenaze/bakım türünde −4), inbox satırı.
 2. Aktif iş "running" ise bir tick çöz (Blok 4). Bitmese de gün ilerler.
 3. Yevmiye — SADECE haftanın 7. günü: her canlı adam yevmiye kadar kasa
    yer. Kasa yetmezse ödenmeyen adam: gonul −15, kus = true, inbox.
 4. Yorgunluk: işte olmayan −8 (min 0), işte olan +12; 80+ → durum
    "yorgun"; 40 altına düşünce "hazir"a döner.
 5. Dosya = clamp( Σ(evidence.weight * yaşZayıflaması) + nam*0.05 +
    haftanın gürültüsü + toz , 0, 100). Toz her hafta +1. Delil yaşlanır:
    8 haftadan eski parçanın ağırlığı yarıya iner, 16 haftada düşer.
 6. Rakip AI: 2 haftadır dokunmadığın "bos" sokağa %40 yürür. Yürürse
    sokak sahip "rakip", inbox + haritada renk değişir.
 7. Husumet bandı: 0 yok · 15 goz · 40 surtusme · 70 hasim · 85 belali ·
    90 kan. KAN'DA BİLE HAFTALIK RASTGELE MAÇ YOK — sadece tehdit kâğıdı
    çıkma şansı artar.
 8. Olay üret: bu tıkta EN FAZLA 2 yeni CalItem/inbox. Kaynaklar:
    husumet bandı, dosya≥40 uyarı, dosya≥75 "sivil araç", gönül<30 ihanet
    riski, rakip yürüyüşü. Boş gün meşrudur — olay uydurma.
 9. Gün +1; 8 olursa hafta +1, gün 1.
10. Kademe kapısı kontrolü (Blok 5).
11. Kaydet.

ÇEKİRDEK OLAY KURALI (Faz 1'in belkemiği, doğru kur):
  Rakibin sokağında iş yaptın → 2 tur sonra takvime "Göz" tehdidi düşer.
  Aynı şey tekrarlanırsa → "Sürtüşme".
  3. ihlalde → "Hasım" tehdidi: pusu teklifi, [Kabul] / [Ertele].
  Kabul → iş motoru mini çatışma olarak koşar.
  Ertele → husumet +8 veya dosya +6.

TAKVİM ve OLAYLAR ekranlarını gerçek veriye bağla. Takvimde boş hücre boş
kalır. Olaylar'da okunmamış üstte, tıklanınca kâğıt + eylem düğmeleri.

Bitince: 7 kez İlerlet'e basıp ne olduğunu satır satır yaz. Yevmiye 7.
günde kesildi mi, dosya arttı mı, boş gün oldu mu?
```

---

## Blok 4 · İş motoru + iş sahnesi

```text
İş motoru. Rutin iş = bu oyunun "lig maçı"dır; ekranın en çok bakılan yeri
burası, o yüzden hem mantığı hem sahnesi düzgün olacak.

TİCK ZİNCİRİ: kesif → yaklasma → temas → tepki → kacis → iz
Her tick 1–2 Türkçe satır üretir. Satırlar kuru ve somut:
  "Hasan kepenge yaklaştı."
  "İçeride iki kişi, biri bağırıyor."
  "Karşı kaldırımda bir kamera var, Sabri görmedi."
Şablon havuzu kullan ama aynı satır arka arkaya iki kez çıkmasın.

KRİTİK TİCK (temas, tepki): oyuncuya 4 talimat.
  [ Sessiz ] [ Sıkıştır ] [ Çekil ] [ Ateş ]
İtaatsizlik: bir adamın sadakat < 40 ve talimat "cekil" veya "sessiz" ise
%(50 − sadakat) ihtimalle dinlemez; satırda yazılır: "Muharrem dinlemedi."

ÇIKTI 5 KALEM (her iş sonunda tek özet kâğıdında göster):
  para → kasa+ · yara/ölüm → adam durumu · tanık 0–2 → evidence "tanik" ·
  delil (gizlilik düşükse "kamera"/"iz") · heat → sokak.heat + dosya
Özet kâğıdı: "TAHSİLAT · FEVZİ PAŞA · BİTTİ" başlığı, altında 5 satır,
her satırda değişim ± işaretli ve renkli (artı --respect, eksi --danger).

RACON ETİKETİ: iş etiketlerinde kadin/cocuk/okul/cenaze/ispiyon/
masada_yalan varsa racon −8 ve inbox satırı. "okul" etiketi semt şartıyla
%8 ihtimalle kendiliğinden düşer ("Okul çıkışına denk geldi.").

İTİBAR DELTALARI (kanonik örnekler):
  sessiz tahsilat: saygi +2, nam +1, korku 0, dosya +2
  ateş açıldı:     korku +6, saygi −3, nam +5, dosya +10
  çekil, başarısız: korku −2, saygi −2
KORKU/SAYGI SOFT CAP — tek kural, buna uy: birini artırırken diğeri 70
veya üstündeyse, artıştan sonra diğerinden 1 düş. İkisi birden 70+ olarak
uzun süre kalamaz.

BAKKAL SOYGUNU: aynı motor + 2 ekstra tick (giris, kasa), zorunlu 3 adam
(kırıcı/gözcü/şoför rolleri). Başarı: yüksek ganimet + nam. Başarısızlık:
yara veya hapis riski. Nadir; hazırlık 2 tur.

HAZIRLIK: tahsilat 0, kepenk 1, tek_arac 1, bakkal_soygunu 2 tur.
Hazırlık bitmeden koşulamaz; İşler ekranında düğme disabled ve yanında
"hazırlık 1 tur" yazar.

İŞ SAHNESİ: Blok 1'deki tel çerçeveye uy. Adım şeridi üstte, satırlar
ortada birikir (append, 120–180ms, kaydırma en alta), talimat düğmeleri
altta sabit. Sahne açıkken sol nav ve İlerlet disabled — oyuncu işi
bitirmeden kaçamaz. İş bitince özet kâğıdı ve [ Tamam ].

Bitince: bir tahsilat ve bir bakkal soygunu koş, satır satır ne çıktığını
yaz.
```

---

## Blok 5 · Husumet, Emniyet, Kasa, Harita ve kademe kapıları

```text
Kalan ekranları gerçek veriye bağla ve kademe kapılarını kur.

HUSUMET: Kartallar kâğıdı. Sayı gösterme, BAND KELİMESİ göster:
  yok / Göz / Sürtüşme / Hasım / Belalı / Kan
Altında son 3 olay, altında [ MASA — KİLİTLİ ] (disabled, kilit ikonu,
yanında küçük "Faz 5" değil, "Baba" gibi kademe adı yaz).

EMNİYET: dosya barı + delil listesi (tür · sokak · hafta · ağırlık).
Delil yaşlandıkça satır soluklaşır. [ POLİS TANIDIKLARI — KİLİTLİ (Ağabey) ].
Dosya 40'ta uyarı satırı, 75'te "sivil araç" satırı inbox'a da düşer.

KASA: bakiye (büyük, tabular-nums), haftalık yevmiye toplamı, son 8
hareket. Hareketler defter[] üzerinden; her para değişimi defter'e
"H3·CUM · tahsilat · +6.000" biçiminde tek satır yazar.

HARİTA: sokak kartları gerçek sahip/heat ile. "Bu sokakta iş planla"
düğmesi doğrudan İşler ekranını o sokak seçili açar.

KADEME KAPILARI — unvan XP ile değil, INBOX CÜMLESİYLE gelir:
  serseri → delikanli: 3 tamamlanmış iş + ≥2 canlı adam +
                       ev sokağı heat < 80
  delikanli → kabadayi: 1 sokak sahip "sen" + kasa ≥ 40000 + nam ≥ 20 +
                       dosya < 70
  kabadayi ve sonrası: kapı mesajı görünür, içerik kilitli.
Kademe atlayınca: inbox satırı ("Artık sana delikanlı diyorlar."),
sağ paneldeki unvan değişir, defter'e satır düşer. Konfeti/rozet YOK.
Geri düşme Faz 1'de kapalı: stageDown() tanımlı ama boş.

KİLİTLİ KAPILAR — nav'da görünür ama girilemez: çoklu mahalle, alt ekip,
aklama, savcı, masa/oturum diplomasisi, hanedan finali. Girilmeye
çalışılınca orta sahnede tek kart: "Bu aşamada kilitli. — Ağabey"
Mimari onları kabul edecek şekilde yazılsın: tek store (S), tek event bus
(act), tek render. Faz 2–5 verisi eklendiğinde ekran kodu kırılmasın.
```

---

## Blok 6 · Cila, kendi kendine test, kabul

```text
Son blok. Yeni özellik ekleme; olanı sağlamlaştır.

1) KENDİ KENDİNE TEST — window.__raconTest = function(){...} yaz.
   Konsoldan çağrılınca sırasıyla:
   - yeni oyun kurar
   - 3 iş planlayıp koşar
   - 14 kez İlerlet'e basar
   - şunları doğrular ve sorun listesi döner (boş dizi = temiz):
     [ ] takvim yeni oyunda boş, inbox tek satır
     [ ] çift İlerlet çift gün yemiyor
     [ ] hafta 7'de yevmiye kesildi
     [ ] rakip sokağında 2 iş sonrası Göz tehdidi takvime düştü
     [ ] tehdit ertelenince husumet veya dosya arttı
     [ ] kasa/dosya/itibar değerleri 0–100 (kasa hariç) sınırında kaldı
     [ ] kayıt yaz-oku turu state'i bozmadan geri getirdi
     [ ] korku ve saygı ikisi birden 70+ kalmadı
   Testi çalıştır, çıkan sorunları düzelt, tekrar çalıştır. Sıfırla bitir.

2) METİN TARAMASI — dosyada şu kelimeler GEÇMEYECEK:
   lig, fikstür, maç, puan tablosu, sıradaki maç, XP, seviye, level.
   Geçiyorsa değiştir.

3) GÖRSEL TARAMASI — dosyada şunlar GEÇMEYECEK:
   emoji karakteri, "gradient", "#0ff"/"#00f"/mor-mavi herhangi bir hex,
   "box-shadow: 0 0" ile başlayan glow, "100vh", title="" ipucu,
   Google Fonts linki. Geçiyorsa temizle.

4) ERİŞİLEBİLİRLİK: her tıklanabilir şey <button type="button">.
   Nav'da aria-current="page". Modal açıkken arkaya tab gitmiyor.
   :focus-visible ringi her yerde görünüyor. Dokunma hedefleri ≥40px.

5) ÖLÇÜ TESTİ: 1280x800 ve 844x390 yatayda üç sütun tam;
   360x640 dikeyde kilit ekranı. Hiçbir ölçüde sayfa yatay scroll etmiyor.

6) Son olarak <meta name="racon-rev" content="1"> ekle. Sonraki her
   değişiklikte bu sayı bir artacak.

Bitince: test çıktısını, düzelttiğin şeyleri ve kabul kriterlerinin
her birini tek tek "geçti/kaldı" olarak yaz.
```

---

## Ek A · Bileşen sözlüğü (Grok bunları yeniden adlandırmasın)

| Sınıf | Ne işe yarar |
|---|---|
| `.top` `.brand` `.meta` | Üst şerit ve içindeki künye |
| `.nav` `.navbtn` | Sol menü, `aria-current="page"` aktif |
| `.stage` | Orta sahne, tek scroll alanı |
| `.side` `.side.open` | Sağ bağlam paneli / dar ekranda drawer |
| `.card` `.card h3` `.hr` | Kâğıt kutusu ve başlığı |
| `.row` `.row[aria-selected]` `.unread` | Liste satırı, seçili, okunmamış |
| `.btn` `.primary` `.ghost` `.danger` | Düğme aileleri |
| `.pill` `.ok` `.warn` `.bad` | Durum hapı (hazır/yorgun/yaralı) |
| `.bar` `.bar.red` `.bar.green` `.bar.heat` `.barrow` | Bar ailesi |
| `#grain` `#vig` `#rotate` | Doku, vignette, dikey kilit |

## Ek B · İkon seti (emoji yerine — 18x18, stroke=currentColor, 1.5)

Grok'a şunu söyle: **her ikon tek `<svg viewBox="0 0 24 24">`, fill=none,
stroke=currentColor, stroke-width=1.5, stroke-linecap=square.** Yuvarlak
uç kullanma; bu oyunun çizgisi köşeli.

| Nav | İkon fikri (basit geometri) |
|---|---|
| Olaylar | Kapalı zarf: dikdörtgen + içinde ters V |
| Takvim | Dikdörtgen + üstte iki kısa dikey çentik + yatay çizgi |
| Adamlar | İki baş: iki daire + altlarında iki yay |
| Harita | Dört köşe kadastro karesi + içinde çapraz yol çizgisi |
| İşler | Çekiç/levye: iki kesişen kısa çizgi + kalın uç |
| Emniyet | Klasör: dikdörtgen + üstte çıkıntı sekmesi |
| Husumet | İki çapraz kesişen çizgi (bıçak/çarpı değil, X'e yakın) |
| Kasa | Kasa kapağı: kare + ortasında küçük daire + kol çizgisi |
| Kilit | Asma kilit: dikdörtgen + üstte yay |

## Ek C · Kanon metinler (Grok uydurmasın)

- Semt: **Fatih**. Sokaklar: **Fevzi Paşa, Akşemsettin, Çarşamba, Macar Kardeşler**.
- Rakip: **Kartallar**. Kademeler: serseri · delikanlı · kabadayı · ağabey · baba · aile reisi · hanedan.
- Bantlar: yok · Göz · Sürtüşme · Hasım · Belalı · Kan.
- İş tipleri: tahsilat · kepenk · tek araç · bakkal soygunu.
- Roller: kırıcı · tetikçi · gözcü · şoför · ağız · muhasebeci · muhbir · ayakçı.
- Kart alt yazısı: **"Adamlar ölür. İsim kalır."**
- Kayıt anahtarı: `racon_v1` (yedek `racon_v1_bak`). `cete_hanedan_v2` dokunulmaz.

## Ek D · Orijinal spec'teki boşlukların kanon çözümü

Grok bunları kendi kafasına göre çözerse ekran ve motor tutmaz; yukarıdaki
bloklara zaten yedirildi, burada tek yerde toplu duruyor.

1. **"küs" durumu** — `Man.durum` enum'unda yok. Ayrı boolean: `Man.kus`.
   Durum hapı yine `hazır` gösterir, yanına küçük "küs" etiketi düşer.
2. **Korku/saygı soft cap** — tek kural: *artıştan sonra diğeri 70+ ise
   diğerinden 1 düş.* İki farklı yorumu birleştirmedik, bunu kullan.
3. **Husumet bandı eşikleri** — 0/15/40/70/85/90. `RelBand` sırası ile
   birebir örtüşür, ara değerde alt banda yuvarla.
4. **Dosya %** — hem türetilir hem saklanır. Her İlerlet'te yeniden
   hesaplanır ve `S.dosya`ya yazılır; başka yerden elle değiştirilmez.
5. **Rastgelelik** — `Math.random()` yerine seed'li `rng()`. Yoksa Blok
   6'daki kendi kendine test yazılamaz.
6. **Yeni oyunda sokak sahipliği** — 1 sokak `sen` (ev), 3 sokak `bos`.
   Kartallar'ın "iddiası" Faz 1 başında yok; sadece bir sokak haritada
   soluk işaretli (flags ile) ki rakip AI oraya yürüsün.
7. **Ekran state'i** — kaydedilir ama açılışta hep `olaylar` gelir.

## Ek E · Grok kaçarsa söylenecek düzeltme cümleleri

Ekran kalitesi bozulduğunda tek tek yapıştır, tekrar tasarlatma:

- "Emoji kullanmışsın. Hepsini Ek B'deki inline SVG ile değiştir."
- "Gradient/glow girmiş. Blok 1'deki CSS'e geri dön, o dosyadaki renk
  kodları dışında hex kullanma."
- "Bilgiyi hover'a koymuşsun. Telefonda hover yok — ya ekrana yaz ya
  tıklamayla aç."
- "Takvimde boş hücreleri doldurmuşsun. Boş gün meşrudur, boş bırak."
- "Ekran dikeyde de açılıyor. Dikey tek şey görsün: kilit ekranı."
- "İlerlet'e iki kez basınca iki gün geçiyor. Re-entry guard'ı kur."
- "Bir yerde 'maç' veya 'fikstür' yazıyor. Bu oyunda maç yok."
- "Sağ paneldeki dört bar yerine tek şöhret barı koymuşsun. Dördü ayrı:
  Korku, Saygı, Nam, Racon. Dosya % onlardan ayrı, üst şeritte."
- "100vh kullanmışsın; iOS'ta alt şerit kesiyor. 100dvh + flex column."
