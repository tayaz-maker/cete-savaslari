import { expansion } from "./expansion.js";
import {
  card,
  on,
  draw,
  points,
  select,
  move,
  discard,
  flag,
  modifier,
  token,
  own,
  enemy,
  search,
  summon,
  set,
  buff,
} from "../duel-core/card-dsl.js";
export const designs = {
  ...expansion,
  1: card("Tea Server", "When destroyed, draw 1 card.", [], {}, [on("destroy", [draw()])]),
  2: card("Okey Player", "When flipped from a Set position, draw 1 card.", [], {}, [
    on("flip", [draw()]),
  ]),
  3: card(
    "Errand Runner",
    "When tributed, add 1 Teahouse card from your deck to your hand.",
    [],
    {},
    [on("tribute", search("tea", { series: "Çayhane" }))],
  ),
  4: card("Lookout", "Whenever your opponent Sets a card, look at it.", [], {
    revealEnemySet: true,
  }),
  5: card("Courier", "May attack directly, dealing half damage.", [], {
    direct: true,
    directMultiplier: 0.5,
  }),
  6: card(
    "Apprentice",
    "Tribute this card to Special Summon 1 Level 3 or lower Teahouse unit from your deck.",
    [
      { op: "selfMove", to: "grave", reason: "tribute" },
      ...summon("tea", "deck", { series: "Çayhane", maxLevel: 3 }),
    ],
  ),
  7: card("Park Keeper", "While defending, your opponent must attack another target.", [], {
    untargetableDefense: true,
  }),
  8: card("Minibus Assistant", "Gains 400 ATK while a Taxi-series unit is present.", [], {
    conditionalStats: { condition: "ownSeries", series: "Taksi", attack: 400 },
  }),
  9: card("Simit Seller", "During your Standby Phase, gain 200 RP.", [], {}, [
    on("standby", [points(200)], { global: true, own: true }),
  ]),
  10: card("Wedding Trigger", "When summoned, Set 1 Tip-off from your deck.", [], {}, [
    on("summon", set("trap", "deck")),
  ]),
  11: card("Caretaker", "Cannot be destroyed in battle while a neighborhood field is active.", [], {
    fieldBattleProtection: true,
  }),
  12: card(
    "Teahouse Madman",
    "On a turn in which it attacks, this unit gains 600 ATK and its DEF becomes 0.",
    [],
    { attackingStats: { attack: 600, defenseSet: 0 } },
  ),
  13: card(
    "Idler",
    "Once while in your hand: discard this card to draw 1 card.",
    [{ op: "selfMove", to: "grave", reason: "discard" }, draw()],
    { activateFrom: "hand", oncePerDuel: true },
  ),
  14: card(
    "Reserve Man",
    "May Special Summon itself from the grave in the same resolution in which a Teahouse unit is destroyed.",
    [],
    { reviveOnSeriesDestroyed: "Çayhane" },
  ),
  15: card("Taxi Boss", "Your Teahouse units gain 300 ATK.", [], {
    aura: { series: "Çayhane", attack: 300 },
  }),
  16: card(
    "Night Driver",
    "When attacking directly, you lose 300 RP and the attack deals full damage.",
    [],
    { directCost: 300, fullDirect: true },
  ),
  17: card("Garage Mechanic", "Gains 500 ATK and DEF while equipped.", [], {
    conditionalStats: { condition: "equipped", attack: 500, defense: 500 },
  }),
  18: card("Radar Man", "Flip: reveal your opponent’s hand.", [], {}, [
    on("flip", [{ op: "reveal", hand: true }]),
  ]),
  19: card("Roadblock", "When attacking a defending unit, use ATK versus ATK instead of DEF.", [], {
    attackDefenseAsAttack: true,
  }),
  20: card(
    "Shuttle Driver",
    "When summoned, Special Summon 1 Teahouse unit from your grave.",
    [],
    {},
    [on("summon", summon("tea", "grave", { series: "Çayhane" }))],
  ),
  21: card(
    "Transfer Vehicle",
    "Put 1 of your units on the bottom of your deck, then draw 1 card.",
    [select("unit", own()), move("deck"), draw()],
  ),
  22: card("Bridge Keeper", "Once per turn, a direct attack must target this unit instead.", [], {
    redirectDirect: true,
  }),
  23: card(
    "Stand Watcher",
    "While a Taxi-series unit is present, your opponent cannot Special Summon Level 3 or lower units.",
    [],
    { blockSpecialMaxLevel: 3, requiresSeries: "Taksi" },
  ),
  24: card(
    "Unlicensed Route",
    "While your RP is below 4000, direct attacks deal 600 additional damage.",
    [],
    { directBonusBelow: { threshold: 4000, amount: 600 } },
  ),
  25: card("Recovery Driver", "Return 1 equip card from your grave to your hand.", [
    select("equip", own("grave", { subtype: "equip" })),
    move("hand"),
  ]),
  26: card("Driver Uncle", "When destroyed in battle, Special Summon 1 Teahouse unit.", [], {}, [
    on("destroy", summon("tea", ["hand", "deck"], { series: "Çayhane" }), { reason: "battle" }),
  ]),
  27: card(
    "Site Foreman",
    "While this unit is defending, your opponent cannot activate Set traps when attacking it.",
    [],
    { blockTrapWhenDefending: true },
  ),
  28: card("Contractor", "Gains 400 ATK while a neighborhood field is active.", [], {
    conditionalStats: { condition: "field", attack: 400 },
  }),
  29: card("Watchman", "Once per duel, cannot be destroyed in battle.", [], {
    battleProtection: "duel",
  }),
  30: card("Blacksmith", "When an equip card is attached, draw 1 card.", [], {}, [
    on("equip", [draw()], { global: true, own: true }),
  ]),
  31: card("Market Trader", "During your Standby Phase, gain 300 RP.", [], {}, [
    on("standby", [points(300)], { global: true, own: true }),
  ]),
  32: card(
    "Butcher",
    "Units destroyed by this unit are banished instead of going to the grave.",
    [],
    { battleBanish: true },
  ),
  33: card("Warehouse Keeper", "Once per turn, prevent destruction of one of your Set cards.", [], {
    protectSetOnce: true,
  }),
  34: card(
    "Crane Operator",
    "Send 1 Set card to the grave and Special Summon a Wall token with 0 ATK and 1000 DEF.",
    [
      select("set", { owner: "both", zones: ["units", "support"], face: "down" }),
      move("grave"),
      token(1, 0, 1000, "Duvar", "Wall"),
    ],
  ),
  35: card(
    "Rented Warehouse",
    "Cannot attack. Counts as 2 Levels when used as tribute material.",
    [],
    { cannotAttack: true, materialLevelSet: 2 },
  ),
  36: card("Market Chair", "Your Bazaar-series units gain 200 ATK and DEF.", [], {
    aura: { series: "Çarşı", attack: 200, defense: 200 },
  }),
  37: card(
    "Snatcher",
    "When this unit destroys a unit in battle, your opponent discards 1 random card.",
    [],
    {},
    [on("battle-kill", [discard(1, true, true)])],
  ),
  38: card("Jeweler", "Pay 1000 RP: this unit cannot be destroyed this turn.", [
    points(-1000),
    { op: "modifier", self: true, value: { protectAll: true } },
  ]),
  39: card(
    "Loan Shark Apprentice",
    "During either player’s Standby Phase, your opponent loses 200 RP.",
    [],
    {},
    [on("standby", [points(-200, true)], { global: true })],
  ),
  40: card("Bailiff", "Destroy 1 opposing continuous or field spell, then gain 500 RP.", [
    select(
      "spell",
      enemy(["support", "field"], { kind: "spell", subtype: ["continuous", "field"] }),
    ),
    { op: "destroy" },
    points(500),
  ]),
  41: card(
    "Harbor Guard",
    "While a Night-series unit is present, Set a trap and look at an opposing Set card.",
    [
      ...set("trap", "deck"),
      select("enemy", enemy(["units", "support"], { face: "down" })),
      { op: "reveal" },
    ],
    { requiresSeries: "Gece" },
  ),
  42: card("Sailors’ Cafe", "Also counts as a Teahouse unit.", [], { extraSeries: "Çayhane" }),
  43: card(
    "Night Watchman",
    "While this unit is face-down in defense, your opponent cannot Normal Summon in Main Phase 1.",
    [],
    { facedownBlockNormalMain1: true },
  ),
  44: card("Storehouse", "Gains 800 DEF while equipped.", [], {
    conditionalStats: { condition: "equipped", defense: 800 },
  }),
  45: card(
    "Truck Gate",
    "When this unit declares a direct attack, Set 1 Tip-off from your deck.",
    [],
    {},
    [on("direct-declared", set("trap", "deck"))],
  ),
  46: card("Smuggler", "Gains 200 ATK for each of your banished cards.", [], {
    countStats: { count: "ownBanished", attack: 200 },
  }),
  47: card("Quay Man", "Once, cannot be destroyed in battle while Harbor Strip is active.", [], {
    fieldBattleOnce: "RCN-122",
  }),
  48: card("Sentry", "Flip: Set 1 Tip-off from your grave.", [], {}, [
    on("flip", set("trap", "grave")),
  ]),
  49: card(
    "Shift Worker",
    "During the End Phase, you may make 1 additional free position change.",
    [],
    { endPosition: true },
  ),
  50: card("Blind Spot", "Cannot be targeted.", [], {
    untargetableEffect: true,
    untargetableBattle: true,
  }),
  51: card(
    "Fixer",
    "When summoned, Set 1 unit from your hand without using your Normal Summon or paying tribute.",
    [],
    {},
    [
      on("summon", [
        select("unit", own("hand", { kind: "unit" })),
        { op: "summon", face: "down", position: "defense" },
      ]),
    ],
  ),
  52: card(
    "Tape Man",
    "When this unit destroys an opposing unit of the same Level, draw 1 card.",
    [],
    {},
    [on("battle-kill", [draw()], { sameLevel: true })],
  ),
  53: card(
    "Customs Contact",
    "Whenever your opponent summons from the auxiliary deck, they lose 800 RP.",
    [],
    {},
    [on("auxiliary-summon", [points(-800, true)], { global: true, opponent: true })],
  ),
  54: card("Early Riser", "If face up during Standby, gains 800 ATK this turn.", [], {}, [
    on("standby", [{ op: "modifier", self: true, value: { attack: 800 } }], {
      global: true,
      own: true,
    }),
  ]),
  55: card("Neighborhood Boss", "Gains 400 ATK while a neighborhood field is active.", [], {
    conditionalStats: { condition: "field", attack: 400 },
  }),
  56: card("District Heavy", "When Tribute Summoned using a Teahouse unit, draw 1 card.", [], {}, [
    on("summon", [draw()], { tributeSeries: "Çayhane" }),
  ]),
  57: card(
    "Loan Shark",
    "During your Standby Phase, your opponent chooses: lose 400 RP or discard 1 card.",
    [],
    {},
    [
      on("standby", [{ op: "payOrDiscard", cost: 400, opponent: true }], {
        global: true,
        own: true,
      }),
    ],
  ),
  58: card("Garage Chief", "Your Taxi units gain 300 ATK and DEF.", [], {
    aura: { series: "Taksi", attack: 300, defense: 300 },
  }),
  59: card("Wedding Mansion", "While defending, prevents opposing direct attacks.", [], {
    blockDirectDefense: true,
  }),
  60: card(
    "Wholesale King",
    "During your Standby Phase, gain 500 RP while you control a Bazaar unit.",
    [],
    {},
    [on("standby", [points(500)], { global: true, own: true, requiresSeries: "Çarşı" })],
  ),
  61: card("Minibus Fleet", "May make 2 direct attacks, each dealing half damage.", [], {
    direct: true,
    attacks: 2,
    directOnlyMultiple: true,
    directMultiplier: 0.5,
  }),
  62: card(
    "Nightclub",
    "While face up, once per turn you may activate a Tip-off on the turn it was Set.",
    [],
    { sameTurnTrapOnce: true },
  ),
  63: card(
    "Construction Partner",
    "When a unit is tributed, banish it instead of leaving it in the grave and search your deck for 1 Racon card.",
    [],
    { tributeSearchSpell: true },
  ),
  64: card(
    "Police Contact",
    "Once per turn, negate an opposing Tip-off activation without discarding this card.",
    [{ op: "negate" }],
    { responseFrom: "units", responseKinds: ["trap"] },
  ),
  65: card("Municipal Officer", "Negate an opposing continuous Racon card.", [
    select("spell", enemy("support", { kind: "spell", subtype: "continuous" })),
    modifier({ negated: true }, true),
  ]),
  66: card(
    "Family Representative",
    "Once this turn, an auxiliary summon requires 1 fewer material.",
    [flag("auxiliaryDiscount", 1)],
  ),
  67: card(
    "Prison Release",
    "May Special Summon itself from banishment if it was banished by an effect.",
    [],
    { specialCondition: "effectBanished" },
  ),
  68: card("Former Soldier", "In an equal-ATK battle, only the opposing unit is destroyed.", [], {
    winTie: true,
  }),
  69: card("Sports Club", "Your tokens and Level 2 or lower units gain 800 DEF.", [], {
    aura: { maxLevel: 2, defense: 800 },
  }),
  70: card(
    "Estate Management",
    "Once per turn, prevent effect destruction of one of your Set cards.",
    [],
    { protectSetEffectOnce: true },
  ),
  71: card(
    "The Boss",
    "Gains 200 ATK for each unit tributed to summon it. May attack directly while your grave contains at least 3 cards.",
    [],
    { tributeAttack: 200, directGraveCount: 3 },
  ),
  72: card("Old Boss", "Once per turn, cannot be destroyed in battle.", [], {
    battleProtection: "turn",
  }),
  73: card(
    "Intercity",
    "Deals half battle damage. When summoned, destroy the opposing neighborhood field.",
    [],
    { battleMultiplier: 0.5 },
    [on("summon", [select("field", enemy("field")), { op: "destroy" }])],
  ),
  74: card(
    "Family Head",
    "When summoned using Family or Teahouse tribute material, draw 2 cards.",
    [],
    {},
    [on("summon", [draw(2)], { tributeSeries: ["Aile", "Çayhane"] })],
  ),
  75: card("Harbor Chief", "Your Harbor units cannot be destroyed in battle.", [], {
    seriesBattleProtection: "Liman",
  }),
  76: card("Safe", "During your Standby Phase, gain 1000 RP and discard 1 card.", [], {}, [
    on("standby", [points(1000), select("discard", own("hand")), discard()], {
      global: true,
      own: true,
    }),
  ]),
  77: card("Return from Exile", "When summoned from banishment, gains 600 ATK.", [], {}, [
    on("summon", [{ op: "modifier", self: true, permanent: true, value: { attack: 600 } }], {
      from: "banished",
    }),
  ]),
  78: card(
    "Two Districts, One Hand",
    "Gains 800 ATK and DEF if 2 different neighborhood fields have been played during this duel.",
    [],
    { conditionalStats: { condition: "twoFields", attack: 800, defense: 800 } },
  ),
  79: card("The Name", "Cannot be targeted by effects, but may be attacked.", [], {
    untargetableEffect: true,
  }),
  80: card("Council", "Both players must Set Quick-Play cards before activating them.", [], {
    quickMustSet: true,
  }),
  81: card("Oath Witness", "Ritual material.", [], { ritualMaterial: true }),
  82: card(
    "Blood Bond",
    "Ritual: Oath and 7 Levels. When summoned, Set 1 Tip-off from your deck.",
    [],
    { ritualLevel: 7 },
    [on("summon", set("trap", "deck"))],
  ),
  83: card(
    "United Gang",
    "Materials: 2 units of different series. Gains 400 ATK for each different series on your field.",
    [],
    {
      materials: { count: 2, differentSeries: true },
      countStats: { count: "ownDistinctSeries", attack: 400 },
    },
  ),
  84: card(
    "Family Union",
    "Materials: 2 Teahouse units. Once per turn, cannot be destroyed in battle.",
    [],
    { materials: { series: ["Çayhane", "Çayhane"] }, battleProtection: "turn" },
  ),
  85: card(
    "Council Decision",
    "Materials: 1 Boss-series unit and 1 other unit. Opposing traps wait 1 additional turn.",
    [],
    { materials: { series: ["Baba", null] }, trapDelay: 1 },
  ),
  86: card(
    "Shared Safe",
    "Materials: 2 Bazaar units. During your Standby Phase, gain 600 RP.",
    [],
    { materials: { series: ["Çarşı", "Çarşı"] } },
    [on("standby", [points(600)], { global: true, own: true })],
  ),
  87: card(
    "Two Streets",
    "Materials: 1 Taxi unit and 1 Teahouse unit. May attack directly once for full damage.",
    [],
    { materials: { series: ["Taksi", "Çayhane"] }, direct: true, fullDirect: true },
  ),
  88: card("Sworn Boss", "Ritual: Oath and 8 Levels. Its tributed materials are banished.", [], {
    ritualLevel: 8,
    ritualBanish: true,
  }),
  89: card(
    "Adopted Son",
    "Material: 1 unit from your grave. When summoned, Special Summon 1 Level 3 or lower unit from that grave.",
    [],
    { materials: { count: 1, zones: ["grave"] } },
    [on("summon", summon("unit", "grave", { maxLevel: 3 }))],
  ),
  90: card(
    "Oath Text",
    "Ritual instruction: send units whose Levels meet the requirement to the grave, then summon the ritual unit.",
    [{ op: "ritual" }],
    { ritualEnabler: true },
  ),
  91: card("Collect Protection", "Draw 1 card and gain 300 RP.", [draw(), points(300)]),
  92: card("District Tribute", "Your opponent loses 800 RP.", [points(-800, true)]),
  93: card("Travel Money", "1 Taxi unit gains 600 ATK this turn.", [
    select("taxi", own("units", { series: "Taksi" })),
    modifier({ attack: 600 }),
  ]),
  94: card("Draw a Weapon", "1 unit gains 800 ATK; send it to the grave during the End Phase.", [
    ...buff({ attack: 800, endGrave: true }),
  ]),
  95: card("Car Fire", "Send 1 equip or field card to the grave.", [
    select("card", { owner: "both", zones: ["support", "field"], subtype: ["equip", "field"] }),
    move("grave"),
  ]),
  96: card("Coffee Session", "Draw 2 cards, then discard 1.", [
    draw(2),
    select("discard", own("hand")),
    discard(),
  ]),
  97: card(
    "Wedding Invitation",
    "Add 1 unit from your deck to your hand.",
    search("unit", { kind: "unit" }),
  ),
  98: card("Bail", "Pay 1000 RP: 1 unit cannot be destroyed this turn.", [
    points(-1000),
    ...buff({ protectAll: true }),
  ]),
  99: card("Man Transfer", "Take control of 1 Level 3 or lower opposing unit for this turn.", [
    select("unit", enemy("units", { maxLevel: 3 })),
    { op: "control" },
  ]),
  100: card("Graveyard Visit", "Return 1 unit from your grave to your hand.", [
    select("unit", own("grave", { kind: "unit" })),
    move("hand"),
  ]),
  101: card("Exile", "Banish 1 card on the field.", [
    select("card", { owner: "both", zones: ["units", "support", "field"] }),
    move("banished"),
  ]),
  102: card("Detention Ban", "Traps cannot be activated this turn.", [
    flag("blockTrap"),
    flag("blockTrap", true, true),
  ]),
  103: card("Bribe", "Pay 1500 RP to summon from your auxiliary deck.", [
    points(-1500),
    { op: "auxiliary" },
  ]),
  104: card("Fake Permit", "Look at 1 opposing Set card. You may pay 700 RP to destroy it.", [
    select("set", enemy(["units", "support"], { face: "down" })),
    { op: "peekDestroy", cost: 700 },
  ]),
  105: card("Warehouse Key", "Special Summon 1 Wall token (0 ATK / 2000 DEF).", [
    token(1, 0, 2000, "Duvar", "Wall"),
  ]),
  106: card("Night Share", "Your Harbor units gain 400 ATK and DEF this turn.", [
    { op: "select", all: true, selector: own("units", { series: "Liman" }) },
    { op: "modifier", count: 5, value: { attack: 400, defense: 400 } },
  ]),
  107: card("Morning Cleanup", "Send all Level 2 or lower units to the grave.", [
    { op: "select", all: true, selector: { owner: "both", zones: "units", maxLevel: 2 } },
    move("grave", 10),
  ]),
  108: card(
    "Whisper a Name",
    "Add 1 Boss-series or Level 1 unit from your deck to your hand.",
    search("unit", { kind: "unit", bossOrLevelOne: true }),
  ),
  109: card("We Talked", "Your opponent discards 1 card.", [
    select("discard", enemy("hand")),
    discard(1, true),
  ]),
  110: card("Old Ledger", "Return 1 Normal Racon card from your grave to your hand.", [
    select("spell", own("grave", { kind: "spell", subtype: "normal" })),
    move("hand"),
  ]),
  111: card(
    "District Map",
    "Add 1 field card from your deck to your hand.",
    search("field", { subtype: "field" }),
  ),
  112: card(
    "Tea Counter",
    "Add 2 Teahouse cards from your deck to your hand, then discard 1 card.",
    [...search("tea", { series: "Çayhane" }, 2), select("discard", own("hand")), discard()],
  ),
  113: card("Garage Door", "Return 1 equip card from your grave to your hand.", [
    select("equip", own("grave", { subtype: "equip" })),
    move("hand"),
  ]),
  114: card("Harbor Watch", "Set 1 Tip-off from your deck.", set("trap", "deck")),
  115: card(
    "Getaway Car",
    "Cancel an attack and return its attacker to the deck.",
    [{ op: "pendingTarget" }, { op: "cancelAttack" }, move("deck")],
    { responseTypes: ["attack"] },
  ),
  116: card("Phone Disconnected", "Negate the declared effect.", [{ op: "negate" }], {
    responseTypes: ["activate"],
  }),
  117: card("I Was Not There", "Cancel a direct attack.", [{ op: "cancelAttack" }], {
    responseTypes: ["attack"],
    directOnly: true,
  }),
  118: card("Sudden Pressure", "1 unit’s ATK becomes 0 this turn.", [
    select("unit", { owner: "both", zones: "units" }),
    modifier({ attackSet: 0 }),
  ]),
  119: card("Intimidation", "All opposing units lose 800 DEF this turn.", [
    { op: "select", all: true, selector: enemy() },
    { op: "modifier", count: 5, value: { defense: -800 } },
  ]),
  120: card("Lower District", "Level 3 or lower units gain 500 DEF.", [], {
    aura: { maxLevel: 3, defense: 500 },
  }),
  121: card("Upper District", "Level 5 or higher units gain 400 ATK.", [], {
    aura: { minLevel: 5, attack: 400 },
  }),
  122: card("Harbor Strip", "Harbor units deal 300 additional direct attack damage.", [], {
    seriesDirectBonus: { series: "Liman", amount: 300 },
  }),
  123: card(
    "Inside the Bazaar",
    "During Standby, both players lose 200 RP. If you control a Bazaar unit, your net change is instead +400 RP.",
    [],
    {},
    [
      on(
        "standby",
        [
          points(-200),
          points(-200, true),
          { op: "conditionalPoints", series: "Çarşı", amount: 600 },
        ],
        { global: true },
      ),
    ],
  ),
  124: card("Handheld Radio", "The equipped unit lets you inspect Set trap activations.", [], {
    equip: { revealTrap: true },
  }),
  125: card(
    "Official Car",
    "The equipped unit gains 500 ATK and deals an extra half of its direct attack damage.",
    [],
    { equip: { attack: 500, directMultiplier: 1.5 } },
  ),
  126: card("Iron Bar", "The equipped unit gains 700 ATK and its DEF becomes 0.", [], {
    equip: { attack: 700, defenseSet: 0 },
  }),
  127: card(
    "Ambush",
    "When an attack is declared, destroy the attacker and deal no battle damage.",
    [{ op: "pendingTarget" }, { op: "destroy" }, { op: "cancelAttack" }],
    { responseTypes: ["attack"] },
  ),
  128: card(
    "Tip-off Line",
    "When your opponent summons, turn that unit face-down in defense.",
    [{ op: "pendingTarget" }, { op: "position", position: "defense", face: "down" }],
    { responseTypes: ["summon"] },
  ),
  129: card("Raid", "Destroy 1 Set card.", [
    select("set", { owner: "both", zones: ["units", "support"], face: "down" }),
    { op: "destroy" },
  ]),
  130: card("Station Response", "Cancel a direct attack.", [{ op: "cancelAttack" }], {
    responseTypes: ["attack"],
    directOnly: true,
  }),
  131: card("Estate Camera", "Look at all Set cards.", [
    {
      op: "select",
      all: true,
      selector: { owner: "both", zones: ["units", "support"], face: "down" },
    },
    { op: "reveal", count: 20 },
  ]),
  132: card("Neighbor Saw", "Destroy 1 face-down unit.", [
    select("unit", { owner: "both", zones: "units", face: "down" }),
    { op: "destroy" },
  ]),
  133: card("Informer", "Your opponent discards 1 random card.", [discard(1, true, true)]),
  134: card("False Address", "Send 1 field or continuous card to the grave.", [
    select("card", {
      owner: "both",
      zones: ["support", "field"],
      subtype: ["field", "continuous"],
    }),
    move("grave"),
  ]),
  135: card("Mined Coffee", "At the start of Battle Phase, skip it.", [{ op: "skipBattle" }], {
    responseTypes: ["battle-start"],
  }),
  136: card(
    "Door Broken",
    "For this turn, attacks against 1 defending unit use its ATK instead of DEF.",
    [
      select("unit", { owner: "both", zones: "units", position: "defense" }),
      modifier({ defendWithAttack: true }),
    ],
  ),
  137: card("Road Closed", "Opposing Taxi units cannot attack this turn.", [
    flag("blockAttackSeries", "Taksi", true),
  ]),
  138: card("Police Incoming", "Neither player may Special Summon this turn.", [
    flag("blockSpecial"),
    flag("blockSpecial", true, true),
  ]),
  139: card("Gang Clash", "Each player destroys 1 of their units.", [
    select("own", own()),
    { op: "destroy" },
    select("enemy", enemy()),
    { op: "destroy" },
  ]),
  140: card("Hostage", "1 unit cannot attack this turn. Draw 1 card.", [
    select("unit", { owner: "both", zones: "units" }),
    modifier({ cannotAttack: true }),
    draw(),
  ]),
  141: card(
    "Escaping Courier",
    "Return the destroyed Teahouse unit to its owner’s hand.",
    [{ op: "destroyedTarget" }, move("hand")],
    { responseTypes: ["destroy"], destroyedSeries: "Çayhane" },
  ),
  142: card("Old Score", "Set 1 Tip-off from your grave.", set("trap", "grave")),
  143: card("District Raid", "Destroy a field card and deal 800 RP damage to your opponent.", [
    select("field", { owner: "both", zones: "field" }),
    { op: "destroy" },
    points(-800, true),
  ]),
  144: card("Silent Night", "Negate card effects until the end of this turn.", [
    flag("negateField"),
    flag("negateField", true, true),
  ]),
  145: card("False Tip-off", "Negate a Tip-off activation.", [{ op: "negate" }], {
    responseKinds: ["trap"],
  }),
  146: card("Lawyer Arrived", "Negate destruction.", [{ op: "negate" }], { responseDestroy: true }),
  147: card("Municipal Patrol", "Negate a Racon spell.", [{ op: "negate" }], {
    responseKinds: ["spell"],
  }),
  148: card("Missing File", "Negate the declared effect.", [{ op: "negate" }], {
    responseTypes: ["activate"],
  }),
  149: card(
    "I Do Not Know Them",
    "Negate an effect that targets a card. District Protection mode: instead prevent battle destruction.",
    [{ op: "targetOrBattleNegate" }],
    { responseTargetOrBattle: true, aliasesEn: ["District Protection"] },
  ),
  150: card(
    "Council Halt",
    "Negate any activation, then both players draw 1 card.",
    [{ op: "negate" }, draw(), draw(1, true)],
    { responseTypes: ["activate"] },
  ),
};
