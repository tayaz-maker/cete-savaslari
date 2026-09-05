# TC SIM: DEVLET — Test & Release Contract

Bu belge, `TARIKLAB — TC SIM DEVLET: SONNET MASTER ARCHITECTURE` görev
belgesinin §1 (remote-canonical protokolü) ve §5/§24/§25'ini (performans,
test mimarisi, uzun-koşu harness) tek bir uygulanabilir kontrata indirger.
TC SIM V1'in geliştirme tarihinden (aynı repo, `docs/tc-sim/*` ve önceki
oturum özetleri) çıkarılan derslerin doğrudan aktarımıdır.

## 0. Neden bu kadar katı — TC SIM V1'den kanıtlı dersler

Bu proje boyunca gerçekten yaşanan ve tekrar etmemesi gereken hatalar:

1. **"Resolver'ı çağırmak reachable kanıtı değildir."** Child 6–17 ve
   18–35 Core kapanışlarında, doğrudan `resolveEvent(state, choiceId)`
   çağıran testler geçerken, event'in gerçek `advanceMonth`/`activateNextEvent`
   zincirinden hiç ulaşılamadığı (koşulun asla sağlanmadığı, ya da bir
   önceki adımın yanlış state bıraktığı) bulunmuştu.
2. **Local-only commit "tamamlandı" değildir.** Birden fazla oturumda,
   remote'a hiç push edilmemiş dallar "bitti" sanılıp üstüne inşa
   edilmeye çalışıldı; bazen ilgili commit remote'ta hiç yoktu.
3. **Test-only kabul, üretim kabulü değildir.** `node --test` yeşili,
   tarayıcıda/mobilde render kontrolü olmadan "oynanabilir" anlamına
   gelmez.
4. **Sabit `?v=N` query'sine güvenmek** TC SIM'de gerçek bir eski-modül-
   karışması hatası üretmişti; düzeltme `public/sw.js`'teki network-first
   kuralıydı (bkz. `00_MASTER_ARCHITECTURE.md` §18). DEVLET bu düzeltilmiş
   deseni baştan kopyalar, eski hataya geri dönmez.
5. **Ekonomi/uzun-koşu kanıtı olmadan "PASS" demek** — TC SIM'in 18–35
   Core kapanışı, 520 haftalık dört ayrı stratejinin GERÇEKTEN farklı
   ekonomik sonuçlara vardığını ölçerek kanıtlanana kadar "PARTIAL"
   kalmıştı. DEVLET'te de bir sprint, uzun-koşu kanıtı olmadan PASS
   sayılmaz.

## 1. Remote-canonical protokolü (her sprint, istisnasız)

```
1. git fetch --all --prune
2. git ls-remote origin refs/heads/<beklenen-dal>   → SHA'yı kaydet
3. Belirtilen taban SHA'dan yeni dal aç
4. Uygula
5. Testler yeşil (bkz. §2)
6. Commit
7. git push -u origin <dal>
8. git ls-remote ile push edilen SHA'yı DOĞRULA (yerel HEAD == remote HEAD)
9. Kabul edilen iş main'e entegre edilecekse: main SHA'sını doğrula → merge/push → tekrar doğrula
10. npm run build + npx tsc --noEmit (CI'daki aynı komutlar) yerelde de yeşil
11. Player-facing ise deploy sonrası prodüksiyon/tarayıcı kontrolü
```

Git bundle/tree-snapshot transferi **yalnız** push gerçekten
başarısızsa (kimlik doğrulama/ağ engeli) acil durum yoludur, normal
akış değildir. Push başarısızsa **"yayınlandı" denmez**, açıkça
raporlanır.

`.github/workflows/ci.yml` zaten `npx tsc --noEmit && npm run build`
çalıştırıyor — DEVLET'in JS dosyaları TC SIM gibi vanilla JS olduğu için
`tsc --noEmit`'i etkilemez (repo tsconfig'i `public/games/**` içini
kapsamaz), ama `npm run build`'in DEVLET'in yeni statik dosyalarını
`public/`'tan doğru kopyaladığından her sprint sonunda emin olunur.

## 2. Test kategorileri (Sprint 1'den itibaren zorunlu)

| # | Kategori | Ne kanıtlar | TC SIM emsali |
|---|---|---|---|
| 1 | Saf sistem testleri | Formüller (ekonomi, uygulama oranı, türetilmiş DNA) girdiye göre doğru | `tc-sim-core.test.mjs` |
| 2 | Runtime event-reachability | Event gerçek tick zinciriyle (§0.1) tetiklenir, resolver'a doğrudan verilmez | `tc-sim-child-6-17.test.mjs` deseni |
| 3 | Save/load | Round-trip her önemli ara durumda (bekleyen atama, açık dosya, ay sonu sınırı) veri kaybetmez/çoğaltmaz | `tc-sim-core18-35.test.mjs` §"save/load" |
| 4 | Deterministik replay | Aynı seed + aynı kararlar ⇒ aynı checkpoint'ler, iki kez çalıştırılıp karşılaştırılır | `runAdultCoreScenario` determinism testi |
| 5 | Uzun koşu simülasyonu | 36 ay, 120 ay, senteziksel 107 yıl (1284 ay) — bkz. §4 | `tc-sim-longrun.mjs` |
| 6 | Fuzz/invariant | Rastgele (ama seed'li) karar dizileriyle state hiçbir zaman geçersiz olmaz | `run(weeks, seed)` fuzz modu |
| 7 | Tarayıcı/UI smoke | Sayfa gerçekten render olur, konsol hatasız | `scripts/browser-smoke.mjs` (repo genelinde mevcut) |
| 8 | Duyarlı/mobil sözleşme | 320/390/768px + masaüstünde yatay taşma yok, dokunma hedefleri yeterli | TC SIM breakpoint testleri |
| 9 | Prodüksiyon smoke (deploy sonrası) | Gerçek build, gerçek route, gerçek service worker | Görev belgesi §1 adım 12 |

**Hiçbiri diğerinin yerine geçmez.** 1–6 yeşil olup 7–9 atlanmışsa
sprint "test PASS" olabilir ama "release ready" DEĞİLDİR — bu ayrım
her sprint raporunda açıkça yazılır.

## 3. Save/load ve eski-save disiplini

- İlk şemadan itibaren `validateState`/normalizasyon fonksiyonu zorunlu
  (bkz. `01_STATE_SCHEMA.md` "Eski-save güvenliği").
- Her şema değişikliği `SAVE_VERSION`'ı artırır ve bir migration testi
  gerektirir: eski-şekilli bir save nesnesi elle kurulur, `loadGame`
  ile yüklenir, sonucun geçerli + makul (uydurma veri yok) olduğu
  doğrulanır.
- Ay sonu sınırında save/load: maaş/bütçe gibi periyodik işlemlerin ne
  çoğalmadığı ne kaybolmadığı ayrı bir test kategorisi olarak zorunludur
  (TC SIM'in "ay sonu sınırında kaydet/yükle" dersi doğrudan aktarılır).

## 4. Performans hedefleri ve sınırlar

| Koşu | Hedef süre (node, tek işlem) |
|---|---|
| 36 aylık vertical slice (Sprint 1 kapsamı) | < 200 ms |
| 120 aylık stres | < 1 s |
| Sentetik 107 yıl (1284 ay) stres testi | < 5 s |
| Fuzz (20 seed × 260 ay) | < 5 s toplam |

Bu hedefler TC SIM'in mevcut 520 haftalık koşusunun (~0.5 sn) ölçülmüş
performansıyla aynı büyüklük mertebesindedir — DEVLET'in kurum/kohort/
bölge/karakter ekleri O(n) kalacak şekilde tasarlanmıştır (§1'deki cap
tablosu buna hizmet eder); hiçbir yerde O(N²) tüm-ağ taraması yoktur
(`00_MASTER_ARCHITECTURE.md` §15).

Büyüyen her koleksiyonun cap'i `02_EVENT_CHAIN_CONTRACT.md` §6 ve
`01_STATE_SCHEMA.md`'de sayısal olarak tanımlıdır — "sınırlı" demek
yetmez, sayı yazılır.

## 5. Long-run harness sözleşmesi

`scripts/tc-sim-devlet-longrun.mjs`, TC SIM'in `tc-sim-longrun.mjs`
dosyasının paylaşılan-motor desenini birebir izler: ortak kurulum, hafta/ay
döngüsü, event settle fonksiyonu, checkpoint yakalama, invariant
yürüyüşü — dört ayrı simülasyon motoru **yazılmaz**, dört strateji aynı
`runDevletScenario(kind)` fonksiyonunu paylaşır.

Sprint 1 minimum stratejileri (görev belgesinin öngördüğü ayrım
uygulanmış): `institutionalist` (kurumları güçlendirmeye öncelik),
`stability-first` (ekonomik/toplumsal istikrar), `spending-heavy`
(kamu harcaması ağırlıklı), `market-first` (piyasa reformu ağırlıklı).
Kabul kriteri TC SIM'deki gibi: **stratejiler ölçülebilir biçimde
ayrışmalı** — dördü de aynı ay 36'da neredeyse aynı ekonomi/toplum
durumuna geliyorsa bu bir motor kusurudur, PASS değildir.

CLI modları: `node scripts/tc-sim-devlet-longrun.mjs 36`, `120`, `1284`,
`fuzz`, `institutionalist`, `stability-first`, `spending-heavy`,
`market-first`, `matrix` (dördü birden).

## 6. Determinizm kabulü

Gameplay `Math.random` sayısı: **0**, her sprint sonunda
`grep -rn "Math.random" public/games/tc-sim-devlet/js/` ile doğrulanır.
Seed'li `nextRandom(state)` eşdeğeri yalnız S-etiketli prosedürel
çeşitlilik üretir (`00_MASTER_ARCHITECTURE.md` §11, §12); iki koşu aynı
seed + aynı kararlarla aynı checkpoint'lere varmalıdır — bu, §2 kategori
4'ün somut kabul ölçütüdür.

## 7. Sprint kapanış şablonu

Her implementasyon sprinti şu tabloyla kapanır (Sprint 0/1 briefleri
kendi versiyonlarını taşır, format sabittir):

```
KAYNAK: taban dal / SHA / doğrulama durumu
UYGULANAN: dosyalar, sistemler
TESTLER: kategori 1-9, her biri PASS/PARTIAL/N-A + sayı
PERFORMANS: ölçülen süreler vs hedef
UZUN KOŞU: strateji sonuçları, ayrışma kanıtı
REGRESYON: TC SIM V1 testleri hâlâ yeşil mi (aynı repo, aynı `npm test`)
REMOTE: dal push edildi mi, SHA doğrulandı mı
SONUÇ: PASS / PARTIAL / BLOCKED + net gerekçe
```

"PARTIAL" yalnız gerçek bir teknik engel kaldığında kabul edilir —
"ölçülmedi", "ayrı test yazılmadı", "kenar durum değerlendirilmedi"
PARTIAL gerekçesi olarak KABUL EDİLMEZ (TC SIM 18–35 Core görev
belgesinin §40 kuralı, burada da geçerlidir).
