/** Authored İHTİLAL dosya catalog. Unique ids, titles, effects. */
export const CARDS = [
  {
    "id": "ITL-001",
    "title": {
      "tr": "Nüfus Paftası",
      "en": "Census Folio"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Pafta açılınca isimler yerinden oynar.",
      "en": "When the folio opens, names shift their places."
    },
    "a11y": {
      "tr": "Nüfus Paftası. Pafta açılınca isimler yerinden oynar.",
      "en": "Census Folio. When the folio opens, names shift their places."
    },
    "chain": {
      "id": "pafta-ac",
      "step": 1
    }
  },
  {
    "id": "ITL-002",
    "title": {
      "tr": "Sicil Hulasası",
      "en": "Record Abstract"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 2
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Hulasada üç satır eksik kalır; eksik satır işe yarar.",
      "en": "Three lines are missing from the abstract; the gap is useful."
    },
    "a11y": {
      "tr": "Sicil Hulasası. Hulasada üç satır eksik kalır; eksik satır işe yarar.",
      "en": "Record Abstract. Three lines are missing from the abstract; the gap is useful."
    },
    "chain": {
      "id": "pafta-ac",
      "step": 2
    }
  },
  {
    "id": "ITL-003",
    "title": {
      "tr": "Kıdem Cetveli",
      "en": "Seniority Ledger"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kıdem yazılınca itiraz geç gelir.",
      "en": "Once seniority is written, objection arrives late."
    },
    "a11y": {
      "tr": "Kıdem Cetveli. Kıdem yazılınca itiraz geç gelir.",
      "en": "Seniority Ledger. Once seniority is written, objection arrives late."
    },
    "chain": {
      "id": "sicil-hulasas",
      "step": 1
    }
  },
  {
    "id": "ITL-004",
    "title": {
      "tr": "Terfi Askısı",
      "en": "Promotion Hold"
    },
    "type": "artci",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 2
      },
      {
        "op": "pull",
        "desk": "manset",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Askıdaki isim henüz masaya inmemiştir.",
      "en": "The name on hold has not yet reached the desk."
    },
    "a11y": {
      "tr": "Terfi Askısı. Askıdaki isim henüz masaya inmemiştir.",
      "en": "Promotion Hold. The name on hold has not yet reached the desk."
    },
    "chain": {
      "id": "sicil-hulasas",
      "step": 2
    }
  },
  {
    "id": "ITL-005",
    "title": {
      "tr": "Görev Notu",
      "en": "Duty Note"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kısa not, uzun dosyayı keser.",
      "en": "A short note cuts a long file."
    },
    "a11y": {
      "tr": "Görev Notu. Kısa not, uzun dosyayı keser.",
      "en": "Duty Note. A short note cuts a long file."
    }
  },
  {
    "id": "ITL-006",
    "title": {
      "tr": "İzin Defteri",
      "en": "Leave Register"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "sicil",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İzinli sayılan kalem cevap veremez.",
      "en": "A clerk marked on leave cannot answer."
    },
    "a11y": {
      "tr": "İzin Defteri. İzinli sayılan kalem cevap veremez.",
      "en": "Leave Register. A clerk marked on leave cannot answer."
    }
  },
  {
    "id": "ITL-007",
    "title": {
      "tr": "Yemin Zabtı",
      "en": "Oath Minute"
    },
    "type": "muhurluk",
    "desk": "sicil",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 3
      },
      {
        "op": "hukum",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Yemin zabtı mühür ister, ağız yetmez.",
      "en": "The oath minute wants a seal, not a mouth."
    },
    "a11y": {
      "tr": "Yemin Zabtı. Yemin zabtı mühür ister, ağız yetmez.",
      "en": "Oath Minute. The oath minute wants a seal, not a mouth."
    }
  },
  {
    "id": "ITL-008",
    "title": {
      "tr": "Tebligat Pulu",
      "en": "Service Stamp"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Pul yapışınca dosya yürür.",
      "en": "Once the stamp sticks, the file walks."
    },
    "a11y": {
      "tr": "Tebligat Pulu. Pul yapışınca dosya yürür.",
      "en": "Service Stamp. Once the stamp sticks, the file walks."
    }
  },
  {
    "id": "ITL-009",
    "title": {
      "tr": "Şahıs Föyü",
      "en": "Person Dossier"
    },
    "type": "heyet",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Föy tek masaya sığmaz.",
      "en": "The dossier does not fit a single desk."
    },
    "a11y": {
      "tr": "Şahıs Föyü. Föy tek masaya sığmaz.",
      "en": "Person Dossier. The dossier does not fit a single desk."
    },
    "chain": {
      "id": "imza-sirkuler",
      "step": 1
    }
  },
  {
    "id": "ITL-010",
    "title": {
      "tr": "Arşiv Fişi",
      "en": "Archive Slip"
    },
    "type": "artci",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 1,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Fiş kaybolursa dosya da kaybolmuş sayılır.",
      "en": "If the slip vanishes, the file is treated as gone."
    },
    "a11y": {
      "tr": "Arşiv Fişi. Fiş kaybolursa dosya da kaybolmuş sayılır.",
      "en": "Archive Slip. If the slip vanishes, the file is treated as gone."
    }
  },
  {
    "id": "ITL-011",
    "title": {
      "tr": "Nakil Pusulası",
      "en": "Transfer Chit"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Nakil, ismi masadan masaya taşır.",
      "en": "Transfer carries the name from desk to desk."
    },
    "a11y": {
      "tr": "Nakil Pusulası. Nakil, ismi masadan masaya taşır.",
      "en": "Transfer Chit. Transfer carries the name from desk to desk."
    }
  },
  {
    "id": "ITL-012",
    "title": {
      "tr": "Memuriyet Cüzdanı",
      "en": "Service Booklet"
    },
    "type": "karsi",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "sicil-hatti",
    "exclusive": "kalemci",
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "sicil"
      },
      {
        "op": "pull",
        "desk": "sicil",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Cüzdan açılınca karşı iddia durur.",
      "en": "When the booklet opens, the counter-claim stops."
    },
    "a11y": {
      "tr": "Memuriyet Cüzdanı. Cüzdan açılınca karşı iddia durur.",
      "en": "Service Booklet. When the booklet opens, the counter-claim stops."
    }
  },
  {
    "id": "ITL-013",
    "title": {
      "tr": "Ödenek Cetveli",
      "en": "Appropriation Roll"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Cetvelde kalem kalem durur; toplam ayrı konuşur.",
      "en": "The roll lists line by line; the total speaks separately."
    },
    "a11y": {
      "tr": "Ödenek Cetveli. Cetvelde kalem kalem durur; toplam ayrı konuşur.",
      "en": "Appropriation Roll. The roll lists line by line; the total speaks separately."
    },
    "chain": {
      "id": "cetvel-kirma",
      "step": 1
    }
  },
  {
    "id": "ITL-014",
    "title": {
      "tr": "Avans Bordrosu",
      "en": "Advance Sheet"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Avans yazılınca geri dönüş gecikir.",
      "en": "Once the advance is written, return is delayed."
    },
    "a11y": {
      "tr": "Avans Bordrosu. Avans yazılınca geri dönüş gecikir.",
      "en": "Advance Sheet. Once the advance is written, return is delayed."
    },
    "chain": {
      "id": "cetvel-kirma",
      "step": 2
    }
  },
  {
    "id": "ITL-015",
    "title": {
      "tr": "Mühürlü Makbuz",
      "en": "Sealed Receipt"
    },
    "type": "muhurluk",
    "desk": "kasa",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "seal",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Makbuz mühürsüzse kasa onu görmez.",
      "en": "Without a seal the till does not see the receipt."
    },
    "a11y": {
      "tr": "Mühürlü Makbuz. Makbuz mühürsüzse kasa onu görmez.",
      "en": "Sealed Receipt. Without a seal the till does not see the receipt."
    },
    "chain": {
      "id": "kasa-mutabakat",
      "step": 1
    }
  },
  {
    "id": "ITL-016",
    "title": {
      "tr": "Tahakkuk Fişi",
      "en": "Accrual Slip"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Tahakkuk, henüz paranın konuşmadığı yerdir.",
      "en": "Accrual is where the money has not yet spoken."
    },
    "a11y": {
      "tr": "Tahakkuk Fişi. Tahakkuk, henüz paranın konuşmadığı yerdir.",
      "en": "Accrual Slip. Accrual is where the money has not yet spoken."
    },
    "chain": {
      "id": "kasa-mutabakat",
      "step": 2
    }
  },
  {
    "id": "ITL-017",
    "title": {
      "tr": "Bütçe Kalemi",
      "en": "Budget Line"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "pull",
        "desk": "kasa",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Kalem açılır, başka kalem kapanır.",
      "en": "A line opens and another line closes."
    },
    "a11y": {
      "tr": "Bütçe Kalemi. Kalem açılır, başka kalem kapanır.",
      "en": "Budget Line. A line opens and another line closes."
    },
    "chain": {
      "id": "icmal-defter",
      "step": 1
    }
  },
  {
    "id": "ITL-018",
    "title": {
      "tr": "Dondurulmuş Ödenek",
      "en": "Frozen Appropriation"
    },
    "type": "artci",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 2,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "kasa",
        "n": 2,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Dondurulmuş ödenek ısınmayı bekler.",
      "en": "A frozen appropriation waits to warm."
    },
    "a11y": {
      "tr": "Dondurulmuş Ödenek. Dondurulmuş ödenek ısınmayı bekler.",
      "en": "Frozen Appropriation. A frozen appropriation waits to warm."
    },
    "chain": {
      "id": "icmal-defter",
      "step": 2
    }
  },
  {
    "id": "ITL-019",
    "title": {
      "tr": "Vize Edilmiş Fatura",
      "en": "Visaed Invoice"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 1,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Vize, faturanın yürüyüş iznidir.",
      "en": "The visa is the invoice's walking permit."
    },
    "a11y": {
      "tr": "Vize Edilmiş Fatura. Vize, faturanın yürüyüş iznidir.",
      "en": "Visaed Invoice. The visa is the invoice's walking permit."
    }
  },
  {
    "id": "ITL-020",
    "title": {
      "tr": "Kasa Tutanağı",
      "en": "Till Minute"
    },
    "type": "heyet",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Tutanak iki kalemin ortak elidir.",
      "en": "The minute is the joint hand of two pens."
    },
    "a11y": {
      "tr": "Kasa Tutanağı. Tutanak iki kalemin ortak elidir.",
      "en": "Till Minute. The minute is the joint hand of two pens."
    },
    "chain": {
      "id": "tediye-emri",
      "step": 1
    }
  },
  {
    "id": "ITL-021",
    "title": {
      "tr": "Mutabakat",
      "en": "Reconciliation"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Mutabakat, anlaşmazlığı rakama çevirir.",
      "en": "Reconciliation turns a dispute into a figure."
    },
    "a11y": {
      "tr": "Mutabakat. Mutabakat, anlaşmazlığı rakama çevirir.",
      "en": "Reconciliation. Reconciliation turns a dispute into a figure."
    },
    "chain": {
      "id": "tediye-emri",
      "step": 2
    }
  },
  {
    "id": "ITL-022",
    "title": {
      "tr": "Sayman Zabtı",
      "en": "Accountant Minute"
    },
    "type": "karsi",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "kasa"
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Sayman imzası karşı hamleyi durdurur.",
      "en": "The accountant's signature stops the counter-move."
    },
    "a11y": {
      "tr": "Sayman Zabtı. Sayman imzası karşı hamleyi durdurur.",
      "en": "Accountant Minute. The accountant's signature stops the counter-move."
    }
  },
  {
    "id": "ITL-023",
    "title": {
      "tr": "Teminat Mektubu",
      "en": "Guarantee Letter"
    },
    "type": "muhurluk",
    "desk": "kasa",
    "cost": 3,
    "seal": 2,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 3
      },
      {
        "op": "protect",
        "desk": "kasa"
      }
    ],
    "flavor": {
      "tr": "Teminat, henüz ödenmemiş bir vaattir.",
      "en": "A guarantee is a promise not yet paid."
    },
    "a11y": {
      "tr": "Teminat Mektubu. Teminat, henüz ödenmemiş bir vaattir.",
      "en": "Guarantee Letter. A guarantee is a promise not yet paid."
    }
  },
  {
    "id": "ITL-024",
    "title": {
      "tr": "Reddiye",
      "en": "Refusal Slip"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "kasa-defteri",
    "exclusive": "hesapci",
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "kasa",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Reddiye, kalemi masadan kaldırır.",
      "en": "The refusal lifts the pen from the desk."
    },
    "a11y": {
      "tr": "Reddiye. Reddiye, kalemi masadan kaldırır.",
      "en": "Refusal Slip. The refusal lifts the pen from the desk."
    }
  },
  {
    "id": "ITL-025",
    "title": {
      "tr": "Manşet Provası",
      "en": "Headline Proof"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Prova, henüz halka inmemiş bir cümledir.",
      "en": "A proof is a sentence that has not yet reached the public."
    },
    "a11y": {
      "tr": "Manşet Provası. Prova, henüz halka inmemiş bir cümledir.",
      "en": "Headline Proof. A proof is a sentence that has not yet reached the public."
    },
    "chain": {
      "id": "manset-prova",
      "step": 1
    }
  },
  {
    "id": "ITL-026",
    "title": {
      "tr": "Tekzip Taslağı",
      "en": "Correction Draft"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "pull",
        "desk": "manset",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Tekzip, dünün manşetini bugüne bağlar.",
      "en": "A correction binds yesterday's headline to today."
    },
    "a11y": {
      "tr": "Tekzip Taslağı. Tekzip, dünün manşetini bugüne bağlar.",
      "en": "Correction Draft. A correction binds yesterday's headline to today."
    },
    "chain": {
      "id": "manset-prova",
      "step": 2
    }
  },
  {
    "id": "ITL-027",
    "title": {
      "tr": "Askı Şerhi",
      "en": "Hold Annotation"
    },
    "type": "artci",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 2
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Şerh düşünce sayı beklemeye alınır.",
      "en": "Once annotated, the issue is held."
    },
    "a11y": {
      "tr": "Askı Şerhi. Şerh düşünce sayı beklemeye alınır.",
      "en": "Hold Annotation. Once annotated, the issue is held."
    },
    "chain": {
      "id": "dizgi-hata",
      "step": 1
    }
  },
  {
    "id": "ITL-028",
    "title": {
      "tr": "Dizgi Hataları",
      "en": "Typesetting Faults"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "manset",
        "n": 2,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Hata, rakibin cümlesini bozar.",
      "en": "A fault breaks the opponent's sentence."
    },
    "a11y": {
      "tr": "Dizgi Hataları. Hata, rakibin cümlesini bozar.",
      "en": "Typesetting Faults. A fault breaks the opponent's sentence."
    },
    "chain": {
      "id": "dizgi-hata",
      "step": 2
    }
  },
  {
    "id": "ITL-029",
    "title": {
      "tr": "Resmi İlan",
      "en": "Official Notice"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 2
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İlan, gazeteyi resmi kılar.",
      "en": "The notice makes the paper official."
    },
    "a11y": {
      "tr": "Resmi İlan. İlan, gazeteyi resmi kılar.",
      "en": "Official Notice. The notice makes the paper official."
    },
    "chain": {
      "id": "ikinci-baski",
      "step": 1
    }
  },
  {
    "id": "ITL-030",
    "title": {
      "tr": "Ajans Bülteni",
      "en": "Agency Bulletin"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Bülten gelir; manşet seçilir.",
      "en": "The bulletin arrives; the headline is chosen."
    },
    "a11y": {
      "tr": "Ajans Bülteni. Bülten gelir; manşet seçilir.",
      "en": "Agency Bulletin. The bulletin arrives; the headline is chosen."
    },
    "chain": {
      "id": "ikinci-baski",
      "step": 2
    }
  },
  {
    "id": "ITL-031",
    "title": {
      "tr": "Baskı Durdurma",
      "en": "Stop Press"
    },
    "type": "karsi",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "manset"
      },
      {
        "op": "pull",
        "desk": "manset",
        "n": 2,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Makine durunca cümle yarım kalır.",
      "en": "When the press stops, the sentence is left half-done."
    },
    "a11y": {
      "tr": "Baskı Durdurma. Makine durunca cümle yarım kalır.",
      "en": "Stop Press. When the press stops, the sentence is left half-done."
    }
  },
  {
    "id": "ITL-032",
    "title": {
      "tr": "Sarı Bant",
      "en": "Yellow Band"
    },
    "type": "artci",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 1,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Sarı bant, okunacak yeri işaretler.",
      "en": "The yellow band marks what will be read."
    },
    "a11y": {
      "tr": "Sarı Bant. Sarı bant, okunacak yeri işaretler.",
      "en": "Yellow Band. The yellow band marks what will be read."
    }
  },
  {
    "id": "ITL-033",
    "title": {
      "tr": "Başyazı Taslağı",
      "en": "Leader Draft"
    },
    "type": "heyet",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Başyazı, koridordan geçer sonra basılır.",
      "en": "The leader walks the corridor before it prints."
    },
    "a11y": {
      "tr": "Başyazı Taslağı. Başyazı, koridordan geçer sonra basılır.",
      "en": "Leader Draft. The leader walks the corridor before it prints."
    }
  },
  {
    "id": "ITL-034",
    "title": {
      "tr": "Fotoğraf Altı",
      "en": "Caption Line"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Alt yazı, görüntüyü başka yere çeker.",
      "en": "The caption pulls the image somewhere else."
    },
    "a11y": {
      "tr": "Fotoğraf Altı. Alt yazı, görüntüyü başka yere çeker.",
      "en": "Caption Line. The caption pulls the image somewhere else."
    }
  },
  {
    "id": "ITL-035",
    "title": {
      "tr": "Matbaa Nöbeti",
      "en": "Press Watch"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Gece baskısı ayrı bir nöbettir.",
      "en": "The night press is a watch of its own."
    },
    "a11y": {
      "tr": "Matbaa Nöbeti. Gece baskısı ayrı bir nöbettir.",
      "en": "Press Watch. The night press is a watch of its own."
    }
  },
  {
    "id": "ITL-036",
    "title": {
      "tr": "Dağıtım Listesi",
      "en": "Distribution List"
    },
    "type": "muhurluk",
    "desk": "manset",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": "manset-dizgi",
    "exclusive": "mansetci",
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 3
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Liste kimdeyse sayı oraya gider.",
      "en": "Whoever holds the list, the issue goes there."
    },
    "a11y": {
      "tr": "Dağıtım Listesi. Liste kimdeyse sayı oraya gider.",
      "en": "Distribution List. Whoever holds the list, the issue goes there."
    }
  },
  {
    "id": "ITL-037",
    "title": {
      "tr": "Üç İmza Eksik",
      "en": "Three Signatures Short"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Eksik imza, dosyayı koridorda tutar.",
      "en": "A missing signature keeps the file in the corridor."
    },
    "a11y": {
      "tr": "Üç İmza Eksik. Eksik imza, dosyayı koridorda tutar.",
      "en": "Three Signatures Short. A missing signature keeps the file in the corridor."
    },
    "chain": {
      "id": "uc-imza",
      "step": 1
    }
  },
  {
    "id": "ITL-038",
    "title": {
      "tr": "Paraf Zinciri",
      "en": "Initials Chain"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 2
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Paraf yürür; imza sonra gelir.",
      "en": "Initials walk; the signature comes later."
    },
    "a11y": {
      "tr": "Paraf Zinciri. Paraf yürür; imza sonra gelir.",
      "en": "Initials Chain. Initials walk; the signature comes later."
    },
    "chain": {
      "id": "uc-imza",
      "step": 2
    }
  },
  {
    "id": "ITL-039",
    "title": {
      "tr": "Kapı Aralığı",
      "en": "Door Gap"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Aralıktan bakmak da bir bilgidir.",
      "en": "Looking through the gap is also information."
    },
    "a11y": {
      "tr": "Kapı Aralığı. Aralıktan bakmak da bir bilgidir.",
      "en": "Door Gap. Looking through the gap is also information."
    },
    "chain": {
      "id": "uc-imza",
      "step": 3
    }
  },
  {
    "id": "ITL-040",
    "title": {
      "tr": "Bekleme Koltuğu",
      "en": "Waiting Chair"
    },
    "type": "artci",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 2
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Koltuk dolunca sıra değişir.",
      "en": "When the chair fills, the order changes."
    },
    "a11y": {
      "tr": "Bekleme Koltuğu. Koltuk dolunca sıra değişir.",
      "en": "Waiting Chair. When the chair fills, the order changes."
    },
    "chain": {
      "id": "paraf-bekler",
      "step": 1
    }
  },
  {
    "id": "ITL-041",
    "title": {
      "tr": "Dış Yazı",
      "en": "Outgoing Paper"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Dış yazı, koridoru sokağa bağlar.",
      "en": "Outgoing paper ties the corridor to the street."
    },
    "a11y": {
      "tr": "Dış Yazı. Dış yazı, koridoru sokağa bağlar.",
      "en": "Outgoing Paper. Outgoing paper ties the corridor to the street."
    },
    "chain": {
      "id": "paraf-bekler",
      "step": 2
    }
  },
  {
    "id": "ITL-042",
    "title": {
      "tr": "İç Yazı",
      "en": "Internal Paper"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İç yazı, isimleri yerinde tutar.",
      "en": "Internal paper keeps the names in place."
    },
    "a11y": {
      "tr": "İç Yazı. İç yazı, isimleri yerinde tutar.",
      "en": "Internal Paper. Internal paper keeps the names in place."
    },
    "chain": {
      "id": "havale-zincir",
      "step": 1
    }
  },
  {
    "id": "ITL-043",
    "title": {
      "tr": "Havale",
      "en": "Referral Slip"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Havale, dosyayı başka ele verir.",
      "en": "Referral puts the file in another hand."
    },
    "a11y": {
      "tr": "Havale. Havale, dosyayı başka ele verir.",
      "en": "Referral Slip. Referral puts the file in another hand."
    },
    "chain": {
      "id": "havale-zincir",
      "step": 2
    }
  },
  {
    "id": "ITL-044",
    "title": {
      "tr": "Tevzi Pusulası",
      "en": "Dispatch Chit"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Tevzi, kimin okuyacağını seçer.",
      "en": "Dispatch chooses who will read it."
    },
    "a11y": {
      "tr": "Tevzi Pusulası. Tevzi, kimin okuyacağını seçer.",
      "en": "Dispatch Chit. Dispatch chooses who will read it."
    },
    "chain": {
      "id": "tevzi-pusula",
      "step": 1
    }
  },
  {
    "id": "ITL-045",
    "title": {
      "tr": "Paraf Bekler",
      "en": "Awaiting Initials"
    },
    "type": "artci",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 1,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 2
      },
      {
        "op": "pull",
        "desk": "koridor",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Bekleyen paraf, rakibi yorar.",
      "en": "Waiting initials tire the opponent."
    },
    "a11y": {
      "tr": "Paraf Bekler. Bekleyen paraf, rakibi yorar.",
      "en": "Awaiting Initials. Waiting initials tire the opponent."
    },
    "chain": {
      "id": "tevzi-pusula",
      "step": 2
    }
  },
  {
    "id": "ITL-046",
    "title": {
      "tr": "Elden Teslim",
      "en": "Hand Delivery"
    },
    "type": "karsi",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "koridor"
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Elden giden dosya kaybolmaz.",
      "en": "A file delivered by hand does not vanish."
    },
    "a11y": {
      "tr": "Elden Teslim. Elden giden dosya kaybolmaz.",
      "en": "Hand Delivery. A file delivered by hand does not vanish."
    }
  },
  {
    "id": "ITL-047",
    "title": {
      "tr": "Üst Yazı",
      "en": "Cover Note"
    },
    "type": "heyet",
    "desk": "koridor",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Üst yazı, bütün masaları selamlar.",
      "en": "The cover note greets every desk."
    },
    "a11y": {
      "tr": "Üst Yazı. Üst yazı, bütün masaları selamlar.",
      "en": "Cover Note. The cover note greets every desk."
    }
  },
  {
    "id": "ITL-048",
    "title": {
      "tr": "İmzaya Gider",
      "en": "Sent for Signature"
    },
    "type": "muhurluk",
    "desk": "koridor",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": "imza-zinciri",
    "exclusive": "koridorcu",
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 3
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İmzaya giden dosya geri dönünce ağırlaşır.",
      "en": "A file sent for signature returns heavier."
    },
    "a11y": {
      "tr": "İmzaya Gider. İmzaya giden dosya geri dönünce ağırlaşır.",
      "en": "Sent for Signature. A file sent for signature returns heavier."
    }
  },
  {
    "id": "ITL-049",
    "title": {
      "tr": "Gece Defteri",
      "en": "Night Ledger"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Gece yazılan, sabah okunur.",
      "en": "What is written at night is read at dawn."
    },
    "a11y": {
      "tr": "Gece Defteri. Gece yazılan, sabah okunur.",
      "en": "Night Ledger. What is written at night is read at dawn."
    },
    "chain": {
      "id": "gece-devri",
      "step": 1
    }
  },
  {
    "id": "ITL-050",
    "title": {
      "tr": "Nöbet Tutanağı",
      "en": "Watch Minute"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 2
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Tutanak, ısının düştüğü saati kaydeder.",
      "en": "The minute records the hour heat fell."
    },
    "a11y": {
      "tr": "Nöbet Tutanağı. Tutanak, ısının düştüğü saati kaydeder.",
      "en": "Watch Minute. The minute records the hour heat fell."
    },
    "chain": {
      "id": "gece-devri",
      "step": 2
    }
  },
  {
    "id": "ITL-051",
    "title": {
      "tr": "Anahtar Teslimi",
      "en": "Key Handover"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "protect",
        "desk": "nobet"
      }
    ],
    "flavor": {
      "tr": "Anahtar kimin elindeyse kapı onundur.",
      "en": "Whoever holds the key holds the door."
    },
    "a11y": {
      "tr": "Anahtar Teslimi. Anahtar kimin elindeyse kapı onundur.",
      "en": "Key Handover. Whoever holds the key holds the door."
    },
    "chain": {
      "id": "nobet-teslim",
      "step": 1
    }
  },
  {
    "id": "ITL-052",
    "title": {
      "tr": "Lamba Söndü",
      "en": "Lamp Out"
    },
    "type": "artci",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 2
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Lamba sönünce kimse bakmaz sandılar.",
      "en": "When the lamp went out they thought no one was looking."
    },
    "a11y": {
      "tr": "Lamba Söndü. Lamba sönünce kimse bakmaz sandılar.",
      "en": "Lamp Out. When the lamp went out they thought no one was looking."
    },
    "chain": {
      "id": "nobet-teslim",
      "step": 2
    }
  },
  {
    "id": "ITL-053",
    "title": {
      "tr": "Mühür Kesesi",
      "en": "Seal Pouch"
    },
    "type": "muhurluk",
    "desk": "nobet",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": true,
    "effect": [
      {
        "op": "seal",
        "n": 2
      },
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kese açılmadan mühür konuşmaz.",
      "en": "Until the pouch opens, the seal does not speak."
    },
    "a11y": {
      "tr": "Mühür Kesesi. Kese açılmadan mühür konuşmaz.",
      "en": "Seal Pouch. Until the pouch opens, the seal does not speak."
    },
    "chain": {
      "id": "muhur-kesesi",
      "step": 1
    }
  },
  {
    "id": "ITL-054",
    "title": {
      "tr": "Sabah Teslimi",
      "en": "Dawn Handover"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Sabah teslimi geceyi sicile bağlar.",
      "en": "Dawn handover binds the night to the register."
    },
    "a11y": {
      "tr": "Sabah Teslimi. Sabah teslimi geceyi sicile bağlar.",
      "en": "Dawn Handover. Dawn handover binds the night to the register."
    },
    "chain": {
      "id": "muhur-kesesi",
      "step": 2
    }
  },
  {
    "id": "ITL-055",
    "title": {
      "tr": "Nöbet Değişimi",
      "en": "Watch Change"
    },
    "type": "heyet",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Değişimde kasa da sayılır.",
      "en": "At the changeover the till is counted too."
    },
    "a11y": {
      "tr": "Nöbet Değişimi. Değişimde kasa da sayılır.",
      "en": "Watch Change. At the changeover the till is counted too."
    },
    "chain": {
      "id": "yangin-defter",
      "step": 1
    }
  },
  {
    "id": "ITL-056",
    "title": {
      "tr": "Kapı Kilidi",
      "en": "Door Lock"
    },
    "type": "karsi",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "nobet"
      },
      {
        "op": "pull",
        "desk": "nobet",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Kilit, karşı dosyayı dışarıda bırakır.",
      "en": "The lock leaves the opposing file outside."
    },
    "a11y": {
      "tr": "Kapı Kilidi. Kilit, karşı dosyayı dışarıda bırakır.",
      "en": "Door Lock. The lock leaves the opposing file outside."
    }
  },
  {
    "id": "ITL-057",
    "title": {
      "tr": "Yangın Defteri",
      "en": "Fire Ledger"
    },
    "type": "artci",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 1,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "heat",
        "n": -2
      }
    ],
    "flavor": {
      "tr": "Yangın defteri ısının düşmesini ister.",
      "en": "The fire ledger wants the heat to fall."
    },
    "a11y": {
      "tr": "Yangın Defteri. Yangın defteri ısının düşmesini ister.",
      "en": "Fire Ledger. The fire ledger wants the heat to fall."
    },
    "chain": {
      "id": "yangin-defter",
      "step": 2
    }
  },
  {
    "id": "ITL-058",
    "title": {
      "tr": "Jeneratör Notu",
      "en": "Generator Note"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Not, ışığın kimde kaldığını yazar.",
      "en": "The note writes who still has the light."
    },
    "a11y": {
      "tr": "Jeneratör Notu. Not, ışığın kimde kaldığını yazar.",
      "en": "Generator Note. The note writes who still has the light."
    }
  },
  {
    "id": "ITL-059",
    "title": {
      "tr": "Gece Ziyareti",
      "en": "Night Visit"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Ziyaret, nöbeti başka ele kaydırır.",
      "en": "The visit shifts the watch to another hand."
    },
    "a11y": {
      "tr": "Gece Ziyareti. Ziyaret, nöbeti başka ele kaydırır.",
      "en": "Night Visit. The visit shifts the watch to another hand."
    }
  },
  {
    "id": "ITL-060",
    "title": {
      "tr": "Nöbet Telefonu",
      "en": "Watch Telephone"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "gece-defteri",
    "exclusive": "nobetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Telefon çalınca defter açılır.",
      "en": "When the telephone rings, the ledger opens."
    },
    "a11y": {
      "tr": "Nöbet Telefonu. Telefon çalınca defter açılır.",
      "en": "Watch Telephone. When the telephone rings, the ledger opens."
    }
  },
  {
    "id": "ITL-061",
    "title": {
      "tr": "Heyet Kararı",
      "en": "Board Ruling"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 2
      },
      {
        "op": "hukum",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Karar, tek masaya sığmaz.",
      "en": "A ruling does not fit a single desk."
    },
    "a11y": {
      "tr": "Heyet Kararı. Karar, tek masaya sığmaz.",
      "en": "Board Ruling. A ruling does not fit a single desk."
    },
    "chain": {
      "id": "heyet-ara",
      "step": 1
    }
  },
  {
    "id": "ITL-062",
    "title": {
      "tr": "Komisyon Zabtı",
      "en": "Commission Minute"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Zabıt, beş kalemin ortak cümlesidir.",
      "en": "The minute is the shared sentence of five pens."
    },
    "a11y": {
      "tr": "Komisyon Zabtı. Zabıt, beş kalemin ortak cümlesidir.",
      "en": "Commission Minute. The minute is the shared sentence of five pens."
    },
    "chain": {
      "id": "heyet-ara",
      "step": 2
    }
  },
  {
    "id": "ITL-063",
    "title": {
      "tr": "Ortak İmza",
      "en": "Joint Signature"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Ortak imza, koridoru kısaltır.",
      "en": "A joint signature shortens the corridor."
    },
    "a11y": {
      "tr": "Ortak İmza. Ortak imza, koridoru kısaltır.",
      "en": "Joint Signature. A joint signature shortens the corridor."
    },
    "chain": {
      "id": "karar-ozet",
      "step": 1
    }
  },
  {
    "id": "ITL-064",
    "title": {
      "tr": "Ara Karar",
      "en": "Interim Ruling"
    },
    "type": "artci",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 2,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 2
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Ara karar, asıl hükmü bekletir.",
      "en": "The interim ruling holds the main one."
    },
    "a11y": {
      "tr": "Ara Karar. Ara karar, asıl hükmü bekletir.",
      "en": "Interim Ruling. The interim ruling holds the main one."
    },
    "chain": {
      "id": "karar-ozet",
      "step": 2
    }
  },
  {
    "id": "ITL-065",
    "title": {
      "tr": "Kurul Gündemi",
      "en": "Board Agenda"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Gündem, hangi dosyanın konuşacağını seçer.",
      "en": "The agenda chooses which file will speak."
    },
    "a11y": {
      "tr": "Kurul Gündemi. Gündem, hangi dosyanın konuşacağını seçer.",
      "en": "Board Agenda. The agenda chooses which file will speak."
    }
  },
  {
    "id": "ITL-066",
    "title": {
      "tr": "Muhalefet Şerhi",
      "en": "Dissent Note"
    },
    "type": "karsi",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "any",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Şerh, kararı tek ağız olmaktan çıkarır.",
      "en": "The note stops the ruling from being one mouth."
    },
    "a11y": {
      "tr": "Muhalefet Şerhi. Şerh, kararı tek ağız olmaktan çıkarır.",
      "en": "Dissent Note. The note stops the ruling from being one mouth."
    }
  },
  {
    "id": "ITL-067",
    "title": {
      "tr": "Oybirliği Zabtı",
      "en": "Unanimity Minute"
    },
    "type": "muhurluk",
    "desk": "any",
    "cost": 3,
    "seal": 2,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 2
      },
      {
        "op": "hukum",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Oybirliği nadirdir; mühür ister.",
      "en": "Unanimity is rare; it wants a seal."
    },
    "a11y": {
      "tr": "Oybirliği Zabtı. Oybirliği nadirdir; mühür ister.",
      "en": "Unanimity Minute. Unanimity is rare; it wants a seal."
    }
  },
  {
    "id": "ITL-068",
    "title": {
      "tr": "Ertelenen Madde",
      "en": "Deferred Item"
    },
    "type": "artci",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 3,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 2
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Ertelenen madde unutulmaz, bekler.",
      "en": "A deferred item is not forgotten; it waits."
    },
    "a11y": {
      "tr": "Ertelenen Madde. Ertelenen madde unutulmaz, bekler.",
      "en": "Deferred Item. A deferred item is not forgotten; it waits."
    }
  },
  {
    "id": "ITL-069",
    "title": {
      "tr": "Gündem Dışı",
      "en": "Off Agenda"
    },
    "type": "acik",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "any",
        "n": 1
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Gündem dışı gelen, sırayı bozar.",
      "en": "What arrives off agenda breaks the order."
    },
    "a11y": {
      "tr": "Gündem Dışı. Gündem dışı gelen, sırayı bozar.",
      "en": "Off Agenda. What arrives off agenda breaks the order."
    }
  },
  {
    "id": "ITL-070",
    "title": {
      "tr": "Raportör Notu",
      "en": "Rapporteur Note"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Raportör, beş masayı bir cümlede toplar.",
      "en": "The rapporteur gathers five desks in one sentence."
    },
    "a11y": {
      "tr": "Raportör Notu. Raportör, beş masayı bir cümlede toplar.",
      "en": "Rapporteur Note. The rapporteur gathers five desks in one sentence."
    }
  },
  {
    "id": "ITL-071",
    "title": {
      "tr": "Ek Süre",
      "en": "Extra Time"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 1,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "ink",
        "n": 2
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Ek süre, mürekkebi uzatır.",
      "en": "Extra time stretches the ink."
    },
    "a11y": {
      "tr": "Ek Süre. Ek süre, mürekkebi uzatır.",
      "en": "Extra Time. Extra time stretches the ink."
    }
  },
  {
    "id": "ITL-072",
    "title": {
      "tr": "Dosya Birleştirme",
      "en": "File Joinder"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "heyet-cizelgesi",
    "exclusive": "heyetci",
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Birleşen dosya iki masayı konuşturur.",
      "en": "A joined file makes two desks speak."
    },
    "a11y": {
      "tr": "Dosya Birleştirme. Birleşen dosya iki masayı konuşturur.",
      "en": "File Joinder. A joined file makes two desks speak."
    }
  },
  {
    "id": "ITL-073",
    "title": {
      "tr": "Kırmızı Bant",
      "en": "Red Band"
    },
    "type": "muhurluk",
    "desk": "any",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": "kirmizi-bant",
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "protect",
        "desk": "any"
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kırmızı bant, dosyayı acele ettirmez.",
      "en": "The red band does not hurry the file."
    },
    "a11y": {
      "tr": "Kırmızı Bant. Kırmızı bant, dosyayı acele ettirmez.",
      "en": "Red Band. The red band does not hurry the file."
    },
    "chain": {
      "id": "aski-alma",
      "step": 1
    }
  },
  {
    "id": "ITL-074",
    "title": {
      "tr": "Askıya Alma",
      "en": "Suspension Slip"
    },
    "type": "artci",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": "kirmizi-bant",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "any",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Askıya alınan dosya ısınmaz.",
      "en": "A suspended file does not heat."
    },
    "a11y": {
      "tr": "Askıya Alma. Askıya alınan dosya ısınmaz.",
      "en": "Suspension Slip. A suspended file does not heat."
    },
    "chain": {
      "id": "aski-alma",
      "step": 2
    }
  },
  {
    "id": "ITL-075",
    "title": {
      "tr": "Kırmızı Prova",
      "en": "Red Proof"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": "kirmizi-bant",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "protect",
        "desk": "manset"
      }
    ],
    "flavor": {
      "tr": "Kırmızı prova basılmaz, bekler.",
      "en": "A red proof is not printed; it waits."
    },
    "a11y": {
      "tr": "Kırmızı Prova. Kırmızı prova basılmaz, bekler.",
      "en": "Red Proof. A red proof is not printed; it waits."
    }
  },
  {
    "id": "ITL-076",
    "title": {
      "tr": "Bant Kesildi",
      "en": "Band Cut"
    },
    "type": "karsi",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "kirmizi-bant",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "unlock",
        "desk": "any"
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Kesilen bant, kilidi tartışmaya açar.",
      "en": "A cut band opens the lock to argument."
    },
    "a11y": {
      "tr": "Bant Kesildi. Kesilen bant, kilidi tartışmaya açar.",
      "en": "Band Cut. A cut band opens the lock to argument."
    }
  },
  {
    "id": "ITL-077",
    "title": {
      "tr": "Mühür Üstü Bant",
      "en": "Band Over Seal"
    },
    "type": "muhurluk",
    "desk": "kasa",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": "kirmizi-bant",
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "protect",
        "desk": "kasa"
      },
      {
        "op": "seal",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Bant, mührün üstüne gelir.",
      "en": "The band arrives over the seal."
    },
    "a11y": {
      "tr": "Mühür Üstü Bant. Bant, mührün üstüne gelir.",
      "en": "Band Over Seal. The band arrives over the seal."
    }
  },
  {
    "id": "ITL-078",
    "title": {
      "tr": "Gizli Değil Ama",
      "en": "Not Secret, But"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "kirmizi-bant",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Gizli olmayan da okunmaz bazen.",
      "en": "What is not secret is sometimes still unread."
    },
    "a11y": {
      "tr": "Gizli Değil Ama. Gizli olmayan da okunmaz bazen.",
      "en": "Not Secret, But. What is not secret is sometimes still unread."
    }
  },
  {
    "id": "ITL-079",
    "title": {
      "tr": "Evrak Sırası",
      "en": "Paper Queue"
    },
    "type": "artci",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 1,
    "family": "kirmizi-bant",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Sıra, acele edeni cezalandırır.",
      "en": "The queue punishes the one in a hurry."
    },
    "a11y": {
      "tr": "Evrak Sırası. Sıra, acele edeni cezalandırır.",
      "en": "Paper Queue. The queue punishes the one in a hurry."
    }
  },
  {
    "id": "ITL-080",
    "title": {
      "tr": "Kilit Teslim Zabtı",
      "en": "Lock Handover Minute"
    },
    "type": "heyet",
    "desk": "nobet",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": "kirmizi-bant",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "protect",
        "desk": "nobet"
      }
    ],
    "flavor": {
      "tr": "Kilit teslimi tutanağa geçer.",
      "en": "The lock handover enters the minute."
    },
    "a11y": {
      "tr": "Kilit Teslim Zabtı. Kilit teslimi tutanağa geçer.",
      "en": "Lock Handover Minute. The lock handover enters the minute."
    }
  },
  {
    "id": "ITL-081",
    "title": {
      "tr": "Zeyilname",
      "en": "Addendum"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "zeyilname",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Zeyil, bitmiş sanılan cümleyi uzatır.",
      "en": "An addendum stretches a sentence thought finished."
    },
    "a11y": {
      "tr": "Zeyilname. Zeyil, bitmiş sanılan cümleyi uzatır.",
      "en": "Addendum. An addendum stretches a sentence thought finished."
    }
  },
  {
    "id": "ITL-082",
    "title": {
      "tr": "Zeyil Taslağı",
      "en": "Addendum Draft"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "zeyilname",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Taslak, asıl metni bekletir.",
      "en": "The draft holds the main text."
    },
    "a11y": {
      "tr": "Zeyil Taslağı. Taslak, asıl metni bekletir.",
      "en": "Addendum Draft. The draft holds the main text."
    }
  },
  {
    "id": "ITL-083",
    "title": {
      "tr": "Zeyil Reddi",
      "en": "Addendum Refusal"
    },
    "type": "karsi",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "zeyilname",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "any",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "discard",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Reddedilen zeyil, dosyayı eski haline çeker.",
      "en": "A refused addendum pulls the file back."
    },
    "a11y": {
      "tr": "Zeyil Reddi. Reddedilen zeyil, dosyayı eski haline çeker.",
      "en": "Addendum Refusal. A refused addendum pulls the file back."
    }
  },
  {
    "id": "ITL-084",
    "title": {
      "tr": "Zeyil Mühürü",
      "en": "Addendum Seal"
    },
    "type": "muhurluk",
    "desk": "kasa",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": "zeyilname",
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Zeyil mühürlenince asıl metin değişmiş sayılır.",
      "en": "Once sealed, the addendum is treated as the text."
    },
    "a11y": {
      "tr": "Zeyil Mühürü. Zeyil mühürlenince asıl metin değişmiş sayılır.",
      "en": "Addendum Seal. Once sealed, the addendum is treated as the text."
    }
  },
  {
    "id": "ITL-085",
    "title": {
      "tr": "Gecikmiş Zeyil",
      "en": "Late Addendum"
    },
    "type": "artci",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 3,
    "family": "zeyilname",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 2
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Gecikmiş zeyil, kapandı sanılanı açar.",
      "en": "A late addendum opens what was thought closed."
    },
    "a11y": {
      "tr": "Gecikmiş Zeyil. Gecikmiş zeyil, kapandı sanılanı açar.",
      "en": "Late Addendum. A late addendum opens what was thought closed."
    }
  },
  {
    "id": "ITL-086",
    "title": {
      "tr": "Zeyil Dağıtımı",
      "en": "Addendum Circulation"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "zeyilname",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Zeyil dolaşınca manşet değişir.",
      "en": "When the addendum circulates, the headline changes."
    },
    "a11y": {
      "tr": "Zeyil Dağıtımı. Zeyil dolaşınca manşet değişir.",
      "en": "Addendum Circulation. When the addendum circulates, the headline changes."
    }
  },
  {
    "id": "ITL-087",
    "title": {
      "tr": "Zeyil Özeti",
      "en": "Addendum Digest"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "zeyilname",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Özet, uzun zeyili koridorda tutar.",
      "en": "The digest keeps the long addendum in the corridor."
    },
    "a11y": {
      "tr": "Zeyil Özeti. Özet, uzun zeyili koridorda tutar.",
      "en": "Addendum Digest. The digest keeps the long addendum in the corridor."
    }
  },
  {
    "id": "ITL-088",
    "title": {
      "tr": "Zeyil İmzası",
      "en": "Addendum Signature"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": "zeyilname",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Gece atılan zeyil imzası sabah ağırdır.",
      "en": "An addendum signed at night is heavy at dawn."
    },
    "a11y": {
      "tr": "Zeyil İmzası. Gece atılan zeyil imzası sabah ağırdır.",
      "en": "Addendum Signature. An addendum signed at night is heavy at dawn."
    }
  },
  {
    "id": "ITL-089",
    "title": {
      "tr": "Harici Yazı",
      "en": "External Minute"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "dis-yazi",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Harici yazı içeriği dışarı taşır.",
      "en": "An external minute carries the inside outward."
    },
    "a11y": {
      "tr": "Harici Yazı. Harici yazı içeriği dışarı taşır.",
      "en": "External Minute. An external minute carries the inside outward."
    }
  },
  {
    "id": "ITL-090",
    "title": {
      "tr": "Cevap Yazısı",
      "en": "Reply Paper"
    },
    "type": "karsi",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "dis-yazi",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "koridor"
      },
      {
        "op": "pull",
        "desk": "koridor",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Cevap yazısı, gelen yazıyı durdurur.",
      "en": "A reply paper stops the incoming one."
    },
    "a11y": {
      "tr": "Cevap Yazısı. Cevap yazısı, gelen yazıyı durdurur.",
      "en": "Reply Paper. A reply paper stops the incoming one."
    }
  },
  {
    "id": "ITL-091",
    "title": {
      "tr": "Tehir Yazısı",
      "en": "Deferral Paper"
    },
    "type": "artci",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": "dis-yazi",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "any",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Tehir, ısının düşmesini ister.",
      "en": "Deferral wants the heat to fall."
    },
    "a11y": {
      "tr": "Tehir Yazısı. Tehir, ısının düşmesini ister.",
      "en": "Deferral Paper. Deferral wants the heat to fall."
    }
  },
  {
    "id": "ITL-092",
    "title": {
      "tr": "İade Yazısı",
      "en": "Return Paper"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "dis-yazi",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İade, ismi sahibine geri verir.",
      "en": "Return gives the name back to its owner."
    },
    "a11y": {
      "tr": "İade Yazısı. İade, ismi sahibine geri verir.",
      "en": "Return Paper. Return gives the name back to its owner."
    }
  },
  {
    "id": "ITL-093",
    "title": {
      "tr": "Duyuru Yazısı",
      "en": "Notice Paper"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "dis-yazi",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 2
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Duyuru, koridoru manşete çevirir.",
      "en": "A notice turns the corridor into a headline."
    },
    "a11y": {
      "tr": "Duyuru Yazısı. Duyuru, koridoru manşete çevirir.",
      "en": "Notice Paper. A notice turns the corridor into a headline."
    }
  },
  {
    "id": "ITL-094",
    "title": {
      "tr": "Tediye Yazısı",
      "en": "Payment Paper"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": "dis-yazi",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Tediye yazısı kasayı yürütür.",
      "en": "A payment paper walks the till."
    },
    "a11y": {
      "tr": "Tediye Yazısı. Tediye yazısı kasayı yürütür.",
      "en": "Payment Paper. A payment paper walks the till."
    }
  },
  {
    "id": "ITL-095",
    "title": {
      "tr": "Nöbet Yazısı",
      "en": "Watch Paper"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": "dis-yazi",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Nöbet yazısı geceyi resmi kılar.",
      "en": "A watch paper makes the night official."
    },
    "a11y": {
      "tr": "Nöbet Yazısı. Nöbet yazısı geceyi resmi kılar.",
      "en": "Watch Paper. A watch paper makes the night official."
    }
  },
  {
    "id": "ITL-096",
    "title": {
      "tr": "Toplu Yazı",
      "en": "Circular Paper"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": "dis-yazi",
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Toplu yazı beş masaya birden düşer.",
      "en": "A circular falls on all five desks at once."
    },
    "a11y": {
      "tr": "Toplu Yazı. Toplu yazı beş masaya birden düşer.",
      "en": "Circular Paper. A circular falls on all five desks at once."
    }
  },
  {
    "id": "ITL-097",
    "title": {
      "tr": "Tahkikat Özeti",
      "en": "Inquiry Digest"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Özet, tahkikatı kısaltır; kısaltmak da bir hükümdür.",
      "en": "The digest shortens the inquiry; shortening is also a ruling."
    },
    "a11y": {
      "tr": "Tahkikat Özeti. Özet, tahkikatı kısaltır; kısaltmak da bir hükümdür.",
      "en": "Inquiry Digest. The digest shortens the inquiry; shortening is also a ruling."
    }
  },
  {
    "id": "ITL-098",
    "title": {
      "tr": "Hizmet Belgesi",
      "en": "Service Certificate"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Belge, ismi resmi kılar.",
      "en": "The certificate makes the name official."
    },
    "a11y": {
      "tr": "Hizmet Belgesi. Belge, ismi resmi kılar.",
      "en": "Service Certificate. The certificate makes the name official."
    }
  },
  {
    "id": "ITL-099",
    "title": {
      "tr": "Disiplin Zabtı",
      "en": "Discipline Minute"
    },
    "type": "artci",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 2,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "sicil",
        "n": 2,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Zabıt, rakip ismi askıya alır.",
      "en": "The minute puts the opposing name on hold."
    },
    "a11y": {
      "tr": "Disiplin Zabtı. Zabıt, rakip ismi askıya alır.",
      "en": "Discipline Minute. The minute puts the opposing name on hold."
    }
  },
  {
    "id": "ITL-100",
    "title": {
      "tr": "İstifa Sureti",
      "en": "Resignation Copy"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "sicil",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İstifa sureti, kadroyu incelttir.",
      "en": "A resignation copy thins the roster."
    },
    "a11y": {
      "tr": "İstifa Sureti. İstifa sureti, kadroyu incelttir.",
      "en": "Resignation Copy. A resignation copy thins the roster."
    }
  },
  {
    "id": "ITL-101",
    "title": {
      "tr": "Vekalet Şerhi",
      "en": "Proxy Annotation"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Vekalet, imzayı başka ele verir.",
      "en": "A proxy puts the signature in another hand."
    },
    "a11y": {
      "tr": "Vekalet Şerhi. Vekalet, imzayı başka ele verir.",
      "en": "Proxy Annotation. A proxy puts the signature in another hand."
    }
  },
  {
    "id": "ITL-102",
    "title": {
      "tr": "Eski Fotoğraf",
      "en": "Old Photograph"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "peek"
      },
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Eski fotoğraf, yeni isimle konuşur.",
      "en": "An old photograph speaks with a new name."
    },
    "a11y": {
      "tr": "Eski Fotoğraf. Eski fotoğraf, yeni isimle konuşur.",
      "en": "Old Photograph. An old photograph speaks with a new name."
    }
  },
  {
    "id": "ITL-103",
    "title": {
      "tr": "İmza Sirküleri",
      "en": "Signature Circular"
    },
    "type": "heyet",
    "desk": "sicil",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Sirküler, kimin imzalayacağını ilan eder.",
      "en": "The circular announces who will sign."
    },
    "a11y": {
      "tr": "İmza Sirküleri. Sirküler, kimin imzalayacağını ilan eder.",
      "en": "Signature Circular. The circular announces who will sign."
    },
    "chain": {
      "id": "imza-sirkuler",
      "step": 2
    }
  },
  {
    "id": "ITL-104",
    "title": {
      "tr": "Kimlik Sureti",
      "en": "Identity Copy"
    },
    "type": "karsi",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "sicil"
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Suret, iddiayı belgeye çeker.",
      "en": "The copy pulls the claim back to paper."
    },
    "a11y": {
      "tr": "Kimlik Sureti. Suret, iddiayı belgeye çeker.",
      "en": "Identity Copy. The copy pulls the claim back to paper."
    }
  },
  {
    "id": "ITL-105",
    "title": {
      "tr": "Adres Tashihi",
      "en": "Address Correction"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Tashih, yanlış kapıyı kapatır.",
      "en": "Correction closes the wrong door."
    },
    "a11y": {
      "tr": "Adres Tashihi. Tashih, yanlış kapıyı kapatır.",
      "en": "Address Correction. Correction closes the wrong door."
    }
  },
  {
    "id": "ITL-106",
    "title": {
      "tr": "Nüfus Askısı",
      "en": "Registry Hold"
    },
    "type": "artci",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 1,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 2
      },
      {
        "op": "pull",
        "desk": "manset",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Askı, manşetin ismi kullanmasını geciktirir.",
      "en": "A hold delays the headline's use of the name."
    },
    "a11y": {
      "tr": "Nüfus Askısı. Askı, manşetin ismi kullanmasını geciktirir.",
      "en": "Registry Hold. A hold delays the headline's use of the name."
    }
  },
  {
    "id": "ITL-107",
    "title": {
      "tr": "Soyadı Tashihi",
      "en": "Surname Correction"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "discard",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Tashih, eski satırı çizer.",
      "en": "Correction strikes the old line."
    },
    "a11y": {
      "tr": "Soyadı Tashihi. Tashih, eski satırı çizer.",
      "en": "Surname Correction. Correction strikes the old line."
    }
  },
  {
    "id": "ITL-108",
    "title": {
      "tr": "Sicil Numarası",
      "en": "Registry Number"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Numara, isimden daha az unutulur.",
      "en": "A number is forgotten less than a name."
    },
    "a11y": {
      "tr": "Sicil Numarası. Numara, isimden daha az unutulur.",
      "en": "Registry Number. A number is forgotten less than a name."
    }
  },
  {
    "id": "ITL-109",
    "title": {
      "tr": "Emeklilik Föyü",
      "en": "Retirement Dossier"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "sicil",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Emeklilik, kadroyu sessizce boşaltır.",
      "en": "Retirement empties the roster quietly."
    },
    "a11y": {
      "tr": "Emeklilik Föyü. Emeklilik, kadroyu sessizce boşaltır.",
      "en": "Retirement Dossier. Retirement empties the roster quietly."
    }
  },
  {
    "id": "ITL-110",
    "title": {
      "tr": "Vefat Kaydı",
      "en": "Death Entry"
    },
    "type": "muhurluk",
    "desk": "sicil",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "pull",
        "desk": "sicil",
        "n": 2,
        "who": "opp"
      },
      {
        "op": "hukum",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kayıt düşünce isim dosyadan düşer.",
      "en": "Once entered, the name leaves the file."
    },
    "a11y": {
      "tr": "Vefat Kaydı. Kayıt düşünce isim dosyadan düşer.",
      "en": "Death Entry. Once entered, the name leaves the file."
    }
  },
  {
    "id": "ITL-111",
    "title": {
      "tr": "Velayet Notu",
      "en": "Custody Note"
    },
    "type": "artci",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 3,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 2
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Not, ileride konuşacak bir bağ bırakır.",
      "en": "The note leaves a tie that will speak later."
    },
    "a11y": {
      "tr": "Velayet Notu. Not, ileride konuşacak bir bağ bırakır.",
      "en": "Custody Note. The note leaves a tie that will speak later."
    }
  },
  {
    "id": "ITL-112",
    "title": {
      "tr": "Evlilik Beyanı",
      "en": "Marriage Declaration"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Beyan, iki ismi aynı satıra yazar.",
      "en": "The declaration writes two names on one line."
    },
    "a11y": {
      "tr": "Evlilik Beyanı. Beyan, iki ismi aynı satıra yazar.",
      "en": "Marriage Declaration. The declaration writes two names on one line."
    }
  },
  {
    "id": "ITL-113",
    "title": {
      "tr": "Müstafi Kaydı",
      "en": "Resigned Entry"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "mill",
        "n": 2
      },
      {
        "op": "pull",
        "desk": "sicil",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Müstafi, kadrodan sessiz çıkar.",
      "en": "The resigned leave the roster without a sound."
    },
    "a11y": {
      "tr": "Müstafi Kaydı. Müstafi, kadrodan sessiz çıkar.",
      "en": "Resigned Entry. The resigned leave the roster without a sound."
    }
  },
  {
    "id": "ITL-114",
    "title": {
      "tr": "Yemin Sureti",
      "en": "Oath Copy"
    },
    "type": "acik",
    "desk": "sicil",
    "cost": 1,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "sicil",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Suret, yeminin karbonudur.",
      "en": "The copy is the carbon of the oath."
    },
    "a11y": {
      "tr": "Yemin Sureti. Suret, yeminin karbonudur.",
      "en": "Oath Copy. The copy is the carbon of the oath."
    }
  },
  {
    "id": "ITL-115",
    "title": {
      "tr": "Mahsup Fişi",
      "en": "Offset Slip"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "pull",
        "desk": "kasa",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Mahsup, iki kalemi birbirine bağlar.",
      "en": "An offset binds two lines to each other."
    },
    "a11y": {
      "tr": "Mahsup Fişi. Mahsup, iki kalemi birbirine bağlar.",
      "en": "Offset Slip. An offset binds two lines to each other."
    }
  },
  {
    "id": "ITL-116",
    "title": {
      "tr": "Günlük Kasa",
      "en": "Daily Till"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Günlük kasa, gecenin hesabını sabaha bırakmaz.",
      "en": "The daily till does not leave the night's account until morning."
    },
    "a11y": {
      "tr": "Günlük Kasa. Günlük kasa, gecenin hesabını sabaha bırakmaz.",
      "en": "Daily Till. The daily till does not leave the night's account until morning."
    }
  },
  {
    "id": "ITL-117",
    "title": {
      "tr": "Veznedar Notu",
      "en": "Cashier Note"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Not, saymanın görmediğini yazar.",
      "en": "The note writes what the accountant did not see."
    },
    "a11y": {
      "tr": "Veznedar Notu. Not, saymanın görmediğini yazar.",
      "en": "Cashier Note. The note writes what the accountant did not see."
    }
  },
  {
    "id": "ITL-118",
    "title": {
      "tr": "Damga Pulu",
      "en": "Revenue Stamp"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Pul yapışmadan evrak yürümez.",
      "en": "Without the stamp the paper does not walk."
    },
    "a11y": {
      "tr": "Damga Pulu. Pul yapışmadan evrak yürümez.",
      "en": "Revenue Stamp. Without the stamp the paper does not walk."
    }
  },
  {
    "id": "ITL-119",
    "title": {
      "tr": "Avans Mahsubu",
      "en": "Advance Offset"
    },
    "type": "artci",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 2,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "pull",
        "desk": "kasa",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Mahsup gecikince avans borç olur.",
      "en": "When the offset delays, the advance becomes a debt."
    },
    "a11y": {
      "tr": "Avans Mahsubu. Mahsup gecikince avans borç olur.",
      "en": "Advance Offset. When the offset delays, the advance becomes a debt."
    }
  },
  {
    "id": "ITL-120",
    "title": {
      "tr": "Yedek Ödenek",
      "en": "Reserve Appropriation"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Yedek, asıl kalem bitince konuşur.",
      "en": "The reserve speaks when the main line is spent."
    },
    "a11y": {
      "tr": "Yedek Ödenek. Yedek, asıl kalem bitince konuşur.",
      "en": "Reserve Appropriation. The reserve speaks when the main line is spent."
    }
  },
  {
    "id": "ITL-121",
    "title": {
      "tr": "Kesin Hesap",
      "en": "Final Account"
    },
    "type": "muhurluk",
    "desk": "kasa",
    "cost": 3,
    "seal": 2,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 3
      },
      {
        "op": "hukum",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kesin hesap, itirazı kapatır.",
      "en": "The final account closes objection."
    },
    "a11y": {
      "tr": "Kesin Hesap. Kesin hesap, itirazı kapatır.",
      "en": "Final Account. The final account closes objection."
    }
  },
  {
    "id": "ITL-122",
    "title": {
      "tr": "Harcırah Bordrosu",
      "en": "Per Diem Sheet"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Harcırah, kalemi yola çıkarır.",
      "en": "Per diem puts the pen on the road."
    },
    "a11y": {
      "tr": "Harcırah Bordrosu. Harcırah, kalemi yola çıkarır.",
      "en": "Per Diem Sheet. Per diem puts the pen on the road."
    }
  },
  {
    "id": "ITL-123",
    "title": {
      "tr": "Tediye Emri",
      "en": "Payment Order"
    },
    "type": "heyet",
    "desk": "kasa",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Emir, kasayı yürüyüşe geçirir.",
      "en": "The order puts the till in motion."
    },
    "a11y": {
      "tr": "Tediye Emri. Emir, kasayı yürüyüşe geçirir.",
      "en": "Payment Order. The order puts the till in motion."
    },
    "chain": {
      "id": "tediye-emri",
      "step": 3
    }
  },
  {
    "id": "ITL-124",
    "title": {
      "tr": "Tahsilat Makbuzu",
      "en": "Collection Receipt"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Tahsilat, ısının parasını keser.",
      "en": "Collection cuts the cost of heat."
    },
    "a11y": {
      "tr": "Tahsilat Makbuzu. Tahsilat, ısının parasını keser.",
      "en": "Collection Receipt. Collection cuts the cost of heat."
    }
  },
  {
    "id": "ITL-125",
    "title": {
      "tr": "Açık Kalem Notu",
      "en": "Open Line Note"
    },
    "type": "artci",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 1,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Açık kalem, kapanmayı bekler.",
      "en": "An open line waits to close."
    },
    "a11y": {
      "tr": "Açık Kalem Notu. Açık kalem, kapanmayı bekler.",
      "en": "Open Line Note. An open line waits to close."
    }
  },
  {
    "id": "ITL-126",
    "title": {
      "tr": "Döviz Tahsisi",
      "en": "Currency Allocation"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Tahsis, kasayı gerer.",
      "en": "Allocation tightens the till."
    },
    "a11y": {
      "tr": "Döviz Tahsisi. Tahsis, kasayı gerer.",
      "en": "Currency Allocation. Allocation tightens the till."
    }
  },
  {
    "id": "ITL-127",
    "title": {
      "tr": "İhale Cetveli",
      "en": "Tender Roll"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Cetvel, kimlerin el kaldırdığını gösterir.",
      "en": "The roll shows whose hand went up."
    },
    "a11y": {
      "tr": "İhale Cetveli. Cetvel, kimlerin el kaldırdığını gösterir.",
      "en": "Tender Roll. The roll shows whose hand went up."
    }
  },
  {
    "id": "ITL-128",
    "title": {
      "tr": "Sayman İmzasız",
      "en": "Unsigned Accountant"
    },
    "type": "karsi",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "kasa"
      },
      {
        "op": "discard",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İmzasız kâğıt, karşı iddiayı düşürür.",
      "en": "Unsigned paper drops the counter-claim."
    },
    "a11y": {
      "tr": "Sayman İmzasız. İmzasız kâğıt, karşı iddiayı düşürür.",
      "en": "Unsigned Accountant. Unsigned paper drops the counter-claim."
    }
  },
  {
    "id": "ITL-129",
    "title": {
      "tr": "Kasa Farkı",
      "en": "Till Difference"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "kasa",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Fark, rakibin kalemini sallar.",
      "en": "The difference shakes the opponent's line."
    },
    "a11y": {
      "tr": "Kasa Farkı. Fark, rakibin kalemini sallar.",
      "en": "Till Difference. The difference shakes the opponent's line."
    }
  },
  {
    "id": "ITL-130",
    "title": {
      "tr": "İcmal Defteri",
      "en": "Summary Ledger"
    },
    "type": "heyet",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İcmal, beş masanın rakamını tek sayfada toplar.",
      "en": "The summary gathers five desks on one page."
    },
    "a11y": {
      "tr": "İcmal Defteri. İcmal, beş masanın rakamını tek sayfada toplar.",
      "en": "Summary Ledger. The summary gathers five desks on one page."
    },
    "chain": {
      "id": "icmal-defter",
      "step": 3
    }
  },
  {
    "id": "ITL-131",
    "title": {
      "tr": "Ödenek İadesi",
      "en": "Appropriation Return"
    },
    "type": "artci",
    "desk": "kasa",
    "cost": 2,
    "seal": 0,
    "delay": 3,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 2
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İade, harcanmamış kalemi geri getirir.",
      "en": "Return brings the unspent line back."
    },
    "a11y": {
      "tr": "Ödenek İadesi. İade, harcanmamış kalemi geri getirir.",
      "en": "Appropriation Return. Return brings the unspent line back."
    }
  },
  {
    "id": "ITL-132",
    "title": {
      "tr": "Vesait Bordrosu",
      "en": "Vehicle Sheet"
    },
    "type": "acik",
    "desk": "kasa",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      },
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Vesait, gece de sayılır.",
      "en": "Vehicles are counted at night as well."
    },
    "a11y": {
      "tr": "Vesait Bordrosu. Vesait, gece de sayılır.",
      "en": "Vehicle Sheet. Vehicles are counted at night as well."
    }
  },
  {
    "id": "ITL-133",
    "title": {
      "tr": "Gazete Kupürü",
      "en": "Press Cutting"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Kupür, dünün cümlesini bugüne taşır.",
      "en": "A cutting carries yesterday's sentence into today."
    },
    "a11y": {
      "tr": "Gazete Kupürü. Kupür, dünün cümlesini bugüne taşır.",
      "en": "Press Cutting. A cutting carries yesterday's sentence into today."
    }
  },
  {
    "id": "ITL-134",
    "title": {
      "tr": "Manşet Değişikliği",
      "en": "Headline Change"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Değişiklik, rakibin cümlesini senin yapar.",
      "en": "A change makes the opponent's sentence yours."
    },
    "a11y": {
      "tr": "Manşet Değişikliği. Değişiklik, rakibin cümlesini senin yapar.",
      "en": "Headline Change. A change makes the opponent's sentence yours."
    }
  },
  {
    "id": "ITL-135",
    "title": {
      "tr": "Rotatif Notu",
      "en": "Rotary Note"
    },
    "type": "artci",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 2
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Makine ısınınca sayı erken çıkar.",
      "en": "When the machine heats, the issue comes early."
    },
    "a11y": {
      "tr": "Rotatif Notu. Makine ısınınca sayı erken çıkar.",
      "en": "Rotary Note. When the machine heats, the issue comes early."
    }
  },
  {
    "id": "ITL-136",
    "title": {
      "tr": "Kurul Notu",
      "en": "Board Note"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kurul notu, manşeti resmi dile çevirir.",
      "en": "A board note turns the headline into official speech."
    },
    "a11y": {
      "tr": "Kurul Notu. Kurul notu, manşeti resmi dile çevirir.",
      "en": "Board Note. A board note turns the headline into official speech."
    }
  },
  {
    "id": "ITL-137",
    "title": {
      "tr": "Okur Mektubu",
      "en": "Reader Letter"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Mektup, ajansın duymadığını basar.",
      "en": "The letter prints what the agency did not hear."
    },
    "a11y": {
      "tr": "Okur Mektubu. Mektup, ajansın duymadığını basar.",
      "en": "Reader Letter. The letter prints what the agency did not hear."
    }
  },
  {
    "id": "ITL-138",
    "title": {
      "tr": "İlan Tarifesi",
      "en": "Notice Tariff"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Tarife, ilanı pahalı kılar.",
      "en": "The tariff makes the notice expensive."
    },
    "a11y": {
      "tr": "İlan Tarifesi. Tarife, ilanı pahalı kılar.",
      "en": "Notice Tariff. The tariff makes the notice expensive."
    }
  },
  {
    "id": "ITL-139",
    "title": {
      "tr": "Kapak Provası",
      "en": "Cover Proof"
    },
    "type": "muhurluk",
    "desk": "manset",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 3
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kapak, sayıdan önce hükmü ilan eder.",
      "en": "The cover announces the ruling before the issue."
    },
    "a11y": {
      "tr": "Kapak Provası. Kapak, sayıdan önce hükmü ilan eder.",
      "en": "Cover Proof. The cover announces the ruling before the issue."
    }
  },
  {
    "id": "ITL-140",
    "title": {
      "tr": "Gece Baskısı",
      "en": "Night Edition"
    },
    "type": "heyet",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Gece baskısı, nöbetle manşeti birleştirir.",
      "en": "The night edition joins watch and headline."
    },
    "a11y": {
      "tr": "Gece Baskısı. Gece baskısı, nöbetle manşeti birleştirir.",
      "en": "Night Edition. The night edition joins watch and headline."
    }
  },
  {
    "id": "ITL-141",
    "title": {
      "tr": "Ajans Düzeltisi",
      "en": "Agency Correction"
    },
    "type": "karsi",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "manset"
      },
      {
        "op": "pull",
        "desk": "manset",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Düzeltı, yanlış cümleyi yolda yakalar.",
      "en": "The correction catches the wrong sentence on the road."
    },
    "a11y": {
      "tr": "Ajans Düzeltisi. Düzeltı, yanlış cümleyi yolda yakalar.",
      "en": "Agency Correction. The correction catches the wrong sentence on the road."
    }
  },
  {
    "id": "ITL-142",
    "title": {
      "tr": "Başlık Puntosu",
      "en": "Headline Point Size"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Punto büyüyünce cümle ağırlaşır.",
      "en": "When the point size grows, the sentence grows heavy."
    },
    "a11y": {
      "tr": "Başlık Puntosu. Punto büyüyünce cümle ağırlaşır.",
      "en": "Headline Point Size. When the point size grows, the sentence grows heavy."
    }
  },
  {
    "id": "ITL-143",
    "title": {
      "tr": "Resmi Yalanlama",
      "en": "Official Denial"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "manset",
        "n": 2,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Yalanlama, rakip manşeti boşaltır.",
      "en": "A denial empties the opposing headline."
    },
    "a11y": {
      "tr": "Resmi Yalanlama. Yalanlama, rakip manşeti boşaltır.",
      "en": "Official Denial. A denial empties the opposing headline."
    }
  },
  {
    "id": "ITL-144",
    "title": {
      "tr": "Dağıtılmayan Sayı",
      "en": "Unissued Copy"
    },
    "type": "artci",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 1,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "manset",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Dağıtılmayan sayı, okunmamış hükümdür.",
      "en": "An unissued copy is an unread ruling."
    },
    "a11y": {
      "tr": "Dağıtılmayan Sayı. Dağıtılmayan sayı, okunmamış hükümdür.",
      "en": "Unissued Copy. An unissued copy is an unread ruling."
    }
  },
  {
    "id": "ITL-145",
    "title": {
      "tr": "Manşet Kavgası",
      "en": "Headline Dispute"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 2
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Kavga, ısınmayı kabul ederek yürür.",
      "en": "The dispute walks by accepting the heat."
    },
    "a11y": {
      "tr": "Manşet Kavgası. Kavga, ısınmayı kabul ederek yürür.",
      "en": "Headline Dispute. The dispute walks by accepting the heat."
    }
  },
  {
    "id": "ITL-146",
    "title": {
      "tr": "Matbaa Mürekkebi",
      "en": "Press Ink"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "ink",
        "n": 2
      },
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Mürekkep bitince sayı susar.",
      "en": "When the ink runs out, the issue falls silent."
    },
    "a11y": {
      "tr": "Matbaa Mürekkebi. Mürekkep bitince sayı susar.",
      "en": "Press Ink. When the ink runs out, the issue falls silent."
    }
  },
  {
    "id": "ITL-147",
    "title": {
      "tr": "İkinci Baskı",
      "en": "Second Edition"
    },
    "type": "artci",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 2,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 2
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İkinci baskı, birinciyi düzeltir.",
      "en": "The second edition corrects the first."
    },
    "a11y": {
      "tr": "İkinci Baskı. İkinci baskı, birinciyi düzeltir.",
      "en": "Second Edition. The second edition corrects the first."
    },
    "chain": {
      "id": "ikinci-baski",
      "step": 3
    }
  },
  {
    "id": "ITL-148",
    "title": {
      "tr": "Kupür Arşivi",
      "en": "Cutting Archive"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "peek"
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Arşiv, eski manşeti yeni dosyaya bağlar.",
      "en": "The archive binds an old headline to a new file."
    },
    "a11y": {
      "tr": "Kupür Arşivi. Arşiv, eski manşeti yeni dosyaya bağlar.",
      "en": "Cutting Archive. The archive binds an old headline to a new file."
    }
  },
  {
    "id": "ITL-149",
    "title": {
      "tr": "İlan Metni",
      "en": "Notice Text"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Metin kısa, etkisi uzun olur.",
      "en": "The text is short; its effect is long."
    },
    "a11y": {
      "tr": "İlan Metni. Metin kısa, etkisi uzun olur.",
      "en": "Notice Text. The text is short; its effect is long."
    }
  },
  {
    "id": "ITL-150",
    "title": {
      "tr": "Dizgi Taslağı",
      "en": "Typesetting Draft"
    },
    "type": "acik",
    "desk": "manset",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "manset",
        "n": 1
      },
      {
        "op": "discard",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Taslak, fazla kelimeyi düşürür.",
      "en": "The draft drops the extra words."
    },
    "a11y": {
      "tr": "Dizgi Taslağı. Taslak, fazla kelimeyi düşürür.",
      "en": "Typesetting Draft. The draft drops the extra words."
    }
  },
  {
    "id": "ITL-151",
    "title": {
      "tr": "Havluya Asılan",
      "en": "Hung on the Towel"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Havluya asılan dosya unutulmuş sayılmaz.",
      "en": "A file hung on the towel is not treated as forgotten."
    },
    "a11y": {
      "tr": "Havluya Asılan. Havluya asılan dosya unutulmuş sayılmaz.",
      "en": "Hung on the Towel. A file hung on the towel is not treated as forgotten."
    }
  },
  {
    "id": "ITL-152",
    "title": {
      "tr": "Ziyaretçi Defteri",
      "en": "Visitor Ledger"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Defter, kimlerin geçtiğini yazar.",
      "en": "The ledger writes who passed."
    },
    "a11y": {
      "tr": "Ziyaretçi Defteri. Defter, kimlerin geçtiğini yazar.",
      "en": "Visitor Ledger. The ledger writes who passed."
    }
  },
  {
    "id": "ITL-153",
    "title": {
      "tr": "Randevu Cetveli",
      "en": "Appointment Roll"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Cetvel, sırayı resmi kılar.",
      "en": "The roll makes the order official."
    },
    "a11y": {
      "tr": "Randevu Cetveli. Cetvel, sırayı resmi kılar.",
      "en": "Appointment Roll. The roll makes the order official."
    }
  },
  {
    "id": "ITL-154",
    "title": {
      "tr": "Koridor Fısıltısı",
      "en": "Corridor Whisper"
    },
    "type": "artci",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 2
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Fısıltı, sabah tutanağa döner.",
      "en": "The whisper turns into a minute at dawn."
    },
    "a11y": {
      "tr": "Koridor Fısıltısı. Fısıltı, sabah tutanağa döner.",
      "en": "Corridor Whisper. The whisper turns into a minute at dawn."
    }
  },
  {
    "id": "ITL-155",
    "title": {
      "tr": "İkinci Kat Çayı",
      "en": "Second-Floor Tea"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Çay molası, imzayı gevşetir.",
      "en": "The tea break loosens the signature."
    },
    "a11y": {
      "tr": "İkinci Kat Çayı. Çay molası, imzayı gevşetir.",
      "en": "Second-Floor Tea. The tea break loosens the signature."
    }
  },
  {
    "id": "ITL-156",
    "title": {
      "tr": "Antekağıt",
      "en": "Scratch Sheet"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "peek"
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Antekağıt, henüz resmi olmayan cümledir.",
      "en": "A scratch sheet is a sentence not yet official."
    },
    "a11y": {
      "tr": "Antekağıt. Antekağıt, henüz resmi olmayan cümledir.",
      "en": "Scratch Sheet. A scratch sheet is a sentence not yet official."
    }
  },
  {
    "id": "ITL-157",
    "title": {
      "tr": "Kapı Çalındı",
      "en": "Door Knocked"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kapı çalınca sıra bozulur.",
      "en": "When the door is knocked, the order breaks."
    },
    "a11y": {
      "tr": "Kapı Çalındı. Kapı çalınca sıra bozulur.",
      "en": "Door Knocked. When the door is knocked, the order breaks."
    }
  },
  {
    "id": "ITL-158",
    "title": {
      "tr": "Danışma Notu",
      "en": "Enquiry Note"
    },
    "type": "karsi",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "koridor"
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Danışma, acele dosyayı yavaşlatır.",
      "en": "Enquiry slows a hurried file."
    },
    "a11y": {
      "tr": "Danışma Notu. Danışma, acele dosyayı yavaşlatır.",
      "en": "Enquiry Note. Enquiry slows a hurried file."
    }
  },
  {
    "id": "ITL-159",
    "title": {
      "tr": "Kalem Arkadaşı",
      "en": "Fellow Clerk"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Arkadaş, parafı hızlandırır.",
      "en": "A fellow clerk speeds the initials."
    },
    "a11y": {
      "tr": "Kalem Arkadaşı. Arkadaş, parafı hızlandırır.",
      "en": "Fellow Clerk. A fellow clerk speeds the initials."
    }
  },
  {
    "id": "ITL-160",
    "title": {
      "tr": "Şerh Düşüldü",
      "en": "Annotation Entered"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "pull",
        "desk": "koridor",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Şerh, karşı cümleyi keser.",
      "en": "The annotation cuts the opposing sentence."
    },
    "a11y": {
      "tr": "Şerh Düşüldü. Şerh, karşı cümleyi keser.",
      "en": "Annotation Entered. The annotation cuts the opposing sentence."
    }
  },
  {
    "id": "ITL-161",
    "title": {
      "tr": "Ek-1",
      "en": "Annex 1"
    },
    "type": "heyet",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Ek, asıl yazıyı başka masaya taşır.",
      "en": "The annex carries the main paper to another desk."
    },
    "a11y": {
      "tr": "Ek-1. Ek, asıl yazıyı başka masaya taşır.",
      "en": "Annex 1. The annex carries the main paper to another desk."
    }
  },
  {
    "id": "ITL-162",
    "title": {
      "tr": "Dağıtım Yerine",
      "en": "In Lieu of Circulation"
    },
    "type": "artci",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 1,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Yerine yazılan, asıl dağıtımı bekletir.",
      "en": "What is written in lieu holds the real circulation."
    },
    "a11y": {
      "tr": "Dağıtım Yerine. Yerine yazılan, asıl dağıtımı bekletir.",
      "en": "In Lieu of Circulation. What is written in lieu holds the real circulation."
    }
  },
  {
    "id": "ITL-163",
    "title": {
      "tr": "Dosya Takibi",
      "en": "File Tracking"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "peek"
      },
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Takip, kaybolan evrakı masaya döndürür.",
      "en": "Tracking returns a lost paper to the desk."
    },
    "a11y": {
      "tr": "Dosya Takibi. Takip, kaybolan evrakı masaya döndürür.",
      "en": "File Tracking. Tracking returns a lost paper to the desk."
    }
  },
  {
    "id": "ITL-164",
    "title": {
      "tr": "Bekleyen Paraf",
      "en": "Pending Initials"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Bekleyen paraf, koridoru doldurur.",
      "en": "Pending initials fill the corridor."
    },
    "a11y": {
      "tr": "Bekleyen Paraf. Bekleyen paraf, koridoru doldurur.",
      "en": "Pending Initials. Pending initials fill the corridor."
    }
  },
  {
    "id": "ITL-165",
    "title": {
      "tr": "Koridor Nöbeti",
      "en": "Corridor Watch"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Koridor da bir nöbettir.",
      "en": "The corridor is also a watch."
    },
    "a11y": {
      "tr": "Koridor Nöbeti. Koridor da bir nöbettir.",
      "en": "Corridor Watch. The corridor is also a watch."
    }
  },
  {
    "id": "ITL-166",
    "title": {
      "tr": "Müdür Yardımcısı Notu",
      "en": "Deputy Note"
    },
    "type": "muhurluk",
    "desk": "koridor",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 2
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Not, imzayı vekâleten taşır.",
      "en": "The note carries the signature by deputy."
    },
    "a11y": {
      "tr": "Müdür Yardımcısı Notu. Not, imzayı vekâleten taşır.",
      "en": "Deputy Note. The note carries the signature by deputy."
    }
  },
  {
    "id": "ITL-167",
    "title": {
      "tr": "Havale Sureti",
      "en": "Referral Copy"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Suret, asıl havaleyi soğutur.",
      "en": "The copy cools the original referral."
    },
    "a11y": {
      "tr": "Havale Sureti. Suret, asıl havaleyi soğutur.",
      "en": "Referral Copy. The copy cools the original referral."
    }
  },
  {
    "id": "ITL-168",
    "title": {
      "tr": "Sıra Numarası",
      "en": "Queue Number"
    },
    "type": "acik",
    "desk": "koridor",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Numara, kapı önünü düzene sokar.",
      "en": "The number puts the doorway in order."
    },
    "a11y": {
      "tr": "Sıra Numarası. Numara, kapı önünü düzene sokar.",
      "en": "Queue Number. The number puts the doorway in order."
    }
  },
  {
    "id": "ITL-169",
    "title": {
      "tr": "Arşiv Kapısı",
      "en": "Archive Door"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Kapı açılınca eski dosya uyanır.",
      "en": "When the door opens, an old file wakes."
    },
    "a11y": {
      "tr": "Arşiv Kapısı. Kapı açılınca eski dosya uyanır.",
      "en": "Archive Door. When the door opens, an old file wakes."
    }
  },
  {
    "id": "ITL-170",
    "title": {
      "tr": "Mesai Dışı Giriş",
      "en": "After-Hours Entry"
    },
    "type": "artci",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 2,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 2
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Mesai dışı giriş ısınmayı kabul eder.",
      "en": "After-hours entry accepts the heat."
    },
    "a11y": {
      "tr": "Mesai Dışı Giriş. Mesai dışı giriş ısınmayı kabul eder.",
      "en": "After-Hours Entry. After-hours entry accepts the heat."
    }
  },
  {
    "id": "ITL-171",
    "title": {
      "tr": "Nöbet Listesi",
      "en": "Watch Roster"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Liste, kimin uyanık kalacağını yazar.",
      "en": "The roster writes who stays awake."
    },
    "a11y": {
      "tr": "Nöbet Listesi. Liste, kimin uyanık kalacağını yazar.",
      "en": "Watch Roster. The roster writes who stays awake."
    }
  },
  {
    "id": "ITL-172",
    "title": {
      "tr": "Gece Evrakı",
      "en": "Night Papers"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "push",
        "desk": "koridor",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Gece evrakı sabah koridora çıkar.",
      "en": "Night papers enter the corridor at dawn."
    },
    "a11y": {
      "tr": "Gece Evrakı. Gece evrakı sabah koridora çıkar.",
      "en": "Night Papers. Night papers enter the corridor at dawn."
    }
  },
  {
    "id": "ITL-173",
    "title": {
      "tr": "İzinsiz Işık",
      "en": "Unauthorised Light"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Işık, bakılmaması gereken yeri gösterir.",
      "en": "Light shows the place that should not be looked at."
    },
    "a11y": {
      "tr": "İzinsiz Işık. Işık, bakılmaması gereken yeri gösterir.",
      "en": "Unauthorised Light. Light shows the place that should not be looked at."
    }
  },
  {
    "id": "ITL-174",
    "title": {
      "tr": "Nöbetçi Kalem",
      "en": "Watch Clerk"
    },
    "type": "heyet",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Nöbetçi kalem, beş masayı tek başına tutar.",
      "en": "The watch clerk holds five desks alone."
    },
    "a11y": {
      "tr": "Nöbetçi Kalem. Nöbetçi kalem, beş masayı tek başına tutar.",
      "en": "Watch Clerk. The watch clerk holds five desks alone."
    }
  },
  {
    "id": "ITL-175",
    "title": {
      "tr": "Sabaha Kalan",
      "en": "Left Until Dawn"
    },
    "type": "artci",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 1,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Sabaha kalan dosya uykusuzdur.",
      "en": "A file left until dawn does not sleep."
    },
    "a11y": {
      "tr": "Sabaha Kalan. Sabaha kalan dosya uykusuzdur.",
      "en": "Left Until Dawn. A file left until dawn does not sleep."
    }
  },
  {
    "id": "ITL-176",
    "title": {
      "tr": "Devredilen Mühür",
      "en": "Handed Seal"
    },
    "type": "muhurluk",
    "desk": "nobet",
    "cost": 2,
    "seal": 2,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "seal",
        "n": 2
      },
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Devredilen mühür, geceyi resmi kılar.",
      "en": "A handed seal makes the night official."
    },
    "a11y": {
      "tr": "Devredilen Mühür. Devredilen mühür, geceyi resmi kılar.",
      "en": "Handed Seal. A handed seal makes the night official."
    }
  },
  {
    "id": "ITL-177",
    "title": {
      "tr": "Nöbet Raporu",
      "en": "Watch Report"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 2
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Rapor, ısının düştüğünü kaydeder.",
      "en": "The report records that heat fell."
    },
    "a11y": {
      "tr": "Nöbet Raporu. Rapor, ısının düştüğünü kaydeder.",
      "en": "Watch Report. The report records that heat fell."
    }
  },
  {
    "id": "ITL-178",
    "title": {
      "tr": "Kapalı Kasa",
      "en": "Closed Till"
    },
    "type": "karsi",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "kasa"
      },
      {
        "op": "protect",
        "desk": "nobet"
      }
    ],
    "flavor": {
      "tr": "Kapalı kasa, gece dokunulmaz.",
      "en": "A closed till is not touched at night."
    },
    "a11y": {
      "tr": "Kapalı Kasa. Kapalı kasa, gece dokunulmaz.",
      "en": "Closed Till. A closed till is not touched at night."
    }
  },
  {
    "id": "ITL-179",
    "title": {
      "tr": "Gece Çağrısı",
      "en": "Night Call"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Çağrı, nöbeti başka odaya alır.",
      "en": "The call takes the watch to another room."
    },
    "a11y": {
      "tr": "Gece Çağrısı. Çağrı, nöbeti başka odaya alır.",
      "en": "Night Call. The call takes the watch to another room."
    }
  },
  {
    "id": "ITL-180",
    "title": {
      "tr": "Nöbet Defteri Eksik",
      "en": "Incomplete Watch Ledger"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "nobet",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Eksik sayfa, rakip nöbeti zayıflatır.",
      "en": "A missing page weakens the opposing watch."
    },
    "a11y": {
      "tr": "Nöbet Defteri Eksik. Eksik sayfa, rakip nöbeti zayıflatır.",
      "en": "Incomplete Watch Ledger. A missing page weakens the opposing watch."
    }
  },
  {
    "id": "ITL-181",
    "title": {
      "tr": "Tutanak Sureti",
      "en": "Minute Copy"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Suret, tutanağı çoğaltır.",
      "en": "The copy multiplies the minute."
    },
    "a11y": {
      "tr": "Tutanak Sureti. Suret, tutanağı çoğaltır.",
      "en": "Minute Copy. The copy multiplies the minute."
    }
  },
  {
    "id": "ITL-182",
    "title": {
      "tr": "Sabah Sayımı",
      "en": "Dawn Count"
    },
    "type": "heyet",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "push",
        "desk": "kasa",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Sayım, gece ile kasayı karşılaştırır.",
      "en": "The count compares the night with the till."
    },
    "a11y": {
      "tr": "Sabah Sayımı. Sayım, gece ile kasayı karşılaştırır.",
      "en": "Dawn Count. The count compares the night with the till."
    }
  },
  {
    "id": "ITL-183",
    "title": {
      "tr": "Nöbet İmzası",
      "en": "Watch Signature"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "İmza, nöbeti kapatır.",
      "en": "The signature closes the watch."
    },
    "a11y": {
      "tr": "Nöbet İmzası. İmza, nöbeti kapatır.",
      "en": "Watch Signature. The signature closes the watch."
    }
  },
  {
    "id": "ITL-184",
    "title": {
      "tr": "Bekçi Çayı",
      "en": "Keeper's Tea"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "Çay, ısınmayı düşürür; nöbeti tutar.",
      "en": "Tea lowers the heat and holds the watch."
    },
    "a11y": {
      "tr": "Bekçi Çayı. Çay, ısınmayı düşürür; nöbeti tutar.",
      "en": "Keeper's Tea. Tea lowers the heat and holds the watch."
    }
  },
  {
    "id": "ITL-185",
    "title": {
      "tr": "Devriye Çizelgesi",
      "en": "Round Chart"
    },
    "type": "artci",
    "desk": "nobet",
    "cost": 2,
    "seal": 0,
    "delay": 3,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "nobet",
        "n": 2
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Çizelge, üç tur sonra konuşur.",
      "en": "The chart speaks after three rounds."
    },
    "a11y": {
      "tr": "Devriye Çizelgesi. Çizelge, üç tur sonra konuşur.",
      "en": "Round Chart. The chart speaks after three rounds."
    },
    "chain": {
      "id": "gece-devri",
      "step": 3
    }
  },
  {
    "id": "ITL-186",
    "title": {
      "tr": "Anahtar Askısı",
      "en": "Key Hook"
    },
    "type": "acik",
    "desk": "nobet",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "nobet"
      },
      {
        "op": "push",
        "desk": "nobet",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Askıdaki anahtar, kapıyı kimsenin sanmasına izin vermez.",
      "en": "A key on the hook lets no one assume the door."
    },
    "a11y": {
      "tr": "Anahtar Askısı. Askıdaki anahtar, kapıyı kimsenin sanmasına izin vermez.",
      "en": "Key Hook. A key on the hook lets no one assume the door."
    }
  },
  {
    "id": "ITL-187",
    "title": {
      "tr": "Usul İtirazı",
      "en": "Procedural Objection"
    },
    "type": "karsi",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "pull",
        "desk": "any",
        "n": 1,
        "who": "opp"
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Usul, esastan önce konuşur.",
      "en": "Procedure speaks before the substance."
    },
    "a11y": {
      "tr": "Usul İtirazı. Usul, esastan önce konuşur.",
      "en": "Procedural Objection. Procedure speaks before the substance."
    }
  },
  {
    "id": "ITL-188",
    "title": {
      "tr": "Esas Hakkında",
      "en": "On the Merits"
    },
    "type": "acik",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Esas, usul bittikten sonra yürür.",
      "en": "The merits walk after procedure is done."
    },
    "a11y": {
      "tr": "Esas Hakkında. Esas, usul bittikten sonra yürür.",
      "en": "On the Merits. The merits walk after procedure is done."
    }
  },
  {
    "id": "ITL-189",
    "title": {
      "tr": "Ara Müzekkere",
      "en": "Interim Memorandum"
    },
    "type": "artci",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 2,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Müzekkere, kararı bekletir.",
      "en": "The memorandum holds the ruling."
    },
    "a11y": {
      "tr": "Ara Müzekkere. Müzekkere, kararı bekletir.",
      "en": "Interim Memorandum. The memorandum holds the ruling."
    }
  },
  {
    "id": "ITL-190",
    "title": {
      "tr": "Kurul Mührü",
      "en": "Board Seal"
    },
    "type": "muhurluk",
    "desk": "any",
    "cost": 3,
    "seal": 3,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": true,
    "effect": [
      {
        "op": "hukum",
        "n": 1
      },
      {
        "op": "seal",
        "n": 2
      },
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Kurul mührü, hükmü ağırlaştırır.",
      "en": "The board seal weights the ruling."
    },
    "a11y": {
      "tr": "Kurul Mührü. Kurul mührü, hükmü ağırlaştırır.",
      "en": "Board Seal. The board seal weights the ruling."
    }
  },
  {
    "id": "ITL-191",
    "title": {
      "tr": "Yetki Devri",
      "en": "Delegation"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "steal",
        "desk": "any",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Devir, imzayı başka masaya taşır.",
      "en": "Delegation carries the signature to another desk."
    },
    "a11y": {
      "tr": "Yetki Devri. Devir, imzayı başka masaya taşır.",
      "en": "Delegation. Delegation carries the signature to another desk."
    }
  },
  {
    "id": "ITL-192",
    "title": {
      "tr": "Yeniden Görüşme",
      "en": "Rehearing Note"
    },
    "type": "acik",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "unlock",
        "desk": "any"
      },
      {
        "op": "heat",
        "n": 2
      }
    ],
    "flavor": {
      "tr": "Yeniden görüşme, kilitli dosyayı açar.",
      "en": "A rehearing opens a locked file."
    },
    "a11y": {
      "tr": "Yeniden Görüşme. Yeniden görüşme, kilitli dosyayı açar.",
      "en": "Rehearing Note. A rehearing opens a locked file."
    }
  },
  {
    "id": "ITL-193",
    "title": {
      "tr": "Üye Listesi",
      "en": "Member List"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "draw",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Liste, heyetin kimlerden kurulduğunu yazar.",
      "en": "The list writes who the board is made of."
    },
    "a11y": {
      "tr": "Üye Listesi. Liste, heyetin kimlerden kurulduğunu yazar.",
      "en": "Member List. The list writes who the board is made of."
    }
  },
  {
    "id": "ITL-194",
    "title": {
      "tr": "Yedek Üye",
      "en": "Alternate Member"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "ink",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Yedek, asıl üye susunca konuşur.",
      "en": "The alternate speaks when the sitting member is silent."
    },
    "a11y": {
      "tr": "Yedek Üye. Yedek, asıl üye susunca konuşur.",
      "en": "Alternate Member. The alternate speaks when the sitting member is silent."
    }
  },
  {
    "id": "ITL-195",
    "title": {
      "tr": "Tutanak Eksik",
      "en": "Incomplete Minute"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "mill",
        "n": 1
      },
      {
        "op": "pull",
        "desk": "any",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Eksik tutanak, rakip hükmü zayıflatır.",
      "en": "An incomplete minute weakens the opposing ruling."
    },
    "a11y": {
      "tr": "Tutanak Eksik. Eksik tutanak, rakip hükmü zayıflatır.",
      "en": "Incomplete Minute. An incomplete minute weakens the opposing ruling."
    }
  },
  {
    "id": "ITL-196",
    "title": {
      "tr": "Kapalı Oturum Notu",
      "en": "Closed Session Note"
    },
    "type": "artci",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 1,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "peek"
      }
    ],
    "flavor": {
      "tr": "Kapalı oturum, koridoru dışarıda bırakır.",
      "en": "A closed session leaves the corridor outside."
    },
    "a11y": {
      "tr": "Kapalı Oturum Notu. Kapalı oturum, koridoru dışarıda bırakır.",
      "en": "Closed Session Note. A closed session leaves the corridor outside."
    }
  },
  {
    "id": "ITL-197",
    "title": {
      "tr": "Karar Özeti",
      "en": "Ruling Digest"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "hukum",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Özet, uzun zabtı hükme çevirir.",
      "en": "The digest turns a long minute into a ruling."
    },
    "a11y": {
      "tr": "Karar Özeti. Özet, uzun zabtı hükme çevirir.",
      "en": "Ruling Digest. The digest turns a long minute into a ruling."
    },
    "chain": {
      "id": "karar-ozet",
      "step": 3
    }
  },
  {
    "id": "ITL-198",
    "title": {
      "tr": "İstişare Notu",
      "en": "Consultation Note"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "peek"
      },
      {
        "op": "heat",
        "n": -1
      }
    ],
    "flavor": {
      "tr": "İstişare, ısınmadan önce konuşur.",
      "en": "Consultation speaks before the heat."
    },
    "a11y": {
      "tr": "İstişare Notu. İstişare, ısınmadan önce konuşur.",
      "en": "Consultation Note. Consultation speaks before the heat."
    }
  },
  {
    "id": "ITL-199",
    "title": {
      "tr": "Fezleke Taslağı",
      "en": "Summary Draft"
    },
    "type": "acik",
    "desk": "any",
    "cost": 2,
    "seal": 1,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "seal",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Fezleke, dağınık evrakı tek cümlede toplar.",
      "en": "The summary gathers scattered paper into one sentence."
    },
    "a11y": {
      "tr": "Fezleke Taslağı. Fezleke, dağınık evrakı tek cümlede toplar.",
      "en": "Summary Draft. The summary gathers scattered paper into one sentence."
    }
  },
  {
    "id": "ITL-200",
    "title": {
      "tr": "Toplu Paraf",
      "en": "Collective Initials"
    },
    "type": "heyet",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "koridor",
        "n": 2
      },
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Toplu paraf, koridoru kısaltır.",
      "en": "Collective initials shorten the corridor."
    },
    "a11y": {
      "tr": "Toplu Paraf. Toplu paraf, koridoru kısaltır.",
      "en": "Collective Initials. Collective initials shorten the corridor."
    }
  },
  {
    "id": "ITL-201",
    "title": {
      "tr": "Gündem Maddesi",
      "en": "Agenda Item"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Madde, heyetin ne konuşacağını seçer.",
      "en": "The item chooses what the board will speak."
    },
    "a11y": {
      "tr": "Gündem Maddesi. Madde, heyetin ne konuşacağını seçer.",
      "en": "Agenda Item. The item chooses what the board will speak."
    }
  },
  {
    "id": "ITL-202",
    "title": {
      "tr": "Ek Gündem",
      "en": "Added Agenda"
    },
    "type": "artci",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 3,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 2
      },
      {
        "op": "heat",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Ek madde, üç tur sonra masaya düşer.",
      "en": "The added item falls on the desk after three turns."
    },
    "a11y": {
      "tr": "Ek Gündem. Ek madde, üç tur sonra masaya düşer.",
      "en": "Added Agenda. The added item falls on the desk after three turns."
    }
  },
  {
    "id": "ITL-203",
    "title": {
      "tr": "Müzekkere Sureti",
      "en": "Memorandum Copy"
    },
    "type": "acik",
    "desk": "any",
    "cost": 1,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "push",
        "desk": "any",
        "n": 1
      },
      {
        "op": "mill",
        "n": 1
      }
    ],
    "flavor": {
      "tr": "Suret, asıl müzekkereyi çoğaltır.",
      "en": "The copy multiplies the memorandum."
    },
    "a11y": {
      "tr": "Müzekkere Sureti. Suret, asıl müzekkereyi çoğaltır.",
      "en": "Memorandum Copy. The copy multiplies the memorandum."
    }
  },
  {
    "id": "ITL-204",
    "title": {
      "tr": "Ara Karar Sureti",
      "en": "Interim Copy"
    },
    "type": "karsi",
    "desk": "any",
    "cost": 2,
    "seal": 0,
    "delay": 0,
    "family": null,
    "exclusive": null,
    "once": false,
    "effect": [
      {
        "op": "protect",
        "desk": "any"
      },
      {
        "op": "pull",
        "desk": "any",
        "n": 1,
        "who": "opp"
      }
    ],
    "flavor": {
      "tr": "Suret, karşı hükmü bekletir.",
      "en": "The copy holds the opposing ruling."
    },
    "a11y": {
      "tr": "Ara Karar Sureti. Suret, karşı hükmü bekletir.",
      "en": "Interim Copy. The copy holds the opposing ruling."
    }
  }
];

export const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));
export function cardOf(id) { return CARD_BY_ID[id] || null; }
