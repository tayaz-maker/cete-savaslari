/** Apartman narrative chains. Uses TarikLabDepth. Does not change vote/election math. */

function resident(s, id) {
  return (s.residents || []).find((r) => r.id === id);
}

function flag(s, key) {
  s.flags = s.flags || {};
  s.flags.chainFlags = s.flags.chainFlags || {};
  return s.flags.chainFlags[key];
}

function setFlag(s, key, value) {
  s.flags = s.flags || {};
  s.flags.chainFlags = s.flags.chainFlags || {};
  s.flags.chainFlags[key] = value;
}

function chainState(s, id) {
  s.flags = s.flags || {};
  s.flags.chains = s.flags.chains || {};
  if (!s.flags.chains[id]) s.flags.chains[id] = { stage: 0, status: "idle" };
  return s.flags.chains[id];
}

function hasMemory(s, who, type) {
  const r = resident(s, who);
  return !!(r && (r.memories || []).some((m) => m.type === type));
}

function eligible(s, chain, node, D) {
  if (node.minWeek && s.week < node.minWeek) return false;
  if (node.maxWeek && s.week > node.maxWeek) return false;
  if (node.phase && s.progression?.phase !== node.phase) return false;
  if (node.minPhaseWeek && s.week < node.minPhaseWeek) return false;
  if (node.requireFlag && !flag(s, node.requireFlag)) return false;
  if (node.forbidFlag && flag(s, node.forbidFlag)) return false;
  if (node.requireMemory && !hasMemory(s, node.requireMemory.who, node.requireMemory.type)) return false;
  if (node.minConfidence != null && (s.politics?.confidence ?? 50) < node.minConfidence) return false;
  if (node.maxConfidence != null && (s.politics?.confidence ?? 50) > node.maxConfidence) return false;
  if (node.minInvestments != null && (s.progression?.investments || 0) < node.minInvestments) return false;
  if (!D.canShowEvent(s, node.id, s.week)) return false;
  return true;
}

function applyEffects(s, D, effects, cause) {
  if (!effects) return;
  if (Number.isFinite(effects.cash)) s.finance.cash += effects.cash;
  if (Number.isFinite(effects.condition)) s.building.condition = D.clamp(s.building.condition + effects.condition);
  if (effects.part) {
    const part = s.building.parts.find((p) => p.id === effects.part.id);
    if (part) part.condition = D.clamp(part.condition + (effects.part.delta || 0));
  }
  if (effects.trust) {
    for (const [id, delta] of Object.entries(effects.trust)) {
      const r = resident(s, id);
      if (r) r.trust = D.clamp(r.trust + delta);
    }
  }
  if (effects.satisfaction) {
    for (const [id, delta] of Object.entries(effects.satisfaction)) {
      const r = resident(s, id);
      if (r) r.satisfaction = D.clamp(r.satisfaction + delta);
    }
  }
  if (effects.pays) {
    for (const [id, value] of Object.entries(effects.pays)) {
      const r = resident(s, id);
      if (r) r.pays = !!value;
    }
  }
  if (effects.relations) {
    for (const [a, map] of Object.entries(effects.relations)) {
      const ra = resident(s, a);
      if (!ra) continue;
      ra.relations = ra.relations || {};
      for (const [b, delta] of Object.entries(map)) {
        const rb = resident(s, b);
        ra.relations[b] = (ra.relations[b] || 0) + delta;
        if (rb) {
          rb.relations = rb.relations || {};
          rb.relations[a] = (rb.relations[a] || 0) + delta;
        }
      }
    }
  }
  if (effects.remember) {
    for (const mem of effects.remember) {
      const r = resident(s, mem.who);
      if (!r) continue;
      D.remember(r, {
        id: `${mem.type}-${s.week}-${mem.who}`,
        type: mem.type,
        turn: s.week,
        sentiment: mem.sentiment || 0,
        weight: Math.abs(mem.sentiment || 1),
        tags: mem.tags || [cause || "chain"],
      });
    }
  }
  if (effects.flags) {
    for (const [k, v] of Object.entries(effects.flags)) setFlag(s, k, v);
  }
  if (effects.issue) {
    const iss = effects.issue;
    if (!s.issues.some((i) => i.id === iss.id)) {
      s.issues.push({
        id: iss.id,
        type: iss.type || "ortak",
        title: iss.title,
        status: "acik",
        severity: iss.severity || 2,
        parties: iss.parties || [],
        system: iss.system || null,
        chainId: cause,
      });
    }
  }
  if (effects.schedule) {
    const sch = effects.schedule;
    D.schedule(s, {
      id: sch.id || `chain-${cause}-${s.week}`,
      type: sch.type || "chain-echo",
      dueTurn: s.week + (sch.due || 3),
      chainId: sch.chainId || cause,
      next: sch.next,
      cause: sch.cause || cause,
      echo: sch.echo || null,
    });
  }
}

function locBody(node, s) {
  const phase = s.progression?.phase || "";
  if (node.lateBody && s.week >= 20) return node.lateBody;
  if (node.midBody && (phase === "yenileme baskısı" || s.week >= 8)) return node.midBody;
  return node.body;
}

export const CHAINS = [
  {
    id: "su-kolon",
    family: "bakım",
    exclusive: [],
    stages: [
      {
        id: "su-kolon-1", minWeek: 2, maxWeek: 10, cooldown: 10,
        title: "Kolon sızıntısı taraf tutuyor",
        body: "Murat tavanın aktığını söylüyor. Elif 'benim dairede ölçüm yok' diyor. Usta çağırmadan oda ikiye bölünür.",
        choices: [
          { id: "usta", label: "Fatura binaya, usta bugün", default: false, effects: { cash: -1400, part: { id: "su", delta: 8 }, trust: { r2: 8, r3: 4, r0: -3 }, remember: [{ who: "r2", type: "taraf-tuttu", sentiment: 2 }, { who: "r3", type: "fatura-duzgun", sentiment: 1 }], schedule: { id: "su-kolon-echo-usta", due: 3, next: 1, echo: "fatura" } } },
          { id: "hasan", label: "Hasan'ın tanıdık ustası, yarı fiyat", effects: { cash: -700, part: { id: "su", delta: 3 }, flags: { ucuzSu: 1 }, trust: { r0: 5, r3: -6, r2: 3 }, remember: [{ who: "r3", type: "faturasiz-usta", sentiment: -2 }, { who: "r0", type: "ustasini-soktu", sentiment: 1 }], schedule: { id: "su-kolon-echo-hasan", due: 3, next: 1, echo: "kacirma" } } },
          { id: "bekle", label: "Bir hafta izle", effects: { trust: { r2: -5, r3: 2 }, remember: [{ who: "r2", type: "erteledi", sentiment: -2 }], schedule: { id: "su-kolon-echo-bekle", due: 2, next: 1, echo: "buyudu" } } },
        ],
      },
      {
        id: "su-kolon-2", minWeek: 4, cooldown: 8, requireFlag: null,
        title: "Sızıntı geri döndü",
        body: "İki daire aşağı boya kabardı. Elif fotoğraf çekmiş, Murat çocuk odasını göstermeye geliyor.",
        choices: [
          { id: "kalici", label: "Kolonu aç, kalıcı tamir", effects: { cash: -2200, part: { id: "su", delta: 12 }, trust: { r2: 6, r3: 8, r4: -2 }, flags: { kolonKapali: 1 }, remember: [{ who: "r3", type: "kalici-su", sentiment: 2 }], schedule: { id: "su-kolon-echo-end", due: 4, next: "done", echo: "kurudu" } } },
          { id: "yama", label: "Boya bas, üstünü kapat", effects: { cash: -400, flags: { kolonYama: 1 }, trust: { r3: -7, r2: -3, r0: 3 }, remember: [{ who: "r3", type: "boya-yama", sentiment: -2 }], schedule: { id: "su-kolon-echo-yama", due: 3, next: 2, echo: "tekrar" } } },
          { id: "bekle", label: "Sigortaya yaz, bekle", effects: { trust: { r2: -4, r13: -2 }, schedule: { id: "su-kolon-echo-sigorta", due: 4, next: 2, echo: "sigorta" } } },
        ],
      },
      {
        id: "su-kolon-3", minWeek: 8, cooldown: 12,
        title: "Alt kat da ıslandı",
        body: "Ayşe'nin tavanı çatladı. Murat 'ben demiştim' diyor. Seçim yaklaşırken bu fotoğraf panoda durur.",
        choices: [
          { id: "hepsi", label: "Üç daireyi birden yap", effects: { cash: -3200, part: { id: "su", delta: 10 }, trust: { r5: 10, r2: 6, r4: -4 }, flags: { suMirasi: "kalici" }, remember: [{ who: "r5", type: "tavanini-yapti", sentiment: 2 }], schedule: { due: 5, next: 3, echo: "kuru" } } },
          { id: "ayse", label: "Yalnız Ayşe'yi kurtar", effects: { cash: -900, trust: { r5: 8, r2: -6 }, relations: { r5: { r2: -12 } }, flags: { suMirasi: "ayrim" }, remember: [{ who: "r2", type: "ayirim-yapti", sentiment: -2 }], schedule: { due: 3, next: 3, echo: "kini" } } },
          { id: "bekle", label: "Toplantıya bırak", effects: { issue: { id: "su-kolon-mahkeme", type: "su", title: "Kolon hasarı toplantı gündemi", severity: 4, parties: ["r2", "r3", "r5"], system: "su" }, flags: { suMirasi: "gundem" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "su-kolon-4", minWeek: 18, cooldown: 12,
        title: "Sigorta dosyası seçime denk geldi",
        body: "Eksper fotoğrafları sordu. Murat 'ben demiştim' dosyasını çıkardı. Elif tutanak istiyor. Bu kâğıt sandığa da gider.",
        lateBody: "Kolon unutulmadı. Seçim haftasında ıslak tavan fotoğrafı, güven oylamasının eki gibi duruyor.",
        choices: [
          { id: "eksper", label: "Eksperi çağır, dosyayı tamamla", effects: { cash: -900, trust: { r3: 8, r2: 6, r5: 4, r4: -3 }, flags: { suEksper: 1 }, remember: [{ who: "r3", type: "eksper-cagrildi", sentiment: 2 }], relations: { r2: { r3: 8 } }, schedule: { due: 3, next: "done", echo: "eksper" } } },
          { id: "gizle", label: "Fotoğrafı çekmeceye, eksper yok", effects: { trust: { r2: -8, r3: -8, r0: 3 }, flags: { suGizli: 1 }, remember: [{ who: "r2", type: "foto-gizlendi", sentiment: -2 }], schedule: { due: 3, next: "done", echo: "kini" } } },
          { id: "bekle", label: "Seçim bitsin, kâğıt sonra", effects: { trust: { r9: -3 }, flags: { suSecimSonra: 1 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "gurultu-4",
    family: "sosyal",
    exclusive: [],
    stages: [
      {
        id: "gurultu-4-1", minWeek: 1, maxWeek: 8, cooldown: 8,
        title: "Nuran yönetmeliği gösteriyor",
        body: "Okan gece on birde kırmış. Nuran kapıya yönetmelik yapıştırmış. İki daire aynı katta, merdiven arada.",
        choices: [
          { id: "uyari", label: "Yazılı uyarı, saat sınırı", effects: { trust: { r7: 6, r6: -5 }, flags: { gurultuUyari: 1 }, remember: [{ who: "r7", type: "yazili-uyari", sentiment: 1 }, { who: "r6", type: "saat-dayatti", sentiment: -1 }], schedule: { due: 2, next: 1, echo: "tekrar" } } },
          { id: "okan", label: "Okan'ı geçiştir, 'az kaldı'", effects: { trust: { r6: 7, r7: -8 }, relations: { r6: { r7: -18 } }, remember: [{ who: "r7", type: "yan-tuttu", sentiment: -2 }], schedule: { due: 2, next: 1, echo: "imza" } } },
          { id: "bekle", label: "İkisi de sakinleşsin", effects: { trust: { r7: -3, r6: -2 }, schedule: { due: 2, next: 1, echo: "kavga" } } },
        ],
      },
      {
        id: "gurultu-4-2", minWeek: 3, cooldown: 8,
        title: "Kat dayanışması",
        body: "Sevim not bıraktı: '4. katın sesi 1. kata iniyor.' Nuran imza kâğıdı hazırlamış. Okan usta çağırmış, bu kez gündüz.",
        choices: [
          { id: "arabul", label: "Saat koy, tadilata izin ver", effects: { trust: { r7: 4, r6: 4, r1: 3 }, relations: { r6: { r7: 10 } }, flags: { gurultuSulh: 1 }, remember: [{ who: "r6", type: "saat-kabul", sentiment: 1 }], schedule: { due: 4, next: 2, echo: "tutuldu" } } },
          { id: "yasak", label: "Hafta sonu yasak, tam", effects: { trust: { r7: 8, r1: 4, r6: -10 }, flags: { gurultuYasak: 1 }, remember: [{ who: "r6", type: "tadilat-yasak", sentiment: -2 }], schedule: { due: 3, next: 2, echo: "gece" } } },
          { id: "bekle", label: "İmzayı yok say", effects: { trust: { r7: -6, r9: -3 }, flags: { gurultuImza: 1 }, schedule: { due: 3, next: 2, echo: "secim" } } },
        ],
      },
      {
        id: "gurultu-4-3", minWeek: 8, cooldown: 12,
        title: "Nuran oyu hatırlıyor",
        body: "Güven oylamasına iki hafta. Nuran 'gece matkabını unutmadım' diyor. Okan aidatı yine geciktirmiş.",
        choices: [
          { id: "nuran", label: "Nuran'ın yanında dur", effects: { trust: { r7: 10, r3: 4, r6: -8 }, remember: [{ who: "r7", type: "secimde-yaninda", sentiment: 2 }], flags: { gurultuMirasi: "nuran" }, schedule: { due: 2, next: 3 } } },
          { id: "okan", label: "Okan'a taksit imkânı aç", effects: { trust: { r6: 8, r2: 3, r7: -7 }, pays: { r6: true }, remember: [{ who: "r6", type: "taksit-verdi", sentiment: 2 }], flags: { gurultuMirasi: "okan" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "İkisini de kırma", effects: { trust: { r7: -2, r6: -2 }, flags: { gurultuMirasi: "notr" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "gurultu-4-4", minWeek: 16, cooldown: 12, maxConfidence: 62,
        title: "Nuran sandık öncesi not bırakıyor",
        body: "Kapı altından kâğıt: 'Gece matkabını unutan yönetici, gündüz oyunu da unutur.' Okan aynı katta, susuyor.",
        choices: [
          { id: "ozur", label: "Nuran'a yazılı özür, saat kuralı taze", effects: { trust: { r7: 10, r1: 4, r6: -4 }, flags: { gurultuOzur: 1 }, remember: [{ who: "r7", type: "ozur-yazildi", sentiment: 2 }], schedule: { due: 2, next: "done", echo: "secim" } } },
          { id: "yirt", label: "Notu yırt, 'seçim şantajı'", effects: { trust: { r7: -12, r3: -4, r6: 4 }, remember: [{ who: "r7", type: "not-yirtildi", sentiment: -2 }], relations: { r6: { r7: -10 } }, schedule: { due: 2, next: "done" } } },
          { id: "bekle", label: "Not dursun, cevap yok", effects: { trust: { r7: -4 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "aidat-leyla",
    family: "para",
    exclusive: ["aidat-liste"],
    stages: [
      {
        id: "aidat-leyla-1", minWeek: 3, maxWeek: 12, cooldown: 10,
        title: "Leyla kapıda hesap kesiyor",
        body: "Üç çocuk, kırmızı liste. Fatma 'isim asılsın' diyor. Leyla 'gururumu asma' diyor.",
        choices: [
          { id: "taksit", label: "Sessiz taksit, liste yok", effects: { cash: -0, trust: { r11: 10, r9: -6, r4: -3 }, pays: { r11: true }, flags: { leylaTaksit: 1 }, remember: [{ who: "r11", type: "liste-asilmadi", sentiment: 2 }, { who: "r9", type: "isim-gizlendi", sentiment: -1 }], schedule: { due: 4, next: 1, echo: "oder" } } },
          { id: "liste", label: "Listeyi as, kural kuraldır", effects: { trust: { r9: 8, r0: 4, r11: -12 }, flags: { leylaListe: 1 }, remember: [{ who: "r11", type: "ismi-asildi", sentiment: -2 }], schedule: { due: 3, next: 1, echo: "kini" } } },
          { id: "bekle", label: "Bir ay daha bak", effects: { trust: { r9: -3, r11: -2 }, schedule: { due: 3, next: 1, echo: "birikti" } } },
        ],
      },
      {
        id: "aidat-leyla-2", minWeek: 6, cooldown: 8,
        title: "Leyla'nın komşusu Selin araya girdi",
        body: "Selin 'çocuklar merdivende utanıyor' diyor. Fatma defteri kapatmıyor.",
        choices: [
          { id: "sil", label: "İsmi sil, borç kalsın", effects: { trust: { r11: 8, r12: 6, r9: -8 }, flags: { leylaSilindi: 1 }, remember: [{ who: "r12", type: "cocuk-yaninda", sentiment: 1 }], schedule: { due: 4, next: 2 } } },
          { id: "icra", label: "Avukat konuşsun", effects: { cash: -600, trust: { r9: 6, r4: 4, r11: -14 }, flags: { leylaIcra: 1 }, remember: [{ who: "r11", type: "icra-konustu", sentiment: -2 }], schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Fatma ile çay iç, karar yok", effects: { trust: { r9: 2, r11: 1 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "aidat-leyla-3", minWeek: 12, cooldown: 12, minConfidence: 0,
        title: "Seçimde Leyla'nın oyu",
        body: "Leyla 'beni asan yöneticiye oy yok' demiş. Fatma aynı cümleyi tersinden kuruyor.",
        choices: [
          { id: "leyla", label: "Borcu yapılandır, oy sonra", effects: { trust: { r11: 12, r12: 4, r9: -8 }, pays: { r11: true }, flags: { leylaMirasi: "yapilandi" }, remember: [{ who: "r11", type: "secimde-sirtini", sentiment: 2 }], schedule: { due: 2, next: 3 } } },
          { id: "fatma", label: "Defter açık kalsın", effects: { trust: { r9: 10, r0: 4, r11: -8 }, flags: { leylaMirasi: "defter" }, remember: [{ who: "r9", type: "defter-tuttu", sentiment: 2 }], schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "İkisini de kırma", effects: { flags: { leylaMirasi: "notr" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "aidat-leyla-4", minWeek: 18, cooldown: 12,
        title: "Leyla'nın kızı merdivende sordu",
        body: "Çocuk: 'Annemin adı hâlâ asılı mı?' Selin arkasında. Fatma aşağıda çayda. Cevap çocuk diline sığmaz.",
        choices: [
          { id: "cocuk", label: "Çocuğa yalan yok, isim inmiş", effects: { trust: { r11: 8, r12: 8, r9: -6 }, pays: { r11: true }, flags: { leylaCocuk: 1 }, remember: [{ who: "r11", type: "kizina-dokundu", sentiment: 2 }, { who: "r12", type: "cocuk-yaninda", sentiment: 1 }], schedule: { due: 3, next: "done" } } },
          { id: "kac", label: "Merdiveni değiştir, soruyu geç", effects: { trust: { r11: -8, r12: -6, r9: 3 }, remember: [{ who: "r11", type: "kizini-gecti", sentiment: -2 }], schedule: { due: 2, next: "done" } } },
          { id: "bekle", label: "Selin cevaplasın", effects: { trust: { r12: 2, r11: -2 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "aidat-liste",
    family: "para",
    exclusive: ["aidat-leyla"],
    stages: [
      {
        id: "aidat-liste-1", minWeek: 4, maxWeek: 9, cooldown: 99,
        title: "Fatma defteri masaya koydu",
        body: "Üç isim kırmızı. Fatma 'ya asılır ya ben çekilirim' diyor. Bu yol Leyla ile çay yolunu kapatır.",
        choices: [
          { id: "as", label: "Listeyi as", effects: { trust: { r9: 10, r4: 5, r11: -10, r6: -6, r2: -4 }, flags: { acikListe: 1 }, remember: [{ who: "r9", type: "liste-asti", sentiment: 2 }], schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Defteri çekmecede tut", effects: { trust: { r9: -6 }, flags: { acikListe: 0 }, schedule: { due: 2, next: "dead" } } },
        ],
      },
      {
        id: "aidat-liste-2", minWeek: 7, cooldown: 8, requireFlag: "acikListe",
        title: "Merdiven utancı",
        body: "Çocuklar isimleri okudu. Selin kapıya kâğıt yapıştırdı: 'Bu bina değil, teşhir.'",
        choices: [
          { id: "indir", label: "Listeyi indir, özür yaz", effects: { trust: { r12: 8, r11: 6, r9: -8 }, flags: { acikListe: 0 }, remember: [{ who: "r12", type: "teshir-indirdi", sentiment: 1 }], schedule: { due: 3, next: 2 } } },
          { id: "tut", label: "Liste kalsın", effects: { trust: { r9: 6, r12: -8, r11: -6 }, flags: { listeMirasi: "teshir" }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Yazıyı yırtma, listeyi de indirme", effects: { schedule: { due: 2, next: 2 } } },
        ],
      },
      {
        id: "aidat-liste-3", minWeek: 14, cooldown: 12,
        title: "Teşhirin seçim faturası",
        body: "Liste durduysa isimler ezberlendi. Fatma 'ben uyardım' diyor. Selin imza değil, oy konuşuyor.",
        choices: [
          { id: "indir-gec", label: "Geç de olsa indir, özür as", effects: { trust: { r12: 8, r11: 6, r9: -8 }, flags: { listeMirasi: "gec-ozur" }, remember: [{ who: "r12", type: "gec-indirildi", sentiment: 1 }], schedule: { due: 2, next: "done" } } },
          { id: "savun", label: "Teşhiri kural diye savun", effects: { trust: { r9: 8, r0: 4, r12: -10, r11: -8 }, flags: { listeMirasi: "kural" }, remember: [{ who: "r9", type: "teshiri-savundu", sentiment: 1 }], schedule: { due: 2, next: "done" } } },
          { id: "bekle", label: "Pano konuşsun", effects: { schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "otopark-kemal",
    family: "sosyal",
    exclusive: [],
    stages: [
      {
        id: "otopark-1", minWeek: 2, maxWeek: 11, cooldown: 9,
        title: "Kemal'in misafiri, Barış'ın motoru",
        body: "Kemal damadını indirmiş. Barış kaskıyla bekliyor. Yer tek, iki ego.",
        choices: [
          { id: "baris", label: "Motorun yeri çizili kalsın", effects: { trust: { r8: 8, r5: 3, r4: -8 }, relations: { r4: { r8: -16 } }, remember: [{ who: "r8", type: "motor-yeri", sentiment: 2 }], flags: { parkBaris: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "kemal", label: "Misafir hakkı, motor kayar", effects: { trust: { r4: 8, r13: 3, r8: -8 }, remember: [{ who: "r4", type: "misafir-hakki", sentiment: 2 }], flags: { parkKemal: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Çizgi çekme, bu gece idare", effects: { trust: { r4: -2, r8: -2 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "otopark-2", minWeek: 5, cooldown: 8,
        title: "Çizik ihbarı",
        body: "Kemal'in kapısında çizik. Barış 'ben değildim' diyor. Kamera yok.",
        choices: [
          { id: "kamera", label: "Kamera teklifini öne al", effects: { cash: -900, trust: { r4: 4, r9: 3, r12: -5 }, flags: { kameraSozu: 1 }, issue: { id: "kamera-park", type: "güvenlik", title: "Otopark kamerası sözü", severity: 2, parties: ["r4", "r8", "r12"], system: "guvenlik" }, schedule: { due: 4, next: 2 } } },
          { id: "baris-suclama", label: "Barış'ı çağır, sor", effects: { trust: { r8: -10, r4: 5 }, relations: { r4: { r8: -20 } }, remember: [{ who: "r8", type: "cizikle-suclandi", sentiment: -2 }], schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Boya tutar, mesele kapanır", effects: { cash: -250, trust: { r4: -3 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "otopark-3", minWeek: 10, cooldown: 10,
        title: "Park yeri oy tabanı",
        body: "Kemal 'benim damadım da bu binada büyüdü' diyor. Barış 'ben kira ödüyorum, o misafir' diyor.",
        choices: [
          { id: "cizelge", label: "Yazılı nöbet çizelgesi", effects: { trust: { r8: 5, r4: 5, r5: 3 }, flags: { parkMirasi: "cizelge" }, schedule: { due: 2, next: 3 } } },
          { id: "sahip", label: "Kat maliki öncelikli", effects: { trust: { r4: 10, r0: 4, r8: -10, r5: -4 }, flags: { parkMirasi: "malik" }, remember: [{ who: "r8", type: "kiraci-ikinci", sentiment: -2 }], schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Çizelge yok, kavga sürer", effects: { flags: { parkMirasi: "acik" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "otopark-4", minWeek: 16, cooldown: 12,
        title: "Damat düğüne geldi, motor yerinde",
        body: "Kemal 'bir gece' diyor. Barış vardiyadan iniyor. Aynı metre, iki hayat.",
        choices: [
          { id: "gece", label: "Bir gece damada, motor kayar yazılı", effects: { trust: { r4: 6, r13: 3, r8: -6 }, flags: { parkGece: 1 }, relations: { r4: { r8: -8 } }, schedule: { due: 3, next: "done" } } },
          { id: "motor", label: "Çizili yer çizili yerdir", effects: { trust: { r8: 8, r5: 3, r4: -8 }, remember: [{ who: "r8", type: "cizgi-tuttu", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "İkisi de idare etsin", effects: { trust: { r4: -3, r8: -3 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "kedi-sevim",
    family: "sosyal",
    exclusive: [],
    stages: [
      {
        id: "kedi-1", minWeek: 2, maxWeek: 9, cooldown: 8,
        title: "Mama kabı, merdiven, Elif",
        body: "Sevim üç kedi. Elif 'sağlık raporu yok' diyor. Mama kabı 1. kat sahanlığında.",
        choices: [
          { id: "kalsin", label: "Kapı önü Sevim'in, dokunma", effects: { trust: { r1: 10, r3: -6 }, remember: [{ who: "r1", type: "kediyi-korudu", sentiment: 2 }], flags: { kediHak: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bahce", label: "Mama bahçeye, merdiven boş", effects: { trust: { r3: 6, r1: -4, r7: 3 }, flags: { kediBahce: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "İkisini de dinle, kâğıt yok", effects: { schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "kedi-2", minWeek: 5, cooldown: 8,
        title: "Kısırlaştırma aidatı",
        body: "Belediye randevusu var, fatura 1.800. Sevim 'ben üç kediye bakıyorum, bina da baksın' diyor.",
        choices: [
          { id: "kasa", label: "Kasadan öde, kedi kalsın", effects: { cash: -1800, trust: { r1: 12, r5: 4, r4: -5, r3: -2 }, flags: { kediOdeme: 1 }, remember: [{ who: "r1", type: "kisir-odendi", sentiment: 2 }], schedule: { due: 4, next: 2 } } },
          { id: "sevim", label: "Fatura Sevim'de", effects: { trust: { r1: -8, r3: 4, r4: 3 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Randevuyu kaçır", effects: { trust: { r1: -4, r3: -2 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "kedi-3", minWeek: 12, cooldown: 10,
        title: "Sevim'in oyu sessizdir",
        body: "Sevim toplantıya gelmez. Kapı aralığından oyunu söyler. Kediyi unutanı unutmaz.",
        choices: [
          { id: "ziyaret", label: "Kapıya çay, kediye mama", effects: { cash: -80, trust: { r1: 8 }, flags: { kediMirasi: "cay" }, remember: [{ who: "r1", type: "kapi-cayı", sentiment: 2 }], schedule: { due: 2, next: 3 } } },
          { id: "yok-say", label: "Gelmeyene oy yokmuş gibi davran", effects: { trust: { r1: -10 }, flags: { kediMirasi: "yok" }, remember: [{ who: "r1", type: "oyu-yok-sayildi", sentiment: -2 }], schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Not bırak, zorla", effects: { trust: { r1: 2 }, flags: { kediMirasi: "not" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "kedi-4", minWeek: 18, cooldown: 12,
        title: "Belediye uyarısı, kedi sayısı",
        body: "Zabıta kâğıdı kapıda. Elif 'üçten fazla ortak alanda yasak' diyor. Sevim kapı aralığında, kedi kucağında.",
        choices: [
          { id: "savun", label: "Tutanağa itiraz, kediler dairede", effects: { cash: -200, trust: { r1: 12, r5: 3, r3: -6 }, flags: { kediItiraz: 1 }, remember: [{ who: "r1", type: "zabita-tutuldu", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "uy", label: "Kuralı oku, mama merdivenden insin", effects: { trust: { r3: 8, r7: 4, r1: -10 }, remember: [{ who: "r1", type: "zabita-uyuldu", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Kâğıdı görünce konuşuruz", effects: { trust: { r1: -4 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "dukkan-baca",
    family: "bakım",
    exclusive: [],
    stages: [
      {
        id: "baca-1", minWeek: 3, maxWeek: 12, cooldown: 9,
        title: "Cemal'in ocağı, Sevim'in çamaşırı",
        body: "Yağ kokusu 1. kata çıkıyor. Cemal 'öğlen müşteri, baca tıkalı değil, rüzgâr ters' diyor.",
        choices: [
          { id: "baca", label: "Baca temizliği binadan", effects: { cash: -1100, trust: { r1: 6, r10: 6, r13: -2 }, part: { id: "guvenlik", delta: 2 }, remember: [{ who: "r10", type: "bacayi-yapti", sentiment: 1 }], schedule: { due: 3, next: 1 } } },
          { id: "saat", label: "Öğlen ocağı yasak", effects: { trust: { r10: -12, r1: 8 }, remember: [{ who: "r10", type: "ocak-yasak", sentiment: -2 }], flags: { ocakYasak: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Rüzgâr döner", effects: { trust: { r1: -4 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "baca-2", minWeek: 7, cooldown: 8,
        title: "Mangal şikâyeti üstüne yağ",
        body: "Cemal bir gece balkonda da pişirmiş. Sevim çamaşır ipini indirmiş.",
        choices: [
          { id: "yazili", label: "Ortak alan ateş yasağı", effects: { trust: { r1: 5, r7: 4, r10: -6 }, flags: { atesYasak: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "ceza", label: "Cemal'e tek seferlik kesinti", effects: { cash: 400, trust: { r10: -8, r4: 3 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "İkaz, kâğıt yok", effects: { trust: { r10: 2, r1: -3 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "baca-3", minWeek: 14, cooldown: 10,
        title: "Dükkânın kira sözü",
        body: "Cemal 'beni sıkarsanız kepenk iner, aidat da iner' diyor. Hakan nalburdan destek bakıyor.",
        choices: [
          { id: "tut", label: "Dükkân kalsın, baca sözleşmesi", effects: { trust: { r10: 8, r15: 4, r1: 2 }, flags: { dukkanMirasi: "sozlesme" }, schedule: { due: 2, next: 3 } } },
          { id: "cik", label: "Kepenk inecekse insin", effects: { trust: { r10: -14, r1: 6, r15: -6 }, flags: { dukkanMirasi: "kepenk" }, remember: [{ who: "r10", type: "kepenk-tehdidi", sentiment: -2 }], schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Sözleşme sonra", effects: { flags: { dukkanMirasi: "askida" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "baca-4", minWeek: 18, cooldown: 12,
        title: "Kepenk gölgesi, aidat deliği",
        body: "Cemal bir hafta kapalı durdu. Nalbura gidenler 1. katı boş gördü. Sevim çamaşırı temiz, kasa eksik.",
        choices: [
          { id: "kira", label: "Dükkân kirasını yumuşat, baca kuralı kalsın", effects: { cash: -600, trust: { r10: 10, r1: 3, r4: -4 }, flags: { dukkanKira: 1 }, remember: [{ who: "r10", type: "kira-yumusadi", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "bos", label: "Boş dükkân ilanı as", effects: { trust: { r10: -12, r4: 4, r1: 2 }, flags: { dukkanBos: 1 }, remember: [{ who: "r10", type: "ilan-asildi", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Kepenk kendiliğinden açılır", effects: { schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "donusum-hasan",
    family: "macro",
    exclusive: ["muteahhit-kemal"],
    stages: [
      {
        id: "donusum-1", minWeek: 8, cooldown: 12, phase: "yenileme baskısı",
        title: "Hasan müteahhiti kapıda durdurdu",
        body: "Kartvizit 3. kat ziline kadar çıkmış. Hasan 'bu binada dışarıdan söz yok' diyor. Kemal kartviziti cebine koymuş.",
        choices: [
          { id: "kov", label: "Müteahhiti geri gönder", effects: { trust: { r0: 10, r1: 4, r4: -6, r3: -3 }, flags: { muteahhitKovuldu: 1 }, remember: [{ who: "r0", type: "disariyi-kesti", sentiment: 2 }], schedule: { due: 4, next: 1 } } },
          { id: "dinle", label: "Teklifi toplantıya al", effects: { trust: { r4: 8, r3: 5, r0: -10 }, flags: { muteahhitGundem: 1 }, remember: [{ who: "r0", type: "soz-girdi", sentiment: -2 }], schedule: { due: 4, next: 1 } } },
          { id: "bekle", label: "Kartviziti çekmeceye", effects: { trust: { r0: -3, r4: 2 }, schedule: { due: 3, next: 1 } } },
        ],
      },
      {
        id: "donusum-2", minWeek: 12, cooldown: 10,
        title: "İmza kâğıdı iki yönde",
        body: "Hasan 'kalalım' imzası. Kemal 'konuşalım' imzası. Aynı merdiven, iki kâğıt.",
        choices: [
          { id: "hasan", label: "Kalalım kâğıdını panoya as", effects: { trust: { r0: 12, r1: 6, r13: 4, r4: -10, r3: -6 }, flags: { donusumKamp: "kal" }, remember: [{ who: "r0", type: "kalalim-asti", sentiment: 2 }], schedule: { due: 4, next: 2 } } },
          { id: "kemal", label: "Konuşalım kâğıdını as", effects: { trust: { r4: 12, r3: 6, r0: -12 }, flags: { donusumKamp: "konus" }, remember: [{ who: "r4", type: "konusalim-asti", sentiment: 2 }], schedule: { due: 4, next: 2 } } },
          { id: "bekle", label: "İki kâğıdı da indirme", effects: { trust: { r0: -4, r4: -4 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "donusum-3", minWeek: 20, cooldown: 12,
        title: "Bina kimliği",
        lateBody: "Yirmi hafta. Ya çatıdan yenileme, ya kapıdan müteahhit. Hasan hâlâ merdivende.",
        body: "Dönüşüm tartışması resmileşti. Hasan 'ben burada öleceğim' diyor. Kemal 'oğlum daireyi satamaz' diyor.",
        choices: [
          { id: "yenile", label: "Kendi kasamızla kademeli yenile", effects: { cash: -4000, trust: { r0: 8, r3: 6, r4: 2 }, flags: { binaKimligi: "yenile" }, schedule: { due: 3, next: 3, type: "chain-echo" } } },
          { id: "diren", label: "Dışarı yok, çatı idare", effects: { trust: { r0: 14, r1: 6, r4: -10, r3: -8 }, flags: { binaKimligi: "diren" }, remember: [{ who: "r0", type: "kimlik-tuttu", sentiment: 2 }], schedule: { due: 3, next: 3 } } },
          { id: "bekle", label: "Kararı seçime bırak", effects: { flags: { binaKimligi: "secim" }, issue: { id: "donusum-gundem", type: "tadilat", title: "Dönüşüm / yenileme oylaması", severity: 4, parties: ["r0", "r4"] }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "donusum-4", minWeek: 24, cooldown: 14, minPhaseWeek: 16,
        title: "Hasan merdiveni terk etmiyor",
        body: "Kimlik kararı yazıldıysa bile Hasan hâlâ 3. kat sahanlığında. 'Ben bu binada öleceğim' cümlesi artık tutanak gibi.",
        lateBody: "Müteahhit kartviziti unutulmadı. Hasan unutturmuyor.",
        choices: [
          { id: "soz", label: "Yazılı: dışarı yok, çatıdan yenileme", effects: { cash: -800, trust: { r0: 12, r1: 6, r13: 4, r4: -8 }, flags: { hasanSozu: 1 }, remember: [{ who: "r0", type: "yazili-soz", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "yor", label: "Cümleyi duyma, kâğıt konuşsun", effects: { trust: { r0: -12, r4: 6, r3: 3 }, remember: [{ who: "r0", type: "cumle-duyulmadi", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Hasan otursun, sen geç", effects: { trust: { r0: -4 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "muteahhit-kemal",
    family: "macro",
    exclusive: ["donusum-hasan"],
    stages: [
      {
        id: "muteahhit-1", minWeek: 9, cooldown: 99, phase: "yenileme baskısı",
        title: "Kemal teklifi masaya bıraktı",
        body: "Kat karşılığı. Hasan bu yolda yok. Bu kâğıt diğer kâğıdı yırtar.",
        choices: [
          { id: "al", label: "Teklifi gündeme al", effects: { trust: { r4: 12, r3: 6, r0: -14, r1: -8 }, flags: { muteahhitYolu: 1 }, remember: [{ who: "r4", type: "teklif-aldi", sentiment: 2 }, { who: "r0", type: "disari-girdi", sentiment: -2 }], schedule: { due: 4, next: 1 } } },
          { id: "bekle", label: "Hasan'ı kırma, kâğıdı geri ver", effects: { trust: { r0: 6, r4: -6 }, schedule: { due: 2, next: "dead" } } },
        ],
      },
      {
        id: "muteahhit-2", minWeek: 14, cooldown: 10, requireFlag: "muteahhitYolu",
        title: "Selin taşınmayı konuşuyor",
        body: "Kiracılar 'bizi kim çıkaracak' diye soruyor. Kemal 'değer artar' diyor. Ayşe 'kızımın okulu' diyor.",
        choices: [
          { id: "garanti", label: "Kiracıya yazılı kalma sözü", effects: { trust: { r5: 10, r8: 8, r12: 6, r4: -4 }, flags: { kiraciSozu: 1 }, remember: [{ who: "r5", type: "kalma-sozu", sentiment: 2 }], schedule: { due: 4, next: 2 } } },
          { id: "piyasa", label: "Piyasa konuşsun, söz yok", effects: { trust: { r4: 8, r5: -8, r8: -6 }, remember: [{ who: "r5", type: "soz-yok", sentiment: -2 }], schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Toplantı sonra", effects: { schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "muteahhit-3", minWeek: 20, cooldown: 12,
        title: "Karşılık kağıdı",
        body: "Müteahhit ikinci kez geldi. Hasan merdiveni kapatmış gibi duruyor. Kemal oğlunu toplantıya getirdi.",
        choices: [
          { id: "imza", label: "Ön protokol, avukat bakacak", effects: { cash: -800, trust: { r4: 12, r3: 6, r0: -16 }, flags: { binaKimligi: "karsilik" }, remember: [{ who: "r4", type: "protokol", sentiment: 2 }], schedule: { due: 2, next: 3 } } },
          { id: "iptal", label: "Kâğıdı yırt, Hasan'a dön", effects: { trust: { r0: 12, r4: -12 }, flags: { binaKimligi: "iptal" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Protokolü beklet", effects: { flags: { binaKimligi: "askida" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "muteahhit-4", minWeek: 24, cooldown: 14, minPhaseWeek: 16,
        title: "Kiracı kalma sözünün faturası",
        body: "Ayşe 'yazılı söz vardı' diyor. Kemal 'değer konuşuluyor' diyor. Söz tutulmazsa merdiven ikiye bölünür.",
        choices: [
          { id: "yazili", label: "Kalma sözünü noter gibi yaz", effects: { cash: -500, trust: { r5: 12, r8: 8, r12: 6, r4: -6 }, flags: { kiraciNoter: 1 }, remember: [{ who: "r5", type: "soz-yazildi", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "piyasa2", label: "Söz havada, piyasa işler", effects: { trust: { r4: 8, r5: -12, r8: -8 }, remember: [{ who: "r5", type: "soz-havada", sentiment: -2 }], relations: { r4: { r5: -16 } }, schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Avukat bakacakmış gibi dur", effects: { schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "guven-fatma",
    family: "politik",
    exclusive: [],
    stages: [
      {
        id: "guven-1", minWeek: 6, maxWeek: 11, cooldown: 8, maxConfidence: 55,
        title: "Fatma fısıldıyor",
        body: "Güven 55'in altında. Fatma çayda 'başka isim de var' dedi. Kemal duymadı, Hasan duymadı, sen duydun.",
        choices: [
          { id: "cay", label: "Fatma'nın çayına otur", effects: { trust: { r9: 8, r0: 2 }, flags: { fatmaCay: 1 }, remember: [{ who: "r9", type: "cayina-ottu", sentiment: 1 }], schedule: { due: 3, next: 1 } } },
          { id: "acikla", label: "Toplantıda fısıltıyı aç", effects: { trust: { r9: -8, r4: 4, r3: 3 }, remember: [{ who: "r9", type: "fisilti-acildi", sentiment: -2 }], schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Duymadın", effects: { trust: { r9: -2 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "guven-2", minWeek: 9, cooldown: 8,
        title: "Gizli ittifak teklifi",
        body: "Fatma: 'Benim blok eski. Sen aidatı yumuşat, ben oyları tutarım.' Karşılığında liste meselesi kapanır.",
        choices: [
          { id: "anlas", label: "Sessiz anlaşma", effects: { trust: { r9: 10, r0: 4, r11: 4, r3: -4 }, flags: { fatmaIttifak: 1 }, remember: [{ who: "r9", type: "gizli-anlasma", sentiment: 2 }], schedule: { due: 4, next: 2 } } },
          { id: "red", label: "Pazarlık yok, sandık açık", effects: { trust: { r9: -6, r3: 6, r7: 4 }, flags: { fatmaRed: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Çayı bitir, söz yok", effects: { schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "guven-3", minWeek: 11, cooldown: 10,
        title: "Son dakika oy",
        body: "Seçime günler. Fatma 'söz tutuldu mu' diye bakıyor. Tutulmadıysa blok kayar.",
        choices: [
          { id: "tut", label: "Sözü tut, listeyi yumuşat", effects: { trust: { r9: 12, r11: 6, r4: -3 }, flags: { fatmaMirasi: "soz" }, remember: [{ who: "r9", type: "soz-tutuldu", sentiment: 2 }], schedule: { due: 2, next: 3 } } },
          { id: "boz", label: "Söz yoktu, sandık konuşur", effects: { trust: { r9: -12, r3: 5 }, flags: { fatmaMirasi: "boz" }, remember: [{ who: "r9", type: "soz-bozuldu", sentiment: -2 }], schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Yarın konuşuruz", effects: { trust: { r9: -4 }, flags: { fatmaMirasi: "gec" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "guven-4", minWeek: 14, cooldown: 10, maxConfidence: 50,
        title: "Fatma isim fısıldıyor",
        body: "Güven düşük. Fatma 'başka yönetici de çay içer' diyor. Hasan duymadı. Sen duydun, yine.",
        choices: [
          { id: "cay2", label: "Çaya otur, ismi sor", effects: { trust: { r9: 8, r0: -2 }, flags: { fatmaIsim: 1 }, remember: [{ who: "r9", type: "isim-soruldu", sentiment: 1 }], schedule: { due: 2, next: "done" } } },
          { id: "ifsa", label: "Fısıltıyı toplantıda aç", effects: { trust: { r9: -12, r3: 6, r7: 4 }, remember: [{ who: "r9", type: "isim-ifsa", sentiment: -2 }], schedule: { due: 2, next: "done" } } },
          { id: "bekle", label: "Çayı bitir, isim yok", effects: { trust: { r9: -3 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "cati-riza",
    family: "bakım",
    exclusive: ["dis-cephe"],
    stages: [
      {
        id: "cati-1", minWeek: 2, maxWeek: 10, cooldown: 8,
        title: "Rıza yağmuru önce görür",
        body: "7. kat. Dere tıkalı. Rıza 'ben söylerim, siz sonra ıslanırsınız' diyor.",
        choices: [
          { id: "cati", label: "Dereyi bugün aç", effects: { cash: -900, part: { id: "cati", delta: 10 }, trust: { r13: 10, r4: 3 }, remember: [{ who: "r13", type: "cati-dinlendi", sentiment: 2 }], flags: { catiAcildi: 1 }, schedule: { due: 4, next: 1 } } },
          { id: "ucuz", label: "Kapıcıyla kova", effects: { cash: -150, part: { id: "cati", delta: 2 }, trust: { r13: -6 }, flags: { catiKova: 1 }, remember: [{ who: "r13", type: "kova-gonderildi", sentiment: -1 }], schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Yağmur geçer", effects: { trust: { r13: -5 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "cati-2", minWeek: 6, cooldown: 8,
        title: "Yangın merdiveni kilitli",
        body: "Rıza kiliti gösteriyor. 'Hırsız diye kilitlediler, yangında kim açacak?'",
        choices: [
          { id: "ac", label: "Kilidi sök, alarm tak", effects: { cash: -700, trust: { r13: 8, r12: 4, r9: -3 }, part: { id: "guvenlik", delta: 6 }, flags: { yanginAcik: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "anahtar", label: "Yedek anahtar 1. katta", effects: { trust: { r13: 3, r0: 2, r12: -2 }, flags: { yanginAnahtar: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Kilit dursun", effects: { trust: { r13: -8 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "cati-3", minWeek: 14, cooldown: 10,
        title: "Çanak ormanı",
        body: "Rıza çatıya çıkardı. On çanak, üç kaçak kablo. Elif 'standart yok' diyor.",
        choices: [
          { id: "toz", label: "Topla, tek hat, kural yaz", effects: { cash: -1600, trust: { r13: 8, r3: 8, r12: -4 }, flags: { catiMirasi: "duzen" }, schedule: { due: 3, next: 3 } } },
          { id: "birak", label: "Kiminki duruyor dursun", effects: { trust: { r12: 4, r13: -6, r3: -4 }, flags: { catiMirasi: "orman" }, schedule: { due: 3, next: 3 } } },
          { id: "bekle", label: "Kış bitsin", effects: { flags: { catiMirasi: "kis" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "cati-4", minWeek: 18, cooldown: 12,
        title: "Rıza yağmur defterini indirdi",
        body: "Yedi sayfa. Tarih, saat, damlama. 'Ben söylerim siz ıslanırsınız' cümlesi artık resmi.",
        choices: [
          { id: "defter", label: "Defteri esas al, çatı kalemi aç", effects: { cash: -1200, part: { id: "cati", delta: 8 }, trust: { r13: 12, r4: 3, r3: 4 }, flags: { rizaDefter: 1 }, remember: [{ who: "r13", type: "defter-okundu", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "abart", label: "Abartı de, sayfayı geri ver", effects: { trust: { r13: -12, r0: 3 }, remember: [{ who: "r13", type: "defter-abarti", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Kışın bir daha bak", effects: { trust: { r13: -4 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "cocuk-ayse",
    family: "sosyal",
    exclusive: [],
    stages: [
      {
        id: "cocuk-1", minWeek: 3, maxWeek: 10, cooldown: 8,
        title: "Bahçede top yasak mı",
        body: "Ayşe'nin kızı. Kemal 'araba camı' diyor. Murat 'çocuk bahçede büyür' diyor.",
        choices: [
          { id: "izin", label: "Akşam altıya kadar top serbest", effects: { trust: { r5: 10, r2: 6, r4: -6 }, flags: { topIzin: 1 }, remember: [{ who: "r5", type: "top-izin", sentiment: 2 }], schedule: { due: 3, next: 1 } } },
          { id: "yasak", label: "Bahçe süs, top yok", effects: { trust: { r4: 8, r5: -10, r2: -4 }, remember: [{ who: "r5", type: "top-yasak", sentiment: -2 }], schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Bir cam kırılmadan konuşmayalım", effects: { schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "cocuk-2", minWeek: 6, cooldown: 8,
        title: "Basamak",
        body: "Kız merdivende düşmüş, hafif. Ayşe 'korkuluk gevşek' diyor. Bu kez şikâyet değil, korku.",
        choices: [
          { id: "korkuluk", label: "Korkuluğu bugün sık", effects: { cash: -650, trust: { r5: 12, r2: 4, r1: 3 }, flags: { korkuluk: 1 }, remember: [{ who: "r5", type: "korkuluk-sikildi", sentiment: 2 }], schedule: { due: 4, next: 2 } } },
          { id: "boya", label: "Boya, sıkma sonra", effects: { cash: -120, trust: { r5: -6 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Sigorta bakar", effects: { trust: { r5: -8 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "cocuk-3", minWeek: 12, cooldown: 10,
        title: "Ayşe şikâyetçi ama sadık",
        body: "Her hafta not. Oy günü yöneticiyi unutmuyor. 'Kızımın basamağı' cümlesi hâlâ duruyor.",
        choices: [
          { id: "hatirla", label: "Notunu okuduğunu söyle", effects: { trust: { r5: 8 }, flags: { ayseMirasi: "okundu" }, remember: [{ who: "r5", type: "notu-okundu", sentiment: 2 }], schedule: { due: 2, next: 3 } } },
          { id: "yok", label: "Notları çekmeceye", effects: { trust: { r5: -8 }, flags: { ayseMirasi: "cekmece" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Sıradaki nota bak", effects: { flags: { ayseMirasi: "sira" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "cocuk-4", minWeek: 16, cooldown: 12,
        title: "Ayşe notu bu kez kısa",
        body: "'Korkuluk tamam. Top hâlâ yasaksa oyum soğuk.' Şikâyetçi, sadık; ikisi birden.",
        choices: [
          { id: "top", label: "Akşam topu geri ver", effects: { trust: { r5: 10, r2: 5, r4: -6 }, flags: { topGeri: 1 }, remember: [{ who: "r5", type: "top-geri", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "park", label: "Bahçeyi süs tut, top yok", effects: { trust: { r4: 6, r5: -8 }, remember: [{ who: "r5", type: "top-yok-kaldi", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Notu dosyala", effects: { trust: { r5: -3 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "kiraci-murat",
    family: "para",
    exclusive: [],
    stages: [
      {
        id: "kiraci-1", minWeek: 4, maxWeek: 12, cooldown: 9,
        title: "Ev sahibi aidatı Murat'a yıkmış",
        body: "Murat ödemiyor çünkü kira sözleşmesinde aidat ev sahibinde. Ev sahibi telefonu açmıyor.",
        choices: [
          { id: "evsahibi", label: "Ev sahibini yaz, Murat'ı rahat bırak", effects: { trust: { r2: 10, r5: 3, r9: -4 }, flags: { muratHak: 1 }, remember: [{ who: "r2", type: "evsahibi-yazildi", sentiment: 2 }], schedule: { due: 3, next: 1 } } },
          { id: "murat", label: "Kim oturuyorsa o öder", effects: { trust: { r2: -10, r9: 6, r4: 3 }, remember: [{ who: "r2", type: "kira-yikildi", sentiment: -2 }], schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Avukat sonra", effects: { schedule: { due: 3, next: 1 } } },
        ],
      },
      {
        id: "kiraci-2", minWeek: 8, cooldown: 8,
        title: "Murat kaliteli tamir istiyor",
        body: "Borcu var, tavan akıyor, 'ucuz yama çocuk odasına yapılmasın' diyor. Çelişki onun, çözüm senin.",
        choices: [
          { id: "kaliteli", label: "Odayı düzgün yap, borç ayrı", effects: { cash: -1600, trust: { r2: 12, r3: 3, r4: -4 }, flags: { muratTamir: 1 }, remember: [{ who: "r2", type: "oda-yapildi", sentiment: 2 }], schedule: { due: 4, next: 2 } } },
          { id: "borc", label: "Önce borç, sonra tavan", effects: { trust: { r2: -8, r9: 5 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "İkisi de bekler", effects: { trust: { r2: -4 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "kiraci-3", minWeek: 14, cooldown: 10,
        title: "Murat'ın çocukları merdivende",
        body: "Aidat hâlâ karışık. Çocuklar 2. katta. Murat 'ben kiracıyım ama bu bina onların binası' diyor.",
        choices: [
          { id: "yaz", label: "Sözleşmeyi netleştir, yazılı", effects: { cash: -400, trust: { r2: 6, r3: 4, r9: 2 }, flags: { muratMirasi: "sozlesme" }, schedule: { due: 2, next: 3 } } },
          { id: "kov", label: "Ev sahibine tahliye fısıltısı", effects: { trust: { r2: -14, r4: 4, r9: 4 }, flags: { muratMirasi: "fisilti" }, remember: [{ who: "r2", type: "tahliye-fisiltisi", sentiment: -2 }], schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Çocuklar büyür", effects: { flags: { muratMirasi: "bekler" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "kiraci-4", minWeek: 18, cooldown: 12,
        title: "Ev sahibi nihayet açtı",
        body: "Telefon. 'Aidat kiracıda' diyor. Murat sözleşmeyi gösteriyor. İki kâğıt, bir koridor.",
        choices: [
          { id: "sozlesme", label: "Sözleşmeyi esas al, ev sahibine yaz", effects: { cash: -250, trust: { r2: 10, r5: 4, r9: -4 }, flags: { muratSoz: 1 }, remember: [{ who: "r2", type: "sozlesme-tuttu", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "pratik", label: "Kim oturuyorsa o öder, pratik", effects: { trust: { r2: -10, r9: 8, r4: 3 }, remember: [{ who: "r2", type: "pratik-yikildi", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Avukat iki kâğıdı da okusun", effects: { cash: -400, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "kamera-kvkk",
    family: "politik",
    exclusive: ["selin-kargo"],
    stages: [
      {
        id: "kamera-1", minWeek: 5, maxWeek: 14, cooldown: 9,
        title: "Kamera kaydı isteniyor",
        body: "Fatma güvenlik istiyor. Selin 'koridorum film değil' diyor. KVKK kâğıdı Elif'te.",
        choices: [
          { id: "tak", label: "Kamera, kayıt 72 saat, yazı as", effects: { cash: -1400, trust: { r9: 8, r4: 4, r13: 3, r12: -8, r3: 4 }, flags: { kameraTakildi: 1 }, remember: [{ who: "r12", type: "kamera-koridor", sentiment: -1 }, { who: "r9", type: "kamera-asti", sentiment: 1 }], schedule: { due: 4, next: 1 } } },
          { id: "yok", label: "Kamera yok, kapı kilidi yeter", effects: { trust: { r12: 8, r9: -6 }, flags: { kameraYok: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Teklif dursun", effects: { schedule: { due: 3, next: 1 } } },
        ],
      },
      {
        id: "kamera-2", minWeek: 9, cooldown: 8,
        title: "Kayıt izni",
        body: "Bir paket kayboldu. Barış kurye. Fatma kayda bakmak istiyor. Selin avukatından mesaj var.",
        choices: [
          { id: "izle", label: "Yalnız yönetici + bir sakin, tutanak", effects: { trust: { r9: 5, r8: 3, r12: -3, r3: 4 }, flags: { kayitProtokol: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "ac", label: "Kaydı salonda aç", effects: { trust: { r9: 4, r12: -12, r3: -6 }, remember: [{ who: "r12", type: "kayit-acildi", sentiment: -2 }], schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Paket bulunur", effects: { trust: { r8: -3, r9: -2 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "kamera-3", minWeek: 16, cooldown: 10,
        title: "Güvenlik mi mahremiyet mi",
        body: "Seçim dili buradan da geçiyor. Fatma 'ben yaşımı koruyorum' diyor. Selin 'ben hayatımı' diyor.",
        choices: [
          { id: "protokol", label: "Yazılı protokol, kamera kalsın", effects: { trust: { r9: 6, r3: 6, r12: 2 }, flags: { kameraMirasi: "protokol" }, schedule: { due: 2, next: 3 } } },
          { id: "sok", label: "Kameraları sök", effects: { trust: { r12: 10, r9: -10, r4: -4 }, flags: { kameraMirasi: "sok" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Seçimden sonra", effects: { flags: { kameraMirasi: "sonra" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "kamera-4", minWeek: 20, cooldown: 12,
        title: "Kayıt silme talebi",
        body: "Selin avukatı 72 saati hatırlattı. Fatma 'ben yaşımı koruyorum' diyor. Hard disk dolu.",
        choices: [
          { id: "sil", label: "Süre dolanı sil, tutanak tut", effects: { trust: { r12: 8, r3: 6, r9: -4 }, flags: { kayitSil: 1 }, remember: [{ who: "r12", type: "kayit-silindi", sentiment: 1 }], schedule: { due: 3, next: "done" } } },
          { id: "tut", label: "Kayıt dursun, güvenlik önce", effects: { trust: { r9: 8, r4: 4, r12: -12 }, remember: [{ who: "r12", type: "kayit-tutuldu", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Disk dolunca bakarız", effects: { trust: { r12: -4, r3: -2 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "yakit-kis",
    family: "para",
    exclusive: [],
    stages: [
      {
        id: "yakit-1", minWeek: 6, maxWeek: 16, cooldown: 10,
        title: "Kış yakıt avansı",
        body: "Kazan verimi düştü. Avans 1.800. Kırılgan haneler nefesini tutuyor. Kemal 'üşümeyelim' diyor.",
        choices: [
          { id: "avans", label: "Avansı böl, kış gelsin", effects: { cash: 1800, financeNote: "dues", trust: { r4: 6, r13: 4, r2: -8, r11: -8, r5: -6 }, flags: { yakitAvans: 1 }, remember: [{ who: "r2", type: "yakit-avans", sentiment: -1 }], schedule: { due: 3, next: 1 } } },
          { id: "kasa", label: "Kasadan yakıt, avans yok", effects: { cash: -2400, part: { id: "isitma", delta: 8 }, trust: { r2: 8, r11: 8, r5: 6, r4: -4 }, flags: { yakitKasa: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Ekim'i görürüz", effects: { part: { id: "isitma", delta: -4 }, trust: { r13: -4 }, schedule: { due: 3, next: 1 } } },
        ],
      },
      {
        id: "yakit-2", minWeek: 10, cooldown: 8,
        title: "Pay ölçer itirazı",
        body: "Kemal 'ben az yakıyorum' diyor. Ayşe 'çocuk üşüyor, vana kısık değil' diyor.",
        choices: [
          { id: "olc", label: "Pay ölçeri kalibre et", effects: { cash: -800, trust: { r4: 4, r5: 6, r3: 4 }, flags: { payOlcer: 1 }, schedule: { due: 4, next: 2 } } },
          { id: "esit", label: "Eşit böl, tartışma bitsin", effects: { trust: { r5: 4, r2: 3, r4: -8 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Bu kış idare", effects: { trust: { r5: -4, r4: -2 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "yakit-3", minWeek: 16, cooldown: 10,
        title: "Kazan dairesi nem",
        body: "Yakıt bittiğinde nem kalır. Elif rapor istiyor. Hasan 'eski kazan da ısıtırdı' diyor.",
        choices: [
          { id: "kazan", label: "Kazan bakımı kalıcı", effects: { cash: -2800, part: { id: "isitma", delta: 14 }, trust: { r3: 8, r13: 4, r0: -3 }, flags: { yakitMirasi: "kazan" }, schedule: { due: 3, next: 3 } } },
          { id: "nem", label: "Nem al, kazan dursun", effects: { cash: -500, trust: { r0: 4, r3: -4 }, flags: { yakitMirasi: "nem" }, schedule: { due: 3, next: 3 } } },
          { id: "bekle", label: "Baharı bekle", effects: { flags: { yakitMirasi: "bahar" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "yakit-4", minWeek: 20, cooldown: 12,
        title: "Vanası kısık daire, üşüyen çocuk",
        body: "Ayşe 'pay ölçer doğruysa kızım üşümesin' diyor. Kemal 'ben az yakıyorum, fatura ortak olmasın' diyor.",
        choices: [
          { id: "cocuk-isi", label: "Çocuk odası ısınsın, fark kasadan", effects: { cash: -700, trust: { r5: 10, r2: 4, r4: -6 }, flags: { isinCocuk: 1 }, remember: [{ who: "r5", type: "isin-fark", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "olc-kal", label: "Ölçer kalsın, üşüyen kendi vanasını açsın", effects: { trust: { r4: 8, r5: -8 }, remember: [{ who: "r5", type: "vana-ac", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Bu soğuk geçer", effects: { trust: { r5: -4, r13: -2 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "asansor-gece",
    family: "bakım",
    exclusive: [],
    stages: [
      {
        id: "asansor-1", minWeek: 1, maxWeek: 8, cooldown: 8,
        title: "Asansör kat arasında",
        body: "Sevim içeride kalmış, on dakika. Ses hâlâ var. Elif 'periyodik kontrol tarihi geçmiş olabilir' diyor.",
        choices: [
          { id: "servis", label: "Yetkili servis, bugün", effects: { cash: -2100, part: { id: "asansor", delta: 14 }, trust: { r1: 10, r3: 6, r0: -2 }, flags: { asansorServis: 1 }, remember: [{ who: "r1", type: "asansor-cikti", sentiment: 2 }], schedule: { due: 4, next: 1 } } },
          { id: "usta", label: "Mahalle ustası, yarın", effects: { cash: -700, part: { id: "asansor", delta: 4 }, flags: { asansorUsta: 1 }, trust: { r0: 4, r3: -5, r1: 3 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Çalışıyor ya", effects: { trust: { r1: -6, r13: -3 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "asansor-2", minWeek: 5, cooldown: 8,
        title: "Halat teklifi",
        body: "Servis halat değişimi yazmış. Fiyat ağır. Hasan 'bu asansör yirmi yıldır böyle' diyor.",
        choices: [
          { id: "halat", label: "Halatı değiştir", effects: { cash: -3600, part: { id: "asansor", delta: 16 }, trust: { r3: 8, r1: 6, r13: 4, r4: -4 }, flags: { asansorHalat: 1 }, schedule: { due: 5, next: 2 } } },
          { id: "ertele", label: "Kontrolü uzat, halat sonra", effects: { cash: -400, trust: { r0: 4, r3: -6 }, flags: { asansorErtele: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Teklifi çekmeceye", effects: { schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "asansor-3", minWeek: 12, cooldown: 10,
        title: "Taşınma çizdi",
        body: "Bir taşınma kabini çizmiş. Depozito tartışması. Asansörün hafızası çizik.",
        choices: [
          { id: "depozito", label: "Taşınmadan depozito al, kural yaz", effects: { trust: { r3: 5, r4: 4, r12: -4 }, flags: { asansorMirasi: "depozito" }, schedule: { due: 2, next: 3 } } },
          { id: "boya", label: "Boya, unut", effects: { cash: -350, trust: { r0: 3, r3: -3 }, flags: { asansorMirasi: "boya" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Çizik dursun", effects: { flags: { asansorMirasi: "cizik" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "asansor-4", minWeek: 16, cooldown: 12,
        title: "Sevim yine kat arasında",
        body: "On dakika daha. Ses var. Elif 'halat raporu' diyor. Hasan 'yirmi yıldır böyle' diyor. Sevim kapı aralığından değil, kabinden konuşuyor.",
        choices: [
          { id: "acil", label: "Acil servis, kabini boşalt", effects: { cash: -1800, part: { id: "asansor", delta: 8 }, trust: { r1: 12, r3: 6, r13: 4, r0: -3 }, flags: { asansorAcil: 1 }, remember: [{ who: "r1", type: "kabinden-cikti", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "merdiven", label: "Merdiven kullanılsın, asansör kilit", effects: { trust: { r0: 4, r1: -8, r13: -6 }, flags: { asansorKilit: 1 }, schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Ses varsa çalışıyordur", effects: { trust: { r1: -8, r3: -4 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "dis-cephe",
    family: "macro",
    exclusive: ["cati-riza"],
    stages: [
      {
        id: "cephe-1", minWeek: 10, cooldown: 12, minPhaseWeek: 8,
        title: "Dış cephe teklifi",
        body: "İskele hayali. Hasan 'kimlik bozulmasın' diyor. Kemal 'değer artsın' diyor. Elif 'yalıtım katsayısı' diyor.",
        choices: [
          { id: "kesif", label: "Keşif yaptır, henüz imza yok", effects: { cash: -900, trust: { r3: 6, r4: 4, r0: -2 }, flags: { cepheKesif: 1 }, schedule: { due: 4, next: 1 } } },
          { id: "red", label: "İskele yok, bu sene", effects: { trust: { r0: 8, r4: -6, r3: -4 }, flags: { cepheRed: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Teklif dursun", effects: { schedule: { due: 3, next: 1 } } },
        ],
      },
      {
        id: "cephe-2", minWeek: 16, cooldown: 10,
        title: "Borçlanma oyu",
        body: "Keşif geldiyse rakam masada. Kırılgan haneler susuyor. Kemal 'kredi' diyor.",
        choices: [
          { id: "kredi", label: "Ortak kredi konuşulsun", effects: { trust: { r4: 8, r3: 4, r2: -8, r11: -8, r5: -6 }, flags: { cepheKredi: 1 }, remember: [{ who: "r2", type: "kredi-konustu", sentiment: -1 }], schedule: { due: 4, next: 2 } } },
          { id: "taksit", label: "Aidatla yavaş, iskele yok", effects: { trust: { r0: 6, r2: 4, r4: -6 }, flags: { cepheYavas: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Sayıyı bir daha sor", effects: { schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "cephe-3", minWeek: 22, cooldown: 12,
        title: "İskele hayali",
        lateBody: "Bina ya yenilenecek ya tartışılacak. İskele bir kez kurulursa merdiven başka merdiven olur.",
        body: "Geç saat. Ya iskele ya kimlik.",
        choices: [
          { id: "kur", label: "İskeleyi kur", effects: { cash: -5200, trust: { r4: 10, r3: 8, r0: -10 }, flags: { binaKimligi: "iskele" }, schedule: { due: 3, next: 3 } } },
          { id: "alma", label: "İskele yok, çatı yeter", effects: { trust: { r0: 10, r1: 4, r4: -8 }, flags: { binaKimligi: "cati" }, schedule: { due: 3, next: 3 } } },
          { id: "bekle", label: "Seçimden sonra iskele", effects: { flags: { binaKimligi: "sonra-iskele" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "cephe-4", minWeek: 26, cooldown: 14, minPhaseWeek: 18,
        title: "İskele kurulursa merdiven değişir",
        body: "Hasan 'kimlik' diyor. Kemal 'değer' diyor. Elif yalıtım katsayısını tekrar okuyor. Bu kez karar kalıcı.",
        lateBody: "Geç saat. İskele ya bu kış ya hiç.",
        choices: [
          { id: "yalitim", label: "Yalıtım evet, renk eski kalsın", effects: { cash: -3600, trust: { r3: 10, r0: 6, r4: 4, r2: -6 }, flags: { cepheYalitim: 1 }, remember: [{ who: "r0", type: "renk-korundu", sentiment: 1 }], schedule: { due: 4, next: "done" } } },
          { id: "iptal-iskele", label: "İskele iptal, çatı yeter", effects: { trust: { r0: 10, r1: 4, r4: -10 }, flags: { cepheIptal: 1 }, schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Keşfi bir daha sor", effects: { schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "selin-kargo",
    family: "sosyal",
    exclusive: ["kamera-kvkk"],
    stages: [
      {
        id: "kargo-1", minWeek: 3, maxWeek: 11, cooldown: 8,
        title: "Kurye kapıda, kilit gevşek",
        body: "Selin gece kargo. Barış kaskla. Kapı kilidi 'biraz çevir' ile açılıyor.",
        choices: [
          { id: "kilit", label: "Kilidi değiştir", effects: { cash: -450, trust: { r12: 8, r8: 6, r9: 3 }, flags: { kilitYeni: 1 }, part: { id: "guvenlik", delta: 6 }, remember: [{ who: "r12", type: "kilit-degisti", sentiment: 2 }], schedule: { due: 3, next: 1 } } },
          { id: "dolap", label: "Kargo dolabı bodruma", effects: { cash: -900, trust: { r12: 6, r8: 4, r13: -2 }, flags: { kargoDolap: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Biraz daha çevirsinler", effects: { trust: { r12: -5 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "kargo-2", minWeek: 7, cooldown: 8,
        title: "Gece kahkaha",
        body: "Nuran 4. kattan not: '6. kat gülüyor.' Müzik yok, ses var. Selin 'üç kızız' diyor.",
        choices: [
          { id: "saat", label: "Gece 23 kuralı, gülmek serbest", effects: { trust: { r7: 5, r12: 4 }, flags: { geceKural: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "sustur", label: "Misafir defteri, imza", effects: { trust: { r7: 8, r9: 4, r12: -10 }, remember: [{ who: "r12", type: "misafir-defteri", sentiment: -2 }], schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Kahkaha geçer", effects: { trust: { r7: -3 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "kargo-3", minWeek: 15, cooldown: 10,
        title: "Selin kalacak mı",
        body: "Kira yenileme. 'Bu bina bizi istemezse gideriz' diyor. Leyla komşu, kalmasını istiyor.",
        choices: [
          { id: "tut", label: "Kal, kilit ve dolap senin", effects: { trust: { r12: 10, r11: 4, r8: 3 }, flags: { selinMirasi: "kal" }, remember: [{ who: "r12", type: "kal-dedi", sentiment: 2 }], schedule: { due: 2, next: 3 } } },
          { id: "git", label: "Gidecekse gitsin", effects: { trust: { r12: -8, r7: 4 }, flags: { selinMirasi: "git" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Kira onun meselesi", effects: { flags: { selinMirasi: "kira" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "kargo-4", minWeek: 18, cooldown: 12,
        title: "Selin kira yenilemesini uzattı",
        body: "Emlakçı gezdiriyor. Leyla 'kal' diyor. Nuran 'gülme bitsin' diyor. Kapı kilidi hâlâ konuşuyor.",
        choices: [
          { id: "kira-yardim", label: "Aidatta küçük indirim, kal", effects: { cash: -400, trust: { r12: 12, r11: 6, r8: 3, r4: -4 }, flags: { selinIndirim: 1 }, remember: [{ who: "r12", type: "kira-indirim", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "gezdir", label: "Emlakçı gezsin, boş daire hazırlığı", effects: { trust: { r12: -10, r7: 4, r11: -4 }, flags: { selinGidis: 1 }, remember: [{ who: "r12", type: "emlakci-gezdi", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Kira onun, kilit bizim", effects: { schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "imza-eski",
    family: "politik",
    exclusive: [],
    stages: [
      {
        id: "imza-1", minWeek: 7, maxWeek: 13, cooldown: 9,
        title: "Hasan ve Kemal ayrı kâğıt",
        body: "Aynı blok, iki kâğıt. Biri bakım, biri değer. İkisi de 'eski' ama aynı eski değil.",
        choices: [
          { id: "hasan", label: "Hasan'ın bakım kâğıdı", effects: { trust: { r0: 8, r1: 4, r4: -6 }, flags: { eskiKamp: "hasan" }, remember: [{ who: "r0", type: "bakim-kagidi", sentiment: 1 }], schedule: { due: 3, next: 1 } } },
          { id: "kemal", label: "Kemal'in değer kâğıdı", effects: { trust: { r4: 8, r13: 3, r0: -6 }, flags: { eskiKamp: "kemal" }, remember: [{ who: "r4", type: "deger-kagidi", sentiment: 1 }], schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "İki kâğıdı da alma", effects: { trust: { r0: -3, r4: -3 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "imza-2", minWeek: 11, cooldown: 8,
        title: "Rıza hakem",
        body: "7. kat suskun hakem. Rıza hangi kâğıdı imzalarsa merdiven o yana akar.",
        choices: [
          { id: "cati", label: "Rıza'yı çatıdan kazan", effects: { cash: -500, trust: { r13: 10, r0: 4, r4: 2 }, flags: { rizaHakem: "cati" }, schedule: { due: 3, next: 2 } } },
          { id: "deger", label: "Rıza'ya değer konuş", effects: { trust: { r13: 6, r4: 8, r0: -4 }, flags: { rizaHakem: "deger" }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Rıza kendi karar verir", effects: { schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "imza-3", minWeek: 16, cooldown: 10,
        title: "Eski blok sandıkta",
        body: "Eski ittifak bir değil artık. Fatma hangi kâğıdı gördüğünü soruyor.",
        choices: [
          { id: "birlestir", label: "Tek kâğıt: bakım + değer tavanı", effects: { trust: { r0: 6, r4: 6, r9: 4, r13: 4 }, flags: { eskiMirasi: "tek" }, schedule: { due: 2, next: 3 } } },
          { id: "bol", label: "Blok bölündü, öyle kalsın", effects: { trust: { r0: -2, r4: -2 }, flags: { eskiMirasi: "bol" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Fatma karar versin", effects: { trust: { r9: 6 }, flags: { eskiMirasi: "fatma" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "imza-4", minWeek: 20, cooldown: 12,
        title: "Fatma hangi kâğıdı görecek",
        body: "Eski blok birleştiyse Fatma tek kâğıdı öper. Bölündüyse iki çay, iki oy.",
        choices: [
          { id: "tekcay", label: "Tek çay, tek kâğıt, Fatma hakem", effects: { trust: { r9: 10, r0: 4, r4: 4, r13: 3 }, flags: { eskiTekCay: 1 }, remember: [{ who: "r9", type: "hakem-oldu", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "ikicay", label: "İki çay ayrı, sen arada", effects: { trust: { r9: -4, r0: -2, r4: -2 }, flags: { eskiIkiCay: 1 }, schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Çay sonra", effects: { schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "elektrik-pano",
    family: "bakım",
    exclusive: [],
    stages: [
      {
        id: "pano-1", minWeek: 4, maxWeek: 12, cooldown: 8,
        title: "Pano ısınıyor",
        body: "Bodrum. Cemal 'kablo keçeleşti' diyor. Elif 'yangın yükü' diyor. Hasan 'kırk yıldır ısınır' diyor.",
        choices: [
          { id: "elektrikci", label: "Yetkili elektrikçi", effects: { cash: -1900, part: { id: "elektrik", delta: 12 }, trust: { r3: 8, r10: 4, r0: -3 }, flags: { panoServis: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "banda", label: "Bant ve dua", effects: { cash: -80, flags: { panoBant: 1 }, trust: { r0: 3, r3: -7 }, schedule: { due: 2, next: 1 } } },
          { id: "bekle", label: "Isınır, yanmaz", effects: { trust: { r3: -4, r13: -2 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "pano-2", minWeek: 8, cooldown: 8,
        title: "Jeneratör gecikmesi",
        body: "Kesintide depo boş, jeneratör bakımsız. Murat çocuk odasında karanlık anlatıyor.",
        choices: [
          { id: "jen", label: "Jeneratör bakımı", effects: { cash: -1300, part: { id: "elektrik", delta: 8 }, trust: { r2: 8, r5: 5, r13: 3 }, flags: { jenBakim: 1 }, schedule: { due: 4, next: 2 } } },
          { id: "depo", label: "Su deposunu doldur, jen sonra", effects: { cash: -400, trust: { r2: 3, r13: 2 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Kesinti seyrek", effects: { schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "pano-3", minWeek: 14, cooldown: 10,
        title: "Sigorta yenileme",
        body: "Bina sigortası. Pano raporu olmadan prim artar. Elif dosyayı uzatıyor.",
        choices: [
          { id: "sigorta", label: "Rapor + poliçe", effects: { cash: -1600, trust: { r3: 8, r4: 4, r9: 3 }, flags: { elektrikMirasi: "poliçe" }, schedule: { due: 2, next: 3 } } },
          { id: "eski", label: "Eski poliçe, idare", effects: { trust: { r0: 4, r3: -6 }, flags: { elektrikMirasi: "eski" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Vade var", effects: { flags: { elektrikMirasi: "vade" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "pano-4", minWeek: 18, cooldown: 12,
        title: "Sigorta primi panoyu sordu",
        body: "Şirket ekspertiz istedi. Elif raporu uzatıyor. Hasan 'kırk yıldır ısınır' diyor. Prim artarsa aidat artar.",
        choices: [
          { id: "eksper-pano", label: "Eksper + pano yenileme teklifi", effects: { cash: -2200, part: { id: "elektrik", delta: 10 }, trust: { r3: 10, r10: 4, r4: 3, r0: -4 }, flags: { panoYeni: 1 }, remember: [{ who: "r3", type: "pano-yenilendi", sentiment: 2 }], schedule: { due: 4, next: "done" } } },
          { id: "prim", label: "Primi öde, pano dursun", effects: { cash: -700, trust: { r0: 4, r3: -6 }, flags: { panoPrim: 1 }, schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Vade dolmadan bakma", effects: { trust: { r3: -3 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "defter-usb",
    family: "politik",
    exclusive: [],
    stages: [
      {
        id: "defter-1", minWeek: 5, maxWeek: 14, cooldown: 9,
        title: "Eski yönetici USB'si",
        body: "Fatma bir çubuk getirdi. Eksik sayfa, fazla masraf. Hasan 'karıştırma' diyor.",
        choices: [
          { id: "ac", label: "USB'yi aç, tutanak", effects: { trust: { r9: 8, r3: 6, r0: -8 }, flags: { usbAcildi: 1 }, remember: [{ who: "r9", type: "usb-acildi", sentiment: 1 }], schedule: { due: 3, next: 1 } } },
          { id: "kapat", label: "Çubuğu iade et", effects: { trust: { r0: 6, r9: -8 }, flags: { usbKapali: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Avukat bakacakmış gibi yap", effects: { schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "defter-2", minWeek: 9, cooldown: 8,
        title: "Eksik sayfa",
        body: "Açıksa sayı ortaya çıkar. Kapalıysa fısıltı büyür. İkisi de seçimi yer.",
        choices: [
          { id: "ilan", label: "Özetini panoya as", effects: { trust: { r9: 6, r3: 4, r12: 3, r0: -6, r4: -3 }, flags: { usbIlan: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "ic", label: "İçeride tut, şantaj olmasın", effects: { trust: { r4: 3, r0: 3, r9: -4 }, flags: { usbIc: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Sayfayı bir daha say", effects: { schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "defter-3", minWeek: 15, cooldown: 10,
        title: "Yönetim mirası",
        body: "Senin defter de bir gün USB olur. Fatma bunu biliyor. Sen de.",
        choices: [
          { id: "seffaf", label: "Haftalık özet as", effects: { trust: { r9: 6, r3: 6, r12: 4, r0: -2 }, flags: { defterMirasi: "acik" }, schedule: { due: 2, next: 3 } } },
          { id: "kapali", label: "Defter çekmecede", effects: { trust: { r0: 6, r4: 3, r9: -6 }, flags: { defterMirasi: "cekmece" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Ayda bir yeter", effects: { flags: { defterMirasi: "aylik" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "defter-4", minWeek: 18, cooldown: 12,
        title: "Senin ilk USB'n",
        body: "Fatma 'senin sayfan da bir gün açılır' diyor. Şeffaflık vaadi tutulmadıysa fısıltı senin defterine yapışır.",
        choices: [
          { id: "kopya", label: "Haftalık özeti çoğalt, her kata bir", effects: { cash: -120, trust: { r9: 8, r3: 6, r12: 4, r0: -3 }, flags: { defterKopya: 1 }, remember: [{ who: "r9", type: "kopya-dagitti", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "tek", label: "Tek kopya çekmecede, soran bakın", effects: { trust: { r0: 5, r4: 3, r9: -8 }, flags: { defterTek: 1 }, remember: [{ who: "r9", type: "cekmece-kaldi", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Ay sonu yeter", effects: { schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "klima-alt",
    family: "sosyal",
    exclusive: [],
    stages: [
      {
        id: "klima-1", minWeek: 4, maxWeek: 12, cooldown: 8,
        title: "Klima gideri alt daireye",
        body: "Kemal üst, Ayşe alt. Damlayan su çocuk odasının pervazı. Kemal 'servis yarın' diyor, yarın üç gündür yarın.",
        choices: [
          { id: "servis", label: "Servisi sen çağır, faturayı Kemal'e", effects: { cash: -200, trust: { r5: 10, r4: -4 }, flags: { klimaServis: 1 }, remember: [{ who: "r5", type: "klima-servis", sentiment: 2 }], schedule: { due: 3, next: 1 } } },
          { id: "uyari", label: "Yazılı süre ver", effects: { trust: { r5: 4, r4: -2 }, flags: { klimaUyari: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Yarın gelsin", effects: { trust: { r5: -5 }, schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "klima-2", minWeek: 8, cooldown: 8,
        title: "Pervaz şişti",
        body: "Ayşe fotoğraf çekmiş. Kemal 'benim klimam, benim param' diyor. Ortak alan değil, komşu hukuku.",
        choices: [
          { id: "hasar", label: "Hasarı Kemal ödesin, sen arabul", effects: { trust: { r5: 8, r4: -6, r9: 3 }, flags: { klimaHasar: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "bina", label: "Kasadan boya, barış olsun", effects: { cash: -500, trust: { r4: 4, r5: 4, r0: -3 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "İki daire çözsün", effects: { relations: { r4: { r5: -14 } }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "klima-3", minWeek: 13, cooldown: 10,
        title: "Alt-üst ittifakı",
        body: "Bu damlama ya iki daireyi düşman eder ya bir oya mal olur. Kemal etkisi büyük, Ayşe unutmaz.",
        choices: [
          { id: "sulh", label: "İkisini de masaya oturt", effects: { trust: { r4: 5, r5: 5 }, relations: { r4: { r5: 12 } }, flags: { klimaMirasi: "sulh" }, schedule: { due: 2, next: 3 } } },
          { id: "ayse", label: "Ayşe'nin fotoğrafını gündeme al", effects: { trust: { r5: 10, r2: 3, r4: -8 }, flags: { klimaMirasi: "ayse" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Yaz bitsin, klima sussun", effects: { flags: { klimaMirasi: "yaz" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "klima-4", minWeek: 16, cooldown: 12,
        title: "Yaz bitti, damlama bitmedi",
        body: "Ayşe pervazı hâlâ şişik. Kemal servisi 'yaptırdım' diyor, fatura yok. Alt-üst ittifakı ya kalır ya da seçime gider.",
        choices: [
          { id: "fatura", label: "Fatura iste, yoksa tutanak", effects: { trust: { r5: 8, r9: 4, r4: -8 }, flags: { klimaFatura: 1 }, remember: [{ who: "r5", type: "fatura-istendi", sentiment: 1 }], relations: { r4: { r5: -8 } }, schedule: { due: 3, next: "done" } } },
          { id: "kapat", label: "Pervazı kasadan kapat, barış", effects: { cash: -450, trust: { r4: 4, r5: 4, r0: -3 }, relations: { r4: { r5: 8 } }, schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Kış klimayı kapatır", effects: { trust: { r5: -4 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "site-karsilat",
    family: "politik",
    exclusive: [],
    stages: [
      {
        id: "site-1", minWeek: 8, cooldown: 10,
        title: "Yandaki site aidatı daha düşük",
        body: "Kemal rakam savuruyor. Elif 'onların asansörü yeni, bizimki 1978' diyor. Karşılaştırma zehir.",
        choices: [
          { id: "tablo", label: "Karşı tablo as: hizmet / fiyat", effects: { trust: { r3: 8, r7: 4, r4: -4, r0: 3 }, flags: { siteTablo: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "indir", label: "Aidatı konuş, indirme vaadi", effects: { trust: { r4: 6, r2: 4, r11: 4, r3: -6 }, flags: { siteVaad: 1 }, remember: [{ who: "r4", type: "indirim-vaadi", sentiment: 1 }], schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Yan site yan sitedir", effects: { trust: { r4: -3 }, schedule: { due: 3, next: 1 } } },
        ],
      },
      {
        id: "site-2", minWeek: 14, cooldown: 10,
        title: "Vaadin faturası",
        body: "Vaad ettiysen birileri bekliyor. Etmediysen tablo hâlâ asılı mı, Fatma soruyor.",
        choices: [
          { id: "tut", label: "Vaadi tut, başka kalem kes", effects: { cash: -600, trust: { r4: 6, r2: 4, r3: -4 }, flags: { siteMirasi: "vaad" }, schedule: { due: 3, next: 2 } } },
          { id: "boz", label: "Vaadi unut, tablo kalsın", effects: { trust: { r4: -8, r3: 4 }, remember: [{ who: "r4", type: "vaad-unutuldu", sentiment: -2 }], flags: { siteMirasi: "boz" }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Bütçe toplantısında", effects: { flags: { siteMirasi: "butce" }, schedule: { due: 2, next: 2 } } },
        ],
      },
      {
        id: "site-3", minWeek: 20, cooldown: 10,
        title: "Bina başka site olmaz",
        lateBody: "Yunus Apartmanı yan sitenin kopyası değil. Kimlik ya tutulur ya satılır.",
        body: "Karşılaştırma durur ya da biter.",
        choices: [
          { id: "kimlik", label: "Bu bina bu bina, rakam içerde", effects: { trust: { r0: 8, r1: 4, r13: 4, r4: -4 }, flags: { siteSon: "kimlik" }, schedule: { due: 2, next: 3 } } },
          { id: "piyasa", label: "Piyasa konuşsun", effects: { trust: { r4: 8, r3: 4, r0: -6 }, flags: { siteSon: "piyasa" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Karşı tabloyu indir", effects: { flags: { siteSon: "indir" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "site-4", minWeek: 24, cooldown: 12, minPhaseWeek: 16,
        title: "Yan site broşürü panoda",
        body: "Kim bıraktı belli değil. Kemal 'görün' diyor. Hasan 'bu bina satılık değil' diyor. Broşür ya iner ya kimlik olur.",
        choices: [
          { id: "indir-bro", label: "Broşürü indir, tutanak: ilan değil", effects: { trust: { r0: 8, r1: 4, r13: 3, r4: -6 }, flags: { broIndir: 1 }, remember: [{ who: "r0", type: "brosur-indi", sentiment: 1 }], schedule: { due: 3, next: "done" } } },
          { id: "kalsin-bro", label: "Broşür dursun, karşılaştırma serbest", effects: { trust: { r4: 8, r3: 3, r0: -8 }, flags: { broKalsin: 1 }, schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Rüzgâr alır", effects: { schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
  {
    id: "temizlik-nobet",
    family: "sosyal",
    exclusive: [],
    stages: [
      {
        id: "nobet-1", minWeek: 2, maxWeek: 9, cooldown: 8,
        title: "Kapıcı nöbeti tartışması",
        body: "Kapıcı yok, nöbet var. Sevim merdiveni süpürüyor. Cemal 'ben dükkânım, merdiven senin' diyor.",
        choices: [
          { id: "cizelge", label: "Kat nöbet çizelgesi", effects: { trust: { r1: 6, r7: 4, r10: -4 }, flags: { nobetCizelge: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "disari", label: "Dışarıdan temizlikçi", effects: { cash: -800, trust: { r1: 4, r3: 4, r4: -3, r10: 3 }, flags: { temizlikci: 1 }, schedule: { due: 3, next: 1 } } },
          { id: "bekle", label: "Sevim süpürür", effects: { trust: { r1: -6 }, remember: [{ who: "r1", type: "süpürge-unuttu", sentiment: -1 }], schedule: { due: 2, next: 1 } } },
        ],
      },
      {
        id: "nobet-2", minWeek: 6, cooldown: 8,
        title: "Çöp odası kokusu",
        body: "Yaz. Çöp odası. Barış gece bırakıyor, Sevim sabah buluyor.",
        choices: [
          { id: "saat", label: "Çöp saati yazısı", effects: { trust: { r1: 5, r8: -3, r7: 3 }, flags: { copSaat: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "kilit", label: "Çöp odası kartlı", effects: { cash: -350, trust: { r1: 4, r12: -2 }, flags: { copKart: 1 }, schedule: { due: 3, next: 2 } } },
          { id: "bekle", label: "Koku dağılır", effects: { trust: { r1: -4 }, schedule: { due: 3, next: 2 } } },
        ],
      },
      {
        id: "nobet-3", minWeek: 12, cooldown: 10,
        title: "Sevim'in süpürgesi",
        body: "Hâlâ o süpürüyorsa oy günü kapı aralığı soğur.",
        choices: [
          { id: "tesekkur", label: "Panoya teşekkür, nöbet adil", effects: { trust: { r1: 10, r7: 3 }, flags: { nobetMirasi: "tesekkur" }, remember: [{ who: "r1", type: "tesekkur-asildi", sentiment: 2 }], schedule: { due: 2, next: 3 } } },
          { id: "yukle", label: "Sevim zaten yapıyor", effects: { trust: { r1: -10 }, flags: { nobetMirasi: "yukle" }, schedule: { due: 2, next: 3 } } },
          { id: "bekle", label: "Çizelge duruyor duruyor", effects: { flags: { nobetMirasi: "cizelge" }, schedule: { due: 2, next: 3 } } },
        ],
      },
      {
        id: "nobet-4", minWeek: 16, cooldown: 12,
        title: "Sevim süpürgeyi bıraktı",
        body: "Kapı aralığı kapalı. Merdiven toz. Cemal 'ben dükkânım' diyor. Teşekkür asıldıysa bile süpürge emekliliği ayrı hesap.",
        choices: [
          { id: "ucret", label: "Sevim'e küçük ücret, çizelge kalsın", effects: { cash: -300, trust: { r1: 12, r7: 3, r4: -3 }, flags: { sevimUcret: 1 }, remember: [{ who: "r1", type: "ucret-verildi", sentiment: 2 }], schedule: { due: 3, next: "done" } } },
          { id: "zorla", label: "Nöbet kural, ücret yok", effects: { trust: { r1: -10, r7: 2 }, remember: [{ who: "r1", type: "ucret-yok", sentiment: -2 }], schedule: { due: 3, next: "done" } } },
          { id: "bekle", label: "Toz görünce konuşuruz", effects: { trust: { r1: -4, r7: -2 }, schedule: { due: 2, next: "done" } } },
        ],
      }
    ],
  },
];

export function tickApartmanChains(s) {
  const D = globalThis.TarikLabDepth;
  if (!D || s.runSummary) return;
  s.flags = s.flags || {};
  s.flags.chains = s.flags.chains || {};
  s.flags.chainFlags = s.flags.chainFlags || {};
  if (s.activeEvent && !s.activeEvent.resolved) return;

  const candidates = [];
  for (const chain of CHAINS) {
    const st = chainState(s, chain.id);
    if (st.status === "done" || st.status === "dead") continue;
    if ((chain.exclusive || []).some((id) => {
      const other = s.flags.chains[id];
      return other && (other.status === "done" || other.status === "active" || flag(s, id));
    })) continue;
    const node = chain.stages[st.stage];
    if (!node) {
      st.status = "done";
      continue;
    }
    if (node.requireFlag && !flag(s, node.requireFlag)) continue;
    if (!eligible(s, chain, node, D)) continue;
    candidates.push({ chain, node, st, order: chain.stages.length - st.stage });
  }
  if (!candidates.length) return;
  candidates.sort((a, b) => {
    const fa = a.node.family === "politik" && s.week >= (s.politics?.electionDue || 99) - 3 ? -1 : 0;
    const fb = b.node.family === "politik" && s.week >= (s.politics?.electionDue || 99) - 3 ? -1 : 0;
    return fa - fb || a.node.minWeek - b.node.minWeek || a.chain.id.localeCompare(b.chain.id);
  });
  const pick = candidates[0];
  D.noteEvent(s, pick.node.id, s.week, pick.node.cooldown || 8);
  pick.st.status = "active";
  s.activeEvent = {
    chainId: pick.chain.id,
    nodeId: pick.node.id,
    stage: pick.st.stage,
    week: s.week,
    title: pick.node.title,
    body: locBody(pick.node, s),
    family: pick.chain.family,
    choices: pick.node.choices.map((c) => ({ id: c.id, label: c.label })),
  };
}

export function applyApartmanEventChoice(s, token) {
  const D = globalThis.TarikLabDepth;
  if (!D || !s.activeEvent || s.activeEvent.resolved) return s;
  const [chainId, nodeId, choiceId] = String(token).split(":");
  const chain = CHAINS.find((c) => c.id === chainId);
  if (!chain || s.activeEvent.chainId !== chainId) return s;
  const st = chainState(s, chainId);
  const node = chain.stages[st.stage];
  if (!node || node.id !== nodeId) return s;
  const choice = node.choices.find((c) => c.id === choiceId) || node.choices.find((c) => c.id === "bekle") || node.choices[node.choices.length - 1];
  applyEffects(s, D, choice.effects, chain.id);
  s.history = (s.history || []).concat({
    type: "chain",
    chain: chain.id,
    node: node.id,
    choice: choice.id,
    text: `${node.title} · ${choice.label}`,
    week: s.week,
  }).slice(-80);
  const next = choice.effects?.schedule?.next;
  if (next === "done" || next === "dead") {
    st.status = next === "dead" ? "dead" : "done";
    st.stage = chain.stages.length;
  } else if (Number.isFinite(next)) {
    st.stage = next;
    st.status = "idle";
  } else {
    st.stage = Math.min(chain.stages.length, st.stage + 1);
    st.status = st.stage >= chain.stages.length ? "done" : "idle";
  }
  if ((chain.exclusive || []).length && st.status === "done") {
    for (const id of chain.exclusive) {
      const other = chainState(s, id);
      if (other.status === "idle") other.status = "dead";
    }
  }
  s.activeEvent.resolved = true;
  s.activeEvent.choice = choice.id;
  s.activeEvent = null;
  return s;
}

export function resolveApartmanChainEffect(s, effect) {
  const D = globalThis.TarikLabDepth;
  if (!D || !effect || (effect.type !== "chain-echo" && effect.type !== "chain")) return false;
  const chain = CHAINS.find((c) => c.id === effect.chainId);
  if (!chain) return true;
  const st = chainState(s, chain.id);
  if (effect.next === "done" || effect.next === "dead") {
    st.status = effect.next === "dead" ? "dead" : "done";
    st.stage = chain.stages.length;
  } else if (Number.isFinite(effect.next)) {
    st.stage = effect.next;
    st.status = "idle";
  }
  if (effect.echo) {
    s.history = (s.history || []).concat({
      type: "echo",
      cause: effect.cause || chain.id,
      text: echoText(chain.id, effect.echo, s),
      week: s.week,
    }).slice(-80);
  }
  return true;
}

function echoText(chainId, echo) {
  const map = {
    fatura: "Ustanın faturası geldi; kolon hâlâ konuşuyor.",
    kacirma: "Hasan'ın ustası boyayı kapattı; alt katta leke duruyor.",
    buyudu: "İzlenen sızıntı büyüdü. Fotoğraflar birikti.",
    kurudu: "Kolon kurudu. Murat susuyor, Elif dosyayı kapatıyor.",
    tekrar: "Yama tutmadı. Su bildiği yolu unutmuyor.",
    sigorta: "Sigorta evrak istedi; tavan beklemiyor.",
    kuru: "Üç daire birden kurudu. Merdiven rahatladı.",
    kini: "Bir daire kurtuldu, öteki unutmadı.",
    imza: "Nuran imza kâğıdını dolandırıyor.",
    kavga: "4. kat kapıları bir gece açık unutuldu.",
    tutuldu: "Saat kuralı tutuldu. Matkap gündüze kaydı.",
    gece: "Yasak geceyi kaçırmadı; Okan usta çağırdı, gündüz.",
    secim: "İmza yok sayıldı. Nuran sandığı işaretledi.",
    oder: "Leyla taksiti yatırdı. Fatma defteri kapatmadı.",
    birikti: "Bir ay daha birikti. İsimler ağırlaştı.",
    eksper: "Eksper geldi. Fotoğraflar dosyaya girdi, sandığa da.",
  };
  return map[echo] || `${chainId} geri döndü.`;
}

export function summarizeApartmanRun(s) {
  const flags = s.flags?.chainFlags || {};
  const traces = [];
  if (flags.binaKimligi) traces.push(`Bina kimliği: ${flags.binaKimligi}`);
  if (flags.gurultuMirasi) traces.push(`4. kat: ${flags.gurultuMirasi}`);
  if (flags.leylaMirasi) traces.push(`Leyla: ${flags.leylaMirasi}`);
  if (flags.fatmaMirasi) traces.push(`Fatma sözü: ${flags.fatmaMirasi}`);
  if (flags.kediMirasi) traces.push(`Sevim: ${flags.kediMirasi}`);
  if (flags.parkMirasi) traces.push(`Otopark: ${flags.parkMirasi}`);
  if (flags.kameraMirasi) traces.push(`Kamera: ${flags.kameraMirasi}`);
  if (flags.selinMirasi) traces.push(`Selin: ${flags.selinMirasi}`);
  if (flags.ayseMirasi) traces.push(`Ayşe: ${flags.ayseMirasi}`);
  if (flags.muratMirasi) traces.push(`Murat: ${flags.muratMirasi}`);
  if (flags.defterMirasi) traces.push(`Defter: ${flags.defterMirasi}`);
  if (flags.dukkanMirasi) traces.push(`Dükkân: ${flags.dukkanMirasi}`);
  if (flags.yakitMirasi) traces.push(`Yakıt: ${flags.yakitMirasi}`);
  if (flags.asansorMirasi) traces.push(`Asansör: ${flags.asansorMirasi}`);
  if (flags.catiMirasi) traces.push(`Çatı: ${flags.catiMirasi}`);
  if (flags.klimaMirasi) traces.push(`Klima: ${flags.klimaMirasi}`);
  if (flags.nobetMirasi) traces.push(`Nöbet: ${flags.nobetMirasi}`);
  if (flags.siteSon) traces.push(`Yan site: ${flags.siteSon}`);
  if (flags.eskiMirasi) traces.push(`Eski blok: ${flags.eskiMirasi}`);
  return traces;
}

export function coverage() {
  const nodes = CHAINS.flatMap((c) => c.stages.map((n) => ({ ...n, family: c.family })));
  const choices = nodes.flatMap((n) => n.choices);
  const delayed = choices.filter((c) => c.effects?.schedule).length;
  const memory = choices.filter((c) => c.effects?.remember).length;
  const social = nodes.filter((n) => n.family === "sosyal" || (n.choices || []).some((ch) => ch.effects?.relations)).length;
  const macro = nodes.filter((n) => n.family === "macro" || n.phase || n.minPhaseWeek || (n.minWeek || 0) >= 20).length;
  const politics = nodes.filter((n) => n.family === "politik" || n.minConfidence != null || n.maxConfidence != null).length;
  const residentLinks = nodes.filter((n) => n.family === "sosyal" || (n.choices || []).some((ch) => ch.effects?.relations)).length;
  const exclusive = CHAINS.filter((c) => (c.exclusive || []).length).length;
  return {
    chains: CHAINS.length,
    nodes: nodes.length,
    choices: choices.length,
    delayed,
    memory,
    social,
    macro,
    politics,
    residentLinks,
    exclusive,
    ids: nodes.map((n) => n.id),
  };
}
