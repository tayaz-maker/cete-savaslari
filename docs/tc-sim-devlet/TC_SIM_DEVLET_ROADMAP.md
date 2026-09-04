# TC SIM: DEVLET — Yol Haritası

Prototip dönem: **`restructuring_2002`** ("2002 — Yeniden Yapılanma", 36 ay) — **KİLİTLİ**.
Kapsam `TC_SIM_DEVLET_PROTOTYPE.md`, mimari `TC_SIM_DEVLET_ARCHITECTURE.md`.

Aşamalar sonuç odaklıdır: her biri bir **soruyu cevaplar**, özellik listesi değildir.

---

## Aşama 0 — Temel (TAMAMLANDI)

**Soru:** Cowork yeniden tasarım yapmadan uygulamaya başlayabilir mi?

Tasarım kilidi, TC SIM yeniden kullanım denetimi, state/motor/event/save mimarisi, prototip
dönem seçimi, içerik bütçesi, test planı ve uygulama sırası hazır. Runtime kodu yok.

**Bitti sayılma şartı:** ✅ 15 ADR kilitli, dosya haritası ve DAG hazır, 38 testlik plan ve
3 deterministik senaryo tanımlı.

---

## Aşama 1 — Dikey dilim

**Soru:** "Devlet olma hissi" eğlenceli mi?

36 ay oynanabilir tek dilim: Mühür Masası, 6 gösterge, 5 kurum, 12 aktör, 20 event, atamalar,
uygulama oranı, bilgi kalitesi (lite), dosyalar, basit arşiv, minimum ekonomi ve toplum,
save/migration, testler ve simülasyon.

**Bitti sayılma şartı:** `TC_SIM_DEVLET_TEST_PLAN.md §5`'teki 12 kabul kriteri. Özellikle:
oyuncu en az bir kararının **eksik uygulandığını** görüyor ve nedenini okuyabiliyor.

**Bu aşama eğlenceli bulunmazsa sonraki aşamalara geçilmez.** Motor büyütmek, eksik olan
hissi telafi etmez.

---

## Aşama 2 — Bilgi ve belirsizlik

**Soru:** Oyuncunun eksik bilgiyle karar vermesi gerilim üretiyor mu?

Bilgi kalitesinin tam sürümü: kurum bazlı çarpıtma derinleşir, raporlar çelişebilir,
doğrulama maliyetli hale gelir. Kâğıt Türkiye / Gerçek Türkiye ayrımının ilk somut hali.

---

## Aşama 3 — Devletin karakteri

**Soru:** İki farklı oyun birbirine benzemiyor mu?

Devlet DNA'sı, devlet refleksleri, entropi, politika borcu ve yol bağımlılığı. Geçmiş
kararların bugünü sınırlaması burada mekanikleşir.

---

## Aşama 4 — Ağlar ve aktörler

**Soru:** Kararların arkasında insanlar ve çıkarlar hissediliyor mu?

Patronaj, klikler, sermaye, medya, gayriresmî güç; aktör kariyerleri ve devlet mezunları.
Aktör sayısı tavanı kontrollü yükselir (mutlak tavan 40).

---

## Aşama 5 — Toplum derinliği

**Soru:** Toplum tek bir bar olmaktan çıktı mı?

Sınıf/kimlik/bölge/kuşak kırılımı, ısı haritası, hanehalkı yaklaşımı, göç ve oy davranışı.
Bölge sistemi burada gelir — **daha önce değil** (state patlaması riski).

---

## Aşama 6 — Dış dünya

**Soru:** Devlet dışarıya karşı da bir aktör mü?

Dış politika, jeopolitik bağlar, dış güç göstergesi, dış aktör bağlantıları.

---

## Aşama 7 — Dönemler ve uzun kampanya

**Soru:** Motor birden fazla Türkiye'yi taşıyabiliyor mu?

Yeni dönem veri paketleri (`founding_1923`, `multiparty_1950`, `junction_1980`, `present_day`,
`alternative_tr`), tarihsel çekim, karşı-olgusal tarih, 1923→2030 kampanyası ve prestij modu.

**1980–1983 bu aşamada ele alınır**; prototip döneminden bilinçli olarak dışlanmıştır
(gerekçe: `TC_SIM_DEVLET_PROTOTYPE.md §1`).

---

## Kural

Bir aşamanın sistemleri, önceki aşamanın sorusu **evet** cevabı almadan başlatılmaz.
Yeni sistem eklemek, eksik olan oyun hissini telafi etmez.
