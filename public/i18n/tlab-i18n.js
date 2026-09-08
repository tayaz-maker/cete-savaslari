/**
 * TarikLab lightweight i18n.
 * Preference key: tariklab.language
 * Changing language never writes gameplay saves.
 */
(function (root) {
  const KEY = "tariklab.language";
  const listeners = new Set();

  const EN = {
    "portal.lab": "Game Lab",
    "portal.games": "Games",
    "portal.playable": "playable",
    "portal.soon": "Coming Soon",
    "portal.play": "Play",
    "portal.sources": "Credits",
    "portal.back": "← Games",
    "portal.openGame": "Open {title}",
    "footer.rights": "© 2026 TarikLab. All rights reserved.",
    "lang.tr": "TR",
    "lang.en": "EN",
    "lang.label": "Language",
    "common.save": "Save",
    "common.load": "Load",
    "common.delete": "Delete",
    "common.newGame": "New Game",
    "common.continue": "Continue",
    "common.howTo": "How to Play",
    "common.back": "Back",
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.cancel": "Cancel",
    "common.reset": "Reset",
    "common.slot": "Slot",
    "common.emptySlot": "Empty slot",
    "common.corruptSave": "Corrupt save",
    "common.full": "occupied",
    "common.empty": "empty",
    "common.help": "How to Play",
    "common.difficulty": "Difficulty",
    "common.easy": "Easy",
    "common.medium": "Medium",
    "common.hard": "Hard",
    "common.restart": "Restart",
    "common.undo": "Undo",
    "common.hint": "Hint",
    "nw.meetingNight": "Meeting Night",
    "nw.inspect": "Inspect",
    "nw.policy": "Policy",
    "nw.major": "Major decision",
    "nw.advanceWork": "Act / advance",
    "nw.returnPhone": "Return it",
    "nw.monthTick": "Advance month",
    "nw.weekTick": "Advance week",
    "nw.advance": "Advance",
    "nw.ready": "Slot {n} ready",
    "nw.newSave": "Start a new save.",
    "nw.slots": "Save slots",
    "nw.grand": "1923→2030",
    "nw.targeted": "Directed",
    "devlet.reported": "Reported",
    "devlet.known": "Known",
    "devlet.treasury": "Treasury",
    "devlet.impl": "Implementation Rate",
    "devlet.entropy": "Entropy",
    "devlet.heat": "Social Heat",
    "devlet.debt": "Policy Debt",
    "hayat.shadow": "Long Shadow",
    "apartman.meeting": "Meeting Night",
    "kayip.privacy": "Privacy Pressure",
    "credits.title": "Credits",
    "credits.kicker": "TarikLab · creator and components",
    "cete.helpTitle": "How to Play",
  };

  const PHRASE = {
    "← Oyunlar": "← Games",
    "Oyunlar": "Games",
    "Oyun Laboratuvarı": "Game Lab",
    "Yakında": "Coming Soon",
    "oynanabilir": "playable",
    "Kaynaklar": "Credits",
    "Tüm hakları saklıdır.": "All rights reserved.",
    "© 2026 TarikLab. Tüm hakları saklıdır.": "© 2026 TarikLab. All rights reserved.",
    "Kaydet": "Save",
    "Yükle": "Load",
    "Sil": "Delete",
    "Yeni oyun": "New Game",
    "Yeni Oyun": "New Game",
    "Yeni labirent": "New maze",
    "Devam": "Continue",
    "Geri": "Back",
    "Kapat": "Close",
    "Onayla": "Confirm",
    "İptal": "Cancel",
    "Sıfırla": "Reset",
    "Nasıl oynanır": "How to Play",
    "Nasıl Oynanır": "How to Play",
    "Nasıl oynanır?": "How to Play?",
    "? Nasıl Oynanır": "? How to Play",
    "Boş slot": "Empty slot",
    "Boş": "Empty",
    "Bozuk kayıt": "Corrupt save",
    "Kayıt okunamıyor": "Save unreadable",
    "dolu": "occupied",
    "boş": "empty",
    "Zorluk": "Difficulty",
    "Kolay": "Easy",
    "Orta": "Medium",
    "Zor": "Hard",
    "Yerleşim": "Placement",
    "Mod": "Mode",
    "Bilgisayara karşı": "Versus computer",
    "Sırayla (aynı cihaz)": "Hotseat (same device)",
    "Döndür (R)": "Rotate (R)",
    "Kendin yerleştir": "Auto-place",
    "Filoyu sıfırla": "Reset fleet",
    "Savaşı başlat": "Start battle",
    "Kayıt yerleri": "Save slots",
    "Yeni bir kayıt başlat.": "Start a new save.",
    // TC SIM: navigation, primary controls, new-game gate, save/status text.
    "Yaşam Yönetimi": "Life Management",
    "ANA SAYFA": "HOME",
    "BEN": "ME",
    "TAKVİM": "CALENDAR",
    "PARA": "MONEY",
    "FİNANS": "FINANCE",
    "MARKET": "MARKET",
    "İŞ": "WORK",
    "EĞİTİM": "EDUCATION",
    "KİŞİLER": "PEOPLE",
    "AİLE / İLİŞKİLER": "FAMILY / RELATIONS",
    "EV": "HOUSE",
    "BEDEN": "BODY",
    "GEÇMİŞ": "HISTORY",
    "YIL DOSYASI": "YEAR FILE",
    "Oyun bölümleri": "Game sections",
    "Yaşam raporu": "Life report",
    "Haftayı ilerlet": "Advance the week",
    "İsim": "Name",
    "Kimlik": "Identity",
    "Belirtmek istemiyorum": "Prefer not to say",
    "Kadın": "Woman",
    "Erkek": "Man",
    "Başlangıç profili": "Starting profile",
    "Dengeli": "Balanced",
    "Hırslı": "Ambitious",
    "Sosyal": "Social",
    "Aile ortamı": "Family background",
    "Aile yapısı": "Family structure",
    "Çekirdek Aile": "Nuclear family",
    "Geniş Aile": "Extended family",
    "Kök Aile": "Stem family",
    "Tek Ebeveynli Aile": "Single-parent family",
    "Rastgele": "Random",
    "Maddi başlangıç": "Financial start",
    "Eğitim geçmişi": "Education background",
    "Sosyal çevre": "Social circle",
    "Askerlik durumu": "Military status",
    "Bu yaşamda yükümlülük yok": "No obligation in this life",
    "Yükümlülük var": "Has an obligation",
    "Başlangıç dönemi": "Starting era",
    "Bu slota yeni hayat": "New life in this slot",
    "Otomatik kaydedildi.": "Autosaved.",
    "Elle kaydedildi.": "Saved manually.",
    "Sakin bir hafta geçti.": "A quiet week passed.",
    "Toplantı Gecesi": "Meeting Night",
    "İncele": "Inspect",
    "Politika": "Policy",
    "Büyük karar": "Major decision",
    "İş / ilerle": "Act / advance",
    "İade et": "Return it",
    "Ay ilerle": "Advance month",
    "Hafta ilerle": "Advance week",
    "İlerle": "Advance",
    "Hedefli": "Directed",
    "büyük kampanya": "grand campaign",
    "dönem": "period",
    "kapandı": "closed",
    "Durum": "Status",
    "Genel": "Overview",
    "Sakinler": "Residents",
    "Bina": "Building",
    "Aidat/Kasa": "Dues / Treasury",
    "Meseleler": "Issues",
    "Toplantı": "Meeting",
    "Geçmiş": "History",
    "Yüküm": "Obligations",
    "Fırsat": "Opportunity",
    "İlişkiler": "Relations",
    "Hayat": "Life",
    "Karar": "Decision",
    "Gölgeler": "Shadows",
    "Zaman kıtlığı": "Time scarcity",
    "Uzun Gölge": "Long Shadow",
    "Baştan çöz": "Solve from start",
    "Yeniden başlat": "Restart",
    "Yeniden kur": "Reset board",
    "Geri al": "Undo",
    "İpucu": "Hint",
    "Tahtayı çevir": "Flip board",
    "Hamleler": "Moves",
    "Hamle": "Moves",
    "Süre": "Time",
    "En kısa": "Shortest",
    "Kalan taş": "Pegs left",
    "En iyin": "Your best",
    "Kurallar ve kontroller": "Rules and controls",
    "İki oyuncu": "Two players",
    "İki Oyuncu": "Two Players",
    "Bilgisayara Karşı": "Versus Computer",
    "Oyun modu": "Game mode",
    "Yukarı git": "Move up",
    "Sola git": "Move left",
    "Sağa git": "Move right",
    "Aşağı git": "Move down",
    "18+ onay": "18+ confirmation",
    "18 yaşından büyüğüm": "I am 18 or older",
    "Dosya aç": "Open a file",
    "İsmin, semtin, raconun": "Your name, hood, racon",
    "Ad": "Name",
    "Semt": "Neighborhood",
    "Oyun kilitlendi": "The game locked up",
    "Üç kayıt yeri": "Three save slots",
    "Kayıt": "Save",
    "açık": "active",
    "kayıt yok": "no save",
    "az önce": "just now",
    "Ben": "Me",
    "İcraat": "Jobs",
    "Tezgâh": "Shop",
    "Emlak": "Property",
    "Sokak": "Street",
    "Klinik": "Clinic",
    "Amaç": "Aim",
    "Temel döngü": "Core loop",
    "Kontroller": "Controls",
    "Kaynaklar ve göstergeler": "Resources and meters",
    "İlerleme": "Progress",
    "Risk ve kayıp": "Risk and loss",
    "İlk oyun için ipuçları": "First-run tips",
    "Önemli not": "Note",
    "Haftalık döngü": "Weekly loop",
    "İş ve para": "Work and money",
    "İlerleme ve göstergeler": "Progress and meters",
    "Risk ve sonuçlar": "Risk and fallout",
    "İleri hayat: emeklilik, miras ve nesil": "Later life: retirement, inheritance, generation",
    "TarikLab · yaratıcı ve bileşenler": "TarikLab · creator and components",
    "Özgün TarikLab oyunları": "Original TarikLab games",
    "Üçüncü taraf bileşenler": "Third-party components",
    "Klasik oyun kuralları üzerindeki hak iddiası bu bildirimin kapsamı dışındadır.":
      "No claim is made over public-domain classic game rules.",
    "Defter kapandı": "The ledger is closed",
    "Rapor edilen enflasyon": "Reported inflation",
    "güven": "confidence",
    "Rapor edilen hazine": "Reported treasury",
    "işsizlik": "unemployment",
    "Uygulama": "Implementation",
    "form": "form",
    "entropi": "entropy",
    "Muasır Medeniyet": "Contemporary Civilization",
    "Bölgesel Güç": "Regional Power",
    "Sanayi Devi": "Industrial Giant",
    "Demokratik Konsolidasyon": "Democratic Consolidation",
    "Sosyal Devlet": "Social State",
    "Tam Bağımsızlık": "Full Independence",
    "İstikrar Devleti": "Stability State",
    "Günümüz": "Present day",
    "Alternatif": "Alternative",
    "Borç toparlanması": "Debt recovery",
    "Aile bakımı": "Family care",
    "İş penceresi": "Career window",
    "Beden hesabı": "Body ledger",
    "Taşınma": "Moving out",
    "İlişki onarımı": "Repairing us",
    "Yalnızlık / çevre": "Loneliness / circle",
    "İşsiz toparlanma": "Jobless recovery",
    "Tezgâh denemesi": "Side-hustle trial",
    "Sınav / başvuru": "Exam / application",
    "Düğün yükü": "Wedding load",
    "Aile borcu": "Family debt",
    "Kira krizi": "Rent crisis",
    "Bakım nöbeti": "Care shift",
    "Tükenmişlik": "Burnout",
    "Yeni şehir": "New city",
    "Tebliğ / itiraz": "Notice / appeal",
    "Yan iş / proje": "Side job / project",
    "Yeni oyun başlat.": "Start a new game.",
    "Senin filon": "Your fleet",
    "Rakip denizi": "Enemy waters",
    "Zafer — rakip filo battı": "Victory — enemy fleet sunk",
    "Kayıp — filon battı": "Defeat — your fleet is sunk",
    "Sıra sende": "Your shot",
    "Rakip ateş ediyor": "Enemy firing",
    "Menü": "Menu",
    "İLERLET": "ADVANCE",
    "Telefonu yan çevir": "Turn the phone sideways",
    "Kod gir": "Enter code",
    "Kira": "Rent",
    "Kredi kartı asgari": "Card minimum",
    "Aidat": "Building dues",
    "Apartman Yöneticisi": "Building Manager",
  };

  const CATALOG_EN = {
    "cete-savaslari": { title: "Çete Savaşları", subtitle: "Racon, district, cash in TL." },
    hanedan: { title: "Çete Savaşları: Hanedan", subtitle: "Men die. The house remains." },
    racon: { title: "Racon Manager", subtitle: "Men die. The name remains." },
    "tc-sim": { title: "TC SIM", subtitle: "One life. Weekly choices, years of fallout." },
    bukucu: { title: "Son Mahalle Bükücü", subtitle: "Istanbul title deed. Who holds the district bends it. Money in TL." },
    labirent: { title: "Labirent", subtitle: "Closed paths, one exit." },
    "peg-solitaire": { title: "Tek Taş", subtitle: "Jump. Leave one." },
    satranc: { title: "Satranç", subtitle: "Board, move, checkmate." },
    "amiral-batti": { title: "Amiral Battı", subtitle: "Fleet on a grid. Hit, miss, sunk." },
    hayat: { title: "Hayat", subtitle: "One life. The long shadow of what you chose." },
    apartman: { title: "Apartman: Apartman Yöneticisi", subtitle: "One building, dozens of people, issues that do not end." },
    "kayip-telefon": { title: "Kayıp Telefon", subtitle: "A phone is lost. The life inside it surfaces." },
    "son-100-gun": { title: "Son 100 Gün", subtitle: "The last hundred days. Every choice weighs more." },
    "son-kasaba": { title: "Son Kasaba", subtitle: "Everyone is leaving. You stay and try to keep the town alive." },
    "tc-sim-devlet": { title: "TC SIM: DEVLET", subtitle: "2002–05 core. Statecraft at one table." },
    ihtilal: { title: "İhtilâl", subtitle: "Elections are won. Power is not kept." },
  };

  const CREDITS_EN = {
    h1: "Credits",
    kicker: "TarikLab · creator and components",
    back: "← Games",
    sections: [
      {
        h: "TarikLab",
        items: ["Game design, interface and original content: Tarık Halil Ayaz."],
      },
      {
        h: "Original TarikLab games",
        items: [
          "Çete Savaşları — original TLab game; the interface and application stack use the third-party components listed below.",
          "Çete Savaşları: Hanedan — original TLab game, no external runtime dependency.",
          "Racon Manager — original TLab game, no external runtime dependency.",
          "TC SIM — original TLab game, no external runtime dependency.",
          "Son Mahalle Bükücü — original TLab game, no external runtime dependency.",
        ],
      },
      {
        h: "TLab Classics",
        lead:
          "Labirent, Tek Taş, Satranç and Amiral Battı were rewritten from scratch for TarikLab with independent game logic, interface and visuals. None carry an external runtime dependency.",
        items: [
          "Labirent — independent TarikLab implementation. No external dependency.",
          "Tek Taş — independent TarikLab implementation. No external dependency.",
          "Satranç — independent TarikLab rules engine and original piece set. No external dependency.",
          "Amiral Battı — independent TarikLab grid-fleet implementation. Public-domain concept; original TLab code and visuals. No external dependency.",
        ],
        note:
          "Classic game rules (maze, peg solitaire, chess, grid-fleet) are public-domain concepts; this notice covers only TarikLab's own code, interface and original content.",
      },
      {
        h: "Third-party components",
        lead:
          "Principal third-party components of the portal and Çete Savaşları application: React, TanStack Router, Zustand, Radix UI, Lucide and Zod. Rights in those components belong to their owners. The note on TLab Classics' independent game logic is separate from this application stack.",
      },
    ],
    legal:
      "© 2026 TarikLab. All rights reserved. No claim is made over public-domain classic game rules.",
  };

  const CETE_HELP_EN = [
    {
      title: "Aim",
      body: "Start on the street, build a crew, stack cash and reputation, hold your district. There is no single win beat; the till, reputation and staying alive move together.",
    },
    {
      title: "Core loop",
      body: "Take work from Jobs, kit weapons/armor/wheels from the Shop, press a corner or squeeze a district on the Street, grow a dealer corner in Property. Time runs on a real clock; speed it with ×N or skip with 'pass 1 hour'.",
    },
    {
      title: "Controls",
      body: "Tabs at the bottom (phone) or left (desktop) take you to Me, Jobs, Shop, Property, Street, Life and Clinic. The ledger icon shows recent events.",
    },
    {
      title: "Resources and meters",
      body: "Rounds & Stamina are energy, Racon & Charisma are toughness, Health is the body, Heat is police attention. When Heat rises, patrols and rival pressure rise. Till, investments, reputation and the bribe fund sit under Detail.",
    },
    {
      title: "Progress",
      body: "Work earns XP and rank; each rank has its own moniker. A season lasts 14 days and season score accumulates. Buy districts and grow corners for regular tribute.",
    },
    {
      title: "Risk and loss",
      body: "If Health drops under 20 or you get pinched you land in Clinic or holding; you cannot work for that stretch. A bribe fund can shorten holding. Cash you have not banked is at risk on the street while Heat is high.",
    },
    {
      title: "Saves",
      body: "The game autosaves on this device (localStorage). Sign in and progress also backs up to the cloud; guest play stays on this device only.",
    },
    {
      title: "First-run tips",
      body: "Do a few jobs first. Do not walk the street unarmed. If Heat is up, sit in the till for a while. Open a dealer corner early; regular income is the biggest swing. Learn to keep cash in the till.",
    },
    {
      title: "Note",
      body: "Fiction. Not an invitation to real gambling, drugs or violence. Gambling/bar beats on the Life tab are in-game fiction too.",
    },
  ];

  const HELP_EN = {
    apartman:
      "Pick an issue, prepare the file, put one proposal to a vote on Meeting Night, then close the week. Cheap patches return. Raising dues too often stops payment.",
    "son-100-gun":
      "One hundred days. Two actions a day. Eighteen scenarios. Timed windows expire. Always-work is not free. The final report is terminal.",
    hayat:
      "Start at 18. Name the life, then manage Me, Decisions, Path, Money, People, Home, Long Shadows and History. A major choice leaves a Long Shadow that can return years later.",
    "kayip-telefon":
      "This phone is not yours. Eight apps open through discovery. Corroboration and contradiction change the ending. Return at any time; going deeper raises privacy cost.",
    "tc-sim-devlet":
      "Front menu, then setup: period, mode, goal, doctrine. Take the State. Two decisions a month, then Advance Month. You read reported figures and confidence, not actuals. Intent is not implementation.",
    fallback: "Save slots are local to this device.",
  };

  const TCSIM_HELP_EN = [
    {
      title: "Aim",
      body: "You run one life through weekly choices. Career, money, relationships and health pull on each other; the point is a livable balance, not a perfect plan.",
    },
    {
      title: "Weekly loop",
      body: "Each week you have 2 decisions (1 if health is critical). Spend them on work/social/activity, then advance the week; wage, rent and regular costs land automatically at month end.",
    },
    {
      title: "Controls",
      body: "The top menu moves you through Home, Me, Calendar, Money, Work, Education, People, Family/Relations, Home, Body, History and the Year File. Some picks open an event window; the answer there applies immediately without advancing the week.",
    },
    {
      title: "Work and money",
      body: "Finding work, promotion and education hit Money directly. The Money screen shows balance, monthly in/out and net worth: cash, investments, property, vehicles/goods and debt. Living standard and subscriptions live there too.",
    },
    {
      title: "Progress and meters",
      body: "Body tracks energy/stress/health, Calendar holds appointments and delayed fallout, the Year File keeps each year's summary. People and Family/Relations carry trust, closeness and tension.",
    },
    {
      title: "Risk and fallout",
      body: "Neglected health cuts your decision count and work; neglected relationships cool. Some consequences return weeks later as events, not immediately.",
    },
    {
      title: "Saves",
      body: "The game autosaves in the browser store; Save in the header also writes by hand. New Game wipes the current life and asks for confirmation.",
    },
    {
      title: "First-run tips",
      body: "Find work first and settle a few weeks. Rest before health turns critical. Keep some cash. Do not cut family and close circle; later openings lean on those ties.",
    },
    {
      title: "Later life: retirement, inheritance, generation",
      body: "From the sixties, enough work history lets you weigh retirement. When a life ends a Life Report appears; an adult child can continue as the next generation, carrying wealth and family ties.",
    },
  ];

  function readLang() {
    try {
      const v = root.localStorage && root.localStorage.getItem(KEY);
      return v === "en" ? "en" : "tr";
    } catch {
      return "tr";
    }
  }

  let lang = typeof root.localStorage === "undefined" ? "tr" : readLang();

  function applyHtmlLang() {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang === "en" ? "en" : "tr";
  }

  function getLang() {
    return lang;
  }

  function setLang(next) {
    const n = next === "en" ? "en" : "tr";
    if (n === lang) {
      applyHtmlLang();
      return lang;
    }
    lang = n;
    try {
      root.localStorage.setItem(KEY, lang);
    } catch {
      /* ignore */
    }
    applyHtmlLang();
    [...listeners].forEach((fn) => {
      try {
        fn(lang);
      } catch {
        /* ignore */
      }
    });
    if (typeof document !== "undefined") {
      document.dispatchEvent(new CustomEvent("tlab-language", { detail: lang }));
    }
    return lang;
  }

  function onLang(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  if (typeof root.addEventListener === "function") {
    root.addEventListener("storage", (event) => {
      if (event.key !== KEY && event.key !== null) return;
      let next = "tr";
      try { next = root.localStorage.getItem(KEY); } catch { /* TR fallback */ }
      setLang(next);
    });
  }

  function t(key, fallback) {
    if (lang !== "en") return fallback ?? key;
    return EN[key] ?? fallback ?? key;
  }

  function phrase(text) {
    if (lang !== "en" || text == null) return text;
    const raw = String(text);
    if (Object.prototype.hasOwnProperty.call(PHRASE, raw)) return PHRASE[raw];
    return raw;
  }

  function catalogEntry(slug, title, subtitle) {
    if (lang !== "en") return { title, subtitle };
    const row = CATALOG_EN[slug];
    return {
      title: row?.title ?? title,
      subtitle: row?.subtitle ?? subtitle,
    };
  }

  function applyPhrases(rootEl) {
    if (typeof document === "undefined") return;
    const el = rootEl || document.body;
    if (!el) return;
    const walk = (node) => {
      if (node.nodeType === 3) {
        const v = node.nodeValue;
        if (!v) return;
        const trimmed = v.trim();
        if (!trimmed) return;
        if (lang === "en" && Object.prototype.hasOwnProperty.call(PHRASE, trimmed)) {
          node.nodeValue = v.replace(trimmed, PHRASE[trimmed]);
        }
        return;
      }
      if (node.nodeType !== 1) return;
      if (node.closest && node.closest("[data-i18n-skip]")) return;
      const attrs = ["aria-label", "title", "placeholder", "alt"];
      for (const a of attrs) {
        const cur = node.getAttribute && node.getAttribute(a);
        if (cur && lang === "en" && Object.prototype.hasOwnProperty.call(PHRASE, cur)) {
          node.setAttribute(a, PHRASE[cur]);
        }
      }
      const kids = node.childNodes;
      for (let i = 0; i < kids.length; i++) walk(kids[i]);
    };
    walk(el);
  }

  function mountLangToggle(host) {
    if (typeof document === "undefined" || !host) return null;
    let box = host.querySelector("[data-tlab-lang]");
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("data-tlab-lang", "1");
      box.className = "tlab-lang";
      host.appendChild(box);
    }
    const render = () => {
      box.innerHTML =
        `<div class="tlab-lang-switch" role="group" aria-label="${lang === "en" ? "Language" : "Dil"}">` +
        `<button type="button" class="${lang === "tr" ? "is-on" : ""}" data-lang="tr" aria-pressed="${lang === "tr"}">TR</button>` +
        `<button type="button" class="${lang === "en" ? "is-on" : ""}" data-lang="en" aria-pressed="${lang === "en"}">EN</button>` +
        `</div>`;
      box.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
      });
    };
    render();
    if (!box._tlabBound) {
      box._tlabBound = true;
      onLang(render);
    }
    return box;
  }

  const style = `
.tlab-lang{display:inline-flex;align-items:center;margin-left:auto}
.tlab-lang-switch{display:inline-flex;border:1px solid #2c2621;border-radius:999px;overflow:hidden}
.tlab-lang-switch button{background:transparent;color:#9a9086;border:0;padding:.25rem .55rem;font:600 11px/1.2 system-ui,sans-serif;letter-spacing:.08em;cursor:pointer}
.tlab-lang-switch button.is-on{background:#efe8de;color:#12100e}
.tlab-lang-switch button:focus-visible{outline:2px solid #c45c4a;outline-offset:2px}
`;

  if (typeof document !== "undefined") {
    const inject = () => {
      if (!document.getElementById("tlab-i18n-style")) {
        const tag = document.createElement("style");
        tag.id = "tlab-i18n-style";
        tag.textContent = style;
        document.head.appendChild(tag);
      }
      applyHtmlLang();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
    else inject();
  }

  const api = {
    KEY,
    EN,
    PHRASE,
    CATALOG_EN,
    CREDITS_EN,
    CETE_HELP_EN,
    HELP_EN,
    TCSIM_HELP_EN,
    getLang,
    setLang,
    onLang,
    t,
    phrase,
    catalogEntry,
    applyPhrases,
    applyHtmlLang,
    mountLangToggle,
    requiredEnKeys: Object.keys(EN),
  };

  root.tlabI18n = api;
  root.tlabPhrase = phrase;
  root.tlabT = t;
})(typeof globalThis !== "undefined" ? globalThis : window);
