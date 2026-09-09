import { readFileSync, writeFileSync } from "node:fs";
import { families, bosses, spells, traps } from "./duel-expansion-source.mjs";
import {
  draw,
  points,
  select,
  move,
  modifier,
  own,
  enemy,
  search,
  summon,
  on,
  card,
} from "../public/games/duel-core/card-dsl.js";
for (const theme of ["veto-h", "gett-oh"]) {
  const veto = theme === "veto-h",
    prefix = veto ? "SND" : "RCN",
    point = veto ? "OP" : "RP";
  const rows = JSON.parse(readFileSync(`public/games/${theme}/source-cards.json`)).filter(
      (c) => Number(c.id.slice(4)) <= 150,
    ),
    designs = {};
  const add = (
    names,
    series,
    kind,
    level,
    attack,
    defense,
    tr,
    en,
    effects = [],
    traits = {},
    triggers = [],
    hint = [
      "Kaynağı harcamadan önce sonraki hamleni planla.",
      "Plan the follow-up before spending the resource.",
    ],
    location = "main",
    subtype = kind === "unit" ? "effect" : "normal",
  ) => {
    const [name, nameEn] = names.split("|"),
      n = rows.length + 1;
    rows.push({
      id: `${prefix}-${String(n).padStart(3, "0")}`,
      name,
      kind,
      subtype,
      series,
      level,
      attack,
      defense,
      deckLocation: location,
      text: tr,
    });
    effects = effects.flatMap((op) =>
      op.op === "discard" && !op.random
        ? [select("discard", own("hand", { excludeSource: true }), op.count || 1), op]
        : [op],
    );
    if (effects.some((op) => ["summon", "control"].includes(op.op)))
      traits = { ...traits, requiresFreeZone: "units" };
    if (effects.some((op) => op.op === "set")) traits = { ...traits, requiresFreeZone: "support" };
    designs[n] = {
      ...card(nameEn, en, effects, traits, triggers),
      series: kind === "trap" ? [series, veto ? "Skandal" : "İhbar"] : [series],
      hint: { tr: hint[0], en: hint[1] },
    };
  };
  const retrieve = (series, zones = "grave", kind = "unit") => [
    select("recover", own(zones, { series, kind })),
    move("hand"),
  ];
  const tribute = { op: "selfMove", to: "grave", reason: "tribute" };
  families[theme].forEach(([series, se, names], f) => {
    names.split(";").forEach((name, r) => {
      const fee = 300 + f * 50,
        atk = [600, 900, 800, 1200, 700, 1100, 1900][r] + (f % 3) * 100,
        def = [900, 700, 1600, 1200, 800, 1000, 1800][r];
      let tr,
        en,
        effects = [],
        traits = {},
        triggers = [],
        level = r === 6 ? 5 : r === 4 ? 2 : 3;
      if (r === 0) {
        tr = `Normal çağrıldığında ${fee} ${point} kaybet; destenden kademe 3 veya altı 1 ${series} birimini eline al ve desteni karıştır.`;
        en = `When Normal Summoned, lose ${fee} ${point}; add 1 Level 3 or lower ${se} unit from your deck to your hand and shuffle.`;
        triggers = [
          on(
            "summon",
            [points(-fee), ...search("recruit", { series, kind: "unit", maxLevel: 3 })],
            { normal: true },
          ),
        ];
      }
      if (r === 1) {
        tr = `Turda bir: ${fee} ${point} öde; mezarlığından 1 ${series} birimini eline al. Bu tur savaş aşamasını atla.`;
        en = `Once per turn: pay ${fee} ${point}; return 1 ${se} unit from your grave to your hand. Skip Battle this turn.`;
        effects = [points(-fee), ...retrieve(series), { op: "skipBattle" }];
      }
      if (r === 2) {
        tr = `Başka bir ${series} birimin varken ${400 + (f % 3) * 100} DEF kazanır. Set durumundan açıldığında rakibin kapalı 1 destek kartına bak.`;
        en = `Gains ${400 + (f % 3) * 100} DEF while you control another ${se} unit. When flipped, look at 1 opposing face-down support card.`;
        traits = {
          conditionalStats: { condition: "otherSeries", series, defense: 400 + (f % 3) * 100 },
        };
        triggers = [
          on("flip", [select("look", enemy("support", { face: "down" })), { op: "reveal" }]),
        ];
      }
      if (r === 3) {
        tr = `Sahadaki ${series} birimleri ${150 + (f % 3) * 50} ATK kazanır. Kendi Hazırlık aşamanda ${200 + f * 25} ${point} kaybet.`;
        en = `${se} units on the field gain ${150 + (f % 3) * 50} ATK. During your Standby Phase, lose ${200 + f * 25} ${point}.`;
        traits = { aura: { series, attack: 150 + (f % 3) * 50 } };
        triggers = [on("standby", [points(-200 - f * 25)], { global: true, own: true })];
      }
      if (r === 4) {
        tr = `Bu kartı feda et: destenden kademe 2 veya altı 1 ${series} birimini özel çağır. Turda bir; bu tur savaş aşamasını atla.`;
        en = `Tribute this card: Special Summon 1 Level 2 or lower ${se} unit from your deck. Once per turn; skip Battle this turn.`;
        effects = [
          tribute,
          ...summon("relay", "deck", { series, maxLevel: 2 }),
          { op: "skipBattle" },
        ];
      }
      if (r === 5) {
        tr = `Turda bir: ${fee + 250} ${point} öde; rakibin açık kademe ${3 + (f % 3)} veya altı 1 birimini savunmaya geçir, ardından 1 ${series} birimine bu tur 300 ATK ver.`;
        en = `Once per turn: pay ${fee + 250} ${point}; change 1 opposing face-up Level ${3 + (f % 3)} or lower unit to defense, then give 1 ${se} unit 300 ATK this turn.`;
        effects = [
          points(-fee - 250),
          select("opponent", enemy("units", { face: "up", maxLevel: 3 + (f % 3) })),
          { op: "position", position: "defense" },
          select("ally", own("units", { series })),
          modifier({ attack: 300 }),
        ];
      }
      if (r === 6) {
        tr = `Çağırmak için 1 feda gerekir. Her çağrı fedası için 200 ATK kazanır. Savaşta yok olduğunda mezarlığından kademe 3 veya altı 1 ${series} birimini eline al.`;
        en = `Requires 1 tribute to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower ${se} unit from your grave to your hand.`;
        traits = { tributeAttack: 200 };
        triggers = [
          on(
            "destroy",
            [
              select("successor", own("grave", { series, kind: "unit", maxLevel: 3 })),
              move("hand"),
            ],
            { reason: "battle" },
          ),
        ];
      }
      // Distinct tactical jobs within the shared family grammar; not recolored
      // stat variants. Each clause below is supported by the existing primitives.
      if (r === 1 && f % 3 === 1) {
        tr = `Turda bir: ${fee} ${point} öde; oyun dışındaki kademe 4 veya altı 1 ${series} birimini eline al.`;
        en = `Once per turn: pay ${fee} ${point}; return 1 banished Level 4 or lower ${se} unit to your hand.`;
        effects = [
          points(-fee),
          select("rescue", own("banished", { series, kind: "unit", maxLevel: 4 })),
          move("hand"),
        ];
      }
      if (r === 1 && f % 3 === 2) {
        tr = `Turda bir: ${fee} ${point} öde; rakibin kapalı 1 kartına bak, ardından 1 ${series} birimine bu tur 400 DEF ver.`;
        en = `Once per turn: pay ${fee} ${point}; look at 1 opposing face-down card, then give 1 ${se} unit 400 DEF this turn.`;
        effects = [
          points(-fee),
          select("peek", enemy(["units", "support"], { face: "down" })),
          { op: "reveal" },
          select("guard", own("units", { series })),
          modifier({ defense: 400 }),
        ];
      }
      if (r === 2 && f % 3 === 1) {
        tr = `Puanın ${3000 + f * 100} altındayken 600 DEF kazanır. Açıldığında 1 ${series} birimini savunmaya geçir.`;
        en = `Gains 600 DEF while your points are below ${3000 + f * 100}. When flipped, change 1 ${se} unit to defense.`;
        traits = {
          conditionalStats: { condition: "pointsBelow", threshold: 3000 + f * 100, defense: 600 },
        };
        triggers = [
          on("flip", [
            select("shelter", own("units", { series })),
            { op: "position", position: "defense" },
          ]),
        ];
      }
      if (r === 2 && f % 3 === 2) {
        tr = `Başka bir ${series} birimin varken 500 ATK kazanır. Feda edildiğinde ${400 + f * 50} ${point} kazan.`;
        en = `Gains 500 ATK while you control another ${se} unit. When tributed, gain ${400 + f * 50} ${point}.`;
        traits = { conditionalStats: { condition: "otherSeries", series, attack: 500 } };
        triggers = [on("tribute", [points(400 + f * 50)])];
      }
      if (r === 3 && f % 3 === 1) {
        tr = `Sahadaki kademe 3 veya altı ${series} birimleri 400 DEF kazanır. Kendi Hazırlık aşamanda ${200 + f * 25} ${point} kaybet.`;
        en = `Level 3 or lower ${se} units on the field gain 400 DEF. During your Standby Phase, lose ${200 + f * 25} ${point}.`;
        traits = { aura: { series, maxLevel: 3, defense: 400 } };
      }
      if (r === 3 && f % 3 === 2) {
        tr = `Kapalı tuzağın varken 400 ATK kazanır. Turda bir: ${fee} ${point} öde; 1 ${series} birimine bu tur 500 DEF ver.`;
        en = `Gains 400 ATK while you control a Set trap. Once per turn: pay ${fee} ${point}; give 1 ${se} unit 500 DEF this turn.`;
        traits = { conditionalStats: { condition: "ownSetTrap", attack: 400 } };
        triggers = [];
        effects = [
          points(-fee),
          select("cover", own("units", { series })),
          modifier({ defense: 500 }),
        ];
      }
      if (r === 4 && f % 3 === 1) {
        tr = `Bu kartı feda et: mezarlığından kademe 3 veya altı 1 ${series} birimini özel çağır; bu tur savaş aşamasını atla.`;
        en = `Tribute this card: Special Summon 1 Level 3 or lower ${se} unit from your grave; skip Battle this turn.`;
        effects = [
          tribute,
          ...summon("relay", "grave", { series, maxLevel: 3 }),
          { op: "skipBattle" },
        ];
      }
      if (r === 4 && f % 3 === 2) {
        tr = `Bu kartı feda et: oyun dışındaki 1 ${series} birimini eline al, sonra 300 ${point} kazan.`;
        en = `Tribute this card: return 1 banished ${se} unit to your hand, then gain 300 ${point}.`;
        effects = [tribute, ...retrieve(series, "banished"), points(300)];
      }
      if (r === 5 && f % 3 === 1) {
        tr = `Turda bir: ${fee + 250} ${point} öde; rakibin açık 1 destek kartını eline gönder. Bir ${series} birimin bulunmalı.`;
        en = `Once per turn: pay ${fee + 250} ${point}; return 1 opposing face-up support card to its owner's hand. You must control a ${se} unit.`;
        effects = [
          points(-fee - 250),
          select("support", enemy("support", { face: "up" })),
          move("hand"),
        ];
        traits = { requiresSeries: series };
      }
      if (r === 5 && f % 3 === 2) {
        tr = `Turda bir: ${fee + 250} ${point} öde; rakibin mezarlığındaki kademe 4 veya altı 1 birimi oyun dışına gönder, ardından 1 ${series} birimine bu tur 200 ATK ver.`;
        en = `Once per turn: pay ${fee + 250} ${point}; banish 1 Level 4 or lower unit from the opposing grave, then give 1 ${se} unit 200 ATK this turn.`;
        effects = [
          points(-fee - 250),
          select("deny", enemy("grave", { kind: "unit", maxLevel: 4 })),
          move("banished"),
          select("ally", own("units", { series })),
          modifier({ attack: 200 }),
        ];
      }
      if (!veto && r === 0) {
        tr = `Normal sahaya sürüldüğünde mezarlığından kademe 2 veya altı 1 ${series} adamını eline al, ardından ${250 + f * 25} RP kazan.`;
        en = `When Normal Summoned, return 1 Level 2 or lower ${se} crew from your grave to your hand, then gain ${250 + f * 25} RP.`;
        effects = [];
        traits = {};
        triggers = [
          on(
            "summon",
            [
              select("return", own("grave", { kind: "unit", series, maxLevel: 2 })),
              move("hand"),
              points(250 + f * 25),
            ],
            { normal: true },
          ),
        ];
      }
      if (!veto && r === 2) {
        tr = `Donatılmışken ${400 + f * 25} ATK kazanır. Set durumundan açıldığında mezarlığındaki 1 donanım kartını eline al.`;
        en = `Gains ${400 + f * 25} ATK while equipped. When flipped from Set, return 1 Equip card from your grave to your hand.`;
        traits = { conditionalStats: { condition: "equipped", attack: 400 + f * 25 } };
        triggers = [
          on("flip", [
            select("tools", own("grave", { kind: "spell", subtype: "equip" })),
            move("hand"),
          ]),
        ];
      }
      if (!veto && r === 4) {
        tr = `Turda bir: ${fee} RP öde; başka bir ${series} adamına bu tur ${400 + f * 25} ATK ver; bu kart bu tur 200 DEF kazanır.`;
        en = `Once per turn: pay ${fee} RP; give another ${se} crew ${400 + f * 25} ATK this turn; this card gains 200 DEF this turn.`;
        effects = [
          points(-fee),
          select("partner", own("units", { series, excludeSource: true })),
          modifier({ attack: 400 + f * 25 }),
          { op: "modifier", self: true, value: { defense: 200 } },
        ];
        traits = {};
        triggers = [];
      }
      if (!veto && r === 5) {
        tr = `Bu kartı feda et: rakibin mezarlığındaki kademe ${2 + (f % 3)} veya altı 1 adamı oyun dışına gönder, sonra rakip ${350 + f * 25} RP kaybeder.`;
        en = `Tribute this card: banish 1 Level ${2 + (f % 3)} or lower crew from the opposing grave, then the opponent loses ${350 + f * 25} RP.`;
        effects = [
          tribute,
          select("deny", enemy("grave", { kind: "unit", maxLevel: 2 + (f % 3) })),
          move("banished"),
          points(-350 - f * 25, true),
        ];
        traits = {};
        triggers = [];
      }
      add(name, series, "unit", level, atk, def, tr, en, effects, traits, triggers, [
        `${series} desteğini koru; ${veto && r === 4 ? "feda dönüşünü savaşsız turda kullan." : "bu kartı tek başına değil takip hamlesiyle kullan."}`,
        `Protect your ${se} support; ${veto && r === 4 ? "use the tribute relay on a non-Battle turn." : "pair this card with a follow-up."}`,
      ]);
    });
  });
  bosses[theme].forEach((name, i) => {
    const [series, se] = families[theme][i * 2],
      [second, secondEn] = families[theme][i * 2 + 1];
    add(
      name,
      series,
      "unit",
      7,
      2300 + i * 100,
      2000 + i * 100,
      `Yardımcı deste: 1 ${series} ve 1 ${second} birimi malzeme. Turda bir: ${700 + i * 100} ${point} öde; rakibin 1 açık destek kartını eline gönder.`,
      `Auxiliary deck: 1 ${se} and 1 ${secondEn} unit as materials. Once per turn: pay ${700 + i * 100} ${point}; return 1 opposing face-up support card to its owner's hand.`,
      [points(-700 - i * 100), select("support", enemy("support", { face: "up" })), move("hand")],
      { materials: { series: [series, second] } },
      [],
      [
        "İki farklı hattı birleştir; kapalı tuzakları bu etki çözmez.",
        "Join two lines; this effect cannot remove face-down traps.",
      ],
      "auxiliary",
    );
  });
  spells[theme].split(";").forEach((name, i) => {
    const f = i % 12,
      [series, se] = families[theme][f],
      tier = Math.floor(i / 12),
      fee = 400 + f * 50;
    let tr,
      en,
      effects = [],
      traits = {},
      subtype = "normal";
    if (tier === 0) {
      tr = `${fee} ${point} öde; destenden kademe 4 veya altı 1 ${series} birimini eline al, desteni karıştır, sonra elinden 1 kart bırak.`;
      en = `Pay ${fee} ${point}; add 1 Level 4 or lower ${se} unit from your deck to your hand, shuffle, then discard 1 card.`;
      effects = [
        points(-fee),
        ...search("line", { series, kind: "unit", maxLevel: 4 }),
        { op: "discard", count: 1 },
      ];
    } else if (tier === 1) {
      tr = `${fee + 200} ${point} öde; mezarlığından kademe 3 veya altı 1 ${series} birimini özel çağır. Bu tur savaş aşamasını atla.`;
      en = `Pay ${fee + 200} ${point}; Special Summon 1 Level 3 or lower ${se} unit from your grave. Skip Battle this turn.`;
      effects = [
        points(-fee - 200),
        ...summon("return", "grave", { series, maxLevel: 3 }),
        { op: "skipBattle" },
      ];
    } else if (tier === 2) {
      subtype = "equip";
      tr = `Donatılan birim ${300 + f * 25} DEF kazanır. Sahadaki ${series} birimleri 150 ATK kazanır.`;
      en = `The equipped unit gains ${300 + f * 25} DEF. ${se} units on the field gain 150 ATK.`;
      traits = { equip: { defense: 300 + f * 25 }, aura: { series, attack: 150 } };
    } else {
      tr = `1200 ${point} öde; 2 kart çek, ardından elinden 2 kart bırak ve bu tur savaş aşamasını atla.`;
      en = `Pay 1200 ${point}; draw 2 cards, then discard 2 cards and skip Battle this turn.`;
      effects = [points(-1200), draw(2), { op: "discard", count: 2 }, { op: "skipBattle" }];
    }
    if (tier === 0 && f % 4 === 1) {
      tr = `${fee} ${point} öde; destenin üst ${2 + Math.floor(f / 4)} kartına bak, aralarından en fazla 1 birimi eline al; kalanları aynı sırayla üste bırak. Bir ${series} birimin bulunmalı.`;
      en = `Pay ${fee} ${point}; look at the top ${2 + Math.floor(f / 4)} cards of your deck, take up to 1 unit and leave the rest on top in order. You must control a ${se} unit.`;
      effects = [points(-fee), { op: "look", count: 2 + Math.floor(f / 4), take: 1, kind: "unit" }];
      traits = { requiresSeries: series };
    }
    if (tier === 0 && f % 4 === 2) {
      tr = `${fee} ${point} öde; mezarlığındaki 1 ${series} birimini eline al, ardından rakip mezarlığındaki 1 birimi oyun dışına gönder.`;
      en = `Pay ${fee} ${point}; return 1 ${se} unit from your grave to your hand, then banish 1 unit from the opposing grave.`;
      effects = [
        points(-fee),
        ...retrieve(series),
        select("deny", enemy("grave", { kind: "unit" })),
        move("banished"),
      ];
    }
    if (tier === 0 && f % 4 === 3) {
      tr = `${fee} ${point} öde; rakibin açık 1 destek kartını eline gönder, ardından 1 ${series} birimine bu tur 300 DEF ver.`;
      en = `Pay ${fee} ${point}; return 1 opposing face-up support card to its owner's hand, then give 1 ${se} unit 300 DEF this turn.`;
      effects = [
        points(-fee),
        select("evict", enemy("support", { face: "up" })),
        move("hand"),
        select("guard", own("units", { series })),
        modifier({ defense: 300 }),
      ];
    }
    if (tier === 1 && f % 4 === 1) {
      tr = `${fee + 200} ${point} öde; mezarlığındaki 1 tuzağı destek bölgesine set et. Bir ${series} birimin bulunmalı. Set kartı bu tur açamazsın.`;
      en = `Pay ${fee + 200} ${point}; Set 1 trap from your grave into a support zone. You must control a ${se} unit. The Set card cannot activate this turn.`;
      effects = [
        points(-fee - 200),
        select("reset", own("grave", { kind: "trap" })),
        { op: "set" },
      ];
      traits = { requiresSeries: series };
    }
    if (tier === 1 && f % 4 === 2) {
      tr = `${fee + 200} ${point} öde; rakibin mezarlığındaki 1 birimi oyun dışına gönder ve 1 kart çek. Bir ${series} birimin bulunmalı.`;
      en = `Pay ${fee + 200} ${point}; banish 1 unit from the opposing grave and draw 1 card. You must control a ${se} unit.`;
      effects = [
        points(-fee - 200),
        select("deny", enemy("grave", { kind: "unit" })),
        move("banished"),
        draw(),
      ];
      traits = { requiresSeries: series };
    }
    if (tier === 1 && f % 4 === 3) {
      tr = `${fee + 600} ${point} öde; rakibin açık kademe ${2 + Math.floor(f / 4)} veya altı 1 biriminin kontrolünü bu tur al. Bir ${series} birimin ve boş birim bölgen bulunmalı.`;
      en = `Pay ${fee + 600} ${point}; take control of 1 opposing face-up Level ${2 + Math.floor(f / 4)} or lower unit for this turn. You need a ${se} unit and an empty unit zone.`;
      effects = [
        points(-fee - 600),
        select("borrow", enemy("units", { face: "up", maxLevel: 2 + Math.floor(f / 4) })),
        { op: "control" },
      ];
      traits = { requiresSeries: series };
    }
    if (tier === 2 && f % 3 === 1) {
      tr = `Donatılan birim ${350 + f * 25} ATK kazanır ama 200 DEF kaybeder. Sahadaki ${series} birimleri 100 DEF kazanır.`;
      en = `The equipped unit gains ${350 + f * 25} ATK but loses 200 DEF. ${se} units on the field gain 100 DEF.`;
      traits = { equip: { attack: 350 + f * 25, defense: -200 }, aura: { series, defense: 100 } };
    }
    if (tier === 2 && f % 3 === 2) {
      tr = `Donatılan birim 300 DEF kazanır. Sahadaki kademe 3 veya altı ${series} birimleri ${150 + f * 25} ATK kazanır.`;
      en = `The equipped unit gains 300 DEF. Level 3 or lower ${se} units on the field gain ${150 + f * 25} ATK.`;
      traits = { equip: { defense: 300 }, aura: { series, maxLevel: 3, attack: 150 + f * 25 } };
    }
    add(
      name,
      series,
      "spell",
      0,
      0,
      0,
      tr,
      en,
      effects,
      traits,
      [],
      [
        tier === 2
          ? `${series} hattında donanımı savaş öncesi kullan.`
          : `${series} hattını kur; bedeli ve savaş kaybını hesaba kat.`,
        tier === 2
          ? `Equip before fighting with the ${se} line.`
          : `Build the ${se} line; budget the cost and lost tempo.`,
      ],
      "main",
      subtype,
    );
  });
  traps[theme].split(";").forEach((name, i) => {
    const f = i % 12,
      [series, se] = families[theme][f],
      fee = 350 + f * 50;
    let tr, en, effects, traits;
    if (i < 12) {
      tr = `Rakip saldırı ilan ettiğinde: ${fee} ${point} öde; saldırıyı iptal et, ardından mezarlığından kademe 2 veya altı 1 ${series} birimini eline al.`;
      en = `When the opponent declares an attack: pay ${fee} ${point}; cancel the attack, then return 1 Level 2 or lower ${se} unit from your grave to your hand.`;
      effects = [
        points(-fee),
        { op: "cancelAttack" },
        select("recover", own("grave", { series, kind: "unit", maxLevel: 2 })),
        move("hand"),
      ];
      traits = { responseTypes: ["attack"] };
    } else if (i < 24) {
      tr = `Rakip bir destek kartı etkinleştirdiğinde: ${fee + 400} ${point} öde; etkinleştirmeyi etkisizleştir, ardından 1 ${series} birimine bu tur 300 DEF ver.`;
      en = `When the opponent activates a support card: pay ${fee + 400} ${point}; negate the activation, then give 1 ${se} unit 300 DEF this turn.`;
      effects = [
        points(-fee - 400),
        { op: "negate" },
        select("cover", own("units", { series })),
        modifier({ defense: 300 }),
      ];
      traits = { responseTypes: ["activate"], responseKinds: ["spell", "trap"] };
    } else {
      tr = `Düelloda bir: rakip doğrudan saldırı ilan ettiğinde 1000 ${point} öde; saldırıyı iptal et ve 1 kart çek.`;
      en = `Once per duel: when the opponent declares a direct attack, pay 1000 ${point}; cancel the attack and draw 1 card.`;
      effects = [points(-1000), { op: "cancelAttack" }, draw()];
      traits = { responseTypes: ["attack"], directOnly: true, oncePerDuel: true };
    }
    add(
      name,
      series,
      "trap",
      0,
      0,
      0,
      tr,
      en,
      effects,
      traits,
      [],
      [
        i < 12
          ? `Önce ${series} mezarlığını hazırla; kurtarma hedefi olmadan açılamaz.`
          : i < 24
            ? `${series} birimin sahadayken destek karşılığını tut.`
            : "Son savunmanı küçük hasara harcama.",
        i < 12
          ? `Prepare a ${se} grave target; without one this cannot activate.`
          : i < 24
            ? `Keep this response while a ${se} unit is on the field.`
            : "Do not spend your last defense on minor damage.",
      ],
    );
  });
  if (rows.length !== 300) throw Error(`${theme}: ${rows.length}`);
  writeFileSync(`public/games/${theme}/source-cards.json`, JSON.stringify(rows, null, 2) + "\n");
  writeFileSync(
    `public/games/${theme}/expansion.js`,
    "// Family-authored expansion; generated by scripts/build-duel-expansion.mjs.\nexport const expansion = " +
      JSON.stringify(designs, null, 2) +
      ";\n",
  );
  console.log(theme, rows.length);
}
