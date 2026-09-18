export const designs = {
  "1": {
    "name": "File Clerk",
    "text": "Tribute this card to Special Summon 1 Level 3 or lower officer from deck.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "deck"
          ],
          "kind": "unit",
          "series": "Dosya",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "2": {
    "name": "Paraf Clerk",
    "text": "Once per turn: negate 1 notice for this turn.",
    "effects": [
      {
        "op": "select",
        "key": "trap",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "kind": "trap"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "negated": true
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "3": {
    "name": "Panel Clerk",
    "text": "When summoned, send 1 card from your deck to the archive.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "mill",
            "selector": {
              "owner": "own",
              "zones": "deck"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "grave",
            "count": 1,
            "reason": "effect"
          }
        ]
      }
    ],
    "series": [
      "Heyet"
    ]
  },
  "4": {
    "name": "Command Clerk",
    "text": "When summoned, the opponent loses 200 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": -200,
            "opponent": true
          }
        ]
      }
    ],
    "series": [
      "Karargah"
    ]
  },
  "5": {
    "name": "Telex Clerk",
    "text": "When destroyed, banish 1 card from the opposing archive.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "banish",
            "selector": {
              "owner": "opponent",
              "zones": "grave"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "banished",
            "count": 1,
            "reason": "effect"
          }
        ]
      }
    ],
    "series": [
      "Telex"
    ]
  },
  "6": {
    "name": "Memo Clerk",
    "text": "When summoned, draw 1 card.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "draw",
            "count": 1,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Muhtira"
    ]
  },
  "7": {
    "name": "Annex Clerk",
    "text": "When tributed, gain 200 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "tribute",
        "effects": [
          {
            "op": "points",
            "amount": 200,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Zeyil"
    ]
  },
  "8": {
    "name": "Brief Clerk",
    "text": "While defending, cannot be attacked; if no other target, direct is allowed.",
    "effects": [],
    "traits": {
      "untargetableDefense": true,
      "allowDirectWhenOnlyDefenders": true
    },
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "9": {
    "name": "Cabinet Clerk",
    "text": "When attacking an equal-level officer, deal 300 extra damage.",
    "effects": [],
    "traits": {
      "sameLevelDamage": 300
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "10": {
    "name": "Archive Clerk",
    "text": "When summoned, look at the top 3; take 1 and return the rest in order.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "look",
            "count": 3,
            "take": 1
          }
        ]
      }
    ],
    "series": [
      "Arsiv"
    ]
  },
  "11": {
    "name": "Dispatch Clerk",
    "text": "Create a 0/1000 Paper Seal token.",
    "effects": [
      {
        "op": "token",
        "count": 1,
        "attack": 0,
        "defense": 1000,
        "tr": "Kağıt Mühür",
        "en": "Paper Seal"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "12": {
    "name": "Charter Reporter",
    "text": "During Standby, draw 1 (continuous).",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "draw",
            "count": 1,
            "opponent": false
          }
        ],
        "global": true
      }
    ],
    "series": [
      "Mesruiyet"
    ]
  },
  "13": {
    "name": "File Reporter",
    "text": "When flipped from Set, draw 2 cards.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "draw",
            "count": 2,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Dosya"
    ]
  },
  "14": {
    "name": "Paraf Reporter",
    "text": "When summoned, gain 200 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": 200,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Paraf"
    ]
  },
  "15": {
    "name": "Panel Reporter",
    "text": "When summoned, the opponent discards 1 card.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "discard",
            "selector": {
              "owner": "opponent",
              "zones": "hand"
            },
            "count": 1,
            "chooser": "opponent"
          },
          {
            "op": "discard",
            "count": 1,
            "opponent": true,
            "random": false
          }
        ]
      }
    ],
    "series": [
      "Heyet"
    ]
  },
  "16": {
    "name": "Command Reporter",
    "text": "Gains 200 ATK for each opposing Set card.",
    "effects": [],
    "traits": {
      "countStats": {
        "count": "enemySet",
        "attack": 200
      }
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "17": {
    "name": "Telex Reporter",
    "text": "Cannot be destroyed while a field order is active.",
    "effects": [],
    "traits": {
      "fieldProtection": true
    },
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "18": {
    "name": "Memo Reporter",
    "text": "Once per turn: one of your officers gains 250 ATK.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 250
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Muhtira"
    ]
  },
  "19": {
    "name": "Annex Reporter",
    "text": "When summoned, Special Summon 1 Level 3 or lower officer from hand or deck.",
    "effects": [],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "unit",
            "selector": {
              "owner": "own",
              "zones": [
                "hand",
                "deck"
              ],
              "kind": "unit",
              "series": "Zeyil",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "summon",
            "count": 1
          }
        ]
      }
    ],
    "series": [
      "Zeyil"
    ]
  },
  "20": {
    "name": "Brief Reporter",
    "text": "Return an opposing officer to hand.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "bounce"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "21": {
    "name": "Cabinet Reporter",
    "text": "Send this to the archive; gain 750 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "cost"
      },
      {
        "op": "points",
        "amount": 750,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "22": {
    "name": "Archive Reporter",
    "text": "When summoned, gain 200 KP; you may shuffle.",
    "effects": [
      {
        "op": "shuffle"
      }
    ],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": 200,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Arsiv"
    ]
  },
  "23": {
    "name": "Dispatch Reporter",
    "text": "When Normal Summoned, add 1 Tebligat officer from deck to hand.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "card",
            "selector": {
              "owner": "own",
              "zones": "deck",
              "series": "Tebligat",
              "kind": "unit"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "shuffle"
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Tebligat"
    ]
  },
  "24": {
    "name": "Charter Deputy",
    "text": "When sent to the grave, Set 1 notice from your deck.",
    "effects": [],
    "traits": {
      "requiresFreeZone": "support"
    },
    "triggers": [
      {
        "event": "grave",
        "effects": [
          {
            "op": "select",
            "key": "trap",
            "selector": {
              "owner": "own",
              "zones": "deck",
              "kind": "trap"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "set"
          }
        ]
      }
    ],
    "series": [
      "Mesruiyet"
    ]
  },
  "25": {
    "name": "File Deputy",
    "text": "Cannot be destroyed in battle. Lose 200 KP during every Standby.",
    "effects": [],
    "traits": {
      "battleProtection": "always"
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -200,
            "opponent": false
          }
        ],
        "global": true
      }
    ],
    "series": [
      "Dosya"
    ]
  },
  "26": {
    "name": "Paraf Deputy",
    "text": "Whenever the opponent activates an order, gain 300 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "spell",
        "effects": [
          {
            "op": "points",
            "amount": 300,
            "opponent": false
          }
        ],
        "global": true,
        "opponent": true
      }
    ],
    "series": [
      "Paraf"
    ]
  },
  "27": {
    "name": "Panel Deputy",
    "text": "Your Quick-Play orders deal 400 additional KP damage.",
    "effects": [],
    "traits": {
      "quickDamage": 400
    },
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "28": {
    "name": "Command Deputy",
    "text": "When destroyed, gain 350 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "points",
            "amount": 350,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Karargah"
    ]
  },
  "29": {
    "name": "Telex Deputy",
    "text": "Add 1 order from the archive to your hand.",
    "effects": [
      {
        "op": "select",
        "key": "spell",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "kind": "spell"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "30": {
    "name": "Memo Deputy",
    "text": "Special Summon 1 Level 4 or lower officer from the archive.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Muhtira"
    ]
  },
  "31": {
    "name": "Annex Deputy",
    "text": "When destroyed, draw 1 card.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "draw",
            "count": 1,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Zeyil"
    ]
  },
  "32": {
    "name": "Brief Deputy",
    "text": "When flipped from Set, look at 1 opposing Set card.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "set",
            "selector": {
              "owner": "opponent",
              "zones": [
                "units",
                "support"
              ],
              "face": "down"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "reveal"
          }
        ]
      }
    ],
    "series": [
      "Brifing"
    ]
  },
  "33": {
    "name": "Cabinet Deputy",
    "text": "May attack directly, dealing half damage.",
    "effects": [],
    "traits": {
      "direct": true,
      "directMultiplier": 0.5
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "34": {
    "name": "Archive Deputy",
    "text": "Your face-down officers cannot be destroyed by effects until revealed.",
    "effects": [],
    "traits": {
      "protectOwnSetUnits": true
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "35": {
    "name": "Dispatch Deputy",
    "text": "Once per duel: banish this from grave to negate a Set notice.",
    "effects": [
      {
        "op": "selfMove",
        "to": "banished"
      },
      {
        "op": "negate"
      }
    ],
    "traits": {
      "responseFrom": "grave",
      "oncePerDuel": true,
      "responseKinds": [
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "36": {
    "name": "Charter Adviser",
    "text": "Gains 400 ATK while you control a Set notice.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "ownSetTrap",
        "attack": 400
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "37": {
    "name": "File Adviser",
    "text": "May attack directly.",
    "effects": [],
    "traits": {
      "direct": true
    },
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "38": {
    "name": "Paraf Adviser",
    "text": "Your officers gain 300 DEF.",
    "effects": [],
    "traits": {
      "aura": {
        "kind": "unit",
        "defense": 300
      }
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "39": {
    "name": "Panel Adviser",
    "text": "Gains 100 ATK for each officer you control.",
    "effects": [],
    "traits": {
      "countStats": {
        "count": "ownUnits",
        "attack": 100
      }
    },
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "40": {
    "name": "Command Adviser",
    "text": "When summoned, look at the top card; take it if it is a unit.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "look",
            "count": 1,
            "take": 1,
            "kind": "unit"
          }
        ]
      }
    ],
    "series": [
      "Karargah"
    ]
  },
  "41": {
    "name": "Telex Adviser",
    "text": "Your Telex officers gain 400 ATK and DEF.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Telex",
        "attack": 400,
        "defense": 400
      }
    },
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "42": {
    "name": "Memo Adviser",
    "text": "Grants 1 extra Normal Summon each turn, only for Level 3 or lower.",
    "effects": [],
    "traits": {
      "extraNormalMaxLevel": 3
    },
    "triggers": [],
    "series": [
      "Muhtira"
    ]
  },
  "43": {
    "name": "Annex Adviser",
    "text": "Tribute this card to Special Summon 1 Level 3 or lower officer from deck.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "deck"
          ],
          "kind": "unit",
          "series": "Zeyil",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Zeyil"
    ]
  },
  "44": {
    "name": "Brief Adviser",
    "text": "Once per turn: negate 1 notice for this turn.",
    "effects": [
      {
        "op": "select",
        "key": "trap",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "kind": "trap"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "negated": true
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "45": {
    "name": "Cabinet Adviser",
    "text": "When summoned, send 1 card from your deck to the archive.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "mill",
            "selector": {
              "owner": "own",
              "zones": "deck"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "grave",
            "count": 1,
            "reason": "effect"
          }
        ]
      }
    ],
    "series": [
      "Kabine"
    ]
  },
  "46": {
    "name": "Archive Adviser",
    "text": "When summoned, the opponent loses 300 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": -300,
            "opponent": true
          }
        ]
      }
    ],
    "series": [
      "Arsiv"
    ]
  },
  "47": {
    "name": "Dispatch Adviser",
    "text": "When destroyed, banish 1 card from the opposing archive.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "banish",
            "selector": {
              "owner": "opponent",
              "zones": "grave"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "banished",
            "count": 1,
            "reason": "effect"
          }
        ]
      }
    ],
    "series": [
      "Tebligat"
    ]
  },
  "48": {
    "name": "Charter Courier",
    "text": "When summoned, draw 1 card.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "draw",
            "count": 1,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Mesruiyet"
    ]
  },
  "49": {
    "name": "File Courier",
    "text": "When tributed, gain 300 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "tribute",
        "effects": [
          {
            "op": "points",
            "amount": 300,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Dosya"
    ]
  },
  "50": {
    "name": "Paraf Courier",
    "text": "While defending, cannot be attacked; if no other target, direct is allowed.",
    "effects": [],
    "traits": {
      "untargetableDefense": true,
      "allowDirectWhenOnlyDefenders": true
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "51": {
    "name": "Panel Courier",
    "text": "When attacking an equal-level officer, deal 300 extra damage.",
    "effects": [],
    "traits": {
      "sameLevelDamage": 300
    },
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "52": {
    "name": "Command Courier",
    "text": "When summoned, look at the top 3; take 1 and return the rest in order.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "look",
            "count": 3,
            "take": 1
          }
        ]
      }
    ],
    "series": [
      "Karargah"
    ]
  },
  "53": {
    "name": "Telex Courier",
    "text": "Create a 0/1000 Paper Seal token.",
    "effects": [
      {
        "op": "token",
        "count": 1,
        "attack": 0,
        "defense": 1000,
        "tr": "Kağıt Mühür",
        "en": "Paper Seal"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "54": {
    "name": "Memo Courier",
    "text": "During Standby, draw 1 (continuous).",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "draw",
            "count": 1,
            "opponent": false
          }
        ],
        "global": true
      }
    ],
    "series": [
      "Muhtira"
    ]
  },
  "55": {
    "name": "Annex Courier",
    "text": "When flipped from Set, draw 2 cards.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "draw",
            "count": 2,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Zeyil"
    ]
  },
  "56": {
    "name": "Brief Courier",
    "text": "When summoned, gain 100 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": 100,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Brifing"
    ]
  },
  "57": {
    "name": "Cabinet Courier",
    "text": "When summoned, the opponent discards 1 card.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "discard",
            "selector": {
              "owner": "opponent",
              "zones": "hand"
            },
            "count": 1,
            "chooser": "opponent"
          },
          {
            "op": "discard",
            "count": 1,
            "opponent": true,
            "random": false
          }
        ]
      }
    ],
    "series": [
      "Kabine"
    ]
  },
  "58": {
    "name": "Archive Courier",
    "text": "Gains 200 ATK for each opposing Set card.",
    "effects": [],
    "traits": {
      "countStats": {
        "count": "enemySet",
        "attack": 200
      }
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "59": {
    "name": "Dispatch Courier",
    "text": "Cannot be destroyed while a field order is active.",
    "effects": [],
    "traits": {
      "fieldProtection": true
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "60": {
    "name": "Charter Archivist",
    "text": "Once per turn: one of your officers gains 350 ATK.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 350
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "61": {
    "name": "File Archivist",
    "text": "When summoned, Special Summon 1 Level 3 or lower officer from hand or deck.",
    "effects": [],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "unit",
            "selector": {
              "owner": "own",
              "zones": [
                "hand",
                "deck"
              ],
              "kind": "unit",
              "series": "Dosya",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "summon",
            "count": 1
          }
        ]
      }
    ],
    "series": [
      "Dosya"
    ]
  },
  "62": {
    "name": "Paraf Archivist",
    "text": "Return an opposing officer to hand.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "bounce"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "63": {
    "name": "Panel Archivist",
    "text": "Send this to the archive; gain 850 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "cost"
      },
      {
        "op": "points",
        "amount": 850,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "64": {
    "name": "Command Archivist",
    "text": "When summoned, gain 200 KP; you may shuffle.",
    "effects": [
      {
        "op": "shuffle"
      }
    ],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": 200,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Karargah"
    ]
  },
  "65": {
    "name": "Telex Archivist",
    "text": "When Normal Summoned, add 1 Telex officer from deck to hand.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "card",
            "selector": {
              "owner": "own",
              "zones": "deck",
              "series": "Telex",
              "kind": "unit"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "shuffle"
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Telex"
    ]
  },
  "66": {
    "name": "Memo Archivist",
    "text": "When sent to the grave, Set 1 notice from your deck.",
    "effects": [],
    "traits": {
      "requiresFreeZone": "support"
    },
    "triggers": [
      {
        "event": "grave",
        "effects": [
          {
            "op": "select",
            "key": "trap",
            "selector": {
              "owner": "own",
              "zones": "deck",
              "kind": "trap"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "set"
          }
        ]
      }
    ],
    "series": [
      "Muhtira"
    ]
  },
  "67": {
    "name": "Annex Archivist",
    "text": "Cannot be destroyed in battle. Lose 200 KP during every Standby.",
    "effects": [],
    "traits": {
      "battleProtection": "always"
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -200,
            "opponent": false
          }
        ],
        "global": true
      }
    ],
    "series": [
      "Zeyil"
    ]
  },
  "68": {
    "name": "File Reserve",
    "text": "Reserve panel: 1 File and 1 Paraf officer as materials. Once per turn: pay 1000 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -1000,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Dosya",
          "Paraf"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Dosya",
      "Paraf"
    ]
  },
  "69": {
    "name": "Panel Reserve",
    "text": "Reserve panel: 1 Panel and 1 Command officer as materials. Once per turn: pay 1100 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -1100,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Heyet",
          "Karargah"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Heyet",
      "Karargah"
    ]
  },
  "70": {
    "name": "Telex Reserve",
    "text": "Reserve panel: 1 Telex and 1 Memo officer as materials. Once per turn: pay 700 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -700,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Telex",
          "Muhtira"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Telex",
      "Muhtira"
    ]
  },
  "71": {
    "name": "Annex Reserve",
    "text": "Reserve panel: 1 Annex and 1 Brief officer as materials. Once per turn: pay 800 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -800,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Zeyil",
          "Brifing"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Zeyil",
      "Brifing"
    ]
  },
  "72": {
    "name": "Cabinet Reserve",
    "text": "Reserve panel: 1 Cabinet and 1 Archive officer as materials. Once per turn: pay 900 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -900,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Kabine",
          "Arsiv"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Kabine",
      "Arsiv"
    ]
  },
  "73": {
    "name": "Writ Reserve",
    "text": "Reserve panel: 1 Dispatch and 1 Charter officer as materials. Once per turn: pay 1000 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -1000,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Tebligat",
          "Mesruiyet"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Tebligat",
      "Mesruiyet"
    ]
  },
  "74": {
    "name": "Brief Setter",
    "text": "When flipped from Set, look at 1 opposing Set card.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "set",
            "selector": {
              "owner": "opponent",
              "zones": [
                "units",
                "support"
              ],
              "face": "down"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "reveal"
          }
        ]
      }
    ],
    "series": [
      "Brifing"
    ]
  },
  "75": {
    "name": "Cabinet Setter",
    "text": "May attack directly, dealing half damage.",
    "effects": [],
    "traits": {
      "direct": true,
      "directMultiplier": 0.5
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "76": {
    "name": "Archive Setter",
    "text": "Your face-down officers cannot be destroyed by effects until revealed.",
    "effects": [],
    "traits": {
      "protectOwnSetUnits": true
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "77": {
    "name": "Dispatch Setter",
    "text": "Once per duel: banish this from grave to negate a Set notice.",
    "effects": [
      {
        "op": "selfMove",
        "to": "banished"
      },
      {
        "op": "negate"
      }
    ],
    "traits": {
      "responseFrom": "grave",
      "oncePerDuel": true,
      "responseKinds": [
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "78": {
    "name": "Charter Setter",
    "text": "Gains 400 ATK while you control a Set notice.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "ownSetTrap",
        "attack": 400
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "79": {
    "name": "File Setter",
    "text": "May attack directly.",
    "effects": [],
    "traits": {
      "direct": true
    },
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "80": {
    "name": "Paraf Setter",
    "text": "Your officers gain 300 DEF.",
    "effects": [],
    "traits": {
      "aura": {
        "kind": "unit",
        "defense": 300
      }
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "81": {
    "name": "Open Dispatch",
    "text": "Gain 900 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 900,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "82": {
    "name": "Night Briefing",
    "text": "Negate the declared action.",
    "effects": [
      {
        "op": "negate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "83": {
    "name": "Signed Order",
    "text": "The opponent discards 1 card at random.",
    "effects": [
      {
        "op": "discard",
        "count": 1,
        "opponent": true,
        "random": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "84": {
    "name": "Addendum Sentence",
    "text": "Field: Karargah officers gain 300/300.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Karargah",
        "attack": 300,
        "defense": 300
      }
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "85": {
    "name": "Archive Call",
    "text": "Add 1 officer from the archive to your hand.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "86": {
    "name": "Panel Sitting",
    "text": "The equipped officer gains 500 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "attack": 500
      }
    },
    "triggers": [],
    "series": [
      "Muhtira"
    ]
  },
  "87": {
    "name": "Cabinet Note",
    "text": "Add 1 Zeyil officer from deck to hand.",
    "effects": [
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "kind": "unit",
          "series": "Zeyil"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "shuffle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Zeyil"
    ]
  },
  "88": {
    "name": "Telex Flow",
    "text": "Draw 1; if it is a notice, Set it.",
    "effects": [
      {
        "op": "drawSetTrap"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "89": {
    "name": "Redaction Line",
    "text": "Draw 2 cards.",
    "effects": [
      {
        "op": "draw",
        "count": 2,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "90": {
    "name": "Charter Clause",
    "text": "Special Summon 1 Level 4 or lower officer from deck.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "deck"
          ],
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "91": {
    "name": "File Transfer",
    "text": "Send 1 from deck to archive; draw 1.",
    "effects": [
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "grave",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "draw",
        "count": 1,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "92": {
    "name": "Consult Round",
    "text": "One of your officers gains 800 ATK this turn.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 800
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "93": {
    "name": "Stamp Drop",
    "text": "Move 1 banished officer to the archive.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "grave",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "94": {
    "name": "Memo Slip",
    "text": "Destroy an opposing order.",
    "effects": [
      {
        "op": "select",
        "key": "spell",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "kind": "spell"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "95": {
    "name": "Dist List",
    "text": "Pay 600 KP; draw 2.",
    "effects": [
      {
        "op": "points",
        "amount": -600,
        "opponent": false
      },
      {
        "op": "draw",
        "count": 2,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "96": {
    "name": "Cover Letter",
    "text": "Look at the top 3; take 2.",
    "effects": [
      {
        "op": "look",
        "count": 3,
        "take": 2
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "97": {
    "name": "Annex Table",
    "text": "Your officers gain 200 ATK.",
    "effects": [],
    "traits": {
      "aura": {
        "kind": "unit",
        "attack": 200
      }
    },
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "98": {
    "name": "Agenda Item",
    "text": "Destroy an opposing officer.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Muhtira"
    ]
  },
  "99": {
    "name": "Short Ruling",
    "text": "Send an opposing officer to the archive.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "grave",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Zeyil"
    ]
  },
  "100": {
    "name": "Long Rationale",
    "text": "The opponent loses 1000 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 1000,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "101": {
    "name": "Sign Queue",
    "text": "Set 1 notice from your deck.",
    "effects": [
      {
        "op": "select",
        "key": "trap",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "kind": "trap"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "set"
      }
    ],
    "traits": {
      "requiresFreeZone": "support"
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "102": {
    "name": "Referral Note",
    "text": "Draw 1; gain 300 KP.",
    "effects": [
      {
        "op": "draw",
        "count": 1,
        "opponent": false
      },
      {
        "op": "points",
        "amount": 300,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "103": {
    "name": "Dispatch Copy",
    "text": "There is no Crisis phase this turn.",
    "effects": [
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "104": {
    "name": "Reply Letter",
    "text": "The opponent cannot attack directly this turn.",
    "effects": [
      {
        "op": "flag",
        "name": "cannotDirect",
        "value": true,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "105": {
    "name": "Inner Circular",
    "text": "Gain 800 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 800,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "106": {
    "name": "Outer Letter",
    "text": "Negate the declared action.",
    "effects": [
      {
        "op": "negate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "107": {
    "name": "Record Fix",
    "text": "The opponent discards 1 card at random.",
    "effects": [
      {
        "op": "discard",
        "count": 1,
        "opponent": true,
        "random": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "108": {
    "name": "Page Number",
    "text": "Field: Karargah officers gain 300/300.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Karargah",
        "attack": 300,
        "defense": 300
      }
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "109": {
    "name": "Footnote Order",
    "text": "Add 1 officer from the archive to your hand.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "110": {
    "name": "Header Line",
    "text": "The equipped officer gains 500 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "attack": 500
      }
    },
    "triggers": [],
    "series": [
      "Muhtira"
    ]
  },
  "111": {
    "name": "Footer Line",
    "text": "Add 1 Zeyil officer from deck to hand.",
    "effects": [
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "kind": "unit",
          "series": "Zeyil"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "shuffle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Zeyil"
    ]
  },
  "112": {
    "name": "Dist Chart",
    "text": "Draw 1; if it is a notice, Set it.",
    "effects": [
      {
        "op": "drawSetTrap"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "113": {
    "name": "Visa Gloss",
    "text": "Draw 2 cards.",
    "effects": [
      {
        "op": "draw",
        "count": 2,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "114": {
    "name": "Initialled Copy",
    "text": "Special Summon 1 Level 4 or lower officer from deck.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "deck"
          ],
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "115": {
    "name": "Draft Text",
    "text": "Send 1 from deck to archive; draw 1.",
    "effects": [
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "grave",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "draw",
        "count": 1,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "116": {
    "name": "Final Text",
    "text": "One of your officers gains 800 ATK this turn.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 800
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "117": {
    "name": "Side Protocol",
    "text": "Move 1 banished officer to the archive.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "grave",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "118": {
    "name": "Interim Line",
    "text": "Destroy an opposing order.",
    "effects": [
      {
        "op": "select",
        "key": "spell",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "kind": "spell"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "119": {
    "name": "Closing Line",
    "text": "Pay 600 KP; draw 2.",
    "effects": [
      {
        "op": "points",
        "amount": -600,
        "opponent": false
      },
      {
        "op": "draw",
        "count": 2,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "120": {
    "name": "Withdraw Note",
    "text": "Look at the top 3; take 2.",
    "effects": [
      {
        "op": "look",
        "count": 3,
        "take": 2
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "121": {
    "name": "Rewrite Pass",
    "text": "Your officers gain 200 ATK.",
    "effects": [],
    "traits": {
      "aura": {
        "kind": "unit",
        "attack": 200
      }
    },
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "122": {
    "name": "Two Columns",
    "text": "Destroy an opposing officer.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Muhtira"
    ]
  },
  "123": {
    "name": "One Column",
    "text": "Send an opposing officer to the archive.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "grave",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Zeyil"
    ]
  },
  "124": {
    "name": "Red Band",
    "text": "The opponent loses 1000 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 1000,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "125": {
    "name": "Notice: Early Sign",
    "text": "Destroy an opposing support card.",
    "effects": [
      {
        "op": "select",
        "key": "spell",
        "selector": {
          "owner": "opponent",
          "zones": "support"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {
      "responseTypes": [
        "destroy"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "126": {
    "name": "Notice: Empty Paraf",
    "text": "Destroy the attacking or targeted officer.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {
      "responseTypes": [
        "destroy"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "127": {
    "name": "Notice: Wrong Copy",
    "text": "Cancel the summon; the card goes to the archive.",
    "effects": [
      {
        "op": "cancelSummonToGrave"
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "128": {
    "name": "Notice: Missed Dist",
    "text": "The opponent cannot activate orders this turn.",
    "effects": [
      {
        "op": "flag",
        "name": "noSpells",
        "value": true,
        "opponent": true
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "129": {
    "name": "Notice: Closed Archive",
    "text": "Return an opposing officer to hand.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "bounce"
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "130": {
    "name": "Notice: Open Band",
    "text": "Cancel the attack.",
    "effects": [
      {
        "op": "cancelAttack"
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "131": {
    "name": "Notice: Double Agenda",
    "text": "Destroy the source of the pending action.",
    "effects": [
      {
        "op": "pendingTarget"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {
      "responseTypes": [
        "battle-start"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "132": {
    "name": "Notice: Single Sign",
    "text": "Skip the Crisis phase.",
    "effects": [
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "responseTypes": [
        "battle-start"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "133": {
    "name": "Notice: Late Briefing",
    "text": "Draw 2 cards.",
    "effects": [
      {
        "op": "draw",
        "count": 2,
        "opponent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "battle-start"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "134": {
    "name": "Notice: Quiet Panel",
    "text": "Gain 500 KP and draw 1.",
    "effects": [
      {
        "op": "points",
        "amount": 500,
        "opponent": false
      },
      {
        "op": "draw",
        "count": 1,
        "opponent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "summon"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "135": {
    "name": "Notice: Loud Desk",
    "text": "The opponent discards 1 card.",
    "effects": [
      {
        "op": "discard",
        "count": 1,
        "opponent": true,
        "random": false
      }
    ],
    "traits": {
      "responseTypes": [
        "summon"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "136": {
    "name": "Notice: Red Gloss",
    "text": "Negate the opponent's response.",
    "effects": [
      {
        "op": "negateResponse"
      }
    ],
    "traits": {
      "responseTypes": [
        "summon"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "137": {
    "name": "Notice: Yellow Gloss",
    "text": "Negate a targeted effect, or protect one destruction.",
    "effects": [
      {
        "op": "targetOrBattleNegate"
      }
    ],
    "traits": {
      "responseTypes": [
        "summon"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "138": {
    "name": "Notice: No Annex",
    "text": "One of your officers cannot be destroyed in this battle once.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "protectBattleOnce": true
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "139": {
    "name": "Notice: Extra Annex",
    "text": "Special Summon 1 Level 4 or lower officer from the archive.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      }
    ],
    "traits": {
      "requiresFreeZone": "units",
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "140": {
    "name": "Notice: Broken Telex",
    "text": "The opponent loses 700 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 700,
        "opponent": true
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "141": {
    "name": "Notice: Dispatch Back",
    "text": "Negate the declared effect.",
    "effects": [
      {
        "op": "negate"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "142": {
    "name": "Notice: Charter Doubt",
    "text": "When the opponent summons an officer, gain 200 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "kind": "trap"
      },
      "responseTypes": [
        "destroy"
      ]
    },
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": 200,
            "opponent": false
          }
        ],
        "opponent": true,
        "global": true
      }
    ],
    "series": [
      "İhtar"
    ]
  },
  "143": {
    "name": "Notice: File Drift",
    "text": "Destroy an opposing support card.",
    "effects": [
      {
        "op": "select",
        "key": "spell",
        "selector": {
          "owner": "opponent",
          "zones": "support"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {
      "responseTypes": [
        "destroy"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "144": {
    "name": "Notice: Queue Drift",
    "text": "Destroy the attacking or targeted officer.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {
      "responseTypes": [
        "destroy"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "145": {
    "name": "Notice: Visa Refused",
    "text": "Cancel the summon; the card goes to the archive.",
    "effects": [
      {
        "op": "cancelSummonToGrave"
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "146": {
    "name": "Notice: Referral Back",
    "text": "The opponent cannot activate orders this turn.",
    "effects": [
      {
        "op": "flag",
        "name": "noSpells",
        "value": true,
        "opponent": true
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "147": {
    "name": "Notice: Footnote Fails",
    "text": "Return an opposing officer to hand.",
    "effects": [
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "opponent",
          "zones": "units"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "bounce"
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "148": {
    "name": "Notice: Cover Fails",
    "text": "Cancel the attack.",
    "effects": [
      {
        "op": "cancelAttack"
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "149": {
    "name": "Notice: Dist Error",
    "text": "Destroy the source of the pending action.",
    "effects": [
      {
        "op": "pendingTarget"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {
      "responseTypes": [
        "battle-start"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "150": {
    "name": "Notice: Record Fails",
    "text": "Skip the Crisis phase.",
    "effects": [
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "responseTypes": [
        "battle-start"
      ]
    },
    "triggers": [],
    "series": [
      "İhtar"
    ]
  },
  "151": {
    "name": "Indexer",
    "text": "When Normal Summoned, return 1 Level 2 or lower File officer from your archive to your hand, then gain 250 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Dosya",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 250,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "152": {
    "name": "Folder Hand",
    "text": "Once per turn: pay 300 KP; return 1 File officer from your archive to your hand. Skip Crisis this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -300,
        "opponent": false
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Dosya",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "153": {
    "name": "Punch Hand",
    "text": "Gains 400 DEF while you control another File officer. When flipped, look at 1 opposing face-down support card.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "otherSeries",
        "series": "Dosya",
        "defense": 400
      }
    },
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "look",
            "selector": {
              "owner": "opponent",
              "zones": "support",
              "face": "down"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "reveal"
          }
        ]
      }
    ],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "154": {
    "name": "Papers Hand",
    "text": "File officers on the field gain 150 ATK. During your Standby Phase, lose 200 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Dosya",
        "attack": 150
      }
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -200,
            "opponent": false
          }
        ],
        "global": true,
        "own": true
      }
    ],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "155": {
    "name": "Binder",
    "text": "Once per turn: pay 300 KP; give another File officer 400 ATK this turn; this card gains 200 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -300,
        "opponent": false
      },
      {
        "op": "select",
        "key": "partner",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Dosya",
          "excludeSource": true
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 400
        },
        "permanent": false
      },
      {
        "op": "modifier",
        "self": true,
        "value": {
          "defense": 200
        }
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "156": {
    "name": "Ruler Hand",
    "text": "Tribute this card: banish 1 Level 2 or lower officer from the opposing archive, then the opponent loses 350 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "points",
        "amount": -350,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "157": {
    "name": "File Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower File officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Dosya",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "158": {
    "name": "Stamp Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Paraf officer from your archive to your hand, then gain 275 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Paraf",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 275,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "159": {
    "name": "Visa Hand",
    "text": "Once per turn: pay 350 KP; return 1 banished Level 4 or lower Paraf officer to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -350,
        "opponent": false
      },
      {
        "op": "select",
        "key": "rescue",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "series": "Paraf",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "160": {
    "name": "Copyist",
    "text": "Gains 600 DEF while your points are below 3100. When flipped, change 1 Paraf officer to defense.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "pointsBelow",
        "threshold": 3100,
        "defense": 600
      }
    },
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "shelter",
            "selector": {
              "owner": "own",
              "zones": "units",
              "series": "Paraf"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "position",
            "position": "defense"
          }
        ]
      }
    ],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "161": {
    "name": "Paraf Queue",
    "text": "Level 3 or lower Paraf officers on the field gain 400 DEF. During your Standby Phase, lose 225 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Paraf",
        "maxLevel": 3,
        "defense": 400
      }
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -225,
            "opponent": false
          }
        ],
        "global": true,
        "own": true
      }
    ],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "162": {
    "name": "Paraf Hand",
    "text": "Tribute this card: Special Summon 1 Level 3 or lower Paraf officer from your archive; skip Crisis this turn.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "grave"
          ],
          "kind": "unit",
          "series": "Paraf",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "163": {
    "name": "Stamp Master",
    "text": "Once per turn: pay 600 KP; return 1 opposing face-up support card to its owner's hand. You must control a Paraf officer.",
    "effects": [
      {
        "op": "points",
        "amount": -600,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "requiresSeries": "Paraf"
    },
    "triggers": [],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "164": {
    "name": "Paraf Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Paraf officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Paraf",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "165": {
    "name": "Minutes Hand",
    "text": "When Normal Summoned, return 1 Level 2 or lower Panel officer from your archive to your hand, then gain 300 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Heyet",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 300,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "166": {
    "name": "Session Hand",
    "text": "Once per turn: pay 400 KP; look at 1 opposing face-down card, then give 1 Panel officer 400 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -400,
        "opponent": false
      },
      {
        "op": "select",
        "key": "peek",
        "selector": {
          "owner": "opponent",
          "zones": [
            "units",
            "support"
          ],
          "face": "down"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "reveal"
      },
      {
        "op": "select",
        "key": "guard",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Heyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 400
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "167": {
    "name": "Roll Hand",
    "text": "Gains 500 ATK while you control another Panel officer. When tributed, gain 500 KP.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "otherSeries",
        "series": "Heyet",
        "attack": 500
      }
    },
    "triggers": [
      {
        "event": "tribute",
        "effects": [
          {
            "op": "points",
            "amount": 500,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "168": {
    "name": "Panel Junior",
    "text": "Gains 400 ATK while you control a Set notice. Once per turn: pay 400 KP; give 1 Panel officer 500 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -400,
        "opponent": false
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Heyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 500
        },
        "permanent": false
      }
    ],
    "traits": {
      "conditionalStats": {
        "condition": "ownSetTrap",
        "attack": 400
      }
    },
    "triggers": [],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "169": {
    "name": "Ruling Hand",
    "text": "Tribute this card: return 1 banished Panel officer to your hand, then gain 300 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "rescue",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "series": "Heyet",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "points",
        "amount": 300,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "170": {
    "name": "Voice Keeper",
    "text": "Once per turn: pay 650 KP; banish 1 Level 4 or lower officer from the opposing archive, then give 1 Panel officer 200 ATK this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -650,
        "opponent": false
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "ally",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Heyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 200
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "171": {
    "name": "Panel Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Panel officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Heyet",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "172": {
    "name": "Duty Hand",
    "text": "When Normal Summoned, return 1 Level 2 or lower Command officer from your archive to your hand, then gain 325 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Karargah",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 325,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "173": {
    "name": "Map Hand",
    "text": "Once per turn: pay 450 KP; return 1 Command officer from your archive to your hand. Skip Crisis this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -450,
        "opponent": false
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Karargah",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "174": {
    "name": "Desk Hand",
    "text": "Gains 400 DEF while you control another Command officer. When flipped, look at 1 opposing face-down support card.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "otherSeries",
        "series": "Karargah",
        "defense": 400
      }
    },
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "look",
            "selector": {
              "owner": "opponent",
              "zones": "support",
              "face": "down"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "reveal"
          }
        ]
      }
    ],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "175": {
    "name": "Routing Hand",
    "text": "Command officers on the field gain 150 ATK. During your Standby Phase, lose 275 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Karargah",
        "attack": 150
      }
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -275,
            "opponent": false
          }
        ],
        "global": true,
        "own": true
      }
    ],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "176": {
    "name": "Plan Hand",
    "text": "Once per turn: pay 450 KP; give another Command officer 475 ATK this turn; this card gains 200 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -450,
        "opponent": false
      },
      {
        "op": "select",
        "key": "partner",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Karargah",
          "excludeSource": true
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 475
        },
        "permanent": false
      },
      {
        "op": "modifier",
        "self": true,
        "value": {
          "defense": 200
        }
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "177": {
    "name": "Desk Junior",
    "text": "Tribute this card: banish 1 Level 2 or lower officer from the opposing archive, then the opponent loses 425 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "points",
        "amount": -425,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "178": {
    "name": "Command Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Command officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Karargah",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "179": {
    "name": "Telex Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Telex officer from your archive to your hand, then gain 350 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Telex",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 350,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "180": {
    "name": "Ribbon Hand",
    "text": "Once per turn: pay 500 KP; return 1 banished Level 4 or lower Telex officer to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -500,
        "opponent": false
      },
      {
        "op": "select",
        "key": "rescue",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "series": "Telex",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "181": {
    "name": "Line Hand",
    "text": "Gains 600 DEF while your points are below 3400. When flipped, change 1 Telex officer to defense.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "pointsBelow",
        "threshold": 3400,
        "defense": 600
      }
    },
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "shelter",
            "selector": {
              "owner": "own",
              "zones": "units",
              "series": "Telex"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "position",
            "position": "defense"
          }
        ]
      }
    ],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "182": {
    "name": "Window Hand",
    "text": "Level 3 or lower Telex officers on the field gain 400 DEF. During your Standby Phase, lose 300 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Telex",
        "maxLevel": 3,
        "defense": 400
      }
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -300,
            "opponent": false
          }
        ],
        "global": true,
        "own": true
      }
    ],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "183": {
    "name": "Wire Hand",
    "text": "Tribute this card: Special Summon 1 Level 3 or lower Telex officer from your archive; skip Crisis this turn.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "grave"
          ],
          "kind": "unit",
          "series": "Telex",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "184": {
    "name": "Telex Master",
    "text": "Once per turn: pay 750 KP; return 1 opposing face-up support card to its owner's hand. You must control a Telex officer.",
    "effects": [
      {
        "op": "points",
        "amount": -750,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "requiresSeries": "Telex"
    },
    "triggers": [],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "185": {
    "name": "Telex Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Telex officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Telex",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "186": {
    "name": "Note Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Memo officer from your archive to your hand, then gain 375 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Muhtira",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 375,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "187": {
    "name": "Slip Hand",
    "text": "Once per turn: pay 550 KP; look at 1 opposing face-down card, then give 1 Memo officer 400 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -550,
        "opponent": false
      },
      {
        "op": "select",
        "key": "peek",
        "selector": {
          "owner": "opponent",
          "zones": [
            "units",
            "support"
          ],
          "face": "down"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "reveal"
      },
      {
        "op": "select",
        "key": "guard",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Muhtira"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 400
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "188": {
    "name": "Draft Hand",
    "text": "Gains 500 ATK while you control another Memo officer. When tributed, gain 650 KP.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "otherSeries",
        "series": "Muhtira",
        "attack": 500
      }
    },
    "triggers": [
      {
        "event": "tribute",
        "effects": [
          {
            "op": "points",
            "amount": 650,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "189": {
    "name": "Line Master",
    "text": "Gains 400 ATK while you control a Set notice. Once per turn: pay 550 KP; give 1 Memo officer 500 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -550,
        "opponent": false
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Muhtira"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 500
        },
        "permanent": false
      }
    ],
    "traits": {
      "conditionalStats": {
        "condition": "ownSetTrap",
        "attack": 400
      }
    },
    "triggers": [],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "190": {
    "name": "Memo Hand",
    "text": "Tribute this card: return 1 banished Memo officer to your hand, then gain 300 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "rescue",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "series": "Muhtira",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "points",
        "amount": 300,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "191": {
    "name": "Reason Hand",
    "text": "Once per turn: pay 800 KP; banish 1 Level 4 or lower officer from the opposing archive, then give 1 Memo officer 200 ATK this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -800,
        "opponent": false
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "ally",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Muhtira"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 200
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "192": {
    "name": "Memo Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Memo officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Muhtira",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "193": {
    "name": "Annex Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Annex officer from your archive to your hand, then gain 400 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Zeyil",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 400,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "194": {
    "name": "Note Hand",
    "text": "Once per turn: pay 600 KP; return 1 Annex officer from your archive to your hand. Skip Crisis this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -600,
        "opponent": false
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Zeyil",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "195": {
    "name": "Annex Hand",
    "text": "Gains 400 DEF while you control another Annex officer. When flipped, look at 1 opposing face-down support card.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "otherSeries",
        "series": "Zeyil",
        "defense": 400
      }
    },
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "look",
            "selector": {
              "owner": "opponent",
              "zones": "support",
              "face": "down"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "reveal"
          }
        ]
      }
    ],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "196": {
    "name": "Clause Hand",
    "text": "Annex officers on the field gain 150 ATK. During your Standby Phase, lose 350 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Zeyil",
        "attack": 150
      }
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -350,
            "opponent": false
          }
        ],
        "global": true,
        "own": true
      }
    ],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "197": {
    "name": "Annex Tally",
    "text": "Once per turn: pay 600 KP; give another Annex officer 550 ATK this turn; this card gains 200 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -600,
        "opponent": false
      },
      {
        "op": "select",
        "key": "partner",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Zeyil",
          "excludeSource": true
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 550
        },
        "permanent": false
      },
      {
        "op": "modifier",
        "self": true,
        "value": {
          "defense": 200
        }
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "198": {
    "name": "Annex Master",
    "text": "Tribute this card: banish 1 Level 2 or lower officer from the opposing archive, then the opponent loses 500 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "points",
        "amount": -500,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "199": {
    "name": "Annex Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Annex officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Zeyil",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "200": {
    "name": "Agenda Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Brief officer from your archive to your hand, then gain 425 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Brifing",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 425,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "201": {
    "name": "Brief Hand",
    "text": "Once per turn: pay 650 KP; return 1 banished Level 4 or lower Brief officer to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -650,
        "opponent": false
      },
      {
        "op": "select",
        "key": "rescue",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "series": "Brifing",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "202": {
    "name": "Note Keeper",
    "text": "Gains 600 DEF while your points are below 3700. When flipped, change 1 Brief officer to defense.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "pointsBelow",
        "threshold": 3700,
        "defense": 600
      }
    },
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "shelter",
            "selector": {
              "owner": "own",
              "zones": "units",
              "series": "Brifing"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "position",
            "position": "defense"
          }
        ]
      }
    ],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "203": {
    "name": "Query Hand",
    "text": "Level 3 or lower Brief officers on the field gain 400 DEF. During your Standby Phase, lose 375 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Brifing",
        "maxLevel": 3,
        "defense": 400
      }
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -375,
            "opponent": false
          }
        ],
        "global": true,
        "own": true
      }
    ],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "204": {
    "name": "Brief Master",
    "text": "Tribute this card: Special Summon 1 Level 3 or lower Brief officer from your archive; skip Crisis this turn.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "grave"
          ],
          "kind": "unit",
          "series": "Brifing",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "205": {
    "name": "Session Voice",
    "text": "Once per turn: pay 900 KP; return 1 opposing face-up support card to its owner's hand. You must control a Brief officer.",
    "effects": [
      {
        "op": "points",
        "amount": -900,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "requiresSeries": "Brifing"
    },
    "triggers": [],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "206": {
    "name": "Brief Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Brief officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Brifing",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "207": {
    "name": "Cabinet Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Cabinet officer from your archive to your hand, then gain 450 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Kabine",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 450,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "208": {
    "name": "Decree Hand",
    "text": "Once per turn: pay 700 KP; look at 1 opposing face-down card, then give 1 Cabinet officer 400 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -700,
        "opponent": false
      },
      {
        "op": "select",
        "key": "peek",
        "selector": {
          "owner": "opponent",
          "zones": [
            "units",
            "support"
          ],
          "face": "down"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "reveal"
      },
      {
        "op": "select",
        "key": "guard",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Kabine"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 400
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "209": {
    "name": "Protocol Hand",
    "text": "Gains 500 ATK while you control another Cabinet officer. When tributed, gain 800 KP.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "otherSeries",
        "series": "Kabine",
        "attack": 500
      }
    },
    "triggers": [
      {
        "event": "tribute",
        "effects": [
          {
            "op": "points",
            "amount": 800,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "210": {
    "name": "Table Voice",
    "text": "Gains 400 ATK while you control a Set notice. Once per turn: pay 700 KP; give 1 Cabinet officer 500 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -700,
        "opponent": false
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Kabine"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 500
        },
        "permanent": false
      }
    ],
    "traits": {
      "conditionalStats": {
        "condition": "ownSetTrap",
        "attack": 400
      }
    },
    "triggers": [],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "211": {
    "name": "Agenda Hand",
    "text": "Tribute this card: return 1 banished Cabinet officer to your hand, then gain 300 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "rescue",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "series": "Kabine",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "points",
        "amount": 300,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "212": {
    "name": "Cabinet Master",
    "text": "Once per turn: pay 950 KP; banish 1 Level 4 or lower officer from the opposing archive, then give 1 Cabinet officer 200 ATK this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -950,
        "opponent": false
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "ally",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Kabine"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 200
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "213": {
    "name": "Cabinet Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Cabinet officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Kabine",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "214": {
    "name": "Slip Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Archive officer from your archive to your hand, then gain 475 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Arsiv",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 475,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "215": {
    "name": "Shelf Hand",
    "text": "Once per turn: pay 750 KP; return 1 Archive officer from your archive to your hand. Skip Crisis this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -750,
        "opponent": false
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Arsiv",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "216": {
    "name": "Record Hand",
    "text": "Gains 400 DEF while you control another Archive officer. When flipped, look at 1 opposing face-down support card.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "otherSeries",
        "series": "Arsiv",
        "defense": 400
      }
    },
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "look",
            "selector": {
              "owner": "opponent",
              "zones": "support",
              "face": "down"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "reveal"
          }
        ]
      }
    ],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "217": {
    "name": "Archive Junior",
    "text": "Archive officers on the field gain 150 ATK. During your Standby Phase, lose 425 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Arsiv",
        "attack": 150
      }
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -425,
            "opponent": false
          }
        ],
        "global": true,
        "own": true
      }
    ],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "218": {
    "name": "Folder Master",
    "text": "Once per turn: pay 750 KP; give another Archive officer 625 ATK this turn; this card gains 200 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -750,
        "opponent": false
      },
      {
        "op": "select",
        "key": "partner",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Arsiv",
          "excludeSource": true
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 625
        },
        "permanent": false
      },
      {
        "op": "modifier",
        "self": true,
        "value": {
          "defense": 200
        }
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "219": {
    "name": "Shelf Master",
    "text": "Tribute this card: banish 1 Level 2 or lower officer from the opposing archive, then the opponent loses 575 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "points",
        "amount": -575,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "220": {
    "name": "Archive Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Archive officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Arsiv",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "221": {
    "name": "Dist Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Dispatch officer from your archive to your hand, then gain 500 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Tebligat",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 500,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "222": {
    "name": "Copy Hand",
    "text": "Once per turn: pay 800 KP; return 1 banished Level 4 or lower Dispatch officer to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -800,
        "opponent": false
      },
      {
        "op": "select",
        "key": "rescue",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "series": "Tebligat",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "223": {
    "name": "Writ Hand",
    "text": "Gains 600 DEF while your points are below 4000. When flipped, change 1 Dispatch officer to defense.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "pointsBelow",
        "threshold": 4000,
        "defense": 600
      }
    },
    "triggers": [
      {
        "event": "flip",
        "effects": [
          {
            "op": "select",
            "key": "shelter",
            "selector": {
              "owner": "own",
              "zones": "units",
              "series": "Tebligat"
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "position",
            "position": "defense"
          }
        ]
      }
    ],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "224": {
    "name": "Runner Hand",
    "text": "Level 3 or lower Dispatch officers on the field gain 400 DEF. During your Standby Phase, lose 450 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Tebligat",
        "maxLevel": 3,
        "defense": 400
      }
    },
    "triggers": [
      {
        "event": "standby",
        "effects": [
          {
            "op": "points",
            "amount": -450,
            "opponent": false
          }
        ],
        "global": true,
        "own": true
      }
    ],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "225": {
    "name": "Return Hand",
    "text": "Tribute this card: Special Summon 1 Level 3 or lower Dispatch officer from your archive; skip Crisis this turn.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "grave"
          ],
          "kind": "unit",
          "series": "Tebligat",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "226": {
    "name": "Dispatch Master",
    "text": "Once per turn: pay 1050 KP; return 1 opposing face-up support card to its owner's hand. You must control a Dispatch officer.",
    "effects": [
      {
        "op": "points",
        "amount": -1050,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "requiresSeries": "Tebligat"
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "227": {
    "name": "Dispatch Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Dispatch officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Tebligat",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "228": {
    "name": "Gloss Junior",
    "text": "When Normal Summoned, return 1 Level 2 or lower Charter officer from your archive to your hand, then gain 525 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "select",
            "key": "return",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "kind": "unit",
              "series": "Mesruiyet",
              "maxLevel": 2
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          },
          {
            "op": "points",
            "amount": 525,
            "opponent": false
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "229": {
    "name": "Form Hand",
    "text": "Once per turn: pay 850 KP; look at 1 opposing face-down card, then give 1 Charter officer 400 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -850,
        "opponent": false
      },
      {
        "op": "select",
        "key": "peek",
        "selector": {
          "owner": "opponent",
          "zones": [
            "units",
            "support"
          ],
          "face": "down"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "reveal"
      },
      {
        "op": "select",
        "key": "guard",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Mesruiyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 400
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "230": {
    "name": "Grounds Hand",
    "text": "Gains 500 ATK while you control another Charter officer. When tributed, gain 950 KP.",
    "effects": [],
    "traits": {
      "conditionalStats": {
        "condition": "otherSeries",
        "series": "Mesruiyet",
        "attack": 500
      }
    },
    "triggers": [
      {
        "event": "tribute",
        "effects": [
          {
            "op": "points",
            "amount": 950,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "231": {
    "name": "Charter Junior",
    "text": "Gains 400 ATK while you control a Set notice. Once per turn: pay 850 KP; give 1 Charter officer 500 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -850,
        "opponent": false
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Mesruiyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 500
        },
        "permanent": false
      }
    ],
    "traits": {
      "conditionalStats": {
        "condition": "ownSetTrap",
        "attack": 400
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "232": {
    "name": "Gloss Hand",
    "text": "Tribute this card: return 1 banished Charter officer to your hand, then gain 300 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "tribute"
      },
      {
        "op": "select",
        "key": "rescue",
        "selector": {
          "owner": "own",
          "zones": "banished",
          "series": "Mesruiyet",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "points",
        "amount": 300,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "233": {
    "name": "Form Master",
    "text": "Once per turn: pay 1100 KP; banish 1 Level 4 or lower officer from the opposing archive, then give 1 Charter officer 200 ATK this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1100,
        "opponent": false
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "ally",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Mesruiyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "attack": 200
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "234": {
    "name": "Charter Chief",
    "text": "Requires 1 countersignature to summon. Gains 200 ATK for each summon tribute. When destroyed in battle, return 1 Level 3 or lower Charter officer from your archive to your hand.",
    "effects": [],
    "traits": {
      "tributeAttack": 200
    },
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "select",
            "key": "successor",
            "selector": {
              "owner": "own",
              "zones": "grave",
              "series": "Mesruiyet",
              "kind": "unit",
              "maxLevel": 3
            },
            "count": 1,
            "chooser": "own"
          },
          {
            "op": "move",
            "to": "hand",
            "count": 1,
            "reason": "effect"
          }
        ],
        "reason": "battle"
      }
    ],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "235": {
    "name": "Joint Paraf",
    "text": "Reserve panel: 1 File and 1 Paraf officer as materials. Once per turn: pay 700 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -700,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Dosya",
          "Paraf"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Dosya",
      "Paraf"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "236": {
    "name": "Twin Panel",
    "text": "Reserve panel: 1 Panel and 1 Command officer as materials. Once per turn: pay 800 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -800,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Heyet",
          "Karargah"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Heyet",
      "Karargah"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "237": {
    "name": "Telex Board",
    "text": "Reserve panel: 1 Telex and 1 Memo officer as materials. Once per turn: pay 900 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -900,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Telex",
          "Muhtira"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Telex",
      "Muhtira"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "238": {
    "name": "Annex Board",
    "text": "Reserve panel: 1 Annex and 1 Brief officer as materials. Once per turn: pay 1000 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -1000,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Zeyil",
          "Brifing"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Zeyil",
      "Brifing"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "239": {
    "name": "Archive Board",
    "text": "Reserve panel: 1 Cabinet and 1 Archive officer as materials. Once per turn: pay 1100 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -1100,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Kabine",
          "Arsiv"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Kabine",
      "Arsiv"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "240": {
    "name": "Writ Panel",
    "text": "Reserve panel: 1 Dispatch and 1 Charter officer as materials. Once per turn: pay 1200 KP; return 1 opposing face-up support card to its owner's hand.",
    "effects": [
      {
        "op": "points",
        "amount": -1200,
        "opponent": false
      },
      {
        "op": "select",
        "key": "support",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "materials": {
        "series": [
          "Tebligat",
          "Mesruiyet"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Tebligat",
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "241": {
    "name": "Yellow Band",
    "text": "Pay 400 KP; add 1 Level 4 or lower File officer from your deck to your hand, shuffle, then discard 1 card.",
    "effects": [
      {
        "op": "points",
        "amount": -400,
        "opponent": false
      },
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "series": "Dosya",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "shuffle"
      },
      {
        "op": "select",
        "key": "discard",
        "selector": {
          "owner": "own",
          "zones": "hand",
          "excludeSource": true
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "discard",
        "count": 1,
        "opponent": false,
        "random": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "242": {
    "name": "Closed Copy",
    "text": "Pay 450 KP; look at the top 2 cards of your deck, take up to 1 officer and leave the rest on top in order. You must control a Paraf officer.",
    "effects": [
      {
        "op": "points",
        "amount": -450,
        "opponent": false
      },
      {
        "op": "look",
        "count": 2,
        "take": 1,
        "kind": "unit"
      }
    ],
    "traits": {
      "requiresSeries": "Paraf"
    },
    "triggers": [],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "243": {
    "name": "Open Copy",
    "text": "Pay 500 KP; return 1 Panel officer from your archive to your hand, then banish 1 officer from the opposing archive.",
    "effects": [
      {
        "op": "points",
        "amount": -500,
        "opponent": false
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Heyet",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "244": {
    "name": "Internal Note",
    "text": "Pay 550 KP; return 1 opposing face-up support card to its owner's hand, then give 1 Command officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -550,
        "opponent": false
      },
      {
        "op": "select",
        "key": "evict",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "guard",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Karargah"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "245": {
    "name": "External Note",
    "text": "Pay 600 KP; add 1 Level 4 or lower Telex officer from your deck to your hand, shuffle, then discard 1 card.",
    "effects": [
      {
        "op": "points",
        "amount": -600,
        "opponent": false
      },
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "series": "Telex",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "shuffle"
      },
      {
        "op": "select",
        "key": "discard",
        "selector": {
          "owner": "own",
          "zones": "hand",
          "excludeSource": true
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "discard",
        "count": 1,
        "opponent": false,
        "random": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "246": {
    "name": "Crisis Chart",
    "text": "Pay 650 KP; look at the top 3 cards of your deck, take up to 1 officer and leave the rest on top in order. You must control a Memo officer.",
    "effects": [
      {
        "op": "points",
        "amount": -650,
        "opponent": false
      },
      {
        "op": "look",
        "count": 3,
        "take": 1,
        "kind": "unit"
      }
    ],
    "traits": {
      "requiresSeries": "Muhtira"
    },
    "triggers": [],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "247": {
    "name": "Tempo Note",
    "text": "Pay 700 KP; return 1 Annex officer from your archive to your hand, then banish 1 officer from the opposing archive.",
    "effects": [
      {
        "op": "points",
        "amount": -700,
        "opponent": false
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Zeyil",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "248": {
    "name": "Field Note",
    "text": "Pay 750 KP; return 1 opposing face-up support card to its owner's hand, then give 1 Brief officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -750,
        "opponent": false
      },
      {
        "op": "select",
        "key": "evict",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "guard",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Brifing"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "249": {
    "name": "Desk Order",
    "text": "Pay 800 KP; add 1 Level 4 or lower Cabinet officer from your deck to your hand, shuffle, then discard 1 card.",
    "effects": [
      {
        "op": "points",
        "amount": -800,
        "opponent": false
      },
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "series": "Kabine",
          "kind": "unit",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "shuffle"
      },
      {
        "op": "select",
        "key": "discard",
        "selector": {
          "owner": "own",
          "zones": "hand",
          "excludeSource": true
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "discard",
        "count": 1,
        "opponent": false,
        "random": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "250": {
    "name": "Paper Queue",
    "text": "Pay 850 KP; look at the top 4 cards of your deck, take up to 1 officer and leave the rest on top in order. You must control a Archive officer.",
    "effects": [
      {
        "op": "points",
        "amount": -850,
        "opponent": false
      },
      {
        "op": "look",
        "count": 4,
        "take": 1,
        "kind": "unit"
      }
    ],
    "traits": {
      "requiresSeries": "Arsiv"
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "251": {
    "name": "Desk Chart",
    "text": "Pay 900 KP; return 1 Dispatch officer from your archive to your hand, then banish 1 officer from the opposing archive.",
    "effects": [
      {
        "op": "points",
        "amount": -900,
        "opponent": false
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Tebligat",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "252": {
    "name": "Brief Ledger",
    "text": "Pay 950 KP; return 1 opposing face-up support card to its owner's hand, then give 1 Charter officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -950,
        "opponent": false
      },
      {
        "op": "select",
        "key": "evict",
        "selector": {
          "owner": "opponent",
          "zones": "support",
          "face": "up"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "select",
        "key": "guard",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Mesruiyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "253": {
    "name": "Archive Slip",
    "text": "Pay 600 KP; Special Summon 1 Level 3 or lower File officer from your archive. Skip Crisis this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -600,
        "opponent": false
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "grave"
          ],
          "kind": "unit",
          "series": "Dosya",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "254": {
    "name": "Paraf Chart",
    "text": "Pay 650 KP; Set 1 notice from your archive into a support zone. You must control a Paraf officer.",
    "effects": [
      {
        "op": "points",
        "amount": -650,
        "opponent": false
      },
      {
        "op": "select",
        "key": "reset",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "kind": "trap"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "set"
      }
    ],
    "traits": {
      "requiresSeries": "Paraf",
      "requiresFreeZone": "support"
    },
    "triggers": [],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "255": {
    "name": "Telex Chart",
    "text": "Pay 700 KP; banish 1 officer from the opposing archive and draw 1 card. You must control a Panel officer.",
    "effects": [
      {
        "op": "points",
        "amount": -700,
        "opponent": false
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "draw",
        "count": 1,
        "opponent": false
      }
    ],
    "traits": {
      "requiresSeries": "Heyet"
    },
    "triggers": [],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "256": {
    "name": "File Ribbon",
    "text": "Pay 1150 KP; take control of 1 opposing face-up Level 2 or lower officer for this turn. You need a Command officer and an empty unit zone.",
    "effects": [
      {
        "op": "points",
        "amount": -1150,
        "opponent": false
      },
      {
        "op": "select",
        "key": "borrow",
        "selector": {
          "owner": "opponent",
          "zones": "units",
          "face": "up",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "control"
      }
    ],
    "traits": {
      "requiresSeries": "Karargah",
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "257": {
    "name": "Missing Sign",
    "text": "Pay 800 KP; Special Summon 1 Level 3 or lower Telex officer from your archive. Skip Crisis this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -800,
        "opponent": false
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "grave"
          ],
          "kind": "unit",
          "series": "Telex",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "258": {
    "name": "Extra Paraf",
    "text": "Pay 850 KP; Set 1 notice from your archive into a support zone. You must control a Memo officer.",
    "effects": [
      {
        "op": "points",
        "amount": -850,
        "opponent": false
      },
      {
        "op": "select",
        "key": "reset",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "kind": "trap"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "set"
      }
    ],
    "traits": {
      "requiresSeries": "Muhtira",
      "requiresFreeZone": "support"
    },
    "triggers": [],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "259": {
    "name": "Early Telex",
    "text": "Pay 900 KP; banish 1 officer from the opposing archive and draw 1 card. You must control a Annex officer.",
    "effects": [
      {
        "op": "points",
        "amount": -900,
        "opponent": false
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "draw",
        "count": 1,
        "opponent": false
      }
    ],
    "traits": {
      "requiresSeries": "Zeyil"
    },
    "triggers": [],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "260": {
    "name": "Late Dispatch",
    "text": "Pay 1350 KP; take control of 1 opposing face-up Level 3 or lower officer for this turn. You need a Brief officer and an empty unit zone.",
    "effects": [
      {
        "op": "points",
        "amount": -1350,
        "opponent": false
      },
      {
        "op": "select",
        "key": "borrow",
        "selector": {
          "owner": "opponent",
          "zones": "units",
          "face": "up",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "control"
      }
    ],
    "traits": {
      "requiresSeries": "Brifing",
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "261": {
    "name": "Empty Agenda",
    "text": "Pay 1000 KP; Special Summon 1 Level 3 or lower Cabinet officer from your archive. Skip Crisis this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1000,
        "opponent": false
      },
      {
        "op": "select",
        "key": "unit",
        "selector": {
          "owner": "own",
          "zones": [
            "grave"
          ],
          "kind": "unit",
          "series": "Kabine",
          "maxLevel": 3
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "summon",
        "count": 1
      },
      {
        "op": "skipBattle"
      }
    ],
    "traits": {
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "262": {
    "name": "Full Agenda",
    "text": "Pay 1050 KP; Set 1 notice from your archive into a support zone. You must control a Archive officer.",
    "effects": [
      {
        "op": "points",
        "amount": -1050,
        "opponent": false
      },
      {
        "op": "select",
        "key": "reset",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "kind": "trap"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "set"
      }
    ],
    "traits": {
      "requiresSeries": "Arsiv",
      "requiresFreeZone": "support"
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "263": {
    "name": "Short Briefing",
    "text": "Pay 1100 KP; banish 1 officer from the opposing archive and draw 1 card. You must control a Dispatch officer.",
    "effects": [
      {
        "op": "points",
        "amount": -1100,
        "opponent": false
      },
      {
        "op": "select",
        "key": "deny",
        "selector": {
          "owner": "opponent",
          "zones": "grave",
          "kind": "unit"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "banished",
        "count": 1,
        "reason": "effect"
      },
      {
        "op": "draw",
        "count": 1,
        "opponent": false
      }
    ],
    "traits": {
      "requiresSeries": "Tebligat"
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "264": {
    "name": "Long Briefing",
    "text": "Pay 1550 KP; take control of 1 opposing face-up Level 4 or lower officer for this turn. You need a Charter officer and an empty unit zone.",
    "effects": [
      {
        "op": "points",
        "amount": -1550,
        "opponent": false
      },
      {
        "op": "select",
        "key": "borrow",
        "selector": {
          "owner": "opponent",
          "zones": "units",
          "face": "up",
          "maxLevel": 4
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "control"
      }
    ],
    "traits": {
      "requiresSeries": "Mesruiyet",
      "requiresFreeZone": "units"
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "265": {
    "name": "Quiet Panel",
    "text": "The equipped officer gains 300 DEF. File officers on the field gain 150 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "defense": 300
      },
      "aura": {
        "series": "Dosya",
        "attack": 150
      }
    },
    "triggers": [],
    "series": [
      "Dosya"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "266": {
    "name": "Noisy Cabinet",
    "text": "The equipped officer gains 375 ATK but loses 200 DEF. Paraf officers on the field gain 100 DEF.",
    "effects": [],
    "traits": {
      "equip": {
        "attack": 375,
        "defense": -200
      },
      "aura": {
        "series": "Paraf",
        "defense": 100
      }
    },
    "triggers": [],
    "series": [
      "Paraf"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "267": {
    "name": "Archive Door",
    "text": "The equipped officer gains 300 DEF. Level 3 or lower Panel officers on the field gain 200 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "defense": 300
      },
      "aura": {
        "series": "Heyet",
        "maxLevel": 3,
        "attack": 200
      }
    },
    "triggers": [],
    "series": [
      "Heyet"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "268": {
    "name": "File Spine",
    "text": "The equipped officer gains 375 DEF. Command officers on the field gain 150 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "defense": 375
      },
      "aura": {
        "series": "Karargah",
        "attack": 150
      }
    },
    "triggers": [],
    "series": [
      "Karargah"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "269": {
    "name": "Annex Extra",
    "text": "The equipped officer gains 450 ATK but loses 200 DEF. Telex officers on the field gain 100 DEF.",
    "effects": [],
    "traits": {
      "equip": {
        "attack": 450,
        "defense": -200
      },
      "aura": {
        "series": "Telex",
        "defense": 100
      }
    },
    "triggers": [],
    "series": [
      "Telex"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "270": {
    "name": "Notice Text",
    "text": "The equipped officer gains 300 DEF. Level 3 or lower Memo officers on the field gain 275 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "defense": 300
      },
      "aura": {
        "series": "Muhtira",
        "maxLevel": 3,
        "attack": 275
      }
    },
    "triggers": [],
    "series": [
      "Muhtira"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "271": {
    "name": "Redaction Trace",
    "text": "The equipped officer gains 450 DEF. Annex officers on the field gain 150 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "defense": 450
      },
      "aura": {
        "series": "Zeyil",
        "attack": 150
      }
    },
    "triggers": [],
    "series": [
      "Zeyil"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "272": {
    "name": "Charter Gloss",
    "text": "The equipped officer gains 525 ATK but loses 200 DEF. Brief officers on the field gain 100 DEF.",
    "effects": [],
    "traits": {
      "equip": {
        "attack": 525,
        "defense": -200
      },
      "aura": {
        "series": "Brifing",
        "defense": 100
      }
    },
    "triggers": [],
    "series": [
      "Brifing"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "273": {
    "name": "Command Note",
    "text": "The equipped officer gains 300 DEF. Level 3 or lower Cabinet officers on the field gain 350 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "defense": 300
      },
      "aura": {
        "series": "Kabine",
        "maxLevel": 3,
        "attack": 350
      }
    },
    "triggers": [],
    "series": [
      "Kabine"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "274": {
    "name": "Telex Ribbon",
    "text": "The equipped officer gains 525 DEF. Archive officers on the field gain 150 ATK.",
    "effects": [],
    "traits": {
      "equip": {
        "defense": 525
      },
      "aura": {
        "series": "Arsiv",
        "attack": 150
      }
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "275": {
    "name": "Dist Paper",
    "text": "The equipped officer gains 600 ATK but loses 200 DEF. Dispatch officers on the field gain 100 DEF.",
    "effects": [],
    "traits": {
      "equip": {
        "attack": 600,
        "defense": -200
      },
      "aura": {
        "series": "Tebligat",
        "defense": 100
      }
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "276": {
    "name": "Notice: Copy Mismatch",
    "text": "When the opponent declares an attack: pay 350 KP; cancel the attack, then return 1 Level 2 or lower File officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -350,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Dosya",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Dosya",
      "İhtar"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "277": {
    "name": "Notice: Stamp Mismatch",
    "text": "When the opponent declares an attack: pay 400 KP; cancel the attack, then return 1 Level 2 or lower Paraf officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -400,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Paraf",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Paraf",
      "İhtar"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "278": {
    "name": "Notice: Off Agenda",
    "text": "When the opponent declares an attack: pay 450 KP; cancel the attack, then return 1 Level 2 or lower Panel officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -450,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Heyet",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Heyet",
      "İhtar"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "279": {
    "name": "Notice: Interim Line",
    "text": "When the opponent declares an attack: pay 500 KP; cancel the attack, then return 1 Level 2 or lower Command officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -500,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Karargah",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Karargah",
      "İhtar"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "280": {
    "name": "Notice: Not Final",
    "text": "When the opponent declares an attack: pay 550 KP; cancel the attack, then return 1 Level 2 or lower Telex officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -550,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Telex",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Telex",
      "İhtar"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "281": {
    "name": "Notice: Draft Remains",
    "text": "When the opponent declares an attack: pay 600 KP; cancel the attack, then return 1 Level 2 or lower Memo officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -600,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Muhtira",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Muhtira",
      "İhtar"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "282": {
    "name": "Notice: Taken Final",
    "text": "When the opponent declares an attack: pay 650 KP; cancel the attack, then return 1 Level 2 or lower Annex officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -650,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Zeyil",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Zeyil",
      "İhtar"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "283": {
    "name": "Notice: Inner Circular",
    "text": "When the opponent declares an attack: pay 700 KP; cancel the attack, then return 1 Level 2 or lower Brief officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -700,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Brifing",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Brifing",
      "İhtar"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "284": {
    "name": "Notice: No Outer Leak",
    "text": "When the opponent declares an attack: pay 750 KP; cancel the attack, then return 1 Level 2 or lower Cabinet officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -750,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Kabine",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Kabine",
      "İhtar"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "285": {
    "name": "Notice: Brief Cancel",
    "text": "When the opponent declares an attack: pay 800 KP; cancel the attack, then return 1 Level 2 or lower Archive officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -800,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Arsiv",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Arsiv",
      "İhtar"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "286": {
    "name": "Notice: Cabinet Delay",
    "text": "When the opponent declares an attack: pay 850 KP; cancel the attack, then return 1 Level 2 or lower Dispatch officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -850,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Tebligat",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Tebligat",
      "İhtar"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "287": {
    "name": "Notice: Command Quiet",
    "text": "When the opponent declares an attack: pay 900 KP; cancel the attack, then return 1 Level 2 or lower Charter officer from your archive to your hand.",
    "effects": [
      {
        "op": "points",
        "amount": -900,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "select",
        "key": "recover",
        "selector": {
          "owner": "own",
          "zones": "grave",
          "series": "Mesruiyet",
          "kind": "unit",
          "maxLevel": 2
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "move",
        "to": "hand",
        "count": 1,
        "reason": "effect"
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ]
    },
    "triggers": [],
    "series": [
      "Mesruiyet",
      "İhtar"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "288": {
    "name": "Notice: Archive Locked",
    "text": "When the opponent activates a support card: pay 750 KP; negate the activation, then give 1 File officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -750,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Dosya"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Dosya",
      "İhtar"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  },
  "289": {
    "name": "Notice: Hard Redact",
    "text": "When the opponent activates a support card: pay 800 KP; negate the activation, then give 1 Paraf officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -800,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Paraf"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Paraf",
      "İhtar"
    ],
    "hint": {
      "tr": "Paraf hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Paraf line; pair this card with a follow-up."
    }
  },
  "290": {
    "name": "Notice: Paraf Chain",
    "text": "When the opponent activates a support card: pay 850 KP; negate the activation, then give 1 Panel officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -850,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Heyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Heyet",
      "İhtar"
    ],
    "hint": {
      "tr": "Heyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Panel line; pair this card with a follow-up."
    }
  },
  "291": {
    "name": "Notice: Sign Chain",
    "text": "When the opponent activates a support card: pay 900 KP; negate the activation, then give 1 Command officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -900,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Karargah"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Karargah",
      "İhtar"
    ],
    "hint": {
      "tr": "Karargâh hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Command line; pair this card with a follow-up."
    }
  },
  "292": {
    "name": "Notice: Late Dist",
    "text": "When the opponent activates a support card: pay 950 KP; negate the activation, then give 1 Telex officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -950,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Telex"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Telex",
      "İhtar"
    ],
    "hint": {
      "tr": "Telex hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Telex line; pair this card with a follow-up."
    }
  },
  "293": {
    "name": "Notice: Annex Table",
    "text": "When the opponent activates a support card: pay 1000 KP; negate the activation, then give 1 Memo officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1000,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Muhtira"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Muhtira",
      "İhtar"
    ],
    "hint": {
      "tr": "Muhtıra hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Memo line; pair this card with a follow-up."
    }
  },
  "294": {
    "name": "Notice: Two Columns",
    "text": "When the opponent activates a support card: pay 1050 KP; negate the activation, then give 1 Annex officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1050,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Zeyil"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Zeyil",
      "İhtar"
    ],
    "hint": {
      "tr": "Zeyil hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Annex line; pair this card with a follow-up."
    }
  },
  "295": {
    "name": "Notice: One Column",
    "text": "When the opponent activates a support card: pay 1100 KP; negate the activation, then give 1 Brief officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1100,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Brifing"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Brifing",
      "İhtar"
    ],
    "hint": {
      "tr": "Brifing hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Brief line; pair this card with a follow-up."
    }
  },
  "296": {
    "name": "Notice: Closed Copy",
    "text": "When the opponent activates a support card: pay 1150 KP; negate the activation, then give 1 Cabinet officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1150,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Kabine"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Kabine",
      "İhtar"
    ],
    "hint": {
      "tr": "Kabine hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Cabinet line; pair this card with a follow-up."
    }
  },
  "297": {
    "name": "Notice: Open Copy",
    "text": "When the opponent activates a support card: pay 1200 KP; negate the activation, then give 1 Archive officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1200,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Arsiv"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Arsiv",
      "İhtar"
    ],
    "hint": {
      "tr": "Arşiv hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Archive line; pair this card with a follow-up."
    }
  },
  "298": {
    "name": "Notice: Crisis Chart",
    "text": "When the opponent activates a support card: pay 1250 KP; negate the activation, then give 1 Dispatch officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1250,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Tebligat"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Tebligat",
      "İhtar"
    ],
    "hint": {
      "tr": "Tebligat hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Dispatch line; pair this card with a follow-up."
    }
  },
  "299": {
    "name": "Notice: Broken Tempo",
    "text": "When the opponent activates a support card: pay 1300 KP; negate the activation, then give 1 Charter officer 300 DEF this turn.",
    "effects": [
      {
        "op": "points",
        "amount": -1300,
        "opponent": false
      },
      {
        "op": "negate"
      },
      {
        "op": "select",
        "key": "cover",
        "selector": {
          "owner": "own",
          "zones": "units",
          "series": "Mesruiyet"
        },
        "count": 1,
        "chooser": "own"
      },
      {
        "op": "modifier",
        "value": {
          "defense": 300
        },
        "permanent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "activate"
      ],
      "responseKinds": [
        "spell",
        "trap"
      ]
    },
    "triggers": [],
    "series": [
      "Mesruiyet",
      "İhtar"
    ],
    "hint": {
      "tr": "Meşruiyet hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your Charter line; pair this card with a follow-up."
    }
  },
  "300": {
    "name": "Notice: Desk Emptied",
    "text": "Once per duel: when the opponent declares a direct attack, pay 1000 KP; cancel the attack and draw 1 card.",
    "effects": [
      {
        "op": "points",
        "amount": -1000,
        "opponent": false
      },
      {
        "op": "cancelAttack"
      },
      {
        "op": "draw",
        "count": 1,
        "opponent": false
      }
    ],
    "traits": {
      "responseTypes": [
        "attack"
      ],
      "directOnly": true,
      "oncePerDuel": true
    },
    "triggers": [],
    "series": [
      "Dosya",
      "İhtar"
    ],
    "hint": {
      "tr": "Dosya hattını koru; bu kartı tek başına değil takip hamlesiyle kullan.",
      "en": "Protect your File line; pair this card with a follow-up."
    }
  }
};
