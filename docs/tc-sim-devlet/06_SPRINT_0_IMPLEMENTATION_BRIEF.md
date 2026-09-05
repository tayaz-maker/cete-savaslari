# TC SIM: DEVLET — Sprint 0 Implementation Brief

**Model:** Luna/Sol (birincil), Sonnet mimari soru çıkarsa danışılır.
**Mod:** İskelet kurulumu. Oynanabilir içerik YOK, event/kurum/karakter
içeriği YOK. Bu sprintin çıktısı, Sprint 1'in ilk satırını yazacak
ajanın hiçbir mimari soru sormadan başlayabilmesidir.

## Kapsam — yalnız bunlar

1. **Katalog kaydı (kısmi):** `src/lib/games.ts` → `HTML5_SLUGS`'a
   `"tc-sim-devlet"` eklenir. `GAMES` dizisindeki mevcut satır
   **`status: "soon"` olarak kalır** — Sprint 1 gerçekten oynanabilir
   olana kadar `"live"`'a çevrilmez (bkz.
   `00_MASTER_ARCHITECTURE.md` §2, "dead button" kuralı).
2. **Oyun dosya iskeleti:**
   - `public/games/tc-sim-devlet/index.html` — TC SIM'in
     `index.html`'iyle aynı iskelet (`<meta name="author" content="Tarık / TarikLab" />`,
     `viewport-fit=cover`, `?v=1` cache-bust), `<div id="app"></div>`
     ve boş bir "Yakında" mesajı (gerçek UI Sprint 1'de gelir).
   - `public/games/tc-sim-devlet/js/state.js` — `SAVE_VERSION = 1`,
     `createNewGame()` iskeleti (`01_STATE_SCHEMA.md`'deki üst
     seviye bölümleri boş/varsayılan değerlerle döner), `validateState()`
     iskeleti (alan tipi kontrolleri, henüz tüm alanlar doldurulmamış
     olsa da normalize fonksiyonu baştan var).
   - `public/games/tc-sim-devlet/js/save.js` — `tc-sim-devlet-save` /
     `-backup` anahtarları, TC SIM'in `save.js`'inden normalize/migration
     iskeleti uyarlanır.
   - `public/games/tc-sim-devlet/styles.css` — TC SIM'in breakpoint
     desenini (1060/820/540/360px) miras alan boş bir temel; evrak
     sarısı/mühür kırmızısı/karbon mavisi renk tokenleri CSS custom
     property olarak tanımlanır (`--devlet-ink`, `--devlet-seal`,
     `--devlet-carbon` gibi), ekranlar henüz yok.
3. **Deterministik yardımcı:** `js/state.js` içine TC SIM'in
   `nextRandom(state)` fonksiyonunun birebir eşdeğeri (`state.meta.rngState`
   üzerinden xorshift), Sprint 1'de yalnız S-etiketli prosedürel
   çeşitlilik için kullanılacak şekilde yorumla işaretlenir.
4. **ID konvansiyonu dosyası:** `01_STATE_SCHEMA.md` zaten bunu
   taşıyor — Sprint 0 ayrıca bir kod yardımcı fonksiyonu ekler:
   `makeCaseId(type, eventId, month, subjectId)` → `02_EVENT_CHAIN_CONTRACT.md`
   §3'teki kalıbı üretir.
5. **Event/openCase iskeleti:** `js/events.js` — boş `DEVLET_EVENTS = []`
   dizisi, `activateNextEvent`/`resolveEvent`/`processDueOpenCases`
   fonksiyon gövdeleri (içerik yok, mekanizma var) — `02`'deki yaşam
   döngüsünü çalıştıracak iskelet.
6. **Test iskeleti:**
   - `scripts/tc-sim-devlet-state.test.mjs` — `createNewGame`/
     `validateState`/save-load round-trip için ilk testler (boş state
     üzerinde bile anlamlı: normalize bozmuyor, cap'ler aşılmıyor).
   - `scripts/tc-sim-devlet-longrun.mjs` — `04_TEST_AND_RELEASE_CONTRACT.md`
     §5'teki `runDevletScenario(kind)` imzası ve CLI iskeleti; Sprint 0'da
     tek yapabildiği "boş oyunda N ay ilerlet, hiç çökme/invariant ihlali
     yok" olmalıdır (içerik olmadığı için ekonomi/toplum sabit kalır —
     bu normal ve beklenir).
7. **Cache/sürüm:** `public/sw.js`'teki `isTcSimAsset` fonksiyonu
   genelleştirilir (`/games/tc-sim/` VEYA `/games/tc-sim-devlet/` ile
   başlıyorsa network-first) — TEK satırlık değişiklik,
   `00_MASTER_ARCHITECTURE.md` §18'de gerekçelendirilmiş.
8. **Repo/dal/release kuralları:** bu belge + `04` zaten yazılı;
   Sprint 0 ek bir doküman üretmez, yalnız kod tarafını doğrular.

## Kapsam dışı — Sprint 0'da kesinlikle yapılmaz

Mühür Masası ekranı, herhangi bir kurum/karakter/kohort/bölge verisi,
herhangi bir gerçek event tanımı, ekonomi formüllerinin gerçek
katsayıları, `known`/`reported`/`actual` ayrımının UI'da gösterimi.
Bunların hepsi Sprint 1'in konusu.

## Kabul kriterleri

```
[ ] "tc-sim-devlet" HTML5_SLUGS'ta, GAMES'te status hâlâ "soon"
[ ] public/games/tc-sim-devlet/{index.html, styles.css, js/*} mevcut
[ ] createNewGame() → validateState() → saveGame() → loadGame() round-trip PASS
[ ] SAVE_VERSION = 1, ayrı save key, TC SIM save key'iyle çakışmıyor
[ ] Boş DEVLET_EVENTS ile activateNextEvent/resolveEvent/processDueOpenCases çağrılabilir, çökmez
[ ] scripts/tc-sim-devlet-*.test.mjs npm test glob'u altında koşuyor ve yeşil
[ ] scripts/tc-sim-devlet-longrun.mjs boş-state 36/120 ay koşusu invariant ihlali vermeden tamamlanıyor
[ ] public/sw.js güncellemesi TC SIM'in mevcut network-first davranışını BOZMUYOR (TC SIM testleri hâlâ yeşil)
[ ] npm run build ve npx tsc --noEmit yeşil
[ ] Dal push edildi, remote SHA doğrulandı (bkz. 04 §1)
```

## Sprint kapanış raporu formatı

`04_TEST_AND_RELEASE_CONTRACT.md` §7'deki şablonu kullan. Sprint 0 için
"UZUN KOŞU" ve "REGRESYON" satırları kısa olabilir (içerik yok) ama
boş bırakılmaz — "boş state N ay koşuyor, TC SIM V1 testleri hâlâ
320+23 yeşil" gibi somut bir cümle olmalıdır.
