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
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "2": {
    "name": "File Rapporteur",
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
      "Dosya"
    ]
  },
  "3": {
    "name": "File Undersecretary",
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
      "Dosya"
    ]
  },
  "4": {
    "name": "File Adviser",
    "text": "When summoned, the opponent loses 600 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": -600,
            "opponent": true
          }
        ]
      }
    ],
    "series": [
      "Dosya"
    ]
  },
  "5": {
    "name": "File Courier",
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
      "Dosya"
    ]
  },
  "6": {
    "name": "File Archivist",
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
      "Dosya"
    ]
  },
  "7": {
    "name": "File Compositor",
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
      "Dosya"
    ]
  },
  "8": {
    "name": "File Initialer",
    "text": "While defending, cannot be attacked; if no other target, direct is allowed.",
    "effects": [],
    "traits": {
      "untargetableDefense": true,
      "allowDirectWhenOnlyDefenders": true
    },
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "9": {
    "name": "File Member",
    "text": "When attacking an equal-level officer, deal 300 extra damage.",
    "effects": [],
    "traits": {
      "sameLevelDamage": 300
    },
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "10": {
    "name": "File Officer",
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
      "Dosya"
    ]
  },
  "11": {
    "name": "File Examiner",
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
      "Dosya"
    ]
  },
  "12": {
    "name": "File Operator",
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
      "Dosya"
    ]
  },
  "13": {
    "name": "File Redactor",
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
    "name": "File Overseer",
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
      "Dosya"
    ]
  },
  "15": {
    "name": "File Recorder",
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
      "Dosya"
    ]
  },
  "16": {
    "name": "Initial Clerk",
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
      "Dosya"
    ]
  },
  "17": {
    "name": "Initial Rapporteur",
    "text": "Cannot be destroyed while a field order is active.",
    "effects": [],
    "traits": {
      "fieldProtection": true
    },
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "18": {
    "name": "Initial Undersecretary",
    "text": "Once per turn: one of your officers gains 200 ATK.",
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
          "attack": 200
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Dosya"
    ]
  },
  "19": {
    "name": "Initial Adviser",
    "text": "When summoned, Special Summon 1 Level 3 or lower officer from hand or deck.",
    "effects": [],
    "traits": {},
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
  "20": {
    "name": "Initial Courier",
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
      "Dosya"
    ]
  },
  "21": {
    "name": "Initial Archivist",
    "text": "Send this to the archive; gain 800 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "cost"
      },
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
  "22": {
    "name": "Initial Compositor",
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
      "Dosya"
    ]
  },
  "23": {
    "name": "Initial Initialer",
    "text": "When Normal Summoned, add 1 Paraf officer from deck to hand.",
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
              "series": "Paraf",
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
      "Paraf"
    ]
  },
  "24": {
    "name": "Initial Member",
    "text": "When sent to the grave, Set 1 notice from your deck.",
    "effects": [],
    "traits": {},
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
      "Paraf"
    ]
  },
  "25": {
    "name": "Initial Officer",
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
      "Paraf"
    ]
  },
  "26": {
    "name": "Initial Examiner",
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
    "name": "Initial Operator",
    "text": "Your Quick-Play orders deal 400 additional KP damage.",
    "effects": [],
    "traits": {
      "quickDamage": 400
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "28": {
    "name": "Initial Redactor",
    "text": "When destroyed, gain 600 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "points",
            "amount": 600,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Paraf"
    ]
  },
  "29": {
    "name": "Initial Overseer",
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
      "Paraf"
    ]
  },
  "30": {
    "name": "Initial Recorder",
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
      "Paraf"
    ]
  },
  "31": {
    "name": "Panel Clerk",
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
      "Paraf"
    ]
  },
  "32": {
    "name": "Panel Rapporteur",
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
      "Paraf"
    ]
  },
  "33": {
    "name": "Panel Undersecretary",
    "text": "May attack directly, dealing half damage.",
    "effects": [],
    "traits": {
      "direct": true,
      "directMultiplier": 0.5
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "34": {
    "name": "Panel Adviser",
    "text": "Your face-down officers cannot be destroyed by effects until revealed.",
    "effects": [],
    "traits": {
      "protectOwnSetUnits": true
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "35": {
    "name": "Panel Courier",
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
      "Paraf"
    ]
  },
  "36": {
    "name": "Panel Archivist",
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
      "Paraf"
    ]
  },
  "37": {
    "name": "Panel Compositor",
    "text": "May attack directly.",
    "effects": [],
    "traits": {
      "direct": true
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "38": {
    "name": "Panel Initialer",
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
    "name": "Panel Member",
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
      "Paraf"
    ]
  },
  "40": {
    "name": "Panel Officer",
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
      "Paraf"
    ]
  },
  "41": {
    "name": "Panel Examiner",
    "text": "Your Paraf officers gain 700 ATK and DEF.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Paraf",
        "attack": 700,
        "defense": 700
      }
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "42": {
    "name": "Panel Operator",
    "text": "Grants 1 extra Normal Summon each turn, only for Level 3 or lower.",
    "effects": [],
    "traits": {
      "extraNormalMaxLevel": 3
    },
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "43": {
    "name": "Panel Redactor",
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
          "series": "Paraf",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Paraf"
    ]
  },
  "44": {
    "name": "Panel Overseer",
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
  "45": {
    "name": "Panel Recorder",
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
  "46": {
    "name": "Command Clerk",
    "text": "When summoned, the opponent loses 600 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": -600,
            "opponent": true
          }
        ]
      }
    ],
    "series": [
      "Heyet"
    ]
  },
  "47": {
    "name": "Command Rapporteur",
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
      "Heyet"
    ]
  },
  "48": {
    "name": "Command Undersecretary",
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
      "Heyet"
    ]
  },
  "49": {
    "name": "Command Adviser",
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
      "Heyet"
    ]
  },
  "50": {
    "name": "Command Courier",
    "text": "While defending, cannot be attacked; if no other target, direct is allowed.",
    "effects": [],
    "traits": {
      "untargetableDefense": true,
      "allowDirectWhenOnlyDefenders": true
    },
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "51": {
    "name": "Command Archivist",
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
    "name": "Command Compositor",
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
      "Heyet"
    ]
  },
  "53": {
    "name": "Command Initialer",
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
      "Heyet"
    ]
  },
  "54": {
    "name": "Command Member",
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
      "Heyet"
    ]
  },
  "55": {
    "name": "Command Officer",
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
      "Heyet"
    ]
  },
  "56": {
    "name": "Command Examiner",
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
      "Heyet"
    ]
  },
  "57": {
    "name": "Command Operator",
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
  "58": {
    "name": "Command Redactor",
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
      "Heyet"
    ]
  },
  "59": {
    "name": "Command Overseer",
    "text": "Cannot be destroyed while a field order is active.",
    "effects": [],
    "traits": {
      "fieldProtection": true
    },
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "60": {
    "name": "Command Recorder",
    "text": "Once per turn: one of your officers gains 200 ATK.",
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
          "attack": 200
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Heyet"
    ]
  },
  "61": {
    "name": "Telex Clerk",
    "text": "When summoned, Special Summon 1 Level 3 or lower officer from hand or deck.",
    "effects": [],
    "traits": {},
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
              "series": "Heyet",
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
      "Heyet"
    ]
  },
  "62": {
    "name": "Telex Rapporteur",
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
      "Heyet"
    ]
  },
  "63": {
    "name": "Telex Undersecretary",
    "text": "Send this to the archive; gain 1000 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "cost"
      },
      {
        "op": "points",
        "amount": 1000,
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
    "name": "Telex Adviser",
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
      "Heyet"
    ]
  },
  "65": {
    "name": "Telex Courier",
    "text": "When Normal Summoned, add 1 Heyet officer from deck to hand.",
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
            "op": "shuffle"
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Heyet"
    ]
  },
  "66": {
    "name": "Telex Archivist",
    "text": "When sent to the grave, Set 1 notice from your deck.",
    "effects": [],
    "traits": {},
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
      "Heyet"
    ]
  },
  "67": {
    "name": "Telex Compositor",
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
      "Karargah"
    ]
  },
  "68": {
    "name": "Reserve Panel 68",
    "text": "Materials: Karargah and Dosya officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Karargah",
          "Dosya"
        ]
      }
    },
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
      "Karargah"
    ]
  },
  "69": {
    "name": "Reserve Panel 69",
    "text": "Materials: Karargah and Telex officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Karargah",
          "Telex"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "70": {
    "name": "Reserve Panel 70",
    "text": "Materials: Karargah and Arsiv officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Karargah",
          "Arsiv"
        ]
      }
    },
    "triggers": [
      {
        "event": "destroy",
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
      "Karargah"
    ]
  },
  "71": {
    "name": "Reserve Panel 71",
    "text": "Materials: Karargah and Kabine officers. Reserve panel.",
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
    "traits": {
      "materials": {
        "series": [
          "Karargah",
          "Kabine"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "72": {
    "name": "Reserve Panel 72",
    "text": "Materials: Karargah and Paraf officers. Reserve panel.",
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
      "materials": {
        "series": [
          "Karargah",
          "Paraf"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "73": {
    "name": "Reserve Panel 73",
    "text": "Materials: Karargah and Heyet officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Karargah",
          "Heyet"
        ]
      }
    },
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
      "Karargah"
    ]
  },
  "74": {
    "name": "Telex Overseer",
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
      "Karargah"
    ]
  },
  "75": {
    "name": "Telex Recorder",
    "text": "May attack directly, dealing half damage.",
    "effects": [],
    "traits": {
      "direct": true,
      "directMultiplier": 0.5
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "76": {
    "name": "Memorandum Clerk",
    "text": "Your face-down officers cannot be destroyed by effects until revealed.",
    "effects": [],
    "traits": {
      "protectOwnSetUnits": true
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "77": {
    "name": "Memorandum Rapporteur",
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
      "Karargah"
    ]
  },
  "78": {
    "name": "Memorandum Undersecretary",
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
      "Karargah"
    ]
  },
  "79": {
    "name": "Memorandum Adviser",
    "text": "May attack directly.",
    "effects": [],
    "traits": {
      "direct": true
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "80": {
    "name": "Memorandum Courier",
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
      "Karargah"
    ]
  },
  "81": {
    "name": "Memorandum Archivist",
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
      "Karargah"
    ]
  },
  "82": {
    "name": "Memorandum Compositor",
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
  "83": {
    "name": "Memorandum Initialer",
    "text": "Your Karargah officers gain 700 ATK and DEF.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Karargah",
        "attack": 700,
        "defense": 700
      }
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "84": {
    "name": "Memorandum Member",
    "text": "Grants 1 extra Normal Summon each turn, only for Level 3 or lower.",
    "effects": [],
    "traits": {
      "extraNormalMaxLevel": 3
    },
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "85": {
    "name": "Memorandum Officer",
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
          "series": "Karargah",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Karargah"
    ]
  },
  "86": {
    "name": "Memorandum Examiner",
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
      "Karargah"
    ]
  },
  "87": {
    "name": "Memorandum Operator",
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
      "Karargah"
    ]
  },
  "88": {
    "name": "Memorandum Redactor",
    "text": "When summoned, the opponent loses 600 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": -600,
            "opponent": true
          }
        ]
      }
    ],
    "series": [
      "Karargah"
    ]
  },
  "89": {
    "name": "Memorandum Overseer",
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
      "Brifing"
    ]
  },
  "90": {
    "name": "Memorandum Recorder",
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
      "Brifing"
    ]
  },
  "91": {
    "name": "Addendum Clerk",
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
      "Brifing"
    ]
  },
  "92": {
    "name": "Addendum Rapporteur",
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
  "93": {
    "name": "Addendum Undersecretary",
    "text": "When attacking an equal-level officer, deal 300 extra damage.",
    "effects": [],
    "traits": {
      "sameLevelDamage": 300
    },
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "94": {
    "name": "Addendum Adviser",
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
      "Brifing"
    ]
  },
  "95": {
    "name": "Addendum Courier",
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
      "Brifing"
    ]
  },
  "96": {
    "name": "Addendum Archivist",
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
      "Brifing"
    ]
  },
  "97": {
    "name": "Addendum Compositor",
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
      "Brifing"
    ]
  },
  "98": {
    "name": "Addendum Initialer",
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
      "Brifing"
    ]
  },
  "99": {
    "name": "Addendum Member",
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
      "Brifing"
    ]
  },
  "100": {
    "name": "Addendum Officer",
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
      "Brifing"
    ]
  },
  "101": {
    "name": "Addendum Examiner",
    "text": "Cannot be destroyed while a field order is active.",
    "effects": [],
    "traits": {
      "fieldProtection": true
    },
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "102": {
    "name": "Addendum Operator",
    "text": "Once per turn: one of your officers gains 200 ATK.",
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
          "attack": 200
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
  "103": {
    "name": "Addendum Redactor",
    "text": "When summoned, Special Summon 1 Level 3 or lower officer from hand or deck.",
    "effects": [],
    "traits": {},
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
              "series": "Brifing",
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
      "Brifing"
    ]
  },
  "104": {
    "name": "Addendum Overseer",
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
  "105": {
    "name": "Addendum Recorder",
    "text": "Send this to the archive; gain 700 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "cost"
      },
      {
        "op": "points",
        "amount": 700,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Brifing"
    ]
  },
  "106": {
    "name": "Notice Clerk",
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
      "Brifing"
    ]
  },
  "107": {
    "name": "Notice Rapporteur",
    "text": "When Normal Summoned, add 1 Brifing officer from deck to hand.",
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
              "series": "Brifing",
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
      "Brifing"
    ]
  },
  "108": {
    "name": "Notice Undersecretary",
    "text": "When sent to the grave, Set 1 notice from your deck.",
    "effects": [],
    "traits": {},
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
      "Brifing"
    ]
  },
  "109": {
    "name": "Notice Adviser",
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
      "Brifing"
    ]
  },
  "110": {
    "name": "Notice Courier",
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
      "Brifing"
    ]
  },
  "111": {
    "name": "Notice Archivist",
    "text": "Your Quick-Play orders deal 400 additional KP damage.",
    "effects": [],
    "traits": {
      "quickDamage": 400
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "112": {
    "name": "Notice Compositor",
    "text": "When destroyed, gain 500 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "destroy",
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
      "Kabine"
    ]
  },
  "113": {
    "name": "Notice Initialer",
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
      "Kabine"
    ]
  },
  "114": {
    "name": "Notice Member",
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
      "Kabine"
    ]
  },
  "115": {
    "name": "Notice Officer",
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
      "Kabine"
    ]
  },
  "116": {
    "name": "Notice Examiner",
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
      "Kabine"
    ]
  },
  "117": {
    "name": "Notice Operator",
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
  "118": {
    "name": "Notice Redactor",
    "text": "Your face-down officers cannot be destroyed by effects until revealed.",
    "effects": [],
    "traits": {
      "protectOwnSetUnits": true
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "119": {
    "name": "Notice Overseer",
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
      "Kabine"
    ]
  },
  "120": {
    "name": "Notice Recorder",
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
      "Kabine"
    ]
  },
  "121": {
    "name": "Redaction Clerk",
    "text": "May attack directly.",
    "effects": [],
    "traits": {
      "direct": true
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "122": {
    "name": "Redaction Rapporteur",
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
      "Kabine"
    ]
  },
  "123": {
    "name": "Redaction Undersecretary",
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
      "Kabine"
    ]
  },
  "124": {
    "name": "Redaction Adviser",
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
      "Kabine"
    ]
  },
  "125": {
    "name": "Redaction Courier",
    "text": "Your Kabine officers gain 700 ATK and DEF.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Kabine",
        "attack": 700,
        "defense": 700
      }
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "126": {
    "name": "Redaction Archivist",
    "text": "Grants 1 extra Normal Summon each turn, only for Level 3 or lower.",
    "effects": [],
    "traits": {
      "extraNormalMaxLevel": 3
    },
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "127": {
    "name": "Redaction Compositor",
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
          "series": "Kabine",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Kabine"
    ]
  },
  "128": {
    "name": "Redaction Initialer",
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
      "Kabine"
    ]
  },
  "129": {
    "name": "Redaction Member",
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
  "130": {
    "name": "Redaction Officer",
    "text": "When summoned, the opponent loses 600 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "summon",
        "effects": [
          {
            "op": "points",
            "amount": -600,
            "opponent": true
          }
        ]
      }
    ],
    "series": [
      "Kabine"
    ]
  },
  "131": {
    "name": "Redaction Examiner",
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
      "Kabine"
    ]
  },
  "132": {
    "name": "Redaction Operator",
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
      "Kabine"
    ]
  },
  "133": {
    "name": "Redaction Redactor",
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
      "Arsiv"
    ]
  },
  "134": {
    "name": "Redaction Overseer",
    "text": "While defending, cannot be attacked; if no other target, direct is allowed.",
    "effects": [],
    "traits": {
      "untargetableDefense": true,
      "allowDirectWhenOnlyDefenders": true
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "135": {
    "name": "Redaction Recorder",
    "text": "When attacking an equal-level officer, deal 300 extra damage.",
    "effects": [],
    "traits": {
      "sameLevelDamage": 300
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "136": {
    "name": "Briefing Clerk",
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
  "137": {
    "name": "Briefing Rapporteur",
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
      "Arsiv"
    ]
  },
  "138": {
    "name": "Briefing Undersecretary",
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
      "Arsiv"
    ]
  },
  "139": {
    "name": "Briefing Adviser",
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
      "Arsiv"
    ]
  },
  "140": {
    "name": "Briefing Courier",
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
      "Arsiv"
    ]
  },
  "141": {
    "name": "Briefing Archivist",
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
      "Arsiv"
    ]
  },
  "142": {
    "name": "Briefing Compositor",
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
  "143": {
    "name": "Briefing Initialer",
    "text": "Cannot be destroyed while a field order is active.",
    "effects": [],
    "traits": {
      "fieldProtection": true
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "144": {
    "name": "Briefing Member",
    "text": "Once per turn: one of your officers gains 200 ATK.",
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
          "attack": 200
        },
        "permanent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "145": {
    "name": "Briefing Officer",
    "text": "When summoned, Special Summon 1 Level 3 or lower officer from hand or deck.",
    "effects": [],
    "traits": {},
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
              "series": "Arsiv",
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
      "Arsiv"
    ]
  },
  "146": {
    "name": "Briefing Examiner",
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
      "Arsiv"
    ]
  },
  "147": {
    "name": "Briefing Operator",
    "text": "Send this to the archive; gain 900 KP.",
    "effects": [
      {
        "op": "selfMove",
        "to": "grave",
        "reason": "cost"
      },
      {
        "op": "points",
        "amount": 900,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "148": {
    "name": "Briefing Redactor",
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
  "149": {
    "name": "Briefing Overseer",
    "text": "When Normal Summoned, add 1 Arsiv officer from deck to hand.",
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
            "op": "shuffle"
          }
        ],
        "normal": true
      }
    ],
    "series": [
      "Arsiv"
    ]
  },
  "150": {
    "name": "Briefing Recorder",
    "text": "When sent to the grave, Set 1 notice from your deck.",
    "effects": [],
    "traits": {},
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
      "Arsiv"
    ]
  },
  "151": {
    "name": "Cabinet Clerk",
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
      "Arsiv"
    ]
  },
  "152": {
    "name": "Cabinet Rapporteur",
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
      "Arsiv"
    ]
  },
  "153": {
    "name": "Cabinet Undersecretary",
    "text": "Your Quick-Play orders deal 400 additional KP damage.",
    "effects": [],
    "traits": {
      "quickDamage": 400
    },
    "triggers": [],
    "series": [
      "Arsiv"
    ]
  },
  "154": {
    "name": "Cabinet Adviser",
    "text": "When destroyed, gain 700 KP.",
    "effects": [],
    "traits": {},
    "triggers": [
      {
        "event": "destroy",
        "effects": [
          {
            "op": "points",
            "amount": 700,
            "opponent": false
          }
        ]
      }
    ],
    "series": [
      "Arsiv"
    ]
  },
  "155": {
    "name": "Cabinet Courier",
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
      "Mesruiyet"
    ]
  },
  "156": {
    "name": "Cabinet Archivist",
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
      "Mesruiyet"
    ]
  },
  "157": {
    "name": "Cabinet Compositor",
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
      "Mesruiyet"
    ]
  },
  "158": {
    "name": "Reserve Panel 158",
    "text": "Materials: Mesruiyet and Dosya officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Mesruiyet",
          "Dosya"
        ]
      }
    },
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
      "Mesruiyet"
    ]
  },
  "159": {
    "name": "Reserve Panel 159",
    "text": "Materials: Mesruiyet and Telex officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Mesruiyet",
          "Telex"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "160": {
    "name": "Reserve Panel 160",
    "text": "Materials: Mesruiyet and Arsiv officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Mesruiyet",
          "Arsiv"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "161": {
    "name": "Reserve Panel 161",
    "text": "Materials: Mesruiyet and Kabine officers. Reserve panel.",
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
      "materials": {
        "series": [
          "Mesruiyet",
          "Kabine"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "162": {
    "name": "Reserve Panel 162",
    "text": "Materials: Mesruiyet and Paraf officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Mesruiyet",
          "Paraf"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "163": {
    "name": "Reserve Panel 163",
    "text": "Materials: Mesruiyet and Heyet officers. Reserve panel.",
    "effects": [],
    "traits": {
      "materials": {
        "series": [
          "Mesruiyet",
          "Heyet"
        ]
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "164": {
    "name": "Cabinet Overseer",
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
      "Mesruiyet"
    ]
  },
  "165": {
    "name": "Cabinet Recorder",
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
      "Mesruiyet"
    ]
  },
  "166": {
    "name": "Archive Clerk",
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
      "Mesruiyet"
    ]
  },
  "167": {
    "name": "Archive Rapporteur",
    "text": "Your Mesruiyet officers gain 700 ATK and DEF.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Mesruiyet",
        "attack": 700,
        "defense": 700
      }
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "168": {
    "name": "Archive Undersecretary",
    "text": "Grants 1 extra Normal Summon each turn, only for Level 3 or lower.",
    "effects": [],
    "traits": {
      "extraNormalMaxLevel": 3
    },
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "169": {
    "name": "Archive Adviser",
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
          "series": "Mesruiyet",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Mesruiyet"
    ]
  },
  "170": {
    "name": "Archive Courier",
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
      "Mesruiyet"
    ]
  },
  "171": {
    "name": "Open Dispatch",
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
      "Telex"
    ]
  },
  "172": {
    "name": "Night Briefing",
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
      "Telex"
    ]
  },
  "173": {
    "name": "Signed Order",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "174": {
    "name": "Addendum Sentence",
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
      "Telex"
    ]
  },
  "175": {
    "name": "Archive Call",
    "text": "There is no Crisis phase this turn.",
    "effects": [
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "176": {
    "name": "Panel Sitting",
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
      "Telex"
    ]
  },
  "177": {
    "name": "Cabinet Note",
    "text": "Gain 1000 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 1000,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "178": {
    "name": "Telex Flow",
    "text": "Negate the declared action.",
    "effects": [
      {
        "op": "negate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "179": {
    "name": "Redaction Line",
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
      "Telex"
    ]
  },
  "180": {
    "name": "Legitimacy Clause",
    "text": "Field: Telex officers gain 300/300.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Telex",
        "attack": 300,
        "defense": 300
      }
    },
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "181": {
    "name": "File Transfer",
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
  "182": {
    "name": "Consultation Round",
    "text": "The equipped officer gains 500 ATK.",
    "effects": [
      {
        "op": "modifier",
        "value": {
          "attack": 500
        },
        "permanent": true,
        "self": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "183": {
    "name": "Stamp Drop",
    "text": "Add 1 Telex officer from deck to hand.",
    "effects": [
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "kind": "unit",
          "series": "Telex"
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
      "Telex"
    ]
  },
  "184": {
    "name": "Memorandum Slip",
    "text": "Draw 1; if it is a notice, Set it.",
    "effects": [
      {
        "op": "drawSetTrap"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "185": {
    "name": "Distribution List",
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
      "Telex"
    ]
  },
  "186": {
    "name": "Cover Letter",
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
      "Telex"
    ]
  },
  "187": {
    "name": "Annex Table",
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
      "Telex"
    ]
  },
  "188": {
    "name": "Agenda Item",
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
      "Telex"
    ]
  },
  "189": {
    "name": "Short Ruling Line",
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
      "Telex"
    ]
  },
  "190": {
    "name": "Long Rationale",
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
      "Telex"
    ]
  },
  "191": {
    "name": "Signature Queue",
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
      "Telex"
    ]
  },
  "192": {
    "name": "Referral Note",
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
      "Telex"
    ]
  },
  "193": {
    "name": "Dispatch Copy",
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
  "194": {
    "name": "Reply Letter",
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
      "Telex"
    ]
  },
  "195": {
    "name": "Internal Circular",
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
      "Telex"
    ]
  },
  "196": {
    "name": "External Correspondence",
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
      "Telex"
    ]
  },
  "197": {
    "name": "Record Correction",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "198": {
    "name": "Page Number",
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
      "Telex"
    ]
  },
  "199": {
    "name": "Footnote Order",
    "text": "There is no Crisis phase this turn.",
    "effects": [
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "200": {
    "name": "Header Line",
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
      "Telex"
    ]
  },
  "201": {
    "name": "Footer Line",
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
      "Telex"
    ]
  },
  "202": {
    "name": "Distribution Chart",
    "text": "Negate the declared action.",
    "effects": [
      {
        "op": "negate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "203": {
    "name": "Visa Gloss",
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
      "Telex"
    ]
  },
  "204": {
    "name": "Initialled Copy",
    "text": "Field: Telex officers gain 300/300.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Telex",
        "attack": 300,
        "defense": 300
      }
    },
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "205": {
    "name": "Draft Text",
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
  "206": {
    "name": "Final Text",
    "text": "The equipped officer gains 500 ATK.",
    "effects": [
      {
        "op": "modifier",
        "value": {
          "attack": 500
        },
        "permanent": true,
        "self": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "207": {
    "name": "Side Protocol",
    "text": "Add 1 Telex officer from deck to hand.",
    "effects": [
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "kind": "unit",
          "series": "Telex"
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
      "Telex"
    ]
  },
  "208": {
    "name": "Interim Line",
    "text": "Draw 1; if it is a notice, Set it.",
    "effects": [
      {
        "op": "drawSetTrap"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Telex"
    ]
  },
  "209": {
    "name": "Closing Sentence",
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
      "Telex"
    ]
  },
  "210": {
    "name": "Withdrawal Note",
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
      "Telex"
    ]
  },
  "211": {
    "name": "Rewrite Pass",
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
  "212": {
    "name": "Two Columns",
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
      "Tebligat"
    ]
  },
  "213": {
    "name": "One Column",
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
      "Tebligat"
    ]
  },
  "214": {
    "name": "Red Band",
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
      "Tebligat"
    ]
  },
  "215": {
    "name": "Yellow Band",
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
      "Tebligat"
    ]
  },
  "216": {
    "name": "Closed Copy",
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
      "Tebligat"
    ]
  },
  "217": {
    "name": "Open Copy",
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
      "Tebligat"
    ]
  },
  "218": {
    "name": "Internal Note",
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
      "Tebligat"
    ]
  },
  "219": {
    "name": "External Note",
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
      "Tebligat"
    ]
  },
  "220": {
    "name": "Crisis Chart",
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
      "Tebligat"
    ]
  },
  "221": {
    "name": "Tempo Note",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "222": {
    "name": "Field Note",
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
      "Tebligat"
    ]
  },
  "223": {
    "name": "Desk Order",
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
  "224": {
    "name": "Paper Queue",
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
      "Tebligat"
    ]
  },
  "225": {
    "name": "Desk Chart",
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
      "Tebligat"
    ]
  },
  "226": {
    "name": "Briefing Ledger",
    "text": "Negate the declared action.",
    "effects": [
      {
        "op": "negate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "227": {
    "name": "Archive Slip",
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
      "Tebligat"
    ]
  },
  "228": {
    "name": "Initialled Chart",
    "text": "Field: Tebligat officers gain 300/300.",
    "effects": [],
    "traits": {
      "aura": {
        "series": "Tebligat",
        "attack": 300,
        "defense": 300
      }
    },
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "229": {
    "name": "Telex Chart",
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
      "Tebligat"
    ]
  },
  "230": {
    "name": "File Ribbon",
    "text": "The equipped officer gains 500 ATK.",
    "effects": [
      {
        "op": "modifier",
        "value": {
          "attack": 500
        },
        "permanent": true,
        "self": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "231": {
    "name": "Missing Signature",
    "text": "Add 1 Tebligat officer from deck to hand.",
    "effects": [
      {
        "op": "select",
        "key": "card",
        "selector": {
          "owner": "own",
          "zones": "deck",
          "kind": "unit",
          "series": "Tebligat"
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
      "Tebligat"
    ]
  },
  "232": {
    "name": "Extra Initial",
    "text": "Draw 1; if it is a notice, Set it.",
    "effects": [
      {
        "op": "drawSetTrap"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "233": {
    "name": "Early Telex",
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
      "Tebligat"
    ]
  },
  "234": {
    "name": "Late Dispatch",
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
      "Tebligat"
    ]
  },
  "235": {
    "name": "Empty Agenda",
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
  "236": {
    "name": "Full Agenda",
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
      "Tebligat"
    ]
  },
  "237": {
    "name": "Short Briefing",
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
      "Tebligat"
    ]
  },
  "238": {
    "name": "Long Briefing",
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
      "Tebligat"
    ]
  },
  "239": {
    "name": "Quiet Panel",
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
      "Tebligat"
    ]
  },
  "240": {
    "name": "Noisy Cabinet",
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
      "Tebligat"
    ]
  },
  "241": {
    "name": "Archive Door",
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
      "Tebligat"
    ]
  },
  "242": {
    "name": "File Spine",
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
      "Tebligat"
    ]
  },
  "243": {
    "name": "Addendum Annex",
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
      "Tebligat"
    ]
  },
  "244": {
    "name": "Notice Text",
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
      "Tebligat"
    ]
  },
  "245": {
    "name": "Redaction Trace",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "246": {
    "name": "Legitimacy Gloss",
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
      "Tebligat"
    ]
  },
  "247": {
    "name": "Command Note",
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
  "248": {
    "name": "Telex Ribbon",
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
      "Tebligat"
    ]
  },
  "249": {
    "name": "Distribution Paper",
    "text": "Gain 1200 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 1200,
        "opponent": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Tebligat"
    ]
  },
  "250": {
    "name": "Notice: Early Signature",
    "text": "When the opponent summons an officer, gain 200 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "kind": "trap"
      }
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
      "Ihtar"
    ]
  },
  "251": {
    "name": "Notice: Empty Initial",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "252": {
    "name": "Notice: Wrong Copy",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "253": {
    "name": "Notice: Missed Distribution",
    "text": "Cancel the summon; the card goes to the archive.",
    "effects": [
      {
        "op": "cancelSummonToGrave"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "254": {
    "name": "Notice: Closed Archive",
    "text": "The opponent cannot activate orders this turn.",
    "effects": [
      {
        "op": "flag",
        "name": "noSpells",
        "value": true,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "255": {
    "name": "Notice: Open Band",
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
      "Ihtar"
    ]
  },
  "256": {
    "name": "Notice: Double Agenda",
    "text": "Cancel the attack.",
    "effects": [
      {
        "op": "cancelAttack"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "257": {
    "name": "Notice: Single Signature",
    "text": "Destroy the source of the pending action.",
    "effects": [
      {
        "op": "pendingTarget"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "258": {
    "name": "Notice: Late Briefing",
    "text": "Skip the Crisis phase.",
    "effects": [
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "259": {
    "name": "Notice: Quiet Panel",
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
      "Ihtar"
    ]
  },
  "260": {
    "name": "Notice: Loud Desk",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "261": {
    "name": "Notice: Red Gloss",
    "text": "The opponent discards 1 card.",
    "effects": [
      {
        "op": "discard",
        "count": 1,
        "opponent": true,
        "random": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "262": {
    "name": "Notice: Yellow Gloss",
    "text": "Negate the opponent's response.",
    "effects": [
      {
        "op": "negateResponse"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "263": {
    "name": "Notice: No Addendum",
    "text": "Negate a targeted effect, or protect one destruction.",
    "effects": [
      {
        "op": "targetOrBattleNegate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "264": {
    "name": "Notice: Extra Addendum",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "265": {
    "name": "Notice: Broken Telex",
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
      "Ihtar"
    ]
  },
  "266": {
    "name": "Notice: Dispatch Returned",
    "text": "The opponent loses 800 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 800,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "267": {
    "name": "Notice: Legitimacy Doubt",
    "text": "Negate the declared effect.",
    "effects": [
      {
        "op": "negate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "268": {
    "name": "Notice: File Drift",
    "text": "When the opponent summons an officer, gain 200 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "kind": "trap"
      }
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
      "Ihtar"
    ]
  },
  "269": {
    "name": "Notice: Queue Drift",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "270": {
    "name": "Notice: Visa Refused",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "271": {
    "name": "Notice: Referral Returned",
    "text": "Cancel the summon; the card goes to the archive.",
    "effects": [
      {
        "op": "cancelSummonToGrave"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "272": {
    "name": "Notice: Footnote Fails",
    "text": "The opponent cannot activate orders this turn.",
    "effects": [
      {
        "op": "flag",
        "name": "noSpells",
        "value": true,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "273": {
    "name": "Notice: Cover Fails",
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
      "Ihtar"
    ]
  },
  "274": {
    "name": "Notice: Distribution Error",
    "text": "Cancel the attack.",
    "effects": [
      {
        "op": "cancelAttack"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "275": {
    "name": "Notice: Record Fails",
    "text": "Destroy the source of the pending action.",
    "effects": [
      {
        "op": "pendingTarget"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "276": {
    "name": "Notice: Copy Mismatch",
    "text": "Skip the Crisis phase.",
    "effects": [
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "277": {
    "name": "Notice: Stamp Mismatch",
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
      "Ihtar"
    ]
  },
  "278": {
    "name": "Notice: Off Agenda",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "279": {
    "name": "Notice: Interim Line",
    "text": "The opponent discards 1 card.",
    "effects": [
      {
        "op": "discard",
        "count": 1,
        "opponent": true,
        "random": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "280": {
    "name": "Notice: Not Final",
    "text": "Negate the opponent's response.",
    "effects": [
      {
        "op": "negateResponse"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "281": {
    "name": "Notice: Draft Remains",
    "text": "Negate a targeted effect, or protect one destruction.",
    "effects": [
      {
        "op": "targetOrBattleNegate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "282": {
    "name": "Notice: Taken as Final",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "283": {
    "name": "Notice: Internal Circular",
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
      "Ihtar"
    ]
  },
  "284": {
    "name": "Notice: No External Leak",
    "text": "The opponent loses 1100 KP.",
    "effects": [
      {
        "op": "points",
        "amount": 1100,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "285": {
    "name": "Notice: Briefing Cancelled",
    "text": "Negate the declared effect.",
    "effects": [
      {
        "op": "negate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "286": {
    "name": "Notice: Cabinet Postponed",
    "text": "When the opponent summons an officer, gain 200 KP.",
    "effects": [],
    "traits": {
      "aura": {
        "kind": "trap"
      }
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
      "Ihtar"
    ]
  },
  "287": {
    "name": "Notice: Command Silent",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "288": {
    "name": "Notice: Archive Locked",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "289": {
    "name": "Notice: Hard Redaction",
    "text": "Cancel the summon; the card goes to the archive.",
    "effects": [
      {
        "op": "cancelSummonToGrave"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "290": {
    "name": "Notice: Initial Chain",
    "text": "The opponent cannot activate orders this turn.",
    "effects": [
      {
        "op": "flag",
        "name": "noSpells",
        "value": true,
        "opponent": true
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "291": {
    "name": "Notice: Signature Chain",
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
      "Ihtar"
    ]
  },
  "292": {
    "name": "Notice: Late Distribution",
    "text": "Cancel the attack.",
    "effects": [
      {
        "op": "cancelAttack"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "293": {
    "name": "Notice: Annex Table",
    "text": "Destroy the source of the pending action.",
    "effects": [
      {
        "op": "pendingTarget"
      },
      {
        "op": "destroy"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "294": {
    "name": "Notice: Two Columns",
    "text": "Skip the Crisis phase.",
    "effects": [
      {
        "op": "skipBattle"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "295": {
    "name": "Notice: One Column",
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
      "Ihtar"
    ]
  },
  "296": {
    "name": "Notice: Closed Copy",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "297": {
    "name": "Notice: Open Copy",
    "text": "The opponent discards 1 card.",
    "effects": [
      {
        "op": "discard",
        "count": 1,
        "opponent": true,
        "random": false
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "298": {
    "name": "Notice: Crisis Chart",
    "text": "Negate the opponent's response.",
    "effects": [
      {
        "op": "negateResponse"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "299": {
    "name": "Notice: Broken Tempo",
    "text": "Negate a targeted effect, or protect one destruction.",
    "effects": [
      {
        "op": "targetOrBattleNegate"
      }
    ],
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  },
  "300": {
    "name": "Notice: Desk Emptied",
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
    "traits": {},
    "triggers": [],
    "series": [
      "Ihtar"
    ]
  }
};
