# TLab Classics — Provenance ve Lisans Kaydı

Labirent, Tek Taş ve Satranç oyunlarının kaynak/lisans durumunun teknik
kaydı. **Bu belge hukuki bir görüş veya garanti değildir**; depo içeriğinden
ve ilgili lisans dosyalarından doğrulanabilen provenance bilgisini kayda
geçirir.

Tarih: 2026 · Sürüm: TLab Classics V1

---

## Özet

Üç oyun da **sıfırdan, bağımsız olarak yeniden uygulandı.** Önceki
sürümlerde bulunan üçüncü taraf uygulama kodu, görselleri, CSS/HTML
kompozisyonu ve metinleri depodan tamamen kaldırıldı. Final sürümlerde
**hiçbir üçüncü taraf çalışma zamanı bağımlılığı yoktur** — ne yerel
vendor dosyası ne de uzak CDN.

| Oyun | Önceki durum | Şimdiki durum | Kalan üçüncü taraf bağımlılık |
|---|---|---|---|
| Labirent | Üçüncü taraf uygulama (MIT), canlı üçüncü taraf API çağrısı | TarikLab bağımsız uygulaması | Yok |
| Tek Taş | Üçüncü taraf uygulama (kod MIT, **görseller CC BY-NC-SA 4.0**) | TarikLab bağımsız uygulaması | Yok |
| Satranç | chessboard.js + chess.js + jQuery + Wikipedia/Cburnett taş seti | TarikLab bağımsız kural motoru + özgün taş seti | Yok |

---

## 1. Labirent

### Önceki provenance

- **Kaynak:** `The Maze Game` — Son Nguyen (`hoangsonww/The-Maze-Game`).
- **Lisans:** MIT. Lisans metni `public/licenses/labirent/LICENSE`
  dosyasında tutuluyordu ve JS başlıklarında `@copyright ... Son Nguyen`
  satırları duruyordu.
- **Sınıflandırma:** C (attribution gerektiren izinli lisans) — ancak
  aşağıdaki iki nokta ayrıca sorunluydu:
  1. `index.html` içinde `<meta name="author" content="Son Nguyen ...">`,
     `<link rel="author" href="https://sonnguyenhoang.com/">`, üçüncü
     tarafın `og:url` / `twitter:creator` etiketleri ve `onrender.com`
     görsel adresleri duruyordu; sayfa TarikLab oyunu olarak sunulurken
     üçüncü tarafın kimliğini taşıyordu.
  2. `src/js/game.js`, `ui-components.js` ve `auth.js` çalışma zamanında
     **`https://maze-game-api.vercel.app` adresine istek atıyordu** —
     hesap/oturum/skor akışları dahil. Bu, TarikLab oyuncularının
     verisinin üçüncü tarafın sunucusuna gitmesi anlamına geliyordu.
     Sınıflandırma: **D — yüksek risk.**

### Yapılan

Bütün dosyalar silindi. Yeni uygulama:

- `public/games/labirent/js/maze.js` — TarikLab özgün çekirdeği. Duvarlar
  hücre başına bit maskesiyle tutulur; labirent yinelemeli geri izleme
  (kendi yığınıyla, özyinelemesiz) ile üretilir; kolay/orta seviyede bir
  oranda çıkmaz sokak açılır ("braid"). Tohum üreteci mulberry32
  ailesinden bir fonksiyondur ve state'in kendisine aittir.
- `public/games/labirent/js/app.js` — SVG çizim, girdi, yerel kayıt.
- `public/games/labirent/styles.css`, `index.html` — TarikLab özgün
  kompozisyonu.

Klasik "geri izlemeli labirent üretimi" ve "genişlik öncelikli en kısa
yol" **algoritma fikirleridir** (sınıf E) ve üçüncü tarafın korunabilir
ifadesi değildir; kod bu depoda bağımsız yazılmıştır.

**Ağ çağrısı yoktur.** Hesap/oturum/lider tablosu özellikleri
kaldırılmıştır; oyun tamamen çevrimdışı çalışır ve yalnız
`localStorage` kullanır (`tlab.labirent.v1`).

---

## 2. Tek Taş

### Önceki provenance

- **Kaynak:** `Peg-Solitaire` — Oliver Merkel (`OMerkel/Peg-Solitaire`).
- **Lisans (kod):** MIT.
- **Lisans (görseller):** Deponun kendi `LICENSE` dosyasının ifadesiyle:
  *"If not otherwise stated all graphics (independent of its format) are
  licensed under Creative Commons Attribution-**NonCommercial**-ShareAlike
  4.0 International License."*
- **Sınıflandırma:** **D — yüksek risk.** Gerekçe: NonCommercial (NC)
  şartı, oyunun hesap sistemi ve ticari nitelik taşıyabilecek bir sitede
  yayınlanmasıyla bağdaşmaz; ShareAlike (SA) şartı da türev görsellere
  aynı lisansı dayatır. Ayrıca depoda bulunan `img/icons/cc_by_nc_sa.png`,
  `img/oliver-altenahr-230708.jpg`, `img/english_solitaire_cp_start_to_end.svg`
  ve bütün `pegsol*.png` ikonları bu kapsamdaydı ve mevcut TarikLab
  sürümünde gerekli CC atıfları görünür biçimde sunulmuyordu.

### Yapılan

Bütün dosyalar (kod, görseller, `LICENSE`, `AUTHORS`, `manifest.webapp`)
silindi. **Hiçbir üçüncü taraf görseli taşınmadı.** Yeni uygulama:

- `public/games/peg-solitaire/js/solitaire.js` — TarikLab özgün çekirdeği:
  33 delikli klasik İngiliz haçı, atlayış üretimi/doğrulaması, tam geri
  alma, çıkmaz tespiti, derece hesabı ve "tahtayı en az kilitleyen hamle"
  ipucu.
- Tahta ve taşlar tamamen **CSS gradyanı + SVG daire** ile çizilir;
  görsel dosya yoktur.

Oyunun kuralları klasiktir (sınıf E) ve kimseye ait değildir.

Yerel kayıt: `localStorage` → `tlab.tektas.v1`.

---

## 3. Satranç

### Önceki provenance

Dört ayrı üçüncü taraf bileşen:

| Bileşen | Kaynak | Lisans | Sınıf |
|---|---|---|---|
| `js/chessboard-1.0.0.js` (+ `.min`, `css/`) | chessboard.js 1.0.0, Chris Oakman | MIT | C |
| `vendor/chess.min.js` | chess.js, Jeff Hlywa | BSD-2-Clause | C |
| `vendor/jquery.min.js` | jQuery | MIT | C |
| `img/chesspieces/wikipedia/*.png` (12 dosya) | chessboard.js ile dağıtılan "wikipedia" taş seti; kaynağı Wikimedia Commons'taki Cburnett satranç taşları | **CC BY-SA 3.0 / GFDL** (chessboard.js'in MIT lisansı bu görselleri kapsamaz) | **D — yüksek risk** |

Depodaki `public/licenses/satranc/NOTICE` dosyası ilk üç bileşeni
listeliyordu ama **taş setini hiç anmıyordu**; yani en ağır yükümlülük
taşıyan kalem (BY-SA atıf + aynı lisansla paylaşma) belgelenmemişti.
Ayrıca `vendor/chess.min.js` içinde BSD-2 telif satırı bulunmuyordu.

### Yapılan

Bütün dosyalar silindi. Yeni uygulama:

- `public/games/satranc/js/rules.js` — **TarikLab bağımsız kural motoru.**
  Sözde-yasal hamleler üretilir, sonra hamle uygulanıp kendi şahını
  tehdide açan varyantlar elenir. Rok (her iki yön, hak düşmesi, geçilen
  karenin tehdit denetimi), geçerken alma, terfi (dört taş), şah, mat,
  pat, yetersiz materyal ve elli hamle kuralı uygulanır.
- `public/games/satranc/js/pieces.js` — **TarikLab için sıfırdan çizilmiş
  vektör taş seti.** Altı taşın hepsi ortak bir kaide ve yaka bandı
  üzerine kurulur; biçimler köşeli/düz yüzeyli tutulmuştur. Üçüncü taraf
  bir setin türevi veya "renkleri değiştirilmiş" hâli değildir.
- `public/games/satranc/js/app.js`, `styles.css`, `index.html` — TarikLab
  özgün tahtası ve arayüzü. jQuery ve chessboard.js'e ihtiyaç yoktur;
  tahta CSS grid ve gerçek `<button>` öğeleriyle kurulur.

Motorun doğruluğu `scripts/tlab-satranc.test.mjs` içinde **perft** ile
kanıtlanır: başlangıç konumunda 4 derinliğe kadar (197.281 düğüm) ve rok
ile geçerken almayı zorlayan "Kiwipete" konumunda 3 derinliğe kadar
(97.862 düğüm) bilinen referans değerleriyle birebir eşleşir.

**Not:** Önceki sürümdeki bilgisayar rakip (minimax) kaldırılmıştır; yeni
sürüm aynı cihazda iki oyunculudur ve arayüz bunu açıkça söyler. Bu,
desteklenmeyen bir özelliğin varmış gibi sunulmamasıdır.

---

## 4. Kaldırılan üçüncü taraf materyal (tam liste)

**Kod**

- `public/games/labirent/src/js/{game,ui-components,auth}.js`
- `public/games/labirent/src/css/style.css`
- `public/games/peg-solitaire/js/{main,board,hmi,common,solver}.js`
- `public/games/peg-solitaire/css/index.css`
- `public/games/satranc/js/chessboard-1.0.0{,.min}.js`
- `public/games/satranc/css/chessboard-1.0.0{,.min}.css`
- `public/games/satranc/vendor/{chess.min,jquery.min}.js`

**Görseller**

- `public/games/labirent/utils/{favicon.ico,image-192x192.png}`
- `public/games/peg-solitaire/img/**` (ikonlar, CC rozeti, fotoğraf, SVG'ler)
- `public/games/satranc/img/chesspieces/wikipedia/*.png` (12 dosya)

**Lisans/kimlik dosyaları**

- `public/games/peg-solitaire/{LICENSE,AUTHORS,manifest.webapp,manifest_hosted.webapp}`
- `public/licenses/labirent/LICENSE`
- `public/licenses/peg-solitaire/LICENSE`
- `public/licenses/satranc/{LICENSE.md,NOTICE}`

Bu lisans dosyaları, ilgili üçüncü taraf kodu artık depoda bulunmadığı
için kaldırılmıştır. Kod geri getirilirse notice yükümlülüğü de geri
gelir.

**Dış adresler** — final üç oyun dizininde kalan dış adres sayısı: **0.**
Kaldırılanlar: `maze-game-api.vercel.app`, `the-maze-game.onrender.com`,
`sonnguyenhoang.com`, `github.com/hoangsonww/...`,
`github.com/OMerkel/Peg-Solitaire`, `github.com/oakmac/chessboardjs`,
`linkedin.com/in/hoangsonw`, `orcid.org/...`, `creativecommons.org/...`
lisans bağlantıları, `google.com/patents/...` bağlantıları.

---

## 5. Korunan bağımlılıklar

**Yoktur.** Üç oyunun final sürümlerinde çalışma zamanı üçüncü taraf
kodu, vendor dosyası, CDN çağrısı veya paket bağımlılığı bulunmaz.
Dolayısıyla korunması gereken bir attribution notice de kalmamıştır.

Yazı tipleri: oyunlar site genelinde tanımlı `Barlow` / `Barlow Condensed`
ailesini ve sistem yazı tiplerini `font-family` üzerinden ister; üç oyun
dizini kendi başına bir font dosyası taşımaz.

---

## 6. TarikLab özgün alanları

| Alan | Dosyalar |
|---|---|
| Labirent motoru | `public/games/labirent/js/maze.js` |
| Labirent arayüzü | `public/games/labirent/js/app.js`, `styles.css`, `index.html` |
| Tek Taş motoru | `public/games/peg-solitaire/js/solitaire.js` |
| Tek Taş arayüzü | `public/games/peg-solitaire/js/app.js`, `styles.css`, `index.html` |
| Satranç kural motoru | `public/games/satranc/js/rules.js` |
| Satranç taş seti | `public/games/satranc/js/pieces.js` |
| Satranç arayüzü | `public/games/satranc/js/app.js`, `styles.css`, `index.html` |
| Testler | `scripts/tlab-{labirent,tek-tas,satranc}.test.mjs` |
| Oyuncuya görünen bütün Türkçe metin | üç `index.html` ve `app.js` dosyaları |

---

## 7. Görünür telif bildirimi

Üç oyunun da alt bilgisinde:

> © 2026 TarikLab. Tüm hakları saklıdır.
> TarikLab sürümü, arayüzü ve özgün oyun içeriği: Tarık Halil Ayaz.
> Klasik oyun kuralları üzerindeki hak iddiası bu bildirimin kapsamı dışındadır.

(Satranç'ta ikinci satır "arayüzü, tahtası ve özgün taş seti" biçiminde
genişletilir.)

Üçüncü satır bilinçlidir: labirent, tek taş ve satrancın **kuralları**
kamuya maldır ve bu bildirim onlar üzerinde hak iddia etmez.

---

## 8. Kalan belirsizlik

- Bu kayıt, depoda bulunabilen dosyalara ve bu dosyaların taşıdığı lisans
  beyanlarına dayanır. Silinen materyalin depoya nasıl/kim tarafından
  eklendiği ve daha önce hangi sürümlerin yayınlandığı bu belgenin
  kapsamı dışındadır. Git geçmişinde eski dosyalar durmaya devam eder;
  bu, geçmişin yeniden yazılmaması tercihinin sonucudur.
- Klasik oyun kurallarının kendisi telif konusu değildir; ancak belirli
  bir ifade (belirli bir çizim, belirli bir kod, belirli bir arayüz
  kompozisyonu) olabilir. Bu çalışmanın amacı üçüncü tarafın **ifadesine**
  olan bağımlılığı kaldırmaktır ve yukarıdaki adımlar bunu depoda
  doğrulanabilir biçimde yapar.
- Bu belge "telif hakkı garantilidir" demez. Söylediği şudur:
  **üçüncü taraf provenance riskleri tespit edildi ve depo/lisans
  bilgisinden doğrulanabildiği ölçüde giderildi.**
