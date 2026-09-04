# TC SIM: DEVLET — İlk Prototip Kapsamı

Mimari: `TC_SIM_DEVLET_ARCHITECTURE.md`. Testler: `TC_SIM_DEVLET_TEST_PLAN.md`.
Bu belge **ne yapılacağını ve ne kadar yapılacağını** kilitler. Runtime kodu yoktur.

---

## 1. Seçilen dönem — KİLİTLİ

### 2002–2005 — "Yeniden Yapılanma"

- `eraId`: **`restructuring_2002`**
- Görünen ad: **2002 — Yeniden Yapılanma**
- Süre: **36 ay** (2002-01 → 2004-12)

**Neden 1980–1983 değil (ürün kararı, tarihsel yargı değil):**

1. **İmza mekaniği ancak burada çalışır.** Oyunun çekirdeği "karar ≠ uygulama". 2002–2005'te
   merkez ile kurumlar arasında gerçek sürtünme vardır: bürokratik direnç, kurumsal özerklik,
   dış program şartlılığı. Askerî yönetim döneminde merkezin emri büyük ölçüde uygulanır;
   uygulama oranı %90'larda sabitlenir ve oyunun tek ayırt edici mekaniği **ölü doğar.**
2. **Atama sistemi burada bir güç mücadelesidir**, tek taraflı bir tayin değil. Prototipin
   ikinci ana mekaniği de böylece gerçekten test edilir.
3. **Ekonomi doğal olarak kısıt üretir** (kriz mirası, borç, enflasyon baskısı, dış program).
   Makro motor yazmadan mali kısıt hissi kurulabilir.
4. **Tarihsel hassasiyet belirgin biçimde daha düşük.** 1980–83, kitlesel gözaltı, işkence ve
   idamları içerir; bir _prototipin_ atılıp yeniden yazılacak mekanikleri, Türkiye tarihinin en
   hassas dosyalarının üstünde denenmemelidir. Bu dönem ileride, motor olgunlaştığında ve
   içerik disiplini oturduğunda ele alınmalıdır.
5. **Araştırma yükü daha hafif**; kaynaklar yakın ve bol.

**Karar tektir; alternatif bırakılmamıştır.** 1980–1983 ileriki bir dönem paketidir.

---

## 2. Zaman

- Ana tur: **1 ay**. Prototip: **36 tur**.
- Ay sonu: ekonomi + toplum güncellemesi, vadesi gelen dosyalar, Devlet Karnesi.
- Yıl sonu: yıllık kayıt (3 adet).
- Çeyreklik toplama ve hız sistemi **yok**.

---

## 3. Göstergeler — tam 6

| id                     | Türkçe etiket     | Aralık | Neyi temsil eder                   | Kim etkiler                                     |
| ---------------------- | ----------------- | ------ | ---------------------------------- | ----------------------------------------------- |
| `state_capacity`       | Devlet Kapasitesi | 0–100  | Merkezin iş yaptırabilme gücü      | Uygulama oranı, kurum kapasitesi, ekonomi       |
| `institutionalization` | Kurumsallık       | 0–100  | Kuralların kişilerden bağımsızlığı | Atamalar, kurum özerkliği, uzun vadeli dosyalar |
| `social_consent`       | Toplumsal Rıza    | 0–100  | Halkın yönetime verdiği onay       | Ekonomi, uygulanan politikalar, ısı             |
| `social_heat`          | Toplumsal Isı     | 0–100  | Sokaktaki gerilim (yüksek = kötü)  | Ekonomi baskısı, sert politikalar, rıza         |
| `fiscal_strength`      | Mali Güç          | 0–100  | Hazinenin manevra alanı            | Ekonomi, politika maliyetleri                   |
| `information_quality`  | Bilgi Kalitesi    | 0–100  | Merkeze gelen verinin doğruluğu    | Kurum bilgi kalitesi, raporlama sapması         |

Hiçbiri tek başına "iyi/kötü" değildir. Yüksek kapasite + düşük kurumsallık = güçlü ama
kişiye bağımlı devlet; yüksek kurumsallık + düşük kapasite = hukuken sağlam, sahada zayıf devlet.

**Prototipte YOK** (ileriki aşamalara kilitli): Dış Güç, Gayriresmî Güç, Kurumsal Hafıza puanı,
Anlatı Kontrolü, Devlet Entropisi.

---

## 4. Kurumlar — tam 5

Tek generic şema (`ARCHITECTURE §3`). Başlangıç değerleri dönem verisindedir.

| id             | Ad                  | Rol özeti                                                                           |
| -------------- | ------------------- | ----------------------------------------------------------------------------------- |
| `finance`      | Maliye ve Hazine    | Bütçe, borç, mali disiplin                                                          |
| `central_bank` | Merkez Bankası      | Para politikası, yeni kazanılmış özerklik → yüksek `autonomy`                       |
| `interior`     | İçişleri ve Mülkiye | Valiler, taşra, uygulamanın sahadaki ayağı → uygulama oranının en kritik kurumu     |
| `judiciary`    | Yargı               | Hukuki süzgeç, yüksek `autonomy`, düşük `alignment` ile başlar                      |
| `military`     | Genelkurmay         | Güvenlik ve rejim refleksi; `alignment` düşükken özerklik cezası en sert hissedilir |

Her kurumda: `capacity`, `autonomy`, `alignment`, `informationQuality`, `leaderActorId`, `memory`.
Bütçe payı prototipte **yok** (ekonomi agregattır).

---

## 5. Aktörler — tam 12

| Dağılım                                       | Sayı |
| --------------------------------------------- | ---- |
| Kurum liderleri (5 kurumun başı)              | 5    |
| Atama adayı havuzu (boşluklar için)           | 4    |
| Kurum dışı aktörler (sermaye, medya, siyaset) | 3    |

**Görünür:** `role`, `institutionId`, `publicProfile`.
**Gizli:** `loyalty`, `competence`, `ambition`, `ties[]`.

Oyuncu gizli statları **asla ham göremez**; atama ekranında `report()` ile çarpıtılmış tahmin
görür. Gerçek kişilere dayanan aktörlerde rol ve görev dönemi kaynağa dayanır; gizli statlar
açıkça simülasyon soyutlamasıdır (`ARCHITECTURE §16`).

---

## 6. İçerik bütçesi — aşılmayacak

| Öğe                      | Prototip       | Not                                           |
| ------------------------ | -------------- | --------------------------------------------- |
| Kurum                    | **5**          | Yeni kurum eklenmez                           |
| Aktör                    | **12**         | Mutlak tavan 40, prototipte 12                |
| Event tanımı             | **20**         | 12 sistemik, 6 kurumsal/atama, 2 arşiv dönüşü |
| Politika kararı (choice) | **~45**        | Event başına 2–3                              |
| Boşluk (vacancy)         | **4**          | 36 ay içinde açılan atama sayısı              |
| Gecikmeli sonuç şablonu  | **8**          |                                               |
| Arşiv kaydı (üretilen)   | 36 ayda ~15–25 | Sınır 300                                     |
| Gösterge                 | **6**          |                                               |

Cowork "biraz daha ekleyeyim" demeyecek. Bütçe aşımı kapsam ihlalidir.

---

## 7. İlk oynanabilir döngü

Oyuncunun her turda yaşadığı akış (motor perspektifi):

```
1  MÜHÜR MASASI açılır: tarih, 6 gösterge (raporlanan), acil brifing, kurum durumu,
   ekonomik/toplumsal baskı, açık dosyalar, son sonuçlar
2  Brifing okunur (resmî ses + koridor sesi)
3  İsteğe bağlı: KURUMLAR / KİŞİLER / DOSYALAR ekranlarında bağlam incelenir
4  Karar verilir (choice seçilir)
5  Uygulama oranı hesaplanır ve GÖSTERİLİR (breakdown ile: "kurum kapasitesi 28,
   uyum 12, devlet kapasitesi 11, direnç 8, özerklik cezası −6, dalgalanma +1 → %54")
6  Anında sonuç uygulanır (niyetin %54'ü)
7  Varsa gecikmeli dosya açılır, arşiv kaydı yazılır
8  Ay ilerletilir → ay sonu ekonomi/toplum + Devlet Karnesi
9  Sonraki ay
```

Atama turu geldiğinde 4. adım "aday seç" olur; sonuç yine gecikmeli dosya üretir.

**MVP başarı koşulu:** 36 ay oynayan biri, bir hükümeti değil, **kurumlar ve geçmiş arasında
sıkışmış devlet organizmasını yönlendirmeye çalıştığını** hissediyor mu?

Bunun ölçülebilir karşılığı: oyuncunun kararlarının en az bir kısmı belirgin biçimde eksik
uygulanmalı, en az bir atama beklenmedik sonuç vermeli ve en az bir eski dosya geri dönmelidir.

---

## 8. Ekonomi (minimum)

```
economy { treasury, inflationPressure, unemploymentPressure, growthPressure }
```

- `treasury`: tek sayı. Politika maliyetleri buradan düşer.
- Üç "baskı" değeri 0–100'dür ve **makro model değildir**: politika ve zamanla değişen,
  toplum/rıza üzerinde etki üreten agregatlardır.
- Ay sonu güncellemesi tek fonksiyondur ve deterministiktir.
- Gerçek TC makro modeli, faiz/kur/dış ticaret motoru **yoktur**.
- Amaç tek: politikalara mali kısıt vermek.

---

## 9. Toplum (minimum)

```
society { consent, heat }
```

- Tek "popülerlik barı" değildir: `consent` (onay) ve `heat` (gerilim) **ayrı ve bazen
  birlikte yükselebilir** — memnuniyetsiz ama sessiz, ya da onaylayan ama gergin toplum.
- Sınıf, bölge, kuşak, hanehalkı kırılımı **yok** (sonraki aşamalar).
- Ekonomi baskıları ve uygulanan politikalar besler; göstergelere geri besleme yapar.

---

## 10. Ağlar (lite)

- Prototipte ayrı ağ katmanı **yok**; bağlar aktör üzerinde `hidden.ties[]` olarak durur.
- Kullanım alanı sadece iki yer: atama sonucunun yan etkisi ve iki event koşulu.
- Graph veritabanı, klik simülatörü, medya motoru, hortum haritası **yok**.

---

## 11. Hafıza

**Tek karar:** prototipte yalnız **kurumsal hafıza** vardır (`institution.memory`, kurum başına
40 kayıtla sınırlı). Halk hafızası ayrı sistem olarak **ertelenmiştir**; toplumun geçmişe tepkisi
şimdilik `consent`/`heat` üzerinden dolaylı işler.

TC SIM'in NPC hafızası buraya **kavram olarak** taşınır: kısa, olaya bağlı, sınırlı liste.

---

## 12. Dosyalar ve arşiv

- Açık dosya = `stateFile` (ARCHITECTURE §3). Prototipte üretilen türler: `investigation`, `dormant`.
- Vadesi gelen dosya brifing üretir; çözülünce **arşive taşınır ve listeden çıkar**.
- Arşiv kaydının `known: false` olabilmesi önemlidir: oyuncunun bilmediği bir kayıt ileride
  bir event koşuluyla geri döner (prototipte en az bir örnek zorunlu).

---

## 13. Arayüz

### Navigasyon — tam 6 bölüm, hepsi çalışır

```
MÜHÜR MASASI · KURUMLAR · KİŞİLER · DOSYALAR · EKONOMİ · ARŞİV
```

**Pasif/sahte sekme yoktur.** TOPLUM verisi MÜHÜR MASASI ve EKONOMİ içinde gösterilir;
ayrı ekran açılmaz. DEVLET, KELEBEKLER, ISI HARİTASI gibi ekranlar sonraki aşamalara aittir
ve prototipte **görünmez**.

### MÜHÜR MASASI panelleri

| Panel               | İçerik                                                                  |
| ------------------- | ----------------------------------------------------------------------- |
| Tarih ve tur        | Yıl / ay / tur sayacı, "Ayı ilerlet"                                    |
| Devlet göstergeleri | 6 gösterge, **raporlanan** değerle; düşük bilgi kalitesinde "±" işareti |
| Acil brifing        | Aktif event başlığı, resmî ses + koridor sesi, seçenekler               |
| Kurumlar şeridi     | 5 kurum: kapasite, uyum, özerklik (kompakt)                             |
| Baskı               | Hazine, enflasyon/işsizlik/büyüme baskısı, rıza ve ısı                  |
| Açık dosyalar       | Bilinen açık `stateFile`'lar ve kalan ay                                |
| Son sonuçlar        | Son kararların uygulama oranı ve etkisi                                 |

### Görsel kimlik

Bürokratik, arşivsel, koyu, veri yoğun, ciddi. Devlet dosyası estetiği.
**TC SIM'in arayüz klonu değildir.** Racon/Mahalle dili ve spor menajeri görsel dili yoktur.
Ağır görsel varlık (fotoğraf, doku, ikon seti) prototipte kullanılmaz; tipografi ve düzenle çözülür.

---

## 14. Bu prototipte kesinlikle YOK

81 il simülasyonu · tüm TBMM · gerçek zamanlı ekonomi · yüzlerce karakter · her devlet kurumu ·
seçim simülasyonu · diplomasi · dünya ekonomisi · savaş motoru · partiler · medya kuruluşları ·
aile hanedanları · 1923–2030 kampanyası · otonom ülke YZ'si · LLM simülasyon motoru ·
devlet DNA'sı · entropi · politika borcu mekaniği · yol bağımlılığı · bilgi kalitesi tam sürümü ·
ağ/klik simülatörü · hortum haritası · söylenti motoru · leke/kompromat · nesiller · bölgeler ·
dış politika · tarihsel çekim · kelebekler ekranı · dört sesin her eventte zorunlu olması.
