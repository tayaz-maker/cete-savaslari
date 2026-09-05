# TC SIM: DEVLET — Historical Data & Provenance Contract

Bu belge, ana tasarım belgesinin §41–44'ünü (tarihsel karakterler, tarihsel
çekim, tarihsel doğruluk, tarihsel sis) ve Sonnet görev belgesinin §3
"Gerçek kişi / tartışmalı tarih" boşluğunu kapatır. **Bu, projedeki en
yüksek hukuki/itibar riski taşıyan karardır** ve bu yüzden ayrıntılı
gerekçelendirilir.

## 1. T / A / S etiketi — zorunlu, her içerik biriminde

Her event tanımı, karakter tohum kaydı ve senaryo başlangıç anlık
görüntüsü bir `provenance` alanı taşır:

- **T — Tarihsel:** gerçek dünyada belgelenmiş bir olay/kişi/karar
  çekirdeğine dayanır.
- **A — Alternatif tarih:** oyuncunun kararları gerçek tarihten
  ayrıldıktan sonra oluşan, gerçek dünyada olmamış ama mekanik olarak
  o dallanmanın doğal sonucu olan içerik.
- **S — Simülasyon üretimi:** doğrudan motorun state'inden (ekonomi +
  toplum + kurum kombinasyonu) türeyen, tarihte hiç karşılığı olmayan
  sistemik olay (ana belge §28'deki "protesto dalgası" örneği).

Opsiyonel `certainty: "confirmed" | "contested" | "claim"` ve `sourceNote`
(serbest metin, normalde UI'da gizli) — bir "Tarih Notu" sekmesi
**Sprint 1'de yapılmaz** ama veri şekli baştan bu sekmeyi destekleyecek
şekilde tasarlanır (bkz. `00_MASTER_ARCHITECTURE.md` §8).

## 2. Gerçek kişi kuralı — tek ve sabit

Bu kural hem 1980–1983 hem 2002–2005 için aynı şiddette geçerlidir ve
seçilen dönemden bağımsızdır:

> **Gerçek, yaşayan veya yakın zamanda vefat etmiş bir siyasi/kurumsal
> figür, oynanabilir bir "karakter kartı" (loyalty/ambition/network gibi
> manipüle edilebilir istatistiklere sahip bir NPC) olarak MODELLENMEZ.**

Bunun yerine:

- Oyuncu **rollerle** ve **kurumlarla** etkileşir (`office`,
  `institution`), gerçek isimlerle değil. Sprint 1'in 10–20 karakteri
  neredeyse tamamı **prosedürel** (bkz. §3), rolleri gerçek dönemin
  makam yapısına sadıktır (örn. "Maliye Bakanlığı Müsteşarı", "İstanbul
  Valisi") ama kişi kurgusaldır.
- En üst düzey birkaç gerçek isim (dönemin cumhurbaşkanı/başbakanı gibi)
  yalnız **bağlam/flavor referansı** olarak metinde geçebilir (örn. bir
  arşiv kaydının "resmî ses" alanında dönemin bilinen söylemine atıf) —
  ama bu isimler asla bir `characters[]` kaydı olarak state'e girmez,
  asla bir `loyalty`/`ambition` sayısı taşımaz, asla oyuncu tarafından
  "atanamaz" veya "görevden alınamaz".
- Bir gerçek kişiye dair **iddialı/karalayıcı iddia (yolsuzluk, cinsel
  skandal, suç bağlantısı vb.) hiçbir zaman uydurulmaz.** Ana belgenin
  §32 (leke/kompromat) ve §54 (+18 içerik) sistemleri yalnız **prosedürel
  (S/A etiketli, kurgusal) karakterler** üzerinde çalışır. Gerçek bir
  kişiye atfedilen herhangi bir olumsuz iddia, yalnız kamuya mal olmuş,
  kaynaklanabilir, tarihsel kayıtlarda zaten var olan bir olguya
  dayanıyorsa ve `certainty` alanıyla doğru işaretlenmişse kullanılabilir
  — motor bunu **asla kendiliğinden üretmez.**
- Bu kural, görev belgesinin 1980 vs 2002 karşılaştırmasında 2002'yi
  seçmemin gerekçelerinden biridir (bkz. `07_SPRINT_1_VERTICAL_SLICE_BRIEF.md`)
  ama kuralın kendisi **hangi dönem seçilirse seçilsin** değişmez;
  1923, 1950, 1980, günümüz — hepsi bu kurala tabidir.

## 3. Tarihsel çekim / prosedürel oran

Ana belge §41'deki eğri (1923→%95T, 1990→%30, 2010→%15, 2030→%5)
kullanılır; 2002 için doğrusal ara değer: **≈%22 tarihsel / %78
prosedürel**, ama "tarihsel" olan %22 bile §2'deki gerçek-kişi kuralına
tabidir — yani "tarihsel" bir karakter kaydı, gerçek bir ismi değil,
**gerçek bir makam/olay örüntüsünü** temsil eden, ismi kurgusal bir
karakter olabilir (örn. "2001 krizinden sağ çıkan, IMF programına bağlı
bir Merkez Bankası bürokratı" — tip olarak dönemin gerçek insan
profilini yansıtır, isim olarak kimseyi temsil etmez).

Alternatif tarihin (A) olasılığı tamamen rastgele değildir; ana belge
§42'nin dediği gibi yapısal koşullardan (kurum otonomisi, kutuplaşma,
ekonomik kriz, meşruiyet, dış konjonktür) **deterministik** bir eşik
fonksiyonuyla hesaplanır — `Math.random` değil, `00_MASTER_ARCHITECTURE.md`
§6'daki türetim ailesiyle aynı disiplin.

## 4. Tarihsel sis

Gerçek dünyada bile kesin bilgi bulunmayan konularda oyun tanrısal
kesinlik iddia etmez. `certainty` alanı üç değerle bunu kodlar
(`confirmed` / `contested` / `claim`). UI, normal oynanışta bu etiketi
göstermek **zorunda değildir** (ana belge §43 — sürekli akademik dipnot
istenmiyor) ama veri, ayırt edilebilir kalır; ileride "Tarih Notu"
sekmesi bunu okuyabilir.

## 5. Günümüz / canlı veri kuralı (ileri faz, bugün için not)

2002–2005 sabit bir tarihsel pencere olduğu için bu madde Sprint 1'i
etkilemez. Bir "Günümüz" senaryosu eklenirse: **canlı API'ye bağımlılık
YOK.** Yalnız `meta.scenarioSnapshotVersion` ile damgalanmış statik veri
anlık görüntüsü kullanılır; anlık görüntünün güncelleme kadansı ve
fallback davranışı o senaryo eklendiğinde ayrı bir doküman ister. Save,
oluşturulduğu anlık görüntü sürümünü saklar — eski bir save yeniden
açıldığında motor **asla** o save'i sessizce daha yeni bir veri kümesiyle
karıştırmaz.

## 6. Siyasi tarafsızlık

Hiçbir ideoloji/faksiyon/kimlik motorda "doğal olarak doğru/akıllı/kötü"
olarak kodlanmaz. Etkiler mekanik ve bağlamsaldır: bir kurumun
`politicalAlignment`'ı yalnız uygulama hattındaki kabul oranını etkiler,
"iyi" ya da "kötü" bir katsayı taşımaz. Tartışmalı tarihsel olaylar
`certainty: "contested"` ile işaretlenir. Oyunun tek bir "iyi son"u yoktur
(ana belge §56); bu, provenance şemasının doğal bir sonucu olarak
korunur — motor bir devlet formunu diğerine göre puanlamaz.

## 7. +18 / karanlık içerik sınırı — provenance ile kesişimi

Ana belgenin §54 kuralı (şantaj/yolsuzluk/organize suç konu olabilir;
pornografik/sömürücü anlatım olmaz; çocuk istismarı asla oynanabilir
içerik olmaz) **yalnız `provenance: "S"` veya `"A"` etiketli kurgusal
karakterler ve kurumlar üzerinde** işletilir. Bir `"T"` etiketli
gerçek-dünya olayına dair böyle bir içerik yalnız zaten kamuya mal olmuş,
kaynaklanabilir bir olguya dayanıyorsa ve doğrudan bir gerçek kişiye
(§2) değil bir **kuruma/döneme** atfediliyorsa kullanılabilir.
